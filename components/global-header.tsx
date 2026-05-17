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

import { motion, AnimatePresence } from 'framer-motion';
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

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  if (isAdminOrStaffRoute) return null;

  const isHome = pathname === '/';
  const headerBg = (isHome && !isScrolled) ? 'bg-transparent border-transparent' : 'bg-background/95 backdrop-blur-md border-b border-border shadow-sm';

  // Only show cart to unauthenticated users or users with 'customer' role
  const showCart = !loading && (!user || userRole === 'customer');

  const navLinks = [
    { name: 'Products', href: '/products' },
    { name: 'About', href: isHome ? '#trust' : '/#trust' },
    { name: 'FAQ', href: isHome ? '#faq' : '/#faq' },
  ];

  return (
    <>
      <nav className={`fixed top-8 w-full z-50 transition-all duration-300 ${headerBg}`}>
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Logo />
          
          <div className="hidden md:flex items-center gap-8 text-sm uppercase tracking-widest text-muted-foreground">
            {navLinks.map((link) => (
              <Link key={link.name} href={link.href} className="hover:text-primary transition-colors">
                {link.name}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {!loading && (
              <div className="flex items-center gap-1 sm:gap-4">
                {showCart && (
                  <Button 
                    variant="ghost" 
                    onClick={() => setIsCartOpen(true)} 
                    className="text-muted-foreground hover:text-white flex items-center gap-2 uppercase tracking-widest text-xs px-2 sm:px-4 h-10"
                  >
                    <div className="relative">
                      <ShoppingCart size={18} />
                      {itemCount > 0 && (
                        <span className="absolute -top-2 -right-2 bg-primary text-background text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                          {itemCount}
                        </span>
                      )}
                    </div>
                    <span className="hidden lg:inline">Cart</span>
                  </Button>
                )}
                
                {user ? (
                  <div className="flex items-center gap-2">
                    <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-background rounded-none px-4 sm:px-6 h-9 text-xs uppercase tracking-widest flex items-center gap-2" asChild>
                      <Link href="/dashboard-redirect">
                        <User size={16} /> Profile
                      </Link>
                    </Button>
                    <form action={logout}>
                      <Button variant="ghost" type="submit" className="text-muted-foreground hover:text-red-400 h-9 p-2 md:px-4 md:border md:border-border md:rounded-none flex items-center justify-center">
                        <LogOut size={18} /> <span className="hidden lg:inline text-xs uppercase tracking-widest ml-2">Sign Out</span>
                      </Button>
                    </form>
                  </div>
                ) : (
                  <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-background rounded-none px-4 sm:px-6 h-9 text-xs uppercase tracking-widest" asChild>
                    <Link href="/login">Join Us</Link>
                  </Button>
                )}
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-primary p-2 focus:outline-none"
            >
              <div className="space-y-1.5">
                <motion.span 
                  animate={isMobileMenuOpen ? { rotate: 45, y: 7.5 } : { rotate: 0, y: 0 }}
                  className="block w-6 h-0.5 bg-current transition-transform"
                />
                <motion.span 
                  animate={isMobileMenuOpen ? { opacity: 0 } : { opacity: 1 }}
                  className="block w-6 h-0.5 bg-current"
                />
                <motion.span 
                  animate={isMobileMenuOpen ? { rotate: -45, y: -7.5 } : { rotate: 0, y: 0 }}
                  className="block w-6 h-0.5 bg-current transition-transform"
                />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Slide-over Navigation */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-20 left-0 w-full bg-background/98 backdrop-blur-xl border-b border-border z-40 md:hidden p-8 flex flex-col items-center gap-8 shadow-2xl"
            >
              {navLinks.map((link) => (
                <Link 
                  key={link.name} 
                  href={link.href} 
                  className="text-lg uppercase tracking-[0.3em] text-muted-foreground hover:text-primary transition-colors"
                >
                  {link.name}
                </Link>
              ))}
              <div className="w-full h-px bg-border my-2" />
              {user ? (
                <div className="flex flex-col items-center gap-6 w-full">
                  <Link 
                    href="/dashboard-redirect"
                    className="text-lg uppercase tracking-[0.3em] text-primary font-semibold flex items-center gap-2 transition-colors hover:text-primary/80"
                  >
                    <User size={18} /> Profile
                  </Link>
                  <form action={logout} className="w-full flex justify-center">
                    <button type="submit" className="text-sm uppercase tracking-widest text-muted-foreground hover:text-red-400 font-semibold flex items-center gap-2 py-2">
                      <LogOut size={16} /> Sign Out
                    </button>
                  </form>
                </div>
              ) : (
                <Link 
                  href="/login"
                  className="text-lg uppercase tracking-[0.3em] text-primary font-semibold transition-colors hover:text-primary/80"
                >
                  Join Us
                </Link>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {showCart && <CartSlideOut isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />}
    </>
  );
}
