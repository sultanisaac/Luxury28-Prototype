# Luxury28 E-commerce: Full Backend & Dashboard Implementation Plan

This document outlines the step-by-step implementation plan for integrating a complete Supabase backend and role-based dashboards into the Luxury28 E-commerce webapp.

## 1. Architecture Overview
**Tech Stack:**
- **Backend & Database:** Supabase (PostgreSQL, Auth, Storage, Edge Functions, Realtime)
- **Frontend:** Next.js (App Router) / React
- **Payments:** Xendit *(Indonesia-first: supports QRIS, GoPay, OVO, ShopeePay, DANA, Virtual Account, and major credit/debit cards)*
- **Logistics:** Biteship *(Aggregates 30+ Indonesian couriers: JNE, J&T Express, SiCepat, Anteraja, Paxel, and more)*

> **Note on Stripe:** Stripe is currently in invite-only/preview mode for Indonesian-registered businesses and does not natively support IDR local payment methods (QRIS, VA, e-wallets). **Xendit** is the recommended replacement as it is fully available in Indonesia, supports all major local payment channels, and has a developer-friendly Node.js SDK compatible with Next.js.

---

## 2. Database Schema & RLS Strategy
Before writing frontend code, we must structure our database and secure it using Supabase Row Level Security (RLS) policies.

### 2.1 Core Tables
- **`users` (extends auth.users):** `id`, `role` (admin, staff, customer), `first_name`, `last_name`, `phone`, `avatar_url`.
- **`shipping_addresses`:** `id`, `user_id`, `label` (Home, Office), `recipient_name`, `phone`, `street_address`, `city`, `province`, `postal_code`, `is_default`.
- **`categories`:** `id`, `name`, `slug`, `description`.
- **`products`:** `id`, `category_id`, `name`, `description`, `price`, `stock_quantity`, `status`, `weight` (grams), `dimensions` (JSON: l, w, h), `images` (text array of URLs).
- **`authenticity_records`:** `id`, `product_id`, `serial_number`, `status`.
- **`orders`:** `id`, `customer_id`, `status` (Pending, Paid, Processing, Packaging, Shipped, Delivered, Refunded, Cancelled), `total_amount`, `shipping_address_id`, `shipping_cost`, `courier_name`, `tracking_number`, `xendit_invoice_id`.
- **`order_items`:** `id`, `order_id`, `product_id`, `quantity`, `unit_price` (snapshot at time of purchase).
- **`order_notes`:** `id`, `order_id`, `author_id`, `note_text`, `created_at`.
- **`audit_logs`:** `id`, `user_id`, `role`, `action_type`, `resource`, `created_at`.
- **`carts` (optional):** `user_id`, `items` (JSONB for persistence across sessions).

### 2.2 Row Level Security (RLS) Implementation
We will implement strictly tailored RLS policies matching the Sensitive Data Access Matrix.

*   **Admin:** `true` (bypass RLS or explicit `ALL` policies for `role = 'admin'`).
*   **Staff:** 
    *   `SELECT`, `UPDATE` on `orders`.
    *   `SELECT`, `INSERT`, `UPDATE`, `DELETE` on `products` (Full Catalog Management).
    *   `SELECT` on `users` (shipping details only).
    *   `SELECT`, `INSERT` on `order_notes`.
    *   No access to financial analytics or audit logs.
*   **Customer:** 
    *   `SELECT` on `products` (where status is active).
    *   `SELECT`, `INSERT` on `orders` (where `customer_id = auth.uid()`).
    *   No access to `order_notes` or `audit_logs`.

---

## 3. Step-by-Step Implementation Phases

> - [x] 1. Set up Supabase as needed, creating all tables and roles.
> - [x] 2. Create the signup, login pages with forgot password.
> - [x] 3. Handle user roles and create the admin, staff, and customer users manually on Supabase.
> - [x] 4. Create mockup admin, staff, and customer dashboards to test user signup, login, and roles.
> - [x] 5. Implement persistent session UI (Dashboard/Logout buttons) across all pages.

### Phase 1: Supabase Initialization & Database Setup
- [x] **Create Supabase Project:** Setup project, retrieve API keys and URLs.
- [x] **Environment Variables:** Add keys to `.env.local`.
- [x] **Define Enums & Tables:** Write SQL migrations for roles, order statuses, and core tables (`users`, `products`, `orders`, `order_items`, `shipping_addresses`, etc.).
- [x] **Storage Setup:** Create buckets for `product-images`, `user-avatars`.
- [x] **Implement RLS Policies:** Apply the security matrix directly to PostgreSQL using Supabase RLS.
- [x] **Database Triggers:** 
  - [x] Create a trigger to automatically insert into `audit_logs` on sensitive table mutations.
  - [x] Create a trigger to sync `auth.users` with the public `users` table upon signup.

### Phase 2: Authentication & Frontend Integration
- [x] **Supabase Client Wrapper:** Setup SSR and Client-side Supabase clients using `@supabase/ssr`.
- [x] **Authentication Flow:** Build Signup/Register, Login, and Forgot Password pages.
- [x] **Session Persistence:** Implement logout functionality and authenticated UI states.
- [x] **Role-based Route Protection:** Create Next.js middleware to protect `/admin`, `/staff`, and `/customer` routes and redirect unauthorized access.

### Phase 3: Role Assignment & Verification
- [x] **Manual Role Assignment:** Manually create `admin`, `staff`, and `customer` users in the Supabase dashboard once the tables and roles are created.

### Phase 4: Mockup Dashboards & Profiles (Auth & Role Testing)
- [x] **Admin Dashboard Mockup:** Create a basic `/admin` layout to test access.
  - [x] **Admin Profile Implementation:** See [`ADMIN_PROFILE.md`](./ADMIN_PROFILE.md) for detailed profile features (Avatar upload, Security, Audit Logs).
- [x] **Staff Dashboard Mockup:** Create a basic `/staff` layout to test access.
  - [x] **Staff Profile Implementation:** See [`STAFF_PROFILE.md`](./STAFF_PROFILE.md) for detailed profile features (Fulfillment, Inventory, Support).
- [x] **Customer Dashboard Mockup:** Create a basic `/customer` layout to test access.
  - [x] **Customer Profile Implementation:** See [`CUSTOMER_PROFILE.md`](./CUSTOMER_PROFILE.md) for detailed profile features (Address book, Order tracking, Authenticity Vault, Payment Settings).
- [x] **End-to-End Testing:** Test user signup, login, and roles across dashboards.

### Phase 5: Backend Integrations & Webhooks
- [x] **Payment Webhook (Xendit):** `app/api/webhooks/xendit/route.ts` — Validates `x-callback-token`, processes PAID events idempotently, updates order `Pending → Paid` in Supabase.
- [x] **Shipping Webhook (Biteship):** `app/api/webhooks/biteship/route.ts` — Maps courier tracking events (allocated, in_transit, delivered) to order statuses, writes tracking number to `orders` table.
- [x] **Refund/Void Processing (Xendit):** `lib/xendit.ts` has `refundXenditInvoice()` ready. Admin UI in `/admin/orders` to trigger it is pending.

### Phase 6: Customer Portal — Checkout & Payments
- [x] **Profile Management:** Address book (multiple `shipping_addresses`), personal details, avatar upload.
- [x] **Order Tracking:** Real-time view of customer orders, statuses, and tracking numbers.
- [x] **Payment Settings:** Customer preference selection (QRIS, E-wallet, VA, Card) and saved methods UI.
- [x] **Shipping Rate Calculator (Biteship):** `app/api/shipping/rates/route.ts` — Fetches live rates for JNE, J&T, SiCepat etc. displayed in Checkout Step 2.
- [x] **Checkout Flow (Xendit):** `app/checkout/` — 3-step UI (Address → Courier → Pay). Server Action creates order + Xendit invoice, redirects to hosted payment page. Webhook updates order to `Paid`.
- [x] **Cart & Persistence:** Robust cart system with localStorage + optional Supabase sync. "Add to Cart" on product page is a placeholder pending this.

### Phase 7: Staff Dashboard — Operations & Fulfillment
- [x] **Order Fulfillment Queue:** Real-time Kanban board for orders (Paid → Processing → Packaging → Shipped).
- [x] **Product Catalog Manager:** Real-time full CRUD interface for products and stock levels.
- [x] **Customer Support Inbox:** Real-time inquiry management with global `NotificationIndicator` alerts triggered by the new public `/contact` page.
- [x] **Customer Directory:** Read-only, customer-scoped view with order history modal.
- [x] **Biteship Shipping Integration:** 
  - [x] On "Request Pickup," send order weight/dimensions to Biteship API and receive a Waybill ID (Resi).
  - [x] Auto-populate `tracking_number` and `courier_name` on the order record.
  - [x] Generate and print A6 shipping label from Biteship.
- [x] **Order Notes:** UI to add and view internal operational notes per order.

### Phase 8: Admin Dashboard — Control & Analytics
- [x] **Real-time Analytics Overview:** Live revenue cards, active order tracker, and KPI indicators.
- [x] **User & Role Manager:** Real-time user directory with instant role assignment.
- [x] **Marketing & Promotions:** Live-syncing coupon and campaign manager.
- [x] **Store Settings:** Real-time global configuration panel.
- [x] **Customer Support Hub:** Live inquiry management with notification badges.
- [x] **Audit Log Viewer:** Searchable, real-time audit trail.
- [x] **Financial Reporting:** Revenue charts, sales trends, and AOV using `recharts`.
- [x] **Refund Management:** Admin UI to trigger Xendit refund/void via secure Edge Function.
- [x] **Authenticity Management:** Interface to issue serial numbers and manage `authenticity_records`.

---

## 4. Payment & Logistics Integration Reference

### 4.1 Xendit Payment Flow
1.  **Customer clicks "Bayar Sekarang"** → Next.js Server Action calls Xendit `POST /v2/invoices`.
2.  **Xendit returns** a `invoice_url`. Customer is redirected to Xendit's secure hosted page.
3.  **Customer pays** via QRIS / GoPay / OVO / BCA Virtual Account / Card.
4.  **Xendit sends a webhook** to `/api/webhooks/xendit` with `status: PAID`.
5.  **Server Action updates** `orders.status = 'Paid'` and `orders.xendit_invoice_id` in Supabase.
6.  **Supabase Realtime** pushes the update to the Staff Fulfillment Queue instantly.

### 4.2 Biteship Logistics Flow
1.  **Staff clicks "Request Pickup"** on a `Paid` order in the Fulfillment Queue.
2.  **Server Action calls Biteship** `POST /v1/orders` with package weight, dimensions, and destination address.
3.  **Biteship books the courier** (JNE / J&T / SiCepat) and returns a `waybill_id` (Resi).
4.  **Supabase is updated** with `tracking_number` and `courier_name`.
5.  **Biteship sends webhooks** as the package is scanned at each checkpoint.
6.  **Customer's Order History** updates in real time via Supabase Realtime.

---

## 5. Scalability & Future-Proofing
- **Extensible RBAC:** Using an ENUM for roles (`admin`, `staff`, `customer`) allows easy insertion of new roles (e.g., `warehouse_staff`, `support`) in the future without rewriting core authorization logic.
- **Microservice-ready:** Offloading complex logic (Payments via Xendit, Logistics via Biteship) to Supabase Edge Functions keeps the Next.js frontend lightweight and prevents API key exposure.
- **Audit Trails:** Centralized trigger-based logging ensures that even direct database interventions are captured, maintaining accountability as the business grows.
- **Indonesia-First:** The Xendit + Biteship stack is purpose-built for the Indonesian market, supporting all local payment methods and domestic courier networks natively.
