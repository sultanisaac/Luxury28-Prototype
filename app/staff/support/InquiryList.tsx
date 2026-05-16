'use client'

import { useState, useEffect } from 'react'
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

interface InquiryListProps {
  initialInquiries: any[]
}

export default function InquiryList({ initialInquiries }: InquiryListProps) {
  const [inquiries, setInquiries] = useState(initialInquiries)
  const [filter, setFilter] = useState('')
  const [activeStatus, setActiveStatus] = useState('All')
  const supabase = createClient()

  useEffect(() => {
    const channel = supabase.channel('rt-support-inquiries')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'contact_inquiries' },
        async () => {
          const { data } = await supabase
            .from('contact_inquiries')
            .select('*')
            .order('created_at', { ascending: false })
          if (data) setInquiries(data)
        }
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [supabase])

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
                className={`p-5 bg-zinc-900 border transition-all group flex items-start justify-between rounded-2xl hover:shadow-2xl hover:shadow-blue-500/5 ${
                  inquiry.status === 'unread' ? 'border-blue-400/20 bg-blue-400/[0.02]' : 'border-zinc-800'
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
                
                <div className="flex items-center gap-1">
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
    </div>
  )
}
