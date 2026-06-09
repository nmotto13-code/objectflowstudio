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
  // Run on everything except Next.js internals, static assets, and the
  // synthesized error/404/500 fallbacks. Including those in the matcher
  // pulls the auth0/jose code chain into the prerender chunk for /404 and
  // /500, which then collides with Next 15's Pages-Router `<Html>` fallback
  // and breaks the build with "<Html> should not be imported outside of
  // pages/_document".
  matcher: [
    '/((?!_next/static|_next/image|_next/data|_error|404|500|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
