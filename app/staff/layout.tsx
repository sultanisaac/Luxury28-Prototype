import { ReactNode } from 'react'
import { createClient } from '@/lib/supabase/server'
 import { Sidebar } from '@/components/dashboard/Sidebar'

export default async function StaffLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const navItems = [
    { name: 'Overview', href: '/staff', icon: 'LayoutDashboard' },
    { name: 'Fulfillment Queue', href: '/staff/orders', icon: 'ShoppingCart' },
    { name: 'Product Manager', href: '/staff/products', icon: 'Package' },
    { name: 'Support Inbox', href: '/staff/support', icon: 'MessageSquare' },
    { name: 'Customers', href: '/staff/customers', icon: 'Users' },
    { name: 'My Profile', href: '/staff/profile', icon: 'UserCircle' },
  ]

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col md:flex-row text-white font-sans">
      <Sidebar 
        navItems={navItems} 
        userEmail={user?.email} 
        role="staff" 
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
