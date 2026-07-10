import { GlobalHeader } from '@/components/global-header';

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-background text-foreground font-sans pt-32 pb-24">
      <GlobalHeader />
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="text-4xl md:text-5xl font-serif mb-8 text-center tracking-wide">Terms of Service</h1>
        <p className="text-muted-foreground text-center uppercase tracking-widest text-xs mb-16">Last Updated: July 2026</p>
        
        <div className="space-y-12 text-gray-300 font-light leading-relaxed">
          <section>
            <h2 className="text-2xl font-serif text-white mb-4 tracking-wide">1. Agreement to Terms</h2>
            <p className="mb-4">
              By accessing our website and purchasing our luxury timepieces, you agree to be bound by these Terms of Service. Luxury28 reserves the right to update or modify these terms at any time without prior notice.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-white mb-4 tracking-wide">2. Authenticity Guarantee</h2>
            <p className="mb-4">
              Every timepiece sold by Luxury28 undergoes rigorous inspection by certified master watchmakers. We guarantee the authenticity of every watch sold. If a timepiece is proven to be inauthentic by a manufacturer-certified appraiser within 14 days of delivery, a full refund will be issued.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-white mb-4 tracking-wide">3. Purchasing and Payment</h2>
            <p className="mb-4">
              All prices are subject to change without notice. We reserve the right to refuse or cancel any order. Payments must be cleared in full, via our approved gateways or wire transfer, before any item is shipped. For high-value transactions, additional identity verification may be required.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-white mb-4 tracking-wide">4. Shipping and Insurance</h2>
            <p className="mb-4">
              All shipments are fully insured for the purchase value. Title and risk of loss transfer to you upon delivery to the shipping address provided. You are responsible for any customs duties, taxes, or import fees applicable in your jurisdiction.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-white mb-4 tracking-wide">5. Returns and Refunds</h2>
            <p className="mb-4">
              We offer a 7-day return policy for online purchases. The item must be returned in the exact condition it was received, unworn, with all original packaging, tags, and documentation intact. Custom or sourced orders are final sale.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
