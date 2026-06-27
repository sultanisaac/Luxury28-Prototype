'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfile(data: {
  first_name: string
  last_name: string
  phone?: string
  avatar_url?: string
}) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('users')
    .update(data)
    .eq('id', user.id)

  if (error) return { success: false, error: error.message }
  
  revalidatePath('/admin/profile')
  return { success: true }
}

export async function updatePassword(password: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  // Only apply global sign-out for email/password accounts, not OAuth (Google)
  const provider = user.app_metadata?.provider
  const isEmailAccount = provider === 'email'

  const { error } = await supabase.auth.updateUser({ password })

  if (error) return { success: false, error: error.message }

  // Sign out ALL devices globally so the new password takes effect everywhere
  if (isEmailAccount) {
    await supabase.auth.signOut({ scope: 'global' })
  }

  return { success: true, requiresRelogin: isEmailAccount }
}
