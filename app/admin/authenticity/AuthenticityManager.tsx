'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Shield, Ban, CheckCircle, User, Eye, Package } from 'lucide-react'
import { toast } from 'sonner'
import { issueSerialNumber, revokeSerialNumber } from './actions'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface AuthenticityManagerProps {
  initialRecords: any[]
  products?: any[]
  orders?: any[]
  readOnly?: boolean
}

export default function AuthenticityManager({ initialRecords, products = [], orders = [], readOnly = false }: AuthenticityManagerProps) {
  const [records, setRecords] = useState(initialRecords)
  const [searchTerm, setSearchTerm] = useState('')
  
  // Issue Modal State
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false)
  const [selectedOrderId, setSelectedOrderId] = useState<string>('')
  const [selectedProductId, setSelectedProductId] = useState<string>('')
  const [serialNumber, setSerialNumber] = useState('')
  const [isIssuing, setIsIssuing] = useState(false)
  const [isRevoking, setIsRevoking] = useState<string | null>(null)

  // Find the selected order to filter products in it
  const selectedOrder = orders.find(o => o.id === selectedOrderId)
  
  // Filter products based on selected order
  const filteredProductsForIssue = selectedOrder
    ? selectedOrder.order_items.map((item: any) => ({
        id: item.product_id,
        name: item.products?.name || 'Unknown Product'
      }))
    : products

  const handleOrderChange = (orderId: string) => {
    setSelectedOrderId(orderId)
    // Auto-select product if there's only one in the order
    const order = orders.find(o => o.id === orderId)
    if (order && order.order_items.length === 1) {
      setSelectedProductId(order.order_items[0].product_id)
    } else {
      setSelectedProductId('')
    }
  }

  const handleIssue = async () => {
    if (!selectedOrderId) {
      toast.error('Please select an order to link the authenticity certificate')
      return
    }
    if (!selectedProductId) {
      toast.error('Please select a product')
      return
    }
    if (!serialNumber.trim()) {
      toast.error('Please enter a serial number')
      return
    }

    setIsIssuing(true)
    const res = await issueSerialNumber(selectedProductId, selectedOrderId, serialNumber)
    if (res.success) {
      toast.success('Serial number issued successfully')
      setIsIssueModalOpen(false)
      setSerialNumber('')
      setSelectedProductId('')
      setSelectedOrderId('')
      window.location.reload()
    } else {
      toast.error('Failed to issue: ' + res.error)
    }
    setIsIssuing(false)
  }

  const handleRevoke = async (id: string) => {
    if (!window.confirm('Are you sure you want to revoke this serial number? This indicates the item is no longer authentic or has been flagged.')) return
    
    setIsRevoking(id)
    const res = await revokeSerialNumber(id)
    if (res.success) {
      toast.success('Record revoked')
      setRecords(records.map(r => r.id === id ? { ...r, status: 'revoked' } : r))
    } else {
      toast.error('Failed to revoke: ' + res.error)
    }
    setIsRevoking(null)
  }

  const filteredRecords = records.filter(record => 
    record.serial_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.products?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (record.orders?.users?.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
          <input 
            type="text" 
            placeholder="Search Serial Number, Product, or Customer..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-all shadow-lg"
          />
        </div>
        {!readOnly && (
          <Dialog open={isIssueModalOpen} onOpenChange={setIsIssueModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg w-full md:w-auto font-bold tracking-wide">
                <Shield size={16} className="mr-2" />
                Issue New Authenticity
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-zinc-950 border-zinc-800 text-white sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="font-serif text-xl tracking-wide">Issue Serial Number</DialogTitle>
              </DialogHeader>
            <div className="space-y-6 pt-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Select Paid Order</label>
                <Select value={selectedOrderId} onValueChange={handleOrderChange}>
                  <SelectTrigger className="w-full bg-zinc-900 border-zinc-800 focus:ring-emerald-500/50">
                    <SelectValue placeholder="Select an order" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800 text-white max-h-60">
                    {orders.map(o => {
                      const userStr = o.users
                        ? `${o.users.first_name || ''} ${o.users.last_name || ''} (${o.users.email})`
                        : `Order #${o.id.substring(0, 8)}`;
                      const dateStr = new Date(o.created_at).toLocaleDateString();
                      return (
                        <SelectItem key={o.id} value={o.id} className="hover:bg-zinc-800 focus:bg-zinc-800 text-xs">
                          {userStr} - ${parseFloat(o.total_amount).toLocaleString()} ({dateStr})
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Product</label>
                <Select 
                  value={selectedProductId} 
                  onValueChange={setSelectedProductId}
                  disabled={!selectedOrderId}
                >
                  <SelectTrigger className="w-full bg-zinc-900 border-zinc-800 focus:ring-emerald-500/50 disabled:opacity-50">
                    <SelectValue placeholder={selectedOrderId ? "Select product in this order" : "First, select an order"} />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800 text-white max-h-60">
                    {filteredProductsForIssue.map((p: any) => (
                      <SelectItem key={p.id} value={p.id} className="hover:bg-zinc-800 focus:bg-zinc-800">
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Serial Number</label>
                <Input 
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value.toUpperCase())}
                  placeholder="e.g. LUX-28-001X9"
                  className="bg-zinc-900 border-zinc-800 text-white focus:border-emerald-500/50 uppercase font-mono"
                />
              </div>

              <Button 
                onClick={handleIssue} 
                disabled={isIssuing}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold tracking-widest mt-2"
              >
                {isIssuing ? 'Issuing...' : 'Register Authenticity'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        )}
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-x-auto shadow-2xl">
        <Table>
          <TableHeader className="bg-zinc-950/30">
            <TableRow className="border-zinc-800 hover:bg-transparent">
              <TableHead className="px-6 py-4 text-zinc-500 font-bold uppercase tracking-tighter text-[10px]">Serial Number</TableHead>
              <TableHead className="px-6 py-4 text-zinc-500 font-bold uppercase tracking-tighter text-[10px]">Product</TableHead>
              <TableHead className="px-6 py-4 text-zinc-500 font-bold uppercase tracking-tighter text-[10px]">Customer / Owner</TableHead>
              <TableHead className="px-6 py-4 text-zinc-500 font-bold uppercase tracking-tighter text-[10px]">Status</TableHead>
              <TableHead className="px-6 py-4 text-zinc-500 font-bold uppercase tracking-tighter text-[10px]">Issued On</TableHead>
              <TableHead className="px-6 py-4 text-right text-zinc-500 font-bold uppercase tracking-tighter text-[10px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRecords.map((record) => {
              const customerName = record.orders?.users
                ? `${record.orders.users.first_name || ''} ${record.orders.users.last_name || ''}`.trim() || record.orders.users.email
                : 'Inventory / Standalone';
              const customerEmail = record.orders?.users?.email;

              return (
                <TableRow key={record.id} className="border-zinc-800 hover:bg-zinc-800/20 transition-colors">
                  <TableCell className="px-6 py-4 font-mono font-bold text-sm text-white">
                    {record.serial_number}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-sm text-zinc-300 flex items-center gap-3">
                    {record.products?.images?.[0] && (
                      <div className="w-8 h-8 rounded bg-zinc-800 overflow-hidden flex-shrink-0">
                        <img src={record.products.images[0]} alt={record.products.name} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <span>{record.products?.name}</span>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-white flex items-center gap-1.5">
                        <User size={13} className="text-zinc-500" /> {customerName}
                      </span>
                      {customerEmail && (
                        <span className="text-xs text-zinc-500 pl-5">{customerEmail}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    {record.status === 'active' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <CheckCircle size={10} /> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-red-500/10 text-red-400 border border-red-500/20">
                        <Ban size={10} /> Revoked
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-xs text-zinc-500">
                    {new Date(record.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-right flex items-center justify-end gap-2">
                    {record.orders && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white hover:bg-zinc-800 h-8 text-[10px] uppercase font-bold tracking-widest">
                            <Eye size={14} className="mr-1.5" /> Order
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-zinc-950 border-zinc-800 text-white sm:max-w-lg">
                          <DialogHeader>
                            <DialogTitle className="font-serif text-xl tracking-wide flex items-center gap-2">
                              <Package size={20} className="text-primary" /> Order Details
                            </DialogTitle>
                          </DialogHeader>
                          <div className="space-y-6 pt-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Order ID</p>
                                <p className="font-mono text-sm text-zinc-300">{record.orders.id.substring(0, 8).toUpperCase()}</p>
                              </div>
                              <div>
                                <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Status</p>
                                <p className="text-sm text-emerald-400 font-semibold">{record.orders.status}</p>
                              </div>
                              <div>
                                <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Total Amount</p>
                                <p className="text-sm font-semibold text-white">
                                  {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(parseFloat(record.orders.total_amount))}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Date</p>
                                <p className="text-sm text-zinc-300">{new Date(record.orders.created_at).toLocaleString()}</p>
                              </div>
                            </div>

                            <div className="border-t border-zinc-800 pt-4 space-y-3">
                              <h4 className="text-sm font-bold text-zinc-300 uppercase tracking-widest">Customer Information</h4>
                              <div className="space-y-1">
                                <p className="text-sm text-zinc-400"><span className="text-zinc-500 w-20 inline-block">Name:</span> {record.orders.users.first_name} {record.orders.users.last_name}</p>
                                <p className="text-sm text-zinc-400"><span className="text-zinc-500 w-20 inline-block">Email:</span> {record.orders.users.email}</p>
                                {record.orders.users.phone && (
                                  <p className="text-sm text-zinc-400"><span className="text-zinc-500 w-20 inline-block">Phone:</span> {record.orders.users.phone}</p>
                                )}
                              </div>
                            </div>
                            
                            {(record.orders.courier_name || record.orders.tracking_number) && (
                              <div className="border-t border-zinc-800 pt-4 space-y-3">
                                <h4 className="text-sm font-bold text-zinc-300 uppercase tracking-widest">Shipping</h4>
                                <div className="space-y-1">
                                  {record.orders.courier_name && (
                                    <p className="text-sm text-zinc-400"><span className="text-zinc-500 w-20 inline-block">Courier:</span> {record.orders.courier_name}</p>
                                  )}
                                  {record.orders.tracking_number && (
                                    <p className="text-sm text-zinc-400"><span className="text-zinc-500 w-20 inline-block">Tracking:</span> <span className="font-mono text-emerald-400">{record.orders.tracking_number}</span></p>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}

                    {record.status === 'active' && !readOnly && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleRevoke(record.id)}
                        disabled={isRevoking === record.id}
                        className="text-red-500 hover:text-red-400 hover:bg-red-500/10 h-8 text-[10px] uppercase font-bold tracking-widest"
                      >
                        {isRevoking === record.id ? 'Revoking...' : 'Revoke'}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        {filteredRecords.length === 0 && (
          <div className="p-20 text-center">
            <Shield size={40} className="mx-auto mb-4 text-zinc-800" />
            <p className="text-zinc-500 font-serif">No authenticity records found.</p>
          </div>
        )}
      </div>
    </div>
  )
}
