import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import TicketList from '@/app/components/TicketList'
import { deleteTickets } from './actions'

export default async function SupportTicketsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: tickets } = await supabase
    .from('tickets')
    .select('*, users:user_id (email, first_name, last_name)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl">Support Tickets</h1>
        <Link
          href="/customer/support/new"
          className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 text-sm uppercase tracking-wider transition-colors"
        >
          Open New Ticket
        </Link>
      </div>

      <TicketList
        tickets={tickets || []}
        basePath="/customer/support"
        deleteAction={deleteTickets}
        showCustomer={false}
      />
    </div>
  )
}
