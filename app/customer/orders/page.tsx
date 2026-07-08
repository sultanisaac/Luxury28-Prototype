import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import OrderHistoryClient from './order-history-client'

export default async function OrdersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: orders } = await supabase
    .from('orders')
    .select('*, order_items(*, products(name, images))')
    .eq('customer_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h1 className="font-serif text-3xl">Order History</h1>
        <Link 
          href="/products" 
          className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 uppercase tracking-widest text-xs font-bold transition-all"
        >
          Continue Shopping
        </Link>
      </div>
      <OrderHistoryClient initialOrders={orders || []} userId={user.id} />
    </div>
  )
}
