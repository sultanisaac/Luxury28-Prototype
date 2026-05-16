'use server';

import { createClient } from '@/lib/supabase/server';
import { createXenditInvoice } from '@/lib/xendit';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';

export interface CheckoutPayload {
  productId: string;
  productName: string;
  productImage: string;
  unitPrice: number;      // IDR
  quantity: number;
  shippingAddressId: string;
  destinationAreaId: string;
  courierCode: string;
  courierName: string;
  courierServiceCode: string;
  courierServiceName: string;
  shippingCost: number;   // IDR
}

export async function createCheckoutOrder(payload: CheckoutPayload) {
  const supabase = await createClient();

  // ── 1. Verify the user is authenticated ────────────────────────────────────
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    redirect('/login');
  }

  // ── 2. Get user details for the invoice ───────────────────────────────────
  const { data: userRecord } = await supabase
    .from('users')
    .select('first_name, last_name')
    .eq('id', user.id)
    .single();

  const customerName = userRecord
    ? `${userRecord.first_name} ${userRecord.last_name}`.trim()
    : user.email!;

  const totalAmount = payload.unitPrice * payload.quantity + payload.shippingCost;

  // ── 3. Create order in Supabase (status = Pending) ─────────────────────────
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      customer_id: user.id,
      status: 'Pending',
      total_amount: totalAmount,
      shipping_address_id: payload.shippingAddressId,
      shipping_cost: payload.shippingCost,
      courier_name: `${payload.courierName} ${payload.courierServiceName}`,
    })
    .select()
    .single();

  if (orderError || !order) {
    throw new Error(`Failed to create order: ${orderError?.message}`);
  }

  // ── 4. Create order item ───────────────────────────────────────────────────
  const { error: itemError } = await supabase.from('order_items').insert({
    order_id: order.id,
    product_id: payload.productId,
    quantity: payload.quantity,
    unit_price: payload.unitPrice,
  });

  if (itemError) {
    // Rollback order if item creation fails
    await supabase.from('orders').delete().eq('id', order.id);
    throw new Error(`Failed to create order item: ${itemError.message}`);
  }

  // ── 5. Build the Xendit invoice ────────────────────────────────────────────
  const headersList = await headers();
  const host = headersList.get('host') || 'localhost:3000';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `${protocol}://${host}`;

  const externalId = `LUX28-${order.id}`;

  let invoiceUrl: string;
  try {
    const invoice = await createXenditInvoice({
      externalId,
      amount: totalAmount,
      payerEmail: user.email!,
      description: `Luxury28 — ${payload.productName} (x${payload.quantity}) + ${payload.courierName} Shipping`,
      successRedirectUrl: `${baseUrl}/checkout/success?orderId=${order.id}`,
      failureRedirectUrl: `${baseUrl}/checkout?productId=${payload.productId}&error=payment_failed`,
    });

    // ── 6. Update order with Xendit invoice ID ────────────────────────────
    await supabase
      .from('orders')
      .update({ xendit_invoice_id: invoice.id })
      .eq('id', order.id);

    invoiceUrl = invoice.invoice_url;
  } catch (xenditError) {
    // Rollback both order and item if Xendit fails
    await supabase.from('order_items').delete().eq('order_id', order.id);
    await supabase.from('orders').delete().eq('id', order.id);
    throw xenditError;
  }

  // ── 7. Audit log ───────────────────────────────────────────────────────────
  await supabase.from('audit_logs').insert({
    user_id: user.id,
    role: 'customer',
    action_type: 'ORDER_CREATED',
    resource: `orders/${order.id}`,
  });

  // ── 8. Redirect to Xendit hosted payment page ──────────────────────────────
  redirect(invoiceUrl);
}
