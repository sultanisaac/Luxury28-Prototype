import { createClient } from '@/lib/supabase/server'
import InquiryList from './InquiryList'

export default async function SupportPage() {
  const supabase = await createClient()
  
  const { data: inquiries } = await supabase
    .from('contact_inquiries')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold font-serif tracking-wide text-white drop-shadow-md">Customer Support Hub</h1>
        <p className="text-zinc-400 mt-2">Manage customer inquiries and communication history from the storefront.</p>
      </div>

      <InquiryList initialInquiries={inquiries || []} />
    </div>
  )
}
