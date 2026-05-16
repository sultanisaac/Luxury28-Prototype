import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { GlobalHeader } from '@/components/global-header'

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-serif" });

export const metadata: Metadata = {
  title: 'Luxury28 | Premium Timepieces',
  description: 'Curated luxury watches. Certified authenticity. Limited availability.',
  keywords: 'luxury watches, premium timepieces, certified authenticity, rolex, patek philippe, audemars piguet',
  generator: 'v0.app',
  openGraph: {
    title: 'Luxury28 | Premium Timepieces',
    description: 'Curated luxury watches. Certified authenticity. Limited availability.',
    type: 'website',
  },
  icons: {
    icon: [
      {
        url: '/Luxury28.png',
      },
    ],
    apple: '/Luxury28.png',
  },
}

import { CartProvider } from '@/context/CartContext'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark bg-background">
      <body className={`${inter.variable} ${playfair.variable} font-sans antialiased text-foreground selection:bg-primary/30`}>
        <CartProvider>
          <GlobalHeader />
          {children}
          {process.env.NODE_ENV === 'production' && <Analytics />}
        </CartProvider>
      </body>
    </html>
  )
}
