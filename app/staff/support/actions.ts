'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

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
