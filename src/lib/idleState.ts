/**
 * Shared storage keys/helpers for the inactivity (idle) auto-logout feature.
 * Kept separate from the hook so AuthContext can clear state without importing
 * React code (avoids a circular import).
 */
export const IDLE_ACTIVITY_KEY = 'assetsafe.idle.lastActivity';
export const IDLE_TIMEOUT_FLAG_KEY = 'assetsafe.idle.timedOut';

export function clearIdleState(): void {
  try {
    localStorage.removeItem(IDLE_ACTIVITY_KEY);
    localStorage.removeItem(IDLE_TIMEOUT_FLAG_KEY);
  } catch {
    /* ignore */
  }
}
