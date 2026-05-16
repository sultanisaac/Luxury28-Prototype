'use client'

import { useState } from 'react'
import { CreditCard, Plus, Trash2, ShieldCheck, Wallet, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

const PAYMENT_METHODS = [
  { id: 'card', label: 'Credit / Debit Card', icon: CreditCard, description: 'Visa, Mastercard, AMEX' },
  { id: 'bank', label: 'Bank Transfer', icon: Building2, description: 'Direct bank payment' },
  { id: 'wallet', label: 'Digital Wallet', icon: Wallet, description: 'PayPal, Apple Pay, Google Pay' },
]

// Mock saved cards — in production these come from Stripe
const MOCK_CARDS = [
  { id: 'card_1', brand: 'Visa', last4: '4242', expiry: '12/26', isDefault: true },
  { id: 'card_2', brand: 'Mastercard', last4: '5555', expiry: '08/27', isDefault: false },
]

export default function PaymentSettingsPage() {
  const [savedCards] = useState(MOCK_CARDS)
  const [preferred, setPreferred] = useState('card')
  const [showAddCard, setShowAddCard] = useState(false)

  const handleSavePreference = () => {
    toast.success('Payment preference saved')
  }

  return (
    <div>
      <div className="mb-8 pb-4 border-b border-border">
        <h1 className="font-serif text-3xl">Payment Settings</h1>
        <p className="text-muted-foreground mt-2 font-light">Manage your preferred payment methods for checkout.</p>
      </div>

      <div className="space-y-10 max-w-2xl">

        {/* Preferred Method Selector */}
        <div>
          <h2 className="text-xs uppercase tracking-widest text-muted-foreground mb-4">Preferred Payment Method</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {PAYMENT_METHODS.map((method) => {
              const Icon = method.icon
              const isSelected = preferred === method.id
              return (
                <button
                  key={method.id}
                  onClick={() => setPreferred(method.id)}
                  className={`flex flex-col items-center gap-3 p-5 border text-center transition-all ${
                    isSelected
                      ? 'border-primary bg-primary/5 text-white'
                      : 'border-border hover:border-primary/50 text-muted-foreground'
                  }`}
                >
                  <Icon size={24} className={isSelected ? 'text-primary' : ''} />
                  <div>
                    <p className="text-xs uppercase tracking-widest font-medium">{method.label}</p>
                    <p className="text-[11px] text-muted-foreground mt-1">{method.description}</p>
                  </div>
                  {isSelected && (
                    <span className="text-[10px] uppercase tracking-widest text-primary border border-primary/40 px-2 py-0.5">Selected</span>
                  )}
                </button>
              )
            })}
          </div>
          <Button onClick={handleSavePreference} className="mt-4 bg-primary text-background hover:bg-primary/90 rounded-none uppercase tracking-widest text-xs px-8">
            Save Preference
          </Button>
        </div>

        {/* Saved Cards */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xs uppercase tracking-widest text-muted-foreground">Saved Cards</h2>
            <button onClick={() => setShowAddCard(!showAddCard)} className="text-xs uppercase tracking-widest text-primary hover:underline flex items-center gap-1">
              <Plus size={14} /> Add Card
            </button>
          </div>

          {showAddCard && (
            <div className="mb-6 border border-primary/30 p-5 bg-background/50">
              <p className="text-xs text-muted-foreground mb-4">Card details are encrypted and stored securely via Stripe. You will be redirected to complete setup.</p>
              <Button className="bg-primary text-background hover:bg-primary/90 rounded-none uppercase tracking-widest text-xs" onClick={() => { toast.info('Stripe card setup coming soon'); setShowAddCard(false) }}>
                <CreditCard size={14} className="mr-2" /> Add via Stripe
              </Button>
            </div>
          )}

          <div className="space-y-3">
            {savedCards.map((card) => (
              <div key={card.id} className={`flex items-center justify-between p-4 border transition-colors ${card.isDefault ? 'border-primary/40 bg-primary/5' : 'border-border'}`}>
                <div className="flex items-center gap-4">
                  <CreditCard size={20} className={card.isDefault ? 'text-primary' : 'text-muted-foreground'} />
                  <div>
                    <p className="text-sm font-medium">{card.brand} •••• {card.last4}</p>
                    <p className="text-xs text-muted-foreground">Expires {card.expiry}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {card.isDefault && (
                    <span className="text-[10px] uppercase tracking-widest text-primary border border-primary/40 px-2 py-0.5">Default</span>
                  )}
                  <button className="text-muted-foreground hover:text-red-400 transition-colors">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Security Notice */}
        <div className="flex items-start gap-3 p-4 border border-border/50 bg-background/30">
          <ShieldCheck size={18} className="text-primary mt-0.5 flex-shrink-0" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            All payment information is encrypted using industry-standard SSL/TLS. Card details are never stored on our servers — they are handled exclusively by our secure payment processor.
          </p>
        </div>
      </div>
    </div>
  )
}
