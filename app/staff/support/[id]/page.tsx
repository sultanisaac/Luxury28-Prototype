import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import StaffTicketChat from './StaffTicketChat'
import { updateTicketStatus, deleteTicket } from '../actions'
import EditTicketForm from './EditTicketForm'
import { redirect } from 'next/navigation'

export default async function StaffTicketPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Fetch ticket with user details
  const { data: ticket } = await supabase
    .from('tickets')
    .select(`
      *,
      users:user_id (email, first_name, last_name)
    `)
    .eq('id', id)
    .single()

  if (!ticket) {
    notFound()
  }

  // Fetch all messages (including internal notes)
  const { data: messages } = await supabase
    .from('ticket_messages')
    .select(`*, users:sender_id (first_name, last_name, email, role)`)
    .eq('ticket_id', ticket.id)
    .order('created_at', { ascending: true })

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-lg flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl mb-1">{ticket.subject}</h2>
          <div className="flex items-center gap-3 text-sm text-zinc-400">
            <span className="uppercase tracking-wider">{ticket.category}</span>
            {ticket.order_id && (
              <>
                <span>•</span>
                <span className="font-mono bg-zinc-800 px-1 rounded">Order #{ticket.order_id.slice(0, 8)}</span>
              </>
            )}
            <span>•</span>
            <span>Customer: {
              ticket.users?.first_name
                ? `${ticket.users.first_name}${ticket.users.last_name ? ' ' + ticket.users.last_name : ''}`.trim()
                : ticket.users?.email || 'Unknown'
            }</span>
            <span>•</span>
            <span>ID: {ticket.id.slice(0, 8)}</span>
          </div>
          <EditTicketForm ticket={ticket} />
        </div>
        
        <div className="flex items-center gap-4">
        <form action={async (formData: FormData) => {
          'use server'
          await updateTicketStatus(ticket.id, formData.get('status') as string)
        }} className="flex items-center gap-2">
          <select 
            name="status" 
            defaultValue={ticket.status}
            className="bg-zinc-950 border border-zinc-800 px-3 py-1.5 text-sm text-white focus:outline-none focus:border-zinc-500 rounded"
          >
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>
          <button type="submit" className="bg-white text-black hover:bg-zinc-200 px-3 py-1.5 text-sm uppercase tracking-wider transition-colors rounded">
            Update
          </button>
        </form>
        <form action={async () => {
          'use server'
          await deleteTicket(ticket.id)
          redirect('/staff/support')
        }}>
          <button className="text-red-400 text-xs uppercase tracking-wider hover:text-red-300 transition-colors">
            Delete
          </button>
        </form>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <StaffTicketChat 
          ticket={ticket} 
          initialMessages={messages || []} 
          currentUserId={user.id} 
        />
      </div>
    </div>
  )
}
