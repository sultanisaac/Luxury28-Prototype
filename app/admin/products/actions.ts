'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function upsertProduct(data: {
  id?: string
  name: string
  description?: string
  price: number
  price_idr?: number
  stock_quantity: number
  category_id?: string
  status?: string
  images?: string[]
}) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const productData = {
    ...data
  }

  let result
  if (data.id) {
    result = await supabase
      .from('products')
      .update(productData)
      .eq('id', data.id)
  } else {
    result = await supabase
      .from('products')
      .insert([productData])
  }

  if (result.error) return { success: false, error: result.error.message }
  
  revalidatePath('/admin/products')
  return { success: true }
}

export async function deleteProduct(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('products').delete().eq('id', id)
  if (error) return { success: false, error: error.message }
  
  revalidatePath('/admin/products')
  return { success: true }
}

export async function toggleProductStatus(id: string, status: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('products')
    .update({ status })
    .eq('id', id)

  if (error) return { success: false, error: error.message }
  
  revalidatePath('/admin/products')
  return { success: true }
}

export async function toggleStockStatus(id: string, currentStock: number) {
  const supabase = await createClient()
  const newStock = currentStock > 0 ? 0 : 1
  const { error } = await supabase
    .from('products')
    .update({ stock_quantity: newStock })
    .eq('id', id)

  if (error) return { success: false, error: error.message }
  
  revalidatePath('/admin/products')
  return { success: true }
}
