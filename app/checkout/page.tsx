import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import CheckoutClient, { Watch } from './CheckoutClient';

interface CheckoutPageProps {
  searchParams: Promise<{ productId?: string; error?: string; cart?: string }>;
}

export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
  const { productId, error, cart } = await searchParams;

  // ── Guard: must be authenticated ──────────────────────────────────────────
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login?redirectTo=/checkout');

  let watch: Watch | null = null;

  // ── Guard: product must exist (if not cart checkout) ──────────────────────
  if (cart !== 'true') {
    if (!productId) redirect('/?error=product_not_found');

    const { data: product } = await supabase
      .from('products')
      .select(`
        *,
        categories (
          name
        )
      `)
      .eq('id', productId)
      .single();

    if (!product) redirect('/?error=product_not_found');

    watch = {
      id: product.id,
      name: product.name,
      price: Number(product.price),
      price_idr: Number(product.price_idr),
      tier: product.categories?.name || 'Luxury',
      image: product.images?.[0] || '/featured-watch.png'
    };
  }

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
        isCart={cart === 'true'}
        addresses={addresses || []}
        userEmail={user.email!}
      />
    </>
  );
}
