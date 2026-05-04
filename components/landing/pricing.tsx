'use client'

import { Check } from 'lucide-react'

const plans = [
  {
    name: 'Free Trial',
    price: '€0',
    period: '7 days',
    description: 'Experience the program risk-free',
    cta: 'Start Free Trial',
    highlighted: false,
    features: [
      'Access to full workout library',
      'Basic progress tracking',
      'Community forum access',
      'Mobile app on iOS & Android',
      'Standard AI coaching (limited)',
    ],
    unavailable: [
      'Advanced analytics',
      'Personalized meal plans',
      'Priority support',
      'Advanced meditation library',
    ],
  },
  {
    name: 'Pro Membership',
    price: '€12–19',
    period: 'per month',
    description: 'Recommended for serious transformations',
    cta: 'Start Your Journey',
    highlighted: true,
    features: [
      'Everything in Free Trial',
      'Full AI coach with real-time adjustments',
      'Personalized meal plans & nutrition tracking',
      'Advanced analytics & progress insights',
      'Priority email support (24/7)',
      'Advanced meditation & mindfulness library',
      'Community challenges with prizes',
      'Sync across unlimited devices',
      'Offline mode for workouts',
      'Exclusive member events',
    ],
    unavailable: [],
  },
]

export function Pricing() {
  return (
    <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center space-y-4 mb-16">
          <div className="inline-block px-4 py-2 rounded-full border border-primary/30 bg-primary/5 text-primary text-sm font-medium">
            Pricing
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground">
            Choose Your Path
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Try free for 7 days or unlock your full potential with Pro membership.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative rounded-xl border transition-all duration-300 ${
                plan.highlighted
                  ? 'border-primary/50 bg-gradient-to-br from-secondary/50 to-secondary/20 scale-105 md:scale-110 shadow-2xl shadow-primary/30'
                  : 'border-border bg-secondary/30 hover:border-accent/50'
              }`}
            >
              {/* Featured badge */}
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="px-4 py-1 bg-gradient-to-r from-primary to-accent text-primary-foreground text-sm font-semibold rounded-full">
                    Most Popular
                  </div>
                </div>
              )}

              <div className="p-8 space-y-8">
                {/* Header */}
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold text-foreground">
                    {plan.name}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {plan.description}
                  </p>
                  <div className="space-y-2">
                    <p className="text-5xl font-bold text-foreground">
                      {plan.price}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {plan.period}
                    </p>
                  </div>
                </div>

                {/* CTA */}
                <button
                  className={`w-full py-3 font-semibold rounded-lg transition-all duration-300 ${
                    plan.highlighted
                      ? 'bg-primary text-primary-foreground hover:opacity-90'
                      : 'border-2 border-accent/30 text-foreground hover:border-accent/60 hover:bg-accent/5'
                  }`}
                >
                  {plan.cta}
                </button>

                {/* Features */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                    Included
                  </h4>
                  <ul className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-muted-foreground">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Unavailable Features */}
                {plan.unavailable.length > 0 && (
                  <div className="space-y-4 pt-6 border-t border-border">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Not Included
                    </h4>
                    <ul className="space-y-2">
                      {plan.unavailable.map((feature, idx) => (
                        <li key={idx} className="text-xs text-muted-foreground opacity-60">
                          • {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* FAQ / Money-back guarantee */}
        <div className="mt-16 max-w-2xl mx-auto text-center">
          <div className="p-6 rounded-lg border border-accent/30 bg-accent/5">
            <p className="text-sm text-muted-foreground mb-2">
              Not satisfied? No problem.
            </p>
            <p className="text-lg font-semibold text-foreground">
              30-day money-back guarantee on all memberships
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
