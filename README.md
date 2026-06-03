# Luxury28 — Premium E-Commerce Platform

## Overview
Luxury28 is a sophisticated, high-end e-commerce platform built specifically for the luxury timepiece market in Indonesia. The platform is designed to provide a seamless, premium user experience while ensuring robust operational control for staff and administrators.

---

## Features

*   **Triple-Tier Architecture**:
    *   **Customer Portal**: Browse the curated catalog, manage carts, apply coupons, select dynamic shipping rates, and track orders. Features an "Authenticity Vault" for digital provenance.
    *   **Staff Dashboard**: Secure operational suite with a Kanban-style order fulfillment pipeline, inventory management, and customer support ticket handling.
    *   **Admin Console**: Comprehensive dashboard to manage global store settings (Identity, SEO, Security, Notifications), view audit logs, and oversee all operations.
*   **Secure & Seamless Checkout**: 3-step dynamic checkout integrating real-time courier rate calculation and secure payment processing.
*   **Marketing & Promotions**: Built-in robust coupon validation engine supporting percentage-based and fixed discounts with dynamic constraints (expiry, minimum purchase).
*   **Enterprise-Grade Security**: Full Row-Level Security (RLS) implementation across all tables, separating access between customers, staff, and administrators. 
*   **Premium UX/UI**: Designed with Tailwind CSS and Framer Motion for smooth, high-fidelity micro-interactions and a luxury aesthetic (Dark Mode native).

---

## Tech Stack

*   **Framework**: Next.js 15 (App Router)
*   **Language**: TypeScript
*   **Database & Auth**: Supabase (PostgreSQL)
*   **Styling**: Tailwind CSS & shadcn/ui
*   **Animations**: Framer Motion
*   **Payments API**: Xendit (Indonesia-first gateway)
*   **Logistics API**: Biteship (Indonesian courier aggregator)

---

## Installation

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
# or
pnpm install
```

---

## Environment Variables

The project uses several environment variables for database connectivity and external API integrations. 

Before running the application, copy the template configuration file:
```bash
cp .env.example .env.local
```
Then, open `.env.local` and populate the placeholders with your Supabase, Xendit, and Biteship credentials. Refer to the comments in [.env.example](.env.example) for detailed information on each required variable.

---

## Running Locally

To start the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

## Project Structure

Below is a high-level overview of the repository structure:

```
├── app/                    # Next.js App Router routes & layouts
│   ├── (auth)/             # Authentication routes (login, signup, etc.)
│   ├── actions/            # Server actions (checkout, support, coupons)
│   ├── admin/              # Admin dashboard pages and management tools
│   ├── api/                # API routes and webhook handlers (Xendit, Biteship)
│   ├── checkout/           # Multi-step checkout wizard & success handler
│   ├── customer/           # Customer account portal
│   └── staff/              # Staff order queue & operational components
├── components/             # Reusable UI components
│   ├── admin/              # Admin-specific interface blocks
│   ├── ui/                 # shadcn/ui primitive primitives
│   └── landing/            # Storefront homepage sections
├── context/                # Global contexts (e.g., CartContext)
├── hooks/                  # Custom React hooks
├── lib/                    # Library wrappers & utility scripts
│   ├── supabase/           # Server/Client SSR initializers & typings
│   ├── biteship.ts         # Biteship API helper methods
│   └── xendit.ts           # Xendit API invoice & refund helpers
├── public/                 # Static assets (images, vectors, payment logos)
└── styles/                 # Global stylesheet configurations
```

---

## Deployment

This application is built for deployment on [Vercel](https://vercel.com).

### Deployment Guidelines:
1. Ensure all environment variables listed in `.env.example` are configured in the Vercel Project Settings.
2. Setup webhooks on Xendit and Biteship dashboards pointing to your production URL:
   * **Xendit Webhook:** `https://your-domain.com/api/webhooks/xendit`
   * **Biteship Webhook:** `https://your-domain.com/api/webhooks/biteship`
3. Configure the `NEXT_PUBLIC_APP_URL` variable to match your production domain.

---

## License

This project is currently unlicensed. (Add LICENSE file to distribute publicly).

---

## Contributing

We welcome contributions to this repository. To contribute:
1. Fork the project.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

Please follow the guidelines defined in [GITHUB_ISSUES_GUIDE.md](GITHUB_ISSUES_GUIDE.md) for issue tracking and development lifecycle discipline.

---

## Security Notes

> [!WARNING]
> **Environment Configuration Security**
> Never commit actual secret keys or credentials (such as `SUPABASE_SERVICE_ROLE_KEY`, `XENDIT_SECRET_KEY`, or `BITESHIP_API_KEY`) to the Git repository. Always keep them restricted to local `.env.local` files or secure production environment variable vaults.
> 
> If you suspect any keys have been committed in the Git history, rotate them immediately in the respective dashboards.
