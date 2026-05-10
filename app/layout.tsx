import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-serif" });

export const metadata: Metadata = {
  title: 'Luxury28 | Jam Tangan Premium',
  description: 'Jam tangan mewah pilihan. Keaslian bersertifikat. Ketersediaan terbatas.',
  keywords: 'jam tangan mewah, jam tangan premium, keaslian bersertifikat, rolex, patek philippe, audemars piguet',
  generator: 'v0.app',
  openGraph: {
    title: 'Luxury28 | Jam Tangan Premium',
    description: 'Jam tangan mewah pilihan. Keaslian bersertifikat. Ketersediaan terbatas.',
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
    <html lang="id" className="dark bg-background">
      <body className={`${inter.variable} ${playfair.variable} font-sans antialiased text-foreground selection:bg-primary/30`}>
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
