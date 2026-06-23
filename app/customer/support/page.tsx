import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Ticket } from '@/lib/supabase/types'

export default async function SupportTicketsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: tickets } = await supabase
    .from('tickets')
    .select('*')
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

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        {tickets && tickets.length > 0 ? (
          <div className="divide-y divide-border">
            {tickets.map((ticket: Ticket) => (
              <div key={ticket.id} className="p-4 hover:bg-accent/50 transition-colors flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-lg mb-1">{ticket.subject}</h3>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="uppercase tracking-wider">{ticket.category}</span>
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
                    href={`/customer/support/${ticket.id}`}
                    className="text-sm underline underline-offset-4 hover:text-primary transition-colors"
                  >
                    View Chat
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-muted-foreground">
            <p>You haven't opened any support tickets yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}
