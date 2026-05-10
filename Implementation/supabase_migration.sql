-- ============================================================
-- Luxury28 E-commerce: Full Database Migration
-- Project: iobwiajnzymniuxvxvdo
-- Run this script in the Supabase SQL Editor (Dashboard > SQL Editor > New Query)
-- ============================================================

-- ============================================================
-- STEP 1: ENUMS
-- ============================================================

CREATE TYPE public.user_role AS ENUM ('admin', 'staff', 'customer');

CREATE TYPE public.order_status AS ENUM (
  'Pending',
  'Paid',
  'Processing',
  'Packaging',
  'Shipped',
  'Delivered',
  'Refunded',
  'Cancelled'
);

CREATE TYPE public.product_status AS ENUM ('active', 'inactive', 'archived');

CREATE TYPE public.authenticity_status AS ENUM ('verified', 'pending', 'rejected');

-- ============================================================
-- STEP 2: CORE TABLES
-- ============================================================

-- Users (extends Supabase auth.users)
CREATE TABLE public.users (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role        public.user_role NOT NULL DEFAULT 'customer',
  first_name  TEXT,
  last_name   TEXT,
  phone       TEXT,
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Categories
CREATE TABLE public.categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Products
CREATE TABLE public.products (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id    UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  name           TEXT NOT NULL,
  description    TEXT,
  price          NUMERIC(12, 2) NOT NULL,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  status         public.product_status NOT NULL DEFAULT 'active',
  weight         INTEGER, -- in grams
  dimensions     JSONB,   -- { "length": 0, "width": 0, "height": 0 }
  images         TEXT[],  -- array of storage URLs
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Authenticity Records
CREATE TABLE public.authenticity_records (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id    UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  serial_number TEXT NOT NULL UNIQUE,
  status        public.authenticity_status NOT NULL DEFAULT 'pending',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Shipping Addresses
CREATE TABLE public.shipping_addresses (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  label            TEXT NOT NULL DEFAULT 'Home', -- e.g. Home, Office
  recipient_name   TEXT NOT NULL,
  phone            TEXT NOT NULL,
  street_address   TEXT NOT NULL,
  city             TEXT NOT NULL,
  province         TEXT NOT NULL,
  postal_code      TEXT NOT NULL,
  is_default       BOOLEAN NOT NULL DEFAULT FALSE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Orders
CREATE TABLE public.orders (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id         UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  shipping_address_id UUID REFERENCES public.shipping_addresses(id) ON DELETE SET NULL,
  status              public.order_status NOT NULL DEFAULT 'Pending',
  total_amount        NUMERIC(12, 2) NOT NULL,
  shipping_cost       NUMERIC(12, 2) NOT NULL DEFAULT 0,
  tracking_number     TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Order Items
CREATE TABLE public.order_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id  UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  quantity    INTEGER NOT NULL DEFAULT 1,
  unit_price  NUMERIC(12, 2) NOT NULL, -- price snapshot at time of purchase
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Order Notes (internal staff/admin use only)
CREATE TABLE public.order_notes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  author_id   UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  note_text   TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Carts (optional - persists cart across sessions for logged-in users)
CREATE TABLE public.carts (
  user_id    UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  items      JSONB NOT NULL DEFAULT '[]',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Audit Logs
CREATE TABLE public.audit_logs (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES public.users(id) ON DELETE SET NULL,
  role         public.user_role,
  action_type  TEXT NOT NULL, -- e.g. 'UPDATE_PRICE', 'ISSUE_REFUND', 'UPDATE_STOCK'
  resource     TEXT NOT NULL, -- e.g. 'products', 'orders'
  resource_id  UUID,
  metadata     JSONB,         -- optional: before/after values
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- STEP 3: DATABASE TRIGGERS
-- ============================================================

-- Trigger 1: Sync auth.users → public.users on new signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, role, first_name, last_name)
  VALUES (
    NEW.id,
    'customer',
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name'
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Trigger 2: Auto-log product price changes to audit_logs
CREATE OR REPLACE FUNCTION public.log_product_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF OLD.price IS DISTINCT FROM NEW.price OR OLD.stock_quantity IS DISTINCT FROM NEW.stock_quantity THEN
    INSERT INTO public.audit_logs (user_id, role, action_type, resource, resource_id, metadata)
    SELECT
      auth.uid(),
      (SELECT role FROM public.users WHERE id = auth.uid()),
      'UPDATE_PRODUCT',
      'products',
      NEW.id,
      jsonb_build_object(
        'old_price', OLD.price,
        'new_price', NEW.price,
        'old_stock', OLD.stock_quantity,
        'new_stock', NEW.stock_quantity
      );
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_product_update
  AFTER UPDATE ON public.products
  FOR EACH ROW EXECUTE PROCEDURE public.log_product_changes();

-- Trigger 3: Auto-log order status changes to audit_logs
CREATE OR REPLACE FUNCTION public.log_order_status_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.audit_logs (user_id, role, action_type, resource, resource_id, metadata)
    SELECT
      auth.uid(),
      (SELECT role FROM public.users WHERE id = auth.uid()),
      'UPDATE_ORDER_STATUS',
      'orders',
      NEW.id,
      jsonb_build_object(
        'old_status', OLD.status,
        'new_status', NEW.status
      );
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_order_status_update
  AFTER UPDATE ON public.orders
  FOR EACH ROW EXECUTE PROCEDURE public.log_order_status_changes();

-- Trigger 4: Auto-update `updated_at` timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER set_updated_at_users
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

CREATE OR REPLACE TRIGGER set_updated_at_products
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

CREATE OR REPLACE TRIGGER set_updated_at_orders
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

-- ============================================================
-- STEP 4: ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.authenticity_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipping_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user's role
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS public.user_role
LANGUAGE sql STABLE
AS $$
  SELECT role FROM public.users WHERE id = auth.uid()
$$;

-- ── USERS TABLE ──
CREATE POLICY "Admin full access on users" ON public.users
  FOR ALL TO authenticated
  USING (public.get_my_role() = 'admin');

CREATE POLICY "Staff can view customer shipping info" ON public.users
  FOR SELECT TO authenticated
  USING (public.get_my_role() = 'staff');

CREATE POLICY "Users can view and update own profile" ON public.users
  FOR ALL TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- ── CATEGORIES TABLE ──
CREATE POLICY "Anyone can view categories" ON public.categories
  FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "Admin can manage categories" ON public.categories
  FOR ALL TO authenticated
  USING (public.get_my_role() = 'admin');

-- ── PRODUCTS TABLE ──
CREATE POLICY "Anyone can view active products" ON public.products
  FOR SELECT USING (status = 'active' OR public.get_my_role() IN ('admin', 'staff'));

CREATE POLICY "Admin full access on products" ON public.products
  FOR ALL TO authenticated
  USING (public.get_my_role() = 'admin');

CREATE POLICY "Staff can update product inventory" ON public.products
  FOR UPDATE TO authenticated
  USING (public.get_my_role() = 'staff')
  WITH CHECK (public.get_my_role() = 'staff');

-- ── AUTHENTICITY RECORDS ──
CREATE POLICY "Admin full access on authenticity_records" ON public.authenticity_records
  FOR ALL TO authenticated
  USING (public.get_my_role() = 'admin');

-- ── SHIPPING ADDRESSES ──
CREATE POLICY "Users can manage their own addresses" ON public.shipping_addresses
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Staff can view shipping addresses" ON public.shipping_addresses
  FOR SELECT TO authenticated
  USING (public.get_my_role() IN ('admin', 'staff'));

-- ── ORDERS ──
CREATE POLICY "Customers can manage their own orders" ON public.orders
  FOR ALL TO authenticated
  USING (customer_id = auth.uid())
  WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Staff can view and update orders" ON public.orders
  FOR SELECT TO authenticated
  USING (public.get_my_role() IN ('admin', 'staff'));

CREATE POLICY "Staff can update order status" ON public.orders
  FOR UPDATE TO authenticated
  USING (public.get_my_role() IN ('admin', 'staff'));

-- ── ORDER ITEMS ──
CREATE POLICY "Customers can view their own order items" ON public.order_items
  FOR SELECT TO authenticated
  USING (order_id IN (SELECT id FROM public.orders WHERE customer_id = auth.uid()));

CREATE POLICY "Admin and staff can view all order items" ON public.order_items
  FOR SELECT TO authenticated
  USING (public.get_my_role() IN ('admin', 'staff'));

CREATE POLICY "Customers can insert order items" ON public.order_items
  FOR INSERT TO authenticated
  WITH CHECK (order_id IN (SELECT id FROM public.orders WHERE customer_id = auth.uid()));

-- ── ORDER NOTES ──
CREATE POLICY "Staff and admin can manage order notes" ON public.order_notes
  FOR ALL TO authenticated
  USING (public.get_my_role() IN ('admin', 'staff'));

-- ── CARTS ──
CREATE POLICY "Users can manage their own cart" ON public.carts
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ── AUDIT LOGS ──
CREATE POLICY "Only admin can view audit logs" ON public.audit_logs
  FOR SELECT TO authenticated
  USING (public.get_my_role() = 'admin');

-- ============================================================
-- STEP 5: SEED DATA - Categories
-- ============================================================

INSERT INTO public.categories (name, slug, description) VALUES
  ('Ultra Mewah', 'ultra-mewah', 'Koleksi jam tangan premium tingkat tertinggi, nilai di atas Rp 500 juta.'),
  ('Tinggi Mewah', 'tinggi-mewah', 'Koleksi jam tangan mewah kelas atas, nilai Rp 100–500 juta.'),
  ('Mewah', 'mewah', 'Koleksi jam tangan mewah premium, nilai Rp 30–100 juta.'),
  ('Mewah Masuk', 'mewah-masuk', 'Koleksi jam tangan mewah entry-level, nilai Rp 5–30 juta.');

-- ============================================================
-- END OF MIGRATION
-- Run this entire script in Supabase SQL Editor.
-- After running, verify tables in: Database > Tables
-- ============================================================
