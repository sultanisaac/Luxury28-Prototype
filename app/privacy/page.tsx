import { GlobalHeader } from '@/components/global-header';

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background text-foreground font-sans pt-32 pb-24">
      <GlobalHeader />
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="text-4xl md:text-5xl font-serif mb-8 text-center tracking-wide">Privacy Policy</h1>
        <p className="text-muted-foreground text-center uppercase tracking-widest text-xs mb-16">Last Updated: July 2026</p>
        
        <div className="space-y-12 text-gray-300 font-light leading-relaxed">
          <section>
            <h2 className="text-2xl font-serif text-white mb-4 tracking-wide">1. Information We Collect</h2>
            <p className="mb-4">
              Luxury28 respects your privacy. We collect information that you provide directly to us, including your name, email address, shipping address, and payment information when you make a purchase, create an account, or contact our concierge service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-white mb-4 tracking-wide">2. How We Use Your Information</h2>
            <p className="mb-4">
              The information we collect is used strictly to fulfill your orders, provide dedicated customer support, and communicate exclusive offers. We do not sell or rent your personal information to third parties.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-white mb-4 tracking-wide">3. Security</h2>
            <p className="mb-4">
              We implement state-of-the-art security measures, including bank-level encryption, to maintain the safety of your personal information when you place an order or enter, submit, or access your personal information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-white mb-4 tracking-wide">4. Cookies</h2>
            <p className="mb-4">
              Our website uses cookies to enhance your browsing experience, analyze site traffic, and personalize content. You can choose to disable cookies through your browser settings, though this may affect site functionality.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-white mb-4 tracking-wide">5. Contact Us</h2>
            <p className="mb-4">
              If you have any questions regarding this privacy policy or how we handle your data, please contact our privacy officer at privacy@luxury28.com.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
