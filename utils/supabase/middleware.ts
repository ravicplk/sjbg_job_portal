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

  // Refresh session if expired
  const { data: { user } } = await supabase.auth.getUser()

  const isEmployerRoute = request.nextUrl.pathname.startsWith('/employer')
  const isSeekerDashboard = request.nextUrl.pathname.startsWith('/dashboard')
  const isSeekerProfile = request.nextUrl.pathname.startsWith('/profile')
  const isSeekerResume = request.nextUrl.pathname.startsWith('/resume')
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin')
  const isApplyRoute = request.nextUrl.pathname.match(/^\/jobs\/.*\/apply$/)

  const isProtected = isEmployerRoute || isSeekerDashboard || isSeekerProfile || isSeekerResume || isAdminRoute || isApplyRoute

  if (!user && isProtected) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (user) {
    // Determine the user's role from the metadata or database 
    // We can use the Database if necessary, but to avoid an extra DB call on every request
    // let's grab it from user_metadata if it exists, otherwise from DB
    
    // As per our trigger, role is stored in public.users, but we might not have it in session immediately
    // Let's query public.users:
    const { data: userData } = await supabase.from('users').select('role').eq('id', user.id).single()
    const role = userData?.role

    if (isEmployerRoute && role !== 'employer') {
      return NextResponse.redirect(new URL('/', request.url))
    }
    if ((isSeekerDashboard || isSeekerProfile || isSeekerResume) && role !== 'job_seeker') {
      return NextResponse.redirect(new URL('/', request.url))
    }
    if (isAdminRoute && role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url))
    }

    // Redirect authenticated users away from auth pages
    if (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/register') {
      if (role === 'employer') return NextResponse.redirect(new URL('/employer/dashboard', request.url))
      if (role === 'job_seeker') return NextResponse.redirect(new URL('/dashboard', request.url))
      if (role === 'admin') return NextResponse.redirect(new URL('/admin/dashboard', request.url))
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // Stamp pathname so root layout can detect /admin without header-sniffing hacks
  supabaseResponse.headers.set('x-pathname', request.nextUrl.pathname)

  return supabaseResponse
}
