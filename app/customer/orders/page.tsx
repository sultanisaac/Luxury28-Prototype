import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
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
      <h1 className="font-serif text-3xl mb-8">Order History</h1>
      <OrderHistoryClient initialOrders={orders || []} userId={user.id} />
    </div>
  )
}
