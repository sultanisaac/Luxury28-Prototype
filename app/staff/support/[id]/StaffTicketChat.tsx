'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Ticket, TicketMessage } from '@/lib/supabase/types'
import { sendStaffMessage } from '../actions'

interface Props {
  ticket: Ticket
  initialMessages: TicketMessage[]
  currentUserId: string
}

export default function StaffTicketChat({ ticket, initialMessages, currentUserId }: Props) {
  const [messages, setMessages] = useState<TicketMessage[]>(initialMessages)
  const [newMessage, setNewMessage] = useState('')
  const [isInternal, setIsInternal] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const supabase = createClient()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    const channel = supabase
      .channel(`ticket_${ticket.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'ticket_messages',
        filter: `ticket_id=eq.${ticket.id}`
      }, (payload) => {
        const newMsg = payload.new as TicketMessage
        setMessages(prev => {
          if (prev.find(m => m.id === newMsg.id)) return prev;
          return [...prev, newMsg]
        })
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [ticket.id, supabase])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return
    
    setIsSending(true)
    try {
      await sendStaffMessage(ticket.id, newMessage, isInternal)
      setNewMessage('')
    } catch (err) {
      console.error(err)
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-zinc-500 my-8">
            No messages yet.
          </div>
        ) : (
          messages.map(msg => {
            const isMe = msg.sender_id === currentUserId
            const isCustomer = msg.sender_id === ticket.user_id
            
            return (
              <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-lg ${
                  msg.is_internal_note ? 'bg-amber-500/20 border border-amber-500/50 text-amber-100' :
                  isCustomer ? 'bg-zinc-800 border border-zinc-700 text-zinc-100' : 
                  'bg-white text-black'
                }`}>
                  <p className="whitespace-pre-wrap">{msg.message}</p>
                </div>
                <div className="flex items-center gap-2 mt-1 px-1">
                  {msg.is_internal_note && <span className="text-xs text-amber-500 font-medium">INTERNAL NOTE</span>}
                  <span className="text-xs text-zinc-500">
                    {isCustomer ? 'Customer' : isMe ? 'You' : 'Staff'} • {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSend} className="p-4 border-t border-zinc-800 bg-zinc-900/50 space-y-3">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="internalNote"
            checked={isInternal}
            onChange={e => setIsInternal(e.target.checked)}
            className="rounded border-zinc-700 bg-zinc-800 text-amber-500 focus:ring-amber-500/20"
          />
          <label htmlFor="internalNote" className="text-sm text-zinc-400 select-none cursor-pointer">
            Internal Note (hidden from customer)
          </label>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            placeholder={isInternal ? "Type a private internal note..." : "Type your reply to the customer..."}
            className={`flex-1 bg-zinc-900 border px-4 py-2 text-white focus:outline-none transition-colors ${
              isInternal ? 'border-amber-500/50 focus:border-amber-500 placeholder:text-amber-500/50' : 'border-zinc-700 focus:border-white placeholder:text-zinc-500'
            }`}
            disabled={isSending}
          />
          <button
            type="submit"
            disabled={isSending || !newMessage.trim()}
            className={`${
              isInternal ? 'bg-amber-600 hover:bg-amber-500 text-white' : 'bg-white text-black hover:bg-zinc-200'
            } px-6 py-2 uppercase tracking-wider transition-colors disabled:opacity-50 text-sm`}
          >
            {isSending ? 'Sending...' : 'Send'}
          </button>
        </div>
      </form>
    </div>
  )
}
