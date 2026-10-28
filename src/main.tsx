import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { App } from './App';
import '@fontsource-variable/geist';
import '@fontsource-variable/geist-mono';
import '@fontsource-variable/literata';
import 'katex/dist/katex.min.css';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Suppress benign browser extension runtime errors and Workbox offline/CSP font cache misses
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    const msg = event?.reason?.message || String(event?.reason || '');
    if (
      msg.includes('message channel closed') ||
      msg.includes('listener indicated an asynchronous response') ||
      msg.includes('runtime.lastError') ||
      msg.includes('chrome-extension://') ||
      msg.includes('moz-extension://') ||
      msg.includes('no-response') ||
      msg.includes('net::ERR_FAILED')
    ) {
      event.preventDefault();
      event.stopImmediatePropagation?.();
    }
  });

  // Auto-recover from dynamic chunk load errors during new deployments with strict loop prevention
  window.addEventListener('vite:preloadError', (event: any) => {
    event.preventDefault();
    const payloadUrl = String(event?.payload?.message || event?.payload || '');
    if (
      payloadUrl.includes('chrome-extension://') ||
      payloadUrl.includes('moz-extension://') ||
      payloadUrl.includes('safari-extension://')
    ) {
      return;
    }
    const lastReload = Number(sessionStorage.getItem('md_writer_preload_reload') || '0');
    const now = Date.now();
    // Allow at most one reload every 60 seconds to strictly prevent infinite reload loops
    if (now - lastReload > 60000) {
      sessionStorage.setItem('md_writer_preload_reload', String(now));
      window.location.reload();
    } else {
      console.warn('Vite preload error detected but reload throttled to prevent loop:', event);
    }
  });
}

// Register PWA service worker during idle/load to protect FCP and TTI
if (typeof window !== 'undefined') {
  if (typeof (window as any).requestIdleCallback === 'function') {
    (window as any).requestIdleCallback(() => {
      registerSW();
    });
  } else {
    window.addEventListener('load', () => {
      registerSW();
    });
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
);
