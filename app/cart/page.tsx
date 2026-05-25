'use client';

import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Trash2, Minus, Plus, ArrowRight, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { SmartImage } from '@/components/ui/smart-image';

export default function CartPage() {
  const { items, removeItem, updateQuantity, subtotal, subtotal_idr } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-32 pb-24 px-6 flex flex-col items-center justify-center text-center">
        <div className="bg-[#111] p-12 border border-border flex flex-col items-center gap-6">
          <ShoppingBag size={64} className="text-muted-foreground/20" />
          <h1 className="font-serif text-3xl">Your cart is empty</h1>
          <p className="text-muted-foreground max-w-md">
            Discover our collection of certified pre-owned luxury watches and find your next investment piece.
          </p>
          <Button asChild className="rounded-none uppercase tracking-widest px-8">
            <Link href="/">Browse Collection</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-24 px-6 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row gap-12">
          
          {/* CART ITEMS */}
          <div className="flex-[2] space-y-8">
            <div className="flex items-center justify-between border-b border-border pb-6">
              <h1 className="font-serif text-4xl">Shopping Cart</h1>
              <span className="text-muted-foreground uppercase tracking-widest text-sm">{items.length} Items</span>
            </div>

            <div className="space-y-6">
              {items.map((item) => (
                <motion.div 
                  layout
                  key={item.id} 
                  className="flex flex-col sm:flex-row gap-6 p-6 bg-[#0a0a0a] border border-border group"
                >
                  <Link 
                    href={`/product/${item.id}`}
                    className="w-32 h-32 relative bg-[#111] overflow-hidden flex-shrink-0 cursor-pointer"
                  >
                    <SmartImage src={item.image} alt={item.name} width={128} height={128} fallbackType="modern" className="object-cover w-full h-full opacity-80 group-hover:scale-110 transition-transform duration-700" />
                  </Link>
                  
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-[10px] uppercase tracking-[0.2em] text-primary mb-1">{item.category}</div>
                        <Link href={`/product/${item.id}`} className="hover:text-primary transition-colors cursor-pointer">
                          <h3 className="font-serif text-xl">{item.name}</h3>
                        </Link>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-light">${item.price.toLocaleString()}</div>
                        {item.price_idr && (
                          <div className="text-[10px] text-muted-foreground mt-1 tracking-widest font-light">
                            Rp {item.price_idr.toLocaleString('id-ID')}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-6">
                      <div className="flex items-center border border-border">
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-2 hover:bg-white hover:text-black transition-colors"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="px-4 text-sm font-medium w-12 text-center">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-2 hover:bg-white hover:text-black transition-colors"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                      
                      <button 
                        onClick={() => removeItem(item.id)}
                        className="text-muted-foreground hover:text-red-400 flex items-center gap-2 text-xs uppercase tracking-widest transition-colors"
                      >
                        <Trash2 size={16} /> Remove
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <Link href="/" className="inline-flex items-center text-xs uppercase tracking-widest text-muted-foreground hover:text-white transition-colors">
              <ArrowLeft size={14} className="mr-2" /> Continue Shopping
            </Link>
          </div>

          {/* SUMMARY */}
          <div className="flex-1">
            <div className="bg-[#0a0a0a] border border-border p-8 sticky top-32">
              <h2 className="font-serif text-2xl mb-8 border-b border-border pb-4">Order Summary</h2>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground uppercase tracking-widest">Subtotal (USD)</span>
                  <span className="font-medium">${subtotal.toLocaleString()}</span>
                </div>
                {subtotal_idr > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground uppercase tracking-widest">Subtotal (IDR)</span>
                    <span className="font-medium">Rp {subtotal_idr.toLocaleString('id-ID')}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground uppercase tracking-widest">Estimated Shipping</span>
                  <span className="text-primary italic">Calculated at checkout</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground uppercase tracking-widest">Insurance</span>
                  <span className="text-primary italic">Included</span>
                </div>
              </div>

              <div className="border-t border-border pt-6 mb-8 flex justify-between items-end">
                <span className="text-muted-foreground uppercase tracking-widest text-sm">Estimated Total</span>
                <div className="text-right">
                  <span className="text-3xl font-light tracking-tighter block">${subtotal.toLocaleString()}</span>
                  {subtotal_idr > 0 && (
                    <span className="text-sm text-muted-foreground block mt-1 tracking-widest font-light">
                      Rp {subtotal_idr.toLocaleString('id-ID')}
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <Button asChild className="w-full bg-primary text-background hover:bg-primary/90 rounded-none py-8 text-sm uppercase tracking-widest group">
                  <Link href="/checkout?cart=true">
                    Proceed to Checkout <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <p className="text-[10px] text-center text-muted-foreground uppercase tracking-[0.1em] leading-relaxed">
                  Certified Authenticity & Worldwide Insurance <br />included with every purchase.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
