'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  History, 
  Search, 
  Filter, 
  Activity, 
  Clock, 
  Database,
  ShieldCheck,
  UserCog,
  AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'

interface RealtimeAuditProps {
  initialLogs: any[]
}

export default function RealtimeAudit({ initialLogs }: RealtimeAuditProps) {
  const [logs, setLogs] = useState(initialLogs)
  const [searchTerm, setSearchTerm] = useState('')
  const supabase = createClient()

  useEffect(() => {
    const channel = supabase
      .channel(`realtime-audit-${Math.random().toString(36).substring(7)}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'audit_logs' },
        async (payload) => {
          // Fetch the full log with user details for the new entry
          const { data } = await supabase
            .from('audit_logs')
            .select(`
              *,
              users:user_id (
                first_name,
                last_name,
                role
              )
            `)
            .eq('id', payload.new.id)
            .single()
          
          if (data) {
            setLogs(prev => [data, ...prev].slice(0, 50))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  const getActionColor = (action: string) => {
    if (action.includes('CREATE') || action.includes('INSERT')) return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20'
    if (action.includes('UPDATE')) return 'text-amber-500 bg-amber-500/10 border-amber-500/20'
    if (action.includes('DELETE')) return 'text-red-500 bg-red-500/10 border-red-500/20'
    return 'text-blue-400 bg-blue-500/10 border-blue-500/20'
  }

  const filteredLogs = logs.filter(log => 
    log.action_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${log.users?.first_name} ${log.users?.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-8">
      {/* Logs Dashboard Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Events', value: logs.length.toString(), icon: Database, color: 'text-zinc-400' },
          { label: 'Security Alerts', value: '0', icon: AlertCircle, color: 'text-red-500' },
          { label: 'Admin Actions', value: logs.filter(l => l.role === 'admin').length.toString(), icon: ShieldCheck, color: 'text-amber-500' },
          { label: 'Staff Actions', value: logs.filter(l => l.role === 'staff').length.toString(), icon: UserCog, color: 'text-blue-400' },
        ].map((stat, i) => (
          <div key={i} className="p-5 bg-zinc-900/50 border border-zinc-800 rounded-2xl backdrop-blur-sm shadow-xl">
            <div className="flex items-center gap-3 mb-3">
              <stat.icon size={18} className={stat.color} />
              <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{stat.label}</span>
            </div>
            <p className="text-2xl font-bold text-white font-serif">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Audit Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-zinc-800 bg-zinc-900/50 flex flex-wrap gap-4 items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
            <input 
              type="text" 
              placeholder="Filter by action, user, or resource..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-all shadow-inner"
            />
          </div>
          <div className="flex items-center gap-2 text-[10px] font-bold text-amber-500 bg-amber-500/5 px-3 py-1.5 rounded-full border border-amber-500/10">
            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></span>
            Live Audit Stream Active
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-zinc-950/30">
              <TableRow className="border-zinc-800 hover:bg-transparent">
                <TableHead className="px-6 py-4 text-zinc-500 font-bold uppercase tracking-tighter text-[10px]">Timestamp</TableHead>
                <TableHead className="px-6 py-4 text-zinc-500 font-bold uppercase tracking-tighter text-[10px]">Actor</TableHead>
                <TableHead className="px-6 py-4 text-zinc-500 font-bold uppercase tracking-tighter text-[10px]">Action</TableHead>
                <TableHead className="px-6 py-4 text-zinc-500 font-bold uppercase tracking-tighter text-[10px]">Resource</TableHead>
                <TableHead className="px-6 py-4 text-zinc-500 font-bold uppercase tracking-tighter text-[10px] text-right">Reference</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <TableRow key={log.id} className="border-zinc-800 hover:bg-zinc-800/20 transition-all group">
                    <TableCell className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-zinc-400 font-mono text-xs">
                        <Clock size={12} className="text-zinc-600" />
                        {new Date(log.created_at).toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[10px] font-bold text-zinc-400">
                          {log.users?.first_name?.[0] || 'U'}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white leading-none">{log.users?.first_name} {log.users?.last_name}</p>
                          <p className="text-[10px] text-zinc-500 mt-1 uppercase tracking-tighter">{log.role}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border ${getActionColor(log.action_type)}`}>
                        {log.action_type.replace(/_/g, ' ')}
                      </span>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-zinc-300">
                        <Activity size={14} className="text-zinc-600" />
                        {log.resource}
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-right">
                      <span className="text-xs font-mono text-zinc-600 bg-zinc-950 px-2 py-1 rounded-md border border-zinc-800 group-hover:border-zinc-700 transition-colors">
                        {log.id.slice(0, 8)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="py-20 text-center">
                    <History size={40} className="mx-auto mb-4 text-zinc-800" />
                    <p className="text-zinc-500 text-sm font-serif">No audit events found.</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
