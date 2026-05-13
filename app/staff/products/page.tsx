import { createClient } from '@/lib/supabase/server'
import ProductTable from './ProductTable'
import ProductForm from './ProductForm'

export default async function StaffProductsPage() {
  const supabase = await createClient()

  // Fetch products and categories
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })

  const { data: categories } = await supabase
    .from('categories')
    .select('*')

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-serif tracking-wide text-white drop-shadow-md">Product Catalog</h1>
          <p className="text-zinc-400 mt-2">Manage inventory, descriptions, and visibility.</p>
        </div>
        <ProductForm categories={categories || []} />
      </div>

      <ProductTable products={products || []} categories={categories || []} />
    </div>
  )
}
