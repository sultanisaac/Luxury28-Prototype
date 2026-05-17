import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import AuthenticityManager from './AuthenticityManager'

export const dynamic = 'force-dynamic'

export default async function AuthenticityPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) notFound()

  // Verify Admin Role
  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (userData?.role !== 'admin') {
    notFound()
  }

  // Fetch initial records and products
  const { data: records } = await supabase
    .from('authenticity_records')
    .select(`
      *,
      products (
        name,
        images
      ),
      orders (
        id,
        created_at,
        total_amount,
        status,
        payment_method,
        courier_name,
        tracking_number,
        users (
          first_name,
          last_name,
          email,
          phone
        )
      )
    `)
    .order('created_at', { ascending: false })

  const { data: products } = await supabase
    .from('products')
    .select('id, name')
    .eq('status', 'active')
    .order('name')

  // Fetch paid/processing/delivered orders to link with serial numbers
  const { data: orders } = await supabase
    .from('orders')
    .select(`
      id,
      created_at,
      total_amount,
      users (
        first_name,
        last_name,
        email
      ),
      order_items (
        product_id,
        products (
          name
        )
      )
    `)
    .in('status', ['Paid', 'Processing', 'Packaging', 'Shipped', 'Delivered'])
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-serif tracking-wide text-white drop-shadow-md">Authenticity Vault</h1>
          <p className="text-zinc-400 mt-2">
            Manage digital provenance and issue serial numbers for luxury timepieces.
          </p>
        </div>
      </div>

      <AuthenticityManager 
        initialRecords={records || []} 
        products={products || []} 
        orders={orders || []}
      />
    </div>
  )
}
