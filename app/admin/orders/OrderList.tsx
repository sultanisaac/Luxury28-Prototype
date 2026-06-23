'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Eye, PackageSearch, Search, Undo2, X, Package, Truck, RefreshCcw } from 'lucide-react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
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
  const [loadingRefund, setLoadingRefund] = useState<string | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null)
  const supabase = createClient()

  const handleRefund = async (orderId: string) => {
    if (!window.confirm('Are you sure you want to refund this order? This action cannot be undone.')) return
    
    setLoadingRefund(orderId)
    const { processRefund } = await import('./actions')
    const result = await processRefund(orderId, 'Requested by Admin')
    
    if (result.success) {
      toast.success('Order refunded successfully')
    } else {
      toast.error('Refund failed: ' + result.error)
    }
    setLoadingRefund(null)
  }

  const [loadingVerify, setLoadingVerify] = useState<string | null>(null)
  
  const handleVerifyPayment = async (orderId: string) => {
    setLoadingVerify(orderId)
    const { verifyOrderPayment } = await import('@/app/staff/orders/actions')
    const result = await verifyOrderPayment(orderId)
    
    if (result.success) {
      toast.success(result.message || 'Payment verified!')
    } else {
      toast.error('Check failed: ' + result.error)
    }
    setLoadingVerify(null)
  }

  useEffect(() => {
    const channel = supabase
      .channel(`realtime-orders-${Math.random().toString(36).substring(7)}`)
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
              ),
              order_items (
                *,
                products (
                  name,
                  images
                )
              ),
              shipping_addresses (*)
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
                  <div className="flex items-center justify-end gap-2">
                    {order.status === 'Pending' && order.xendit_invoice_id && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-blue-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-xl"
                        onClick={() => handleVerifyPayment(order.id)}
                        disabled={loadingVerify === order.id}
                        title="Sync Payment Status"
                      >
                        <RefreshCcw size={16} className={loadingVerify === order.id ? 'animate-spin' : ''} />
                      </Button>
                    )}
                    {order.status !== 'Refunded' && order.status !== 'Pending' && order.xendit_invoice_id && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-amber-500 hover:text-amber-400 hover:bg-amber-500/10 rounded-xl"
                        onClick={() => handleRefund(order.id)}
                        disabled={loadingRefund === order.id}
                        title="Refund Order"
                      >
                        <Undo2 size={16} className={loadingRefund === order.id ? 'animate-spin' : ''} />
                      </Button>
                    )}
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-zinc-500 hover:text-white rounded-xl" 
                      title="View Details"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <Eye size={16} />
                    </Button>
                  </div>
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

      <AnimatePresence>
        {selectedOrder && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              onClick={() => setSelectedOrder(null)}
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-zinc-950 border-l border-zinc-800 shadow-2xl z-50 overflow-y-auto"
            >
              <div className="sticky top-0 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800 p-6 flex items-center justify-between z-10">
                <div>
                  <h2 className="text-xl font-serif text-white">Order Details</h2>
                  <p className="text-sm font-mono text-zinc-500 mt-1">ID: {selectedOrder.id}</p>
                </div>
                <button 
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 hover:bg-zinc-800 rounded-full transition-colors text-zinc-400 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-8">
                {/* Customer Info */}
                <div>
                  <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-4 border-b border-zinc-800 pb-2">Customer</h3>
                  <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800 space-y-2">
                    <p className="text-white font-medium">{selectedOrder.users?.first_name} {selectedOrder.users?.last_name}</p>
                    <p className="text-sm text-zinc-400">{selectedOrder.users?.email}</p>
                    {selectedOrder.shipping_addresses?.[0] && (
                      <div className="mt-4 pt-4 border-t border-zinc-800">
                        <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider mb-2">Shipping Address</p>
                        <p className="text-sm text-zinc-300">{selectedOrder.shipping_addresses[0].address_line1}</p>
                        {selectedOrder.shipping_addresses[0].address_line2 && <p className="text-sm text-zinc-300">{selectedOrder.shipping_addresses[0].address_line2}</p>}
                        <p className="text-sm text-zinc-300">
                          {selectedOrder.shipping_addresses[0].city}, {selectedOrder.shipping_addresses[0].state} {selectedOrder.shipping_addresses[0].postal_code}
                        </p>
                        <p className="text-sm text-zinc-300">{selectedOrder.shipping_addresses[0].country}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Tracking & Status */}
                <div>
                  <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-4 border-b border-zinc-800 pb-2">Fulfillment</h3>
                  <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-zinc-400">Current Status</span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-widest border ${getStatusStyle(selectedOrder.status)}`}>
                        {selectedOrder.status}
                      </span>
                    </div>
                    {selectedOrder.tracking_number && (
                      <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
                        <div className="flex items-center gap-2 text-sm text-zinc-400">
                          <Truck size={16} className="text-amber-500" />
                          <span>Tracking ({selectedOrder.courier_name || 'Courier'})</span>
                        </div>
                        <span className="font-mono text-sm text-amber-500">{selectedOrder.tracking_number}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Items */}
                <div>
                  <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-4 border-b border-zinc-800 pb-2 flex items-center gap-2">
                    <Package size={16} /> Order Items
                  </h3>
                  <div className="space-y-4">
                    {selectedOrder.order_items?.map((item: any) => (
                      <div key={item.id} className="flex gap-4 bg-zinc-900/50 p-3 rounded-xl border border-zinc-800/50">
                        <div className="w-16 h-16 bg-zinc-800 rounded-lg overflow-hidden flex-shrink-0">
                          {item.products?.images?.[0] ? (
                            <img src={item.products.images[0]} alt={item.products.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-600"><Package size={24} /></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">{item.products?.name}</p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-zinc-500">Qty: {item.quantity}</span>
                            <span className="text-sm font-mono text-zinc-300">${Number(item.price_at_time).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Payment Info */}
                <div className="pt-4 border-t border-zinc-800">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-500">Total Amount</span>
                    <span className="text-xl font-serif text-white">${Number(selectedOrder.total_amount).toLocaleString()}</span>
                  </div>
                  {selectedOrder.xendit_invoice_id && (
                    <div className="flex items-center justify-between text-xs mt-2">
                      <span className="text-zinc-600">Invoice Ref</span>
                      <span className="font-mono text-zinc-500">{selectedOrder.xendit_invoice_id}</span>
                    </div>
                  )}
                </div>
                
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
