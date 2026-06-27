'use client';

import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { SmartImage } from '@/components/ui/smart-image';
import { createClient } from '@/lib/supabase/client';

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
  /** Number of cards visible on desktop (default 5) */
  desktopVisible?: number;
  /** Number of cards visible on mobile (default 2) */
  mobileVisible?: number;
  onProductClick?: () => void;
}

export function ProductCarousel({
  excludeId,
  title = 'You Might Also Like',
  desktopVisible = 5,
  mobileVisible = 2,
  onProductClick,
}: ProductCarouselProps) {
  const [products, setProducts] = useState<RecommendedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

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
        // Shuffle for variety
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
    const cardWidth = el.querySelector('a')?.offsetWidth || 180;
    el.scrollBy({ left: direction === 'left' ? -cardWidth * 2 : cardWidth * 2, behavior: 'smooth' });
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
          <Link
            key={product.id}
            href={`/product/${product.id}`}
            onClick={onProductClick}
            className="group flex-shrink-0 border border-border bg-card hover:border-primary/40 transition-all duration-300"
            style={{
              width: `calc((100% - (${desktopVisible - 1} * 0.75rem)) / ${desktopVisible})`,
              minWidth: `calc((100% - (${mobileVisible - 1} * 0.75rem)) / ${mobileVisible})`,
              scrollSnapAlign: 'start',
            }}
          >
            {/* Image */}
            <div className="aspect-square bg-[#111] relative overflow-hidden">
              <SmartImage
                src={product.image}
                alt={product.name}
                fill
                fallbackType="luxury"
                className="object-contain p-3 group-hover:scale-110 transition-transform duration-500"
              />
            </div>
            {/* Info */}
            <div className="p-2.5">
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-0.5 truncate">
                {product.category}
              </p>
              <p className="text-xs font-serif leading-tight line-clamp-2 mb-1 group-hover:text-primary transition-colors">
                {product.name}
              </p>
              <p className="text-xs text-primary font-medium tracking-wider">
                ${product.price.toLocaleString()}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
