import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Eye, PackageSearch } from 'lucide-react'

// Mock Data
const mockOrders = [
  { id: 'ORD-2026-891', customer: 'John Smith', items: 1, total: 14500, status: 'Paid', date: '2026-05-11' },
  { id: 'ORD-2026-890', customer: 'Alice Wong', items: 2, total: 52350, status: 'Processing', date: '2026-05-10' },
  { id: 'ORD-2026-889', customer: 'Robert Chen', items: 1, total: 7350, status: 'Shipped', date: '2026-05-09' },
]

export default async function OrdersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) notFound()

  // Verify Admin Role
  const { data: userData } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (userData?.role !== 'admin') notFound()

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Paid': return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
      case 'Processing': return 'bg-amber-500/10 text-amber-400 border-amber-500/20'
      case 'Shipped': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
      default: return 'bg-zinc-800 text-zinc-400 border-zinc-700'
    }
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-serif tracking-wide">Orders</h1>
          <p className="text-zinc-400 mt-2">View and manage global customer orders.</p>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-zinc-800 flex items-center gap-2 text-sm text-zinc-400">
          <PackageSearch size={16} className="text-amber-500" /> 3 Active Orders
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-400">
            <thead className="bg-zinc-950/50 border-b border-zinc-800 text-zinc-300 uppercase tracking-wider text-xs">
              <tr>
                <th className="px-6 py-4 font-medium">Order ID</th>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Items</th>
                <th className="px-6 py-4 font-medium">Total</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {mockOrders.map((order) => (
                <tr key={order.id} className="hover:bg-zinc-800/20 transition-colors">
                  <td className="px-6 py-4 font-mono text-zinc-300">{order.id}</td>
                  <td className="px-6 py-4 font-medium text-zinc-200">{order.customer}</td>
                  <td className="px-6 py-4">{order.items}</td>
                  <td className="px-6 py-4 font-mono text-zinc-300">${order.total.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusStyle(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" size="icon" className="text-zinc-500 hover:text-white">
                      <Eye size={16} />
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
