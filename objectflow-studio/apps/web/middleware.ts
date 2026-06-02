import type { NextRequest } from 'next/server';
import { auth0 } from './lib/auth0';

/**
 * Auth0 middleware handles /auth/* routes and refreshes the session cookie
 * on every other request. Without this middleware no login flow is possible.
 */
export async function middleware(request: NextRequest) {
  return await auth0.middleware(request);
}

export const config = {
  // Run on everything except Next.js internals and static assets.
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
