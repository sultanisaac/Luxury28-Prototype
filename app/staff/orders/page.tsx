import { createClient } from '@/lib/supabase/server'
import OrderKanban from './OrderKanban'

export default async function StaffOrdersPage() {
  const supabase = await createClient()
  
  const { data: orders } = await supabase
    .from('orders')
    .select(`
      *,
      customer:users!customer_id(first_name, last_name, email),
      address:shipping_addresses!shipping_address_id(*),
      order_items (
        *,
        products (
          name,
          ref_number
        )
      )
    `)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold font-serif tracking-wide text-white drop-shadow-md">Fulfillment Queue</h1>
        <p className="text-zinc-400 mt-2">Manage order progression from payment to shipping.</p>
      </div>

      <OrderKanban orders={orders || []} />
    </div>
  )
}
