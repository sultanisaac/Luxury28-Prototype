import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Bell, Clock, Info, AlertTriangle, CheckCircle, Search, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

// Extended Mock Data
const mockNotifications = [
  { id: 1, title: 'New order received', description: 'ORD-2026-891 from John Smith', time: '2 mins ago', type: 'order', priority: 'high', read: false },
  { id: 2, title: 'Low stock alert', description: 'Rolex Submariner (2 left in stock)', time: '45 mins ago', type: 'inventory', priority: 'medium', read: false },
  { id: 3, title: 'System update', description: 'Backend migration completed successfully', time: '2 hours ago', type: 'system', priority: 'low', read: true },
  { id: 4, title: 'New customer registration', description: 'Sarah Jenkins joined the platform', time: '5 hours ago', type: 'user', priority: 'low', read: true },
  { id: 5, title: 'Payment failed', description: 'Transaction #TX99102 failed for ORD-2026-880', time: '1 day ago', type: 'payment', priority: 'high', read: true },
  { id: 6, title: 'Shipping update', description: 'ORD-2026-875 has been marked as Shipped', time: '1 day ago', type: 'order', priority: 'medium', read: true },
  { id: 7, title: 'Database Backup', description: 'Daily backup successfully stored in S3', time: '2 days ago', type: 'system', priority: 'low', read: true },
  { id: 8, title: 'Review pending', description: 'New product review awaits moderation', time: '2 days ago', type: 'user', priority: 'medium', read: true },
]

export default async function NotificationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) notFound()

  // Verify Admin Role
  const { data: userData } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (userData?.role !== 'admin') notFound()

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'order': return <CheckCircle size={16} className="text-blue-400" />
      case 'inventory': return <AlertTriangle size={16} className="text-amber-500" />
      case 'system': return <Info size={16} className="text-zinc-400" />
      case 'payment': return <AlertTriangle size={16} className="text-red-500" />
      default: return <Bell size={16} className="text-zinc-500" />
    }
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-white">
        <div>
          <h1 className="text-3xl font-bold font-serif tracking-wide">Notifications</h1>
          <p className="text-zinc-400 mt-2">Manage all system alerts and platform activity.</p>
        </div>
        <Button variant="outline" className="border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-md">
          Mark all as read
        </Button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
          <Input 
            placeholder="Search notifications..." 
            className="pl-10 bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:ring-amber-500"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-zinc-800 bg-zinc-900 text-zinc-400 flex items-center gap-2 px-4">
            <Filter size={16} /> All Types
          </Button>
          <Button variant="outline" className="border-zinc-800 bg-zinc-900 text-zinc-400 flex items-center gap-2 px-4">
            Newest First
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {mockNotifications.map((notif) => (
          <div 
            key={notif.id} 
            className={`p-6 bg-zinc-900 border ${notif.read ? 'border-zinc-800/50' : 'border-amber-500/30'} rounded-xl shadow-sm hover:border-amber-500/50 transition-all duration-300 relative group cursor-pointer`}
          >
            {!notif.read && (
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500 rounded-l-xl"></div>
            )}
            
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-lg bg-zinc-950 border border-zinc-800/50`}>
                {getTypeIcon(notif.type)}
              </div>
              
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className={`font-bold tracking-wide ${notif.read ? 'text-zinc-300' : 'text-white'}`}>
                    {notif.title}
                  </h3>
                  <div className="flex items-center gap-1 text-xs text-zinc-500">
                    <Clock size={12} />
                    {notif.time}
                  </div>
                </div>
                <p className="text-sm text-zinc-400 leading-relaxed max-w-2xl">{notif.description}</p>
                
                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-zinc-800/50">
                  <span className={`text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 rounded ${
                    notif.priority === 'high' ? 'text-red-400 bg-red-400/10' : 
                    notif.priority === 'medium' ? 'text-amber-400 bg-amber-400/10' : 
                    'text-zinc-500 bg-zinc-800'
                  }`}>
                    {notif.priority} Priority
                  </span>
                  <button className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 hover:text-white transition-colors">
                    Dismiss
                  </button>
                  <button className="text-[10px] uppercase tracking-widest font-bold text-amber-500 hover:text-amber-400 transition-colors">
                    View Detail
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center pt-8">
        <Button variant="ghost" className="text-zinc-500 hover:text-white uppercase tracking-widest text-xs font-bold">
          Load Older Notifications
        </Button>
      </div>
    </div>
  )
}
