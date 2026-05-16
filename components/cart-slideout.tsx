'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

import { useCart } from '@/context/CartContext';

export function CartSlideOut({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { items, removeItem, subtotal, subtotal_idr } = useCart();

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
                          <div className="flex flex-col gap-0.5 mt-1">
                            <span className="text-primary font-medium tracking-wider text-sm">${item.price.toLocaleString()}</span>
                            {item.price_idr && (
                              <span className="text-[10px] text-muted-foreground font-light tracking-widest uppercase">
                                Rp {item.price_idr.toLocaleString('id-ID')}
                              </span>
                            )}
                          </div>
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
                <div className="space-y-1 mb-6">
                  <div className="flex justify-between items-end">
                    <span className="text-muted-foreground uppercase tracking-widest text-[10px]">Subtotal USD</span>
                    <span className="font-serif text-xl text-primary">${subtotal.toLocaleString()}</span>
                  </div>
                  {subtotal_idr > 0 && (
                    <div className="flex justify-between items-end">
                      <span className="text-muted-foreground uppercase tracking-widest text-[10px]">Subtotal IDR</span>
                      <span className="font-sans text-xs text-muted-foreground tracking-widest">Rp {subtotal_idr.toLocaleString('id-ID')}</span>
                    </div>
                  )}
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
