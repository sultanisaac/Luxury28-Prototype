import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ShieldCheck, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default async function AuthenticityVaultPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Mocked for UI purposes until real records are linked
  const records = [
    {
      id: 'cert_8892',
      serial_number: 'Rlx-2023-8892A',
      product_name: 'Rolex Submariner Date',
      status: 'Verified Authentic',
      issue_date: '2023-11-15'
    },
    {
      id: 'cert_1102',
      serial_number: 'PP-Nautilus-5711',
      product_name: 'Patek Philippe Nautilus',
      status: 'Verified Authentic',
      issue_date: '2024-04-20'
    }
  ];

  return (
    <div>
      <div className="mb-8 pb-4 border-b border-border">
        <h1 className="font-serif text-3xl">The Authenticity Vault</h1>
        <p className="text-muted-foreground mt-2 font-light">Digital provenance and verified certificates for your luxury collection.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {records.map((record) => (
          <div key={record.id} className="border border-border bg-card p-0 overflow-hidden group flex flex-col sm:flex-row">
            <div className="bg-[#111] p-8 flex items-center justify-center border-b sm:border-b-0 sm:border-r border-border relative overflow-hidden sm:w-1/3 shrink-0">
               <ShieldCheck size={120} className="text-primary/10 absolute -right-4 -bottom-4 transform rotate-12 transition-transform duration-700 group-hover:rotate-0 group-hover:scale-110" />
               <div className="text-center relative z-10">
                 <ShieldCheck size={32} className="text-primary mx-auto mb-4" />
                 <h3 className="font-serif tracking-widest text-white text-sm">CERTIFIED</h3>
               </div>
            </div>
            <div className="p-6 flex-1 flex flex-col justify-between">
               <div>
                 <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Model</p>
                 <p className="font-serif text-lg mb-4">{record.product_name}</p>
                 
                 <div className="grid grid-cols-2 gap-4">
                   <div>
                     <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Serial Number</p>
                     <p className="font-mono text-sm text-primary">{record.serial_number}</p>
                   </div>
                   <div>
                     <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Issue Date</p>
                     <p className="text-sm">{new Date(record.issue_date).toLocaleDateString()}</p>
                   </div>
                 </div>
               </div>
               <Button variant="outline" className="w-full mt-6 border-border hover:border-primary uppercase tracking-widest text-xs flex items-center gap-2 transition-colors">
                 <Download size={14} /> Download PDF
               </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
