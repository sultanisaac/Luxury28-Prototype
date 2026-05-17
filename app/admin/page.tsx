import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import RealtimeDashboard from '@/components/admin/realtime-dashboard'

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

  // Initial Fetch for Stats (Hydration)
  const { data: orders } = await supabase.from('orders').select('total_amount, status, created_at')
  const { count: customerCount } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'customer')
  
  const { data: notifications } = await supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5)

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

      <RealtimeDashboard 
        initialOrders={orders || []} 
        initialCustomerCount={customerCount || 0} 
        initialNotifications={notifications || []}
      />
    </div>
  )
}
