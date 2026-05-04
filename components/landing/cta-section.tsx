'use client'

import { ArrowRight, CheckCircle2 } from 'lucide-react'

export function CTASection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="rounded-2xl border border-accent/30 bg-gradient-to-br from-secondary/50 to-secondary/20 backdrop-blur-xl p-12 sm:p-16 text-center">
          {/* Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-4xl sm:text-5xl font-bold text-foreground">
                Your Transformation Starts Today
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Join thousands of people who have already achieved their fitness and wellness goals with Body&Mind28.
              </p>
            </div>

            {/* Benefits */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 py-8">
              <div className="space-y-2">
                <div className="flex justify-center">
                  <CheckCircle2 className="w-8 h-8 text-primary" />
                </div>
                <p className="font-semibold text-foreground">7-Day Free Trial</p>
                <p className="text-sm text-muted-foreground">No credit card required</p>
              </div>
              <div className="space-y-2">
                <div className="flex justify-center">
                  <CheckCircle2 className="w-8 h-8 text-primary" />
                </div>
                <p className="font-semibold text-foreground">30-Day Guarantee</p>
                <p className="text-sm text-muted-foreground">Full refund if unsatisfied</p>
              </div>
              <div className="space-y-2">
                <div className="flex justify-center">
                  <CheckCircle2 className="w-8 h-8 text-primary" />
                </div>
                <p className="font-semibold text-foreground">Cancel Anytime</p>
                <p className="text-sm text-muted-foreground">No hidden contracts</p>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <button className="group px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 transition-all duration-300 flex items-center justify-center gap-2">
                Start Your 28-Day Journey
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="px-8 py-4 border-2 border-accent/30 text-foreground font-semibold rounded-lg hover:border-accent/60 hover:bg-accent/5 transition-all duration-300">
                Learn More
              </button>
            </div>

            {/* Trust statement */}
            <p className="text-sm text-muted-foreground pt-4">
              50,000+ members trust us with their transformation. Join the community today.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
