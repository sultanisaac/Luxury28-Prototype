'use client'

import { useState } from 'react'
import { CheckCircle2 } from 'lucide-react'

const weeks = [
  {
    week: 1,
    title: 'Foundation',
    subtitle: 'Build Your Base',
    description: 'Establish solid fundamentals with mobility work and mindset reset. Learn proper form and breathing techniques.',
    workouts: [
      'Full Body Mobility Flow',
      'Intro to Strength Training',
      'Mindfulness Fundamentals',
    ],
    focus: 'Laying the groundwork for lasting transformation',
  },
  {
    week: 2,
    title: 'Acceleration',
    subtitle: 'Increase Intensity',
    description: 'Ramp up intensity with progressive overload. Build mental resilience through guided challenge sessions.',
    workouts: [
      'Progressive Strength Program',
      'High-Intensity Intervals',
      'Mental Resilience Training',
    ],
    focus: 'Breaking through your comfort zone safely',
  },
  {
    week: 3,
    title: 'Integration',
    subtitle: 'Mind & Body Sync',
    description: 'Integrate strength and mindfulness. Advanced techniques for peak performance and mental clarity.',
    workouts: [
      'Complex Movement Patterns',
      'Advanced Meditation Practices',
      'Sport-Specific Training',
    ],
    focus: 'Harmonizing physical and mental growth',
  },
  {
    week: 4,
    title: 'Mastery',
    subtitle: 'Peak Performance',
    description: 'Achieve your personal best. Celebrate progress and plan your continuous journey beyond 28 days.',
    workouts: [
      'Max Strength & Power Tests',
      'Advanced Performance Work',
      'Lifetime Habits Building',
    ],
    focus: 'Creating sustainable excellence',
  },
]

export function Program() {
  const [selectedWeek, setSelectedWeek] = useState(0)

  return (
    <section id="program" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center space-y-4 mb-16">
          <div className="inline-block px-4 py-2 rounded-full border border-primary/30 bg-primary/5 text-primary text-sm font-medium">
            The Program
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground">
            Your 28-Day Journey
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A scientifically-designed progression that takes you from beginner to master.
          </p>
        </div>

        {/* Week Tabs */}
        <div className="flex gap-4 mb-12 overflow-x-auto pb-4">
          {weeks.map((w, index) => (
            <button
              key={index}
              onClick={() => setSelectedWeek(index)}
              className={`flex-shrink-0 px-6 py-3 rounded-lg font-semibold transition-all duration-300 whitespace-nowrap ${
                selectedWeek === index
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/50'
                  : 'bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80'
              }`}
            >
              Week {w.week}
            </button>
          ))}
        </div>

        {/* Week Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left - Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-primary text-sm font-semibold uppercase tracking-wider">
                  {weeks[selectedWeek].subtitle}
                </p>
                <h3 className="text-4xl font-bold text-foreground">
                  {weeks[selectedWeek].title}
                </h3>
              </div>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {weeks[selectedWeek].description}
              </p>
            </div>

            {/* Workouts List */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                Weekly Focus
              </h4>
              <ul className="space-y-3">
                {weeks[selectedWeek].workouts.map((workout, idx) => (
                  <li key={idx} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="text-muted-foreground">{workout}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Focus Statement */}
            <div className="p-6 rounded-lg border border-accent/30 bg-accent/5">
              <p className="text-sm text-muted-foreground uppercase tracking-wider mb-2">
                Key Focus
              </p>
              <p className="text-lg font-semibold text-foreground">
                {weeks[selectedWeek].focus}
              </p>
            </div>
          </div>

          {/* Right - Visual Timeline */}
          <div className="relative">
            {/* Timeline */}
            <div className="space-y-6">
              {weeks.map((w, index) => (
                <div
                  key={index}
                  className={`flex gap-4 cursor-pointer transition-all duration-300 ${
                    selectedWeek === index ? 'opacity-100' : 'opacity-50 hover:opacity-75'
                  }`}
                  onClick={() => setSelectedWeek(index)}
                >
                  {/* Timeline Node */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                        selectedWeek === index
                          ? 'bg-gradient-to-br from-primary to-accent text-primary-foreground scale-110 shadow-lg shadow-primary/50'
                          : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                      }`}
                    >
                      {w.week}
                    </div>
                    {index < weeks.length - 1 && (
                      <div
                        className={`w-1 h-12 mt-2 transition-colors duration-300 ${
                          index < selectedWeek
                            ? 'bg-gradient-to-b from-primary to-accent'
                            : 'bg-border'
                        }`}
                      ></div>
                    )}
                  </div>

                  {/* Content Card */}
                  <div
                    className={`flex-1 p-4 rounded-lg border transition-all duration-300 ${
                      selectedWeek === index
                        ? 'border-primary/50 bg-primary/5'
                        : 'border-border bg-secondary/20 hover:border-accent/30'
                    }`}
                  >
                    <h4 className="font-bold text-foreground">{w.title}</h4>
                    <p className="text-sm text-muted-foreground">{w.subtitle}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
