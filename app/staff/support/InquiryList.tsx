'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  MessageSquare, 
  Search, 
  Mail, 
  User, 
  Clock, 
  CheckCircle2, 
  MoreVertical, 
  Trash2, 
  Archive,
  Eye,
  EyeOff
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { updateInquiryStatus, deleteInquiry } from './actions'
import { toast } from 'sonner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface InquiryListProps {
  initialInquiries: any[]
}

export default function InquiryList({ initialInquiries }: InquiryListProps) {
  const [inquiries, setInquiries] = useState(initialInquiries)
  const [filter, setFilter] = useState('')
  const [activeStatus, setActiveStatus] = useState('All')
  const [selectedInquiry, setSelectedInquiry] = useState<any | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const channel = supabase.channel('rt-support-inquiries')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'contact_inquiries' },
        async () => {
          const { data } = await supabase
            .from('contact_inquiries')
            .select('*')
            .order('created_at', { ascending: false })
          if (data) {
            setInquiries(data)
            // Keep selected inquiry in sync in real-time
            if (selectedInquiry) {
              const updated = data.find(i => i.id === selectedInquiry.id)
              if (updated) setSelectedInquiry(updated)
            }
          }
        }
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [supabase, selectedInquiry])

  const filteredInquiries = inquiries.filter(iq => {
    const matchesSearch = iq.name.toLowerCase().includes(filter.toLowerCase()) || 
                         iq.email.toLowerCase().includes(filter.toLowerCase()) ||
                         iq.subject?.toLowerCase().includes(filter.toLowerCase())
    const matchesStatus = activeStatus === 'All' || 
                         (activeStatus === 'Unread' && iq.status === 'unread') ||
                         (activeStatus === 'Archived' && iq.status === 'archived')
    return matchesSearch && matchesStatus
  })

  const handleStatusUpdate = async (id: string, status: any) => {
    const result = await updateInquiryStatus(id, status)
    if (result.success) toast.success(`Inquiry marked as ${status}`)
    else toast.error('Error: ' + result.error)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this inquiry?')) return
    const result = await deleteInquiry(id)
    if (result.success) toast.success('Inquiry deleted')
    else toast.error('Error: ' + result.error)
  }

  const handleOpenInquiry = async (inquiry: any) => {
    setSelectedInquiry(inquiry)
    if (inquiry.status === 'unread') {
      await handleStatusUpdate(inquiry.id, 'read')
    }
  }

  const stats = [
    { label: 'All', count: inquiries.length, color: 'text-zinc-400', bg: 'bg-zinc-800/50' },
    { label: 'Unread', count: inquiries.filter(i => i.status === 'unread').length, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { label: 'Archived', count: inquiries.filter(i => i.status === 'archived').length, color: 'text-zinc-500', bg: 'bg-zinc-800/30' },
  ]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Status Filter Cards */}
      <div className="lg:col-span-1 space-y-4">
        {stats.map((s) => (
          <div 
            key={s.label} 
            onClick={() => setActiveStatus(s.label)}
            className={`p-4 border rounded-xl flex items-center justify-between group cursor-pointer transition-all ${
              activeStatus === s.label 
              ? 'bg-zinc-900 border-blue-400/50 shadow-lg shadow-blue-400/5' 
              : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700'
            }`}
          >
            <span className={`text-sm font-medium transition-colors ${activeStatus === s.label ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-200'}`}>
              {s.label}
            </span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${s.bg} ${s.color}`}>
              {s.count}
            </span>
          </div>
        ))}
      </div>

      {/* Inquiries List */}
      <div className="lg:col-span-3 space-y-4">
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
          <input 
            type="text" 
            placeholder="Search by name, email, or subject..." 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-blue-400/50 transition-all shadow-xl backdrop-blur-sm"
          />
        </div>

        <div className="space-y-3">
          {filteredInquiries.length === 0 ? (
            <div className="p-20 text-center bg-zinc-900/50 border border-zinc-800 border-dashed rounded-2xl">
              <MessageSquare size={40} className="mx-auto mb-4 text-zinc-700" />
              <p className="text-zinc-500">No inquiries found matching your criteria.</p>
            </div>
          ) : (
            filteredInquiries.map((inquiry) => (
              <div 
                key={inquiry.id} 
                onClick={() => handleOpenInquiry(inquiry)}
                className={`p-5 bg-zinc-900 border transition-all group flex items-start justify-between rounded-2xl hover:shadow-2xl hover:shadow-blue-500/5 cursor-pointer ${
                  inquiry.status === 'unread' ? 'border-blue-400/20 bg-blue-400/[0.02]' : 'border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-2xl border transition-all ${
                    inquiry.status === 'unread' 
                    ? 'border-blue-400/30 bg-zinc-950 text-blue-400 shadow-[0_0_15px_rgba(96,165,250,0.2)]' 
                    : 'border-zinc-800 bg-zinc-950 text-zinc-600'
                  }`}>
                    <MessageSquare size={18} />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className={`text-sm font-bold ${inquiry.status === 'unread' ? 'text-white' : 'text-zinc-300'}`}>
                        {inquiry.subject || 'No Subject'}
                      </h4>
                      {inquiry.status === 'unread' && (
                        <span className="flex h-2 w-2 rounded-full bg-blue-400 animate-pulse"></span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-400 line-clamp-2 max-w-xl leading-relaxed mb-2">
                      {inquiry.message}
                    </p>
                    <div className="flex flex-wrap items-center gap-4 mt-2">
                      <span className="flex items-center gap-1.5 text-[11px] font-medium text-zinc-500">
                        <User size={12} />
                        {inquiry.name}
                      </span>
                      <span className="flex items-center gap-1.5 text-[11px] font-medium text-zinc-500">
                        <Mail size={12} />
                        {inquiry.email}
                      </span>
                      <span className="flex items-center gap-1.5 text-[11px] font-medium text-zinc-500">
                        <Clock size={12} />
                        {new Date(inquiry.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleStatusUpdate(inquiry.id, inquiry.status === 'unread' ? 'read' : 'unread')}
                    className="text-zinc-500 hover:text-blue-400 rounded-full"
                    title={inquiry.status === 'unread' ? 'Mark as Read' : 'Mark as Unread'}
                  >
                    {inquiry.status === 'unread' ? <Eye size={18} /> : <EyeOff size={18} />}
                  </Button>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-zinc-500 hover:text-white rounded-full">
                        <MoreVertical size={18} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800 text-white">
                      <DropdownMenuItem 
                        onClick={() => handleStatusUpdate(inquiry.id, 'replied')}
                        className="gap-2 focus:bg-zinc-800 focus:text-white"
                      >
                        <CheckCircle2 size={16} className="text-emerald-500" />
                        Mark as Replied
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleStatusUpdate(inquiry.id, 'archived')}
                        className="gap-2 focus:bg-zinc-800 focus:text-white"
                      >
                        <Archive size={16} className="text-purple-400" />
                        Archive
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDelete(inquiry.id)}
                        className="gap-2 text-red-400 focus:bg-red-950/30 focus:text-red-400"
                      >
                        <Trash2 size={16} />
                        Delete Permanently
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Detail Modal */}
      <Dialog open={!!selectedInquiry} onOpenChange={(open) => !open && setSelectedInquiry(null)}>
        <DialogContent className="sm:max-w-xl lg:max-w-2xl w-[95vw] bg-zinc-950 border-zinc-800 text-white overflow-hidden p-0 gap-0">
          {selectedInquiry && (
            <>
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-blue-400" />
              
              <DialogHeader className="p-8 border-b border-zinc-900 bg-zinc-900/30">
                <DialogTitle className="text-2xl font-serif flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-blue-400">
                    <MessageSquare size={20} />
                  </div>
                  <div>
                    <span className="block text-xl font-bold">{selectedInquiry.subject || 'No Subject'}</span>
                    <span className="text-xs text-zinc-500 font-mono tracking-widest uppercase font-bold">Support Inquiry</span>
                  </div>
                </DialogTitle>
              </DialogHeader>

              <div className="p-8 space-y-6">
                {/* Contact Profile Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl space-y-1">
                    <span className="text-[10px] text-zinc-500 uppercase font-bold block">Customer Name</span>
                    <span className="text-sm font-medium text-white block">{selectedInquiry.name}</span>
                  </div>
                  <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl space-y-1">
                    <span className="text-[10px] text-zinc-500 uppercase font-bold block">Email Address</span>
                    <a 
                      href={`mailto:${selectedInquiry.email}`}
                      className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors block truncate"
                    >
                      {selectedInquiry.email}
                    </a>
                  </div>
                </div>

                {/* Inquiry Message */}
                <div className="space-y-2">
                  <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold block">Message</span>
                  <div className="bg-zinc-900 border border-zinc-800/80 rounded-xl p-5 text-sm text-zinc-300 leading-relaxed font-light whitespace-pre-line max-h-[30vh] overflow-y-auto">
                    {selectedInquiry.message}
                  </div>
                </div>

                {/* Metadata Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl space-y-1">
                    <span className="text-[10px] text-zinc-500 uppercase font-bold block">Current Status</span>
                    <span className={`inline-block text-xs uppercase tracking-widest font-bold px-2 py-0.5 rounded mt-1 ${
                      selectedInquiry.status === 'unread' ? 'text-blue-400 bg-blue-400/10' :
                      selectedInquiry.status === 'replied' ? 'text-emerald-500 bg-emerald-500/10' :
                      selectedInquiry.status === 'archived' ? 'text-purple-400 bg-purple-400/10' :
                      'text-zinc-400 bg-zinc-800'
                    }`}>
                      {selectedInquiry.status}
                    </span>
                  </div>
                  <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl space-y-1">
                    <span className="text-[10px] text-zinc-500 uppercase font-bold block">Submitted At</span>
                    <span className="text-xs text-zinc-300 font-medium block mt-1">
                      {new Date(selectedInquiry.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Action Controls */}
                <div className="flex flex-wrap items-center justify-between pt-6 border-t border-zinc-900 gap-4">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        const nextStatus = selectedInquiry.status === 'unread' ? 'read' : 'unread'
                        handleStatusUpdate(selectedInquiry.id, nextStatus)
                        setSelectedInquiry({ ...selectedInquiry, status: nextStatus })
                      }}
                      className="border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-900"
                    >
                      {selectedInquiry.status === 'unread' ? 'Mark as Read' : 'Mark as Unread'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        handleStatusUpdate(selectedInquiry.id, 'archived')
                        setSelectedInquiry({ ...selectedInquiry, status: 'archived' })
                      }}
                      className="border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-900"
                    >
                      Archive Inquiry
                    </Button>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="destructive"
                      onClick={async () => {
                        if (confirm('Are you sure you want to delete this inquiry permanently?')) {
                          const result = await deleteInquiry(selectedInquiry.id)
                          if (result.success) {
                            toast.success('Inquiry deleted')
                            setSelectedInquiry(null)
                          } else {
                            toast.error('Error: ' + result.error)
                          }
                        }
                      }}
                      className="bg-red-950/40 hover:bg-red-900/60 border border-red-900/50 text-red-200"
                    >
                      Delete Inquiry
                    </Button>
                    
                    <Button
                      asChild
                      className="bg-blue-500 text-zinc-950 hover:bg-blue-400"
                    >
                      <a href={`mailto:${selectedInquiry.email}?subject=Re: ${encodeURIComponent(selectedInquiry.subject || '')}`}>
                        Reply via Email
                      </a>
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
