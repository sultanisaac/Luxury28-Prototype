'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function submitContactInquiry(formData: FormData) {
  const supabase = await createClient()

  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const subject = formData.get('subject') as string
  const message = formData.get('message') as string

  if (!name || !email || !message) {
    return { error: 'Name, email, and message are required.' }
  }

  // 1. Insert into contact_inquiries
  const { error: inquiryError } = await supabase
    .from('contact_inquiries')
    .insert({
      name,
      email,
      subject: subject || 'No Subject',
      message,
      status: 'unread'
    })

  if (inquiryError) {
    console.error('Error submitting inquiry:', inquiryError)
    return { error: 'Failed to submit your message. Please try again later.' }
  }

  // 2. Insert a global notification for staff
  // user_id is left null, so it serves as a global notification for admins/staff
  const { error: notificationError } = await supabase
    .from('notifications')
    .insert({
      title: 'New Customer Inquiry',
      description: `Subject: ${subject || 'No Subject'} - From: ${name} (${email})`,
      priority: 'high',
      is_read: false
    })

  if (notificationError) {
    console.error('Error creating notification:', notificationError)
    // We don't fail the submission if notification fails, but log it.
  }

  revalidatePath('/staff/support')
  revalidatePath('/admin/notifications')
  
  return { success: true }
}
