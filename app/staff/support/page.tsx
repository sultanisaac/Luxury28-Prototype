import { createClient } from '@/lib/supabase/server'
import TicketList from '@/app/components/TicketList'
import { deleteTickets } from './actions'

export default async function StaffSupportPage() {
  const supabase = await createClient()

  const { data: tickets } = await supabase
    .from('tickets')
    .select('*, users:user_id (email, first_name, last_name)')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl">Support Inbox</h1>
      </div>

      <TicketList
        tickets={tickets || []}
        basePath="/staff/support"
        deleteAction={deleteTickets}
        showCustomer={true}
      />
    </div>
  )
}
