'use server'

import { createClient } from '@/lib/supabase/server'

export async function validateCoupon(code: string, cartTotal: number) {
  const supabase = await createClient()

  // Find active coupon
  const { data: coupon, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('code', code.toUpperCase())
    .eq('is_active', true)
    .single()

  if (error || !coupon) {
    return { success: false, error: 'Invalid or inactive coupon code.' }
  }

  // Check expiry
  if (coupon.expiry_date && new Date(coupon.expiry_date) < new Date()) {
    return { success: false, error: 'This coupon has expired.' }
  }

  // Check min purchase
  if (coupon.min_purchase_amount && cartTotal < Number(coupon.min_purchase_amount)) {
    return { success: false, error: `Minimum purchase amount of Rp ${Number(coupon.min_purchase_amount).toLocaleString('id-ID')} required.` }
  }

  // Calculate discount
  let discountAmount = 0
  if (coupon.discount_type === 'fixed') {
    discountAmount = Number(coupon.discount_value)
  } else if (coupon.discount_type === 'percentage') {
    discountAmount = cartTotal * (Number(coupon.discount_value) / 100)
    if (coupon.max_discount_amount) {
      discountAmount = Math.min(discountAmount, Number(coupon.max_discount_amount))
    }
  }

  return { 
    success: true, 
    coupon: {
      id: coupon.id,
      code: coupon.code,
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value,
      discountAmount: discountAmount
    } 
  }
}
