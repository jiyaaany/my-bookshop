/**
 * Supabase Storage for record images.
 *
 * Bucket `record-images` is private (see supabase/schema.sql), so images are
 * stored under `{user_id}/{record_id}/{uuid}.{ext}` and read via short-lived
 * signed URLs. In local-only mode (no client / no session) uploads no-op and the
 * editor keeps the raw `file://` device URI instead.
 *
 * What we persist in `ReadingRecord.imageUrls`:
 *   - cloud:       the storage path  (`{uid}/{recordId}/{uuid}.jpg`)
 *   - local-only:  the device uri    (`file://…`)
 * `isRemotePath` tells the two apart at display time.
 */

import { getSupabase } from '@/lib/supabase/client';

const BUCKET = 'record-images';

/** Random uuid for the object filename (kept local to avoid a store import cycle). */
function uuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/** True when `value` is a storage path (not a device/web/data uri). */
export function isRemotePath(value: string): boolean {
  return !/^(file:|https?:|content:|data:|ph:|assets-library:)/.test(value);
}

const EXT_BY_MIME: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/heic': 'heic',
  'image/gif': 'gif',
};

function resolveExt(uri: string, mimeType?: string): string {
  if (mimeType && EXT_BY_MIME[mimeType]) return EXT_BY_MIME[mimeType];
  const m = uri.split('?')[0].match(/\.([a-zA-Z0-9]+)$/);
  return m ? m[1].toLowerCase() : 'jpg';
}

/**
 * Upload a picked image to the record's storage folder.
 * Returns the storage path on success, or `null` in local-only / no-session mode
 * (caller should then keep the local uri).
 */
export async function uploadRecordImage(
  recordId: string,
  localUri: string,
  mimeType?: string,
): Promise<string | null> {
  const client = getSupabase();
  if (!client) return null;
  const { data } = await client.auth.getSession();
  const userId = data.session?.user.id;
  if (!userId) return null;

  const ext = resolveExt(localUri, mimeType);
  const path = `${userId}/${recordId}/${uuid()}.${ext}`;
  const arrayBuffer = await fetch(localUri).then((res) => res.arrayBuffer());

  const { error } = await client.storage.from(BUCKET).upload(path, arrayBuffer, {
    contentType: mimeType ?? `image/${ext === 'jpg' ? 'jpeg' : ext}`,
    upsert: false,
  });
  if (error) throw error;
  return path;
}

// ── signed URLs (cached) ─────────────────────────────────────────
const SIGN_TTL = 3600; // seconds
// Refresh a touch early so a cached URL never hands back something about to die.
const SIGN_SKEW_MS = 60_000;
const signedCache = new Map<string, { url: string; expiresAt: number }>();

/** Create (or reuse a cached) signed URL for a storage path. */
export async function createSignedUrl(path: string): Promise<string | null> {
  const client = getSupabase();
  if (!client) return null;
  const cached = signedCache.get(path);
  if (cached && cached.expiresAt - SIGN_SKEW_MS > Date.now()) return cached.url;

  const { data, error } = await client.storage.from(BUCKET).createSignedUrl(path, SIGN_TTL);
  if (error) throw error;
  const url = data?.signedUrl ?? null;
  if (url) signedCache.set(path, { url, expiresAt: Date.now() + SIGN_TTL * 1000 });
  return url;
}

/** Best-effort removal of storage objects (ignores local uris). No-op offline. */
export async function deleteRecordImages(paths: string[]): Promise<void> {
  const client = getSupabase();
  if (!client) return;
  const remote = paths.filter(isRemotePath);
  if (remote.length === 0) return;
  remote.forEach((p) => signedCache.delete(p));
  const { error } = await client.storage.from(BUCKET).remove(remote);
  if (error) throw error;
}
