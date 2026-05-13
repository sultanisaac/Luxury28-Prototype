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
  
  revalidatePath('/admin/support')
  return { success: true }
}

export async function deleteInquiry(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('contact_inquiries').delete().eq('id', id)
  if (error) return { success: false, error: error.message }
  
  revalidatePath('/admin/support')
  return { success: true }
}
