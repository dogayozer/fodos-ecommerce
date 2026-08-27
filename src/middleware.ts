import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Yalnızca /admin ve /api/admin altındaki rotaları kontrol et
  if (request.nextUrl.pathname.startsWith('/admin') || request.nextUrl.pathname.startsWith('/api/admin')) {
    
    // Ana login sayfasına erişime izin ver
    if (request.nextUrl.pathname === '/admin') {
      return NextResponse.next()
    }

    const session = request.cookies.get('admin_session')
    
    if (session?.value !== 'authenticated') {
      // API isteğiyse 401 dön
      if (request.nextUrl.pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      
      // Arayüz isteğiyse ana login sayfasına yönlendir
      return NextResponse.redirect(new URL('/admin', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}