'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Search, Users, Mail, Phone, Clock } from 'lucide-react'
import UserDetailModal from '@/app/admin/users/UserDetailModal'

interface CustomerListProps {
  customers: any[]
}

export default function CustomerList({ customers: initialCustomers }: CustomerListProps) {
  const [customers, setCustomers] = useState(initialCustomers)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const channel = supabase.channel(`rt-staff-customers-${Math.random().toString(36).substring(7)}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users', filter: 'role=eq.customer' },
        async () => {
          const { data } = await supabase
            .from('admin_user_view')
            .select('*')
            .eq('role', 'customer')
            .order('created_at', { ascending: false })
          if (data) setCustomers(data)
        }
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [supabase])

  const filtered = customers.filter(c =>
    `${c.first_name} ${c.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center gap-4">
        <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-blue-400">
          <Users size={24} />
        </div>
        <div>
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Total Customers</p>
          <p className="text-2xl font-bold text-white mt-1 font-serif">{customers.length}</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-blue-400/50 transition-all"
        />
      </div>

      {/* Customer Grid */}
      {filtered.length === 0 ? (
        <div className="p-20 text-center bg-zinc-900/50 border border-dashed border-zinc-800 rounded-2xl">
          <Users size={40} className="mx-auto mb-4 text-zinc-700" />
          <p className="text-zinc-500">No customers found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((customer) => (
            <div
              key={customer.id}
              onClick={() => { setSelectedUser(customer); setIsModalOpen(true) }}
              className="p-5 bg-zinc-900 border border-zinc-800 rounded-2xl hover:border-blue-400/30 hover:bg-zinc-800/30 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-zinc-400 overflow-hidden flex-shrink-0">
                  {customer.avatar_url ? (
                    <img src={customer.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <>{customer.first_name?.[0]}{customer.last_name?.[0] || '?'}</>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors truncate">
                    {customer.first_name} {customer.last_name}
                  </p>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">{customer.role}</p>
                </div>
              </div>

              <div className="space-y-2 pt-4 border-t border-zinc-800/50">
                <div className="flex items-center gap-2 text-xs text-zinc-400">
                  <Mail size={12} className="text-blue-400 flex-shrink-0" />
                  <span className="truncate">{customer.email}</span>
                </div>
                {customer.phone && (
                  <div className="flex items-center gap-2 text-xs text-zinc-400">
                    <Phone size={12} className="text-blue-400 flex-shrink-0" />
                    <span>{customer.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-xs text-zinc-500">
                  <Clock size={12} className="flex-shrink-0" />
                  <span>Joined {new Date(customer.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <UserDetailModal
        user={selectedUser}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  )
}
