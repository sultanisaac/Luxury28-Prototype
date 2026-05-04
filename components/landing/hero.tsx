'use client'

import { ArrowRight } from 'lucide-react'

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 pb-12 px-4 sm:px-6 lg:px-8">
      {/* Gradient background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
        {/* Left Content */}
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="inline-block px-4 py-2 rounded-full border border-primary/30 bg-primary/5 text-primary text-sm font-medium">
              Transform in 28 Days
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground leading-tight text-balance">
              Your Body <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">& Mind</span> Evolved
            </h1>
            <p className="text-xl text-muted-foreground max-w-lg leading-relaxed">
              Experience the only program that combines personalized AI-powered workouts with scientifically-proven mental clarity techniques. Join thousands who transformed themselves in just 28 days.
            </p>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button className="group px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 transition-all duration-300 flex items-center justify-center gap-2">
              Start Your Journey
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="px-8 py-4 border-2 border-accent/30 text-foreground font-semibold rounded-lg hover:border-accent/60 hover:bg-accent/5 transition-all duration-300">
              See How It Works
            </button>
          </div>

          {/* Trust badges */}
          <div className="pt-4 space-y-3">
            <p className="text-sm text-muted-foreground">Trusted by 50,000+ members worldwide</p>
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full border-2 border-background bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xs font-bold text-primary-foreground"
                  >
                    +
                  </div>
                ))}
              </div>
              <span className="text-sm text-muted-foreground">Join the community</span>
            </div>
          </div>
        </div>

        {/* Right Visual */}
        <div className="relative h-96 lg:h-full min-h-[500px]">
          <div className="absolute inset-0 rounded-2xl overflow-hidden">
            {/* Glassmorphism card */}
            <div className="absolute inset-0 bg-gradient-to-br from-secondary/40 to-secondary/20 backdrop-blur-xl border border-accent/20 rounded-2xl p-8">
              <div className="space-y-6 h-full flex flex-col justify-between">
                {/* Week progress */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Week 1 Progress</span>
                    <span className="text-lg font-bold text-primary">25%</span>
                  </div>
                  <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                    <div className="w-1/4 h-full bg-gradient-to-r from-primary to-accent rounded-full"></div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                    <p className="text-xs text-muted-foreground mb-1">Workouts Done</p>
                    <p className="text-2xl font-bold text-primary">7</p>
                  </div>
                  <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
                    <p className="text-xs text-muted-foreground mb-1">Streak</p>
                    <p className="text-2xl font-bold text-accent">7 days</p>
                  </div>
                </div>

                {/* Upcoming */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Next Session</p>
                  <div className="p-3 rounded-lg bg-secondary border border-border">
                    <p className="text-sm font-semibold text-foreground">Strength & Core</p>
                    <p className="text-xs text-muted-foreground">45 min • 8:00 AM</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating card 1 */}
            <div className="absolute -bottom-6 -right-4 w-48 p-4 bg-secondary/60 backdrop-blur-lg border border-accent/30 rounded-xl shadow-2xl transform hover:translate-y-2 transition-transform">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <span className="text-lg">💪</span>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Body Progress</p>
                  <p className="text-sm font-bold text-primary">+5 lbs muscle</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
