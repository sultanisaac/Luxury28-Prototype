import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AddressBookClient from './AddressBookClient'

export default async function AddressBookPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: addresses } = await supabase
    .from('shipping_addresses')
    .select('*')
    .eq('user_id', user.id)
    .order('is_default', { ascending: false })

  return <AddressBookClient initialAddresses={addresses || []} userId={user.id} />
}
