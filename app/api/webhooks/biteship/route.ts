import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const getServiceClient = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

// Biteship tracking status → our order status
const STATUS_MAP: Record<string, string> = {
  allocated:        'Processing',
  picking_up:       'Processing',
  picked:           'Processing',
  dropping_off:     'Shipped',
  on_process:       'Shipped',
  in_transit:       'Shipped',
  delivered:        'Delivered',
  return_in_transit:'Cancelled',
  returned:         'Cancelled',
  cancelled:        'Cancelled',
};

export async function POST(request: NextRequest) {
  let body: any;
  try {
    body = await request.json();
  } catch {
    // Return 200 for empty bodies to allow dashboard registration/handshake
    return NextResponse.json({ message: 'Webhook endpoint active' }, { status: 200 });
  }

  // Handle empty or test payloads from Biteship dashboard
  if (!body || Object.keys(body).length === 0 || !body.reference_id) {
    return NextResponse.json({ message: 'Handshake successful' }, { status: 200 });
  }

  const {
    order_id: biteshipOrderId,
    reference_id: referenceId, // Our internal order ID
    courier_tracking_id: waybillId,
    courier_waybill_id: courierWaybill,
    status: biteshipStatus,
    courier,
  } = body;

  console.log(`[Biteship Webhook] order=${referenceId}, status=${biteshipStatus}`);

  const mappedStatus = STATUS_MAP[biteshipStatus];
  if (!mappedStatus) {
    return NextResponse.json({ received: true, message: `Status '${biteshipStatus}' not mapped.` });
  }

  const supabase = getServiceClient();

  // Find order by ID (referenceId is our Supabase order ID)
  const { data: order, error: findError } = await supabase
    .from('orders')
    .select('id, status, tracking_number')
    .eq('id', referenceId)
    .single();

  if (findError || !order) {
    console.error('[Biteship Webhook] Order not found:', referenceId);
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  // Build the update payload
  const updatePayload: Record<string, string> = { status: mappedStatus };
  if (waybillId || courierWaybill) {
    updatePayload.tracking_number = waybillId || courierWaybill;
  }
  if (courier?.name) {
    updatePayload.courier_name = courier.name;
  }

  const { error: updateError } = await supabase
    .from('orders')
    .update(updatePayload)
    .eq('id', order.id);

  if (updateError) {
    console.error('[Biteship Webhook] DB update failed:', updateError.message);
    return NextResponse.json({ error: 'DB update failed' }, { status: 500 });
  }

  // Audit log
  await supabase.from('audit_logs').insert({
    user_id: null,
    role: 'system',
    action_type: `SHIPMENT_${biteshipStatus.toUpperCase()}`,
    resource: `orders/${order.id}`,
  });

  console.log(`[Biteship Webhook] ✅ Order ${order.id} → ${mappedStatus} (${biteshipStatus})`);
  return NextResponse.json({ success: true });
}
