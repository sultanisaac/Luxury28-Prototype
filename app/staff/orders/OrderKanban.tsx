'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Package, Truck, CheckCircle, RefreshCcw, Box, ArrowRight, MapPin, Watch } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { updateOrderStatus, generateShippingLabel } from './actions'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Mail, Phone, ExternalLink } from 'lucide-react'

interface OrderKanbanProps {
  orders: any[]
}

const COLUMNS = [
  { id: 'Pending', label: 'Awaiting Payment', icon: Package, color: 'text-zinc-500', nextStatus: null },
  { id: 'Paid', label: 'New Orders (Paid)', icon: Package, color: 'text-amber-500', nextStatus: 'Processing' },
  { id: 'Processing', label: 'Processing', icon: RefreshCcw, color: 'text-blue-400', nextStatus: 'Packaging' },
  { id: 'Packaging', label: 'Packaging', icon: Box, color: 'text-purple-400', nextAction: 'ship' },
  { id: 'Shipped', label: 'Shipped', icon: Truck, color: 'text-emerald-400', nextStatus: null }
]

export default function OrderKanban({ orders: initialOrders }: OrderKanbanProps) {
  const [orders, setOrders] = useState(initialOrders)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const channel = supabase.channel('rt-kanban-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' },
        async () => {
          const { data } = await supabase
            .from('orders')
            .select(`
              *,
              customer:users!customer_id(first_name, last_name, email),
              address:shipping_addresses!shipping_address_id(*),
              order_items (
                *,
                products (
                  name,
                  ref_number
                )
              )
            `)
            .in('status', ['Pending', 'Paid', 'Processing', 'Packaging', 'Shipped'])
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
                <div 
                  key={order.id} 
                  onClick={() => setSelectedOrder(order)}
                  className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 shadow-xl hover:border-primary/50 cursor-pointer transition-all active:scale-[0.98]"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Order #{order.id.slice(0, 8)}</p>
                      <p className="text-[13px] font-bold text-white mt-1">
                        {order.customer?.first_name} {order.customer?.last_name}
                      </p>
                      <div className="flex items-center gap-1.5 mt-2 text-zinc-300">
                        <MapPin size={12} className="text-primary" />
                        <p className="text-[11px] font-medium truncate max-w-[200px]">
                          {order.address?.city || order.shipping_address || 'Address not set'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Product List */}
                  <div className="mt-3 space-y-1.5 border-t border-zinc-800 pt-3">
                    {order.order_items?.map((item: any) => (
                      <div key={item.id} className="flex items-start gap-2">
                        <Watch size={12} className="text-zinc-500 mt-0.5" />
                        <p className="text-[11px] text-zinc-300">
                          <span className="font-bold text-white">{item.quantity}x</span> {item.products?.name}
                        </p>
                      </div>
                    ))}
                  </div>
                  
                  {/* Logistics Info */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {order.courier_name && (
                      <div className="px-2 py-1 bg-zinc-900 border border-zinc-800 rounded flex items-center gap-1.5">
                        <Truck size={10} className="text-amber-500" />
                        <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-tighter">{order.courier_name}</p>
                      </div>
                    )}
                    {order.tracking_number && (
                      <div className="px-2 py-1 bg-blue-500/10 border border-blue-500/20 rounded flex items-center gap-1.5">
                        <div className="w-1 h-1 rounded-full bg-blue-400 animate-pulse" />
                        <p className="text-[9px] font-mono text-blue-400">{order.tracking_number}</p>
                      </div>
                    )}
                  </div>

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
      {/* Order Detail Modal */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl bg-zinc-950 border-zinc-800 text-white">
          <DialogHeader>
            <div className="flex items-center justify-between mb-2">
              <DialogTitle className="font-serif text-2xl">Order Details</DialogTitle>
              <Badge className={
                selectedOrder?.status === 'Paid' ? 'bg-amber-500/20 text-amber-500 border-amber-500/30' :
                selectedOrder?.status === 'Shipped' ? 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30' :
                'bg-zinc-800 text-zinc-400'
              }>
                {selectedOrder?.status}
              </Badge>
            </div>
            <DialogDescription className="text-zinc-500 font-mono text-xs">
              ID: {selectedOrder?.id}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
            {/* Customer & Shipping */}
            <div className="space-y-6">
              <section>
                <h4 className="text-[10px] uppercase tracking-widest text-primary font-bold mb-3">Customer Information</h4>
                <div className="space-y-2">
                  <p className="text-lg font-medium">{selectedOrder?.customer?.first_name} {selectedOrder?.customer?.last_name}</p>
                  <div className="flex items-center gap-2 text-zinc-400 text-sm">
                    <Mail size={14} /> {selectedOrder?.customer?.email}
                  </div>
                  {selectedOrder?.address?.phone && (
                    <div className="flex items-center gap-2 text-zinc-400 text-sm">
                      <Phone size={14} /> {selectedOrder?.address?.phone}
                    </div>
                  )}
                </div>
              </section>

              <section>
                <h4 className="text-[10px] uppercase tracking-widest text-primary font-bold mb-3">Shipping Address</h4>
                <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
                  <p className="text-sm leading-relaxed text-zinc-300">
                    <span className="text-white font-medium block mb-1">{selectedOrder?.address?.recipient_name}</span>
                    {selectedOrder?.address?.street_address}<br />
                    {selectedOrder?.address?.city}, {selectedOrder?.address?.province}<br />
                    {selectedOrder?.address?.postal_code}
                  </p>
                </div>
              </section>
            </div>

            {/* Items & Logistics */}
            <div className="space-y-6">
              <section>
                <h4 className="text-[10px] uppercase tracking-widest text-primary font-bold mb-3">Package Contents</h4>
                <div className="space-y-3">
                  {selectedOrder?.order_items?.map((item: any) => (
                    <div key={item.id} className="flex gap-3 p-3 bg-zinc-900/30 border border-zinc-800 rounded-lg">
                      <div className="w-10 h-10 bg-zinc-800 rounded flex items-center justify-center flex-shrink-0">
                        <Watch size={20} className="text-zinc-600" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{item.products?.name}</p>
                        <p className="text-[10px] text-zinc-500 font-mono">{item.products?.ref_number}</p>
                        <p className="text-xs text-primary mt-1">Quantity: {item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h4 className="text-[10px] uppercase tracking-widest text-primary font-bold mb-3">Logistics</h4>
                <div className="flex items-center justify-between p-3 bg-zinc-900/50 border border-zinc-800 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Truck size={16} className="text-amber-500" />
                    <div>
                      <p className="text-xs font-bold text-white uppercase">{selectedOrder?.courier_name || 'Not Selected'}</p>
                      <p className="text-[10px] text-zinc-500">Expedition Partner</p>
                    </div>
                  </div>
                  {selectedOrder?.tracking_number && (
                    <Button variant="ghost" size="sm" className="h-7 text-[10px] gap-1 text-primary hover:text-primary hover:bg-primary/10">
                      Track <ExternalLink size={10} />
                    </Button>
                  )}
                </div>
              </section>
            </div>
          </div>
          
          <div className="mt-8 pt-4 border-t border-zinc-800 flex justify-end">
             <Button 
               variant="outline" 
               className="border-zinc-800 text-zinc-400 hover:text-white"
               onClick={() => setSelectedOrder(null)}
             >
               Close Details
             </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
