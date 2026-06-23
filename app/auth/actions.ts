'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

export async function login(formData: FormData) {
  const supabase = await createClient()
  
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return redirect('/login?error=Could not authenticate user')
  }

  return redirect('/dashboard-redirect')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()
  
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const firstName = formData.get('firstName') as string
  const lastName = formData.get('lastName') as string
  const phone = formData.get('phone') as string

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName,
        phone: phone,
      }
    }
  })

  if (error) {
    return redirect(`/signup?error=${error.message}`)
  }

  return redirect('/login?message=Check your email to continue sign in process')
}

export async function resetPassword(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string
  
  const { error } = await supabase.auth.resetPasswordForEmail(email)
  
  if (error) {
    return redirect(`/forgot-password?error=${error.message}`)
  }
  
  return redirect('/forgot-password?message=Check your email for the reset link')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut({ scope: 'local' })
  return redirect('/')
}

export async function signInWithGoogle() {
  const supabase = await createClient()
  const headersList = await headers()
  
  // Get the most accurate site URL
  const siteUrl = 
    process.env.NEXT_PUBLIC_APP_URL || 
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) || 
    headersList.get('origin') || 
    'http://localhost:3000'
    
  // Clean up trailing slash if present
  const cleanOrigin = siteUrl.replace(/\/$/, '')

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${cleanOrigin}/auth/callback`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  })

  if (error || !data.url) {
    return redirect('/login?error=Could not authenticate with Google')
  }

  return redirect(data.url)
}
