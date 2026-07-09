import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Inisialisasi Supabase SSR Client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set({ name, value, ...options })
          })
          supabaseResponse = NextResponse.next({
            request: { headers: request.headers },
          })
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set({ name, value, ...options })
          })
        },
      },
    }
  )

  // Ambil user auth saat ini
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname
  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/register') || pathname === '/'

  // 1. Proteksi Umum: User belum login dilarang masuk selain rute auth
  if (!user && !isAuthRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // 2. Role-Based Route Protection (RBAC) & Active Status
  if (user) {
    // Mengambil role dan status is_active dari profil di database
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, is_active')
      .eq('auth_user_id', user.id)
      .single()

    const role = profile?.role
    const isActive = profile?.is_active ?? true // default true jika belum dimigrasi

    // Blokir jika akun nonaktif
    if (!isActive) {
      // Izinkan logout action agar tidak stuck infinite loop jika user mencoba signOut
      // Idealnya arahkan ke halaman error khusus /blocked, atau /login dengan parameter
      if (!pathname.startsWith('/login') && pathname !== '/blocked') {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        url.searchParams.set('error', 'Akun Anda dinonaktifkan oleh administrator.')
        // Hapus session cookies untuk memaksa logout di level middleware
        const response = NextResponse.redirect(url)
        response.cookies.delete('sb-' + new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).hostname.split('.')[0] + '-auth-token')
        return response
      }
    }

    if (isActive) {
      // Proteksi area Admin
      if (pathname.startsWith('/admin') && role !== 'admin') {
        return NextResponse.redirect(new URL(`/${role}/dashboard`, request.url))
      }
      
      // Proteksi area Staff
      if (pathname.startsWith('/staff') && role !== 'staff') {
        return NextResponse.redirect(new URL(`/${role}/dashboard`, request.url))
      }
      
      // Proteksi area Customer
      if (pathname.startsWith('/customer') && role !== 'customer') {
        return NextResponse.redirect(new URL(`/${role}/dashboard`, request.url))
      }

      // Hindari user login (yang aktif) masuk ke halaman login/register lagi
      if (isAuthRoute && role) {
        return NextResponse.redirect(new URL(`/${role}/dashboard`, request.url))
      }
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
