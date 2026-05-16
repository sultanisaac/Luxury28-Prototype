'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Camera, Save, Loader2, User, Lock } from 'lucide-react'
import { toast } from 'sonner'

export default function ProfileClient({ initialUser, initialProfile }: {
  initialUser: any
  initialProfile: any
}) {
  const supabase = createClient()
  const [profile, setProfile] = useState(initialProfile)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    first_name: initialProfile?.first_name || '',
    last_name: initialProfile?.last_name || '',
    phone: initialProfile?.phone || '',
  })
  const [passwords, setPasswords] = useState({ new: '', confirm: '' })
  const [pwLoading, setPwLoading] = useState(false)

  // Real-time sync
  useEffect(() => {
    const channel = supabase.channel('rt-customer-profile')
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'users', filter: `id=eq.${initialUser.id}` },
        (payload) => {
          setProfile(payload.new)
          setForm({
            first_name: payload.new.first_name || '',
            last_name: payload.new.last_name || '',
            phone: payload.new.phone || '',
          })
        }
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [supabase, initialUser.id])

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 1024 * 1024) {
      toast.error('Max file size is 1MB')
      e.target.value = ''
      return
    }
    setLoading(true)
    try {
      const ext = file.name.split('.').pop()
      const path = `${initialUser.id}/${initialUser.id}-${Date.now()}.${ext}`
      const { error: upErr } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
      if (upErr) throw upErr
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)
      const { error: dbErr } = await supabase.from('users').update({ avatar_url: publicUrl }).eq('id', initialUser.id)
      if (dbErr) throw dbErr
      toast.success('Avatar updated')
    } catch (err: any) {
      toast.error('Upload failed: ' + err.message)
    } finally {
      setLoading(false)
      e.target.value = ''
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { error } = await supabase.from('users').update(form).eq('id', initialUser.id)
      if (error) throw error
      toast.success('Profile updated')
    } catch (err: any) {
      toast.error('Error: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handlePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (passwords.new !== passwords.confirm) return toast.error('Passwords do not match')
    setPwLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: passwords.new })
      if (error) throw error
      toast.success('Password updated')
      setPasswords({ new: '', confirm: '' })
    } catch (err: any) {
      toast.error('Error: ' + err.message)
    } finally {
      setPwLoading(false)
    }
  }

  return (
    <div>
      <h1 className="font-serif text-3xl mb-8">Personal Details</h1>

      <div className="space-y-8 max-w-2xl">
        {/* Avatar */}
        <div className="flex items-center gap-6 pb-8 border-b border-border">
          <div className="relative group">
            <div className="w-24 h-24 rounded-full bg-zinc-800 border border-border flex items-center justify-center overflow-hidden">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : profile?.first_name ? (
                <span className="font-serif text-3xl text-zinc-500">{profile.first_name[0]}</span>
              ) : (
                <User size={32} className="text-zinc-500" />
              )}
            </div>
            <label className="absolute bottom-0 right-0 p-1.5 bg-primary text-background rounded-full cursor-pointer hover:scale-110 transition-transform">
              <Camera size={13} />
              <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={loading} />
            </label>
          </div>
          <div>
            <h3 className="font-medium text-lg mb-1">Profile Avatar</h3>
            <p className="text-xs text-muted-foreground">Max file size: 1MB</p>
          </div>
        </div>

        {/* Personal Info Form */}
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-muted-foreground">First Name</label>
              <input type="text" value={form.first_name} onChange={e => setForm({ ...form, first_name: e.target.value })}
                className="w-full bg-background border border-border p-3 focus:outline-none focus:border-primary transition-colors" />
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-muted-foreground">Last Name</label>
              <input type="text" value={form.last_name} onChange={e => setForm({ ...form, last_name: e.target.value })}
                className="w-full bg-background border border-border p-3 focus:outline-none focus:border-primary transition-colors" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-muted-foreground">Email Address</label>
            <input type="email" defaultValue={initialUser.email} disabled
              className="w-full bg-background/50 border border-border p-3 text-muted-foreground cursor-not-allowed" />
            <p className="text-xs text-muted-foreground mt-1">To change your email, please contact concierge support.</p>
          </div>
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-muted-foreground">Phone Number</label>
            <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
              placeholder="+1 (555) 000-0000"
              className="w-full bg-background border border-border p-3 focus:outline-none focus:border-primary transition-colors" />
          </div>
          <Button disabled={loading} type="submit" className="bg-primary text-background hover:bg-primary/90 rounded-none uppercase tracking-widest px-8">
            {loading ? <Loader2 size={16} className="animate-spin mr-2" /> : <Save size={16} className="mr-2" />}
            Save Changes
          </Button>
        </form>

        {/* Password */}
        <form onSubmit={handlePassword} className="pt-8 border-t border-border space-y-6">
          <div>
            <h3 className="font-serif text-xl mb-1 flex items-center gap-2"><Lock size={18} className="text-primary" /> Security</h3>
            <p className="text-sm text-muted-foreground">Update your account password.</p>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-muted-foreground">New Password</label>
              <input type="password" value={passwords.new} onChange={e => setPasswords({ ...passwords, new: e.target.value })}
                placeholder="••••••••" className="w-full bg-background border border-border p-3 focus:outline-none focus:border-primary" />
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-muted-foreground">Confirm Password</label>
              <input type="password" value={passwords.confirm} onChange={e => setPasswords({ ...passwords, confirm: e.target.value })}
                placeholder="••••••••" className="w-full bg-background border border-border p-3 focus:outline-none focus:border-primary" />
            </div>
          </div>
          <Button disabled={pwLoading} type="submit" variant="outline" className="rounded-none uppercase tracking-widest text-xs border-border hover:border-primary">
            {pwLoading ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
            Change Password
          </Button>
        </form>
      </div>
    </div>
  )
}
