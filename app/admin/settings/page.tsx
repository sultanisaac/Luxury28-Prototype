import { createClient } from '@/lib/supabase/server'
import SettingsForm from './SettingsForm'

export default async function StoreSettingsPage() {
  const supabase = await createClient()
  
  const { data: settings } = await supabase
    .from('store_settings')
    .select('*')

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold font-serif tracking-wide text-white drop-shadow-md">Store Configuration</h1>
        <p className="text-zinc-400 mt-2">Manage your global shop identity and system preferences.</p>
      </div>

      <SettingsForm initialSettings={settings || []} />
    </div>
  )
}
