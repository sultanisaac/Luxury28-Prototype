'use client'

import Image from 'next/image'
import Link from 'next/link'

interface LogoProps {
  className?: string
  size?: number
}

export function Logo({ className = "", size = 40 }: LogoProps) {
  return (
    <Link href="/" className={`relative group flex items-center gap-3 ${className}`}>
      <div className="rounded-full overflow-hidden border border-zinc-800 bg-zinc-950 p-0.5">
        <Image 
          src="/Luxury28.png" 
          alt="Luxury28 Logo" 
          width={size} 
          height={size} 
          className="rounded-full object-cover"
        />
      </div>
      <span className="font-serif text-lg sm:text-xl font-bold tracking-[0.2em] sm:tracking-widest text-white group-hover:text-amber-500 transition-colors whitespace-nowrap">
        LUXURY28
      </span>
    </Link>
  )
}
