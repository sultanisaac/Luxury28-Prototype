import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Plus, Edit2, Trash2, Image as ImageIcon } from 'lucide-react'

// Mock Data
const mockProducts = [
  { id: '1', name: 'Rolex Submariner Date', category: 'Watches', price: 14500, stock: 3, status: 'active', image: true },
  { id: '2', name: 'Audemars Piguet Royal Oak', category: 'Watches', price: 45000, stock: 1, status: 'active', image: false },
  { id: '3', name: 'Patek Philippe Nautilus', category: 'Watches', price: 120000, stock: 0, status: 'out_of_stock', image: true },
  { id: '4', name: 'Cartier Love Bracelet', category: 'Jewelry', price: 7350, stock: 12, status: 'active', image: true },
]

export default async function ProductsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) notFound()

  // Verify Admin Role
  const { data: userData } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (userData?.role !== 'admin') notFound()

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-serif tracking-wide">Products</h1>
          <p className="text-zinc-400 mt-2">Manage inventory, catalogs, and images.</p>
        </div>
        <Button className="bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-2">
          <Plus size={16} /> Add Product
        </Button>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-400">
            <thead className="bg-zinc-950/50 border-b border-zinc-800 text-zinc-300 uppercase tracking-wider text-xs">
              <tr>
                <th className="px-6 py-4 font-medium">Product</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium">Price</th>
                <th className="px-6 py-4 font-medium">Stock</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {mockProducts.map((p) => (
                <tr key={p.id} className="hover:bg-zinc-800/20 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-md bg-zinc-800 flex items-center justify-center text-zinc-600">
                        {p.image ? <ImageIcon size={16} /> : <span className="text-xs">No Img</span>}
                      </div>
                      <div className="font-medium text-zinc-200">{p.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">{p.category}</td>
                  <td className="px-6 py-4 font-mono text-zinc-300">
                    ${p.price.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={p.stock > 0 ? 'text-zinc-300' : 'text-red-400 font-medium'}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {p.status === 'active' ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                        Out of Stock
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-white">
                        <Edit2 size={14} />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-red-400">
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
