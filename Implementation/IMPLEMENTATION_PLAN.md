# Luxury28 E-commerce: Full Backend & Dashboard Implementation Plan

This document outlines the step-by-step implementation plan for integrating a complete Supabase backend and role-based dashboards into the Luxury28 E-commerce webapp.

## 1. Architecture Overview
**Tech Stack:**
- **Backend & Database:** Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **Frontend:** Next.js (App Router) / React
- **Payments:** Stripe
- **Logistics:** Biteship

---

## 2. Database Schema & RLS Strategy
Before writing frontend code, we must structure our database and secure it using Supabase Row Level Security (RLS) policies.

### 2.1 Core Tables
- **`users` (extends auth.users):** `id`, `role` (admin, staff, customer), `first_name`, `last_name`, `phone`.
- **`shipping_addresses`:** `id`, `user_id`, `label` (Home, Office), `recipient_name`, `phone`, `street_address`, `city`, `province`, `postal_code`, `is_default`.
- **`categories`:** `id`, `name`, `slug`, `description`.
- **`products`:** `id`, `category_id`, `name`, `description`, `price`, `stock_quantity`, `status`, `weight` (grams), `dimensions` (JSON: l, w, h), `images` (text array of URLs).
- **`authenticity_records`:** `id`, `product_id`, `serial_number`, `status`.
- **`orders`:** `id`, `customer_id`, `status` (Pending, Paid, Processing, Packaging, Shipped, Delivered, Refunded, Cancelled), `total_amount`, `shipping_address_id`, `shipping_cost`, `tracking_number`.
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
  - [ ] **Staff Profile Implementation:** See [`STAFF_PROFILE.md`](./STAFF_PROFILE.md) for detailed profile features (Fulfillment, Inventory, Support).
- [x] **Customer Dashboard Mockup:** Create a basic `/customer` layout to test access.
- [ ] **End-to-End Testing:** Test user signup, login, and roles across dashboards.

### Phase 5: Backend Edge Functions & Integrations
- [ ] **Payment Webhook (Stripe):** Handle `checkout.session.completed` to update order status from `Pending` to `Paid`.
- [ ] **Shipping Webhook (Biteship):** Sync tracking updates to transition order status from `Shipped` to `Delivered`.
- [ ] **Refund Processing Function:** Secure Edge Function callable only by Admins to interact with Stripe API and log the action.

### Phase 6: Customer Portal Implementation
- [ ] **Profile Management:** Address book (multiple `shipping_addresses`), personal details.
- [ ] **Cart & Persistence:** Implementation of a robust cart system with optional database sync for logged-in users.
- [ ] **Order Tracking:** Read-only view of their orders and current statuses.
- [ ] **Checkout Flow:** Integration with Stripe and order generation (mapping cart items to `order_items`).

### Phase 7: Staff Dashboard (The Operator)
- [ ] **Order Fulfillment Queue:** Kanban or list view of orders categorized by status (Paid -> Processing -> Packaging -> Shipped).
- [ ] **Shipping Management:** Interface to generate/print shipping labels (Biteship integration) and update status.
- [ ] **Inventory Updates:** Interface to modify stock levels for received shipments or damaged goods.
- [ ] **Order Notes:** UI to add and view internal operational notes on specific orders.

### Phase 8: Admin Dashboard (The Controller)
- [ ] **Financial Overview:** Charts and KPIs for revenue, sales trends, and refunds.
- [ ] **Full Order Management:** Ability to override statuses, issue refunds, or cancel orders.
- [ ] **Product & Pricing Management:** UI to change prices, add discounts, and manage the product catalog.
- [ ] **Authenticity Management:** Interface to manage serial numbers and authenticity records.
- [ ] **System & Staff Management:** Create staff accounts, manage roles, view system integrations.
- [ ] **Audit Log Viewer:** Read-only interface to search and filter system audit logs.

---

## 4. Scalability & Future-Proofing
- **Extensible RBAC:** Using an ENUM for roles (`admin`, `staff`, `customer`) allows easy insertion of new roles (e.g., `warehouse_staff`, `support`) in the future without rewriting core authorization logic.
- **Microservice-ready:** Offloading complex logic (Payments, Logistics) to Supabase Edge Functions keeps the Next.js frontend lightweight and prevents API key exposure.
- **Audit Trails:** Centralized trigger-based logging ensures that even direct database interventions are captured, maintaining accountability as the business grows.
