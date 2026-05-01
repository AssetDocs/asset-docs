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

  try {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations()
        .then((regs) => Promise.all(regs.map((r) => r.unregister().catch(() => false))))
        .catch(() => {});
    }
  } catch {
    /* no-op */
  }

  try {
    if ('caches' in window) {
      caches.keys()
        .then((keys) => Promise.all(keys.map((k) => caches.delete(k).catch(() => false))))
        .catch(() => {});
    }
  } catch {
    /* no-op */
  }
})();

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
