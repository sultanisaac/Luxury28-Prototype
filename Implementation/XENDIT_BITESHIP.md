# Xendit & Biteship Integration Plan

This document covers the full technical implementation of Indonesia-first payment processing (Xendit) and multi-courier logistics (Biteship) for Luxury28.

> **Why these services?**
> Stripe does not natively support Indonesian local payment methods (QRIS, GoPay, OVO, Virtual Accounts) and is currently invite-only for Indonesian businesses. Xendit and Biteship are purpose-built for the Indonesian market.

---

## 1. Xendit — Payment Processing

**Website:** [xendit.co](https://xendit.co)
**Account Status:** ✅ Test Mode Active

### Supported Payment Channels
| Category | Methods |
|---|---|
| **QRIS** | All bank and e-wallet QR codes (single scan) |
| **E-Wallets** | GoPay, OVO, ShopeePay, DANA, LinkAja |
| **Virtual Account** | BCA, BNI, BRI, Mandiri, Permata |
| **Credit/Debit Card** | Visa, Mastercard, JCB |
| **BNPL** | Kredivo, Akulaku (future) |

### Environment Variables Required
```env
XENDIT_SECRET_KEY=xnd_development_...   # Server-side only (never expose to client)
XENDIT_PUBLIC_KEY=xnd_public_development_...  # Client-side tokenization (cards)
XENDIT_CALLBACK_TOKEN=...               # Webhook validation token
```

### Payment Flow
```
Customer → "Bayar Sekarang"
  → Server Action: createCheckoutOrder()
    → Create order in Supabase (status = "Pending")
    → POST /v2/invoices to Xendit API
    → Receive invoice_url
    → redirect(invoice_url)
  → Customer pays on Xendit-hosted page
  → Xendit POSTs to /api/webhooks/xendit
    → Validate x-callback-token header
    → Update order status: "Pending" → "Paid"
    → Write to audit_logs
  → Supabase Realtime pushes update to Staff Dashboard
```

### Files Created
| File | Purpose |
|---|---|
| `lib/xendit.ts` | REST API wrapper (createInvoice, getInvoice, refund) |
| `app/actions/checkout.ts` | Server Action: creates order + Xendit invoice |
| `app/api/webhooks/xendit/route.ts` | Webhook handler (validates token, updates order status) |
| `app/checkout/page.tsx` | Server Component: auth guard + data fetching |
| `app/checkout/CheckoutClient.tsx` | Interactive 3-step checkout UI |
| `app/checkout/success/page.tsx` | Post-payment success page |

### Webhook Configuration (Xendit Dashboard)
1. Log in to Xendit Dashboard → **Developers → Webhooks**
2. Add webhook URL: `https://your-domain.com/api/webhooks/xendit`
3. Set events: **Invoice** (all statuses)
4. Copy the **Callback Token** → save as `XENDIT_CALLBACK_TOKEN` in `.env`

### Refund Flow (Admin Only)
- Admin Dashboard → Orders → "Issue Refund"
- Calls `refundXenditInvoice()` in `lib/xendit.ts`
- Logged to `audit_logs` with action_type: `REFUND_ISSUED`
- Status: ⬜ *Pending implementation in Admin dashboard*

---

## 2. Biteship — Logistics & Courier Aggregation

**Website:** [biteship.com](https://biteship.com)
**Account Status:** ✅ Testing Mode Active

### Supported Couriers (via single API)
| Courier | Services |
|---|---|
| **JNE** | REG, YES (next day), OKE (economy) |
| **J&T Express** | Regular, Express |
| **SiCepat** | BEST (regular), HALU (next day) |
| **Anteraja** | Regular, Same Day |
| **Paxel** | Regular, Same Day |
| **Ninja Xpress** | Regular |

### Environment Variables Required
```env
BITESHIP_API_KEY=biteship_test....      # Test mode API key
WAREHOUSE_AREA_ID=IDNP1CGKOTA1800JKT000ORD  # Luxury28 Jakarta warehouse (update with real area ID)
WAREHOUSE_ADDRESS=Jl. Sudirman No. 1, Jakarta Pusat  # Update with real address
WAREHOUSE_PHONE=+622112345678           # Update with real phone
```

> ⚠️ **Action Required:** Update `WAREHOUSE_AREA_ID` with your actual Jakarta area ID from the Biteship area search API: `GET /v1/maps/areas?countries=ID&input=<your postal code>`

### Shipping Rate Flow (Checkout)
```
Customer selects address
  → POST /api/shipping/rates
    → searchBiteshipArea(postalCode) → get destination area ID
    → getBiteshipRates(originAreaId, destAreaId, items)
    → Return list of courier options + prices to UI
  → Customer selects courier (e.g. JNE REG - Rp 25.000 - 2-3 days)
  → Saved to order at checkout
```

### Pickup Booking Flow (Staff Dashboard)
```
Staff clicks "Request Pickup" on a Paid order
  → createBiteshipOrder() called with:
      - destination address from order
      - courier chosen by customer at checkout
      - package weight/dimensions (600g watch box)
      - shipping insurance = order total_amount
  → Biteship assigns waybill_id (Resi)
  → Supabase order updated: tracking_number = waybill_id
  → Staff prints label from Biteship dashboard
```
Status: ⬜ *Pending implementation in Staff dashboard*

### Tracking Webhook Flow
```
Courier scans package at checkpoint
  → Biteship POSTs to /api/webhooks/biteship
    → Map Biteship status → our order status
    → Update orders.status + orders.tracking_number
    → Supabase Realtime pushes update to Customer Dashboard
  → Customer sees live tracking in Order History
```

### Files Created
| File | Purpose |
|---|---|
| `lib/biteship.ts` | REST API wrapper (searchArea, getRates, createOrder) |
| `app/api/shipping/rates/route.ts` | API route called by checkout to fetch rates |
| `app/api/webhooks/biteship/route.ts` | Webhook handler (maps courier events to order status) |

### Webhook Configuration (Biteship Dashboard)
1. Log in to Biteship Dashboard → **Integration → API & Webhook**
2. Add webhook URL: `https://your-domain.com/api/webhooks/biteship`
3. Select all order events

---

## 3. Package Specifications (Luxury Watches)

Default values used in shipping API calls. Override per-product as needed.

| Spec | Value | Notes |
|---|---|---|
| Weight | 600g | Watch + box + papers |
| Length | 20 cm | Watch box |
| Width | 15 cm | |
| Height | 12 cm | |
| Insurance | = product price in IDR | Always enabled for luxury items |

---

## 4. Implementation Checklist

### Xendit
- [x] Create Xendit account (Test Mode)
- [x] Generate Secret Key + Public Key + Callback Token
- [x] Save keys to `.env`
- [x] Build `lib/xendit.ts` API wrapper
- [x] Build `app/actions/checkout.ts` Server Action
- [x] Build `app/api/webhooks/xendit/route.ts` webhook handler
- [x] Build 3-step Checkout UI (`/checkout`)
- [x] Build Order Success page (`/checkout/success`)
- [x] Wire "Buy Now" button on product page → checkout
- [ ] Configure webhook URL in Xendit Dashboard (requires deployed URL)
- [ ] Verify Xendit business account (for live transactions)
- [ ] Implement Admin refund UI in `/admin/orders`

### Biteship
- [x] Create Biteship account (Testing Mode)
- [x] Generate Test API Key
- [x] Save key to `.env`
- [x] Build `lib/biteship.ts` API wrapper
- [x] Build `app/api/shipping/rates/route.ts` rate calculator
- [x] Build `app/api/webhooks/biteship/route.ts` webhook handler
- [x] Integrate shipping rate display in checkout Step 2
- [ ] **Update `WAREHOUSE_AREA_ID` with real Biteship area ID**
- [ ] Configure webhook URL in Biteship Dashboard (requires deployed URL)
- [ ] Build "Request Pickup" button in Staff Order Fulfillment Queue
- [ ] Verify Biteship business account (for live shipments)

---

## 5. Local Testing Guide

Since webhooks require a public URL, use **ngrok** for local testing:

```bash
# Terminal 1: Run your Next.js app
npm run dev

# Terminal 2: Expose it to the internet
npx ngrok http 3000
```

Copy the `https://xxxxx.ngrok.io` URL and set it in:
- **Xendit Dashboard** → Webhooks → `https://xxxxx.ngrok.io/api/webhooks/xendit`
- **Biteship Dashboard** → Webhooks → `https://xxxxx.ngrok.io/api/webhooks/biteship`

### Test Xendit Payment (Sandbox)
Use these test credentials on the Xendit payment page:
- **Virtual Account:** Any bank, any amount
- **QRIS:** Scan with any test QR scanner
- **Card:** `4000000000000002` / Any future expiry / Any CVV

---

## 6. Production Go-Live Checklist
- [ ] Deploy to Vercel (get production URL)
- [ ] Swap `BITESHIP_API_KEY` → live key (disable Testing Mode in Biteship)
- [ ] Swap `XENDIT_SECRET_KEY` → live key (after Xendit business verification)
- [ ] Update webhook URLs in both dashboards to production domain
- [ ] Add `NEXT_PUBLIC_APP_URL=https://luxury28.com` to Vercel env vars
- [ ] Test one live transaction end-to-end
