import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function CustomerDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-zinc-950 p-8 text-white">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Customer Portal</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-zinc-400">{user.email}</span>
            <Link href="/" className="text-sm bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded-md">
              Home
            </Link>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-xl shadow-lg">
            <h2 className="text-xl font-semibold mb-2">My Orders</h2>
            <p className="text-zinc-400 text-sm">Successfully verified Customer access level.</p>
          </div>
          <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-xl shadow-lg">
            <h2 className="text-xl font-semibold mb-2">My Profile</h2>
            <p className="text-zinc-400 text-sm">Manage shipping addresses and settings.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
