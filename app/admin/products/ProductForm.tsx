'use client'

import { useState, useEffect } from 'react'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogTrigger
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Plus, Loader2, Package, Image as ImageIcon } from 'lucide-react'
import { upsertProduct } from './actions'
import { toast } from 'sonner'
import { SmartImage } from '@/components/ui/smart-image'
import { createClient } from '@/lib/supabase/client'

interface ProductFormProps {
  categories: any[]
  product?: any // If provided, we are in Edit mode
  trigger?: React.ReactNode
}

export default function ProductForm({ categories, product, trigger }: ProductFormProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    price_idr: 0,
    stock_quantity: 0,
    category_id: '',
    status: 'active',
    images: [] as string[]
  })

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: Number(product.price) || 0,
        price_idr: Number(product.price_idr) || 0,
        stock_quantity: product.stock_quantity || 0,
        category_id: product.category_id || '',
        status: product.status || 'active',
        images: product.images || []
      })
    }
  }, [product])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const result = await upsertProduct({
        id: product?.id,
        ...formData
      })
      if (result.success) {
        toast.success(product ? 'Product updated' : 'Product created')
        setOpen(false)
        if (!product) {
          setFormData({
            name: '',
            description: '',
            price: 0,
            price_idr: 0,
            stock_quantity: 0,
            category_id: '',
            status: 'active',
            images: []
          })
        }
      } else {
        toast.error('Error: ' + result.error)
      }
    } catch (err) {
      toast.error('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const supabase = createClient()
    const newImages: string[] = []

    setLoading(true)
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        
        // 1MB Limit
        if (file.size > 1024 * 1024) {
          toast.error(`File ${file.name} is larger than 1MB and was skipped`)
          continue
        }

        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
        const filePath = `gallery/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('products')
          .upload(filePath, file)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('products')
          .getPublicUrl(filePath)

        newImages.push(publicUrl)
      }

      setFormData(prev => ({ ...prev, images: [...prev.images, ...newImages] }))
      if (newImages.length > 0) {
        toast.success(`Successfully uploaded ${newImages.length} image(s)`)
      }
    } catch (err: any) {
      console.error('Image upload error:', err)
      toast.error('Error uploading image: ' + err.message)
    } finally {
      setLoading(false)
      e.target.value = ''
    }
  }

  const removeImage = (index: number) => {
    const newImages = [...formData.images]
    newImages.splice(index, 1)
    setFormData({ ...formData, images: newImages })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold px-6">
            <Plus size={18} className="mr-2" />
            Add New Product
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif tracking-wide flex items-center gap-2">
            <Package className="text-amber-500" size={24} />
            {product ? 'Edit Masterpiece' : 'Register New Masterpiece'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Product Name</label>
              <input 
                required
                type="text" 
                placeholder="e.g. Rolex Submariner Date"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-2.5 px-4 text-white focus:outline-none focus:border-amber-500/50 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Category</label>
              <select 
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-2.5 px-4 text-white focus:outline-none focus:border-amber-500/50 transition-all"
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Price (USD)</label>
              <input 
                required
                type="number" 
                placeholder="0.00"
                value={formData.price || ''}
                onChange={(e) => {
                  const val = Number(e.target.value)
                  setFormData({ ...formData, price: val, price_idr: val * 16000 })
                }}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-2.5 px-4 text-white focus:outline-none focus:border-amber-400/50 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Price (IDR)</label>
              <input 
                required
                type="number" 
                placeholder="0"
                value={formData.price_idr || ''}
                onChange={(e) => {
                  const val = Number(e.target.value)
                  setFormData({ ...formData, price_idr: val, price: Number((val / 16000).toFixed(2)) })
                }}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-2.5 px-4 text-white focus:outline-none focus:border-amber-400/50 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Stock Quantity</label>
              <input 
                required
                type="number" 
                placeholder="0"
                value={formData.stock_quantity}
                onChange={(e) => setFormData({ ...formData, stock_quantity: Number(e.target.value) })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-2.5 px-4 text-white focus:outline-none focus:border-amber-400/50 transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Description</label>
            <textarea 
              rows={4}
              placeholder="Describe the exclusivity and history of this item..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-2.5 px-4 text-white focus:outline-none focus:border-amber-500/50 transition-all resize-none"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Gallery Assets</label>
              <label className="border border-zinc-800 h-8 text-xs hover:bg-zinc-800 flex items-center px-3 rounded-md cursor-pointer transition-colors">
                <ImageIcon size={14} className="mr-2" />
                Upload Images (Max 1MB)
                <input 
                  type="file" 
                  multiple 
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden" 
                />
              </label>
            </div>
            
            <div className="grid grid-cols-4 gap-4">
              {formData.images.map((img, idx) => (
                <div key={idx} className="relative aspect-square bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden group">
                  <SmartImage 
                    src={img} 
                    alt="Product preview" 
                    width={200}
                    height={200}
                    fallbackType="luxury"
                    className="w-full h-full object-cover" 
                  />
                  <button 
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Plus size={12} className="rotate-45" />
                  </button>
                </div>
              ))}
              {formData.images.length === 0 && (
                <div className="col-span-4 py-8 text-center border-2 border-dashed border-zinc-800 rounded-xl">
                  <p className="text-zinc-600 text-sm italic">No images added yet.</p>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="pt-6 border-t border-zinc-800">
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
              className="bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold px-8 shadow-[0_0_20px_rgba(245,158,11,0.2)]"
            >
              {loading ? <Loader2 size={18} className="animate-spin mr-2" /> : (product ? 'Update Masterpiece' : 'Save & Publish')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
