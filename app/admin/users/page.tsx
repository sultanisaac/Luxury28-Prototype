import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { MoreHorizontal, Shield, User, Star } from 'lucide-react'

// Mock Data
const mockUsers = [
  { id: '1', email: 'sultan.admin@luxury28.com', first_name: 'Sultan', last_name: 'Admin', role: 'admin', created_at: '2023-10-12T10:00:00Z' },
  { id: '2', email: 'staff1@luxury28.com', first_name: 'Jane', last_name: 'Doe', role: 'staff', created_at: '2023-11-05T14:30:00Z' },
  { id: '3', email: 'john.smith@example.com', first_name: 'John', last_name: 'Smith', role: 'customer', created_at: '2024-01-20T09:15:00Z' },
  { id: '4', email: 'alice.wong@example.com', first_name: 'Alice', last_name: 'Wong', role: 'customer', created_at: '2024-02-14T16:45:00Z' },
  { id: '5', email: 'robert.chen@example.com', first_name: 'Robert', last_name: 'Chen', role: 'customer', created_at: '2024-03-01T11:20:00Z' },
]

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
