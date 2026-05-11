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

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 text-amber-500 text-xs font-medium rounded-full uppercase tracking-wider"><Star size={12} /> Admin</span>
      case 'staff':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-zinc-300/10 text-zinc-300 text-xs font-medium rounded-full uppercase tracking-wider"><Shield size={12} /> Staff</span>
      default:
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-zinc-800 text-zinc-400 text-xs font-medium rounded-full uppercase tracking-wider"><User size={12} /> Customer</span>
    }
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-serif tracking-wide">Users & Roles</h1>
          <p className="text-zinc-400 mt-2">Manage platform access and assign staff privileges.</p>
        </div>
        <Button className="bg-amber-600 hover:bg-amber-700 text-white">Invite User</Button>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-400">
            <thead className="bg-zinc-950/50 border-b border-zinc-800 text-zinc-300 uppercase tracking-wider text-xs">
              <tr>
                <th className="px-6 py-4 font-medium">User</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium">Joined</th>
                <th className="px-6 py-4 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {mockUsers.map((u) => (
                <tr key={u.id} className="hover:bg-zinc-800/20 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-serif text-zinc-400">
                        {u.first_name[0]}{u.last_name[0]}
                      </div>
                      <div>
                        <div className="font-medium text-zinc-200">{u.first_name} {u.last_name}</div>
                        <div className="text-xs text-zinc-500">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getRoleBadge(u.role)}
                  </td>
                  <td className="px-6 py-4">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" size="icon" className="text-zinc-500 hover:text-white">
                      <MoreHorizontal size={16} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
