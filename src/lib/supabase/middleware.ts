import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'

// =====================================================
// Supabase Middleware Client — لتحديث الجلسة في middleware
// =====================================================

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // تحديث الجلسة (مهم — لا تحذف هذا السطر)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // الصفحات التي تتطلب تسجيل دخول
  const protectedPaths = [
    '/dashboard',
    '/studios',
    '/history',
    '/library',
    '/profile',
    '/settings',
    '/admin',
  ]

  const isProtected = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  )

  // الصفحات الخاصة بالأدمن
  const isAdminPath = request.nextUrl.pathname.startsWith('/admin')

  if (isProtected && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirectTo', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  // إذا كان المستخدم مسجلاً وحاول الوصول لصفحات Auth — نحوّله للـ dashboard
  const authPaths = ['/login', '/register', '/forgot-password']
  const isAuthPath = authPaths.some((path) => request.nextUrl.pathname === path)

  if (isAuthPath && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // فحص الأدمن (سيتم التحقق الكامل في الصفحة نفسها أيضاً)
  if (isAdminPath && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return supabaseResponse
}
