import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import CustomerList from './CustomerList'

export default async function StaffCustomersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) notFound()

  // Verify staff or admin role
  const { data: userData } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (!userData || (userData.role !== 'staff' && userData.role !== 'admin')) notFound()

  // Fetch ONLY customers — never admin or staff
  const { data: customers } = await supabase
    .from('admin_user_view')
    .select('*')
    .eq('role', 'customer')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold font-serif tracking-wide text-white drop-shadow-md">Customer Directory</h1>
        <p className="text-zinc-400 mt-2">View customer profiles and purchase history for support purposes. Read-only access.</p>
      </div>
      <CustomerList customers={customers || []} />
    </div>
  )
}
