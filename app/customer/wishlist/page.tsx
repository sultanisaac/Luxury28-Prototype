import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default async function WishlistPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Mocked for UI purposes
  const wishlistItems = [
    {
      id: '1',
      name: 'Patek Philippe Nautilus',
      price: 85000,
      image: 'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?q=80&w=200&auto=format&fit=crop'
    },
    {
      id: '2',
      name: 'Rolex Daytona',
      price: 35000,
      image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?q=80&w=200&auto=format&fit=crop'
    }
  ];

  return (
    <div>
      <div className="mb-8 pb-4 border-b border-border">
        <h1 className="font-serif text-3xl">Saved Items</h1>
      </div>

      {wishlistItems.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border bg-background/30">
          <Heart size={48} className="mx-auto text-muted-foreground/30 mb-4" />
          <h3 className="font-serif text-xl mb-2">Your wishlist is empty</h3>
          <p className="text-muted-foreground text-sm">Save items you are considering for later.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlistItems.map((item) => (
            <div key={item.id} className="bg-background/30 border border-border text-center group flex flex-col h-full">
              <div className="aspect-square relative overflow-hidden bg-[#111]">
                <img 
                  src={item.image} 
                  alt={item.name} 
                  className="object-cover w-full h-full p-8 group-hover:scale-110 transition-transform duration-700 opacity-80" 
                />
                <button className="absolute top-4 right-4 text-primary bg-background/80 backdrop-blur p-2 hover:bg-primary hover:text-background transition-colors border border-primary/20">
                  <Heart size={16} fill="currentColor" />
                </button>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <h4 className="font-serif text-sm mb-2">{item.name}</h4>
                <p className="text-primary text-sm tracking-wider mb-6 flex-1">${item.price.toLocaleString()}</p>
                <Button className="w-full bg-primary text-background hover:bg-primary/90 rounded-none uppercase tracking-widest text-xs transition-colors">
                  Move to Cart
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
