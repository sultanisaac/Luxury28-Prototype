'use client'

import { Star } from 'lucide-react'

const testimonials = [
  {
    name: 'Sarah Mitchell',
    role: 'Marketing Professional',
    image: '👩‍💼',
    rating: 5,
    quote: 'I was skeptical, but after 28 days I&apos;ve lost 12 lbs and I&apos;ve never felt more focused at work. The mental training is a game-changer.',
    result: '12 lbs lost, improved focus',
  },
  {
    name: 'James Rodriguez',
    role: 'Software Engineer',
    image: '👨‍💻',
    rating: 5,
    quote: 'The personalized AI coach is incredible. It adapted perfectly to my schedule and fitness level. I went from zero workouts to 6 days a week.',
    result: '5 lbs muscle gained',
  },
  {
    name: 'Emily Chen',
    role: 'Business Owner',
    image: '👩‍💼',
    rating: 5,
    quote: 'Body&Mind28 transformed not just my physique, but my entire mental approach to health. I recommend it to everyone now.',
    result: 'Complete lifestyle change',
  },
]

export function Testimonials() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background to-secondary/5">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center space-y-4 mb-16">
          <div className="inline-block px-4 py-2 rounded-full border border-primary/30 bg-primary/5 text-primary text-sm font-medium">
            Real Results
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground">
            Thousands of Transformations
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join our community of people who have achieved their fitness and wellness goals.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="group relative p-8 rounded-xl border border-border bg-secondary/30 backdrop-blur-sm hover:border-accent/50 hover:bg-secondary/50 transition-all duration-300"
            >
              {/* Gradient accent */}
              <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent opacity-0 group-hover:opacity-100 rounded-xl transition-opacity duration-300 pointer-events-none"></div>

              {/* Content */}
              <div className="relative z-10 space-y-6">
                {/* Header with avatar and stats */}
                <div className="space-y-4">
                  {/* Stars */}
                  <div className="flex gap-1">
                    {Array(testimonial.rating)
                      .fill(0)
                      .map((_, i) => (
                        <Star
                          key={i}
                          size={16}
                          className="fill-primary text-primary"
                        />
                      ))}
                  </div>

                  {/* Quote */}
                  <p className="text-foreground leading-relaxed italic">
                    "{testimonial.quote}"
                  </p>
                </div>

                {/* Author Info */}
                <div className="pt-6 border-t border-border space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xl">
                      {testimonial.image}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">
                        {testimonial.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>

                  {/* Result */}
                  <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                      Result
                    </p>
                    <p className="text-sm font-semibold text-primary">
                      {testimonial.result}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-3 gap-8 text-center">
          <div>
            <p className="text-4xl font-bold text-primary mb-2">50K+</p>
            <p className="text-muted-foreground">Active Members</p>
          </div>
          <div>
            <p className="text-4xl font-bold text-accent mb-2">4.9★</p>
            <p className="text-muted-foreground">Average Rating</p>
          </div>
          <div>
            <p className="text-4xl font-bold text-foreground mb-2">92%</p>
            <p className="text-muted-foreground">Completion Rate</p>
          </div>
        </div>
      </div>
    </section>
  )
}
