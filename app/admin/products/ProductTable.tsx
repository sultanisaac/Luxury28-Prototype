'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  Trash2, 
  Edit3, 
  ExternalLink, 
  MoreHorizontal, 
  Archive, 
  TrendingUp, 
  TrendingDown,
  AlertCircle,
  Search
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { deleteProduct, toggleProductStatus } from './actions'
import { toast } from 'sonner'
import ProductForm from './ProductForm'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface ProductTableProps {
  products: any[]
  categories: any[]
}

export default function ProductTable({ products: initialProducts, categories }: ProductTableProps) {
  const [products, setProducts] = useState(initialProducts)
  const [searchTerm, setSearchTerm] = useState('')
  const supabase = createClient()

  useEffect(() => {
    const channel = supabase
      .channel('realtime-products')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        async () => {
          const { data } = await supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false })
          if (data) setProducts(data)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this masterpiece from the collection?')) return
    const result = await deleteProduct(id)
    if (result.success) toast.success('Product removed')
    else toast.error('Error: ' + result.error)
  }

  const handleStatusToggle = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'archived' : 'active'
    const result = await toggleProductStatus(id, newStatus)
    if (result.success) toast.success(`Product ${newStatus}`)
    else toast.error('Error: ' + result.error)
  }

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (products.length === 0) {
    return (
      <div className="p-20 text-center bg-zinc-950/30 border border-dashed border-zinc-800 rounded-3xl">
        <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-6 border border-zinc-800 shadow-2xl">
          <Archive size={32} className="text-zinc-700" />
        </div>
        <h3 className="text-xl font-serif text-white mb-2 tracking-wide">The Vault is Empty</h3>
        <p className="text-zinc-500 text-sm max-w-sm mx-auto leading-relaxed">
          Begin curating your collection by registering your first luxury artifact.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Table Controls */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-md">
          <input 
            type="text" 
            placeholder="Search artifacts by name..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-all shadow-lg"
          />
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600">
            <Search size={20} />
          </div>
        </div>
      </div>

      {/* Grid view for products looks more premium than a simple table for luxury items */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <div 
            key={product.id} 
            className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden group hover:border-amber-500/30 transition-all duration-500 hover:shadow-2xl hover:shadow-amber-500/5"
          >
            {/* Image Preview */}
            <div className="relative aspect-[4/3] bg-zinc-950 overflow-hidden">
              {product.images && product.images[0] ? (
                <img 
                  src={product.images[0]} 
                  alt={product.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-800">
                  <Archive size={48} />
                </div>
              )}
              <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                <ProductForm 
                  categories={categories} 
                  product={product} 
                  trigger={
                    <Button size="icon" className="bg-zinc-900/80 backdrop-blur-md border border-zinc-700 text-white hover:bg-amber-500 hover:text-zinc-950 rounded-xl">
                      <Edit3 size={16} />
                    </Button>
                  }
                />
                <Button 
                  size="icon" 
                  onClick={() => handleDelete(product.id)}
                  className="bg-zinc-900/80 backdrop-blur-md border border-zinc-700 text-white hover:bg-red-500 rounded-xl"
                >
                  <Trash2 size={16} />
                </Button>
              </div>
              <div className="absolute bottom-4 left-4">
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest backdrop-blur-md border ${
                  product.status === 'active' 
                  ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                  : 'bg-zinc-900/50 text-zinc-500 border-zinc-700'
                }`}>
                  {product.status}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-start gap-2">
                <div>
                  <h3 className="text-lg font-serif font-bold text-white tracking-wide line-clamp-1 group-hover:text-amber-500 transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-xs text-zinc-500 font-medium uppercase tracking-tighter mt-1">
                    {categories.find(c => c.id === product.category_id)?.name || 'Uncategorized'}
                  </p>
                </div>
                <p className="text-xl font-bold text-white font-mono">
                  ${Number(product.price).toLocaleString()}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-zinc-800/50">
                <div className="space-y-1">
                  <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">Inventory</p>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-bold ${product.stock_quantity > 0 ? 'text-zinc-300' : 'text-red-500'}`}>
                      {product.stock_quantity}
                    </span>
                    <span className="text-[10px] text-zinc-600">units</span>
                  </div>
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">Visibility</p>
                  <button 
                    onClick={() => handleStatusToggle(product.id, product.status)}
                    className="text-xs font-medium text-amber-500/80 hover:text-amber-500 transition-colors flex items-center justify-end gap-1 ml-auto"
                  >
                    {product.status === 'active' ? <Archive size={12} /> : <TrendingUp size={12} />}
                    {product.status === 'active' ? 'Archive' : 'Activate'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
