import { ReactNode } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { logout } from '@/app/auth/actions'
import { Button } from '@/components/ui/button'
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  ShoppingCart, 
  ShieldAlert, 
  UserCircle,
  LogOut,
  Home as HomeIcon,
  Bell
} from 'lucide-react'

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const navItems = [
    { name: 'Overview', href: '/admin', icon: LayoutDashboard },
    { name: 'Users & Roles', href: '/admin/users', icon: Users },
    { name: 'Products', href: '/admin/products', icon: Package },
    { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
    { name: 'Notifications', href: '/admin/notifications', icon: Bell },
    { name: 'Audit Logs', href: '/admin/audit', icon: ShieldAlert },
    { name: 'My Profile', href: '/admin/profile', icon: UserCircle },
  ]

  return (
    <div className="min-h-screen bg-zinc-950 flex text-white font-sans">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-zinc-900 border-r border-zinc-800 flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-zinc-800">
          <Link href="/admin" className="font-serif text-xl tracking-widest font-bold">LUXURY28 <span className="text-amber-500 text-xs tracking-normal ml-1">ADMIN</span></Link>
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
                <Icon size={18} className="group-hover:text-amber-500 transition-colors" />
                <span className="text-sm font-medium flex-1">{item.name}</span>
                {item.name === 'Overview' && (
                  <span className="w-2 h-2 bg-amber-500 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.6)]"></span>
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
          <Link href="/admin" className="font-serif text-lg tracking-widest font-bold">LUXURY28 <span className="text-amber-500 text-[10px] tracking-normal ml-1">ADMIN</span></Link>
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
