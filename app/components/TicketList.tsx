'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Trash2 } from 'lucide-react'

interface TicketWithUser {
  id: string
  subject: string
  category: string
  status: string
  created_at: string
  order_id?: string | null
  users?: { email?: string; first_name?: string; last_name?: string } | null
}

interface TicketListProps {
  tickets: TicketWithUser[]
  basePath: string
  deleteAction: (ticketIds: string[]) => Promise<void>
  showCustomer?: boolean
}

export default function TicketList({ tickets, basePath, deleteAction, showCustomer = false }: TicketListProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isDeleting, setIsDeleting] = useState(false)
  const [localTickets, setLocalTickets] = useState(tickets)

  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(tid => tid !== id) : [...prev, id]
    )
  }

  const toggleAll = () => {
    if (selectedIds.length === localTickets.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(localTickets.map(t => t.id))
    }
  }

  const handleDelete = async () => {
    if (selectedIds.length === 0) return
    if (!confirm(`Delete ${selectedIds.length} ticket(s) and all their messages? This cannot be undone.`)) return

    setIsDeleting(true)
    try {
      await deleteAction(selectedIds)
      setLocalTickets(prev => prev.filter(t => !selectedIds.includes(t.id)))
      setSelectedIds([])
    } catch (err) {
      console.error(err)
      alert('Failed to delete tickets. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  if (localTickets.length === 0) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 text-center text-zinc-500">
        <p>No support tickets found.</p>
      </div>
    )
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
      {/* Bulk action bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-900/80">
        <label className="flex items-center gap-2 text-sm text-zinc-400 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={selectedIds.length === localTickets.length && localTickets.length > 0}
            onChange={toggleAll}
            className="w-4 h-4 accent-white"
          />
          {selectedIds.length > 0 ? `${selectedIds.length} selected` : 'Select all'}
        </label>

        {selectedIds.length > 0 && (
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex items-center gap-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 px-3 py-1.5 rounded text-sm font-medium transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            {isDeleting ? 'Deleting…' : `Delete ${selectedIds.length}`}
          </button>
        )}
      </div>

      <div className="divide-y divide-zinc-800">
        {localTickets.map((ticket) => (
          <div
            key={ticket.id}
            className={`p-4 flex flex-col sm:flex-row sm:items-center gap-4 transition-colors ${
              selectedIds.includes(ticket.id) ? 'bg-zinc-800/60' : 'hover:bg-zinc-800/40'
            }`}
          >
            <div className="flex items-start sm:items-center gap-4 flex-1 min-w-0">
              <input
                type="checkbox"
                checked={selectedIds.includes(ticket.id)}
                onChange={() => toggleSelect(ticket.id)}
                className="w-4 h-4 accent-white flex-shrink-0 cursor-pointer mt-1 sm:mt-0"
              />

              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-white truncate">{ticket.subject}</h3>
                <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400 mt-1">
                  <span className="uppercase tracking-wider">{ticket.category}</span>
                  {ticket.order_id && (
                    <>
                      <span>•</span>
                      <span className="font-mono bg-zinc-800 px-1 rounded">Order #{ticket.order_id.slice(0, 8)}</span>
                    </>
                  )}
                  {showCustomer && ticket.users && (
                    <>
                      <span>•</span>
                      <span>{ticket.users.first_name ? `${ticket.users.first_name} ${ticket.users.last_name || ''}`.trim() : ticket.users.email || 'Unknown'}</span>
                    </>
                  )}
                  <span>•</span>
                  <span>{new Date(ticket.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 pl-8 sm:pl-0 flex-shrink-0">
              <span className={`px-2 py-0.5 text-xs uppercase tracking-wider rounded ${
                ticket.status === 'Open' ? 'bg-blue-500/10 text-blue-400' :
                ticket.status === 'In Progress' ? 'bg-amber-500/10 text-amber-400' :
                ticket.status === 'Resolved' ? 'bg-green-500/10 text-green-400' :
                'bg-zinc-500/10 text-zinc-400'
              }`}>
                {ticket.status}
              </span>
              <Link
                href={`${basePath}/${ticket.id}`}
                className="bg-white text-black hover:bg-zinc-200 px-3 py-1.5 text-xs uppercase tracking-wider transition-colors rounded whitespace-nowrap"
              >
                Open
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
