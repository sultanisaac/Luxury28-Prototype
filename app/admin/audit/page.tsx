import { createClient } from '@/lib/supabase/server'
import { History } from 'lucide-react'
import { Button } from '@/components/ui/button'
import RealtimeAudit from './RealtimeAudit'

export default async function AuditPage() {
  const supabase = await createClient()
  
  const { data: logs } = await supabase
    .from('audit_logs')
    .select(`
      *,
      users:user_id (
        first_name,
        last_name,
        role
      )
    `)
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-serif tracking-wide text-white drop-shadow-md">Global Audit Trail</h1>
          <p className="text-zinc-400 mt-2">Comprehensive system logs tracking all administrative actions and security events in real-time.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-zinc-800 text-zinc-400 hover:bg-zinc-800">
            <History size={18} className="mr-2" />
            Archive Logs
          </Button>
        </div>
      </div>

      <RealtimeAudit initialLogs={logs || []} />
    </div>
  )
}
