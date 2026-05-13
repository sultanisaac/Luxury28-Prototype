'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateUserRole(userId: string, role: 'admin' | 'staff' | 'customer') {
  const supabase = await createClient()
  
  const { data: { user: currentUser } } = await supabase.auth.getUser()
  if (!currentUser) throw new Error('Not authenticated')

  // Verify requester is admin
  const { data: requester } = await supabase
    .from('users')
    .select('role')
    .eq('id', currentUser.id)
    .single()

  if (requester?.role !== 'admin') throw new Error('Unauthorized')

  const { error } = await supabase
    .from('users')
    .update({ role })
    .eq('id', userId)

  if (error) return { success: false, error: error.message }
  
  revalidatePath('/admin/users')
  return { success: true }
}

export async function deleteUserRecord(userId: string) {
  const supabase = await createClient()
  
  // Note: This only deletes the public.users record, not the auth user.
  // In a real app, you'd handle both or disable the account.
  const { error } = await supabase.from('users').delete().eq('id', userId)
  
  if (error) return { success: false, error: error.message }
  
  revalidatePath('/admin/users')
  return { success: true }
}
