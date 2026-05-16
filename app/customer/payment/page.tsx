'use client'

import { ShieldCheck, Lock, CreditCard, Landmark, QrCode } from 'lucide-react'

export default function PaymentSettingsPage() {
  return (
    <div className="max-w-4xl">
      <div className="mb-10 pb-4 border-b border-border">
        <h1 className="font-serif text-3xl">Payment Security</h1>
        <p className="text-muted-foreground mt-2 font-light italic">Your security is our highest priority.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Left Column: Trust Information */}
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-primary">
              <ShieldCheck size={28} strokeWidth={1.5} />
              <h2 className="text-lg font-serif tracking-wide">Verified Secure</h2>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed font-light">
              Luxury28 partners with <span className="text-white font-medium">Xendit</span>, Indonesia's leading payment gateway, to ensure every transaction is protected by bank-level encryption.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 text-primary">
              <Lock size={28} strokeWidth={1.5} />
              <h2 className="text-lg font-serif tracking-wide">Zero Card Storage</h2>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed font-light">
              To guarantee absolute privacy, <span className="text-white font-medium">we never store your credit card or sensitive financial data</span> on our servers. All information is handled exclusively on Xendit's PCI-DSS compliant infrastructure.
            </p>
          </div>

          <div className="pt-6 border-t border-border">
            <div className="flex flex-wrap gap-8 items-center opacity-60 grayscale hover:grayscale-0 transition-all duration-700">
              <img src="/images/payment/visa.svg" alt="Visa" className="h-8 object-contain" />
              <img src="/images/payment/mastercard.svg" alt="Mastercard" className="h-8 object-contain" />
              <img src="/images/payment/paypal.svg" alt="PayPal" className="h-8 object-contain" />
              <img src="/images/payment/bca.svg" alt="BCA" className="h-8 object-contain bg-white/10 p-1 rounded" />
            </div>
          </div>
        </div>

        {/* Right Column: Experience Summary */}
        <div className="bg-zinc-900/30 border border-border p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <Lock size={120} />
          </div>
          
          <h3 className="text-xs uppercase tracking-[0.2em] text-primary mb-6">Checkout Experience</h3>
          <ul className="space-y-6">
            <li className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <CreditCard size={16} className="text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Universal Acceptance</p>
                <p className="text-xs text-muted-foreground mt-1">Pay with all major local and international cards.</p>
              </div>
            </li>
            <li className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Landmark size={16} className="text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Direct Bank Transfer</p>
                <p className="text-xs text-muted-foreground mt-1">Seamless Virtual Account integration for all major Indonesian banks.</p>
              </div>
            </li>
            <li className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <QrCode size={16} className="text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Instant QRIS Payments</p>
                <p className="text-xs text-muted-foreground mt-1">Scan and pay instantly using Gopay, OVO, or Dana.</p>
              </div>
            </li>
          </ul>

          <div className="mt-10 p-4 bg-primary/5 border border-primary/20 rounded-lg">
            <p className="text-[10px] uppercase tracking-widest text-primary font-bold mb-2">Private Client Concierge</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              If you require alternative payment arrangements (e.g., Bank Wire for high-value timepieces), please contact our Private Concierge.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
