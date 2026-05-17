'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  Save, 
  Globe, 
  Shield, 
  Bell, 
  Mail, 
  Share2, 
  AlertTriangle, 
  Loader2,
  Lock,
  Unlock
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { 
  updateStoreSettings, 
  toggleMaintenanceMode 
} from './actions'
import { toast } from 'sonner'

interface SettingsFormProps {
  initialSettings: any[]
}

export default function SettingsForm({ initialSettings }: SettingsFormProps) {
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('General Identity')
  const [settings, setSettings] = useState(initialSettings)
  const [isLocked, setIsLocked] = useState(true) // Lock settings by default
  const supabase = createClient()

  useEffect(() => {
    const channel = supabase
      .channel('realtime-settings')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'store_settings' },
        async () => {
          const { data } = await supabase.from('store_settings').select('*')
          if (data) setSettings(data)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  const findSetting = (key: string) => settings.find(s => s.key === key)?.value || {}
  
  const [identity, setIdentity] = useState(findSetting('store_identity'))
  const [social, setSocial] = useState(findSetting('social_links'))
  const [maintenance, setMaintenance] = useState(findSetting('maintenance_mode'))
  const [support, setSupport] = useState(findSetting('contact_support'))
  const [security, setSecurity] = useState(findSetting('security_access'))
  const [notificationsRule, setNotificationsRule] = useState(findSetting('notification_rules'))

  // Sync local state when settings change from remote
  useEffect(() => {
    setIdentity(findSetting('store_identity'))
    setSocial(findSetting('social_links'))
    setMaintenance(findSetting('maintenance_mode'))
    setSupport(findSetting('contact_support'))
    setSecurity(findSetting('security_access'))
    setNotificationsRule(findSetting('notification_rules'))
  }, [settings])

  const handleSave = async () => {
    if (isLocked) {
      toast.error('Settings panel is locked. Please unlock it to save changes.')
      return
    }

    setLoading(true)
    try {
      let payload: Record<string, any> = {}
      
      if (activeTab === 'General Identity') {
        payload = { store_identity: identity }
      } else if (activeTab === 'SEO & Social') {
        payload = { social_links: social }
      } else if (activeTab === 'Contact & Support') {
        payload = { contact_support: support }
      } else if (activeTab === 'Security & Access') {
        payload = { security_access: security }
      } else if (activeTab === 'Notifications') {
        payload = { notification_rules: notificationsRule }
      }

      const result = await updateStoreSettings(payload)

      if (result.success) {
        toast.success(`${activeTab} settings saved successfully`)
      } else {
        toast.error('Failed to save settings: ' + result.error)
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleMaintenanceToggle = async () => {
    if (isLocked) {
      toast.error('Settings panel is locked. Please unlock it to update maintenance mode.')
      return
    }

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
    <div className="space-y-6">
      {/* Premium Security Lock Banner */}
      <div className={`p-4 border rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-300 ${
        isLocked 
        ? 'bg-amber-950/20 border-amber-500/30 text-amber-500' 
        : 'bg-emerald-950/20 border-emerald-500/30 text-emerald-400'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-lg ${isLocked ? 'bg-amber-500/10' : 'bg-emerald-500/10'}`}>
            {isLocked ? <Lock size={20} /> : <Unlock size={20} />}
          </div>
          <div>
            <p className="text-sm font-bold tracking-wide uppercase font-serif">
              {isLocked ? 'Security Status: Locked' : 'Security Status: Unlocked'}
            </p>
            <p className="text-xs text-zinc-400 mt-0.5">
              {isLocked 
                ? 'Administrative configuration changes are currently restricted to prevent accidental modifications.' 
                : 'Configuration controls are unlocked. Exercise absolute caution when modifying keys.'}
            </p>
          </div>
        </div>
        <Button
          onClick={() => {
            const nextState = !isLocked
            setIsLocked(nextState)
            toast.success(nextState ? 'Settings panel locked.' : 'Settings panel unlocked for modifications.')
          }}
          className={`h-9 font-bold px-4 flex items-center gap-2 transition-all ${
            isLocked 
            ? 'bg-amber-500 hover:bg-amber-600 text-zinc-950' 
            : 'bg-zinc-800 hover:bg-zinc-700 text-white'
          }`}
        >
          {isLocked ? (
            <>
              <Unlock size={16} />
              Unlock Panel
            </>
          ) : (
            <>
              <Lock size={16} />
              Lock Panel
            </>
          )}
        </Button>
      </div>

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
                  disabled={isLocked}
                  onClick={handleMaintenanceToggle}
                  className={`mt-3 px-3 py-1.5 text-xs font-bold rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
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
                disabled={loading || isLocked}
                className="bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold px-6 h-9 disabled:opacity-40 disabled:cursor-not-allowed"
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
                    disabled={isLocked}
                    value={identity.name || ''}
                    onChange={(e) => setIdentity({ ...identity, name: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-2.5 px-4 text-white focus:outline-none focus:border-amber-500/50 transition-all text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Contact Email</label>
                  <input 
                    type="email" 
                    disabled={isLocked}
                    value={identity.email || ''}
                    onChange={(e) => setIdentity({ ...identity, email: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-2.5 px-4 text-white focus:outline-none focus:border-amber-500/50 transition-all text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Support Phone</label>
                  <input 
                    type="text" 
                    disabled={isLocked}
                    value={identity.phone || ''}
                    onChange={(e) => setIdentity({ ...identity, phone: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-2.5 px-4 text-white focus:outline-none focus:border-amber-500/50 transition-all text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Tagline / SEO Description</label>
                  <textarea 
                    rows={3}
                    disabled={isLocked}
                    value={identity.description || ''}
                    onChange={(e) => setIdentity({ ...identity, description: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-2.5 px-4 text-white focus:outline-none focus:border-amber-500/50 transition-all resize-none text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                  />
                </div>
              </div>
            )}

            {activeTab === 'Contact & Support' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Support Working Hours</label>
                  <input 
                    type="text" 
                    disabled={isLocked}
                    value={support.hours || ''}
                    onChange={(e) => setSupport({ ...support, hours: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-2.5 px-4 text-white focus:outline-none focus:border-amber-500/50 transition-all text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Default Ticket Assignment</label>
                  <select 
                    disabled={isLocked}
                    value={support.assignment || 'staff'}
                    onChange={(e) => setSupport({ ...support, assignment: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-2.5 px-4 text-white focus:outline-none focus:border-amber-500/50 transition-all text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <option value="staff" className="bg-zinc-950 text-white">Operational Staff</option>
                    <option value="admin" className="bg-zinc-950 text-white">Administrators Only</option>
                  </select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Auto-Reply Confirmation Message</label>
                  <textarea 
                    rows={4}
                    disabled={isLocked}
                    value={support.auto_reply || ''}
                    onChange={(e) => setSupport({ ...support, auto_reply: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-2.5 px-4 text-white focus:outline-none focus:border-amber-500/50 transition-all resize-none text-sm disabled:opacity-40 disabled:cursor-not-allowed"
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
                    disabled={isLocked}
                    value={social.instagram || ''}
                    onChange={(e) => setSocial({ ...social, instagram: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-2.5 px-4 text-white focus:outline-none focus:border-amber-500/50 transition-all text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">X (Twitter) URL</label>
                  <input 
                    type="text" 
                    disabled={isLocked}
                    value={social.x || ''}
                    onChange={(e) => setSocial({ ...social, x: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-2.5 px-4 text-white focus:outline-none focus:border-amber-500/50 transition-all text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Facebook URL</label>
                  <input 
                    type="text" 
                    disabled={isLocked}
                    value={social.facebook || ''}
                    onChange={(e) => setSocial({ ...social, facebook: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-2.5 px-4 text-white focus:outline-none focus:border-amber-500/50 transition-all text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">LinkedIn URL</label>
                  <input 
                    type="text" 
                    disabled={isLocked}
                    value={social.linkedin || ''}
                    onChange={(e) => setSocial({ ...social, linkedin: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-2.5 px-4 text-white focus:outline-none focus:border-amber-500/50 transition-all text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                  />
                </div>
              </div>
            )}

            {activeTab === 'Security & Access' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Minimum Password Length</label>
                  <input 
                    type="number" 
                    disabled={isLocked}
                    value={security.min_password_len || 8}
                    onChange={(e) => setSecurity({ ...security, min_password_len: parseInt(e.target.value) })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-2.5 px-4 text-white focus:outline-none focus:border-amber-500/50 transition-all text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Registration Policy</label>
                  <select 
                    disabled={isLocked}
                    value={security.allow_registration ? 'allow' : 'invite'}
                    onChange={(e) => setSecurity({ ...security, allow_registration: e.target.value === 'allow' })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-2.5 px-4 text-white focus:outline-none focus:border-amber-500/50 transition-all text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <option value="allow" className="bg-zinc-950 text-white">Public (Anyone can register)</option>
                    <option value="invite" className="bg-zinc-950 text-white">Restricted (Invite Only)</option>
                  </select>
                </div>
                <div className="space-y-3 md:col-span-2 pt-4 border-t border-zinc-800">
                  <div className="flex items-center justify-between bg-zinc-950 p-4 border border-zinc-800/80 rounded-xl">
                    <div>
                      <span className="text-sm font-bold text-white block">Require Two-Factor Authentication</span>
                      <span className="text-xs text-zinc-500 mt-1">Force all staff and administrative users to set up 2FA.</span>
                    </div>
                    <input 
                      type="checkbox"
                      disabled={isLocked}
                      checked={!!security.enable_2fa}
                      onChange={(e) => setSecurity({ ...security, enable_2fa: e.target.checked })}
                      className="w-5 h-5 accent-amber-500 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'Notifications' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Low Inventory Threshold</label>
                  <input 
                    type="number" 
                    disabled={isLocked}
                    value={notificationsRule.low_inventory || 5}
                    onChange={(e) => setNotificationsRule({ ...notificationsRule, low_inventory: parseInt(e.target.value) })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-2.5 px-4 text-white focus:outline-none focus:border-amber-500/50 transition-all text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                  />
                  <p className="text-[10px] text-zinc-600">Triggers an alert when product stock drops below this number.</p>
                </div>

                <div className="space-y-4 md:col-span-2 pt-4 border-t border-zinc-800">
                  <div className="flex items-center justify-between bg-zinc-950 p-4 border border-zinc-800/80 rounded-xl">
                    <div>
                      <span className="text-sm font-bold text-white block">Email Alerts on Orders</span>
                      <span className="text-xs text-zinc-500 mt-1">Send a summary notification to administrative emails on new customer checkout.</span>
                    </div>
                    <input 
                      type="checkbox"
                      disabled={isLocked}
                      checked={!!notificationsRule.email_on_order}
                      onChange={(e) => setNotificationsRule({ ...notificationsRule, email_on_order: e.target.checked })}
                      className="w-5 h-5 accent-amber-500 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    />
                  </div>
                  <div className="flex items-center justify-between bg-zinc-950 p-4 border border-zinc-800/80 rounded-xl">
                    <div>
                      <span className="text-sm font-bold text-white block">Email Alerts on Support Tickets</span>
                      <span className="text-xs text-zinc-500 mt-1">Send a notification to customer service staff when a new support inquiry is filed.</span>
                    </div>
                    <input 
                      type="checkbox"
                      disabled={isLocked}
                      checked={!!notificationsRule.email_on_ticket}
                      onChange={(e) => setNotificationsRule({ ...notificationsRule, email_on_ticket: e.target.checked })}
                      className="w-5 h-5 accent-amber-500 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-zinc-800 text-[10px] text-zinc-600 uppercase tracking-widest">
              Last updated: {new Date().toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
