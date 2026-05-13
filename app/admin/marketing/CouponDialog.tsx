'use client'

import { useState } from 'react'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Plus, Loader2 } from 'lucide-react'
import { createCoupon } from './actions'
import { toast } from 'sonner'

export default function CouponDialog() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    code: '',
    discount_type: 'percentage' as 'percentage' | 'fixed',
    discount_value: 0,
    min_purchase_amount: 0,
    expiry_date: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const result = await createCoupon(formData)
      if (result.success) {
        toast.success('Coupon created successfully')
        setOpen(false)
        setFormData({
          code: '',
          discount_type: 'percentage',
          discount_value: 0,
          min_purchase_amount: 0,
          expiry_date: ''
        })
      } else {
        toast.error('Error: ' + result.error)
      }
    } catch (err) {
      toast.error('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold px-6">
          <Plus size={18} className="mr-2" />
          Create Coupon
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-serif tracking-wide">New Discount Coupon</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Coupon Code</label>
            <input 
              required
              type="text" 
              placeholder="e.g. LUXURY2026"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-2.5 px-4 text-white focus:outline-none focus:border-amber-500/50 transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Type</label>
              <select 
                value={formData.discount_type}
                onChange={(e) => setFormData({ ...formData, discount_type: e.target.value as any })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-2.5 px-4 text-white focus:outline-none focus:border-amber-500/50 transition-all"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount ($)</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Value</label>
              <input 
                required
                type="number" 
                value={formData.discount_value}
                onChange={(e) => setFormData({ ...formData, discount_value: Number(e.target.value) })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-2.5 px-4 text-white focus:outline-none focus:border-amber-500/50 transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Min Purchase Amount</label>
            <input 
              type="number" 
              value={formData.min_purchase_amount}
              onChange={(e) => setFormData({ ...formData, min_purchase_amount: Number(e.target.value) })}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-2.5 px-4 text-white focus:outline-none focus:border-amber-500/50 transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Expiry Date</label>
            <input 
              type="date" 
              value={formData.expiry_date}
              onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-2.5 px-4 text-white focus:outline-none focus:border-amber-500/50 transition-all"
            />
          </div>

          <DialogFooter className="pt-4">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => setOpen(false)}
              className="text-zinc-400 hover:text-white"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold px-8"
            >
              {loading ? <Loader2 size={18} className="animate-spin mr-2" /> : 'Create Coupon'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
