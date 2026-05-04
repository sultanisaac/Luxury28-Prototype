import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Body&Mind28 - Transform Your Body & Mind in 28 Days',
  description: 'Join thousands who have transformed their bodies and minds with our personalized 28-day fitness program. AI-powered workouts, mental clarity, and real results.',
  keywords: 'fitness program, mental wellness, 28-day challenge, personalized workouts, AI coach',
  generator: 'v0.app',
  openGraph: {
    title: 'Body&Mind28 - Transform Your Body & Mind in 28 Days',
    description: 'Join thousands who have transformed their bodies and minds with our personalized 28-day fitness program.',
    type: 'website',
  },
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark bg-background">
      <body className={`${inter.className} font-sans antialiased text-foreground`}>
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
