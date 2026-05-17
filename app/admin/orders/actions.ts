'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { refundXenditInvoice } from '@/lib/xendit'

export async function processRefund(orderId: string, reason: string) {
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

  // Fetch the order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('xendit_invoice_id, total_amount, status')
    .eq('id', orderId)
    .single()

  if (orderError || !order) return { success: false, error: 'Order not found' }
  if (!order.xendit_invoice_id) return { success: false, error: 'No Xendit invoice associated with this order' }
  if (order.status === 'Refunded') return { success: false, error: 'Order is already refunded' }

  try {
    // Call Xendit API
    await refundXenditInvoice(order.xendit_invoice_id, Number(order.total_amount), reason)

    // Update order status in Supabase
    const { error: updateError } = await supabase
      .from('orders')
      .update({ status: 'Refunded' })
      .eq('id', orderId)

    if (updateError) throw updateError

    // Log the action
    await supabase.from('audit_logs').insert([{
      user_id: user.id,
      role: 'admin',
      action_type: 'PROCESS_REFUND',
      resource: `Refunded order ${orderId} via Xendit. Reason: ${reason}`
    }])

    revalidatePath('/admin/orders')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to process refund' }
  }
}
