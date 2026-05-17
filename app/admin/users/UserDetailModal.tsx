'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  X, 
  Package, 
  CreditCard, 
  Clock, 
  MapPin, 
  Phone, 
  Mail,
  ExternalLink,
  Loader2
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface UserDetailModalProps {
  user: any
  isOpen: boolean
  onClose: () => void
}

export default function UserDetailModal({ user, isOpen, onClose }: UserDetailModalProps) {
  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState<any[]>([])
  const [totalSpent, setTotalSpent] = useState(0)
  const supabase = createClient()

  useEffect(() => {
    if (isOpen && user) {
      fetchUserData()
    }
  }, [isOpen, user])

  const fetchUserData = async () => {
    setLoading(true)
    try {
      // Fetch orders with items and product details
      const { data: ordersData, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            products (*)
          )
        `)
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      setOrders(ordersData || [])
      
      const spent = ordersData?.reduce((acc, order) => acc + Number(order.total_amount), 0) || 0
      setTotalSpent(spent)
    } catch (err) {
      console.error('Error fetching user details:', err)
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl lg:max-w-5xl w-[95vw] bg-zinc-950 border-zinc-800 text-white overflow-hidden p-0 gap-0">
        <DialogHeader className="p-8 border-b border-zinc-800 bg-zinc-900/50">
          <DialogTitle className="text-2xl font-serif flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center overflow-hidden">
              {user.avatar_url ? (
                <img src={user.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-amber-500 font-bold">{user.first_name?.[0]}{user.last_name?.[0]}</span>
              )}
            </div>
            <div>
              <span className="block">{user.first_name} {user.last_name}</span>
              <span className="text-xs text-zinc-500 font-mono tracking-widest uppercase font-bold">{user.role} Profile</span>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col md:flex-row h-[60vh]">
          {/* Left Sidebar - Summary */}
          <div className="w-full md:w-72 bg-zinc-900/30 p-8 border-b md:border-b-0 md:border-r border-zinc-800 space-y-8 overflow-y-auto">
            <div className="space-y-4">
              <h4 className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Contact Information</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-zinc-300">
                  <Mail size={14} className="text-amber-500" />
                  <span className="truncate">{user.email}</span>
                </div>
                {user.phone && (
                  <div className="flex items-center gap-3 text-sm text-zinc-300">
                    <Phone size={14} className="text-amber-500" />
                    <span>{user.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 text-sm text-zinc-300">
                  <Clock size={14} className="text-amber-500" />
                  <span>Joined {new Date(user.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-zinc-800 space-y-4">
              <h4 className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Financial Summary</h4>
              <div className="space-y-4">
                <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl">
                  <p className="text-[10px] text-zinc-500 uppercase font-bold">Total Spent</p>
                  <p className="text-2xl font-serif text-amber-500 mt-1">
                    ${totalSpent.toLocaleString()}
                  </p>
                </div>
                <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl">
                  <p className="text-[10px] text-zinc-500 uppercase font-bold">Order Count</p>
                  <p className="text-2xl font-serif text-white mt-1">
                    {orders.length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Area - Orders & Products */}
          <div className="flex-1 p-8 overflow-y-auto space-y-8">
            <div>
              <h4 className="text-sm font-bold text-white font-serif mb-4 flex items-center gap-2">
                <Package size={16} className="text-amber-500" />
                Purchase History
              </h4>
              
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 size={32} className="animate-spin text-amber-500" />
                </div>
              ) : orders.length > 0 ? (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="p-5 bg-zinc-900 border border-zinc-800/80 rounded-xl space-y-4 shadow-inner">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800/40">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-bold text-white font-mono">
                              Order #{order.id.slice(0, 8)}
                            </p>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] uppercase tracking-widest font-semibold border ${
                              order.status === 'Delivered' 
                              ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                            }`}>
                              {order.status}
                            </span>
                          </div>
                          <p className="text-[10px] text-zinc-500">{new Date(order.created_at).toLocaleDateString()}</p>
                        </div>
                        <p className="text-base font-serif text-amber-500 shrink-0">${Number(order.total_amount).toLocaleString()}</p>
                      </div>

                      <div className="space-y-3 pt-1">
                        {order.order_items.map((item: any) => (
                          <div key={item.id} className="flex items-center justify-between text-xs gap-4 py-1">
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <div className="w-10 h-10 bg-zinc-950 border border-zinc-800 rounded p-1 shrink-0 flex items-center justify-center">
                                {item.products.images?.[0] ? (
                                  <img src={item.products.images[0]} alt={item.products.name} className="w-full h-full object-contain" />
                                ) : (
                                  <Package size={14} className="text-zinc-700" />
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-zinc-300 font-medium truncate" title={item.products.name}>
                                  {item.products.name}
                                </p>
                                <p className="text-[10px] text-zinc-500 mt-0.5 font-medium">Qty: {item.quantity}</p>
                              </div>
                            </div>
                            <span className="text-zinc-400 font-mono shrink-0">${Number(item.unit_price).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-zinc-900/30 border border-dashed border-zinc-800 rounded-2xl">
                  <CreditCard size={32} className="mx-auto text-zinc-800 mb-3" />
                  <p className="text-sm text-zinc-500">No orders found for this user.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
