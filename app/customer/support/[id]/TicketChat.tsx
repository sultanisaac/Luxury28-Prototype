'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Ticket, TicketMessage } from '@/lib/supabase/types'
import { sendMessage } from '../actions'

interface Props {
  ticket: Ticket
  initialMessages: TicketMessage[]
  currentUserId: string
}

export default function TicketChat({ ticket, initialMessages, currentUserId }: Props) {
  const [messages, setMessages] = useState<TicketMessage[]>(initialMessages)
  const [newMessage, setNewMessage] = useState('')
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
        if (!newMsg.is_internal_note || newMsg.sender_id === currentUserId) {
           setMessages(prev => {
             // prevent duplicate if we just sent it
             if (prev.find(m => m.id === newMsg.id)) return prev;
             return [...prev, newMsg]
           })
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [ticket.id, currentUserId, supabase])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return
    
    setIsSending(true)
    try {
      await sendMessage(ticket.id, newMessage)
      setNewMessage('')
    } catch (err) {
      console.error(err)
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-muted-foreground my-8">
            No messages yet. Describe your issue to start the conversation.
          </div>
        ) : (
          messages.map(msg => {
            const isMe = msg.sender_id === currentUserId
            return (
              <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-lg ${isMe ? 'bg-primary text-primary-foreground' : 'bg-card border border-border'}`}>
                  <p className="whitespace-pre-wrap">{msg.message}</p>
                </div>
                <span className="text-xs text-muted-foreground mt-1 px-1">
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSend} className="p-4 border-t border-border bg-card/50">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 bg-background border border-border px-4 py-2 text-white focus:outline-none focus:border-primary transition-colors"
            disabled={isSending}
          />
          <button
            type="submit"
            disabled={isSending || !newMessage.trim()}
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-2 uppercase tracking-wider transition-colors disabled:opacity-50"
          >
            {isSending ? 'Sending...' : 'Send'}
          </button>
        </div>
      </form>
    </div>
  )
}
