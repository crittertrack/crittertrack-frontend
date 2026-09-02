import { Capacitor } from '@capacitor/core';

// On web, the site is served from the same origin as the API (vercel.json rewrites
// /api/* to the Railway backend), so a relative path works. A native Capacitor app has
// no such same-origin proxy, so it must call the backend directly instead.
const NATIVE_API_ORIGIN = 'https://crittertrack-pedigree-production.up.railway.app';

export const API_BASE_URL = Capacitor.isNativePlatform() ? `${NATIVE_API_ORIGIN}/api` : '/api';
