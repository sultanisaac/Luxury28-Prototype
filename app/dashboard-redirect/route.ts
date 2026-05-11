import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL('/login', requestUrl.origin))
  }

  // Fetch the user's role from the public.users table
  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()
  
  const role = userData?.role || 'customer'

  // Redirect based on role
  if (role === 'admin') {
    return NextResponse.redirect(new URL('/admin', requestUrl.origin))
  } else if (role === 'staff') {
    return NextResponse.redirect(new URL('/staff', requestUrl.origin))
  } else {
    return NextResponse.redirect(new URL('/customer', requestUrl.origin))
  }
}
