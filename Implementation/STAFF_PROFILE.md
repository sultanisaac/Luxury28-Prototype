# Luxury28 E-commerce: Staff Profile & Dashboard Implementation Plan

This document details the features, components, and implementation steps for the Staff Dashboard (`/staff`) in the Luxury28 E-commerce platform. While the Admin dashboard is the "Controller", the Staff dashboard is the "Operator", focusing on daily operations, fulfillment, and customer service.

## 1. Core Objectives for Staff Role
- **Order Fulfillment:** Streamlined interface to move orders through the fulfillment pipeline (Pending -> Processing -> Packaging -> Shipped).
- **Inventory Management:** Quick access to update stock levels and flag items for restocking.
- **Customer Support:** Manage customer inquiries and view customer order history for support purposes.
- **Operational Efficiency:** Reduce clicks required for repetitive tasks like printing shipping labels or adding order notes.

## 2. Staff Profile & Settings (`/staff/profile`)
Similar to the Admin profile, staff members need a dedicated space to manage their personal work identity.
- **Identity:** Name, Contact Number, and Avatar.
- **Security:** Password management and 2FA (if enforced by Admin).
- **Activity Log:** A personal read-only view of their recent actions (from `audit_logs`) to track their shift productivity.

## 3. Dashboard Modules

### 3.1 Operations Overview (`/staff`)
- **KPI Cards:** Pending Orders, Orders to Ship Today, Low Stock Alerts, Unread Support Messages.
- **Recent Activity Feed:** A live feed of new orders coming in or recent notes left by other staff members.

### 3.2 Order Fulfillment Queue (`/staff/orders`)
- **Kanban / List View:** Orders categorized by status.
- **Quick Actions:** One-click to "Mark as Processing", "Generate Shipping Label", or "Mark as Shipped".
- **Order Detail Slide-out:** View order items, shipping address, and internal `order_notes` without leaving the main queue.

### 3.3 Product & Catalog Management (`/staff/products`)
- **Full Catalog Control:** Staff can Create, Read, Update, and Delete (CRUD) products just like the store owner.
- **Inventory Management:** Quick access to adjust stock levels, update pricing, and modify product details or images.

### 3.4 Customer Support Inbox (`/staff/support`)
- **Inquiry Management:** Read and reply to customer messages from the storefront contact form.
- **Contextual View:** When viewing a message from a logged-in customer, see their recent order history alongside the message.

## 4. Implementation Steps

- [x] **Step 1: Layout & Navigation:** Build the persistent `/staff/layout.tsx` with a sidebar focused on operational links (Orders, Inventory, Support).
- [x] **Step 2: Staff Profile (`/staff/profile`):** Build the personal settings page, including personal details and password change capabilities.
- [x] **Step 3: Operations Dashboard (`/staff`):** Implement the KPI cards and recent activity feed.
- [x] **Step 4: Order Fulfillment Queue (`/staff/orders`):** Fetch the `orders` table and build the interactive status-change interface.
- [x] **Step 5: Shipping Integration:** Add the ability to generate and print shipping labels (via logistics API like Biteship).
- [x] **Step 6: Product Collection Manager (`/staff/products`):** Build full CRUD interface for the `products` table, sharing the same capabilities as the admin dashboard.
- [x] **Step 7: Support Inbox (`/staff/support`):** Implement the UI for handling `contact_inquiries` and linking them to customer profiles.

## 5. Security & RLS Context
- Staff members CANNOT access financial analytics, revenue data, or issue refunds.
- Staff members CANNOT alter global store settings or manage other users' roles.
- All write actions (updating order status, changing stock) must trigger an insert into the `audit_logs` table.
