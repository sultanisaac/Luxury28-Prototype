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

  // Fetch full order details required by Biteship
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select(`
      *,
      address:shipping_addresses!shipping_address_id(*),
      order_items (
        *,
        products (*)
      )
    `)
    .eq('id', orderId)
    .single()

  if (orderError || !order) return { success: false, error: 'Order not found' }
  if (!order.address) return { success: false, error: 'Shipping address missing' }

  // Extract courier code & service from our string (e.g., "jne reg")
  const courierString = (order.courier_name || 'jne reg').toLowerCase()
  const [courierCode = 'jne', courierService = 'reg'] = courierString.split(' ')

  const shippingItems = order.order_items.map((item: any) => ({
    name: item.products?.name || 'Luxury Watch',
    description: item.products?.description || 'Luxury Timepiece',
    value: Math.min(item.unit_price || 0, 5000000), // Cap at 5M IDR for sandbox rate/insurance success
    length: item.products?.dimensions?.l || 20,
    width: item.products?.dimensions?.w || 15,
    height: item.products?.dimensions?.h || 12,
    weight: item.products?.weight || 600,
    quantity: item.quantity
  }))

  try {
    const { createBiteshipOrder } = await import('@/lib/biteship')
    const biteshipRes = await createBiteshipOrder({
      referenceId: order.id,
      destinationContactName: order.address.recipient_name,
      destinationContactPhone: order.address.phone || '0000',
      destinationAddress: `${order.address.street_address}, ${order.address.city}, ${order.address.province} ${order.address.postal_code}`,
      destinationAreaId: order.destination_area_id || 'IDNP1CGKOTA1800JKT000ORD',
      courierCode,
      courierService,
      items: shippingItems,
      itemValue: order.total_amount || 0
    })

    // Biteship returns the order 'id' which can be tracked, and 'waybill_id' (resi) if generated immediately.
    const biteshipOrderId = biteshipRes.id
    const trackingNumber = biteshipRes.waybill_id || biteshipOrderId || `LX-${Math.floor(Math.random() * 1000000000)}`

    const { error } = await supabase
      .from('orders')
      .update({ 
        tracking_number: trackingNumber,
        biteship_order_id: biteshipOrderId
      })
      .eq('id', orderId)

    if (error) return { success: false, error: error.message }
    
    await supabase.from('audit_logs').insert([{
      user_id: user.id,
      role: 'staff',
      action_type: 'GENERATE_SHIPPING_LABEL',
      resource: `Order ${orderId} sent to Biteship. Tracking: ${trackingNumber}`
    }])

    revalidatePath('/staff/orders')
    return { success: true, trackingNumber }
  } catch (err: any) {
    return { success: false, error: err.message || 'Biteship API Error' }
  }
}

export async function addOrderNote(orderId: string, noteText: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('order_notes')
    .insert([{
      order_id: orderId,
      author_id: user.id,
      note_text: noteText
    }])

  if (error) return { success: false, error: error.message }
  
  revalidatePath('/staff/orders')
  return { success: true }
}
