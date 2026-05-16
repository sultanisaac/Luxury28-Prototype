import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Home, MoveLeft } from 'lucide-react'
import { Logo } from '@/components/logo'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full text-center space-y-8">
        <div className="relative">
          <h1 className="text-[12rem] md:text-[20rem] font-serif font-bold text-zinc-900 leading-none select-none">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <h2 className="text-2xl md:text-4xl font-serif text-white tracking-widest uppercase bg-zinc-950 px-8 py-2">
              Lost in Time
            </h2>
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-zinc-400 text-lg md:text-xl font-light max-w-md mx-auto">
            The timepiece or page you are looking for has been moved to a private collection or does not exist.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
          <Button variant="outline" className="border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-none px-8 py-6 w-full sm:w-auto uppercase tracking-widest group" asChild>
            <Link href="/">
              <MoveLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Home
            </Link>
          </Button>
          <Button className="bg-primary text-background hover:bg-primary/90 rounded-none px-12 py-6 w-full sm:w-auto uppercase tracking-widest font-bold" asChild>
            <Link href="/login">
              Client Portal
            </Link>
          </Button>
        </div>

        <div className="pt-20 flex justify-center opacity-30 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-700">
          <Logo className="!gap-4" />
        </div>
      </div>
    </div>
  )
}
