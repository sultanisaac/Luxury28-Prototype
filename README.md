# Luxury28 — Premium E-Commerce Platform

Luxury28 is a sophisticated, high-end e-commerce platform built specifically for the luxury timepiece market in Indonesia. The platform is designed to provide a seamless, premium user experience while ensuring robust operational control for staff and administrators.

## 🌟 Key Features

*   **Triple-Tier Architecture**:
    *   **Customer Portal**: Browse the curated catalog, manage carts, apply coupons, select dynamic shipping rates, and track orders. Features an "Authenticity Vault" for digital provenance.
    *   **Staff Dashboard**: Secure operational suite with a Kanban-style order fulfillment pipeline, inventory management, and customer support ticket handling.
    *   **Admin Console**: Comprehensive dashboard to manage global store settings (Identity, SEO, Security, Notifications), view audit logs, and oversee all operations.
*   **Secure & Seamless Checkout**: 3-step dynamic checkout integrating real-time courier rate calculation and secure payment processing.
*   **Marketing & Promotions**: Built-in robust coupon validation engine supporting percentage-based and fixed discounts with dynamic constraints (expiry, minimum purchase).
*   **Enterprise-Grade Security**: Full Row-Level Security (RLS) implementation across all tables, separating access between customers, staff, and administrators. 
*   **Premium UX/UI**: Designed with Tailwind CSS and Framer Motion for smooth, high-fidelity micro-interactions and a luxury aesthetic (Dark Mode native).

## 🛠 Tech Stack

*   **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
*   **Language**: TypeScript
*   **Database & Auth**: [Supabase](https://supabase.com/) (PostgreSQL)
*   **Styling**: Tailwind CSS & [shadcn/ui](https://ui.shadcn.com/)
*   **Animations**: Framer Motion
*   **Payments API**: [Xendit](https://www.xendit.co/)
*   **Logistics API**: [Biteship](https://biteship.com/)

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed:
*   [Node.js](https://nodejs.org/) (v18 or higher)
*   A Supabase project instance

### 1. Clone the repository

```bash
git clone https://github.com/your-username/Luxury28-Prototype.git
cd Luxury28-Prototype
```

### 2. Install dependencies

```bash
npm install
# or
yarn install
```

### 3. Environment Variables

Create a `.env.local` file in the root directory and configure your environment variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# External APIs
XENDIT_SECRET_KEY=your-xendit-secret-key
BITESHIP_API_KEY=your-biteship-api-key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🧪 Testing the Prototype

This repository features an environment-guarded prototype overlay designed for easy client testing without sacrificing safety when the code is public:

1. **Enable Prototype Mode:** Set `NEXT_PUBLIC_IS_PROTOTYPE=true` in your `.env.local` file.
2. **Accessing Test Accounts:** The floating widget at the bottom-left of the application will automatically populate and display the test accounts. By default, it uses private environment variables:
   * `NEXT_PUBLIC_TEST_ADMIN_EMAIL` / `NEXT_PUBLIC_TEST_ADMIN_PASS`
   * `NEXT_PUBLIC_TEST_STAFF_EMAIL` / `NEXT_PUBLIC_TEST_STAFF_PASS`
   * `NEXT_PUBLIC_TEST_CUSTOMER_EMAIL` / `NEXT_PUBLIC_TEST_CUSTOMER_PASS`

These default to standard demo accounts but are fully customizable and never hardcoded into files committed to public Git.

## 📦 Database Schema Notes

The project relies heavily on Supabase PostgreSQL. Key tables include:
*   `users`: Extended profiles linked to Supabase Auth (`role` enum: `admin`, `staff`, `customer`).
*   `products` & `categories`: Catalog management.
*   `orders` & `order_items`: Transaction and fulfillment tracking.
*   `coupons`: Marketing and discount codes.
*   `store_settings`: Global configuration flags.
*   `audit_logs`: Immutable ledger of administrative and staff actions.

---
*Built with precision for the discerning collector.*
