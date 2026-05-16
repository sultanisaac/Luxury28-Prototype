# Luxury28 E-commerce: Staff Profile & Dashboard Implementation Plan

This document details the features, components, and implementation steps for the Staff Dashboard (`/staff`) in the Luxury28 E-commerce platform. While the Admin dashboard is the "Controller", the Staff dashboard is the "Operator", focusing on daily operations, fulfillment, and customer service.

## 1. Core Objectives for Staff Role
- **Order Fulfillment:** Streamlined interface to move orders through the fulfillment pipeline (Pending -> Processing -> Packaging -> Shipped).
- **Inventory Management:** Quick access to update stock levels and flag items for restocking.
- **Customer Support:** Manage customer inquiries and view customer order history for support purposes.
- **Operational Efficiency:** Reduce clicks required for repetitive tasks like printing shipping labels or adding order notes.
- **Customer Visibility:** Staff can view a read-only customer directory (customers only — no admin or staff accounts visible).
- **Mobile Responsiveness:** Full dashboard navigation via a responsive drawer for management on the go.

## 2. Staff Profile & Settings (`/staff/profile`)
Similar to the Admin profile, staff members need a dedicated space to manage their personal work identity.
- **Identity:** Name, Contact Number, and Avatar.
- **Security:** Password management and 2FA (if enforced by Admin).
- **Activity Log:** A personal read-only view of their recent actions (from `audit_logs`) to track their shift productivity.
- **Real-time Sync:** Profile data updates in real time via Supabase subscription. Any update to the profile from another session is reflected immediately.

## 3. Dashboard Modules

### 3.1 Operations Overview (`/staff`) — ✅ Real-time
- **KPI Cards:** Pending Orders, Orders to Ship Today, Low Stock Alerts, Unread Support Messages.
- **Live Updates:** All KPI values subscribe to `orders`, `products`, `contact_inquiries`, and `audit_logs` tables via Supabase Realtime. No page refresh needed.
- **Recent Activity Feed:** A live feed of new orders and staff actions, updating automatically on every audit log insert.

### 3.2 Order Fulfillment Queue (`/staff/orders`) — ✅ Real-time
- **Kanban / List View:** Orders categorized by status (Paid → Processing → Packaging → Shipped).
- **Live Updates:** The kanban board subscribes to the `orders` table. Status changes from any staff member are reflected across all sessions instantly.
- **Quick Actions:** One-click to "Mark as Processing", "Generate Shipping Label", or "Mark as Shipped".
- **Order Detail Slide-out:** View order items, shipping address, and internal `order_notes` without leaving the main queue.

### 3.3 Product & Catalog Management (`/staff/products`) — ✅ Real-time
- **Full Catalog Control:** Staff can Create, Read, Update, and Delete (CRUD) products just like the store owner.
- **Live Updates:** The product grid subscribes to the `products` table. New products, price changes, or stock updates appear in real time.
- **Inventory Management:** Quick access to adjust stock levels, update pricing, and modify product details or images.

### 3.4 Customer Support Inbox (`/staff/support`) — ✅ Real-time
- **Inquiry Management:** Read and reply to customer messages from the storefront contact form.
- **Live Updates:** The inquiry list subscribes to the `contact_inquiries` table. New messages appear and status changes (read, replied, archived) update instantly.
- **Contextual View:** When viewing a message from a logged-in customer, see their recent order history alongside the message.

### 3.5 Customer Directory (`/staff/customers`) — ✅ New Module (Real-time)
- **Access Scope:** Staff can view **customer accounts only** — admin and staff accounts are strictly excluded from this view.
- **Customer Cards:** Displays avatar, name, email, phone, and join date in a searchable card grid.
- **Order History Modal:** Clicking a customer card opens the detailed User Detail Modal showing all orders, products purchased, and total lifetime spend.
- **Live Updates:** The directory subscribes to customer-role users in the `users` table. New customer registrations appear in real time.

### 3.6 My Profile (`/staff/profile`) — ✅ Real-time
- **Personal Settings:** Update name, phone, and profile avatar.
- **Security:** Change password with confirmation validation.
- **Real-time Sync:** Profile data syncs live from Supabase on any update event for the staff member's user record.

## 4. Implementation Steps

- [x] **Step 1: Layout & Navigation:** Build the persistent `/staff/layout.tsx` with a sidebar focused on operational links.
- [x] **Step 2: Staff Profile (`/staff/profile`):** Build the personal settings page with real-time sync.
- [x] **Step 3: Operations Dashboard (`/staff`):** Implement KPI cards and real-time activity feed via `StaffOverviewClient`.
- [x] **Step 4: Order Fulfillment Queue (`/staff/orders`):** Kanban board with real-time order status subscription.
- [x] **Step 5: Shipping Integration:** Add the ability to generate and print shipping labels (via logistics API like Biteship).
- [x] **Step 6: Product Collection Manager (`/staff/products`):** Full CRUD interface with real-time product subscription.
- [x] **Step 7: Support Inbox (`/staff/support`):** Real-time inquiry list with status management.
- [x] **Step 8: Customer Directory (`/staff/customers`):** Read-only, customer-scoped directory with order history modal and live updates.
- [x] **Step 9: Mobile-Native Experience:** Implemented full dashboard navigation via a responsive drawer for management on the go.

## 5. Security & RLS Context
- Staff members CANNOT access financial analytics, revenue data, or issue refunds.
- Staff members CANNOT alter global store settings or manage other users' roles.
- Staff members can ONLY view customer-role accounts in the Customer Directory. Admin and staff accounts are filtered out at the server query level.
- All write actions (updating order status, changing stock) must trigger an insert into the `audit_logs` table.
