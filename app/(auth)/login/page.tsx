import { login, signInWithGoogle } from '@/app/auth/actions'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { Logo } from '@/components/logo'

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function LoginPage(props: Props) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    // Verify the user exists in our users table and has a role
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userData?.role) {
      redirect('/dashboard-redirect')
    } else {
      // Stale session (user in auth but not in users table)
      await supabase.auth.signOut()
    }
  }

  const searchParams = await props.searchParams;
  const message = searchParams?.message as string | undefined;
  const error = searchParams?.error as string | undefined;

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-4">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-zinc-900 p-8 shadow-2xl border border-zinc-800">
        <div className="flex justify-center">
          <Logo size={48} className="flex-col !gap-2" />
        </div>
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-white">Welcome back</h1>
          <p className="mt-2 text-sm text-zinc-400">Sign in to your Luxury28 account</p>
        </div>
        
        {message && (
          <div className="rounded-md bg-green-500/10 p-4 text-sm text-green-400 border border-green-500/20">
            {message}
          </div>
        )}
        {error && (
          <div className="rounded-md bg-red-500/10 p-4 text-sm text-red-400 border border-red-500/20">
            {error}
          </div>
        )}

        <form action={login} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-zinc-300">Email address</Label>
            <Input 
              id="email" 
              name="email" 
              type="email" 
              required 
              placeholder="you@example.com"
              className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus-visible:ring-zinc-600"
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-zinc-300">Password</Label>
              <Link href="/forgot-password" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
                Forgot password?
              </Link>
            </div>
            <Input 
              id="password" 
              name="password" 
              type="password" 
              required 
              className="bg-zinc-800 border-zinc-700 text-white focus-visible:ring-zinc-600"
            />
          </div>

          <Button type="submit" className="w-full bg-white text-black hover:bg-zinc-200">
            Sign In
          </Button>
        </form>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-zinc-700" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-zinc-900 px-3 text-zinc-500 tracking-widest">Or continue with</span>
          </div>
        </div>

        {/* Google Sign-In Button */}
        <form action={signInWithGoogle}>
          <Button
            type="submit"
            variant="outline"
            className="w-full border-zinc-700 bg-zinc-800 text-white hover:bg-zinc-700 hover:text-white flex items-center justify-center gap-3 h-11 transition-colors"
          >
            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign in with Google
          </Button>
        </form>

        <p className="text-center text-sm text-zinc-400">
          Don't have an account?{' '}
          <Link href="/signup" className="font-semibold text-white hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
