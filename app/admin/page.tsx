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
  const [
    { data: orders },
    { count: customerCount },
    { data: notifications }
  ] = await Promise.all([
    supabase.from('orders').select('total_amount, status, created_at'),
    supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'customer'),
    supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(5)
  ])

  return (
    <div className="space-y-8 pb-12">
      <RealtimeDashboard 
        initialOrders={orders || []} 
        initialCustomerCount={customerCount || 0} 
        initialNotifications={notifications || []}
      />
    </div>
  )
}
