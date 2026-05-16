'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/logo'

export function GlobalFooter() {
  const pathname = usePathname()

  // Hide footer on admin, staff, and customer dashboards
  const isDashboardRoute = 
    pathname?.startsWith('/admin') || 
    pathname?.startsWith('/staff') || 
    pathname?.startsWith('/customer')

  if (isDashboardRoute) return null

  return (
    <footer className="bg-[#050505] pt-24 pb-12 border-t border-border">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2">
            <Logo size={48} className="mb-6 !gap-4" />
            <p className="text-muted-foreground max-w-sm font-light mb-4">
              Curated luxury watches for the modern collector. We only deal in excellence.
            </p>
            <div className="text-sm text-zinc-500 font-light space-y-1">
              <p>E: luxury28@luxury28.com</p>
              <p>P: +1 234 567 89</p>
            </div>
          </div>
          <div>
            <h5 className="uppercase tracking-widest text-sm mb-6 text-white">Navigation</h5>
            <ul className="space-y-4 text-muted-foreground text-sm font-light">
              <li><Link href="/products" className="hover:text-primary transition-colors">Products</Link></li>
              <li><Link href="/#trust" className="hover:text-primary transition-colors">Our Standard</Link></li>
              <li><Link href="/#faq" className="hover:text-primary transition-colors">Before Investing</Link></li>
              <li><Link href="/contact" className="hover:text-primary transition-colors">Contact Support</Link></li>
            </ul>
          </div>
          <div>
            <h5 className="uppercase tracking-widest text-sm mb-6 text-white">Newsletter</h5>
            <p className="text-muted-foreground text-sm mb-4 font-light">Get priority access to rare and limited timepieces.</p>
            <div className="flex">
              <input type="email" placeholder="Your email address" className="bg-transparent border border-border px-4 py-2 w-full text-sm focus:outline-none focus:border-primary" />
              <Button className="rounded-none bg-primary text-background hover:bg-primary/90 px-6">JOIN</Button>
            </div>
          </div>
        </div>
        <div className="pt-8 border-t border-border/50 text-center text-xs text-muted-foreground uppercase tracking-widest flex flex-col md:flex-row justify-between items-center gap-4">
          <p>&copy; {new Date().getFullYear()} Luxury28. All Rights Reserved.</p>
          <div className="flex gap-6">
            <Link href="/terms" className="hover:text-primary transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
