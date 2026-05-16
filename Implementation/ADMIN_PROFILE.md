# Admin Dashboard & Profile Implementation Plan

This document outlines the complete implementation details for the Admin interface (`/admin`), covering both their personal profile settings and their global management capabilities (Access, Roles, and Operations).

## 1. Overview
The Admin area is the highest privilege zone. It serves two main purposes:
1. **Admin Profile (`/admin/profile`):** Managing the administrator's personal security and identity.
2. **Global Dashboard (`/admin/`):** Managing the E-commerce platform, including user roles, products, orders, and system logs.
3. **Mobile Responsive Navigation:** Management on the go via a responsive drawer and native-feel mobile interface.

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
- **Refund Processing:** A dedicated interface to process **Xendit** refunds/voids via secure Supabase Edge Functions. This is the platform's Indonesia-first payment processor, replacing Stripe.
- **Payment Method Visibility:** Admin can see which payment channel the customer used (QRIS, GoPay, BCA Virtual Account, Credit Card, etc.) on each order.

### D. Global System Audit Logs
- **Security Oversight (`/admin/audit`):** A dedicated page to view the entire `public.audit_logs` table.
- **Traceability:** See exactly which Staff member or Admin performed sensitive actions (e.g., "Staff A updated Product B price").

### E. Business Analytics (The Executive View)
- **Revenue Snapshot (`/admin`):** Premium visual cards showing Total Revenue, Order Count, and Average Order Value (AOV).
- **Sales Trends:** A dynamic line chart using `recharts` or similar to visualize revenue growth over time.
- **Top Performers:** A "Best Sellers" table highlighting products with the highest conversion rates.

### F. Marketing & Promotions
- **Coupon Management (`/admin/marketing`):** CRUD for discount codes (e.g., percentage off, fixed amount, expiry dates).
- **Flash Sales:** A global toggle to activate/deactivate site-wide sale banners or price overrides.

### G. Customer Support Hub
- **Inquiry Manager (`/admin/support`):** A list of messages sent via the frontend Contact Form.
- **VIP Tracking:** Identifying high-value customers based on lifetime spend.
- **Traceability:** See exactly which Staff member or Admin performed sensitive actions (e.g., "Staff A updated Product B price").

---

## 3. Personal Profile Features (`/admin/profile`)

### A. Personal Information Management
- **Avatar Upload:** Allow admins to upload and crop profile pictures. Files will be stored in the `user-avatars` bucket.
- **Basic Details:** Editable fields for `first_name`, `last_name`, and `phone` synced with the `public.users` table.

### B. Security Settings
- **Password Management:** Provide a secure interface to request a password change via Supabase Auth.
- **Session Management:** Show currently active sessions and allow the admin to log out of all other devices.
- **Two-Factor Authentication (2FA):** Interface to enable/manage 2FA for the owner's account.

---

## 4. Global Store Configuration (`/admin/settings`)
- **Store Identity:** Editable fields for Store Name, Contact Email, and Business Address.
- **SEO & Metadata:** Manage default page titles, descriptions, and OpenGraph images for the storefront.
- **Social Integration:** Update Instagram, X, and Facebook URLs dynamically.
- **Maintenance Mode:** A master toggle to put the shop into "Coming Soon" or "Maintenance" mode.

---

## 4. UI/UX Design Aesthetics
- **Layout:** A persistent sidebar navigation (Overview, Users & Roles, Products, Orders, Audit Logs, Settings).
- **Aesthetics:** Dark mode with glassmorphism elements, subtle borders (`border-zinc-800`), premium typography, and distinct badges for User Roles (e.g., Gold for Admin, Silver for Staff).
- **Interactions:** Smooth toast notifications for successful saves, and loading spinners on image uploads.

## 6. Real-time Architecture
The Luxury28 Admin Dashboard is powered by **Supabase Realtime**, providing a high-performance, live-sync experience across all modules:
- **Hydrate-then-Listen Pattern:** Pages fetch initial data server-side for speed, then immediately establish a `postgres_changes` listener for incremental updates.
- **Global Indicators:** Live "pulsing" badges and unread counts (e.g., in the sidebar) inform administrators of incoming events as they happen.
- **Auto-Sync:** Changes made by one administrator (e.g., updating a product price or banning a user) propagate instantly to all other active admin sessions.

## 7. Implementation Steps (COMPLETED)
- [x] **Step 1: Layout & Navigation:** Built persistent `/admin/layout.tsx` with sidebar links and real-time notification badge.
- [x] **Step 2: Admin Profile (`/admin/profile`):** Built personal settings page with real-time identity synchronization.
- [x] **Step 3: Analytics Dashboard (`/admin`):** Implemented live-fed revenue cards and active order trackers.
- [x] **Step 4: User & Role Manager (`/admin/users`):** Built real-time user directory with instant role propagation.
- [x] **Step 5: Product & Inventory (`/admin/products`):** Built real-time product catalog with live stock level monitoring.
- [x] **Step 6: Marketing & Coupons (`/admin/marketing`):** Implemented live-syncing promotion manager and campaign stats.
- [x] **Step 7: Store Settings (`/admin/settings`):** Created real-time global config page for instant platform adjustments.
- [x] **Step 8: Customer Support Hub (`/admin/support`):** Implemented live inquiry management with unread notification badges.
- [x] **Step 9: Global Audit View (`/admin/audit`):** Built searchable, real-time audit trail for security oversight.
- [x] **Step 10: Real-time Notification Hub:** Centralized system alerts integrated across the entire administrative suite.
- [x] **Step 11: Mobile-Native Experience:** Implemented full dashboard navigation via a responsive drawer for management on the go.
