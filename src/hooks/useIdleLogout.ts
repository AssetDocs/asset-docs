// @ts-nocheck
/**
 * Inactivity (idle) auto-logout.
 *
 * - Signed-in users only.
 * - Warning opens at IDLE_WARNING_MS before the hard timeout.
 * - Activity timestamp lives in localStorage (with an in-memory fallback when
 *   storage is unavailable) so activity in ANY tab keeps every tab alive, and
 *   the timeout broadcast signs every tab out together.
 * - A single interval evaluates elapsed time (no per-event timer churn), and
 *   mount + visibilitychange evaluate the STORED timestamp before reseeding, so
 *   a backgrounded/frozen tab or a page reload can never silently extend the
 *   session.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { logActivity } from '@/hooks/useActivityLog';
import { IDLE_ACTIVITY_KEY, IDLE_TIMEOUT_FLAG_KEY, clearIdleState } from '@/lib/idleState';

export const IDLE_TIMEOUT_MS = 30 * 60 * 1000; // sign out after 30 min idle
export const IDLE_WARNING_MS = 3 * 60 * 1000;  // warn 3 min before that

const ACTIVITY_KEY = IDLE_ACTIVITY_KEY;
const TIMEOUT_KEY = IDLE_TIMEOUT_FLAG_KEY;
const TICK_MS = 1000;

// Real user gestures only. `scroll` is deliberately excluded: programmatic
// window.scrollTo (route-change scroll-to-top) fires it and would keep
// resetting the idle window without any user involvement.
const ACTIVITY_EVENTS: (keyof WindowEventMap)[] = [
  'mousedown',
  'keydown',
  'touchstart',
  'wheel',
  'pointerdown',
];

/** Fallback used when localStorage is blocked (private mode, hardened browsers). */
let memoryLastActivity: number | null = null;

function readLastActivity(): number | null {
  try {
    const raw = localStorage.getItem(ACTIVITY_KEY);
    const parsed = raw ? parseInt(raw, 10) : NaN;
    if (Number.isFinite(parsed)) return parsed;
  } catch {
    /* fall through to memory */
  }
  return memoryLastActivity;
}

function writeLastActivity(at: number): void {
  memoryLastActivity = at;
  try {
    localStorage.setItem(ACTIVITY_KEY, String(at));
  } catch {
    /* storage unavailable — in-memory value is authoritative for this tab */
  }
}

export interface IdleLogoutState {
  /** True while the "Need more time?" warning should be visible. */
  warningOpen: boolean;
  /** Milliseconds left before forced sign-out (>= 0). */
  msRemaining: number;
  /** Dismiss the warning and reset the idle window. */
  staySignedIn: () => void;
  /** Sign out immediately (user-initiated from the warning). */
  signOutNow: () => void;
}

export function useIdleLogout(): IdleLogoutState {
  const { user, signOut } = useAuth();
  const [warningOpen, setWarningOpen] = useState(false);
  const [msRemaining, setMsRemaining] = useState(IDLE_WARNING_MS);
  const warningOpenRef = useRef(false);
  const loggingOutRef = useRef(false);

  // Keep signOut in a ref so effects below never re-run when AuthContext
  // re-renders and hands us a new function identity.
  const signOutRef = useRef(signOut);
  signOutRef.current = signOut;

  const enabled = !!user;

  const openWarning = useCallback((remaining: number) => {
    if (!warningOpenRef.current) {
      warningOpenRef.current = true;
      setWarningOpen(true);
    }
    setMsRemaining(Math.max(0, remaining));
  }, []);

  const closeWarning = useCallback(() => {
    if (warningOpenRef.current) {
      warningOpenRef.current = false;
      setWarningOpen(false);
    }
    setMsRemaining(IDLE_WARNING_MS);
  }, []);

  const resetActivity = useCallback(() => {
    writeLastActivity(Date.now());
    closeWarning();
  }, [closeWarning]);

  const performLogout = useCallback(async (reason: 'timeout' | 'manual') => {
    if (loggingOutRef.current) return;
    loggingOutRef.current = true;

    if (reason === 'timeout') {
      try {
        localStorage.setItem(TIMEOUT_KEY, String(Date.now()));
      } catch {
        /* ignore */
      }
      // Best effort only — never block sign-out on audit logging.
      try {
        await logActivity({
          action_type: 'session_timeout',
          action_category: 'security',
          details: { idle_ms: IDLE_TIMEOUT_MS, source: 'idle_logout' },
        });
      } catch {
        /* ignore */
      }
    }

    clearIdleState();
    memoryLastActivity = null;
    await signOutRef.current(
      reason === 'timeout' ? { redirectTo: '/auth?reason=timeout' } : undefined
    );
  }, []);

  /**
   * Evaluate the stored timestamp. Returns true when the session was already
   * past the hard timeout (logout started), so callers know not to reseed.
   */
  const evaluate = useCallback((): boolean => {
    const last = readLastActivity();
    if (last === null) return false; // never seeded yet
    const remaining = IDLE_TIMEOUT_MS - (Date.now() - last);

    if (remaining <= 0) {
      void performLogout('timeout');
      return true;
    }
    if (remaining <= IDLE_WARNING_MS) {
      openWarning(remaining);
    } else {
      closeWarning();
    }
    return false;
  }, [performLogout, openWarning, closeWarning]);

  // Track activity → single shared timestamp.
  useEffect(() => {
    if (!enabled) return;

    // On mount (incl. page reload): judge the EXISTING timestamp first. Only
    // seed a fresh window when no prior activity is recorded.
    if (readLastActivity() === null) {
      writeLastActivity(Date.now());
    } else if (evaluate()) {
      return;
    }

    const onActivity = (e: Event) => {
      // Ignore synthetic events; only real user gestures count.
      if (e.isTrusted === false) return;
      // While the warning is open, local input must NOT silently extend the
      // session — only "Stay signed in" does.
      if (warningOpenRef.current) return;
      writeLastActivity(Date.now());
    };

    const onVisibility = () => {
      if (document.visibilityState !== 'visible') return;
      // Background tabs get their timers throttled or frozen, so the stored
      // timestamp — not the interval — is the source of truth here. Evaluate
      // BEFORE reseeding, otherwise hours of idling would be erased.
      if (evaluate()) return;
      if (!warningOpenRef.current) writeLastActivity(Date.now());
    };

    ACTIVITY_EVENTS.forEach((evt) =>
      window.addEventListener(evt, onActivity, { passive: true })
    );
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('focus', onVisibility);

    return () => {
      ACTIVITY_EVENTS.forEach((evt) => window.removeEventListener(evt, onActivity));
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('focus', onVisibility);
    };
  }, [enabled, evaluate]);

  // Cross-tab sync: activity elsewhere revives this tab; timeout elsewhere
  // signs this tab out too.
  useEffect(() => {
    if (!enabled) return;

    const onStorage = (e: StorageEvent) => {
      if (e.key === TIMEOUT_KEY && e.newValue) {
        void performLogout('timeout');
        return;
      }
      if (e.key === ACTIVITY_KEY && e.newValue) {
        const at = parseInt(e.newValue, 10);
        if (Number.isFinite(at)) {
          memoryLastActivity = at;
          if (Date.now() - at < IDLE_TIMEOUT_MS - IDLE_WARNING_MS) {
            closeWarning();
          }
        }
      }
    };

    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [enabled, performLogout, closeWarning]);

  // Single evaluation interval (drives the live countdown).
  useEffect(() => {
    if (!enabled) return;
    const interval = window.setInterval(() => { evaluate(); }, TICK_MS);
    return () => window.clearInterval(interval);
  }, [enabled, evaluate]);

  // Signed out (or never signed in): make sure nothing lingers.
  useEffect(() => {
    if (!enabled) {
      warningOpenRef.current = false;
      setWarningOpen(false);
      setMsRemaining(IDLE_WARNING_MS);
    }
  }, [enabled]);

  return {
    warningOpen: enabled && warningOpen,
    msRemaining,
    staySignedIn: resetActivity,
    signOutNow: () => {
      void performLogout('manual');
    },
  };
}
