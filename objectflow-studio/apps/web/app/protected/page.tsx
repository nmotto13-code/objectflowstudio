import { redirect } from 'next/navigation';
import { auth0 } from '../../lib/auth0';

export const dynamic = 'force-dynamic';

export default async function ProtectedPage() {
  const session = await auth0.getSession();

  if (!session) {
    redirect('/auth/login?returnTo=/protected');
  }

  const { user } = session;

  return (
    <main className="mx-auto max-w-2xl space-y-6 p-8">
      <h1 className="text-3xl font-semibold tracking-tight">Protected page</h1>
      <p className="text-muted-foreground">
        If you can see this, your Auth0 session is valid and the middleware is working.
      </p>

      <div className="rounded-md border bg-card p-4 text-sm">
        <p className="mb-2 font-medium">Session claims</p>
        <pre className="overflow-x-auto rounded bg-muted p-3 text-xs">
          {JSON.stringify(
            {
              sub: user.sub,
              email: user.email,
              email_verified: user.email_verified,
              name: user.name,
              nickname: user.nickname,
              picture: user.picture,
              updated_at: user.updated_at,
              org_id: (user as Record<string, unknown>).org_id,
              org_name: (user as Record<string, unknown>).org_name,
            },
            null,
            2,
          )}
        </pre>
      </div>

      <a
        href="/auth/logout"
        className="inline-block rounded-md border bg-primary px-4 py-2 text-sm text-primary-foreground"
      >
        Log out
      </a>
    </main>
  );
}
