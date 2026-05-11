import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { 
  TrendingUp, 
  Users, 
  Package, 
  DollarSign, 
  AlertCircle,
  Clock,
  ArrowUpRight,
  Bell
} from 'lucide-react'
import Link from 'next/link'

export default async function AdminDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) notFound()

  // Verify Admin Role
  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (userData?.role !== 'admin') {
    notFound()
  }

  // Mock Overview Metrics
  const stats = [
    { name: 'Total Revenue', value: '$124,500', change: '+12.5%', icon: DollarSign, color: 'text-emerald-500' },
    { name: 'Active Orders', value: '45', change: '+5', icon: Package, color: 'text-amber-500' },
    { name: 'New Customers', value: '1,280', change: '+18%', icon: Users, color: 'text-blue-500' },
    { name: 'Growth Rate', value: '24%', change: '+4.2%', icon: TrendingUp, color: 'text-purple-500' },
  ]

  const recentNotifications = [
    { id: 1, title: 'New order received', description: 'ORD-2026-891 from John Smith', time: '2 mins ago', priority: 'high' },
    { id: 2, title: 'Low stock alert', description: 'Rolex Submariner (2 left)', time: '45 mins ago', priority: 'medium' },
    { id: 3, title: 'System update', description: 'Backend migration completed successfully', time: '2 hours ago', priority: 'low' },
  ]

  return (
    <div className="space-y-8 pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-serif tracking-wide text-white">Command Center</h1>
          <p className="text-zinc-400 mt-2">Executive overview of the Luxury28 ecosystem.</p>
        </div>
        <div className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 p-1 rounded-lg">
          <button className="px-4 py-2 text-sm font-medium bg-zinc-800 text-white rounded-md shadow-sm">Last 30 Days</button>
          <button className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors">Yearly</button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.name} className="p-6 bg-zinc-900 border border-zinc-800 rounded-xl shadow-lg group hover:border-amber-500/30 transition-all duration-300">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-2 bg-zinc-950 rounded-lg ${stat.color} border border-zinc-800/50 group-hover:scale-110 transition-transform`}>
                  <Icon size={20} />
                </div>
                <div className="flex items-center gap-1 text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded">
                  <ArrowUpRight size={10} />
                  {stat.change}
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-zinc-500">{stat.name}</p>
                <p className="text-2xl font-bold text-white tracking-tight">{stat.value}</p>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area: Trends Placeholder */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-xl h-[400px] flex flex-col items-center justify-center text-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(245,158,11,0.05),transparent)] pointer-events-none"></div>
            <div className="p-4 bg-zinc-950 rounded-full mb-4 border border-zinc-800 group-hover:scale-110 transition-transform duration-500">
              <TrendingUp size={32} className="text-amber-500" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2 font-serif tracking-wide">Revenue Insights</h2>
            <p className="text-zinc-500 max-w-sm mx-auto text-sm">
              Real-time visualization of sales volume and growth projections will be integrated here.
            </p>
            <div className="mt-8 flex gap-2">
              <div className="w-12 h-2 bg-zinc-800 rounded-full"></div>
              <div className="w-12 h-2 bg-amber-500 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.4)]"></div>
              <div className="w-12 h-2 bg-zinc-800 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Sidebar Area: Notifications */}
        <div className="space-y-6">
          <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-xl shadow-lg relative overflow-hidden h-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white flex items-center gap-2 font-serif">
                <Bell size={18} className="text-amber-500" />
                Notifications
              </h2>
              <span className="bg-amber-500 text-zinc-950 text-[10px] font-bold px-1.5 py-0.5 rounded-full">3 New</span>
            </div>

            <div className="space-y-4">
              {recentNotifications.map((notif) => (
                <div key={notif.id} className="p-4 bg-zinc-950 border border-zinc-800/50 rounded-lg hover:border-zinc-700 transition-colors relative group cursor-pointer">
                  {notif.priority === 'high' && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-red-500 rounded-r shadow-[0_0_10px_rgba(239,68,68,0.4)]"></div>
                  )}
                  <div className="space-y-1 ml-2">
                    <p className="text-sm font-semibold text-zinc-200 group-hover:text-amber-500 transition-colors">{notif.title}</p>
                    <p className="text-xs text-zinc-500 leading-relaxed">{notif.description}</p>
                    <div className="flex items-center gap-1 mt-2 text-[10px] text-zinc-600 font-medium">
                      <Clock size={10} />
                      {notif.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Link href="/admin/notifications" className="w-full mt-6 py-2.5 text-xs font-bold text-zinc-400 hover:text-white transition-colors uppercase tracking-widest border-t border-zinc-800/50 pt-6 text-center block">
              View All Alerts
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
