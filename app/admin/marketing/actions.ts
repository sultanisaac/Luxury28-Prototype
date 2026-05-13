'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createCoupon(data: {
  code: string
  discount_type: 'percentage' | 'fixed'
  discount_value: number
  min_purchase_amount?: number
  expiry_date?: string
}) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('coupons')
    .insert([{
      ...data,
      is_active: true,
      created_at: new Date().toISOString()
    }])

  if (error) return { success: false, error: error.message }
  
  revalidatePath('/admin/marketing')
  return { success: true }
}

export async function deleteCoupon(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('coupons').delete().eq('id', id)
  if (error) return { success: false, error: error.message }
  revalidatePath('/admin/marketing')
  return { success: true }
}

export async function toggleCouponStatus(id: string, is_active: boolean) {
  const supabase = await createClient()
  const { error } = await supabase.from('coupons').update({ is_active }).eq('id', id)
  if (error) return { success: false, error: error.message }
  revalidatePath('/admin/marketing')
  return { success: true }
}
