import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { User } from 'lucide-react'

export default async function CustomerProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: userData } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div>
      <h1 className="font-serif text-3xl mb-8">Personal Details</h1>
      
      <div className="space-y-8 max-w-2xl">
        <div className="flex items-center gap-6 pb-8 border-b border-border">
          <div className="w-24 h-24 rounded-full bg-zinc-800 border border-border flex items-center justify-center overflow-hidden">
            {userData?.first_name ? (
              <span className="font-serif text-3xl text-zinc-500">{userData.first_name[0]}</span>
            ) : (
              <User size={32} className="text-zinc-500" />
            )}
          </div>
          <div>
            <h3 className="font-medium text-lg mb-2">Profile Avatar</h3>
            <div className="flex gap-4">
              <Button variant="outline" className="text-xs uppercase tracking-widest rounded-none">Upload New</Button>
              <Button variant="ghost" className="text-xs uppercase tracking-widest rounded-none text-red-400 hover:text-red-300 hover:bg-transparent">Remove</Button>
            </div>
          </div>
        </div>

        <form className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-muted-foreground">First Name</label>
              <input 
                type="text" 
                defaultValue={userData?.first_name || ''} 
                className="w-full bg-background border border-border p-3 focus:outline-none focus:border-primary transition-colors"
                placeholder="Enter your first name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-muted-foreground">Last Name</label>
              <input 
                type="text" 
                defaultValue={userData?.last_name || ''} 
                className="w-full bg-background border border-border p-3 focus:outline-none focus:border-primary transition-colors"
                placeholder="Enter your last name"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-muted-foreground">Email Address</label>
            <input 
              type="email" 
              defaultValue={user.email} 
              disabled
              className="w-full bg-background/50 border border-border p-3 text-muted-foreground cursor-not-allowed"
            />
            <p className="text-xs text-muted-foreground mt-1">To change your email address, please contact concierge support.</p>
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-muted-foreground">Phone Number</label>
            <input 
              type="tel" 
              defaultValue={userData?.phone || ''} 
              className="w-full bg-background border border-border p-3 focus:outline-none focus:border-primary transition-colors"
              placeholder="+1 (555) 000-0000"
            />
          </div>

          <Button type="button" className="bg-primary text-background hover:bg-primary/90 rounded-none uppercase tracking-widest px-8">
            Save Changes
          </Button>
        </form>

        <div className="pt-8 border-t border-border mt-12">
           <h3 className="font-serif text-xl mb-4 text-red-400">Security</h3>
           <p className="text-sm text-muted-foreground mb-4">Update your password or manage active sessions.</p>
           <Button variant="outline" className="rounded-none uppercase tracking-widest text-xs border-border hover:border-primary">
             Change Password
           </Button>
        </div>
      </div>
    </div>
  )
}
