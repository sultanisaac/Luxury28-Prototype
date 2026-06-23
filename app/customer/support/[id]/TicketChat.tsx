'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Ticket, TicketMessage } from '@/lib/supabase/types'
import { sendMessage, updateTicketMessage, deleteTicketMessage } from '../actions'
import { PencilIcon, TrashIcon, XIcon, CheckIcon } from 'lucide-react'

interface Props {
  ticket: Ticket
  initialMessages: TicketMessage[]
  currentUserId: string
}

export default function TicketChat({ ticket, initialMessages, currentUserId }: Props) {
  const [messages, setMessages] = useState<TicketMessage[]>(initialMessages)
  const [newMessage, setNewMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
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
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'ticket_messages',
        filter: `ticket_id=eq.${ticket.id}`
      }, (payload) => {
        const updatedMsg = payload.new as TicketMessage
        setMessages(prev => prev.map(m => m.id === updatedMsg.id ? { ...m, message: updatedMsg.message } : m))
      })
      .on('postgres_changes', {
        event: 'DELETE',
        schema: 'public',
        table: 'ticket_messages',
        filter: `ticket_id=eq.${ticket.id}`
      }, (payload) => {
        const deletedId = payload.old.id
        setMessages(prev => prev.filter(m => m.id !== deletedId))
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

  const handleUpdate = async (messageId: string) => {
    if (!editContent.trim()) return
    try {
      await updateTicketMessage(messageId, editContent, ticket.id)
      setEditingId(null)
      setEditContent('')
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = async (messageId: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return
    try {
      await deleteTicketMessage(messageId, ticket.id)
    } catch (err) {
      console.error(err)
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
              <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} group`}>
                <div className={`max-w-[80%] p-3 rounded-lg flex flex-col gap-2 ${isMe ? 'bg-primary text-primary-foreground' : 'bg-card border border-border'}`}>
                  {editingId === msg.id ? (
                    <div className="flex flex-col gap-2 w-full min-w-[200px]">
                      <textarea
                        value={editContent}
                        onChange={e => setEditContent(e.target.value)}
                        className={`w-full p-2 text-sm rounded bg-background text-foreground border-border border focus:outline-none`}
                        rows={3}
                      />
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setEditingId(null)} className="p-1 hover:bg-black/10 rounded">
                          <XIcon className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleUpdate(msg.id)} className="p-1 hover:bg-black/10 rounded">
                          <CheckIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="whitespace-pre-wrap">{msg.message}</p>
                      {isMe && (
                        <div className={`opacity-0 group-hover:opacity-100 transition-opacity flex justify-end gap-2 mt-1 -mr-1 text-primary-foreground/70`}>
                          <button onClick={() => { setEditingId(msg.id); setEditContent(msg.message) }} className="hover:text-current">
                            <PencilIcon className="w-3 h-3" />
                          </button>
                          <button onClick={() => handleDelete(msg.id)} className="hover:text-red-400">
                            <TrashIcon className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1 px-1">
                  <span className="text-xs text-muted-foreground font-medium">
                    {msg.users?.first_name ? `${msg.users.first_name} ${msg.users.last_name || ''}`.trim() : (isMe ? 'You' : 'Staff')}
                  </span>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
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
