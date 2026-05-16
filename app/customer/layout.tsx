'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { User, MapPin, Package, ShieldCheck, Heart, CreditCard, Menu, X } from 'lucide-react';

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const links = [
    { href: '/customer/profile', icon: User, label: 'Personal Details' },
    { href: '/customer/orders', icon: Package, label: 'Order History' },
    { href: '/customer/addresses', icon: MapPin, label: 'ADDRESS' },
    { href: '/customer/authenticity', icon: ShieldCheck, label: 'Authenticity Vault' },
    { href: '/customer/wishlist', icon: Heart, label: 'Saved Items' },
    { href: '/customer/payment', icon: CreditCard, label: 'Payment Settings' },
  ];

  const NavLinks = ({ onClick }: { onClick?: () => void }) => (
    <>
      {links.map((link) => {
        const Icon = link.icon;
        const isActive = pathname === link.href || pathname?.startsWith(`${link.href}/`);
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={onClick}
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
    </>
  );

  return (
    <div className="min-h-screen bg-background pt-16 md:pt-24 pb-12">

      {/* Mobile Header Bar */}
      <div className="md:hidden sticky top-16 z-40 bg-background/95 backdrop-blur border-b border-border px-4 py-3 flex items-center justify-between">
        <span className="font-serif text-lg">My Account</span>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="text-muted-foreground hover:text-white transition-colors p-1"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Slide-down Nav */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-card border-b border-border flex flex-col shadow-xl z-30">
          <NavLinks onClick={() => setMobileMenuOpen(false)} />
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 md:px-6 flex flex-col md:flex-row gap-8 md:gap-12 mt-6 md:mt-0">

        {/* Desktop Sidebar Navigation */}
        <aside className="w-full md:w-64 shrink-0 hidden md:block">
          <div className="sticky top-32">
            <h2 className="font-serif text-2xl mb-8 border-b border-border pb-4">My Account</h2>
            <nav className="flex flex-col gap-2">
              <NavLinks />
            </nav>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 bg-card border border-border p-5 md:p-8 min-h-[600px] shadow-sm">
          {children}
        </main>

      </div>
    </div>
  );
}
