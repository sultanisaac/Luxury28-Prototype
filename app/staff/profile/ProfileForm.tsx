'use client'

import { useState } from 'react'
import { 
  User, 
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

export default function ProfileForm({ user }: ProfileFormProps) {
  const [loading, setLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [profileData, setProfileData] = useState({
    first_name: user.first_name || '',
    last_name: user.last_name || '',
    phone: user.phone || ''
  })
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
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-blue-600"></div>
          <div className="relative inline-block group mb-4">
            <div className="w-24 h-24 rounded-full bg-zinc-950 border-2 border-blue-400/30 flex items-center justify-center text-3xl font-serif text-blue-400 shadow-[0_0_30px_rgba(96,165,250,0.15)]">
              {profileData.first_name?.[0]}{profileData.last_name?.[0]}
            </div>
            <button className="absolute bottom-0 right-0 p-2 bg-blue-500 text-white rounded-full shadow-xl hover:scale-110 transition-transform">
              <Camera size={14} />
            </button>
          </div>
          <h3 className="text-xl font-bold text-white font-serif">{profileData.first_name} {profileData.last_name}</h3>
          <p className="text-xs text-zinc-500 uppercase tracking-widest mt-1 font-bold">{user.role}</p>
          
          <div className="mt-8 space-y-3 pt-6 border-t border-zinc-800/50">
            <div className="flex items-center gap-3 text-sm text-zinc-400">
              <Shield size={14} className="text-blue-400" />
              <span>Staff Access Active</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-zinc-400">
              <Lock size={14} className="text-blue-400" />
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
            <User className="text-blue-400" size={20} />
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
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-blue-400/50 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Last Name</label>
              <input 
                required
                type="text" 
                value={profileData.last_name}
                onChange={(e) => setProfileData({ ...profileData, last_name: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-blue-400/50 transition-all"
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
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-blue-400/50 transition-all"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <Button disabled={loading} className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-8 shadow-xl shadow-blue-500/10">
              {loading ? <Loader2 size={18} className="animate-spin mr-2" /> : <Save size={18} className="mr-2" />}
              Update Profile
            </Button>
          </div>
        </form>

        {/* Security Settings */}
        <form onSubmit={handlePasswordSubmit} className="p-8 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl space-y-6">
          <h2 className="text-xl font-bold text-white font-serif flex items-center gap-3">
            <Key className="text-blue-400" size={20} />
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
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-blue-400/50 transition-all"
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
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-blue-400/50 transition-all"
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
