'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// Verify if user is an admin helper function
async function verifyAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (userData?.role !== 'admin') {
    throw new Error('Unauthorized')
  }
  return true
}

export async function updateStoreSettings(settings: Record<string, any>) {
  await verifyAdmin()
  const supabase = await createClient()

  for (const [key, value] of Object.entries(settings)) {
    const { error } = await supabase
      .from('store_settings')
      .update({ value, updated_at: new Date().toISOString() })
      .eq('key', key)

    if (error) {
      console.error(`Error updating setting ${key}:`, error)
      return { success: false, error: error.message }
    }
  }

  revalidatePath('/admin/settings')
  return { success: true }
}

export async function toggleMaintenanceMode(enabled: boolean) {
  await verifyAdmin()
  const supabase = await createClient()

  const { error } = await supabase
    .from('store_settings')
    .update({ 
      value: { enabled, message: "We are currently updating our store. Please check back soon!" },
      updated_at: new Date().toISOString()
    })
    .eq('key', 'maintenance_mode')

  if (error) return { success: false, error: error.message }
  
  revalidatePath('/admin/settings')
  return { success: true }
}

export async function createStoreSetting(key: string, value: any, description?: string) {
  await verifyAdmin()
  const supabase = await createClient()

  const { error } = await supabase
    .from('store_settings')
    .insert([{ key, value, description, updated_at: new Date().toISOString() }])

  if (error) return { success: false, error: error.message }
  
  revalidatePath('/admin/settings')
  return { success: true }
}

export async function updateSingleStoreSetting(key: string, value: any, description?: string) {
  await verifyAdmin()
  const supabase = await createClient()

  const { error } = await supabase
    .from('store_settings')
    .update({ value, description, updated_at: new Date().toISOString() })
    .eq('key', key)

  if (error) return { success: false, error: error.message }
  
  revalidatePath('/admin/settings')
  return { success: true }
}

export async function deleteStoreSetting(key: string) {
  await verifyAdmin()
  const supabase = await createClient()

  const { error } = await supabase
    .from('store_settings')
    .delete()
    .eq('key', key)

  if (error) return { success: false, error: error.message }
  
  revalidatePath('/admin/settings')
  return { success: true }
}
