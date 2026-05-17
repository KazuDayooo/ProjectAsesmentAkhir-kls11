// middleware.js — Next.js Edge Middleware
import { NextResponse } from 'next/server';
import { verifyToken, extractToken } from '@/lib/auth';

const PUBLIC_ROUTES = ['/api/auth/login', '/api/auth/logout'];
const PUBLIC_PAGES  = ['/login', '/register'];

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_ROUTES.some(r => pathname.startsWith(r))) return NextResponse.next();
  if (PUBLIC_PAGES.some(p => pathname.startsWith(p)))  return NextResponse.next();
  if (pathname.startsWith('/_next') || pathname.startsWith('/favicon')) return NextResponse.next();

  const isApiRoute  = pathname.startsWith('/api/');
  const isPageRoute = pathname.startsWith('/pengaduan')
                   || pathname.startsWith('/riwayat')
                   || pathname.startsWith('/superadmin');

  if (!isApiRoute && !isPageRoute) return NextResponse.next();

  try {
    const token = extractToken(request);
    if (!token) throw new Error('No token');
    const payload = await verifyToken(token);

    // Proteksi extra: /superadmin hanya untuk role superadmin
    if (
      pathname.startsWith('/superadmin') ||
      pathname.startsWith('/api/superadmin')
    ) {
      if (payload.role !== 'superadmin') {
        if (isApiRoute) {
          return NextResponse.json(
            { success: false, error: 'Forbidden.' },
            { status: 403 }
          );
        }
        return NextResponse.redirect(new URL('/pengaduan', request.url));
      }
    }

    return NextResponse.next();
  } catch {
    if (isApiRoute) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Token tidak valid atau sudah expired.' },
        { status: 401 }
      );
    }
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: [
    '/api/:path*',
    '/pengaduan/:path*',
    '/pengaduan',
    '/riwayat/:path*',
    '/riwayat',
    '/superadmin/:path*',
    '/superadmin',
  ],
};
