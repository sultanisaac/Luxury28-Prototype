import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Activity, Clock } from 'lucide-react'

// Mock Data
const mockAuditLogs = [
  { id: '1', user: 'sultan.admin@luxury28.com', role: 'admin', action: 'UPDATE', resource: 'products (ID: 1)', created_at: '2026-05-11T20:45:12Z' },
  { id: '2', user: 'staff1@luxury28.com', role: 'staff', action: 'UPDATE', resource: 'orders (ID: 402)', created_at: '2026-05-11T19:30:00Z' },
  { id: '3', user: 'staff1@luxury28.com', role: 'staff', action: 'INSERT', resource: 'products (ID: 8)', created_at: '2026-05-11T14:15:22Z' },
  { id: '4', user: 'sultan.admin@luxury28.com', role: 'admin', action: 'DELETE', resource: 'users (ID: 99)', created_at: '2026-05-10T10:05:00Z' },
  { id: '5', user: 'system', role: 'system', action: 'INSERT', resource: 'audit_logs (ID: 5)', created_at: '2026-05-10T09:00:00Z' },
]

export default async function AuditPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) notFound()

  // Verify Admin Role
  const { data: userData } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (userData?.role !== 'admin') notFound()

  const getActionColor = (action: string) => {
    switch (action) {
      case 'INSERT': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
      case 'UPDATE': return 'text-amber-400 bg-amber-500/10 border-amber-500/20'
      case 'DELETE': return 'text-red-400 bg-red-500/10 border-red-500/20'
      default: return 'text-zinc-400 bg-zinc-800 border-zinc-700'
    }
  }

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold font-serif tracking-wide">System Audit Logs</h1>
        <p className="text-zinc-400 mt-2">Global oversight of sensitive mutations across the platform.</p>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-zinc-800 flex items-center gap-2 text-sm text-zinc-400">
          <Activity size={16} className="text-amber-500" /> Live monitoring active
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-400">
            <thead className="bg-zinc-950/50 border-b border-zinc-800 text-zinc-300 uppercase tracking-wider text-xs">
              <tr>
                <th className="px-6 py-4 font-medium">Timestamp</th>
                <th className="px-6 py-4 font-medium">User</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium">Action</th>
                <th className="px-6 py-4 font-medium">Resource</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {mockAuditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-zinc-800/20 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-zinc-300">
                      <Clock size={14} className="text-zinc-500" />
                      {new Date(log.created_at).toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-zinc-200">
                    {log.user}
                  </td>
                  <td className="px-6 py-4 uppercase tracking-wider text-xs">
                    {log.role}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono border ${getActionColor(log.action)}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-zinc-300">
                    {log.resource}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
