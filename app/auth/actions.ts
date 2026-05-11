'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

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
  await supabase.auth.signOut()
  return redirect('/')
}
