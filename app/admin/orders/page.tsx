import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import OrderList from './OrderList'

export default async function OrdersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) notFound()

  // Verify Admin Role
  const { data: userData } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (userData?.role !== 'admin') notFound()

  // Initial Fetch for Hydration
  const { data: orders } = await supabase
    .from('orders')
    .select(`
      *,
      users (
        first_name,
        last_name,
        email
      ),
      order_items (
        *,
        products (
          name,
          images
        )
      ),
      shipping_addresses (*)
    `)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold font-serif tracking-wide text-white drop-shadow-md">Global Orders</h1>
        <p className="text-zinc-400 mt-2">Manage customer transactions and fulfillment in real-time.</p>
      </div>

      <OrderList initialOrders={orders || []} />
    </div>
  )
}
