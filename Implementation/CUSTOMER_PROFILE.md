# Customer Profile & Dashboard Implementation Plan

This document details the features and implementation steps for the Customer dashboard (`/customer`) and profile management in the Luxury28 E-commerce platform.

## 1. Overview & Purpose
The Customer Dashboard is the personal hub for buyers on Luxury28. It provides self-service capabilities for managing personal data, tracking orders, interacting with their luxury purchases, and ensuring a premium user experience.

## 2. Core Modules & Features

### 2.1 Personal Details & Security (`/customer/profile`) — ✅ Real-time
- **Account Information:** View and update first name, last name, and phone number.
- **Security:** Update password securely with confirmation validation.
- **Avatar Upload:** Upload or change a profile picture (stored securely in the Supabase `avatars` bucket). Max file size: 1MB. A note is shown under the upload button informing users of the 1MB limit.
- **Real-time Sync:** Profile data updates live via Supabase subscription. Changes from another session are reflected immediately.

### 2.2 Address Book (`/customer/addresses`) — ✅ Real-time
- **Address Management:** Interface to Create, Read, Update, and Delete (CRUD) shipping addresses.
- **Default Address:** Set a primary shipping address to streamline the checkout flow.
- **Structured Data:** Ensure all required logistics fields (recipient name, street, city, province, postal code) are properly captured and validated for Biteship integration.
- **Real-time Sync:** New addresses and deletions update live without a page refresh.

### 2.3 Order History & Live Tracking (`/customer/orders`) — ✅ Real-time
- **Order Overview:** A clean list view of all past and current orders, showing immediate status (Pending, Paid, Processing, Shipped, Delivered).
- **Order Details (Slide-out Panel):** When an order is clicked, a smooth slide-out panel opens on the right side to display purchased items, price snapshots, and shipping costs without leaving the main order list.
- **Logistics Tracking:** Display tracking numbers and dynamic tracking status (potentially integrating direct links to the courier tracking page).
- **Real-time Sync:** Order status changes by staff are reflected instantly on the customer's view. The slide-out panel also auto-refreshes.

### 2.4 The Authenticity Vault (`/customer/authenticity`) — ✅ Real-time *[Luxury Specific]*
- **Digital Certificates:** A specialized section where customers can view the `serial_number` and authenticity status of their purchased luxury items.
- **Provenance:** Adds trust and value by linking purchased items from the `orders` table to the `authenticity_records` table.
- **Real-time Sync:** New certificates issued by admin appear instantly in the vault.

### 2.5 Wishlist / Saved Items (`/customer/wishlist`) — ✅ Real-time
- **Favorites:** Allow users to save high-value items they are considering, persisting across sessions.
- **Real-time Sync:** Items added or removed sync instantly across devices.

### 2.6 Payment Settings (`/customer/payment`) — ✅ New Module
- **Preferred Method:** Customer can choose their default payment method: Credit/Debit Card, Bank Transfer, or Digital Wallet (PayPal, Apple Pay, Google Pay).
- **Saved Cards:** View and manage saved payment cards (Stripe-powered). Add or remove cards with a secure flow.
- **Security Notice:** A prominent notice informs customers that all payment data is encrypted and handled exclusively by the payment processor.

### 2.7 Global Header & Persistent Shopping Cart
- **Persistent Navigation:** The global header (featuring "My Account" and the "Cart" toggle) will be rendered at the root layout level. This ensures the Cart button **never disappears** and is always accessible, regardless of what page the user navigates to.
- **Slide-out Cart:** Clicking the Cart from any page opens a slide-out panel on the right side.
- **Cart Contents:** Displays current items in the cart, individual product prices, and a calculated subtotal.
- **Checkout Flow:** Features a "Go to Cart" button that will lead to a dedicated Shopping Cart page (acting as a placeholder until the Stripe payment integration is ready).

## 3. Implementation Steps

- [x] **Step 1: Layout & Navigation:** Build the persistent `/customer/layout.tsx` featuring a premium, user-friendly sidebar or tabbed navigation (Profile, Addresses, Orders, Vault).
- [x] **Step 2: Profile Settings:** Implement real-time forms for updating the `users` table with avatar upload (1MB limit with UI note), password change, and Supabase Realtime sync.
- [x] **Step 3: Address Book:** Build the real-time CRUD interface for the `shipping_addresses` table.
- [x] **Step 4: Order Tracking UI:** Real-time fetch from `orders` and `order_items`. Status changes by staff reflect instantly on the customer's view.
- [x] **Step 5: Authenticity Vault:** Real-time view linking purchased products to their `authenticity_records` for digital proof of authenticity.
- [x] **Step 6: Wishlist / Saved Items:** Real-time wishlist with live add/remove sync.
- [x] **Step 7: Payment Settings:** Added a new `/customer/payment` page for choosing preferred payment method and managing saved cards.
- [x] **Step 8: Mobile-Native Experience:** Implemented mobile-responsive navigation with a hamburger toggle for the customer dashboard sidebar. Full mobile layout on all modules.

## 4. Security & RLS Context
- Customers can ONLY `SELECT` and `UPDATE` their own record in the `users` table.
- Customers can ONLY `SELECT`, `INSERT`, `UPDATE`, and `DELETE` their own `shipping_addresses`.
- Customers can ONLY `SELECT` and `INSERT` their own `orders` and `order_items`.
- Strict Row Level Security (RLS) policies on Supabase enforce these boundaries using `auth.uid()`, guaranteeing that no customer can access another customer's data or order history.
- Payment card data is never stored on-platform — all card handling is delegated to the Stripe payment processor.
