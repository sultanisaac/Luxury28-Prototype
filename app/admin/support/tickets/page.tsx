import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Ticket } from '@/lib/supabase/types'

export default async function AdminTicketsPage() {
  const supabase = await createClient()

  // Fetch all tickets with user details
  const { data: tickets } = await supabase
    .from('tickets')
    .select(`
      *,
      users:user_id (email, first_name, last_name)
    `)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl">Support Tickets</h1>
        <Link 
          href="/admin/support"
          className="text-sm text-zinc-400 hover:text-white"
        >
          &larr; Back to Inquiries
        </Link>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
        {tickets && tickets.length > 0 ? (
          <div className="divide-y divide-zinc-800">
            {tickets.map((ticket: any) => (
              <div key={ticket.id} className="p-4 hover:bg-zinc-800/50 transition-colors flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-lg mb-1">{ticket.subject}</h3>
                  <div className="flex items-center gap-3 text-sm text-zinc-400">
                    <span className="uppercase tracking-wider">{ticket.category}</span>
                    <span>•</span>
                    <span>{ticket.users?.email || 'Unknown User'}</span>
                    <span>•</span>
                    <span>{new Date(ticket.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`px-2 py-1 text-xs uppercase tracking-wider rounded ${
                    ticket.status === 'Open' ? 'bg-blue-500/10 text-blue-400' :
                    ticket.status === 'In Progress' ? 'bg-amber-500/10 text-amber-400' :
                    ticket.status === 'Resolved' ? 'bg-green-500/10 text-green-400' :
                    'bg-zinc-500/10 text-zinc-400'
                  }`}>
                    {ticket.status}
                  </span>
                  <Link 
                    href={`/admin/support/tickets/${ticket.id}`}
                    className="bg-white text-black hover:bg-zinc-200 px-4 py-2 text-sm uppercase tracking-wider transition-colors rounded"
                  >
                    View Ticket
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-zinc-500">
            <p>No support tickets found.</p>
          </div>
        )}
      </div>
    </div>
  )
}
