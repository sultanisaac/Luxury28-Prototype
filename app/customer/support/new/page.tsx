import { createClient } from '@/lib/supabase/server'
import { createTicket } from '../actions'

export default async function NewTicketPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Fetch user orders to allow linking tickets to specific orders
  const { data: orders } = await supabase
    .from('orders')
    .select('id, created_at, status')
    .eq('customer_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="font-serif text-2xl">Open New Ticket</h1>
      
      <form action={createTicket} className="bg-card border border-border p-6 space-y-6 rounded-lg">
        <div className="space-y-2">
          <label htmlFor="category" className="text-sm uppercase tracking-wider text-muted-foreground block">
            Issue Category
          </label>
          <select 
            id="category" 
            name="category"
            required
            className="w-full bg-background border border-border px-4 py-2 text-white focus:outline-none focus:border-primary transition-colors"
          >
            <option value="Refund">Refund Request</option>
            <option value="Complaint">Complaint</option>
            <option value="General">General Inquiry</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="order_id" className="text-sm uppercase tracking-wider text-muted-foreground block">
            Related Order (Optional)
          </label>
          <select 
            id="order_id" 
            name="order_id"
            className="w-full bg-background border border-border px-4 py-2 text-white focus:outline-none focus:border-primary transition-colors"
          >
            <option value="">None / General Issue</option>
            {orders?.map(order => (
              <option key={order.id} value={order.id}>
                Order #{order.id.slice(0, 8).toUpperCase()} - {new Date(order.created_at).toLocaleDateString()}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="subject" className="text-sm uppercase tracking-wider text-muted-foreground block">
            Subject
          </label>
          <input 
            type="text" 
            id="subject" 
            name="subject"
            required
            placeholder="Brief description of the issue"
            className="w-full bg-background border border-border px-4 py-2 text-white focus:outline-none focus:border-primary transition-colors placeholder:text-zinc-600"
          />
        </div>

        <button 
          type="submit"
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-3 uppercase tracking-wider transition-colors mt-4"
        >
          Submit Ticket
        </button>
      </form>
    </div>
  )
}
