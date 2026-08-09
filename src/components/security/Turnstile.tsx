import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react';

declare global {
  interface Window {
    turnstile?: {
      render: (container: HTMLElement, options: Record<string, unknown>) => string;
      execute: (widgetId: string) => void;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

export type TurnstileHandle = {
  getToken: () => Promise<string>;
  reset: () => void;
};

const TURNSTILE_SCRIPT_ID = 'cf-turnstile-script';
const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined;

let scriptPromise: Promise<void> | null = null;

function loadTurnstileScript(): Promise<void> {
  if (window.turnstile) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    const existing = document.getElementById(TURNSTILE_SCRIPT_ID) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error('turnstile_load_failed')), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.id = TURNSTILE_SCRIPT_ID;
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('turnstile_load_failed'));
    document.head.appendChild(script);
  });

  return scriptPromise;
}

export function getTurnstileUserMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error ?? '');
  if (message === 'turnstile_missing_site_key') {
    return 'The security check is not configured. Please try again later or contact support.';
  }
  if (message === 'turnstile_load_failed') {
    return 'The security check could not load. Please disable blockers for this page or try again.';
  }
  if (message === 'turnstile_expired' || message === 'turnstile_timeout') {
    return 'The security check expired. Please try again.';
  }
  return 'We could not verify this request. Please try again.';
}

const Turnstile = forwardRef<TurnstileHandle>((_, ref) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);
  const pendingRef = useRef<{
    resolve: (token: string) => void;
    reject: (error: Error) => void;
    timeoutId: ReturnType<typeof setTimeout>;
  } | null>(null);

  const rejectPending = useCallback((error: Error) => {
    const pending = pendingRef.current;
    if (!pending) return;
    clearTimeout(pending.timeoutId);
    pendingRef.current = null;
    pending.reject(error);
  }, []);

  const reset = useCallback(() => {
    if (widgetIdRef.current && window.turnstile) {
      window.turnstile.reset(widgetIdRef.current);
    }
  }, []);

  const ensureWidget = useCallback(async () => {
    if (!TURNSTILE_SITE_KEY) throw new Error('turnstile_missing_site_key');
    if (!containerRef.current) throw new Error('turnstile_unavailable');
    await loadTurnstileScript();
    if (!window.turnstile) throw new Error('turnstile_unavailable');

    if (!widgetIdRef.current) {
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: TURNSTILE_SITE_KEY,
        theme: 'auto',
        appearance: 'interaction-only',
        execution: 'execute',
        callback: (token: string) => {
          const pending = pendingRef.current;
          if (!pending) return;
          clearTimeout(pending.timeoutId);
          pendingRef.current = null;
          pending.resolve(token);
        },
        'expired-callback': () => rejectPending(new Error('turnstile_expired')),
        'timeout-callback': () => rejectPending(new Error('turnstile_timeout')),
        'error-callback': () => rejectPending(new Error('turnstile_failed')),
      });
    }
  }, [rejectPending]);

  const getToken = useCallback(async () => {
    await ensureWidget();
    if (!widgetIdRef.current || !window.turnstile) throw new Error('turnstile_unavailable');

    reset();

    return new Promise<string>((resolve, reject) => {
      pendingRef.current = {
        resolve,
        reject,
        timeoutId: setTimeout(() => {
          pendingRef.current = null;
          reject(new Error('turnstile_timeout'));
        }, 30_000),
      };
      window.turnstile!.execute(widgetIdRef.current!);
    });
  }, [ensureWidget, reset]);

  useImperativeHandle(ref, () => ({ getToken, reset }), [getToken, reset]);

  useEffect(() => {
    return () => {
      rejectPending(new Error('turnstile_unavailable'));
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
      }
      widgetIdRef.current = null;
    };
  }, [rejectPending]);

  return <div ref={containerRef} />;
});

Turnstile.displayName = 'Turnstile';

export default Turnstile;
