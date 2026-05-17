'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Bell, Clock, Info, AlertTriangle, CheckCircle, Search, Trash2, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface NotificationListProps {
  initialNotifications: any[]
}

export default function NotificationList({ initialNotifications }: NotificationListProps) {
  const [notifications, setNotifications] = useState(initialNotifications)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedNotif, setSelectedNotif] = useState<any | null>(null)
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
          if (data) {
            setNotifications(data)
            // Update selected notification details in real-time if open
            if (selectedNotif) {
              const updated = data.find(n => n.id === selectedNotif.id)
              if (updated) setSelectedNotif(updated)
            }
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, selectedNotif])

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

  const toggleReadStatus = async (notif: any) => {
    const nextRead = !notif.is_read
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: nextRead })
      .eq('id', notif.id)
    
    if (error) {
      toast.error('Failed to update status')
    } else {
      toast.success(nextRead ? 'Marked as read' : 'Marked as unread')
    }
  }

  const deleteNotification = async (id: string) => {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id)
    
    if (error) {
      toast.error('Failed to delete notification')
    } else {
      toast.success('Notification deleted successfully')
      setSelectedNotif(null)
    }
  }

  const markAllAsRead = async () => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('is_read', false)
    
    if (error) toast.error('Failed to update notifications')
    else toast.success('All marked as read')
  }

  const handleOpenNotification = async (notif: any) => {
    setSelectedNotif(notif)
    if (!notif.is_read) {
      await markAsRead(notif.id)
    }
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
              onClick={() => handleOpenNotification(notif)}
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
                    <button 
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteNotification(notif.id)
                      }}
                      className="text-[10px] uppercase tracking-widest font-bold text-red-500 hover:text-red-400 transition-colors flex items-center gap-1"
                    >
                      <Trash2 size={12} />
                      Delete
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation()
                        handleOpenNotification(notif)
                      }}
                      className="text-[10px] uppercase tracking-widest font-bold text-amber-500 hover:text-amber-400 transition-colors flex items-center gap-1"
                    >
                      <Eye size={12} />
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

      {/* Detail Modal */}
      <Dialog open={!!selectedNotif} onOpenChange={(open) => !open && setSelectedNotif(null)}>
        <DialogContent className="sm:max-w-xl w-[95vw] bg-zinc-950 border-zinc-800 text-white overflow-hidden p-0 gap-0">
          {selectedNotif && (
            <>
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-600 to-amber-400" />
              
              <DialogHeader className="p-8 border-b border-zinc-900 bg-zinc-900/30">
                <DialogTitle className="text-2xl font-serif flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800">
                    {getTypeIcon(selectedNotif.type)}
                  </div>
                  <div>
                    <span className="block text-xl font-bold">{selectedNotif.title}</span>
                    <span className="text-xs text-zinc-500 font-mono tracking-widest uppercase font-bold">{selectedNotif.type || 'system'} alert</span>
                  </div>
                </DialogTitle>
              </DialogHeader>

              <div className="p-8 space-y-6">
                <div className="space-y-2">
                  <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Details & Message</span>
                  <div className="bg-zinc-900 border border-zinc-800/80 rounded-xl p-5 text-sm text-zinc-300 leading-relaxed font-light whitespace-pre-line">
                    {selectedNotif.description}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl">
                    <span className="text-[10px] text-zinc-500 uppercase font-bold block">Priority</span>
                    <span className={`inline-block mt-2 text-xs uppercase tracking-widest font-bold px-2 py-0.5 rounded ${
                      selectedNotif.priority === 'high' ? 'text-red-400 bg-red-400/10' : 
                      selectedNotif.priority === 'medium' ? 'text-amber-400 bg-amber-400/10' : 
                      'text-zinc-500 bg-zinc-800'
                    }`}>
                      {selectedNotif.priority}
                    </span>
                  </div>
                  <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl">
                    <span className="text-[10px] text-zinc-500 uppercase font-bold block">Received</span>
                    <span className="text-xs text-zinc-300 font-medium block mt-2">
                      {new Date(selectedNotif.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-zinc-900 gap-4">
                  <Button
                    variant="outline"
                    onClick={() => toggleReadStatus(selectedNotif)}
                    className="border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-900 flex items-center gap-2"
                  >
                    {selectedNotif.is_read ? 'Mark as Unread' : 'Mark as Read'}
                  </Button>

                  <div className="flex gap-3">
                    <Button
                      variant="destructive"
                      onClick={() => deleteNotification(selectedNotif.id)}
                      className="bg-red-950/40 hover:bg-red-900/60 border border-red-900/50 text-red-200 flex items-center gap-2"
                    >
                      <Trash2 size={14} />
                      Delete Alert
                    </Button>
                    <Button
                      onClick={() => setSelectedNotif(null)}
                      className="bg-white text-zinc-950 hover:bg-zinc-200"
                    >
                      Close
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
