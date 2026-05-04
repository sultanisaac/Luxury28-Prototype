'use client'

import { Zap, Brain, BarChart3, Smartphone } from 'lucide-react'

const features = [
  {
    icon: Zap,
    title: 'Personalized AI Coach',
    description: 'Get real-time form correction, adaptive difficulty, and personalized workout recommendations that evolve with your progress.',
    color: 'from-primary to-primary',
  },
  {
    icon: Brain,
    title: 'Mental Clarity Program',
    description: 'Daily mindfulness sessions, meditation guides, and mental resilience training tailored to your goals.',
    color: 'from-accent to-accent',
  },
  {
    icon: BarChart3,
    title: 'Real-Time Progress Tracking',
    description: 'Visual analytics, achievement milestones, and detailed insights into your physical and mental transformation.',
    color: 'from-primary via-accent to-primary',
  },
  {
    icon: Smartphone,
    title: 'Sync Across Devices',
    description: 'Start on your phone, continue on your tablet, and finish on your desktop. Your progress is always synchronized.',
    color: 'from-accent to-primary',
  },
]

export function Features() {
  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background to-secondary/5">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center space-y-4 mb-16">
          <div className="inline-block px-4 py-2 rounded-full border border-primary/30 bg-primary/5 text-primary text-sm font-medium">
            Core Features
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground">
            Everything You Need to Transform
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Our comprehensive program combines cutting-edge technology with proven fitness principles.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={index}
                className="group relative p-8 rounded-xl border border-border bg-secondary/30 backdrop-blur-sm hover:border-accent/50 hover:bg-secondary/50 transition-all duration-300"
              >
                {/* Gradient accent */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 rounded-xl transition-opacity duration-300 pointer-events-none"></div>

                {/* Content */}
                <div className="relative z-10 space-y-4">
                  {/* Icon */}
                  <div className={`w-14 h-14 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-7 h-7 text-primary-foreground" />
                  </div>

                  {/* Text */}
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>

                {/* Hover line */}
                <div className="absolute bottom-0 left-0 w-0 h-1 bg-gradient-to-r from-primary to-accent rounded-full group-hover:w-full transition-all duration-500"></div>
              </div>
            )
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <button className="px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 transition-opacity">
            Explore All Features
          </button>
        </div>
      </div>
    </section>
  )
}
