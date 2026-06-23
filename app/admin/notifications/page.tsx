import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import NotificationList from './NotificationList'

export default async function NotificationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) notFound()

  // Parallel Fetch for Role Verification and Hydration
  const [userDataRes, notificationsRes] = await Promise.all([
    supabase.from('users').select('role').eq('id', user.id).single(),
    supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)
  ])

  if (userDataRes.data?.role !== 'admin') notFound()
  const notifications = notificationsRes.data;

  return (
    <div className="pb-12">
      <NotificationList initialNotifications={notifications || []} />
    </div>
  )
}
