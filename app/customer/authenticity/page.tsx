import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AuthenticityClient from './AuthenticityClient'

export default async function AuthenticityVaultPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch user's order IDs then get related authenticity records
  const { data: orders } = await supabase.from('orders').select('id').eq('customer_id', user.id)
  const orderIds = (orders || []).map(o => o.id)

  let records: any[] = []
  if (orderIds.length > 0) {
    const { data } = await supabase.from('authenticity_records').select('*, products(name)').in('order_id', orderIds)
    records = data || []
  }

  return <AuthenticityClient initialRecords={records} userId={user.id} />
}
