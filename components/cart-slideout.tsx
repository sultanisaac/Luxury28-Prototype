'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function CartSlideOut({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  // Mock cart items for now until database integration
  const [items, setItems] = useState([
    {
      id: '1',
      name: 'Rolex Submariner Date',
      price: 14500,
      image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?q=80&w=200&auto=format&fit=crop',
      quantity: 1,
    }
  ]);

  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />

          {/* Slide-out Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full sm:w-[450px] bg-background border-l border-border z-[101] shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="font-serif text-2xl text-primary flex items-center gap-3">
                <ShoppingBag size={24} /> Your Cart
              </h2>
              <button onClick={onClose} className="text-muted-foreground hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                  <ShoppingBag size={48} className="text-muted-foreground/30" />
                  <p className="text-muted-foreground">Your cart is currently empty.</p>
                  <Button variant="outline" className="rounded-none uppercase tracking-widest text-xs" onClick={onClose}>
                    Continue Shopping
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-4 p-4 border border-border bg-card">
                      <div className="w-20 h-20 relative bg-[#111] overflow-hidden flex-shrink-0">
                        <img src={item.image} alt={item.name} className="object-cover w-full h-full opacity-80" />
                      </div>
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="font-serif text-sm truncate pr-6">{item.name}</h3>
                          <p className="text-primary font-medium tracking-wider text-sm mt-1">${item.price.toLocaleString()}</p>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-muted-foreground uppercase tracking-widest">Qty: {item.quantity}</span>
                          <button onClick={() => removeItem(item.id)} className="text-muted-foreground hover:text-red-400 transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-6 border-t border-border bg-[#050505]">
                <div className="flex justify-between mb-6">
                  <span className="text-muted-foreground uppercase tracking-widest text-sm">Subtotal</span>
                  <span className="font-serif text-xl text-primary">${subtotal.toLocaleString()}</span>
                </div>
                <Button className="w-full bg-primary text-background hover:bg-primary/90 rounded-none uppercase tracking-widest py-6" asChild>
                  <Link href="/cart" onClick={onClose}>
                    Checkout / Go to Cart
                  </Link>
                </Button>
                <p className="text-center text-xs text-muted-foreground mt-4 font-light">
                  Shipping & taxes calculated at checkout.
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
