'use client'

import { Tag, Trash2, Power, PowerOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { deleteCoupon, toggleCouponStatus } from './actions'
import { toast } from 'sonner'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'

interface CouponTableProps {
  coupons: any[]
}

export default function CouponTable({ coupons }: CouponTableProps) {
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return
    const result = await deleteCoupon(id)
    if (result.success) toast.success('Coupon deleted')
    else toast.error('Error: ' + result.error)
  }

  const handleToggle = async (id: string, currentStatus: boolean) => {
    const result = await toggleCouponStatus(id, !currentStatus)
    if (result.success) toast.success(`Coupon ${!currentStatus ? 'activated' : 'deactivated'}`)
    else toast.error('Error: ' + result.error)
  }

  if (coupons.length === 0) {
    return (
      <div className="p-20 text-center">
        <div className="w-16 h-16 bg-zinc-950 rounded-full flex items-center justify-center mx-auto mb-4 border border-zinc-800">
          <Tag size={24} className="text-zinc-600" />
        </div>
        <h3 className="text-lg font-medium text-white mb-1">No coupons found</h3>
        <p className="text-zinc-500 text-sm max-w-xs mx-auto">
          Start your first marketing campaign by creating a discount code.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader className="bg-zinc-950/50">
          <TableRow className="border-zinc-800 hover:bg-transparent">
            <TableHead className="text-zinc-400 font-bold py-4">Code</TableHead>
            <TableHead className="text-zinc-400 font-bold py-4">Type</TableHead>
            <TableHead className="text-zinc-400 font-bold py-4">Value</TableHead>
            <TableHead className="text-zinc-400 font-bold py-4">Min Spend</TableHead>
            <TableHead className="text-zinc-400 font-bold py-4">Uses</TableHead>
            <TableHead className="text-zinc-400 font-bold py-4">Status</TableHead>
            <TableHead className="text-zinc-400 font-bold py-4 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {coupons.map((coupon) => (
            <TableRow key={coupon.id} className="border-zinc-800 hover:bg-zinc-800/30 transition-colors group">
              <TableCell className="font-bold text-white tracking-wider font-mono py-4">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${coupon.is_active ? 'bg-emerald-500' : 'bg-zinc-700'}`}></div>
                  {coupon.code}
                </div>
              </TableCell>
              <TableCell className="text-zinc-400 capitalize">{coupon.discount_type}</TableCell>
              <TableCell className="text-white font-medium">
                {coupon.discount_type === 'percentage' ? `${coupon.discount_value}%` : `$${coupon.discount_value}`}
              </TableCell>
              <TableCell className="text-zinc-400">${coupon.min_purchase_amount}</TableCell>
              <TableCell className="text-zinc-400">{coupon.usage_count || 0}</TableCell>
              <TableCell>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tighter ${
                  coupon.is_active ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-zinc-800 text-zinc-500 border border-zinc-700'
                }`}>
                  {coupon.is_active ? 'Active' : 'Inactive'}
                </span>
              </TableCell>
              <TableCell className="text-right py-4">
                <div className="flex items-center justify-end gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleToggle(coupon.id, coupon.is_active)}
                    className={`rounded-full ${coupon.is_active ? 'text-zinc-500 hover:text-amber-500 hover:bg-amber-500/10' : 'text-amber-500 hover:text-emerald-500 hover:bg-emerald-500/10'}`}
                  >
                    {coupon.is_active ? <PowerOff size={16} /> : <Power size={16} />}
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleDelete(coupon.id)}
                    className="text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-full"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}TableBody>
        </TableBody>
      </Table>
    </div>
  )
}
