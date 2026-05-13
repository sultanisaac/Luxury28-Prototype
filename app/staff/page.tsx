import { createClient } from '@/lib/supabase/server'
import { 
  Package, 
  ShoppingCart, 
  MessageSquare, 
  AlertTriangle,
  Clock,
  Activity
} from 'lucide-react'
import Link from 'next/link'

export default async function StaffOverviewPage() {
  const supabase = await createClient()

  // Fetch KPIs in parallel
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

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Pending Orders', value: pendingOrders, icon: Clock, color: 'text-blue-400', link: '/staff/orders' },
          { label: 'To Ship Today', value: ordersToShip, icon: ShoppingCart, color: 'text-amber-500', link: '/staff/orders' },
          { label: 'Low Stock Alerts', value: lowStockCount, icon: AlertTriangle, color: 'text-red-400', link: '/staff/products' },
          { label: 'Unread Messages', value: unreadMessages, icon: MessageSquare, color: 'text-emerald-400', link: '/staff/support' },
        ].map((stat, i) => (
          <Link href={stat.link} key={i}>
            <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center gap-4 shadow-xl hover:bg-zinc-800/80 transition-colors cursor-pointer group">
              <div className={`p-4 rounded-xl bg-zinc-950 border border-zinc-800 group-hover:scale-110 transition-transform ${stat.color}`}>
                <stat.icon size={24} />
              </div>
              <div>
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{stat.label}</p>
                <p className="text-3xl font-bold text-white mt-1 font-serif">{stat.value}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity Feed */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-8 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl">
            <h2 className="text-xl font-bold text-white font-serif flex items-center gap-3 border-b border-zinc-800 pb-4 mb-6">
              <Activity className="text-blue-400" size={20} />
              Recent Global Activity
            </h2>
            
            <div className="space-y-6">
              {recentLogs.length > 0 ? (
                recentLogs.map((log, i) => (
                  <div key={i} className="flex gap-4 relative">
                    {i !== recentLogs.length - 1 && (
                      <div className="absolute left-2.5 top-8 bottom-[-24px] w-px bg-zinc-800"></div>
                    )}
                    <div className="w-5 h-5 rounded-full bg-blue-500/20 border border-blue-500/50 flex-shrink-0 mt-0.5 z-10"></div>
                    <div>
                      <p className="text-sm text-white font-medium">
                        <span className="text-blue-400 mr-2">{log.action_type.replace(/_/g, ' ')}</span>
                        {log.resource}
                      </p>
                      <p className="text-xs text-zinc-500 mt-1 font-mono">
                        {new Date(log.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-zinc-500 text-sm">No recent activity found.</p>
              )}
            </div>
          </div>
        </div>

        {/* Quick Links Sidebar */}
        <div className="space-y-6">
          <div className="p-8 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl">
            <h2 className="text-lg font-bold text-white font-serif border-b border-zinc-800 pb-4 mb-4">Quick Links</h2>
            <div className="space-y-3">
              <Link href="/staff/orders" className="flex items-center gap-3 text-sm text-zinc-400 hover:text-white p-2 hover:bg-zinc-800 rounded-lg transition-colors">
                <ShoppingCart size={16} className="text-blue-400" /> Print Shipping Labels
              </Link>
              <Link href="/staff/products" className="flex items-center gap-3 text-sm text-zinc-400 hover:text-white p-2 hover:bg-zinc-800 rounded-lg transition-colors">
                <Package size={16} className="text-blue-400" /> Update Inventory Count
              </Link>
              <Link href="/staff/support" className="flex items-center gap-3 text-sm text-zinc-400 hover:text-white p-2 hover:bg-zinc-800 rounded-lg transition-colors">
                <MessageSquare size={16} className="text-blue-400" /> Review Customer Complaints
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
