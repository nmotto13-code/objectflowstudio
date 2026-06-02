import { auth0 } from '../lib/auth0';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const session = await auth0.getSession();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="max-w-2xl space-y-4 text-center">
        <h1 className="text-4xl font-semibold tracking-tight">ObjectFlow Studio</h1>
        <p className="text-muted-foreground">
          Foundation layer (L0) — Next.js + Tailwind shell running. Auth + DB live.
        </p>

        <div className="rounded-md border bg-card p-4 text-left text-sm">
          <p className="font-medium">L0 smoke-test checklist</p>
          <ul className="mt-2 list-inside list-disc text-muted-foreground">
            <li>Render this page (✓ if you see this)</li>
            <li>
              <a className="underline" href="/api/health">
                /api/health
              </a>{' '}
              returns ok
            </li>
            <li>
              <a className="underline" href="/api/health/db">
                /api/health/db
              </a>{' '}
              returns Postgres time + version
            </li>
            <li>
              <a className="underline" href="/auth/login?returnTo=/protected">
                /auth/login
              </a>{' '}
              redirects to Auth0 and back
            </li>
            <li>
              <a className="underline" href="/protected">
                /protected
              </a>{' '}
              shows your session claims (after login)
            </li>
          </ul>
        </div>

        <div className="pt-2">
          {session ? (
            <div className="space-y-2 text-sm">
              <p>
                Signed in as <span className="font-medium">{session.user.email}</span>
              </p>
              <div className="flex justify-center gap-2">
                <a
                  href="/protected"
                  className="rounded-md border bg-primary px-4 py-2 text-primary-foreground"
                >
                  Protected page
                </a>
                <a
                  href="/auth/logout"
                  className="rounded-md border px-4 py-2"
                >
                  Log out
                </a>
              </div>
            </div>
          ) : (
            <a
              href="/auth/login?returnTo=/protected"
              className="inline-block rounded-md border bg-primary px-4 py-2 text-sm text-primary-foreground"
            >
              Log in with Auth0
            </a>
          )}
        </div>
      </div>
    </main>
  );
}
