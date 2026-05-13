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

  // Fetch Real Stats
  const { data: orders } = await supabase.from('orders').select('total_amount, status')
  const { count: customerCount } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'customer')
  
  const totalRevenue = orders?.filter(o => o.status !== 'Cancelled').reduce((acc, curr) => acc + Number(curr.total_amount), 0) || 0
  const activeOrdersCount = orders?.filter(o => ['Pending', 'Processing', 'Packaging', 'Shipped'].includes(o.status)).length || 0

  const stats = [
    { name: 'Total Revenue', value: `$${totalRevenue.toLocaleString()}`, change: '+12.5%', icon: DollarSign, color: 'text-emerald-500' },
    { name: 'Active Orders', value: activeOrdersCount.toString(), change: '+5', icon: Package, color: 'text-amber-500' },
    { name: 'Total Customers', value: (customerCount || 0).toLocaleString(), change: '+18%', icon: Users, color: 'text-blue-500' },
    { name: 'Conversion Rate', value: '3.2%', change: '+0.4%', icon: TrendingUp, color: 'text-purple-500' },
  ]

  const recentNotifications = [
    { id: 1, title: 'New order received', description: 'ORD-2026-891 from John Smith', time: '2 mins ago', priority: 'high' },
    { id: 2, title: 'Low stock alert', description: 'Rolex Submariner (2 left)', time: '45 mins ago', priority: 'medium' },
    { id: 3, title: 'Support message', description: 'New inquiry from Robert De Niro', time: '1 hour ago', priority: 'high' },
  ]

  return (
    <div className="space-y-8 pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-serif tracking-wide text-white drop-shadow-md">Executive Overview</h1>
          <p className="text-zinc-400 mt-2 flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            Real-time business performance for Luxury28.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 p-1 rounded-lg">
          <button className="px-4 py-2 text-sm font-medium bg-zinc-800 text-white rounded-md shadow-sm border border-zinc-700">30 Days</button>
          <button className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors">90 Days</button>
          <button className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors">All Time</button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.name} className="relative p-6 bg-zinc-900/40 border border-zinc-800 rounded-2xl shadow-xl group hover:border-amber-500/30 transition-all duration-500 backdrop-blur-sm overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Icon size={80} />
              </div>
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className={`p-2.5 bg-zinc-950 rounded-xl ${stat.color} border border-zinc-800 group-hover:scale-110 transition-transform duration-500`}>
                  <Icon size={20} />
                </div>
                <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-400/5 border border-emerald-400/20 px-2 py-0.5 rounded-full">
                  <ArrowUpRight size={10} />
                  {stat.change}
                </div>
              </div>
              <div className="space-y-1 relative z-10">
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{stat.name}</p>
                <p className="text-3xl font-bold text-white tracking-tight font-serif">{stat.value}</p>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area: Trends Placeholder */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-8 bg-zinc-900 border border-zinc-800 rounded-2xl h-[450px] flex flex-col relative overflow-hidden group shadow-2xl">
            <div className="flex items-center justify-between mb-8 relative z-10">
              <h2 className="text-xl font-bold text-white font-serif flex items-center gap-2">
                <TrendingUp size={20} className="text-amber-500" />
                Revenue Growth
              </h2>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5 text-zinc-400">
                  <span className="w-2.5 h-2.5 bg-amber-500 rounded-full"></span>
                  Current Period
                </div>
                <div className="flex items-center gap-1.5 text-zinc-400">
                  <span className="w-2.5 h-2.5 bg-zinc-700 rounded-full"></span>
                  Previous Period
                </div>
              </div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center text-center relative z-10">
              <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
                <DollarSign size={300} />
              </div>
              <div className="p-5 bg-zinc-950 rounded-full mb-6 border border-zinc-800 shadow-[0_0_50px_rgba(245,158,11,0.1)] group-hover:scale-105 transition-transform duration-700">
                <TrendingUp size={40} className="text-amber-500" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3 font-serif tracking-wide">Financial Intelligence</h3>
              <p className="text-zinc-400 max-w-sm mx-auto text-sm leading-relaxed">
                Advanced charting modules and revenue projections are currently being synchronized with your Stripe data.
              </p>
              <div className="mt-10 flex gap-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className={`w-1.5 rounded-full transition-all duration-700 ${i === 3 ? 'h-12 bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)]' : 'h-6 bg-zinc-800 group-hover:h-8'}`}></div>
                ))}
              </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-amber-500/[0.03] to-transparent pointer-events-none"></div>
          </div>
        </div>

        {/* Sidebar Area: Notifications */}
        <div className="space-y-6 flex flex-col">
          <div className="flex-1 p-6 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl relative overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-lg font-bold text-white flex items-center gap-2 font-serif">
                <Bell size={18} className="text-amber-500" />
                Critical Alerts
              </h2>
              <span className="bg-amber-500 text-zinc-950 text-[10px] font-bold px-2 py-0.5 rounded-full animate-bounce">3</span>
            </div>

            <div className="space-y-5 flex-1">
              {recentNotifications.map((notif) => (
                <div key={notif.id} className="group relative">
                  <div className="flex gap-4">
                    <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${notif.priority === 'high' ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.6)]' : 'bg-amber-500'}`}></div>
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-zinc-100 group-hover:text-amber-500 transition-colors">{notif.title}</p>
                      <p className="text-xs text-zinc-500 leading-relaxed line-clamp-2">{notif.description}</p>
                      <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-tighter pt-1">{notif.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Link href="/admin/notifications" className="mt-8 pt-6 border-t border-zinc-800/50 text-center">
              <span className="text-[10px] font-bold text-zinc-500 hover:text-white transition-colors uppercase tracking-[0.2em]">
                Explore All Intelligence
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
