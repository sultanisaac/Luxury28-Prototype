import { createClient } from '@/lib/supabase/server'
import ProfileForm from './ProfileForm'
import { notFound } from 'next/navigation'

export default async function StaffProfilePage() {
  const supabase = await createClient()
  
  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) notFound()

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', authUser.id)
    .single()

  if (!profile) notFound()

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold font-serif tracking-wide text-white drop-shadow-md">My Profile</h1>
        <p className="text-zinc-400 mt-2">Manage your personal information, security preferences, and staff identity.</p>
      </div>

      <ProfileForm user={profile} />
    </div>
  )
}
