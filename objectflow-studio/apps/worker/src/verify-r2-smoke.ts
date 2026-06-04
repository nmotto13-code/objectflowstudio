// Smoke-test R2: presign PUT → upload via fetch → presign GET → download via
// fetch → verify content roundtrip → delete. Exercises every helper.
import './load-env.js';

const { presignUpload, presignDownload, downloadObject, deleteObject, objectExists } = await import(
  './storage/r2.js'
);

const key = `smoke/L0-${Date.now()}.txt`;
const body = `ObjectFlow R2 smoke ${new Date().toISOString()}`;

// 1. Presign upload
const up = await presignUpload({ key, contentType: 'text/plain' });
console.log('[1] presignUpload:', { key: up.key, bucket: up.bucket, expiresAt: up.expiresAt });

// 2. Upload via the signed URL
const putRes = await fetch(up.url, {
  method: 'PUT',
  headers: { 'content-type': 'text/plain' },
  body,
});
console.log('[2] PUT via signed URL:', putRes.status, putRes.statusText);
if (!putRes.ok) {
  const errText = await putRes.text();
  throw new Error(`PUT failed: ${errText}`);
}

// 3. Confirm object exists
const exists = await objectExists(key);
console.log('[3] objectExists:', exists);

// 4. Presign download + fetch it back
const down = await presignDownload({ key });
const getRes = await fetch(down.url);
const fetchedBody = await getRes.text();
console.log('[4] GET via signed URL:', getRes.status, '— body matches:', fetchedBody === body);

// 5. Server-side download
const serverBytes = await downloadObject(key);
const serverText = Buffer.from(serverBytes).toString('utf8');
console.log('[5] server-side downloadObject:', serverText === body ? 'matches' : 'MISMATCH');

// 6. Cleanup
await deleteObject(key);
console.log('[6] delete:', !(await objectExists(key)) ? 'gone' : 'still there');

console.log('OK');
