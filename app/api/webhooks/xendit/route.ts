import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Use service role key to bypass RLS — only used server-side in this webhook
const getServiceClient = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

export async function POST(request: NextRequest) {
  // ── 1. Validate the Xendit callback token ──────────────────────────────────
  const callbackToken = request.headers.get('x-callback-token');
  if (callbackToken !== process.env.XENDIT_CALLBACK_TOKEN) {
    console.error('[Xendit Webhook] Invalid callback token received.');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    // Return 200 for empty bodies to allow dashboard registration/handshake
    return NextResponse.json({ message: 'Webhook endpoint active' }, { status: 200 });
  }

  // Handle empty or test payloads from dashboard
  if (!body || Object.keys(body).length === 0 || !body.id) {
    return NextResponse.json({ message: 'Handshake successful' }, { status: 200 });
  }

  const {
    id: xenditInvoiceId,
    external_id: externalId,
    status,
    paid_amount: paidAmount,
    payment_method: paymentMethod,
    payment_channel: paymentChannel,
  } = body;

  console.log(`[Xendit Webhook] Received: external_id=${externalId}, status=${status}`);

  // ── 2. Only process PAID events ────────────────────────────────────────────
  if (status !== 'PAID') {
    return NextResponse.json({ received: true, status, message: 'Non-PAID event ignored.' });
  }

  const supabase = getServiceClient();

  // ── 3. Find the order by xendit_invoice_id ─────────────────────────────────
  const { data: order, error: findError } = await supabase
    .from('orders')
    .select('id, status, customer_id')
    .eq('xendit_invoice_id', xenditInvoiceId)
    .single();

  if (findError || !order) {
    console.warn(`[Xendit Webhook] Order not found for invoice ${xenditInvoiceId}. This is expected for dashboard test requests.`);
    // Return 200 to satisfy Xendit's "Test and Save" check
    return NextResponse.json({ message: 'Webhook received (Order not found, likely a test)' }, { status: 200 });
  }

  // ── 4. Idempotency — skip if already processed ─────────────────────────────
  if (order.status === 'Paid') {
    console.log('[Xendit Webhook] Order already marked as Paid. Skipping.');
    return NextResponse.json({ received: true, message: 'Already processed.' });
  }

  // ── 5. Update order status to "Paid" ──────────────────────────────────────
  const { error: updateError } = await supabase
    .from('orders')
    .update({
      status: 'Paid',
      payment_method: `${paymentMethod} - ${paymentChannel}`,
      paid_amount: paidAmount,
    })
    .eq('id', order.id);

  if (updateError) {
    console.error('[Xendit Webhook] Failed to update order:', updateError.message);
    return NextResponse.json({ error: 'DB update failed' }, { status: 500 });
  }

  // ── 6. Write to audit_logs ─────────────────────────────────────────────────
  await supabase.from('audit_logs').insert({
    user_id: order.customer_id,
    role: 'system',
    action_type: 'PAYMENT_CONFIRMED',
    resource: `orders/${order.id}`,
  });

  console.log(`[Xendit Webhook] ✅ Order ${order.id} marked as Paid via ${paymentChannel}.`);
  return NextResponse.json({ success: true });
}
