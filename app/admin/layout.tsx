import { ReactNode } from 'react'
import { createClient } from '@/lib/supabase/server'
 
import NotificationIndicator from '@/components/admin/NotificationIndicator'
import { Sidebar } from '@/components/dashboard/Sidebar'

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const navItems = [
    { name: 'Overview', href: '/admin', icon: 'LayoutDashboard' },
    { name: 'Users & Roles', href: '/admin/users', icon: 'Users' },
    { name: 'Products', href: '/admin/products', icon: 'Package' },
    { name: 'Authenticity Vault', href: '/admin/authenticity', icon: 'ShieldCheck' },
    { name: 'Orders', href: '/admin/orders', icon: 'ShoppingCart' },
    { name: 'Marketing', href: '/admin/marketing', icon: 'Tag' },
    { name: 'Customer Support', href: '/admin/support', icon: 'MessageSquare' },
    { name: 'Notifications', href: '/admin/notifications', icon: 'Bell' },
    { name: 'Store Settings', href: '/admin/settings', icon: 'Settings' },
    { name: 'Audit Logs', href: '/admin/audit', icon: 'ShieldAlert' },
    { name: 'My Profile', href: '/admin/profile', icon: 'UserCircle' },
  ]

  return (
    <div className="h-screen bg-zinc-950 flex flex-col md:flex-row text-white font-sans overflow-hidden">
      <Sidebar 
        navItems={navItems} 
        userEmail={user?.email} 
        role="admin" 
        notificationComponent={<NotificationIndicator href="/admin/notifications" />}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
