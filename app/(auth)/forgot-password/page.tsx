import { resetPassword } from '@/app/auth/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function ForgotPasswordPage(props: Props) {
  const searchParams = await props.searchParams;
  const message = searchParams?.message as string | undefined;
  const error = searchParams?.error as string | undefined;

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-4">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-zinc-900 p-8 shadow-2xl border border-zinc-800">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-white">Reset Password</h1>
          <p className="mt-2 text-sm text-zinc-400">Enter your email to receive a reset link</p>
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

        <form action={resetPassword} className="space-y-6">
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
          
          <Button type="submit" className="w-full bg-white text-black hover:bg-zinc-200">
            Send Reset Link
          </Button>
        </form>

        <p className="text-center text-sm text-zinc-400">
          Remember your password?{' '}
          <Link href="/login" className="font-semibold text-white hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
