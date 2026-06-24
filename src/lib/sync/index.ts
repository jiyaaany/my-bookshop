/**
 * Cloud sync contract (skeleton).
 *
 * The SyncEngine reconciles the local snapshot with Supabase: push local
 * changes, pull remote changes, resolve conflicts (last-write-wins on
 * `updatedAt` to start). Account-based so a new device restores everything.
 *
 * Not wired into the UI yet — this is the documented seam. Implementation lands
 * with auth (Apple / Google) and the Postgres schema in supabase/schema.sql.
 */

import type { BookshopSnapshot } from '@/lib/db/repository';

export interface SyncResult {
  pushed: number;
  pulled: number;
  at: string;
}

export interface SyncEngine {
  /** True once the user is authenticated and a remote project is configured. */
  isEnabled(): boolean;
  /** Push local changes and pull remote changes, returning a merged snapshot. */
  sync(local: BookshopSnapshot): Promise<{ snapshot: BookshopSnapshot; result: SyncResult }>;
}

/** No-op engine used until Supabase auth + schema are in place. */
export class NoopSyncEngine implements SyncEngine {
  isEnabled() {
    return false;
  }
  async sync(local: BookshopSnapshot) {
    return { snapshot: local, result: { pushed: 0, pulled: 0, at: new Date().toISOString() } };
  }
}

export const syncEngine: SyncEngine = new NoopSyncEngine();
