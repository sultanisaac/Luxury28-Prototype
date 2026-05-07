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
- **`products`:** `id`, `name`, `description`, `price`, `stock_quantity`, `status`.
- **`authenticity_records`:** `id`, `product_id`, `serial_number`, `status`.
- **`orders`:** `id`, `customer_id`, `status` (Pending, Paid, Processing, Packaging, Shipped, Delivered, Refunded, Cancelled), `total_amount`, `shipping_address_id`.
- **`order_notes`:** `id`, `order_id`, `author_id`, `note_text`, `created_at`.
- **`audit_logs`:** `id`, `user_id`, `role`, `action_type`, `resource`, `created_at`.

### 2.2 Row Level Security (RLS) Implementation
We will implement strictly tailored RLS policies matching the Sensitive Data Access Matrix.

*   **Admin:** `true` (bypass RLS or explicit `ALL` policies for `role = 'admin'`).
*   **Staff:** 
    *   `SELECT`, `UPDATE` on `orders` and `products` (inventory only).
    *   `SELECT` on `users` (shipping details only).
    *   `SELECT`, `INSERT` on `order_notes`.
    *   No access to financial analytics or audit logs.
*   **Customer:** 
    *   `SELECT` on `products` (where status is active).
    *   `SELECT`, `INSERT` on `orders` (where `customer_id = auth.uid()`).
    *   No access to `order_notes` or `audit_logs`.

---

## 3. Step-by-Step Implementation Phases

### Phase 1: Supabase Initialization & Auth Setup
1. **Create Supabase Project:** Setup project, retrieve API keys and URLs.
2. **Configure Authentication:** Enable Email/Password auth.
3. **Storage Setup:** Create buckets for `product-images`, `user-avatars`.
4. **Environment Variables:** Add keys to `.env.local`.

### Phase 2: Database Migration & Seeding
1. **Define Enums & Tables:** Write SQL migrations for roles, order statuses, and core tables.
2. **Implement RLS Policies:** Apply the security matrix directly to PostgreSQL using Supabase RLS.
3. **Database Triggers:** 
   - Create a trigger to automatically insert into `audit_logs` on sensitive table mutations (inventory, pricing, refunds).
   - Create a trigger to sync `auth.users` with the public `users` table upon signup.

### Phase 3: Backend Edge Functions
1. **Payment Webhook (Stripe):** Handle `checkout.session.completed` to update order status from `Pending` to `Paid`.
2. **Shipping Webhook (Biteship):** Sync tracking updates to transition order status from `Shipped` to `Delivered`.
3. **Refund Processing Function:** Secure Edge Function callable only by Admins to interact with Stripe API and log the action.

### Phase 4: Frontend State & API Integration
1. **Supabase Client Wrapper:** Setup SSR and Client-side Supabase clients using `@supabase/ssr`.
2. **Authentication Flow:** Build Login, Register, Password Reset pages.
3. **Role-based Route Protection:** Create Next.js middleware to protect `/admin`, `/staff`, and `/customer` routes and redirect unauthorized access.

### Phase 5: Customer Portal Implementation
1. **Profile Management:** Address book, personal details.
2. **Order Tracking:** Read-only view of their orders and current statuses.
3. **Checkout Flow:** Integration with Stripe and order generation.

### Phase 6: Staff Dashboard (The Operator)
1. **Order Fulfillment Queue:** Kanban or list view of orders categorized by status (Paid -> Processing -> Packaging -> Shipped).
2. **Shipping Management:** Interface to generate/print shipping labels (Biteship integration) and update status.
3. **Inventory Updates:** Interface to modify stock levels for received shipments or damaged goods.
4. **Order Notes:** UI to add and view internal operational notes on specific orders.

### Phase 7: Admin Dashboard (The Controller)
1. **Financial Overview:** Charts and KPIs for revenue, sales trends, and refunds.
2. **Full Order Management:** Ability to override statuses, issue refunds, or cancel orders.
3. **Product & Pricing Management:** UI to change prices, add discounts, and manage the product catalog.
4. **Authenticity Management:** Interface to manage serial numbers and authenticity records.
5. **System & Staff Management:** Create staff accounts, manage roles, view system integrations.
6. **Audit Log Viewer:** Read-only interface to search and filter system audit logs.

---

## 4. Scalability & Future-Proofing
- **Extensible RBAC:** Using an ENUM for roles (`admin`, `staff`, `customer`) allows easy insertion of new roles (e.g., `warehouse_staff`, `support`) in the future without rewriting core authorization logic.
- **Microservice-ready:** Offloading complex logic (Payments, Logistics) to Supabase Edge Functions keeps the Next.js frontend lightweight and prevents API key exposure.
- **Audit Trails:** Centralized trigger-based logging ensures that even direct database interventions are captured, maintaining accountability as the business grows.
