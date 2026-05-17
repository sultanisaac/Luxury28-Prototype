import { Lock, Home } from 'lucide-react'
import Link from 'next/link'

export default async function StoreSettingsPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center space-y-6 relative overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-500">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600" />
        
        {/* Glow effect */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl" />
        
        <div className="mx-auto w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
          <Lock size={32} className="animate-pulse" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold font-serif text-white tracking-wide">Settings Restricted</h1>
          <p className="text-xs font-mono text-amber-500 uppercase tracking-widest font-bold">Module Unavailable</p>
        </div>

        <p className="text-sm text-zinc-400 font-light leading-relaxed">
          The Store Configuration module has been temporarily locked by the platform system administrator. Direct edits and settings adjustments are currently unavailable.
        </p>

        <div className="pt-4 border-t border-zinc-800 flex flex-col gap-2">
          <Link href="/admin">
            <span className="w-full bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold py-2.5 px-4 rounded-xl text-sm transition-all flex items-center justify-center gap-2 cursor-pointer">
              <Home size={16} />
              Return to Dashboard
            </span>
          </Link>
        </div>
      </div>
    </div>
  )
}
