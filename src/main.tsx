import React from 'react';
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// One-time cleanup: PWA / service worker support has been removed from this
// project. Any browser that previously installed our service worker still has
// it active and would keep serving stale cached assets. This block unregisters
// every service worker and clears every Cache Storage entry so returning
// visitors are immediately moved back to the live (network-served) version.
//
// Safe to leave in place: once a browser has no service workers and no caches,
// these calls are no-ops. Can be removed in a future cleanup pass once the
// majority of returning users have run it at least once.
(() => {
  if (typeof window === 'undefined') return;

  const RELOAD_FLAG = 'as:stale-cache-reloaded';

  const reloadOnce = () => {
    try {
      if (sessionStorage.getItem(RELOAD_FLAG)) return;
      sessionStorage.setItem(RELOAD_FLAG, '1');
    } catch {
      return;
    }
    location.reload();
  };

  const cleanup = async () => {
    let removedSomething = false;

    try {
      if ('serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        const results = await Promise.all(regs.map((r) => r.unregister().catch(() => false)));
        if (results.some(Boolean)) removedSomething = true;
      }
    } catch {
      /* no-op */
    }

    try {
      if ('caches' in window) {
        const keys = await caches.keys();
        const results = await Promise.all(keys.map((k) => caches.delete(k).catch(() => false)));
        if (results.some(Boolean)) removedSomething = true;
      }
    } catch {
      /* no-op */
    }

    // Something stale was actually present: the page that booted may be the old
    // cached bundle, so reload once (guarded) to pick up the live version.
    if (removedSomething) reloadOnce();
  };

  void cleanup();
})();


createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
