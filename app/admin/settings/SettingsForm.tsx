'use client'

import { useState } from 'react'
import { Settings, Save, Globe, Shield, Bell, Mail, Share2, AlertTriangle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { updateStoreSettings, toggleMaintenanceMode } from './actions'
import { toast } from 'sonner'

interface SettingsFormProps {
  initialSettings: any[]
}

export default function SettingsForm({ initialSettings }: SettingsFormProps) {
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('General Identity')

  const findSetting = (key: string) => initialSettings.find(s => s.key === key)?.value || {}
  
  const [identity, setIdentity] = useState(findSetting('store_identity'))
  const [social, setSocial] = useState(findSetting('social_links'))
  const [maintenance, setMaintenance] = useState(findSetting('maintenance_mode'))

  const handleSave = async () => {
    setLoading(true)
    try {
      const result = await updateStoreSettings({
        store_identity: identity,
        social_links: social,
      })

      if (result.success) {
        toast.success('Settings updated successfully')
      } else {
        toast.error('Failed to update settings: ' + result.error)
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleMaintenanceToggle = async () => {
    const newState = !maintenance.enabled
    try {
      const result = await toggleMaintenanceMode(newState)
      if (result.success) {
        setMaintenance({ ...maintenance, enabled: newState })
        toast.success(`Maintenance mode ${newState ? 'activated' : 'deactivated'}`)
      }
    } catch (error) {
      toast.error('Failed to toggle maintenance mode')
    }
  }

  const tabs = [
    { label: 'General Identity', icon: Globe },
    { label: 'Contact & Support', icon: Mail },
    { label: 'SEO & Social', icon: Share2 },
    { label: 'Security & Access', icon: Shield },
    { label: 'Notifications', icon: Bell },
  ]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Navigation Tabs */}
      <div className="space-y-2">
        {tabs.map((tab) => (
          <button 
            key={tab.label} 
            onClick={() => setActiveTab(tab.label)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.label
              ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' 
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900 border border-transparent'
            }`}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}

        <div className={`mt-8 p-4 border rounded-xl transition-colors ${maintenance.enabled ? 'bg-red-950/40 border-red-500/50' : 'bg-zinc-900/50 border-zinc-800'}`}>
          <div className="flex items-start gap-3">
            <AlertTriangle size={18} className={maintenance.enabled ? 'text-red-500' : 'text-zinc-500'} />
            <div className="flex-1">
              <p className={`text-sm font-bold ${maintenance.enabled ? 'text-red-500' : 'text-zinc-400'}`}>Maintenance Mode</p>
              <p className="text-xs text-zinc-500 mt-1">Take your store offline for updates.</p>
              <button 
                onClick={handleMaintenanceToggle}
                className={`mt-3 px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${
                  maintenance.enabled 
                  ? 'bg-red-600 text-white hover:bg-red-500' 
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                }`}
              >
                {maintenance.enabled ? 'Deactivate' : 'Activate Now'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Form Content Area */}
      <div className="lg:col-span-2 space-y-6">
        <div className="p-8 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl space-y-6 relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
            <h2 className="text-xl font-bold text-white font-serif">{activeTab}</h2>
            <Button 
              onClick={handleSave} 
              disabled={loading}
              className="bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold px-6 h-9"
            >
              {loading ? <Loader2 size={18} className="animate-spin mr-2" /> : <Save size={18} className="mr-2" />}
              Save Changes
            </Button>
          </div>
          
          {activeTab === 'General Identity' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Store Name</label>
                <input 
                  type="text" 
                  value={identity.name || ''}
                  onChange={(e) => setIdentity({ ...identity, name: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-2.5 px-4 text-white focus:outline-none focus:border-amber-500/50 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Contact Email</label>
                <input 
                  type="email" 
                  value={identity.email || ''}
                  onChange={(e) => setIdentity({ ...identity, email: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-2.5 px-4 text-white focus:outline-none focus:border-amber-500/50 transition-all"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Tagline / SEO Description</label>
                <textarea 
                  rows={3}
                  value={identity.description || ''}
                  onChange={(e) => setIdentity({ ...identity, description: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-2.5 px-4 text-white focus:outline-none focus:border-amber-500/50 transition-all resize-none"
                />
              </div>
            </div>
          )}

          {activeTab === 'SEO & Social' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Instagram URL</label>
                <input 
                  type="text" 
                  value={social.instagram || ''}
                  onChange={(e) => setSocial({ ...social, instagram: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-2.5 px-4 text-white focus:outline-none focus:border-amber-500/50 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">X (Twitter) URL</label>
                <input 
                  type="text" 
                  value={social.x || ''}
                  onChange={(e) => setSocial({ ...social, x: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-2.5 px-4 text-white focus:outline-none focus:border-amber-500/50 transition-all"
                />
              </div>
            </div>
          )}

          {activeTab === 'Contact & Support' && (
            <div className="p-12 text-center text-zinc-500">
              <Mail size={40} className="mx-auto mb-4 opacity-20" />
              <p>Additional support settings coming soon.</p>
            </div>
          )}

          <div className="pt-4 border-t border-zinc-800 text-[10px] text-zinc-600 uppercase tracking-widest">
            Last updated: {new Date().toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  )
}
