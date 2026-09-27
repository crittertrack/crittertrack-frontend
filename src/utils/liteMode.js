import { Capacitor } from '@capacitor/core';
import { getCachedUiMode } from './uiModeCache';

// Lite mode is currently rendered IDENTICAL to the regular (Full) frontend, and is reachable
// again via the header toggle.
//
// The point of this file is to be the ONLY place the "is lite on?" question gets answered.
// It used to be answered twice and the two disagreed: app.jsx hardcoded `false` while
// AnimalList and NotificationBar still read userProfile.uiMode, so an account set to 'lite'
// got the lite animal list inside the full header. Both now call resolveLiteMode() below.
//
// All the lite-specific UI (Lite* components, lite bottom nav, /lite-settings) is still
// present but currently produces the same output as Full. That is deliberate — it gives a
// known-good baseline to strip bits back out of as the Lite rebuild proceeds.
//
// Set false to hard-disable Lite everywhere without touching any component.
export const LITE_MODE_ENABLED = true;

/**
 * Whether Lite mode should be active for the current render.
 * @param {object|null} userProfile - the signed-in profile; may still be loading.
 * @returns {boolean}
 */
export const resolveLiteMode = (userProfile) => {
    if (!LITE_MODE_ENABLED) return false;
    // Lite is desktop/PWA web only — never on the native Android/iOS full app, which ships
    // its own separate crittertrack-lite app. See docs/lite-web-toggle-brainstorm.md.
    if (Capacitor.isNativePlatform()) return false;
    // Fall back to the cached uiMode while userProfile is still loading (e.g. right after App
    // remounts from the standalone /user/:userId route) so Lite doesn't flash Full first.
    return (userProfile ? userProfile.uiMode === 'lite' : getCachedUiMode() === 'lite');
};
