// @ts-nocheck
/**
 * Inactivity (idle) auto-logout.
 *
 * - Signed-in users only.
 * - Warning opens at IDLE_WARNING_MS before the hard timeout.
 * - Activity timestamp lives in localStorage so activity in ANY tab keeps
 *   every tab alive, and the timeout broadcast signs every tab out together.
 * - A single interval evaluates elapsed time (no per-event timer churn).
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { logActivity } from '@/hooks/useActivityLog';

export const IDLE_TIMEOUT_MS = 30 * 60 * 1000; // sign out after 30 min idle
export const IDLE_WARNING_MS = 3 * 60 * 1000;  // warn 3 min before that

const ACTIVITY_KEY = 'assetsafe.idle.lastActivity';
const TIMEOUT_KEY = 'assetsafe.idle.timedOut';
const TICK_MS = 1000;

const ACTIVITY_EVENTS: (keyof WindowEventMap)[] = [
  'mousedown',
  'keydown',
  'touchstart',
  'scroll',
];

function readLastActivity(): number {
  try {
    const raw = localStorage.getItem(ACTIVITY_KEY);
    const parsed = raw ? parseInt(raw, 10) : NaN;
    return Number.isFinite(parsed) ? parsed : Date.now();
  } catch {
    return Date.now();
  }
}

function writeLastActivity(at: number): void {
  try {
    localStorage.setItem(ACTIVITY_KEY, String(at));
  } catch {
    /* storage unavailable — fall back to in-memory only */
  }
}

export function clearIdleState(): void {
  try {
    localStorage.removeItem(ACTIVITY_KEY);
    localStorage.removeItem(TIMEOUT_KEY);
  } catch {
    /* ignore */
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

  const enabled = !!user;

  const resetActivity = useCallback(() => {
    writeLastActivity(Date.now());
    if (warningOpenRef.current) {
      warningOpenRef.current = false;
      setWarningOpen(false);
    }
    setMsRemaining(IDLE_WARNING_MS);
  }, []);

  const performLogout = useCallback(
    async (reason: 'timeout' | 'manual') => {
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
      await signOut(reason === 'timeout' ? { redirectTo: '/auth?reason=timeout' } : undefined);
    },
    [signOut]
  );

  // Track activity → single shared timestamp.
  useEffect(() => {
    if (!enabled) return;

    // Seed on mount so a fresh sign-in starts a full window.
    writeLastActivity(Date.now());

    const onActivity = () => {
      // While the warning is open, local input must NOT silently extend the
      // session — only "Stay signed in" does.
      if (warningOpenRef.current) return;
      writeLastActivity(Date.now());
    };

    const onVisibility = () => {
      if (document.visibilityState === 'visible' && !warningOpenRef.current) {
        writeLastActivity(Date.now());
      }
    };

    ACTIVITY_EVENTS.forEach((evt) =>
      window.addEventListener(evt, onActivity, { passive: true })
    );
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      ACTIVITY_EVENTS.forEach((evt) => window.removeEventListener(evt, onActivity));
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [enabled]);

  // Cross-tab sync: activity elsewhere revives this tab; timeout elsewhere
  // signs this tab out too.
  useEffect(() => {
    if (!enabled) return;

    const onStorage = (e: StorageEvent) => {
      if (e.key === TIMEOUT_KEY && e.newValue) {
        performLogout('timeout');
        return;
      }
      if (e.key === ACTIVITY_KEY && e.newValue) {
        const at = parseInt(e.newValue, 10);
        if (Number.isFinite(at) && Date.now() - at < IDLE_TIMEOUT_MS - IDLE_WARNING_MS) {
          if (warningOpenRef.current) {
            warningOpenRef.current = false;
            setWarningOpen(false);
          }
          setMsRemaining(IDLE_WARNING_MS);
        }
      }
    };

    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [enabled, performLogout]);

  // Single evaluation interval.
  useEffect(() => {
    if (!enabled) return;

    const interval = window.setInterval(() => {
      const idleFor = Date.now() - readLastActivity();
      const remaining = IDLE_TIMEOUT_MS - idleFor;

      if (remaining <= 0) {
        performLogout('timeout');
        return;
      }

      if (remaining <= IDLE_WARNING_MS) {
        if (!warningOpenRef.current) {
          warningOpenRef.current = true;
          setWarningOpen(true);
        }
        setMsRemaining(remaining);
      } else if (warningOpenRef.current) {
        warningOpenRef.current = false;
        setWarningOpen(false);
        setMsRemaining(IDLE_WARNING_MS);
      }
    }, TICK_MS);

    return () => window.clearInterval(interval);
  }, [enabled, performLogout]);

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
