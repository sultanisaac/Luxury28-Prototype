'use client'

import { useEffect, useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  TrendingUp, 
  Users, 
  Package, 
  DollarSign, 
  ArrowUpRight,
  Bell
} from 'lucide-react'
import Link from 'next/link'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface DashboardStatsProps {
  initialOrders: any[]
  initialCustomerCount: number
  initialNotifications: any[]
}

export default function RealtimeDashboard({ 
  initialOrders, 
  initialCustomerCount,
  initialNotifications
}: DashboardStatsProps) {
  const [period, setPeriod] = useState<30 | 90 | 'all'>(30)
  const [orders, setOrders] = useState(initialOrders)
  const [customerCount, setCustomerCount] = useState(initialCustomerCount)
  const [notifications, setNotifications] = useState(initialNotifications)
  const supabase = createClient()

  useEffect(() => {
    // 1. Listen for Order changes
    const ordersChannelName = `admin-orders-${Math.random().toString(36).substring(7)}`
    const ordersChannel = supabase
      .channel(ordersChannelName)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        async (payload) => {
          // Re-fetch orders for simplicity and accuracy in totals
          const { data } = await supabase.from('orders').select('total_amount, status, created_at')
          if (data) setOrders(data)
        }
      )
      .subscribe()

    // 2. Listen for User changes (specifically customers)
    const usersChannelName = `admin-users-${Math.random().toString(36).substring(7)}`
    const usersChannel = supabase
      .channel(usersChannelName)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'users' },
        async () => {
          const { count } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true })
            .eq('role', 'customer')
          if (count !== null) setCustomerCount(count)
        }
      )
      .subscribe()

    // 3. Listen for Notifications
    const notificationsChannelName = `admin-notifications-${Math.random().toString(36).substring(7)}`
    const notificationsChannel = supabase
      .channel(notificationsChannelName)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications' },
        (payload) => {
          setNotifications(prev => [payload.new, ...prev].slice(0, 5))
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(ordersChannel)
      supabase.removeChannel(usersChannel)
      supabase.removeChannel(notificationsChannel)
    }
  }, [supabase])

  const filteredOrders = useMemo(() => {
    if (period === 'all') return orders;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - period);
    return orders.filter(o => new Date(o.created_at) >= cutoff);
  }, [orders, period]);

  const validOrders = filteredOrders.filter(o => o.status !== 'Cancelled')
  const totalRevenue = validOrders.reduce((acc, curr) => acc + Number(curr.total_amount), 0)
  
  const activeOrdersCount = filteredOrders
    .filter(o => ['Pending', 'Processing', 'Packaging', 'Shipped'].includes(o.status))
    .length

  const aov = validOrders.length > 0 ? totalRevenue / validOrders.length : 0

  const stats = [
    { name: 'Total Revenue', value: `$${totalRevenue.toLocaleString()}`, change: '+12.5%', icon: DollarSign, color: 'text-emerald-500' },
    { name: 'Active Orders', value: activeOrdersCount.toString(), change: '+5', icon: Package, color: 'text-amber-500' },
    { name: 'Total Customers', value: customerCount.toLocaleString(), change: '+18%', icon: Users, color: 'text-blue-500' },
    { name: 'Avg Order Value', value: `$${aov.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, change: '+4.1%', icon: TrendingUp, color: 'text-purple-500' },
  ]

  const chartData = useMemo(() => {
    const data = []
    if (period === 'all') {
      // aggregate by month for the last 12 months
      for (let i = 11; i >= 0; i--) {
        const d = new Date()
        d.setMonth(d.getMonth() - i)
        const monthStr = d.toISOString().slice(0, 7) // YYYY-MM
        const monthOrders = validOrders.filter(o => o.created_at && o.created_at.startsWith(monthStr))
        const revenue = monthOrders.reduce((sum, o) => sum + Number(o.total_amount), 0)
        data.push({
          name: d.toLocaleDateString('en-US', { month: 'short' }),
          revenue,
          orders: monthOrders.length
        })
      }
    } else {
      // aggregate by day based on period
      for (let i = period - 1; i >= 0; i--) {
        const d = new Date()
        d.setDate(d.getDate() - i)
        const dateStr = d.toISOString().split('T')[0]
        
        const dayOrders = validOrders.filter(o => o.created_at && o.created_at.startsWith(dateStr))
        const revenue = dayOrders.reduce((sum, o) => sum + Number(o.total_amount), 0)
        
        data.push({
          name: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          revenue,
          orders: dayOrders.length
        })
      }
    }
    return data
  }, [validOrders, period])

  return (
    <div className="space-y-8">
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
          <button 
            onClick={() => setPeriod(30)}
            className={`px-4 py-2 text-sm font-medium rounded-md shadow-sm transition-colors ${period === 30 ? 'bg-zinc-800 text-white border border-zinc-700' : 'text-zinc-400 hover:text-white'}`}
          >
            30 Days
          </button>
          <button 
            onClick={() => setPeriod(90)}
            className={`px-4 py-2 text-sm font-medium rounded-md shadow-sm transition-colors ${period === 90 ? 'bg-zinc-800 text-white border border-zinc-700' : 'text-zinc-400 hover:text-white'}`}
          >
            90 Days
          </button>
          <button 
            onClick={() => setPeriod('all')}
            className={`px-4 py-2 text-sm font-medium rounded-md shadow-sm transition-colors ${period === 'all' ? 'bg-zinc-800 text-white border border-zinc-700' : 'text-zinc-400 hover:text-white'}`}
          >
            All Time
          </button>
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
        <div className="lg:col-span-2 space-y-6">
          <div className="p-8 bg-zinc-900 border border-zinc-800 rounded-2xl h-[450px] flex flex-col relative overflow-hidden group shadow-2xl">
            <div className="flex items-center justify-between mb-8 relative z-10">
              <h2 className="text-xl font-bold text-white font-serif flex items-center gap-2">
                <TrendingUp size={20} className="text-amber-500" />
                Revenue Growth
              </h2>
              <div className="flex items-center gap-2 text-xs text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/20 animate-pulse">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                Live
              </div>
            </div>

            <div className="flex-1 flex flex-col w-full h-full relative z-10 pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    stroke="#52525b" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    dy={10}
                  />
                  <YAxis 
                    stroke="#52525b" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#fff', borderRadius: '8px' }}
                    itemStyle={{ color: '#f59e0b' }}
                    formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#f59e0b" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorRevenue)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-amber-500/[0.03] to-transparent pointer-events-none"></div>
          </div>
        </div>

        <div className="space-y-6 flex flex-col">
          <div className="flex-1 p-6 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl relative overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-lg font-bold text-white flex items-center gap-2 font-serif">
                <Bell size={18} className="text-amber-500" />
                Live Alerts
              </h2>
              {notifications.length > 0 && (
                <span className="bg-amber-500 text-zinc-950 text-[10px] font-bold px-2 py-0.5 rounded-full animate-bounce">
                  {notifications.length}
                </span>
              )}
            </div>

            <div className="space-y-5 flex-1">
              {notifications.length > 0 ? (
                notifications.map((notif: any) => (
                  <div key={notif.id} className="group relative">
                    <div className="flex gap-4">
                      <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${notif.priority === 'high' ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.6)]' : 'bg-amber-500'}`}></div>
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-zinc-100 group-hover:text-amber-500 transition-colors">{notif.title}</p>
                        <p className="text-xs text-zinc-500 leading-relaxed line-clamp-2">{notif.description}</p>
                        <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-tighter pt-1">
                          {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-zinc-600 space-y-2">
                  <Bell size={32} strokeWidth={1} />
                  <p className="text-xs font-medium uppercase tracking-widest">No active alerts</p>
                </div>
              )}
            </div>

            <Link href="/admin/notifications" className="mt-8 pt-6 border-t border-zinc-800/50 text-center">
              <span className="text-[10px] font-bold text-zinc-500 hover:text-white transition-colors uppercase tracking-[0.2em]">
                View All Notifications
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
