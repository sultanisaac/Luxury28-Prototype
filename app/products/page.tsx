'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { SmartImage } from '@/components/ui/smart-image';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { Watch } from '@/lib/watches';
import { Button } from '@/components/ui/button';
import { GlobalHeader } from '@/components/global-header';

export default function ProductsPage() {
  const [products, setProducts] = useState<Watch[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTier, setSelectedTier] = useState<string>('All');

  const tiers = ['All', 'Ultra Luxury', 'High-End Luxury', 'Mid-Tier Luxury', 'Affordable Luxury'];

  useEffect(() => {
    const supabase = createClient();
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories (
            name
          )
        `)
        .eq('status', 'active')
        .order('price', { ascending: false });

      if (!error && data) {
        setProducts(data.map((p: any) => ({
          id: p.id,
          name: p.name,
          price: Number(p.price),
          price_idr: Number(p.price_idr),
          tier: p.categories?.name || 'Luxury',
          image: p.images?.[0] || '/featured-watch.png',
          stock: p.stock_quantity,
          description: p.description
        })));
      }
      setLoading(false);
    };

    fetchProducts();
  }, []);

  const filteredProducts = selectedTier === 'All' 
    ? products 
    : products.filter(p => p.tier === selectedTier);

  return (
    <main className="min-h-screen bg-background text-foreground font-sans pt-32 pb-24">
      <GlobalHeader />
      
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-serif mb-6 tracking-wide"
          >
            The Collection
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground uppercase tracking-[0.3em] text-xs"
          >
            Curated Excellence — Worldwide Insured Shipping
          </motion.p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap justify-center gap-4 mb-16 border-b border-border pb-8">
          {tiers.map((tier) => (
            <button
              key={tier}
              onClick={() => setSelectedTier(tier)}
              className={`px-6 py-2 text-xs uppercase tracking-widest transition-all ${
                selectedTier === tier 
                  ? 'bg-primary text-background' 
                  : 'text-muted-foreground hover:text-white'
              }`}
            >
              {tier}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="aspect-[3/4] bg-card animate-pulse border border-border" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredProducts.map((watch, index) => (
              <motion.div
                key={watch.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link href={`/product/${watch.id}`} className="group block">
                  <div className="bg-card border border-border group-hover:border-primary/50 transition-all duration-500 overflow-hidden relative aspect-[3/4] flex flex-col justify-end p-6">
                    <div className="absolute inset-0 p-8 flex items-center justify-center">
                      <SmartImage 
                        src={watch.image} 
                        alt={watch.name} 
                        width={300} 
                        height={300} 
                        fallbackType={watch.tier === 'Ultra Luxury' ? 'luxury' : 'modern'}
                        className="object-contain group-hover:scale-110 transition-transform duration-700" 
                      />
                    </div>
                    
                    <div className="relative z-10 bg-background/90 backdrop-blur p-4 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                      <div className="text-[10px] text-primary uppercase tracking-[0.2em] mb-1">{watch.tier}</div>
                      <h3 className="font-serif text-lg mb-1 truncate">{watch.name}</h3>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-white font-medium tracking-wider">${watch.price.toLocaleString()}</span>
                        {watch.price_idr && (
                          <span className="text-[10px] text-muted-foreground tracking-widest uppercase">
                            Rp {watch.price_idr.toLocaleString('id-ID')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {!loading && filteredProducts.length === 0 && (
          <div className="text-center py-24 text-muted-foreground italic">
            No timepieces found in this category.
          </div>
        )}
      </div>
    </main>
  );
}
