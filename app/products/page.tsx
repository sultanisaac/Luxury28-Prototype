'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SmartImage } from '@/components/ui/smart-image';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { GlobalHeader } from '@/components/global-header';
import { Search, SlidersHorizontal, ArrowDownUp, ShoppingCart, Zap } from 'lucide-react';
import { useCart } from '@/context/CartContext';

interface Watch {
  id: string;
  name: string;
  price: number;
  price_idr: number;
  tier: string;
  image: string;
  stock: number;
  description: string;
  created_at: string;
}

export default function ProductsPage() {
  const router = useRouter();
  const { addItem } = useCart();
  const [products, setProducts] = useState<Watch[]>([]);
  const [loading, setLoading] = useState(true);
  const [addedId, setAddedId] = useState<string | null>(null);

  // Filters
  const [selectedTier, setSelectedTier] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'price_asc' | 'price_desc'>('newest');

  const tiers = ['All', 'Ultra Luxury', 'High-End Luxury', 'Mid-Tier Luxury', 'Affordable Luxury'];

  useEffect(() => {
    const supabase = createClient();
    const fetchProducts = async () => {
      let query = supabase
        .from('products')
        .select(`
          *,
          categories (
            name
          )
        `)
        .eq('status', 'active');

      const { data, error } = await query;

      if (!error && data) {
        setProducts(data.map((p: any) => ({
          id: p.id,
          name: p.name,
          price: Number(p.price),
          price_idr: Number(p.price_idr),
          tier: p.categories?.name || 'Luxury',
          image: p.images?.[0] || '/featured-watch.png',
          stock: p.stock_quantity,
          description: p.description,
          created_at: p.created_at
        })));
      }
      setLoading(false);
    };

    fetchProducts();

    // Subscribe to real-time product updates
    const channel = supabase
      .channel('public:products')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        () => {
          // Re-fetch products to get updated data including category joins
          fetchProducts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const filteredProducts = useMemo(() => {
    return products
      .filter(p => selectedTier === 'All' || p.tier === selectedTier)
      .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.description?.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => {
        if (sortOrder === 'price_asc') return a.price_idr - b.price_idr;
        if (sortOrder === 'price_desc') return b.price_idr - a.price_idr;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
  }, [products, selectedTier, searchQuery, sortOrder]);

  const handleAddToCart = (e: React.MouseEvent, watch: Watch) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      id: watch.id,
      name: watch.name,
      price: watch.price,
      price_idr: watch.price_idr,
      image: watch.image,
      tier: watch.tier,
      stock: watch.stock,
    });
    setAddedId(watch.id);
    setTimeout(() => setAddedId(null), 1500);
  };

  const handleBuyNow = (e: React.MouseEvent, watch: Watch) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/checkout?productId=${watch.id}`);
  };

  return (
    <main className="min-h-screen bg-background text-foreground font-sans pt-32 pb-24">
      <GlobalHeader />

      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
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

        {/* Search and Filters Bar */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-10 border-b border-border pb-8">

          {/* Search */}
          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
            <input
              type="text"
              placeholder="Search timepieces..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900/50 border border-zinc-800 rounded-full py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-primary/50 transition-all placeholder:text-zinc-600"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            {/* Sort Dropdown */}
            <div className="relative flex items-center bg-zinc-900/50 border border-zinc-800 rounded-full px-4 py-2">
              <ArrowDownUp size={16} className="text-muted-foreground mr-2" />
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as any)}
                className="bg-transparent text-sm text-white focus:outline-none cursor-pointer appearance-none pr-4"
              >
                <option value="newest" className="bg-zinc-900">Newest Arrivals</option>
                <option value="price_asc" className="bg-zinc-900">Price: Low to High</option>
                <option value="price_desc" className="bg-zinc-900">Price: High to Low</option>
              </select>
            </div>

            {/* Filter Dropdown for Mobile */}
            <div className="relative flex items-center bg-zinc-900/50 border border-zinc-800 rounded-full px-4 py-2 sm:hidden">
              <SlidersHorizontal size={16} className="text-muted-foreground mr-2" />
              <select
                value={selectedTier}
                onChange={(e) => setSelectedTier(e.target.value)}
                className="bg-transparent text-sm text-white focus:outline-none cursor-pointer appearance-none pr-4"
              >
                {tiers.map(tier => <option key={tier} value={tier} className="bg-zinc-900">{tier}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Desktop Category Filters */}
        <div className="hidden sm:flex flex-wrap justify-center gap-4 mb-16">
          {tiers.map((tier) => (
            <button
              key={tier}
              onClick={() => setSelectedTier(tier)}
              className={`px-6 py-2 text-xs uppercase tracking-widest transition-all rounded-full ${
                selectedTier === tier
                  ? 'bg-primary text-background font-bold'
                  : 'bg-zinc-900/50 border border-zinc-800 text-muted-foreground hover:text-white hover:border-zinc-700'
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
                className="group"
              >
                {/* Card image — navigates to product */}
                <Link href={`/product/${watch.id}`} className="block">
                  <div className="bg-card border border-border group-hover:border-primary/50 transition-all duration-500 overflow-hidden relative aspect-[3/4] flex flex-col justify-end">
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

                {/* Action Buttons — below card */}
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <button
                    onClick={(e) => handleBuyNow(e, watch)}
                    className="flex items-center justify-center gap-1.5 py-2.5 text-[10px] uppercase tracking-widest font-semibold bg-primary text-background hover:bg-primary/85 transition-colors"
                  >
                    <Zap size={10} />
                    Buy Now
                  </button>
                  <button
                    onClick={(e) => handleAddToCart(e, watch)}
                    className={`flex items-center justify-center gap-1.5 py-2.5 text-[10px] uppercase tracking-widest font-medium border transition-all duration-200 ${
                      addedId === watch.id
                        ? 'border-primary bg-primary text-background'
                        : 'border-border text-muted-foreground hover:border-primary/60 hover:text-white hover:bg-zinc-800/60'
                    }`}
                  >
                    <ShoppingCart size={10} />
                    {addedId === watch.id ? 'Added!' : 'Add to Cart'}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {!loading && filteredProducts.length === 0 && (
          <div className="text-center py-24 text-muted-foreground italic">
            No timepieces found matching your criteria.
          </div>
        )}
      </div>
    </main>
  );
}
