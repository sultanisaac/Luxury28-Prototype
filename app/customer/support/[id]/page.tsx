import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import TicketChat from './TicketChat'
import EditTicketForm from './EditTicketForm'
import { deleteTicket } from '../actions'
import { redirect } from 'next/navigation'

export default async function TicketPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Fetch ticket
  const { data: ticket } = await supabase
    .from('tickets')
    .select('*')
    .eq('id', id)
    .single()

  if (!ticket || ticket.user_id !== user.id) {
    notFound()
  }

  // Fetch messages (excluding internal notes for customers via RLS, but we can also filter here just in case)
  const { data: messages } = await supabase
    .from('ticket_messages')
    .select(`*, users:sender_id (first_name, last_name, email, role)`)
    .eq('ticket_id', ticket.id)
    .eq('is_internal_note', false)
    .order('created_at', { ascending: true })

  return (
    <div className="flex flex-col h-full bg-card border border-border rounded-lg overflow-hidden">
      <div className="p-4 border-b border-border flex items-center justify-between bg-accent/20">
        <div>
          <h2 className="font-serif text-xl">{ticket.subject}</h2>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
            <span className="uppercase tracking-wider">{ticket.category}</span>
            <span>•</span>
            <span>ID: {ticket.id.slice(0, 8)}</span>
          </div>
          <EditTicketForm ticket={ticket} />
        </div>
        <div className="flex items-center gap-4">
          <span className={`px-3 py-1 text-xs uppercase tracking-wider rounded border ${
            ticket.status === 'Open' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' :
            ticket.status === 'In Progress' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
            ticket.status === 'Resolved' ? 'bg-green-500/10 border-green-500/20 text-green-400' :
            'bg-zinc-500/10 border-zinc-500/20 text-zinc-400'
          }`}>
            {ticket.status}
          </span>
          <form action={async () => {
            'use server'
            await deleteTicket(ticket.id)
            redirect('/customer/support')
          }}>
            <button className="text-red-400 text-xs uppercase tracking-wider hover:text-red-300 transition-colors">
              Delete
            </button>
          </form>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <TicketChat 
          ticket={ticket} 
          initialMessages={messages || []} 
          currentUserId={user.id} 
        />
      </div>
    </div>
  )
}
