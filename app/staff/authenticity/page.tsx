import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import AuthenticityManager from '@/app/admin/authenticity/AuthenticityManager'

export const dynamic = 'force-dynamic'

export default async function StaffAuthenticityPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) notFound()

  // Verify Staff Role (or admin, since admin is superior, but here checking staff/admin)
  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (userData?.role !== 'staff' && userData?.role !== 'admin') {
    notFound()
  }

  // Fetch initial records
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

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-serif tracking-wide text-white drop-shadow-md">Authenticity Vault</h1>
          <p className="text-zinc-400 mt-2">
            View digital provenance and serial numbers for luxury timepieces to verify returns and support requests.
          </p>
        </div>
      </div>

      <AuthenticityManager 
        initialRecords={records || []}
        readOnly={true}
      />
    </div>
  )
}
