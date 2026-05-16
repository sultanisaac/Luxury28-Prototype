import { createClient } from '@/lib/supabase/server'
import CouponDialog from './CouponDialog'
import RealtimeMarketing from './RealtimeMarketing'

export default async function MarketingPage() {
  const supabase = await createClient()
  
  const { data: coupons } = await supabase
    .from('coupons')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-serif tracking-wide text-white drop-shadow-md">Marketing & Promotions</h1>
          <p className="text-zinc-400 mt-2">Manage discount codes and promotional campaigns in real-time.</p>
        </div>
        <CouponDialog />
      </div>

      <RealtimeMarketing initialCoupons={coupons || []} />
    </div>
  )
}
