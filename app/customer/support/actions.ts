'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { TicketCategory } from '@/lib/supabase/types'

export async function createTicket(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('Not authenticated')
  }

  const subject = formData.get('subject') as string
  const category = formData.get('category') as TicketCategory

  const { data, error } = await supabase.from('tickets').insert({
    user_id: user.id,
    subject,
    category
  }).select().single()

  if (error) {
    console.error(error)
    throw new Error('Failed to create ticket')
  }

  revalidatePath('/customer/support')
  redirect(`/customer/support/${data.id}`)
}

export async function sendMessage(ticketId: string, message: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('Not authenticated')
  }

  const { error } = await supabase.from('ticket_messages').insert({
    ticket_id: ticketId,
    sender_id: user.id,
    message,
    is_internal_note: false
  })

  if (error) {
    console.error(error)
    throw new Error('Failed to send message')
  }

  revalidatePath(`/customer/support/${ticketId}`)
  revalidatePath(`/staff/support/${ticketId}`)
  revalidatePath(`/admin/support/${ticketId}`)
}

export async function updateTicketMessage(messageId: string, newMessage: string, ticketId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('Not authenticated')
  }

  const { error } = await supabase.from('ticket_messages').update({ message: newMessage }).eq('id', messageId)

  if (error) {
    console.error(error)
    throw new Error('Failed to update message')
  }

  revalidatePath(`/customer/support/${ticketId}`)
  revalidatePath(`/staff/support/${ticketId}`)
  revalidatePath(`/admin/support/${ticketId}`)
}

export async function deleteTicketMessage(messageId: string, ticketId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('Not authenticated')
  }

  const { error } = await supabase.from('ticket_messages').delete().eq('id', messageId)

  if (error) {
    console.error(error)
    throw new Error('Failed to delete message')
  }

  revalidatePath(`/customer/support/${ticketId}`)
  revalidatePath(`/staff/support/${ticketId}`)
  revalidatePath(`/admin/support/${ticketId}`)
}

export async function deleteTickets(ticketIds: string[]) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')
  if (!ticketIds || ticketIds.length === 0) return

  // Delete messages first, then the tickets
  await supabase.from('ticket_messages').delete().in('ticket_id', ticketIds)

  const { error } = await supabase
    .from('tickets')
    .delete()
    .in('id', ticketIds)
    .eq('user_id', user.id)

  if (error) {
    console.error(error)
    throw new Error('Failed to delete tickets')
  }

  revalidatePath('/customer/support')
}
