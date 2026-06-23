'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { User, MapPin, Package, ShieldCheck, Heart, CreditCard, Menu, X, LogOut, Home } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const supabase = createClient();

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await supabase.auth.signOut({ scope: 'local' });
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      router.push('/');
    }
  };

  const links = [
    { href: '/customer/profile', icon: User, label: 'Personal Details' },
    { href: '/customer/orders', icon: Package, label: 'Order History' },
    { href: '/customer/addresses', icon: MapPin, label: 'ADDRESS' },
    { href: '/customer/authenticity', icon: ShieldCheck, label: 'Authenticity Vault' },
    { href: '/customer/wishlist', icon: Heart, label: 'Saved Items' },
    { href: '/customer/payment', icon: CreditCard, label: 'Payment Security' },
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
    <div className="min-h-screen bg-background pt-12 md:pt-16 pb-12">

      {/* Mobile Header Bar */}
      <div className="md:hidden sticky top-8 z-40 bg-background/95 backdrop-blur border-b border-border px-4 py-3 flex items-center justify-between">
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
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex items-center gap-3 px-4 py-3 text-sm uppercase tracking-widest text-red-400 hover:bg-red-950/20 transition-colors border-t border-border"
          >
            <LogOut size={16} /> {isLoggingOut ? 'Signing Out...' : 'Sign Out'}
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 md:px-6 flex flex-col md:flex-row gap-8 md:gap-12 mt-6 md:mt-0">

        {/* Desktop Sidebar Navigation */}
        <aside className="w-full md:w-64 shrink-0 hidden md:block">
          <div className="sticky top-12">
            <h2 className="font-serif text-2xl mb-8 border-b border-border pb-4">My Account</h2>
            <nav className="flex flex-col gap-2">
              <NavLinks />
              <div className="mt-8 pt-6 border-t border-border space-y-2">
                <Link
                  href="/"
                  className="flex items-center gap-3 px-4 py-2 text-sm uppercase tracking-widest text-muted-foreground hover:text-white transition-colors"
                >
                  <Home size={16} /> Back to Site
                </Link>
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="flex items-center gap-3 px-4 py-2 text-sm uppercase tracking-widest text-red-400 hover:text-red-300 transition-colors w-full text-left"
                >
                  <LogOut size={16} /> {isLoggingOut ? 'Signing Out...' : 'Sign Out'}
                </button>
              </div>
            </nav>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 bg-card border border-border p-5 md:p-8 h-[calc(100vh-12rem)] overflow-y-auto shadow-sm rounded-xl">
          {children}
        </main>

      </div>
    </div>
  );
}
