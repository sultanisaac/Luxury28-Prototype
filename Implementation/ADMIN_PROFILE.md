# Admin Dashboard & Profile Implementation Plan

This document outlines the complete implementation details for the Admin interface (`/admin`), covering both their personal profile settings and their global management capabilities (Access, Roles, and Operations).

## 1. Overview
The Admin area is the highest privilege zone. It serves two main purposes:
1. **Admin Profile (`/admin/profile`):** Managing the administrator's personal security and identity.
2. **Global Dashboard (`/admin/`):** Managing the E-commerce platform, including user roles, products, orders, and system logs.

## 2. Global Management (Access & Operations)

### A. User & Role Management (Access Control)
- **User Directory (`/admin/users`):** A data table listing all registered users across the platform.
- **Role Assignment:** A secure interface allowing the Admin to change a user's role (e.g., promoting a `customer` to `staff` or `admin`).
- **Access Revocation:** Ability to ban users or remove staff privileges instantly.

### B. Product & Inventory Management
- **Catalog Management (`/admin/products`):** Full CRUD (Create, Read, Update, Delete) capabilities for Products.
- **Image Handling:** Uploading and managing product galleries in the `product-images` bucket.
- **Stock Control:** Adjusting inventory numbers and receiving low-stock warnings.

### C. Order & Financial Management
- **Global Order View (`/admin/orders`):** Access to all customer orders, allowing admins to override statuses.
- **Refund Processing:** A dedicated interface to process Stripe refunds via secure Edge Functions.

### D. Global System Audit Logs
- **Security Oversight (`/admin/audit`):** A dedicated page to view the entire `public.audit_logs` table.
- **Traceability:** See exactly which Staff member or Admin performed sensitive actions (e.g., "Staff A updated Product B price").

---

## 3. Personal Profile Features (`/admin/profile`)

### A. Personal Information Management
- **Avatar Upload:** Allow admins to upload and crop profile pictures. Files will be stored in the `user-avatars` bucket.
- **Basic Details:** Editable fields for `first_name`, `last_name`, and `phone` synced with the `public.users` table.

### B. Security Settings
- **Password Management:** Provide a secure interface to request a password change via Supabase Auth.
- **Session Management:** Show currently active sessions and allow the admin to log out of all other devices.

---

## 4. UI/UX Design Aesthetics
- **Layout:** A persistent sidebar navigation (Overview, Users & Roles, Products, Orders, Audit Logs, Settings).
- **Aesthetics:** Dark mode with glassmorphism elements, subtle borders (`border-zinc-800`), premium typography, and distinct badges for User Roles (e.g., Gold for Admin, Silver for Staff).
- **Interactions:** Smooth toast notifications for successful saves, and loading spinners on image uploads.

## 5. Implementation Steps
- [x] **Step 1: Layout & Navigation:** Build the persistent `/admin/layout.tsx` with sidebar links.
- [x] **Step 2: Admin Profile (`/admin/profile`):** Build the personal settings page, including Avatar upload and password management.
- [x] **Step 3: User & Role Manager (`/admin/users`):** Build the interface to fetch the `users` table and implement role-change server actions.
- [x] **Step 4: Product Manager (`/admin/products`):** Build forms for adding/editing items and uploading images.
- [x] **Step 5: Global Audit View (`/admin/audit`):** Build a searchable table displaying system logs.
