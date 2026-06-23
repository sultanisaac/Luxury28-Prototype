'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  User, 
  Mail, 
  Phone, 
  Lock, 
  Shield, 
  Camera, 
  Save, 
  Loader2,
  Key
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { updateProfile, updatePassword } from './actions'
import { toast } from 'sonner'

interface ProfileFormProps {
  user: any
}

export default function ProfileForm({ user: initialUser }: ProfileFormProps) {
  const [loading, setLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [user, setUser] = useState(initialUser)
  const supabase = createClient()

  useEffect(() => {
    const channel = supabase
      .channel(`realtime-profile-${Math.random().toString(36).substring(7)}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'users', filter: `id=eq.${user.id}` },
        (payload) => {
          setUser(payload.new)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, user.id])

  const [profileData, setProfileData] = useState({
    first_name: user.first_name || '',
    last_name: user.last_name || '',
    phone: user.phone || '',
    avatar_url: user.avatar_url || ''
  })

  // Sync local state when remote data changes
  useEffect(() => {
    setProfileData({
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      phone: user.phone || '',
      avatar_url: user.avatar_url || ''
    })
  }, [user])

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 1MB Limit
    if (file.size > 1024 * 1024) {
      return toast.error('File size must be less than 1MB')
    }

    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}-${Math.random()}.${fileExt}`
    const filePath = `${user.id}/${fileName}`

    setLoading(true)
    try {
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      const result = await updateProfile({
        ...profileData,
        avatar_url: publicUrl
      })

      if (result.success) {
        toast.success('Avatar updated')
      } else {
        toast.error('Error saving avatar URL')
      }
    } catch (err: any) {
      console.error('Avatar upload error:', err)
      toast.error('Error uploading avatar: ' + err.message)
    } finally {
      setLoading(false)
      // Reset input value so onChange fires even for same file
      e.target.value = ''
    }
  }

  const [passwords, setPasswords] = useState({
    new: '',
    confirm: ''
  })

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const result = await updateProfile(profileData)
      if (result.success) toast.success('Profile updated successfully')
      else toast.error('Error: ' + result.error)
    } catch (err) {
      toast.error('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (passwords.new !== passwords.confirm) {
      return toast.error('Passwords do not match')
    }
    setPasswordLoading(true)
    try {
      const result = await updatePassword(passwords.new)
      if (result.success) {
        toast.success('Password updated')
        setPasswords({ new: '', confirm: '' })
      } else {
        toast.error('Error: ' + result.error)
      }
    } catch (err) {
      toast.error('An unexpected error occurred')
    } finally {
      setPasswordLoading(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Profile Sidebar */}
      <div className="lg:col-span-1 space-y-6">
        <div className="p-8 bg-zinc-900 border border-zinc-800 rounded-2xl text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-amber-700"></div>
          <div className="relative inline-block group mb-4">
            <div className="w-24 h-24 rounded-full bg-zinc-950 border-2 border-amber-500/30 flex items-center justify-center text-3xl font-serif text-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.15)] overflow-hidden">
              {profileData.avatar_url ? (
                <img src={profileData.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <>{profileData.first_name?.[0]}{profileData.last_name?.[0]}</>
              )}
            </div>
            <label className="absolute bottom-0 right-0 p-2 bg-amber-500 text-zinc-950 rounded-full shadow-xl hover:scale-110 transition-transform cursor-pointer">
              <Camera size={14} />
              <input 
                type="file" 
                className="hidden" 
                accept="image/*"
                onChange={handleAvatarUpload}
                disabled={loading}
              />
            </label>
          </div>
          <p className="text-[10px] text-zinc-500 uppercase tracking-tighter mt-2 italic">Max file size: 1MB</p>
          <h3 className="text-xl font-bold text-white font-serif mt-4">{profileData.first_name} {profileData.last_name}</h3>
          <p className="text-xs text-zinc-500 uppercase tracking-widest mt-1 font-bold">{user.role}</p>
          
          <div className="mt-8 space-y-3 pt-6 border-t border-zinc-800/50">
            <div className="flex items-center gap-3 text-sm text-zinc-400">
              <Shield size={14} className="text-amber-500" />
              <span>Admin Access Active</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-zinc-400">
              <Lock size={14} className="text-amber-500" />
              <span>2FA Enabled</span>
            </div>
          </div>
        </div>
      </div>

      {/* Forms Area */}
      <div className="lg:col-span-2 space-y-8">
        {/* Personal Details */}
        <form onSubmit={handleProfileSubmit} className="p-8 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl space-y-6">
          <h2 className="text-xl font-bold text-white font-serif flex items-center gap-3">
            <User className="text-amber-500" size={20} />
            Personal Details
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">First Name</label>
              <input 
                required
                type="text" 
                value={profileData.first_name}
                onChange={(e) => setProfileData({ ...profileData, first_name: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-amber-500/50 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Last Name</label>
              <input 
                required
                type="text" 
                value={profileData.last_name}
                onChange={(e) => setProfileData({ ...profileData, last_name: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-amber-500/50 transition-all"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
                <input 
                  type="tel" 
                  placeholder="+1 (555) 000-0000"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-amber-500/50 transition-all"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <Button disabled={loading} className="bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold px-8 shadow-xl shadow-amber-500/10">
              {loading ? <Loader2 size={18} className="animate-spin mr-2" /> : <Save size={18} className="mr-2" />}
              Update Profile
            </Button>
          </div>
        </form>

        {/* Security Settings */}
        <form onSubmit={handlePasswordSubmit} className="p-8 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl space-y-6">
          <h2 className="text-xl font-bold text-white font-serif flex items-center gap-3">
            <Key className="text-amber-500" size={20} />
            Security & Password
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">New Password</label>
              <input 
                required
                type="password" 
                placeholder="••••••••"
                value={passwords.new}
                onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-amber-500/50 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Confirm Password</label>
              <input 
                required
                type="password" 
                placeholder="••••••••"
                value={passwords.confirm}
                onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-amber-500/50 transition-all"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <Button disabled={passwordLoading} className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold px-8">
              {passwordLoading ? <Loader2 size={18} className="animate-spin mr-2" /> : 'Update Password'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
