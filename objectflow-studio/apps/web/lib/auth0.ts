import { Auth0Client } from '@auth0/nextjs-auth0/server';

/**
 * Single Auth0 client used across middleware + server components + route handlers.
 * Reads config from env (AUTH0_DOMAIN, AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET,
 * AUTH0_SECRET, APP_BASE_URL, AUTH0_AUDIENCE).
 *
 * The v4 SDK auto-mounts these routes when middleware is active:
 *   GET  /auth/login       — initiate login
 *   GET  /auth/logout      — initiate logout
 *   GET  /auth/callback    — Auth0 redirects here after login
 *   GET  /auth/profile     — returns the current user's profile (JSON)
 *   GET  /auth/access-token — returns the current access token (JSON)
 */
export const auth0 = new Auth0Client();
