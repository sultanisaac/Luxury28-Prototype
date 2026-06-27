import { ReactNode } from 'react'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/dashboard/Sidebar'

export default async function CustomerLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const navItems = [
    { name: 'Personal Details', href: '/customer/profile', icon: 'UserCircle' },
    { name: 'Order History', href: '/customer/orders', icon: 'Package' },
    { name: 'Address Book', href: '/customer/addresses', icon: 'MapPin' },
    { name: 'Authenticity Vault', href: '/customer/authenticity', icon: 'ShieldCheck' },
    { name: 'Saved Items', href: '/customer/wishlist', icon: 'Heart' },
    { name: 'Payment Security', href: '/customer/payment', icon: 'CreditCard' },
    { name: 'Support Tickets', href: '/customer/support', icon: 'MessageSquare' },
  ]

  return (
    <div className="h-screen bg-zinc-950 flex flex-col md:flex-row text-white font-sans overflow-hidden">
      <Sidebar 
        navItems={navItems} 
        userEmail={user?.email} 
        role="customer" 
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
