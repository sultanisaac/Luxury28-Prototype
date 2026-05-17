'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, X, Users } from 'lucide-react';

export function PrototypeOverlay() {
  const [isOpen, setIsOpen] = useState(true);

  // Show in development by default, or if explicitly enabled via environment variable
  const isPrototype = process.env.NEXT_PUBLIC_IS_PROTOTYPE === 'true' || process.env.NODE_ENV === 'development';

  // Do not render anything if not strictly set to prototype mode
  if (!isPrototype) return null;

  // Retrieve credentials from environment variables (safe for public repos!)
  const adminEmail = process.env.NEXT_PUBLIC_TEST_ADMIN_EMAIL || 'admin1@gmail.com';
  const adminPass = process.env.NEXT_PUBLIC_TEST_ADMIN_PASS || 'admin123';

  const staffEmail = process.env.NEXT_PUBLIC_TEST_STAFF_EMAIL || 'staff1@gmail.com';
  const staffPass = process.env.NEXT_PUBLIC_TEST_STAFF_PASS || 'staff123';

  const customerEmail = process.env.NEXT_PUBLIC_TEST_CUSTOMER_EMAIL || 'customer1@gmail.com';
  const customerPass = process.env.NEXT_PUBLIC_TEST_CUSTOMER_PASS || 'customer123';

  return (
    <>
      {/* Top Banner */}
      <div className="fixed top-0 w-full z-[100] h-8 bg-amber-500/10 text-amber-500 flex items-center justify-center text-[10px] sm:text-xs font-semibold tracking-widest uppercase backdrop-blur-md border-b border-amber-500/20">
        <span className="flex items-center gap-2">
          <Info size={14} />
          Prototype Environment — Not for Production Use
        </span>
      </div>

      {/* Floating Accounts Widget */}
      <div className="fixed bottom-4 left-4 z-[100]">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="bg-zinc-950/90 backdrop-blur-md border border-zinc-800 rounded-xl shadow-2xl p-4 w-72 mb-4"
            >
              <div className="flex items-center justify-between mb-4 border-b border-zinc-800 pb-2">
                <div className="flex items-center gap-2 text-primary text-xs uppercase tracking-widest font-semibold">
                  <Users size={14} />
                  Test Accounts
                </div>
                <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-white transition-colors">
                  <X size={14} />
                </button>
              </div>

              <div className="space-y-4">
                {/* Admin */}
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Admin Panel</p>
                  <div className="bg-zinc-900 border border-zinc-800 p-2 rounded text-xs font-mono text-zinc-300">
                    <div>email: <span className="text-white">{adminEmail}</span></div>
                    <div>pass: <span className="text-white">{adminPass}</span></div>
                  </div>
                </div>

                {/* Staff */}
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Staff Dashboard</p>
                  <div className="bg-zinc-900 border border-zinc-800 p-2 rounded text-xs font-mono text-zinc-300">
                    <div>email: <span className="text-white">{staffEmail}</span></div>
                    <div>pass: <span className="text-white">{staffPass}</span></div>
                  </div>
                </div>

                {/* Customer */}
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Customer Portal</p>
                  <div className="bg-zinc-900 border border-zinc-800 p-2 rounded text-xs font-mono text-zinc-300">
                    <div>email: <span className="text-white">{customerEmail}</span></div>
                    <div>pass: <span className="text-white">{customerPass}</span></div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!isOpen && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setIsOpen(true)}
            className="bg-zinc-950/90 backdrop-blur-md border border-zinc-800 hover:border-primary/50 text-primary p-3 rounded-full shadow-2xl transition-all"
          >
            <Users size={20} />
          </motion.button>
        )}
      </div>
    </>
  );
}
