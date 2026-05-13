import { Tag, Search, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'
import CouponDialog from './CouponDialog'
import CouponTable from './CouponTable'

export default async function MarketingPage() {
  const supabase = await createClient()
  
  const { data: coupons } = await supabase
    .from('coupons')
    .select('*')
    .order('created_at', { ascending: false })

  const activeCount = coupons?.filter(c => c.is_active).length || 0
  const totalUses = coupons?.reduce((acc, c) => acc + (c.usage_count || 0), 0) || 0

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-serif tracking-wide text-white text-shadow-sm">Marketing & Promotions</h1>
          <p className="text-zinc-400 mt-2">Manage discount codes and promotional campaigns.</p>
        </div>
        <CouponDialog />
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Active Coupons', value: activeCount.toString(), sub: 'Across all campaigns' },
          { label: 'Total Redemptions', value: totalUses.toLocaleString(), sub: 'Cumulative usage' },
          { label: 'Best Performer', value: coupons?.[0]?.code || 'N/A', sub: 'Most recent campaign' },
        ].map((stat, i) => (
          <div key={i} className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-xl backdrop-blur-sm shadow-xl">
            <p className="text-sm text-zinc-500 font-medium">{stat.label}</p>
            <p className="text-2xl font-bold text-white mt-1 font-serif tracking-tight">{stat.value}</p>
            <p className="text-xs text-amber-500/80 mt-2 font-medium tracking-wide uppercase">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Table Section */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-zinc-800 flex flex-wrap gap-4 items-center justify-between bg-zinc-900/50">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
            <input 
              type="text" 
              placeholder="Search by code..." 
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-all"
            />
          </div>
          <Button variant="outline" className="border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-white">
            <Filter size={16} className="mr-2" />
            Filters
          </Button>
        </div>

        <CouponTable coupons={coupons || []} />
      </div>
    </div>
  )
}
