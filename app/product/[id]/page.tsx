'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShieldCheck, Truck, ArrowLeft, Lock } from 'lucide-react';
import { watches } from '@/lib/watches';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { Logo } from '@/components/logo';

import { useCart } from '@/context/CartContext';

import { Watch } from '@/lib/watches';

export default function ProductPage() {
  const router = useRouter();
  const { addItem } = useCart();
  const { id } = useParams();
  const [watch, setWatch] = useState<Watch | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    const fetchWatch = async () => {
      if (!id) return;

      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories (
            name
          )
        `)
        .eq('id', id)
        .single();

      if (!error && data) {
        setWatch({
          id: data.id,
          name: data.name,
          price: Number(data.price),
          price_idr: Number(data.price_idr),
          tier: data.categories?.name || 'Luxury',
          image: data.images?.[0] || '/featured-watch.png',
          stock: data.stock_quantity,
          description: data.description
        });
      }
      setLoading(false);
    };

    fetchWatch();
  }, [id]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center font-serif text-2xl animate-pulse text-muted-foreground tracking-widest">LOADING...</div>;
  }

  if (!watch) {
    return <div className="min-h-screen flex items-center justify-center font-serif text-2xl">Watch not found.</div>;
  }

  const handleAddToCart = () => {
    addItem(watch);
    alert(`${watch.name} added to cart!`);
  };

  return (
    <main className="min-h-screen bg-background text-foreground font-sans">
      {/* MINIMAL NAVBAR */}
      <nav className="w-full border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center text-sm uppercase tracking-widest text-muted-foreground hover:text-white transition-colors">
            <ArrowLeft size={16} className="mr-2" /> Back
          </Link>
          <Logo size={24} className="scale-90" />
          <div className="w-[70px]"></div> {/* Spacer */}
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-12 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          
          {/* LEFT: IMAGE GALLERY */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <div className="bg-[#111] border border-border aspect-square relative group overflow-hidden flex items-center justify-center p-12">
              <Image 
                src={watch.image} 
                alt={watch.name} 
                fill
                className="object-contain p-12 group-hover:scale-110 transition-transform duration-700"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
               <div className="bg-[#111] border border-border aspect-square relative cursor-pointer hover:border-primary/50 transition-colors">
                  <Image src={watch.image} alt={watch.name} fill className="object-contain p-4" />
               </div>
               <div className="bg-[#111] border border-border aspect-square relative cursor-pointer hover:border-primary/50 transition-colors">
                  <Image src="/wrist-shot.png" alt="On Wrist" fill className="object-cover" />
               </div>
               <div className="bg-[#111] border border-border aspect-square relative cursor-pointer hover:border-primary/50 transition-colors flex items-center justify-center group">
                 <div className="text-xs uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors">Play Video</div>
               </div>
            </div>
          </motion.div>

          {/* RIGHT: DETAILS */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col justify-center"
          >
            <div className="mb-2 text-xs uppercase tracking-widest text-primary">{watch.tier}</div>
            <h1 className="text-4xl md:text-5xl font-serif mb-6">{watch.name}</h1>
            
            <p className="text-gray-400 font-light italic mb-8 border-l-2 border-primary pl-4">
              "Worn by collectors who value precision and presence."
            </p>

            <div className="text-4xl font-light tracking-wider mb-2">
              ${watch.price.toLocaleString()}
            </div>
            {watch.price_idr && (
              <div className="text-xl text-muted-foreground font-light tracking-widest mb-8 uppercase">
                Rp {watch.price_idr.toLocaleString('id-ID')}
              </div>
            )}

            <div className="bg-primary/10 border border-primary/20 text-primary px-4 py-3 text-sm font-medium inline-block mb-10">
              Only {watch.stock} left — Limited collector's edition
            </div>

            <div className="space-y-4 mb-12">
              <Button
                onClick={() => router.push(`/checkout?productId=${watch.id}`)}
                className="w-full bg-primary text-background hover:bg-primary/90 rounded-none h-16 text-lg uppercase tracking-widest"
              >
                Buy Now
              </Button>
              <Button
                variant="outline"
                className="w-full rounded-none h-16 text-lg uppercase tracking-widest border-border hover:bg-white hover:text-background"
                onClick={handleAddToCart}
              >
                Add to Cart
              </Button>
            </div>

            {/* TRUST STACK */}
            <div className="space-y-6 pt-8 border-t border-border">
              <div className="flex items-center gap-4 text-sm text-gray-300">
                <ShieldCheck size={24} className="text-primary flex-shrink-0" />
                <div>
                  <span className="block font-medium uppercase tracking-widest text-white mb-1">Certified Authenticity</span>
                  <span className="font-light text-muted-foreground">Strictly inspected by master watchmakers. Papers included.</span>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-300">
                <Lock size={24} className="text-primary flex-shrink-0" />
                <div>
                  <span className="block font-medium uppercase tracking-widest text-white mb-1">Secure Transaction</span>
                  <span className="font-light text-muted-foreground">Bank-level encryption. Escrow options available.</span>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-300">
                <Truck size={24} className="text-primary flex-shrink-0" />
                <div>
                  <span className="block font-medium uppercase tracking-widest text-white mb-1">Insured Shipping</span>
                  <span className="font-light text-muted-foreground">Express priority shipping. Fully insured to your doorstep.</span>
                </div>
              </div>
            </div>

          </motion.div>
        </div>
      </div>
    </main>
  );
}
