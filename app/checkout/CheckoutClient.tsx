'use client';

import { useState, useTransition } from 'react';
import { SmartImage } from '@/components/ui/smart-image';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Truck, CreditCard, ShieldCheck, Loader2, ChevronRight, CheckCircle2, AlertCircle, Tag, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createCheckoutOrder, CheckoutPayload } from '@/app/actions/checkout';
import { validateCoupon } from '@/app/actions/coupon';
import { useCart } from '@/context/CartContext';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ShippingAddress {
  id: string;
  label: string;
  recipient_name: string;
  phone: string;
  street_address: string;
  city: string;
  province: string;
  postal_code: string;
}

interface CourierRate {
  courierCode: string;
  courierName: string;
  serviceCode: string;
  serviceName: string;
  duration: string;
  price: number;
}

interface Watch {
  id: string;
  name: string;
  price: number;
  price_idr: number;
  tier: string;
  image: string;
}

interface CheckoutClientProps {
  watch: Watch | null;
  isCart?: boolean;
  addresses: ShippingAddress[];
  userEmail: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatIDR = (amount: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);

// ─── Steps ────────────────────────────────────────────────────────────────────

const STEPS = ['Address', 'Shipping', 'Review'];

export default function CheckoutClient({ watch, isCart, addresses, userEmail }: CheckoutClientProps) {
  const { items: cartItems, subtotal_idr } = useCart();
  const [step, setStep] = useState(0);
  const [selectedAddress, setSelectedAddress] = useState<ShippingAddress | null>(
    addresses.find((a) => (a as any).is_default) || addresses[0] || null
  );
  const [rates, setRates] = useState<CourierRate[]>([]);
  const [selectedRate, setSelectedRate] = useState<CourierRate | null>(null);
  const [destinationAreaId, setDestinationAreaId] = useState('');
  const [loadingRates, setLoadingRates] = useState(false);
  const [ratesError, setRatesError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [isPending, startTransition] = useTransition();

  // Coupon State
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponError, setCouponError] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  const checkoutItems = isCart ? cartItems.map(item => ({
    id: item.id,
    name: item.name,
    price_idr: item.price_idr,
    image: item.image,
    quantity: item.quantity,
    tier: item.category
  })) : watch ? [{
    id: watch.id,
    name: watch.name,
    price_idr: watch.price_idr,
    image: watch.image,
    quantity: 1,
    tier: watch.tier
  }] : [];

  const priceIDR = isCart ? subtotal_idr : (watch?.price_idr || 0);

  // ── Fetch shipping rates ────────────────────────────────────────────────────
  const fetchRates = async (address: ShippingAddress) => {
    setLoadingRates(true);
    setRatesError('');
    setRates([]);
    setSelectedRate(null);
    try {
      const res = await fetch('/api/shipping/rates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postalCode: address.postal_code,
          city: address.city,
          productName: isCart ? 'Multiple Luxury Watches' : (watch?.name || 'Watch'),
          productValue: priceIDR,
          quantity: checkoutItems.reduce((acc, item) => acc + item.quantity, 0),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch rates');
      setRates(data.rates);
      setDestinationAreaId(data.destinationAreaId);
    } catch (err: any) {
      setRatesError(err.message);
    } finally {
      setLoadingRates(false);
    }
  };

  // ── Coupon Logic ────────────────────────────────────────────────────────────
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setApplyingCoupon(true);
    setCouponError('');
    try {
      const res = await validateCoupon(couponCode.trim(), priceIDR);
      if (res.success) {
        setAppliedCoupon(res.coupon);
        setCouponCode('');
      } else {
        setCouponError(res.error || 'Invalid coupon');
      }
    } catch (e) {
      setCouponError('Error applying coupon');
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError('');
  };

  // ── Step: Address → Shipping ───────────────────────────────────────────────
  const handleContinueToShipping = () => {
    if (!selectedAddress) return;
    setStep(1);
    fetchRates(selectedAddress);
  };

  // ── Step: Shipping → Review ────────────────────────────────────────────────
  const handleContinueToReview = () => {
    if (!selectedRate) return;
    setStep(2);
  };

  // ── Final: Submit to Xendit ────────────────────────────────────────────────
  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const total = Math.max(0, priceIDR - discountAmount) + (selectedRate?.price || 0);

  const handlePay = () => {
    if (!selectedAddress || !selectedRate) return;

    const payload: CheckoutPayload = {
      items: checkoutItems.map(i => ({
        productId: i.id,
        productName: i.name,
        productImage: i.image,
        unitPrice: i.price_idr,
        quantity: i.quantity
      })),
      shippingAddressId: selectedAddress.id,
      destinationAreaId,
      courierCode: selectedRate.courierCode,
      courierName: selectedRate.courierName,
      courierServiceCode: selectedRate.serviceCode,
      courierServiceName: selectedRate.serviceName,
      shippingCost: selectedRate.price,
      couponId: appliedCoupon?.id,
      discountAmount: discountAmount
    };

    setSubmitError('');
    startTransition(async () => {
      try {
        await createCheckoutOrder(payload);
      } catch (err: any) {
        console.error('[Checkout Submit Error]', err);
        // Only set error if it's not a redirect (Next.js redirect throws a special error)
        if (err.message !== 'NEXT_REDIRECT') {
          setSubmitError(err.message || 'Failed to process payment. Please try again.');
        }
      }
    });
  };


  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background text-foreground pt-20 pb-16 font-sans">
      <div className="max-w-5xl mx-auto px-4 md:px-8">

        {/* ── Header ── */}
        <div className="text-center mb-10">
          <p className="text-xs uppercase tracking-[0.3em] text-primary mb-2">Secure Checkout</p>
          <h1 className="font-serif text-3xl md:text-4xl">Complete Your Order</h1>
        </div>

        {/* ── Step Progress ── */}
        <div className="flex items-center justify-center gap-0 mb-10">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center">
              <button
                onClick={() => i < step && setStep(i)}
                className={`flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-widest transition-colors ${
                  i === step ? 'text-primary font-semibold' :
                  i < step ? 'text-muted-foreground hover:text-white cursor-pointer' :
                  'text-zinc-700 cursor-not-allowed'
                }`}
              >
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border ${
                  i < step ? 'border-primary bg-primary text-background' :
                  i === step ? 'border-primary text-primary' :
                  'border-zinc-700 text-zinc-700'
                }`}>
                  {i < step ? <CheckCircle2 size={14} /> : i + 1}
                </span>
                {label}
              </button>
              {i < STEPS.length - 1 && <ChevronRight size={14} className="text-zinc-700" />}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── Left: Steps ── */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">

              {/* ── STEP 0: Address ── */}
              {step === 0 && (
                <motion.div key="address" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                  <div className="flex items-center gap-3 mb-6">
                    <MapPin size={18} className="text-primary" />
                    <h2 className="text-lg uppercase tracking-widest">Delivery Address</h2>
                  </div>

                  {addresses.length === 0 ? (
                    <div className="border border-dashed border-border p-8 text-center text-muted-foreground">
                      <p>No addresses saved.</p>
                      <a href="/customer/addresses" className="text-primary text-sm mt-2 inline-block hover:underline">
                        Add an address →
                      </a>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {addresses.map((addr) => (
                        <button
                          key={addr.id}
                          onClick={() => setSelectedAddress(addr)}
                          className={`w-full text-left p-5 border transition-all ${
                            selectedAddress?.id === addr.id
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-zinc-600'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs uppercase tracking-widest text-primary font-semibold">{addr.label}</span>
                            {selectedAddress?.id === addr.id && <CheckCircle2 size={16} className="text-primary" />}
                          </div>
                          <p className="font-medium">{addr.recipient_name}</p>
                          <p className="text-sm text-muted-foreground">{addr.phone}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {addr.street_address}, {addr.city}, {addr.province} {addr.postal_code}
                          </p>
                        </button>
                      ))}
                    </div>
                  )}

                  <Button
                    onClick={handleContinueToShipping}
                    disabled={!selectedAddress}
                    className="w-full mt-6 h-14 rounded-none bg-primary text-background uppercase tracking-widest hover:bg-primary/90"
                  >
                    Continue to Shipping
                  </Button>
                </motion.div>
              )}

              {/* ── STEP 1: Shipping ── */}
              {step === 1 && (
                <motion.div key="shipping" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                  <div className="flex items-center gap-3 mb-6">
                    <Truck size={18} className="text-primary" />
                    <h2 className="text-lg uppercase tracking-widest">Shipping Method</h2>
                  </div>

                  {loadingRates && (
                    <div className="flex items-center gap-3 text-muted-foreground py-12 justify-center">
                      <Loader2 size={20} className="animate-spin text-primary" />
                      <span className="text-sm">Fetching courier rates for {selectedAddress?.city}…</span>
                    </div>
                  )}

                  {ratesError && (
                    <div className="flex items-center gap-3 border border-red-500/30 bg-red-500/10 text-red-400 p-4 text-sm">
                      <AlertCircle size={16} />
                      {ratesError}
                    </div>
                  )}

                  {!loadingRates && rates.length > 0 && (
                    <div className="space-y-3">
                      {rates.map((rate) => (
                        <button
                          key={`${rate.courierCode}-${rate.serviceCode}`}
                          onClick={() => setSelectedRate(rate)}
                          className={`w-full text-left p-5 border transition-all ${
                            selectedRate?.courierCode === rate.courierCode && selectedRate?.serviceCode === rate.serviceCode
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-zinc-600'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold uppercase tracking-wide">{rate.courierName}</span>
                                <span className="text-xs text-muted-foreground bg-zinc-800 px-2 py-0.5">{rate.serviceName}</span>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">Estimated {rate.duration}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-primary">{formatIDR(rate.price)}</p>
                              {selectedRate?.courierCode === rate.courierCode && selectedRate?.serviceCode === rate.serviceCode && (
                                <CheckCircle2 size={16} className="text-primary ml-auto mt-1" />
                              )}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-3 mt-6">
                    <Button variant="outline" onClick={() => setStep(0)} className="flex-1 h-14 rounded-none border-border uppercase tracking-widest">
                      Back
                    </Button>
                    <Button
                      onClick={handleContinueToReview}
                      disabled={!selectedRate}
                      className="flex-1 h-14 rounded-none bg-primary text-background uppercase tracking-widest hover:bg-primary/90"
                    >
                      Review Order
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* ── STEP 2: Review & Pay ── */}
              {step === 2 && (
                <motion.div key="review" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                  <div className="flex items-center gap-3 mb-6">
                    <CreditCard size={18} className="text-primary" />
                    <h2 className="text-lg uppercase tracking-widest">Review & Pay</h2>
                  </div>

                  {/* Address Summary */}
                  <div className="border border-border p-5 mb-4">
                    <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Deliver To</p>
                    <p className="font-medium">{selectedAddress?.recipient_name}</p>
                    <p className="text-sm text-muted-foreground">{selectedAddress?.street_address}, {selectedAddress?.city}, {selectedAddress?.province} {selectedAddress?.postal_code}</p>
                    <p className="text-sm text-muted-foreground">{selectedAddress?.phone}</p>
                  </div>

                  {/* Shipping Summary */}
                  <div className="border border-border p-5 mb-6">
                    <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Courier</p>
                    <p className="font-medium">{selectedRate?.courierName} — {selectedRate?.serviceName}</p>
                    <p className="text-sm text-muted-foreground">Estimated {selectedRate?.duration}</p>
                  </div>

                  {/* Trust notice */}
                  <div className="flex items-start gap-3 bg-zinc-900 border border-zinc-800 p-4 mb-6 text-sm text-muted-foreground">
                    <ShieldCheck size={18} className="text-primary mt-0.5 flex-shrink-0" />
                    <p>
                      You will be redirected to <strong className="text-white">Xendit</strong>'s secure payment page.
                      Pay via <strong className="text-white">QRIS, GoPay, OVO, ShopeePay, or Bank Transfer</strong>. Your card data is never stored on our servers.
                    </p>
                  </div>

                  {/* Error notice */}
                  {submitError && (
                    <div className="flex items-center gap-3 border border-red-500/30 bg-red-500/10 text-red-400 p-4 mb-6 text-sm">
                      <AlertCircle size={16} />
                      {submitError}
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setStep(1)} className="flex-1 h-14 rounded-none border-border uppercase tracking-widest">
                      Back
                    </Button>
                    <Button
                      onClick={handlePay}
                      disabled={isPending}
                      className="flex-1 h-14 rounded-none bg-primary text-background uppercase tracking-widest hover:bg-primary/90 disabled:opacity-60"
                    >
                      {isPending ? (
                        <span className="flex items-center gap-2"><Loader2 size={16} className="animate-spin" /> Processing…</span>
                      ) : (
                        `PAY NOW — ${formatIDR(total)}`
                      )}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── Right: Order Summary ── */}
          <div className="lg:col-span-1">
            <div className="border border-border p-6 sticky top-24">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">Order Summary</p>

              <div className="max-h-60 overflow-y-auto mb-6 pr-2 space-y-4">
                {checkoutItems.map((item, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="w-20 h-20 bg-zinc-900 border border-border relative flex-shrink-0">
                      <SmartImage src={item.image} alt={item.name} fill className="object-contain p-2" fallbackType="luxury" />
                    </div>
                    <div>
                      <p className="text-xs text-primary uppercase tracking-widest">{item.tier}</p>
                      <p className="font-serif text-lg leading-tight">{item.name}</p>
                      <p className="text-sm text-muted-foreground mt-1">Qty: {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Coupon Section */}
              <div className="border-t border-border pt-4 mb-4">
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Promo Code</p>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-primary/10 border border-primary/20 p-3 rounded">
                    <div className="flex items-center gap-2 text-primary">
                      <Tag size={16} />
                      <span className="font-bold text-sm tracking-wide">{appliedCoupon.code}</span>
                    </div>
                    <button onClick={handleRemoveCoupon} className="text-primary hover:text-white transition-colors">
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Enter code" 
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="flex-1 bg-zinc-900 border border-zinc-800 px-3 py-2 text-sm focus:outline-none focus:border-primary/50 text-white uppercase placeholder:normal-case placeholder:text-zinc-600"
                    />
                    <Button 
                      variant="outline" 
                      className="border-zinc-800 hover:bg-zinc-800"
                      onClick={handleApplyCoupon}
                      disabled={applyingCoupon || !couponCode.trim()}
                    >
                      {applyingCoupon ? <Loader2 size={16} className="animate-spin" /> : 'Apply'}
                    </Button>
                  </div>
                )}
                {couponError && <p className="text-red-400 text-xs mt-2">{couponError}</p>}
              </div>

              <div className="space-y-2 text-sm border-t border-border pt-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Item price</span>
                  <span>{formatIDR(priceIDR)}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-primary">
                    <span>Discount ({appliedCoupon.code})</span>
                    <span>-{formatIDR(appliedCoupon.discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{selectedRate ? formatIDR(selectedRate.price) : '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Insurance</span>
                  <span className="text-green-400 text-xs">Included ✓</span>
                </div>
                <div className="flex justify-between font-semibold text-base pt-2 border-t border-border">
                  <span>Total</span>
                  <span className="text-primary">{formatIDR(total)}</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-border flex items-center gap-2 text-xs text-muted-foreground">
                <ShieldCheck size={14} className="text-primary" />
                Certified authenticity included
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
