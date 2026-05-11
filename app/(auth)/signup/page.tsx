import { signup } from '@/app/auth/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function SignupPage(props: Props) {
  const searchParams = await props.searchParams;
  const error = searchParams?.error as string | undefined;

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-4">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-zinc-900 p-8 shadow-2xl border border-zinc-800">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-white">Create an account</h1>
          <p className="mt-2 text-sm text-zinc-400">Join Luxury28 for an exclusive experience</p>
        </div>

        {error && (
          <div className="rounded-md bg-red-500/10 p-4 text-sm text-red-400 border border-red-500/20">
            {error}
          </div>
        )}

        <form action={signup} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-zinc-300">First name</Label>
              <Input 
                id="firstName" 
                name="firstName" 
                required 
                className="bg-zinc-800 border-zinc-700 text-white focus-visible:ring-zinc-600"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-zinc-300">Last name</Label>
              <Input 
                id="lastName" 
                name="lastName" 
                required 
                className="bg-zinc-800 border-zinc-700 text-white focus-visible:ring-zinc-600"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-zinc-300">Email address</Label>
            <Input 
              id="email" 
              name="email" 
              type="email" 
              required 
              placeholder="you@example.com"
              className="bg-zinc-800 border-zinc-700 text-white focus-visible:ring-zinc-600"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-zinc-300">Phone number (Optional)</Label>
            <Input 
              id="phone" 
              name="phone" 
              type="tel" 
              placeholder="+1 (555) 000-0000"
              className="bg-zinc-800 border-zinc-700 text-white focus-visible:ring-zinc-600"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password" className="text-zinc-300">Password</Label>
            <Input 
              id="password" 
              name="password" 
              type="password" 
              required 
              className="bg-zinc-800 border-zinc-700 text-white focus-visible:ring-zinc-600"
            />
          </div>

          <Button type="submit" className="w-full bg-white text-black hover:bg-zinc-200 mt-6">
            Sign Up
          </Button>
        </form>

        <p className="text-center text-sm text-zinc-400">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-white hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
