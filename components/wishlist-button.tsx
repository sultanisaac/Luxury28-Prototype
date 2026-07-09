'use client';

import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface WishlistButtonProps {
  productId: string;
  className?: string;
  iconSize?: number;
}

export function WishlistButton({ productId, className = '', iconSize = 16 }: WishlistButtonProps) {
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    const checkWishlist = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        // Also check if role is customer
        const { data: userData } = await supabase.from('users').select('role').eq('id', user.id).single();
        
        if (userData?.role === 'customer') {
          const { data } = await supabase
            .from('wishlists')
            .select('id')
            .eq('user_id', user.id)
            .eq('product_id', productId)
            .single();
            
          if (data) {
            setIsInWishlist(true);
          }
        }
      }
      setLoading(false);
    };

    checkWishlist();
  }, [productId, supabase]);

  const toggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error('Please sign in to save items to your wishlist');
      return;
    }

    const { data: userData } = await supabase.from('users').select('role').eq('id', user.id).single();
    if (userData?.role !== 'customer') {
      toast.error('Only customers can save items to a wishlist');
      return;
    }

    try {
      if (isInWishlist) {
        // Remove from wishlist
        await supabase
          .from('wishlists')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', productId);
        setIsInWishlist(false);
        toast.success('Removed from Saved Items');
      } else {
        // Add to wishlist
        await supabase
          .from('wishlists')
          .insert({
            user_id: user.id,
            product_id: productId
          });
        setIsInWishlist(true);
        toast.success('Added to Saved Items');
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      toast.error('Failed to update wishlist');
    }
  };

  if (loading) {
    return (
      <button className={`p-2 rounded-full transition-colors ${className}`} disabled>
        <Heart size={iconSize} className="text-zinc-600 animate-pulse" />
      </button>
    );
  }

  return (
    <button 
      onClick={toggleWishlist}
      className={`p-2 rounded-full transition-colors hover:bg-zinc-800/50 group ${className}`}
      aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
    >
      <Heart 
        size={iconSize} 
        className={`transition-all duration-300 ${isInWishlist ? 'fill-red-500 text-red-500 scale-110' : 'text-zinc-400 group-hover:text-red-400'}`} 
      />
    </button>
  );
}
