'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function sendStaffMessage(ticketId: string, message: string, isInternal: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('Not authenticated')
  }

  // Ensure user is staff or admin
  const { data: userData } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (!userData || !['admin', 'staff'].includes(userData.role)) {
    throw new Error('Unauthorized')
  }

  const { error } = await supabase.from('ticket_messages').insert({
    ticket_id: ticketId,
    sender_id: user.id,
    message,
    is_internal_note: isInternal
  })

  if (error) {
    console.error(error)
    throw new Error('Failed to send message')
  }

  revalidatePath(`/customer/support/${ticketId}`)
  revalidatePath(`/staff/support/${ticketId}`)
  revalidatePath(`/admin/support/${ticketId}`)
}

export async function updateTicketStatus(ticketId: string, status: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('Not authenticated')
  }

  const { data: userData } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (!userData || !['admin', 'staff'].includes(userData.role)) {
    throw new Error('Unauthorized')
  }

  const { error } = await supabase.from('tickets').update({ status }).eq('id', ticketId)

  if (error) {
    console.error(error)
    throw new Error('Failed to update status')
  }

  revalidatePath(`/customer/support/${ticketId}`)
  revalidatePath(`/staff/support/${ticketId}`)
  revalidatePath(`/staff/support`)
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

export async function updateInquiryStatus(id: string, status: 'read' | 'unread' | 'replied' | 'archived') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('contact_inquiries')
    .update({ status })
    .eq('id', id)

  if (error) return { success: false, error: error.message }
  
  await supabase.from('audit_logs').insert([{
    user_id: user.id,
    role: 'staff',
    action_type: 'UPDATE_INQUIRY',
    resource: `Inquiry ID: ${id} to ${status}`
  }])

  revalidatePath('/staff/support')
  return { success: true }
}

export async function deleteInquiry(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { error } = await supabase.from('contact_inquiries').delete().eq('id', id)
  if (error) return { success: false, error: error.message }
  
  if (user) {
    await supabase.from('audit_logs').insert([{
      user_id: user.id,
      role: 'staff',
      action_type: 'DELETE_INQUIRY',
      resource: `Inquiry ID: ${id}`
    }])
  }

  revalidatePath('/staff/support')
  return { success: true }
}
