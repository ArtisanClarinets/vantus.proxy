import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// This is the new Next.js 16 convention replacing middleware.ts
export async function proxy(request: NextRequest) {
  const token = await getToken({ req: request });
  const url = request.nextUrl;
  const { pathname } = url;

  // 1. Authentication Protection
  // Protect all routes under /app
  if (pathname.startsWith('/app')) {
    if (!token) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 2. Tenant Context Injection (Simulation)
  // In a real edge proxy, Nginx would do this.
  // Here we simulate header injection for the application context.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-url', request.url);

  if (token) {
      requestHeaders.set('x-user-id', token.sub || '');
      requestHeaders.set('x-user-role', (token as any).role || 'VIEWER');
  }

  // 3. Multi-tenancy Subdomain Handling
  // If the app is accessed via tenant.vantus.systems, rewrite to specific tenant view?
  // For the control plane, we usually access via app.vantus.systems.
  // But let's assume we want to support custom domains for the control plane itself.

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

// Configuration for the proxy
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
};
