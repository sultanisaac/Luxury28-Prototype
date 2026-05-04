'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const faqs = [
  {
    question: 'Do I need any fitness equipment?',
    answer: 'No. The program is designed to be fully functional using just your bodyweight. However, we provide modifications for those with dumbbells or resistance bands if you want to add them.',
  },
  {
    question: 'What if I can&apos;t work out for a day or miss a session?',
    answer: 'Life happens. The program is flexible and adaptive. Our AI coach will adjust your plan based on your actual schedule and progress. Missing one session won&apos;t derail your transformation.',
  },
  {
    question: 'Can I cancel my membership anytime?',
    answer: 'Yes, absolutely. Cancel anytime with no questions asked. We also offer a 30-day money-back guarantee, so you can try Pro risk-free.',
  },
  {
    question: 'Is the mental training component scientific?',
    answer: 'Yes. Our meditation and mindfulness techniques are based on peer-reviewed research in cognitive behavioral therapy, mindfulness-based stress reduction, and neuroscience.',
  },
  {
    question: 'How long are the workouts?',
    answer: 'Most sessions are 30-45 minutes. However, we offer quick 15-minute options for busy days and extended 60+ minute sessions for those who want more.',
  },
  {
    question: 'Can I track my progress with other fitness apps?',
    answer: 'Yes. We integrate with Apple Health, Google Fit, Fitbit, and Oura Ring. Your data syncs automatically so you have everything in one place.',
  },
]

export function FAQ() {
  const [expanded, setExpanded] = useState<number | null>(0)

  return (
    <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background to-secondary/5">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center space-y-4 mb-16">
          <div className="inline-block px-4 py-2 rounded-full border border-primary/30 bg-primary/5 text-primary text-sm font-medium">
            Questions
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-muted-foreground">
            Everything you need to know about Body&Mind28.
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border border-border rounded-lg overflow-hidden bg-secondary/20 hover:border-accent/30 transition-all duration-300"
            >
              <button
                onClick={() =>
                  setExpanded(expanded === index ? null : index)
                }
                className="w-full p-6 flex items-center justify-between hover:bg-secondary/30 transition-colors"
              >
                <h3 className="font-semibold text-foreground text-left">
                  {faq.question}
                </h3>
                <ChevronDown
                  size={20}
                  className={`flex-shrink-0 text-primary transition-transform duration-300 ${
                    expanded === index ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {expanded === index && (
                <div className="px-6 pb-6 pt-0 border-t border-border bg-secondary/10">
                  <p className="text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Still have questions CTA */}
        <div className="mt-16 p-8 rounded-xl border border-accent/30 bg-accent/5 text-center">
          <h3 className="text-xl font-bold text-foreground mb-2">
            Still have questions?
          </h3>
          <p className="text-muted-foreground mb-4">
            Our support team is here to help. Reach out anytime.
          </p>
          <button className="px-6 py-2 border border-accent text-accent font-semibold rounded-lg hover:bg-accent/10 transition-colors">
            Contact Support
          </button>
        </div>
      </div>
    </section>
  )
}
