'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Package, Truck, RefreshCw } from 'lucide-react'

export default function OrderHistoryClient({ initialOrders, userId }: { initialOrders: any[], userId: string }) {
  const supabase = createClient()
  const [orders, setOrders] = useState(initialOrders)
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null)

  // Real-time sync
  useEffect(() => {
    const channel = supabase.channel('rt-customer-orders')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'orders', filter: `customer_id=eq.${userId}` },
        async () => {
          const { data } = await supabase
            .from('orders')
            .select('*, order_items(*, products(name, images))')
            .eq('customer_id', userId)
            .order('created_at', { ascending: false })
          if (data) setOrders(data)
        }
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [supabase, userId])

  // Keep selected order in sync when orders update
  useEffect(() => {
    if (selectedOrder) {
      const updated = orders.find(o => o.id === selectedOrder.id)
      if (updated) setSelectedOrder(updated)
    }
  }, [orders])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered': return 'text-green-400 border-green-400/20 bg-green-400/10'
      case 'Shipped': return 'text-blue-400 border-blue-400/20 bg-blue-400/10'
      case 'Packaging': return 'text-purple-400 border-purple-400/20 bg-purple-400/10'
      case 'Processing': return 'text-amber-400 border-amber-400/20 bg-amber-400/10'
      case 'Paid': return 'text-emerald-400 border-emerald-400/20 bg-emerald-400/10'
      default: return 'text-zinc-400 border-zinc-800 bg-zinc-900'
    }
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-16 border border-dashed border-border bg-background/30">
        <Package size={48} className="mx-auto text-muted-foreground/30 mb-4" />
        <h3 className="font-serif text-xl mb-2">No orders yet</h3>
        <p className="text-muted-foreground text-sm">Your purchase history will appear here.</p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order.id}
            onClick={() => setSelectedOrder(order)}
            className="border border-border p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 cursor-pointer hover:border-primary/50 transition-colors bg-background/30 hover:bg-background/80"
          >
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-[#111] flex items-center justify-center border border-border flex-shrink-0">
                <Package className="text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Order #{order.id.split('-')[0]}</p>
                <h3 className="font-serif text-lg">{new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</h3>
                <p className="text-primary font-medium mt-1">${order.total_amount?.toLocaleString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex flex-col items-end gap-2">
                <span className={`text-xs uppercase tracking-widest px-3 py-1 border ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
                {order.tracking_number && (
                  <span className="text-xs text-primary font-mono bg-primary/10 px-2 py-1 rounded flex items-center gap-1.5 border border-primary/20">
                    <Truck size={12} />
                    {order.courier_name ? <span className="font-bold font-sans uppercase tracking-widest">{order.courier_name.split(' ')[0]}</span> : null}
                    {order.tracking_number}
                  </span>
                )}
              </div>
              <span className="text-xs uppercase tracking-widest text-primary hover:underline hidden sm:inline-block">View Details →</span>
            </div>
          </div>
        ))}
      </div>

      {/* Slide-out Panel */}
      <AnimatePresence>
        {selectedOrder && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full sm:w-[500px] bg-background border-l border-border z-[101] shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between p-6 border-b border-border bg-[#050505]">
                <div>
                  <h2 className="font-serif text-2xl text-primary mb-1">Order Details</h2>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">#{selectedOrder.id}</p>
                </div>
                <button onClick={() => setSelectedOrder(null)} className="text-muted-foreground hover:text-white transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                {/* Status & Tracking */}
                <div className="bg-card border border-border p-5">
                  <h4 className="text-xs uppercase tracking-widest text-muted-foreground mb-4">Fulfillment Status</h4>
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <span className={`text-xs uppercase tracking-widest px-3 py-1 border ${getStatusColor(selectedOrder.status)}`}>
                      {selectedOrder.status}
                    </span>
                    {selectedOrder.tracking_number && (
                      <div className="flex items-center gap-2 text-sm text-primary">
                        <Truck size={16} />
                        {selectedOrder.courier_name && (
                           <span className="font-bold uppercase tracking-widest text-xs text-foreground mr-1">
                             {selectedOrder.courier_name.split(' ')[0]}
                           </span>
                        )}
                        <span className="underline cursor-pointer font-mono">{selectedOrder.tracking_number}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Items */}
                <div>
                  <h4 className="text-xs uppercase tracking-widest text-muted-foreground mb-4">Purchased Items</h4>
                  <div className="space-y-4">
                    {selectedOrder.order_items?.map((item: any, i: number) => (
                      <div key={i} className="flex gap-4 border-b border-border/50 pb-4 last:border-0 last:pb-0">
                        <div className="w-20 h-20 bg-[#111] overflow-hidden flex-shrink-0 border border-border">
                          {item.products?.images?.[0] ? (
                            <img src={item.products.images[0]} alt={item.products.name} className="object-cover w-full h-full opacity-80" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground/30"><Package /></div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-serif text-sm">{item.products?.name || 'Unknown Product'}</h3>
                          <p className="text-xs text-muted-foreground mt-1 uppercase tracking-widest">Qty: {item.quantity}</p>
                          <p className="text-primary font-medium tracking-wider text-sm mt-2">${item.unit_price?.toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Summary */}
                <div className="pt-6 border-t border-border space-y-3 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span className="uppercase tracking-widest text-xs">Subtotal</span>
                    <span>${selectedOrder.total_amount?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span className="uppercase tracking-widest text-xs">Shipping</span>
                    <span>$0</span>
                  </div>
                  <div className="flex justify-between text-white font-medium text-lg pt-4 mt-2 border-t border-border/50">
                    <span className="font-serif">Total</span>
                    <span className="text-primary">${selectedOrder.total_amount?.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
