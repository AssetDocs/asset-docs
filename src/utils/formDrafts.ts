/**
 * Session-scoped draft storage for sensitive forms (Secure Vault / Digital Access /
 * Legacy Locker).
 *
 * Drafts live in sessionStorage so they:
 *  - survive component remounts inside the same tab (e.g. a token refresh when the
 *    user switches browser tabs and comes back),
 *  - are discarded automatically when the tab closes,
 *  - are never left on disk after sign-out.
 *
 * Drafts are client-side convenience only — they never replace an actual save.
 */

const PREFIX = 'assetsafe.draft.';

const key = (name: string, userId?: string | null) =>
  `${PREFIX}${userId || 'anon'}.${name}`;

export function saveDraft<T>(name: string, userId: string | null | undefined, data: T): void {
  try {
    sessionStorage.setItem(key(name, userId), JSON.stringify(data));
  } catch {
    /* storage unavailable — drafts are best-effort */
  }
}

export function loadDraft<T>(name: string, userId?: string | null): T | null {
  try {
    const raw = sessionStorage.getItem(key(name, userId));
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function clearDraft(name: string, userId?: string | null): void {
  try {
    sessionStorage.removeItem(key(name, userId));
  } catch {
    /* ignore */
  }
}

/** Remove every Asset Safe draft (used on vault lock and sign-out). */
export function clearAllDrafts(): void {
  try {
    Object.keys(sessionStorage)
      .filter((k) => k.startsWith(PREFIX))
      .forEach((k) => sessionStorage.removeItem(k));
  } catch {
    /* ignore */
  }
}

/** True when the object has at least one non-empty string/true value. */
export function draftHasContent(data: Record<string, unknown> | null | undefined): boolean {
  if (!data) return false;
  return Object.values(data).some((v) => {
    if (typeof v === 'string') return v.trim().length > 0;
    if (typeof v === 'boolean') return false; // defaults such as no_contest_clause
    return v !== null && v !== undefined;
  });
}
