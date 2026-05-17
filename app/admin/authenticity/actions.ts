'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function issueSerialNumber(productId: string, orderId: string, serialNumber: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Verify Admin Role
  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (userData?.role !== 'admin') {
    throw new Error('Not authorized')
  }

  const { error } = await supabase
    .from('authenticity_records')
    .insert([{
      product_id: productId,
      order_id: orderId,
      serial_number: serialNumber,
      status: 'active'
    }])

  if (error) return { success: false, error: error.message }

  await supabase.from('audit_logs').insert([{
    user_id: user.id,
    role: 'admin',
    action_type: 'ISSUE_SERIAL_NUMBER',
    resource: `Issued S/N ${serialNumber} for product ${productId} on order ${orderId}`
  }])

  revalidatePath('/admin/authenticity')
  return { success: true }
}

export async function revokeSerialNumber(recordId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Verify Admin Role
  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (userData?.role !== 'admin') {
    throw new Error('Not authorized')
  }

  const { error } = await supabase
    .from('authenticity_records')
    .update({ status: 'revoked' })
    .eq('id', recordId)

  if (error) return { success: false, error: error.message }

  await supabase.from('audit_logs').insert([{
    user_id: user.id,
    role: 'admin',
    action_type: 'REVOKE_SERIAL_NUMBER',
    resource: `Revoked record ${recordId}`
  }])

  revalidatePath('/admin/authenticity')
  return { success: true }
}
