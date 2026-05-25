'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, X, Users, Copy, Check, Key } from 'lucide-react';

export function PrototypeOverlay() {
  const [isOpen, setIsOpen] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Show in development by default, or if explicitly enabled via environment variable
  const isPrototype = process.env.NEXT_PUBLIC_IS_PROTOTYPE === 'true' || process.env.NODE_ENV === 'development';

  if (!isPrototype) return null;

  // Retrieve credentials from environment variables (safe for public repos!)
  const credentials = {
    admin: {
      role: 'Admin Panel',
      email: process.env.NEXT_PUBLIC_TEST_ADMIN_EMAIL || 'admin1@gmail.com',
      pass: process.env.NEXT_PUBLIC_TEST_ADMIN_PASS || 'admin123',
      color: 'border-amber-500/20 text-amber-500',
    },
    staff: {
      role: 'Staff Dashboard',
      email: process.env.NEXT_PUBLIC_TEST_STAFF_EMAIL || 'staff1@gmail.com',
      pass: process.env.NEXT_PUBLIC_TEST_STAFF_PASS || 'staff123',
      color: 'border-blue-500/20 text-blue-400',
    },
    customer: {
      role: 'Customer Portal',
      email: process.env.NEXT_PUBLIC_TEST_CUSTOMER_EMAIL || 'customer1@gmail.com',
      pass: process.env.NEXT_PUBLIC_TEST_CUSTOMER_PASS || 'customer123',
      color: 'border-emerald-500/20 text-emerald-400',
    },
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => {
      setCopiedKey(null);
    }, 2000);
  };

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
      <div className="fixed bottom-4 right-4 z-[100] font-sans">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="bg-zinc-950/95 backdrop-blur-md border border-zinc-800 rounded-xl shadow-[0_10px_50px_rgba(0,0,0,0.8)] p-4 w-80 mb-4"
            >
              <div className="flex items-center justify-between mb-3 border-b border-zinc-900 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                  </span>
                  <div className="flex items-center gap-1.5 text-amber-500 text-xs uppercase tracking-widest font-bold">
                    <Key size={14} />
                    Demo Test Accounts
                  </div>
                </div>
                <button 
                  onClick={() => setIsOpen(false)} 
                  className="text-zinc-500 hover:text-white transition-colors p-1 hover:bg-zinc-900 rounded-lg"
                  title="Minimize Panel"
                >
                  <X size={14} />
                </button>
              </div>

              <p className="text-[10px] text-zinc-500 mb-3 leading-relaxed">
                Click any credential field below to copy it instantly.
              </p>

              <div className="space-y-3">
                {Object.entries(credentials).map(([key, data]) => (
                  <div key={key} className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-2.5 hover:border-zinc-700 transition-colors">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">
                        {data.role}
                      </span>
                      <span className={`text-[8px] font-semibold px-1.5 py-0.5 rounded border bg-zinc-950 ${data.color.split(' ')[0]} ${data.color.split(' ')[1]}`}>
                        Active
                      </span>
                    </div>

                    <div className="space-y-1">
                      {/* Email Box */}
                      <button
                        onClick={() => handleCopy(data.email, `${key}-email`)}
                        className="w-full flex items-center justify-between bg-zinc-950 border border-zinc-900 hover:border-zinc-700 p-1.5 px-2 rounded text-xs font-mono transition-all text-left text-zinc-300 group"
                      >
                        <span className="truncate pr-2">
                          email: <span className="text-white group-hover:text-amber-200">{data.email}</span>
                        </span>
                        {copiedKey === `${key}-email` ? (
                          <span className="text-emerald-500 text-[10px] flex items-center gap-1 shrink-0 font-sans font-semibold">
                            <Check size={12} /> Copied!
                          </span>
                        ) : (
                          <Copy size={12} className="text-zinc-500 group-hover:text-zinc-300 transition-colors shrink-0" />
                        )}
                      </button>

                      {/* Password Box */}
                      <button
                        onClick={() => handleCopy(data.pass, `${key}-pass`)}
                        className="w-full flex items-center justify-between bg-zinc-950 border border-zinc-900 hover:border-zinc-700 p-1.5 px-2 rounded text-xs font-mono transition-all text-left text-zinc-300 group"
                      >
                        <span className="truncate pr-2">
                          pass: <span className="text-white group-hover:text-amber-200">{data.pass}</span>
                        </span>
                        {copiedKey === `${key}-pass` ? (
                          <span className="text-emerald-500 text-[10px] flex items-center gap-1 shrink-0 font-sans font-semibold">
                            <Check size={12} /> Copied!
                          </span>
                        ) : (
                          <Copy size={12} className="text-zinc-500 group-hover:text-zinc-300 transition-colors shrink-0" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!isOpen && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.1 }}
            onClick={() => setIsOpen(true)}
            title="Open Demo Accounts"
            className="relative flex items-center justify-center bg-zinc-950/95 backdrop-blur-md border border-amber-500/50 hover:border-amber-400 text-amber-500 w-12 h-12 rounded-full shadow-[0_0_25px_rgba(245,158,11,0.25)] hover:shadow-[0_0_35px_rgba(245,158,11,0.45)] transition-all group"
          >
            <span className="absolute top-0 right-0 flex h-3 w-3 -mt-0.5 -mr-0.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
            </span>
            <Users size={20} className="group-hover:rotate-12 transition-transform duration-300" />
          </motion.button>
        )}
      </div>
    </>
  );
}
