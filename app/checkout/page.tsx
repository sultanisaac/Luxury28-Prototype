import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { watches } from '@/lib/watches';
import CheckoutClient from './CheckoutClient';

interface CheckoutPageProps {
  searchParams: Promise<{ productId?: string; error?: string }>;
}

export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
  const { productId, error } = await searchParams;

  // ── Guard: must be authenticated ──────────────────────────────────────────
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login?redirectTo=/checkout');

  // ── Guard: product must exist ─────────────────────────────────────────────
  const watch = watches.find((w) => w.id === productId);
  if (!watch) redirect('/?error=product_not_found');

  // ── Fetch user's saved addresses ──────────────────────────────────────────
  const { data: addresses } = await supabase
    .from('shipping_addresses')
    .select('*')
    .eq('user_id', user.id)
    .order('is_default', { ascending: false });

  return (
    <>
      {error === 'payment_failed' && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-red-900/90 border border-red-500 text-red-200 px-6 py-3 text-sm flex items-center gap-2">
          ⚠️ Payment was cancelled or failed. Please try again.
        </div>
      )}
      <CheckoutClient
        watch={watch}
        addresses={addresses || []}
        userEmail={user.email!}
      />
    </>
  );
}
