import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateProfile } from './actions'

export default async function AdminProfile() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    notFound()
  }

  // Fetch from public.users table
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    notFound()
  }

  return (
    <div className="max-w-4xl space-y-10 pb-12">
      <div>
        <h1 className="text-3xl font-bold font-serif tracking-wide">My Profile</h1>
        <p className="text-zinc-400 mt-2">Manage your personal information and security settings.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Avatar & Basic Details */}
        <div className="md:col-span-2 space-y-8">
          <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-6">Personal Details</h2>
            <form action={updateProfile} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name" className="text-zinc-400">First Name</Label>
                  <Input 
                    id="first_name" 
                    name="first_name" 
                    defaultValue={profile?.first_name || ''} 
                    className="bg-zinc-950 border-zinc-800 text-white focus-visible:ring-amber-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name" className="text-zinc-400">Last Name</Label>
                  <Input 
                    id="last_name" 
                    name="last_name" 
                    defaultValue={profile?.last_name || ''} 
                    className="bg-zinc-950 border-zinc-800 text-white focus-visible:ring-amber-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-zinc-400">Email Address (Read Only)</Label>
                <Input 
                  id="email" 
                  defaultValue={user.email} 
                  readOnly 
                  disabled
                  className="bg-zinc-950/50 border-zinc-800/50 text-zinc-500 cursor-not-allowed"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-zinc-400">Phone Number</Label>
                <Input 
                  id="phone" 
                  name="phone" 
                  defaultValue={profile?.phone || ''} 
                  className="bg-zinc-950 border-zinc-800 text-white focus-visible:ring-amber-500"
                />
              </div>

              <Button type="submit" className="w-full sm:w-auto bg-amber-600 hover:bg-amber-700 text-white">
                Save Changes
              </Button>
            </form>
          </section>

          <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-6">Security</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-zinc-950 rounded-lg border border-zinc-800/50">
                <div>
                  <h3 className="font-medium text-zinc-200">Password</h3>
                  <p className="text-sm text-zinc-500">Update your account password</p>
                </div>
                <Button variant="outline" className="border-zinc-700 text-zinc-300 hover:text-white">Change</Button>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Avatar & Quick Stats */}
        <div className="space-y-8">
          <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-sm flex flex-col items-center text-center">
            <div className="w-32 h-32 rounded-full bg-zinc-800 border-4 border-zinc-950 mb-4 flex items-center justify-center overflow-hidden">
              <span className="text-3xl text-zinc-600 font-serif">
                {profile?.first_name?.[0] || 'A'}
              </span>
            </div>
            <Button variant="outline" className="w-full border-zinc-700 text-zinc-300 hover:text-white">
              Upload Avatar
            </Button>
            <p className="text-xs text-zinc-500 mt-4">JPEG, PNG or WEBP. Max 2MB.</p>
          </section>

          <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">Account Status</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-zinc-500">Role</span>
                <span className="px-2.5 py-1 bg-amber-500/10 text-amber-500 text-xs font-medium rounded-full uppercase tracking-wider">
                  {profile?.role}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-zinc-500">Member Since</span>
                <span className="text-sm text-zinc-300">
                  {new Date(profile?.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
