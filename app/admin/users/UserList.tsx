'use client'

import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { useEffect, useState } from 'react'
import { 
  Users, 
  ShieldCheck, 
  UserCircle, 
  Search, 
  MoreHorizontal, 
  Trash2, 
  UserCog
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { updateUserRole, deleteUserRecord } from './actions'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import UserDetailModal from './UserDetailModal'

interface UserListProps {
  users: any[]
}

export default function UserList({ users: initialUsers }: UserListProps) {
  const [users, setUsers] = useState(initialUsers)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const channelName = `realtime-users-${Math.random().toString(36).substring(7)}`
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'users' },
        async () => {
          const { data } = await supabase
            .from('admin_user_view')
            .select('*')
            .order('created_at', { ascending: false })
          if (data) setUsers(data)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  const filteredUsers = users.filter(user => 
    `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.id.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleRoleChange = async (userId: string, newRole: any) => {
    const result = await updateUserRole(userId, newRole)
    if (result.success) toast.success(`User promoted to ${newRole}`)
    else toast.error('Error: ' + result.error)
  }

  const handleDelete = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user record? This action is irreversible.')) return
    const result = await deleteUserRecord(userId)
    if (result.success) toast.success('User record deleted')
    else toast.error('Error: ' + result.error)
  }

  const roleStats = {
    admin: users.filter(u => u.role === 'admin').length,
    staff: users.filter(u => u.role === 'staff').length,
    customer: users.filter(u => u.role === 'customer').length,
  }

  return (
    <div className="space-y-8">
      {/* Role Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Administrators', count: roleStats.admin, icon: ShieldCheck, color: 'text-amber-500' },
          { label: 'Staff Members', count: roleStats.staff, icon: UserCog, color: 'text-blue-400' },
          { label: 'Active Customers', count: roleStats.customer, icon: UserCircle, color: 'text-emerald-400' },
        ].map((stat, i) => (
          <div key={i} className="p-6 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center gap-4 shadow-xl">
            <div className={`p-3 rounded-xl bg-zinc-950 border border-zinc-800 ${stat.color}`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{stat.label}</p>
              <p className="text-2xl font-bold text-white mt-1">{stat.count}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Users Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-x-auto shadow-2xl">
        <div className="p-6 border-b border-zinc-800 bg-zinc-900/50 flex flex-wrap gap-4 items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
            <input 
              type="text" 
              placeholder="Search by name or user ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-all"
            />
          </div>
          <Button variant="outline" className="border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-white">
            Export CSV
          </Button>
        </div>

        <Table>
          <TableHeader className="bg-zinc-950/30">
            <TableRow className="border-zinc-800 hover:bg-transparent">
              <TableHead className="px-6 py-4 text-zinc-500 font-bold uppercase tracking-tighter text-[10px]">User</TableHead>
              <TableHead className="px-6 py-4 text-zinc-500 font-bold uppercase tracking-tighter text-[10px]">Contact Info</TableHead>
              <TableHead className="px-6 py-4 text-zinc-500 font-bold uppercase tracking-tighter text-[10px]">Role</TableHead>
              <TableHead className="px-6 py-4 text-zinc-500 font-bold uppercase tracking-tighter text-[10px]">Joined Date</TableHead>
              <TableHead className="px-6 py-4 text-zinc-500 font-bold uppercase tracking-tighter text-[10px]">Status</TableHead>
              <TableHead className="px-6 py-4 text-right text-zinc-500 font-bold uppercase tracking-tighter text-[10px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow 
                key={user.id} 
                className="border-zinc-800 hover:bg-zinc-800/20 transition-colors cursor-pointer group"
                onClick={() => {
                  setSelectedUser(user)
                  setIsModalOpen(true)
                }}
              >
                <TableCell className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 font-bold overflow-hidden relative">
                      {user.avatar_url ? (
                        <img 
                          src={user.avatar_url} 
                          alt="" 
                          className="w-full h-full object-cover absolute inset-0 z-10" 
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            e.currentTarget.style.opacity = '0';
                            e.currentTarget.style.zIndex = '-1';
                          }}
                        />
                      ) : null}
                      <span className="z-0">
                        {user.first_name?.[0]}{user.last_name?.[0] || 'U'}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{user.first_name} {user.last_name}</p>
                      <p className="text-[10px] text-zinc-500 font-mono mt-0.5">{user.id.slice(0, 8)}...</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="px-6 py-4">
                  <div className="space-y-1">
                    <p className="text-xs text-zinc-300 flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-amber-500/50"></span>
                      {user.email}
                    </p>
                    {user.phone && (
                      <p className="text-[10px] text-zinc-500 flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-zinc-700"></span>
                        {user.phone}
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell className="px-6 py-4">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                    user.role === 'admin' 
                    ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' 
                    : user.role === 'staff'
                    ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                    : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                  }`}>
                    {user.role}
                  </span>
                </TableCell>
                <TableCell className="px-6 py-4 text-xs text-zinc-400">
                  {new Date(user.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                    <span className="text-[10px] text-zinc-400 font-medium">Active</span>
                  </div>
                </TableCell>
                <TableCell className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-zinc-500 hover:text-white rounded-xl">
                        <MoreHorizontal size={18} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800 text-white w-48">
                      <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-zinc-500">Modify Role</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => handleRoleChange(user.id, 'admin')} className="gap-2 focus:bg-amber-500/10 focus:text-amber-500">
                        <ShieldCheck size={16} /> Promote to Admin
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleRoleChange(user.id, 'staff')} className="gap-2 focus:bg-blue-500/10 focus:text-blue-400">
                        <UserCog size={16} /> Change to Staff
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleRoleChange(user.id, 'customer')} className="gap-2 focus:bg-zinc-800">
                        <UserCircle size={16} /> Demote to Customer
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-zinc-800" />
                      <DropdownMenuItem onClick={() => handleDelete(user.id)} className="gap-2 text-red-400 focus:bg-red-950/30 focus:text-red-400">
                        <Trash2 size={16} /> Delete Record
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {filteredUsers.length === 0 && (
          <div className="p-20 text-center">
            <Users size={40} className="mx-auto mb-4 text-zinc-800" />
            <p className="text-zinc-500">No users found matching your search.</p>
          </div>
        )}
      </div>

      <UserDetailModal 
        user={selectedUser}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  )
}
