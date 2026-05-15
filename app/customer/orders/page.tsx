import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import OrderHistoryClient from './order-history-client'
import { PackageX } from 'lucide-react'

export default async function OrdersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch real orders from database
  let { data: orders } = await supabase
    .from('orders')
    .select(`*, order_items(*, products(*))`)
    .eq('customer_id', user.id)
    .order('created_at', { ascending: false })

  // Mock data injection for prototype preview if no real orders exist
  if (!orders || orders.length === 0) {
     orders = [
        {
            id: 'ord_9f8b2c',
            status: 'Processing',
            total_amount: 14500,
            created_at: new Date().toISOString(),
            tracking_number: 'LX28-9938102',
            order_items: [
                {
                    quantity: 1,
                    unit_price: 14500,
                    products: { name: 'Rolex Submariner Date', images: ['https://images.unsplash.com/photo-1523170335258-f5ed11844a49?q=80&w=200&auto=format&fit=crop'] }
                }
            ]
        },
        {
            id: 'ord_3a1d9e',
            status: 'Delivered',
            total_amount: 85000,
            created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            tracking_number: 'LX28-1102934',
            order_items: [
                {
                    quantity: 1,
                    unit_price: 85000,
                    products: { name: 'Patek Philippe Nautilus', images: ['https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?q=80&w=200&auto=format&fit=crop'] }
                }
            ]
        }
     ] as any;
  }

  return (
    <div>
      <div className="mb-8 pb-4 border-b border-border">
        <h1 className="font-serif text-3xl">Order History</h1>
      </div>
      
      {orders.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border bg-background/30">
          <PackageX size={48} className="mx-auto text-muted-foreground/30 mb-4" />
          <h3 className="font-serif text-xl mb-2">No orders found</h3>
          <p className="text-muted-foreground text-sm">When you make a purchase, your orders will appear here.</p>
        </div>
      ) : (
        <OrderHistoryClient initialOrders={orders} />
      )}
    </div>
  )
}
