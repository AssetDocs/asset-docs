import React from 'react';
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Service worker hygiene:
// - In the Lovable editor preview (iframe / preview hostnames), proactively
//   unregister any service worker so cached builds never mask code changes.
// - In production, the auto-generated SW (vite-plugin-pwa, registerType:
//   'autoUpdate' + skipWaiting + clientsClaim) takes over on next load.
(() => {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

  let inIframe = false;
  try { inIframe = window.self !== window.top; } catch { inIframe = true; }

  const host = window.location.hostname;
  const isPreviewHost =
    host.includes('id-preview--') ||
    host.includes('lovableproject.com') ||
    host.includes('lovable.app') === false ? false : host.includes('lovable.app') && host.startsWith('id-preview--');

  if (inIframe || isPreviewHost) {
    navigator.serviceWorker.getRegistrations().then((regs) => {
      regs.forEach((r) => r.unregister());
    }).catch(() => {});
  }
})();

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
