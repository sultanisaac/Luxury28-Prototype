'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateOrderStatus(orderId: string, status: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId)

  if (error) return { success: false, error: error.message }
  
  // Also log the action
  await supabase.from('audit_logs').insert([{
    user_id: user.id,
    role: 'staff',
    action_type: 'UPDATE_ORDER_STATUS',
    resource: `Order ${orderId} status changed to ${status}`
  }])

  revalidatePath('/staff/orders')
  return { success: true }
}

export async function generateShippingLabel(orderId: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Mock tracking number generation
  const trackingNumber = `LX-${Math.floor(Math.random() * 1000000000)}`

  const { error } = await supabase
    .from('orders')
    .update({ 
      status: 'Shipped',
      tracking_number: trackingNumber
    })
    .eq('id', orderId)

  if (error) return { success: false, error: error.message }
  
  await supabase.from('audit_logs').insert([{
    user_id: user.id,
    role: 'staff',
    action_type: 'GENERATE_SHIPPING_LABEL',
    resource: `Order ${orderId} tracking number ${trackingNumber}`
  }])

  revalidatePath('/staff/orders')
  return { success: true, trackingNumber }
}
