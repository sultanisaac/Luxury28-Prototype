'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ShieldCheck, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function AuthenticityClient({ initialRecords, userId }: { initialRecords: any[], userId: string }) {
  const supabase = createClient()
  const [records, setRecords] = useState(initialRecords)

  useEffect(() => {
    const channel = supabase.channel(`rt-customer-authenticity-${Math.random().toString(36).substring(7)}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'authenticity_records' },
        async () => {
          const { data: orders } = await supabase.from('orders').select('id').eq('customer_id', userId)
          if (!orders?.length) return
          const orderIds = orders.map(o => o.id)
          const { data } = await supabase.from('authenticity_records').select('*, products(name, images)').in('order_id', orderIds)
          if (data) setRecords(data)
        }
      ).subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [supabase, userId])

  return (
    <div>
      <div className="mb-8 pb-4 border-b border-border">
        <h1 className="font-serif text-3xl">The Authenticity Vault</h1>
        <p className="text-muted-foreground mt-2 font-light">Digital provenance and verified certificates for your luxury collection.</p>
      </div>
      {records.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border bg-background/30">
          <ShieldCheck size={48} className="mx-auto text-muted-foreground/30 mb-4" />
          <h3 className="font-serif text-xl mb-2">No certificates yet</h3>
          <p className="text-muted-foreground text-sm">Authenticity certificates appear here after purchase.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {records.map((record) => (
            <div key={record.id} className="border border-border bg-card overflow-hidden group flex flex-col sm:flex-row">
              <div className="bg-[#111] flex items-center justify-center border-b sm:border-b-0 sm:border-r border-border relative overflow-hidden sm:w-1/3 shrink-0 aspect-square sm:aspect-auto">
                {record.products?.images?.[0] ? (
                  <img src={record.products.images[0]} alt={record.products.name} className="w-full h-full object-cover relative z-10 opacity-90 group-hover:opacity-100 transition-opacity" />
                ) : (
                  <>
                    <ShieldCheck size={120} className="text-primary/10 absolute -right-4 -bottom-4 rotate-12 transition-transform duration-700 group-hover:rotate-0 group-hover:scale-110" />
                    <div className="text-center relative z-10 p-8">
                      <ShieldCheck size={32} className="text-primary mx-auto mb-4" />
                      <h3 className="font-serif tracking-widest text-white text-sm">CERTIFIED</h3>
                    </div>
                  </>
                )}
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Model</p>
                  <p className="font-serif text-lg mb-4">{record.products?.name || record.product_name}</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Serial Number</p>
                      <p className="font-mono text-sm text-primary">{record.serial_number}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Issue Date</p>
                      <p className="text-sm">{new Date(record.issue_date || record.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
                <Button variant="outline" className="w-full mt-6 border-border hover:border-primary uppercase tracking-widest text-xs flex items-center gap-2">
                  <Download size={14} /> Download PDF
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
