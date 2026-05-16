// lib/xendit.ts — Xendit REST API wrapper (Indonesia-first payment processor)

const XENDIT_BASE_URL = 'https://api.xendit.co';

function getAuthHeader(): string {
  const key = process.env.XENDIT_SECRET_KEY;
  if (!key) throw new Error('XENDIT_SECRET_KEY is not set in environment variables.');
  return `Basic ${Buffer.from(key + ':').toString('base64')}`;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface XenditInvoiceParams {
  externalId: string;      // Unique ID we generate (e.g. "LUX28-<orderId>")
  amount: number;          // Amount in IDR
  payerEmail: string;
  description: string;
  successRedirectUrl: string;
  failureRedirectUrl: string;
}

export interface XenditInvoice {
  id: string;
  external_id: string;
  invoice_url: string;  // URL to redirect customer to
  status: 'PENDING' | 'PAID' | 'EXPIRED' | 'SETTLED';
  amount: number;
  currency: string;
}

export interface XenditWebhookPayload {
  id: string;             // Xendit invoice ID
  external_id: string;
  status: string;
  paid_amount: number;
  payment_method: string;
  payment_channel: string;
}

// ─── Functions ────────────────────────────────────────────────────────────────

/**
 * Create a hosted Xendit invoice.
 * Supports: QRIS, GoPay, OVO, ShopeePay, DANA, BCA/BNI/BRI/Mandiri VA, Credit Card.
 */
export async function createXenditInvoice(params: XenditInvoiceParams): Promise<XenditInvoice> {
  const res = await fetch(`${XENDIT_BASE_URL}/v2/invoices`, {
    method: 'POST',
    headers: {
      Authorization: getAuthHeader(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      external_id: params.externalId,
      amount: params.amount,
      payer_email: params.payerEmail,
      description: params.description,
      success_redirect_url: params.successRedirectUrl,
      failure_redirect_url: params.failureRedirectUrl,
      currency: 'IDR',
      // All major Indonesian payment channels enabled
      payment_methods: [
        'QRIS', 'OVO', 'DANA', 'LINKAJA', 'SHOPEEPAY',
        'BCA', 'BNI', 'BRI', 'MANDIRI', 'PERMATA',
        'CREDIT_CARD',
      ],
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(`[Xendit] Invoice creation failed: ${JSON.stringify(err)}`);
  }

  return res.json();
}

/**
 * Fetch a Xendit invoice by ID (for manual verification if needed).
 */
export async function getXenditInvoice(invoiceId: string): Promise<XenditInvoice> {
  const res = await fetch(`${XENDIT_BASE_URL}/v2/invoices/${invoiceId}`, {
    headers: { Authorization: getAuthHeader() },
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(`[Xendit] Fetch invoice failed: ${JSON.stringify(err)}`);
  }

  return res.json();
}

/**
 * Issue a refund for a paid invoice.
 * Only callable from Admin-protected Server Actions.
 */
export async function refundXenditInvoice(invoiceId: string, amount: number, reason: string) {
  const res = await fetch(`${XENDIT_BASE_URL}/refunds`, {
    method: 'POST',
    headers: {
      Authorization: getAuthHeader(),
      'Content-Type': 'application/json',
      'Idempotency-key': `refund-${invoiceId}-${Date.now()}`,
    },
    body: JSON.stringify({
      invoice_id: invoiceId,
      amount,
      reason,
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(`[Xendit] Refund failed: ${JSON.stringify(err)}`);
  }

  return res.json();
}
