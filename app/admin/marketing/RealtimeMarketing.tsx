'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Tag, Search, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import CouponTable from './CouponTable'

interface RealtimeMarketingProps {
  initialCoupons: any[]
}

export default function RealtimeMarketing({ initialCoupons }: RealtimeMarketingProps) {
  const [coupons, setCoupons] = useState(initialCoupons)
  const [searchTerm, setSearchTerm] = useState('')
  const supabase = createClient()

  useEffect(() => {
    const channel = supabase
      .channel('realtime-marketing')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'coupons' },
        async () => {
          const { data } = await supabase
            .from('coupons')
            .select('*')
            .order('created_at', { ascending: false })
          if (data) setCoupons(data)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  const activeCount = coupons.filter(c => c.is_active).length
  const totalUses = coupons.reduce((acc, c) => acc + (c.usage_count || 0), 0)
  const bestPerformer = coupons.length > 0 ? coupons[0].code : 'N/A'

  const filteredCoupons = coupons.filter(c => 
    c.code.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-8">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Active Coupons', value: activeCount.toString(), sub: 'Across all campaigns' },
          { label: 'Total Redemptions', value: totalUses.toLocaleString(), sub: 'Cumulative usage' },
          { label: 'Best Performer', value: bestPerformer, sub: 'Most recent campaign' },
        ].map((stat, i) => (
          <div key={i} className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-xl backdrop-blur-sm shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
              <Tag size={64} />
            </div>
            <p className="text-sm text-zinc-500 font-medium relative z-10">{stat.label}</p>
            <p className="text-2xl font-bold text-white mt-1 font-serif tracking-tight relative z-10">{stat.value}</p>
            <p className="text-xs text-amber-500/80 mt-2 font-medium tracking-wide uppercase relative z-10">{stat.sub}</p>
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
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-all"
            />
          </div>
          <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-500 bg-emerald-500/5 px-2 py-1 rounded-full border border-emerald-500/10">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
            Live Updates Active
          </div>
        </div>

        <CouponTable coupons={filteredCoupons} />
      </div>
    </div>
  )
}
