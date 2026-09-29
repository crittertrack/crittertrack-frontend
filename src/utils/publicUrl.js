import { Capacitor } from '@capacitor/core';

// Inside the native Android app the WebView is served by Capacitor's bundled local
// server, so `window.location.origin` reads "https://localhost" — sharing that would hand
// people a dead link (and a QR code that scans to nothing). On web the real origin is
// correct, so only the native branch needs the override. Mirrors the split in apiConfig.js.
const NATIVE_SITE_ORIGIN = 'https://crittertrack.net';

// Canonical site origin for building shareable/absolute links. Use this anywhere a URL
// leaves the app (clipboard share, QR codes, emailed links); plain in-app routing should
// keep using relative paths so it works against whatever origin it's served from.
export const SITE_ORIGIN = Capacitor.isNativePlatform() ? NATIVE_SITE_ORIGIN : window.location.origin;

export const absoluteUrl = (path) =>
    `${SITE_ORIGIN}${path.startsWith('/') ? path : `/${path}`}`;

// Public share links for an animal/profile. The ids are public-facing tokens, not numeric
// ids — sharing a numeric id would 404 for the recipient.
export const animalShareUrl = (idPublic) => absoluteUrl(`/animal/${idPublic}`);
export const userShareUrl = (idPublic) => absoluteUrl(`/user/${idPublic}`);