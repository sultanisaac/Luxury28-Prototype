import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  // Maintenance mode intercept
  const isMaintenanceMode = process.env.MAINTENANCE_MODE === 'true';
  
  if (isMaintenanceMode) {
    const isMaintenancePath = pathname === '/maintenance';

    if (!isMaintenancePath) {
      const url = request.nextUrl.clone();
      url.pathname = '/maintenance';
      return NextResponse.redirect(url);
    }
  }

  // Protected routes require authentication
  const isProtectedRoute = pathname.startsWith('/admin') ||
    pathname.startsWith('/staff') ||
    pathname.startsWith('/customer') ||
    pathname === '/dashboard-redirect'

  if (isProtectedRoute && !user) {
    // no user, potentially respond by redirecting the user to the login page
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Role-based protection
  if (user && (pathname.startsWith('/admin') || pathname.startsWith('/staff') || pathname.startsWith('/customer'))) {
    // We need to check their role. 
    // To do this we query the users table
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    const role = userData?.role

    if (!role) {
      // If they have no role, their session is stale/invalid. Force them to login.
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }

    if (pathname.startsWith('/admin') && role !== 'admin') {
      const url = request.nextUrl.clone()
      url.pathname = '/404'
      return NextResponse.rewrite(url)
    }

    if (pathname.startsWith('/staff') && role !== 'staff') {
      const url = request.nextUrl.clone()
      url.pathname = '/404'
      return NextResponse.rewrite(url)
    }

    if (pathname.startsWith('/customer') && role !== 'customer') {
      const url = request.nextUrl.clone()
      url.pathname = '/404'
      return NextResponse.rewrite(url)
    }
  }

  return supabaseResponse
}
