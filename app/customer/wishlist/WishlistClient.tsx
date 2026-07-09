'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

const WishlistImage = ({ src, alt }: { src?: string, alt?: string }) => {
  const [error, setError] = useState(false)
  if (!src || error) {
    return <div className="w-full h-full flex items-center justify-center text-muted-foreground/20 bg-[#111]"><Heart size={48} /></div>
  }
  return (
    <img 
      src={src} 
      alt={alt || "Product image"} 
      onError={() => setError(true)}
      className="object-cover w-full h-full p-8 group-hover:scale-110 transition-transform duration-700 opacity-80" 
    />
  )
}

export default function WishlistClient({ initialItems, userId }: { initialItems: any[], userId: string }) {
  const supabase = createClient()
  const [items, setItems] = useState(initialItems)

  useEffect(() => {
    const channel = supabase.channel(`rt-customer-wishlist-${Math.random().toString(36).substring(7)}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'wishlists', filter: `user_id=eq.${userId}` },
        async () => {
          const { data } = await supabase.from('wishlists').select('*, products(id, name, price, images)').eq('user_id', userId)
          if (data) setItems(data)
        }
      ).subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [supabase, userId])

  const handleRemove = async (id: string) => {
    const { error } = await supabase.from('wishlists').delete().eq('id', id)
    if (error) toast.error('Could not remove item')
    else toast.success('Removed from saved items')
  }

  return (
    <div>
      <div className="mb-8 pb-4 border-b border-border">
        <h1 className="font-serif text-3xl">Saved Items</h1>
      </div>
      {items.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border bg-background/30">
          <Heart size={48} className="mx-auto text-muted-foreground/30 mb-4" />
          <h3 className="font-serif text-xl mb-2">Your wishlist is empty</h3>
          <p className="text-muted-foreground text-sm">Save items you are considering for later.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => {
            const product = item.products || item
            return (
              <div key={item.id} className="bg-background/30 border border-border text-center group flex flex-col h-full">
                <div className="aspect-square relative overflow-hidden bg-[#111]">
                  <WishlistImage src={product.images?.[0]} alt={product.name} />
                  <button onClick={() => handleRemove(item.id)} className="absolute top-4 right-4 text-primary bg-background/80 backdrop-blur p-2 hover:bg-primary hover:text-background transition-colors border border-primary/20">
                    <Heart size={16} fill="currentColor" />
                  </button>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <h4 className="font-serif text-sm mb-2">{product.name}</h4>
                  <p className="text-primary text-sm tracking-wider mb-6 flex-1">${product.price?.toLocaleString()}</p>
                  <Button className="w-full bg-primary text-background hover:bg-primary/90 rounded-none uppercase tracking-widest text-xs">Move to Cart</Button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
