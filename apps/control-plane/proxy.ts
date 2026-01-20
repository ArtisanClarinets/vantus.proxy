import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
  const url = request.nextUrl;
  const { pathname } = url;

  // 1. Authentication Protection
  // Protect all routes under /app
  if (pathname.startsWith('/app')) {
    // Call Better Auth API to validate session
    // We cannot import auth/prisma here as middleware runs on Edge
    const sessionUrl = new URL('/api/auth/get-session', request.url);

    try {
        const response = await fetch(sessionUrl, {
            headers: {
                cookie: request.headers.get('cookie') || ''
            }
        });

        const sessionData = await response.json();
        // sessionData usually contains { session, user } or null
        const session = sessionData?.session;

        if (!session) {
            const loginUrl = new URL('/auth/login', request.url);
            loginUrl.searchParams.set('callbackUrl', pathname);
            return NextResponse.redirect(loginUrl);
        }

        const requestHeaders = new Headers(request.headers);
        requestHeaders.set('x-user-id', sessionData.user.id);

        // 2. Tenant Context
        // Check if X-Tenant-Id is present (from Nginx)
        let tenantId = request.headers.get('x-tenant-id');

        if (!tenantId) {
            // Check URL path for explicit tenant context
            const tenantMatch = pathname.match(/^\/app\/tenants\/([^\/]+)/);
            if (tenantMatch && tenantMatch[1] !== 'create') {
                tenantId = tenantMatch[1];
                requestHeaders.set('x-tenant-id', tenantId);
            }
        }

        // If we have a tenantId, we could inject it.
        // Also if subdomain is used.
        // const host = request.headers.get('host') || '';
        // Check if host is a tenant domain (via Redis API if needed).
        // For now, we trust path or header.

        return NextResponse.next({
            request: {
                headers: requestHeaders,
            },
        });

    } catch (e) {
        console.error("Auth check failed", e);
        // Fail open or closed? Closed.
        const loginUrl = new URL('/auth/login', request.url);
        return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
};
