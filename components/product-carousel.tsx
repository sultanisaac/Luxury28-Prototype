'use client';

import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, ShoppingCart } from 'lucide-react';
import { SmartImage } from '@/components/ui/smart-image';
import { createClient } from '@/lib/supabase/client';
import { useCart } from '@/context/CartContext';
import { WishlistButton } from '@/components/wishlist-button';

interface RecommendedProduct {
  id: string;
  name: string;
  price: number;
  price_idr: number;
  image: string;
  category: string;
}

interface ProductCarouselProps {
  excludeId?: string;
  title?: string;
  /** Number of cards visible on desktop (default 4) */
  desktopVisible?: number;
  /** Number of cards visible on mobile (default 2) */
  mobileVisible?: number;
  onProductClick?: () => void;
}

export function ProductCarousel({
  excludeId,
  title = 'You Might Also Like',
  desktopVisible = 4,
  mobileVisible = 2,
  onProductClick,
}: ProductCarouselProps) {
  const [products, setProducts] = useState<RecommendedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [addedId, setAddedId] = useState<string | null>(null);
  const [cardWidth, setCardWidth] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const { addItem } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      const supabase = createClient();
      let query = supabase
        .from('products')
        .select('id, name, price, price_idr, images, categories(name)')
        .limit(20);

      if (excludeId) {
        query = query.neq('id', excludeId);
      }

      const { data, error } = await query;

      if (!error && data) {
        const shuffled = [...data].sort(() => Math.random() - 0.5).slice(0, 12);
        setProducts(
          shuffled.map((p: any) => ({
            id: p.id,
            name: p.name,
            price: Number(p.price),
            price_idr: Number(p.price_idr),
            image: p.images?.[0] || '',
            category: p.categories?.name || 'Luxury',
          }))
        );
      }
      setLoading(false);
    };

    fetchProducts();
  }, [excludeId]);

  // Responsive card width: mobileVisible on small screens, desktopVisible on md+
  useEffect(() => {
    const updateCardWidth = () => {
      const isMobile = window.innerWidth < 768;
      const visible = isMobile ? mobileVisible : desktopVisible;
      const gaps = visible - 1;
      setCardWidth(`calc((100% - (${gaps} * 0.75rem)) / ${visible})`);
    };
    updateCardWidth();
    window.addEventListener('resize', updateCardWidth);
    return () => window.removeEventListener('resize', updateCardWidth);
  }, [desktopVisible, mobileVisible]);

  const checkScrollability = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 1);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScrollability();
    el.addEventListener('scroll', checkScrollability);
    window.addEventListener('resize', checkScrollability);
    return () => {
      el.removeEventListener('scroll', checkScrollability);
      window.removeEventListener('resize', checkScrollability);
    };
  }, [products]);

  const scroll = (direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = el.querySelector('[data-card]')?.clientWidth || 180;
    el.scrollBy({ left: direction === 'left' ? -cardWidth * 2 : cardWidth * 2, behavior: 'smooth' });
  };

  const handleAddToCart = (e: React.MouseEvent, product: RecommendedProduct) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      price_idr: product.price_idr,
      image: product.image,
      tier: product.category,
      stock: 99,
    });
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1500);
  };

  if (loading) {
    return (
      <div className="py-6">
        <div className="text-xs uppercase tracking-widest text-muted-foreground mb-4">{title}</div>
        <div className="flex gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex-shrink-0 w-36 h-44 bg-zinc-900 animate-pulse rounded-none" />
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) return null;

  return (
    <div className="py-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
          {title}
        </span>
        <div className="flex gap-1">
          <button
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            className="w-7 h-7 border border-border flex items-center justify-center text-muted-foreground hover:text-white hover:border-primary/50 transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            className="w-7 h-7 border border-border flex items-center justify-center text-muted-foreground hover:text-white hover:border-primary/50 transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Scrollable row */}
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto scrollbar-hide pb-2"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {products.map((product) => (
          <div
            key={product.id}
            data-card
            className="group flex-shrink-0 border border-border bg-card hover:border-primary/40 transition-all duration-300 flex flex-col"
            style={{
              width: cardWidth,
              minWidth: cardWidth,
              scrollSnapAlign: 'start',
            }}
          >
            {/* Image — clickable */}
            <div className="aspect-square bg-[#111] relative overflow-hidden">
              <Link href={`/product/${product.id}`} onClick={onProductClick} className="block w-full h-full">
                <SmartImage
                  src={product.image}
                  alt={product.name}
                  fill
                  fallbackType="luxury"
                  className="object-contain p-3 group-hover:scale-110 transition-transform duration-500"
                />
              </Link>
              <div className="absolute top-1 right-1 z-10">
                <WishlistButton productId={product.id} iconSize={14} className="bg-background/50 backdrop-blur-sm border border-border/50 hover:bg-background/80 p-1.5" />
              </div>
            </div>

            {/* Info */}
            <div className="p-2.5 flex flex-col flex-1">
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-0.5 truncate">
                {product.category}
              </p>
              <Link href={`/product/${product.id}`} onClick={onProductClick}>
                <p className="text-xs font-serif leading-tight line-clamp-2 mb-1 group-hover:text-primary transition-colors">
                  {product.name}
                </p>
              </Link>
              <p className="text-xs text-primary font-medium tracking-wider mb-2">
                ${product.price.toLocaleString()}
              </p>

              {/* Add to Cart button */}
              <button
                onClick={(e) => handleAddToCart(e, product)}
                className={`mt-auto w-full flex items-center justify-center gap-1.5 py-1.5 text-[10px] uppercase tracking-widest font-medium border transition-all duration-200 ${
                  addedId === product.id
                    ? 'border-primary bg-primary text-background'
                    : 'border-border text-muted-foreground hover:border-primary/60 hover:text-white hover:bg-zinc-800/60'
                }`}
              >
                <ShoppingCart size={10} />
                {addedId === product.id ? 'Added!' : 'Add to Cart'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
