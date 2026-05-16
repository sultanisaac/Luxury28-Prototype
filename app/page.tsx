'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Truck, Clock, Shield, Star, X, LogOut, User } from 'lucide-react';
import { watches } from '@/lib/watches';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { logout } from '@/app/auth/actions';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { Logo } from '@/components/logo';

import { Watch } from '@/lib/watches';

export default function Home() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [products, setProducts] = useState<Watch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    
    const fetchData = async () => {
      // Fetch User
      const { data: { user: userData } } = await supabase.auth.getUser();
      setUser(userData);
      
      // Fetch Products with Categories
      const { data: productData, error } = await supabase
        .from('products')
        .select(`
          *,
          categories (
            name
          )
        `)
        .eq('status', 'active');

      if (!error && productData) {
        const formattedProducts: Watch[] = productData.map((p: any) => ({
          id: p.id,
          name: p.name,
          price: Number(p.price),
          price_idr: Number(p.price_idr),
          tier: p.categories?.name || 'Luxury',
          image: p.images?.[0] || '/featured-watch.png',
          stock: p.stock_quantity,
          description: p.description
        }));
        setProducts(formattedProducts);
      }
      
      setLoading(false);
    };

    fetchData();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const featuredWatches = products.slice(0, 4);

  return (
    <main className="min-h-screen bg-background text-foreground font-sans">
      

      {/* HERO SECTION */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image 
            src="/hero-watch.png" 
            alt="Luxury Watch" 
            fill
            className="object-cover opacity-60"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        </div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto mt-20">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl sm:text-5xl md:text-7xl font-serif text-white mb-6 tracking-wide leading-tight"
          >
            Time Is Status.<br />Wear It.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-base sm:text-lg md:text-xl text-gray-300 mb-10 max-w-2xl mx-auto font-light px-4"
          >
            Curated luxury watches. Certified authenticity. Limited availability.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button size="lg" className="bg-primary text-background hover:bg-primary/90 rounded-none px-12 py-6 text-lg w-full sm:w-auto uppercase tracking-widest">
              Shop Collection
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-background rounded-none px-12 py-6 text-lg w-full sm:w-auto uppercase tracking-widest">
              View Featured
            </Button>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="mt-16 flex flex-wrap justify-center gap-8 md:gap-16 text-sm text-gray-400 uppercase tracking-widest"
          >
            <div className="flex items-center gap-2"><ShieldCheck size={16} className="text-primary" /> Certified Authenticity</div>
            <div className="flex items-center gap-2"><Shield size={16} className="text-primary" /> 2-Year Warranty</div>
            <div className="flex items-center gap-2"><Truck size={16} className="text-primary" /> Global Shipping</div>
          </motion.div>
        </div>
      </section>

      {/* FEATURED COLLECTION */}
      <section className="py-32 bg-background relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif mb-4">Curator's Choice</h2>
            <div className="w-16 h-1 bg-primary mx-auto"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {featuredWatches.map((watch) => (
              <Link href={`/product/${watch.id}`} key={watch.id} className="group cursor-pointer">
                <div className="bg-card p-6 border border-border transition-all duration-500 hover:border-primary/50 relative overflow-hidden h-[400px] flex flex-col justify-end">
                  <div className="absolute inset-0 p-8 flex items-center justify-center">
                    <Image src={watch.image} alt={watch.name} width={250} height={250} className="object-contain group-hover:scale-110 transition-transform duration-700" />
                  </div>
                  <div className="relative z-10 bg-background/90 backdrop-blur p-4 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    <h3 className="font-serif text-lg mb-1 truncate">{watch.name}</h3>
                    <p className="text-primary font-medium tracking-wider">${watch.price.toLocaleString()}</p>
                    <div className="mt-4 flex items-center text-xs uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">
                      <span>Lihat Detail</span>
                      <span className="ml-2">→</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center">
            <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-background rounded-none px-12 py-6 text-sm uppercase tracking-[0.3em] transition-all duration-500" asChild>
              <Link href="/products">Explore Full Collection</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* WHY LUXURY28 (TRUST SECTION) */}
      <section id="trust" className="py-24 bg-[#0a0a0a] border-y border-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 text-center">
            <div className="space-y-4">
              <ShieldCheck size={40} className="mx-auto text-primary" strokeWidth={1} />
              <h3 className="font-serif text-xl">Guaranteed Authenticity</h3>
              <p className="text-muted-foreground text-sm">Every timepiece is strictly inspected and certified by master watchmakers.</p>
            </div>
            <div className="space-y-4">
              <Star size={40} className="mx-auto text-primary" strokeWidth={1} />
              <h3 className="font-serif text-xl">Curated Selection Only</h3>
              <p className="text-muted-foreground text-sm">We don't sell everything. We only offer timepieces that matter.</p>
            </div>
            <div className="space-y-4">
              <Truck size={40} className="mx-auto text-primary" strokeWidth={1} />
              <h3 className="font-serif text-xl">Worldwide Insured</h3>
              <p className="text-muted-foreground text-sm">Secure, fully insured priority shipping to your doorstep.</p>
            </div>
            <div className="space-y-4">
              <Clock size={40} className="mx-auto text-primary" strokeWidth={1} />
              <h3 className="font-serif text-xl">Private Client Experience</h3>
              <p className="text-muted-foreground text-sm">Dedicated concierge service from acquisition to ownership.</p>
            </div>
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <section className="py-32 bg-[#0a0a0a] border-y border-border relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-4xl font-serif mb-4">Trusted by Collectors Worldwide</h2>
            <div className="w-16 h-1 bg-primary mx-auto mb-12"></div>
            
            <div className="flex flex-wrap justify-center gap-12 md:gap-24">
              <div>
                <div className="text-4xl md:text-5xl font-serif text-primary mb-2">5,000+</div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground">Timepieces Sold</div>
              </div>
              <div>
                <div className="text-4xl md:text-5xl font-serif text-primary mb-2">98%</div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground">Satisfaction Rate</div>
              </div>
              <div>
                <div className="text-4xl md:text-5xl font-serif text-primary mb-2">42</div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground">Shipping Countries</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {[
              { text: "The watch exceeded expectations. Packaging, authenticity, everything was flawless.", author: "Daniel K., Zurich" },
              { text: "Luxury28 feels like a private dealer, not a store. Exceptional service.", author: "Marcus L., Dubai" },
              { text: "Fast shipping, certified item, no doubts. Will buy again.", author: "Kenji S., Tokyo" }
            ].map((testimonial, i) => (
              <div key={i} className="bg-card p-8 border border-border relative">
                <div className="text-primary text-4xl font-serif absolute top-4 left-6 opacity-20">"</div>
                <p className="text-gray-300 mb-6 relative z-10 font-light italic">"{testimonial.text}"</p>
                <div className="text-sm uppercase tracking-widest text-primary">— {testimonial.author}</div>
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-3 gap-4">
             <div className="relative h-64 w-full opacity-60 hover:opacity-100 transition-opacity"><Image src="/wrist-shot.png" alt="Wrist Shot" fill className="object-cover" /></div>
             <div className="relative h-64 w-full opacity-60 hover:opacity-100 transition-opacity"><Image src="/hero-watch.png" alt="Details" fill className="object-cover" /></div>
             <div className="relative h-64 w-full opacity-60 hover:opacity-100 transition-opacity"><Image src="/wrist-shot.png" alt="Lifestyle" fill className="object-cover" /></div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-32 bg-background">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif mb-4">Before You Invest</h2>
            <div className="w-16 h-1 bg-primary mx-auto"></div>
          </div>

          <div className="space-y-6">
            {[
              { q: "Are these watches authentic?", a: "100% certified authentic. Every timepiece undergoes rigorous inspection by our master watchmakers before listing." },
              { q: "Do you offer a warranty?", a: "Yes, we provide a 2-year comprehensive international warranty for all our timepieces." },
              { q: "What is the shipping process?", a: "All shipments are fully insured and trackable. We use express priority services for domestic and expedited for international." },
              { q: "What is your return policy?", a: "We offer a 7-day unconditional return period from the day of delivery, provided the watch remains in the same condition." },
              { q: "Which payment methods are accepted?", a: "We accept all major credit cards, bank transfers, and selected cryptocurrencies." }
            ].map((faq, i) => (
              <div key={i} className="border border-border p-6 hover:border-primary/30 transition-colors">
                <h4 className="font-serif text-lg mb-2">{faq.q}</h4>
                <p className="text-muted-foreground text-sm font-light">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#050505] pt-24 pb-12 border-t border-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-2">
              <Logo size={48} className="mb-6 !gap-4" />
              <p className="text-muted-foreground max-w-sm font-light">
                Curated luxury watches for the modern collector. We only deal in excellence.
              </p>
            </div>
            <div>
              <h5 className="uppercase tracking-widest text-sm mb-6 text-white">Navigation</h5>
              <ul className="space-y-4 text-muted-foreground text-sm font-light">
                <li><Link href="/products" className="hover:text-primary transition-colors">Products</Link></li>
                <li><Link href="#trust" className="hover:text-primary transition-colors">Our Standard</Link></li>
                <li><Link href="#faq" className="hover:text-primary transition-colors">Before Investing</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="uppercase tracking-widest text-sm mb-6 text-white">Newsletter</h5>
              <p className="text-muted-foreground text-sm mb-4 font-light">Get priority access to rare and limited timepieces.</p>
              <div className="flex">
                <input type="email" placeholder="Your email address" className="bg-transparent border border-border px-4 py-2 w-full text-sm focus:outline-none focus:border-primary" />
                <Button className="rounded-none bg-primary text-background hover:bg-primary/90 px-6">JOIN</Button>
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-border/50 text-center text-xs text-muted-foreground uppercase tracking-widest flex flex-col md:flex-row justify-between items-center gap-4">
            <p>&copy; {new Date().getFullYear()} Luxury28. All Rights Reserved.</p>
            <div className="flex gap-6">
              <Link href="#" className="hover:text-primary transition-colors">Terms</Link>
              <Link href="#" className="hover:text-primary transition-colors">Privacy</Link>
            </div>
          </div>
        </div>
      </footer>

      <div className="md:hidden fixed bottom-0 left-0 w-full bg-background/90 backdrop-blur border-t border-border p-4 z-40 flex gap-4">
        {user ? (
          <>
            <Button className="flex-1 bg-zinc-800 text-white hover:bg-zinc-700 rounded-none uppercase tracking-widest py-6" asChild>
              <Link href="/dashboard-redirect" className="text-center flex items-center justify-center">Dashboard</Link>
            </Button>
            <form action={logout} className="flex-1">
              <Button variant="outline" type="submit" className="w-full border-primary text-primary hover:bg-primary hover:text-background rounded-none uppercase tracking-widest py-6">
                Sign Out
              </Button>
            </form>
          </>
        ) : (
          <Button className="w-full bg-primary text-background hover:bg-primary/90 rounded-none uppercase tracking-widest py-6" asChild>
            <Link href="/login" className="flex items-center justify-center">Client Portal</Link>
          </Button>
        )}
      </div>

    </main>
  );
}
