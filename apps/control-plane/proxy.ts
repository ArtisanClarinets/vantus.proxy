import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Proxy Middleware (formerly middleware.ts)
 * 
 * This middleware handles:
 * 1. Authentication protection for /app routes.
 * 2. Tenant context injection via headers.
 * 3. Session validation using Better Auth.
 * 
 * @param {NextRequest} request - The incoming Next.js request.
 * @returns {Promise<NextResponse>} The response or redirect.
 */
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
            // Pattern: /app/tenants/:tenantId
            const tenantMatch = pathname.match(/^\/app\/tenants\/([^\/]+)/);
            if (tenantMatch && tenantMatch[1] !== 'create') {
                tenantId = tenantMatch[1];
                requestHeaders.set('x-tenant-id', tenantId);
            }
        }

        return NextResponse.next({
            request: {
                headers: requestHeaders,
            },
        });

    } catch (e) {
        console.error("Auth check failed", e);
        const loginUrl = new URL('/auth/login', request.url);
        return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export default proxy;

export const config = {
  matcher: [
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
};
