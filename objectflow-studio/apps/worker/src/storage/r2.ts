// Cloudflare R2 client + helpers. R2 is S3-API-compatible so we use the
// official @aws-sdk/client-s3, just pointed at R2's endpoint with our R2
// credentials. The big practical difference vs S3 is R2's zero egress —
// no per-byte charge when downloading files.

import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { env } from '@objectflow/config';

let _client: S3Client | undefined;

function client(): S3Client {
  if (!_client) {
    if (!env.R2_ENDPOINT || !env.R2_ACCESS_KEY_ID || !env.R2_SECRET_ACCESS_KEY) {
      throw new Error('R2 env vars missing (R2_ENDPOINT, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY)');
    }
    _client = new S3Client({
      // R2 doesn't use AWS regions, but the SDK requires a value. "auto" works.
      region: 'auto',
      endpoint: env.R2_ENDPOINT,
      credentials: {
        accessKeyId: env.R2_ACCESS_KEY_ID,
        secretAccessKey: env.R2_SECRET_ACCESS_KEY,
      },
    });
  }
  return _client;
}

function bucket(): string {
  if (!env.R2_BUCKET) throw new Error('R2_BUCKET not set');
  return env.R2_BUCKET;
}

/**
 * Generate a presigned PUT URL the browser can upload to directly. Our server
 * never sees the file bytes — they stream from the user's browser straight to
 * R2. Returns the URL plus the storage key so the caller can record it in DB.
 */
export async function presignUpload(opts: {
  key: string;
  contentType?: string;
  expiresInSeconds?: number;
}): Promise<{ url: string; key: string; bucket: string; expiresAt: string }> {
  const expiresIn = opts.expiresInSeconds ?? 3600;
  const cmd = new PutObjectCommand({
    Bucket: bucket(),
    Key: opts.key,
    ContentType: opts.contentType,
  });
  const url = await getSignedUrl(client(), cmd, { expiresIn });
  return {
    url,
    key: opts.key,
    bucket: bucket(),
    expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString(),
  };
}

/** Generate a presigned GET URL for downloading a stored object. */
export async function presignDownload(opts: {
  key: string;
  expiresInSeconds?: number;
}): Promise<{ url: string; expiresAt: string }> {
  const expiresIn = opts.expiresInSeconds ?? 3600;
  const cmd = new GetObjectCommand({ Bucket: bucket(), Key: opts.key });
  const url = await getSignedUrl(client(), cmd, { expiresIn });
  return { url, expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString() };
}

/** Server-side download (worker → R2 → memory). Used by the parsing pipeline. */
export async function downloadObject(key: string): Promise<Uint8Array> {
  const res = await client().send(new GetObjectCommand({ Bucket: bucket(), Key: key }));
  if (!res.Body) throw new Error(`R2 object ${key} returned empty body`);
  // @ts-expect-error transformToByteArray is a runtime method added by the SDK
  return res.Body.transformToByteArray();
}

/** Delete an object — used for cleanup, test files, etc. */
export async function deleteObject(key: string): Promise<void> {
  await client().send(new DeleteObjectCommand({ Bucket: bucket(), Key: key }));
}

/** Check if an object exists without downloading it. */
export async function objectExists(key: string): Promise<boolean> {
  try {
    await client().send(new HeadObjectCommand({ Bucket: bucket(), Key: key }));
    return true;
  } catch (err) {
    if (err instanceof Error && 'name' in err && err.name === 'NotFound') return false;
    throw err;
  }
}
