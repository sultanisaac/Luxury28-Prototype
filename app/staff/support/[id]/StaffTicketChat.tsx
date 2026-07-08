'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Ticket, TicketMessage } from '@/lib/supabase/types'
import { sendStaffMessage, updateTicketMessage, deleteTicketMessage } from '../actions'
import { PencilIcon, TrashIcon, XIcon, CheckIcon } from 'lucide-react'

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
        // Note: Realtime doesn't join tables, so users object will be missing.
        // We'd ideally fetch it, but for now we append the message and assume a refresh might be needed for full identity.
        setMessages(prev => {
          if (prev.find(m => m.id === newMsg.id)) return prev;
          return [...prev, newMsg]
        })
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
              <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} group`}>
                <div className={`max-w-[80%] p-3 rounded-lg flex flex-col gap-2 ${
                  msg.is_internal_note ? 'bg-amber-500/20 border border-amber-500/50 text-amber-100' :
                  isCustomer ? 'bg-zinc-800 border border-zinc-700 text-zinc-100' : 
                  'bg-white text-black'
                }`}>
                  {editingId === msg.id ? (
                    <div className="flex flex-col gap-2 w-full min-w-[200px]">
                      <textarea
                        value={editContent}
                        onChange={e => setEditContent(e.target.value)}
                        className={`w-full p-2 text-sm rounded ${isCustomer ? 'bg-zinc-900 text-white border-zinc-700' : 'bg-zinc-100 text-black border-zinc-300'} border focus:outline-none`}
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
                      <div className={`opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity flex justify-end gap-2 mt-1 -mr-1 ${msg.is_internal_note ? 'text-amber-500/70' : isCustomer ? 'text-zinc-400' : 'text-zinc-500'}`}>
                        <button onClick={() => { setEditingId(msg.id); setEditContent(msg.message) }} className="hover:text-current">
                          <PencilIcon className="w-3 h-3" />
                        </button>
                        <button onClick={() => handleDelete(msg.id)} className="hover:text-red-500">
                          <TrashIcon className="w-3 h-3" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1 px-1">
                  {msg.is_internal_note && <span className="text-xs text-amber-500 font-medium">INTERNAL NOTE</span>}
                  <span className="text-xs text-zinc-500 font-medium">
                    {msg.users?.first_name 
                      ? `${msg.users.first_name} ${msg.users.last_name || ''}`.trim() 
                      : msg.users?.email 
                        ? msg.users.email 
                        : isCustomer 
                          ? (ticket.users?.first_name ? `${ticket.users.first_name} ${ticket.users.last_name || ''}`.trim() : ticket.users?.email || 'Customer') 
                          : 'Staff'
                    }
                  </span>
                  <span className="text-xs text-zinc-600">•</span>
                  <span className="text-xs text-zinc-600">
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
