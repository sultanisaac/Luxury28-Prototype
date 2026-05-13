import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import UserList from './UserList'

export default async function UsersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) notFound()

  // Verify Admin Role
  const { data: userData } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (userData?.role !== 'admin') notFound()
  
  const { data: users } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold font-serif tracking-wide text-white drop-shadow-md">User & Role Manager</h1>
        <p className="text-zinc-400 mt-2">Manage global permissions, staff roles, and customer profiles.</p>
      </div>

      <UserList users={users || []} />
    </div>
  )
}
