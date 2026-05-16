import { ReactNode } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { logout } from '@/app/auth/actions'
import { Button } from '@/components/ui/button'
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  UserCircle,
  LogOut,
  Home as HomeIcon,
  MessageSquare
 } from 'lucide-react'
 import { Logo } from '@/components/logo'

export default async function StaffLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const navItems = [
    { name: 'Overview', href: '/staff', icon: LayoutDashboard },
    { name: 'Fulfillment Queue', href: '/staff/orders', icon: ShoppingCart },
    { name: 'Product Manager', href: '/staff/products', icon: Package },
    { name: 'Support Inbox', href: '/staff/support', icon: MessageSquare },
    { name: 'My Profile', href: '/staff/profile', icon: UserCircle },
  ]

  return (
    <div className="min-h-screen bg-zinc-950 flex text-white font-sans">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-zinc-900 border-r border-zinc-800 flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-zinc-800">
          <Logo size={24} className="scale-90 origin-left" />
        </div>
        
        <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <Link 
                key={item.name} 
                href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-colors group"
              >
                <Icon size={18} className="group-hover:text-blue-400 transition-colors" />
                <span className="text-sm font-medium flex-1">{item.name}</span>
                {item.name === 'Overview' && (
                  <span className="w-2 h-2 bg-blue-400 rounded-full shadow-[0_0_8px_rgba(96,165,250,0.6)]"></span>
                )}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-zinc-800 space-y-4">
          <div className="px-3">
            <p className="text-xs text-zinc-500 truncate">{user?.email}</p>
          </div>
          <div className="flex flex-col gap-2">
            <Button variant="outline" className="w-full justify-start text-zinc-400 border-zinc-800 hover:bg-zinc-800 hover:text-white rounded-md" asChild>
              <Link href="/">
                <HomeIcon size={16} className="mr-2" />
                Back to Site
              </Link>
            </Button>
            <form action={logout}>
              <Button type="submit" variant="ghost" className="w-full justify-start text-zinc-400 hover:text-red-400 hover:bg-red-950/30 rounded-md">
                <LogOut size={16} className="mr-2" />
                Sign Out
              </Button>
            </form>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Mobile Header */}
        <header className="h-16 md:hidden border-b border-zinc-800 bg-zinc-900 flex items-center justify-between px-4">
          <Logo size={20} />
          <form action={logout}>
            <Button type="submit" variant="ghost" size="icon" className="text-zinc-400 hover:text-white">
              <LogOut size={18} />
            </Button>
          </form>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
