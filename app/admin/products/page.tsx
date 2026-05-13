import { createClient } from '@/lib/supabase/server'
import ProductForm from './ProductForm'
import ProductTable from './ProductTable'

export default async function ProductsPage() {
  const supabase = await createClient()
  
  // Fetch products and categories in parallel
  const [productsRes, categoriesRes] = await Promise.all([
    supabase.from('products').select('*').order('created_at', { ascending: false }),
    supabase.from('categories').select('*')
  ])

  const products = productsRes.data || []
  const categories = categoriesRes.data || []

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-serif tracking-wide text-white drop-shadow-md">Product Collection</h1>
          <p className="text-zinc-400 mt-2">Manage your inventory of exclusive timepieces and luxury artifacts.</p>
        </div>
        <ProductForm categories={categories} />
      </div>

      <ProductTable products={products} categories={categories} />
    </div>
  )
}
