'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Bell, Clock, Info, AlertTriangle, CheckCircle, Search, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

interface NotificationListProps {
  initialNotifications: any[]
}

export default function NotificationList({ initialNotifications }: NotificationListProps) {
  const [notifications, setNotifications] = useState(initialNotifications)
  const [searchTerm, setSearchTerm] = useState('')
  const supabase = createClient()

  useEffect(() => {
    const channel = supabase
      .channel('realtime-notifications-page')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications' },
        async () => {
          const { data } = await supabase
            .from('notifications')
            .select('*')
            .order('created_at', { ascending: false })
          if (data) setNotifications(data)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'order': return <CheckCircle size={16} className="text-blue-400" />
      case 'inventory': return <AlertTriangle size={16} className="text-amber-500" />
      case 'system': return <Info size={16} className="text-zinc-400" />
      case 'payment': return <AlertTriangle size={16} className="text-red-500" />
      default: return <Bell size={16} className="text-zinc-500" />
    }
  }

  const markAsRead = async (id: string) => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id)
    
    if (error) toast.error('Failed to update notification')
  }

  const markAllAsRead = async () => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('is_read', false)
    
    if (error) toast.error('Failed to update notifications')
    else toast.success('All marked as read')
  }

  const filteredNotifications = notifications.filter(n => 
    n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    n.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diff < 60) return 'Just now'
    if (diff < 3600) return `${Math.floor(diff / 60)} mins ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-white">
        <div>
          <h1 className="text-3xl font-bold font-serif tracking-wide text-white drop-shadow-md">Notifications</h1>
          <p className="text-zinc-400 mt-2">Manage all system alerts and platform activity in real-time.</p>
        </div>
        <Button 
          variant="outline" 
          onClick={markAllAsRead}
          className="border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-md"
        >
          Mark all as read
        </Button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
          <Input 
            placeholder="Search notifications..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:ring-amber-500"
          />
        </div>
        <div className="flex items-center gap-2 text-[10px] font-bold text-amber-500 bg-amber-500/5 px-3 py-1.5 rounded-full border border-amber-500/10">
          <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></span>
          Live Feed Active
        </div>
      </div>

      <div className="space-y-4">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((notif) => (
            <div 
              key={notif.id} 
              onClick={() => !notif.is_read && markAsRead(notif.id)}
              className={`p-6 bg-zinc-900 border ${notif.is_read ? 'border-zinc-800/50' : 'border-amber-500/30 bg-amber-500/[0.01]'} rounded-xl shadow-sm hover:border-amber-500/50 transition-all duration-300 relative group cursor-pointer`}
            >
              {!notif.is_read && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500 rounded-l-xl"></div>
              )}
              
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg bg-zinc-950 border border-zinc-800/50`}>
                  {getTypeIcon(notif.type)}
                </div>
                
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className={`font-bold tracking-wide ${notif.is_read ? 'text-zinc-300' : 'text-white'}`}>
                      {notif.title}
                    </h3>
                    <div className="flex items-center gap-1 text-xs text-zinc-500">
                      <Clock size={12} />
                      {formatTime(notif.created_at)}
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
          ))
        ) : (
          <div className="p-20 text-center bg-zinc-900/50 border border-zinc-800 border-dashed rounded-2xl">
            <Bell size={40} className="mx-auto mb-4 text-zinc-700" />
            <p className="text-zinc-500 font-serif">No notifications found.</p>
          </div>
        )}
      </div>
    </div>
  )
}
