'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Eye, PackageSearch, Search } from 'lucide-react'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'

interface OrderListProps {
  initialOrders: any[]
}

export default function OrderList({ initialOrders }: OrderListProps) {
  const [orders, setOrders] = useState(initialOrders)
  const [searchTerm, setSearchTerm] = useState('')
  const supabase = createClient()

  useEffect(() => {
    const channel = supabase
      .channel('realtime-orders')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        async () => {
          const { data } = await supabase
            .from('orders')
            .select(`
              *,
              users (
                first_name,
                last_name,
                email
              )
            `)
            .order('created_at', { ascending: false })
          if (data) setOrders(data)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Paid': return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
      case 'Processing': return 'bg-amber-500/10 text-amber-400 border-amber-500/20'
      case 'Shipped': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
      case 'Delivered': return 'bg-zinc-100 text-zinc-950 border-white'
      case 'Cancelled': return 'bg-red-500/10 text-red-400 border-red-500/20'
      default: return 'bg-zinc-800 text-zinc-400 border-zinc-700'
    }
  }

  const filteredOrders = orders.filter(order => 
    order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${order.users?.first_name} ${order.users?.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
          <input 
            type="text" 
            placeholder="Search by Order ID or Customer..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-all shadow-lg"
          />
        </div>
        <div className="flex items-center gap-2 text-xs text-emerald-500 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20 animate-pulse">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
          Live Order Stream
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
        <Table>
          <TableHeader className="bg-zinc-950/30">
            <TableRow className="border-zinc-800 hover:bg-transparent">
              <TableHead className="px-6 py-4 text-zinc-500 font-bold uppercase tracking-tighter text-[10px]">Order ID</TableHead>
              <TableHead className="px-6 py-4 text-zinc-500 font-bold uppercase tracking-tighter text-[10px]">Customer</TableHead>
              <TableHead className="px-6 py-4 text-zinc-500 font-bold uppercase tracking-tighter text-[10px]">Total</TableHead>
              <TableHead className="px-6 py-4 text-zinc-500 font-bold uppercase tracking-tighter text-[10px]">Status</TableHead>
              <TableHead className="px-6 py-4 text-zinc-500 font-bold uppercase tracking-tighter text-[10px]">Date</TableHead>
              <TableHead className="px-6 py-4 text-right text-zinc-500 font-bold uppercase tracking-tighter text-[10px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.map((order) => (
              <TableRow key={order.id} className="border-zinc-800 hover:bg-zinc-800/20 transition-colors">
                <TableCell className="px-6 py-4 font-mono text-xs text-zinc-300">
                  {order.id.slice(0, 8).toUpperCase()}
                </TableCell>
                <TableCell className="px-6 py-4">
                  <div>
                    <p className="text-sm font-bold text-white">
                      {order.users?.first_name} {order.users?.last_name}
                    </p>
                    <p className="text-[10px] text-zinc-500">{order.users?.email}</p>
                  </div>
                </TableCell>
                <TableCell className="px-6 py-4 font-mono text-white font-bold">
                  ${Number(order.total_amount).toLocaleString()}
                </TableCell>
                <TableCell className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${getStatusStyle(order.status)}`}>
                    {order.status}
                  </span>
                </TableCell>
                <TableCell className="px-6 py-4 text-xs text-zinc-500">
                  {new Date(order.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell className="px-6 py-4 text-right">
                  <Button variant="ghost" size="icon" className="text-zinc-500 hover:text-white rounded-xl">
                    <Eye size={16} />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {filteredOrders.length === 0 && (
          <div className="p-20 text-center">
            <PackageSearch size={40} className="mx-auto mb-4 text-zinc-800" />
            <p className="text-zinc-500 font-serif">No orders found.</p>
          </div>
        )}
      </div>
    </div>
  )
}
