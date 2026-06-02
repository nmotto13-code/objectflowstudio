import { NextResponse } from 'next/server';
import { getDb, sql } from '@objectflow/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = getDb();
    const rows = await db.execute(sql`SELECT now() AS now, version() AS version`);
    const row = rows[0] as { now: Date; version: string } | undefined;
    return NextResponse.json({
      ok: true,
      service: 'db',
      now: row?.now,
      version: row?.version,
    });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        service: 'db',
        error: err instanceof Error ? err.message : 'unknown error',
      },
      { status: 500 },
    );
  }
}
