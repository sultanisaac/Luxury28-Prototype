'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LogOut,
  Home as HomeIcon,
  Menu,
  X,
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  Tag,
  MessageSquare,
  Bell,
  Settings,
  ShieldAlert,
  UserCircle,
  MapPin,
  Heart,
  CreditCard
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/logo'
import { Info } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { CartSlideOut } from '@/components/cart-slideout'
import { useCart } from '@/context/CartContext'

interface NavItem {
  name: string
  href: string
  icon: string
}

interface SidebarProps {
  navItems: NavItem[]
  userEmail?: string
  role: 'admin' | 'staff' | 'customer'
  notificationComponent?: React.ReactNode
}

export function Sidebar({ navItems, userEmail, role, notificationComponent }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const supabase = createClient()
  const { itemCount } = useCart()
  const [isCartOpen, setIsCartOpen] = useState(false)

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)
      await supabase.auth.signOut({ scope: 'local' })
      window.location.href = '/'
    } catch (error) {
      console.error('Logout error:', error)
      // Fallback if window.location fails
      router.push('/')
    }
  }

  const iconMap: Record<string, any> = {
    LayoutDashboard,
    Users,
    Package,
    ShoppingCart,
    Tag,
    MessageSquare,
    Bell,
    Settings,
    ShieldAlert,
    UserCircle,
    MapPin,
    Heart,
    CreditCard
  }

  const activeColor = role === 'admin' ? 'text-amber-500' : role === 'staff' ? 'text-blue-400' : 'text-emerald-500'
  const activeBg = role === 'admin' ? 'bg-amber-500' : role === 'staff' ? 'bg-blue-400' : 'bg-emerald-500'
  const activeShadow = role === 'admin' ? 'shadow-[0_0_8px_rgba(245,158,11,0.6)]' : role === 'staff' ? 'shadow-[0_0_8px_rgba(96,165,250,0.6)]' : 'shadow-[0_0_8px_rgba(16,185,129,0.6)]'

  const NavLinks = ({ onClick }: { onClick?: () => void }) => (
    <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
      {navItems.map((item) => {
        if (item.name === 'Notifications' && notificationComponent) {
          return <div key={item.name} onClick={onClick}>{notificationComponent}</div>
        }
        const Icon = iconMap[item.icon] || LayoutDashboard
        const isActive = pathname === item.href
        return (
          <Link 
            key={item.name} 
            href={item.href}
            onClick={onClick}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors group ${
              isActive ? 'text-white bg-zinc-800/80' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
            }`}
          >
            <Icon size={18} className={`group-hover:${activeColor} transition-colors ${isActive ? activeColor : ''}`} />
            <span className="text-sm font-medium flex-1">{item.name}</span>
            {isActive && (
              <span className={`w-2 h-2 ${activeBg} rounded-full ${activeShadow}`}></span>
            )}
          </Link>
        )
      })}
    </nav>
  )

  const SidebarFooter = () => (
    <div className="p-4 border-t border-zinc-800 space-y-4">
      <div className="px-3">
        <p className="text-xs text-zinc-500 truncate">{userEmail}</p>
      </div>
      <div className="flex flex-col gap-2">
        <Button variant="outline" className="w-full justify-start text-zinc-400 border-zinc-800 hover:bg-zinc-800 hover:text-white rounded-md" asChild>
          <Link href="/">
            <HomeIcon size={16} className="mr-2" />
            Back to Site
          </Link>
        </Button>
        <Button 
          variant="ghost" 
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="w-full justify-start text-zinc-400 hover:text-red-400 hover:bg-red-950/30 rounded-md"
        >
          <LogOut size={16} className="mr-2" />
          {isLoggingOut ? 'Signing Out...' : 'Sign Out'}
        </Button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-zinc-900 border-r border-zinc-800 flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-zinc-800 gap-3">
          <Logo size={24} className="scale-90 origin-left" />
          {(process.env.NEXT_PUBLIC_IS_PROTOTYPE === 'true' || process.env.NODE_ENV === 'development') && (
            <div className="flex items-center gap-1 bg-amber-500/10 text-amber-500 text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded border border-amber-500/20">
              <Info size={10} />
              Demo
            </div>
          )}
        </div>
        <NavLinks />
        <SidebarFooter />
      </aside>

      {/* Mobile Header */}
      <header className="h-16 md:hidden border-b border-zinc-800 bg-zinc-900 flex items-center justify-between px-4 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white">
                <Menu size={24} />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 bg-zinc-900 border-zinc-800 w-72 flex flex-col">
              <SheetHeader className="h-16 flex flex-row items-center justify-between px-6 border-b border-zinc-800 text-left">
                <SheetTitle className="text-white font-serif tracking-tight">
                  <Logo size={20} />
                </SheetTitle>
              </SheetHeader>
              <div className="flex-1 overflow-y-auto">
                <NavLinks onClick={() => setOpen(false)} />
              </div>
              <SidebarFooter />
            </SheetContent>
          </Sheet>
          <div className="flex items-center gap-2">
            <Logo size={18} />
            {(process.env.NEXT_PUBLIC_IS_PROTOTYPE === 'true' || process.env.NODE_ENV === 'development') && (
              <div className="flex items-center gap-1 bg-amber-500/10 text-amber-500 text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded border border-amber-500/20">
                <Info size={10} />
                Demo
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          {role === 'customer' ? (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsCartOpen(true)}
              className="text-zinc-400 hover:text-white relative"
            >
              <ShoppingCart size={20} />
              {itemCount > 0 && (
                <span className="absolute top-1 right-1 bg-white text-zinc-950 text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                  {itemCount}
                </span>
              )}
            </Button>
          ) : (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="text-zinc-400 hover:text-white"
            >
              <LogOut size={20} />
            </Button>
          )}
        </div>
      </header>

      {/* Desktop Floating Cart Button for Customers */}
      {role === 'customer' && (
        <div className="hidden md:block fixed top-6 right-8 z-40">
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => setIsCartOpen(true)}
            className="bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full w-12 h-12 relative shadow-[0_0_15px_rgba(0,0,0,0.5)] transition-all hover:scale-105"
          >
            <ShoppingCart size={20} />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-white text-zinc-950 text-[11px] font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-md">
                {itemCount}
              </span>
            )}
          </Button>
        </div>
      )}

      {role === 'customer' && (
        <CartSlideOut isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      )}
    </>
  )
}
