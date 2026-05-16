'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Package, Truck, CheckCircle, RefreshCcw, Box, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { updateOrderStatus, generateShippingLabel } from './actions'
import { toast } from 'sonner'

interface OrderKanbanProps {
  orders: any[]
}

const COLUMNS = [
  { id: 'Paid', label: 'New Orders (Paid)', icon: Package, color: 'text-amber-500', nextStatus: 'Processing' },
  { id: 'Processing', label: 'Processing', icon: RefreshCcw, color: 'text-blue-400', nextStatus: 'Packaging' },
  { id: 'Packaging', label: 'Packaging', icon: Box, color: 'text-purple-400', nextAction: 'ship' },
  { id: 'Shipped', label: 'Shipped', icon: Truck, color: 'text-emerald-400', nextStatus: null }
]

export default function OrderKanban({ orders: initialOrders }: OrderKanbanProps) {
  const [orders, setOrders] = useState(initialOrders)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const channel = supabase.channel('rt-kanban-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' },
        async () => {
          const { data } = await supabase
            .from('orders')
            .select('*')
            .in('status', ['Paid', 'Processing', 'Packaging', 'Shipped'])
            .order('created_at', { ascending: false })
          if (data) setOrders(data)
        }
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [supabase])

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setLoadingId(orderId)
    const result = await updateOrderStatus(orderId, newStatus)
    if (result.success) toast.success(`Order moved to ${newStatus}`)
    else toast.error('Error: ' + result.error)
    setLoadingId(null)
  }

  const handleShipping = async (orderId: string) => {
    setLoadingId(orderId)
    const result = await generateShippingLabel(orderId)
    if (result.success) {
      toast.success(`Shipping label generated: ${result.trackingNumber}`)
    } else {
      toast.error('Error: ' + result.error)
    }
    setLoadingId(null)
  }

  return (
    <div className="flex gap-6 overflow-x-auto pb-4 snap-x">
      {COLUMNS.map((col) => {
        const columnOrders = orders.filter(o => o.status === col.id)
        
        return (
          <div key={col.id} className="min-w-[300px] w-[350px] flex-shrink-0 bg-zinc-900/50 border border-zinc-800 rounded-2xl flex flex-col snap-start">
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900 rounded-t-2xl">
              <div className="flex items-center gap-2">
                <col.icon size={18} className={col.color} />
                <h3 className="font-bold text-white font-serif">{col.label}</h3>
              </div>
              <span className="text-xs font-bold text-zinc-500 bg-zinc-950 px-2 py-1 rounded-md border border-zinc-800">
                {columnOrders.length}
              </span>
            </div>
            
            <div className="p-4 flex-1 overflow-y-auto space-y-4">
              {columnOrders.map((order) => (
                <div key={order.id} className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 shadow-xl">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-xs font-mono text-zinc-500">#{order.id.slice(0, 8)}</p>
                      <p className="text-sm font-bold text-white mt-1">${order.total_amount?.toLocaleString()}</p>
                    </div>
                  </div>
                  
                  {order.tracking_number && (
                    <div className="mt-3 p-2 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-center gap-2">
                      <Truck size={14} className="text-blue-400" />
                      <p className="text-[10px] font-mono text-blue-400">{order.tracking_number}</p>
                    </div>
                  )}

                  <div className="mt-4 flex gap-2">
                    {col.nextStatus && (
                      <Button 
                        disabled={loadingId === order.id}
                        onClick={() => handleStatusChange(order.id, col.nextStatus!)}
                        className="w-full text-xs bg-zinc-800 hover:bg-blue-600 text-white font-bold py-1.5"
                      >
                        {loadingId === order.id ? 'Updating...' : `Move to ${col.nextStatus}`} <ArrowRight size={14} className="ml-1" />
                      </Button>
                    )}
                    {col.nextAction === 'ship' && (
                      <Button 
                        disabled={loadingId === order.id}
                        onClick={() => handleShipping(order.id)}
                        className="w-full text-xs bg-purple-500/20 hover:bg-purple-600 border border-purple-500/30 text-purple-300 hover:text-white font-bold py-1.5"
                      >
                        {loadingId === order.id ? 'Generating...' : 'Generate Label & Ship'}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              
              {columnOrders.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-zinc-600 text-sm">No orders in this stage.</p>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
