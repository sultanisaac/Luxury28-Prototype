import { createClient } from '@/lib/supabase/server'
import StaffOverviewClient from './StaffOverviewClient'

export default async function StaffOverviewPage() {
  const supabase = await createClient()

  const [ordersRes, productsRes, inquiriesRes, logsRes] = await Promise.all([
    supabase.from('orders').select('status'),
    supabase.from('products').select('stock_quantity').lt('stock_quantity', 5),
    supabase.from('contact_inquiries').select('status').eq('status', 'unread'),
    supabase.from('audit_logs').select('action_type, resource, created_at').order('created_at', { ascending: false }).limit(5)
  ])

  const pendingOrders = ordersRes.data?.filter(o => o.status === 'Pending').length || 0
  const ordersToShip = ordersRes.data?.filter(o => o.status === 'Packaging' || o.status === 'Processing').length || 0
  const lowStockCount = productsRes.data?.length || 0
  const unreadMessages = inquiriesRes.data?.length || 0
  const recentLogs = logsRes.data || []

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold font-serif tracking-wide text-white drop-shadow-md">Operations Overview</h1>
        <p className="text-zinc-400 mt-2">Your daily operational summary and urgent tasks.</p>
      </div>
      <StaffOverviewClient
        initialPendingOrders={pendingOrders}
        initialOrdersToShip={ordersToShip}
        initialLowStockCount={lowStockCount}
        initialUnreadMessages={unreadMessages}
        initialRecentLogs={recentLogs}
      />
    </div>
  )
}
