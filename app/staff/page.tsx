import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { logout } from '@/app/auth/actions'
import { Button } from '@/components/ui/button'
import { LogOut, Home as HomeIcon } from 'lucide-react'

export default async function StaffDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (userData?.role !== 'staff') {
    notFound()
  }

  return (
    <div className="min-h-screen bg-zinc-950 p-8 text-white">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Staff Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-zinc-400">{user.email}</span>
            <Link href="/" className="text-sm bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded-md flex items-center gap-2">
              <HomeIcon size={14} /> Home
            </Link>
            <form action={logout}>
              <Button variant="ghost" type="submit" className="text-zinc-400 hover:text-white hover:bg-zinc-800 flex items-center gap-2">
                <LogOut size={14} /> Sign Out
              </Button>
            </form>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-xl shadow-lg">
            <h2 className="text-xl font-semibold mb-2">Order Fulfillment</h2>
            <p className="text-zinc-400 text-sm">Successfully verified Staff access level.</p>
          </div>
          <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-xl shadow-lg">
            <h2 className="text-xl font-semibold mb-2">Inventory Management</h2>
            <p className="text-zinc-400 text-sm">Manage products and stock quantities.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
