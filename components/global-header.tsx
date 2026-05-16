'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { User, LogOut, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { logout } from '@/app/auth/actions';
import { CartSlideOut } from '@/components/cart-slideout';
import { Logo } from '@/components/logo';

import { useCart } from '@/context/CartContext';

export function GlobalHeader() {
  const { itemCount } = useCart();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const pathname = usePathname();

  // Hide header on admin and staff routes to keep their dashboards clean
  const isAdminOrStaffRoute = pathname?.startsWith('/admin') || pathname?.startsWith('/staff');

  useEffect(() => {
    const supabase = createClient();
    
    const getUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (user) {
        const { data } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single();
        setUserRole(data?.role || null);
      }
      setLoading(false);
    };

    getUserData();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        setUserRole(null);
      } else {
        // Re-fetch role on auth change
        getUserData();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (isAdminOrStaffRoute) return null;

  const isHome = pathname === '/';
  const headerBg = (isHome && !isScrolled) ? 'bg-transparent border-transparent' : 'bg-background/95 backdrop-blur-md border-b border-border shadow-sm';

  // Only show cart to unauthenticated users or users with 'customer' role
  const showCart = !loading && (!user || userRole === 'customer');

  return (
    <>
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${headerBg}`}>
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Logo />
          
          <div className="hidden md:flex items-center gap-8 text-sm uppercase tracking-widest text-muted-foreground">
            <Link href="/products" className="hover:text-primary transition-colors">Products</Link>
            <Link href={isHome ? "#trust" : "/#trust"} className="hover:text-primary transition-colors">About</Link>
            <Link href={isHome ? "#faq" : "/#faq"} className="hover:text-primary transition-colors">FAQ</Link>
          </div>

          <div className="flex items-center gap-4">
            {!loading && (
              user ? (
                <div className="flex items-center gap-2 sm:gap-6">
                  {showCart && (
                    <Button variant="ghost" onClick={() => setIsCartOpen(true)} className="text-muted-foreground hover:text-white flex items-center gap-2 uppercase tracking-widest text-xs px-2 sm:px-4">
                      <div className="relative">
                        <ShoppingCart size={16} />
                        {itemCount > 0 && (
                          <span className="absolute -top-2 -right-2 bg-primary text-background text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                            {itemCount}
                          </span>
                        )}
                      </div>
                      <span className="hidden sm:inline">Cart</span>
                    </Button>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" className="text-muted-foreground hover:text-white uppercase tracking-widest text-xs hidden md:flex items-center gap-2" asChild>
                      <Link href="/dashboard-redirect">
                        <User size={16} /> My Account
                      </Link>
                    </Button>
                    <form action={logout}>
                      <Button variant="outline" type="submit" className="border-primary text-primary hover:bg-primary hover:text-background rounded-none px-4 flex items-center gap-2 h-9">
                        <LogOut size={14} /> <span className="hidden lg:inline">Sign Out</span>
                      </Button>
                    </form>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 sm:gap-4">
                  {showCart && (
                    <Button variant="ghost" onClick={() => setIsCartOpen(true)} className="text-muted-foreground hover:text-white flex items-center gap-2 uppercase tracking-widest text-xs px-2 sm:px-4">
                      <div className="relative">
                        <ShoppingCart size={16} />
                        {itemCount > 0 && (
                          <span className="absolute -top-2 -right-2 bg-primary text-background text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                            {itemCount}
                          </span>
                        )}
                      </div>
                      <span className="hidden sm:inline">Cart</span>
                    </Button>
                  )}
                  <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-background rounded-none px-6 h-9" asChild>
                    <Link href="/login">Client Portal</Link>
                  </Button>
                </div>
              )
            )}
          </div>
        </div>
      </nav>

      {showCart && <CartSlideOut isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />}
    </>
  );
}
