'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, MapPin, Package, ShieldCheck, Heart } from 'lucide-react';

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const links = [
    { href: '/customer/profile', icon: User, label: 'Personal Details' },
    { href: '/customer/orders', icon: Package, label: 'Order History' },
    { href: '/customer/addresses', icon: MapPin, label: 'Address Book' },
    { href: '/customer/authenticity', icon: ShieldCheck, label: 'Authenticity Vault' },
    { href: '/customer/wishlist', icon: Heart, label: 'Saved Items' },
  ];

  return (
    <div className="min-h-screen bg-background pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row gap-12">
        
        {/* Sidebar Navigation */}
        <aside className="w-full md:w-64 shrink-0">
          <div className="sticky top-32">
            <h2 className="font-serif text-2xl mb-8 border-b border-border pb-4">My Account</h2>
            <nav className="flex flex-col gap-2">
              {links.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href || pathname?.startsWith(`${link.href}/`);
                return (
                  <Link 
                    key={link.href} 
                    href={link.href} 
                    className={`flex items-center gap-3 px-4 py-3 text-sm uppercase tracking-widest transition-colors ${
                      isActive 
                        ? 'bg-primary text-background' 
                        : 'text-muted-foreground hover:text-white hover:bg-card'
                    }`}
                  >
                    <Icon size={16} /> {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 bg-card border border-border p-8 min-h-[600px] shadow-sm">
          {children}
        </main>
        
      </div>
    </div>
  );
}
