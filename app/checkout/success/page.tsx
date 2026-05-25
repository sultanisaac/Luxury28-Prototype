import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { CheckCircle2, Package, ArrowRight } from 'lucide-react';
import { getXenditInvoice } from '@/lib/xendit';
import { createClient as createSupabaseAdminClient } from '@supabase/supabase-js';
import ClearCart from './ClearCart';

interface SuccessPageProps {
  searchParams: Promise<{ orderId?: string }>;
}

export default async function CheckoutSuccessPage({ searchParams }: SuccessPageProps) {
  const { orderId } = await searchParams;

  const supabase = await createClient();
  let { data: order } = orderId
    ? await supabase
        .from('orders')
        .select('id, status, total_amount, courier_name, created_at, xendit_invoice_id, customer_id')
        .eq('id', orderId)
        .single()
    : { data: null };

  // Fallback for local development or if webhook is delayed
  if (order && order.status === 'Pending' && order.xendit_invoice_id) {
    try {
      const invoice = await getXenditInvoice(order.xendit_invoice_id);
      if (invoice.status === 'PAID' || invoice.status === 'SETTLED') {
        const supabaseAdmin = createSupabaseAdminClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        );
        
        await supabaseAdmin
          .from('orders')
          .update({
            status: 'Paid',
            paid_amount: invoice.amount,
          })
          .eq('id', order.id);
          
        await supabaseAdmin.from('audit_logs').insert({
          user_id: order.customer_id,
          role: 'system',
          action_type: 'PAYMENT_CONFIRMED',
          resource: `orders/${order.id}`,
        });

        order.status = 'Paid';
      }
    } catch (err) {
      console.error('Failed to verify Xendit invoice on success page:', err);
    }
  }

  const formatIDR = (amount: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);

  return (
    <main className="min-h-screen bg-background text-foreground flex items-center justify-center px-4 font-sans">
      <ClearCart />
      <div className="max-w-lg w-full text-center">

        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
            <CheckCircle2 size={40} className="text-primary" />
          </div>
        </div>

        {/* Heading */}
        <p className="text-xs uppercase tracking-[0.3em] text-primary mb-3">Payment Confirmed</p>
        <h1 className="font-serif text-4xl md:text-5xl mb-4">Thank You</h1>
        <p className="text-muted-foreground text-sm leading-relaxed max-w-sm mx-auto mb-8">
          Your order has been received and is being processed by our team.
          You will receive an email confirmation shortly.
        </p>

        {/* Order Details */}
        {order && (
          <div className="border border-border bg-card p-6 text-left mb-8 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground uppercase tracking-widest text-xs">Order ID</span>
              <span className="font-mono text-xs">{order.id.slice(0, 8).toUpperCase()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground uppercase tracking-widest text-xs">Status</span>
              <span className="text-green-400 font-semibold">{order.status}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground uppercase tracking-widest text-xs">Total Paid</span>
              <span className="font-semibold text-primary">{formatIDR(order.total_amount)}</span>
            </div>
            {order.courier_name && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground uppercase tracking-widest text-xs">Courier</span>
                <span>{order.courier_name}</span>
              </div>
            )}
          </div>
        )}

        {/* Next Steps */}
        <div className="bg-zinc-900 border border-zinc-800 p-5 text-left mb-8">
          <div className="flex items-center gap-3 text-sm">
            <Package size={18} className="text-primary flex-shrink-0" />
            <p className="text-muted-foreground">
              Our staff will prepare your timepiece and book a courier pickup.
              Track your shipment in <strong className="text-white">My Orders</strong>.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/customer/orders"
            className="flex-1 flex items-center justify-center gap-2 h-12 bg-primary text-background text-sm uppercase tracking-widest hover:bg-primary/90 transition-colors"
          >
            Track My Order <ArrowRight size={16} />
          </Link>
          <Link
            href="/"
            className="flex-1 flex items-center justify-center h-12 border border-border text-sm uppercase tracking-widest hover:bg-zinc-900 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </main>
  );
}
