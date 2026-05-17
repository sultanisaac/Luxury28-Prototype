'use server'

import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

// Use service role to bypass RLS during cascading deletes
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function deleteCustomerOrder(orderId: string, userId: string) {
  if (!orderId || !userId) return { success: false, error: 'Invalid parameters' }

  // 1. Verify the order belongs to the user using the public client (or admin client)
  const { data: order, error: fetchError } = await supabaseAdmin
    .from('orders')
    .select('customer_id')
    .eq('id', orderId)
    .single()

  if (fetchError || !order) {
    return { success: false, error: 'Order not found' }
  }

  if (order.customer_id !== userId) {
    return { success: false, error: 'Unauthorized to delete this order' }
  }

  // 2. Perform the deletion using the admin client to bypass RLS cascade block
  const { error: deleteError } = await supabaseAdmin
    .from('orders')
    .delete()
    .eq('id', orderId)

  if (deleteError) {
    return { success: false, error: deleteError.message }
  }

  revalidatePath('/customer/orders')
  return { success: true }
}
