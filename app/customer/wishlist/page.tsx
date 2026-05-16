import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import WishlistClient from './WishlistClient'

export default async function WishlistPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: items } = await supabase
    .from('wishlists')
    .select('*, products(id, name, price, images)')
    .eq('user_id', user.id)

  return <WishlistClient initialItems={items || []} userId={user.id} />
}
