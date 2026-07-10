'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { SmartImage } from '@/components/ui/smart-image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShieldCheck, Truck, ArrowLeft, Lock } from 'lucide-react';
import { watches } from '@/lib/watches';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { Logo } from '@/components/logo';

import { useCart } from '@/context/CartContext';
import { ProductCarousel } from '@/components/product-carousel';
import { WishlistButton } from '@/components/wishlist-button';

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
    <main className="min-h-screen bg-background text-foreground font-sans pt-20">
      <div className="max-w-7xl mx-auto px-6 py-8 md:py-16">
        <Link 
          href="/" 
          className="inline-flex items-center text-xs md:text-sm uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors mb-8 md:mb-12"
        >
          <ArrowLeft size={16} className="mr-2" /> Back to Collection
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          
          {/* LEFT: IMAGE GALLERY */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-4 md:space-y-6"
          >
            {/* Mobile Carousel & Desktop Main Image */}
            <div className="flex md:block overflow-x-auto snap-x snap-mandatory scrollbar-hide -mx-6 px-6 md:mx-0 md:px-0 gap-4 md:gap-0">
              {/* Main Image */}
              <div className="w-full flex-shrink-0 snap-center md:mb-6">
                <div className="bg-[#111] border border-border aspect-square relative group overflow-hidden flex items-center justify-center p-8 md:p-12">
                  <SmartImage 
                    src={watch.image} 
                    alt={watch.name} 
                    fill
                    fallbackType={watch.tier === 'Ultra Luxury' ? 'luxury' : 'vintage'}
                    className="object-contain p-8 md:p-12 group-hover:scale-110 transition-transform duration-700" 
                  />
                </div>
              </div>
              
              {/* Image 2 (Wrist Shot) */}
              <div className="w-full flex-shrink-0 snap-center md:hidden">
                <div className="bg-[#111] border border-border aspect-square relative group overflow-hidden flex items-center justify-center">
                  <Image src="/wrist-shot.png" alt="On Wrist" fill className="object-cover opacity-80" />
                </div>
              </div>

              {/* Image 3 (Details) */}
              <div className="w-full flex-shrink-0 snap-center md:hidden">
                <div className="bg-[#111] border border-border aspect-square relative group overflow-hidden flex items-center justify-center">
                  <Image src="/hero-watch.png" alt="Details" fill className="object-cover opacity-80" />
                </div>
              </div>
            </div>

            {/* Desktop Thumbnails */}
            <div className="hidden md:grid grid-cols-3 gap-4">
               <div className="bg-[#111] border border-border aspect-square relative cursor-pointer hover:border-primary/50 transition-colors">
                  <SmartImage src={watch.image} alt={watch.name} fill fallbackType="luxury" className="object-contain p-4" />
               </div>
               <div className="bg-[#111] border border-border aspect-square relative cursor-pointer hover:border-primary/50 transition-colors">
                  <Image src="/wrist-shot.png" alt="On Wrist" fill className="object-cover opacity-50 hover:opacity-100 transition-opacity" />
               </div>
               <div className="bg-[#111] border border-border aspect-square relative cursor-pointer hover:border-primary/50 transition-colors flex items-center justify-center group">
                 <div className="text-xs uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors">Play Video</div>
               </div>
            </div>

            {/* Mobile Swipe Indicator (Decorative) */}
            <div className="md:hidden flex justify-center gap-2 pt-2">
              <div className="w-8 h-1 rounded-full bg-primary"></div>
              <div className="w-2 h-1 rounded-full bg-zinc-800"></div>
              <div className="w-2 h-1 rounded-full bg-zinc-800"></div>
            </div>
          </motion.div>

          {/* RIGHT: DETAILS */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col justify-center"
          >
            <div className="flex justify-between items-start mb-6 gap-4">
              <div>
                <div className="mb-2 text-xs uppercase tracking-widest text-primary">{watch.tier}</div>
                <h1 className="text-4xl md:text-5xl font-serif">{watch.name}</h1>
              </div>
              <div className="mt-4">
                <WishlistButton 
                  productId={watch.id} 
                  iconSize={24} 
                  className="bg-zinc-900 border border-zinc-800 shadow-lg hover:border-primary/50 flex-shrink-0 w-12 h-12 flex items-center justify-center" 
                />
              </div>
            </div>
            
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

      {/* Recommended Products */}
      <div className="border-t border-border">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <ProductCarousel
            excludeId={watch.id}
            title="You Might Also Like"
            desktopVisible={4}
            mobileVisible={2}
          />
        </div>
      </div>
    </main>
  );
}
