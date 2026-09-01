import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, HashRouter } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { SplashScreen } from '@capacitor/splash-screen';
import AppRouter from './app';
import './index.css';

// Native Android/iOS: Capacitor's local WebView server has no server-side SPA fallback,
// so reloading a deep path (e.g. after a chunk-load-error auto-reload) would 404 with
// BrowserRouter. HashRouter keeps all client-side navigation in the URL fragment, which
// always resolves back to the bundled index.html. Web keeps BrowserRouter (clean URLs)
// unchanged since it's served by a real server (Vercel) with SPA rewrites configured.
const Router = Capacitor.isNativePlatform() ? HashRouter : BrowserRouter;

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Router>
      <AppRouter />
    </Router>
  </React.StrictMode>
);

// Native only: hide the launch splash (kept onscreen via SplashScreen.launchAutoHide:
// false in capacitor.config.ts) now that React has mounted, instead of the OS hiding it
// before the WebView has actually painted the app. Deferred two animation frames past
// mount so the splash's own fade-out doesn't visually overlap a not-yet-painted WebView
// (that overlap is what caused the ghosted/double-exposed logo at launch).
if (Capacitor.isNativePlatform()) {
  requestAnimationFrame(() => requestAnimationFrame(() => SplashScreen.hide()));
}

