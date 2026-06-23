'use client'

import { useState } from 'react'
import { updateTicketDetails } from '../actions'

export default function EditTicketForm({ ticket }: { ticket: any }) {
  const [isEditing, setIsEditing] = useState(false)
  const [subject, setSubject] = useState(ticket.subject)
  const [category, setCategory] = useState(ticket.category)

  if (!isEditing) {
    return (
      <div className="flex items-center gap-4 mt-2">
        <button 
          onClick={() => setIsEditing(true)}
          className="text-xs text-zinc-400 hover:text-white uppercase tracking-wider transition-colors"
        >
          Edit Ticket Details
        </button>
      </div>
    )
  }

  return (
    <form action={async () => {
      await updateTicketDetails(ticket.id, subject, category)
      setIsEditing(false)
    }} className="flex items-center gap-2 mt-2">
      <input 
        type="text" 
        value={subject} 
        onChange={(e) => setSubject(e.target.value)}
        className="bg-zinc-900 border border-zinc-800 px-3 py-1 text-sm text-white focus:outline-none focus:border-zinc-500 rounded"
      />
      <select 
        value={category} 
        onChange={(e) => setCategory(e.target.value)}
        className="bg-zinc-900 border border-zinc-800 px-3 py-1 text-sm text-white focus:outline-none focus:border-zinc-500 rounded"
      >
        <option value="General Inquiry">General Inquiry</option>
        <option value="Order Status">Order Status</option>
        <option value="Returns & Refunds">Returns & Refunds</option>
        <option value="Product Information">Product Information</option>
        <option value="Technical Support">Technical Support</option>
        <option value="Other">Other</option>
      </select>
      <button type="submit" className="bg-white text-black hover:bg-zinc-200 px-3 py-1 text-xs uppercase tracking-wider transition-colors rounded">
        Save
      </button>
      <button type="button" onClick={() => setIsEditing(false)} className="text-zinc-400 hover:text-white px-3 py-1 text-xs uppercase tracking-wider transition-colors rounded">
        Cancel
      </button>
    </form>
  )
}
