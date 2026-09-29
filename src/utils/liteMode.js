import { getCachedUiMode } from './uiModeCache';

// The point of this file is to be the ONLY place the "is lite on?" question gets answered.
// It used to be answered twice and the two disagreed: app.jsx hardcoded `false` while
// AnimalList and NotificationBar still read userProfile.uiMode, so an account set to 'lite'
// got the lite animal list inside the full header. Both now call resolveLiteMode() below.
//
// Lite is reachable from the header toggle on BOTH web and the native Android app. In Lite the
// nav drops Contacts/Marketplace/Calendar/Community and the animal modal/form swap to their
// Lite* equivalents (see the isLite branches in app.jsx) — the components are the same ones the
// web app renders, so they work inside the app's WebView unchanged.
//
// Set LITE_MODE_ENABLED to false to hard-disable Lite everywhere without touching any component.
export const LITE_MODE_ENABLED = true;

/**
 * Whether Lite mode should be active for the current render.
 * @param {object|null} userProfile - the signed-in profile; may still be loading.
 * @returns {boolean}
 */
export const resolveLiteMode = (userProfile) => {
    if (!LITE_MODE_ENABLED) return false;
    // Fall back to the cached uiMode while userProfile is still loading (e.g. right after App
    // remounts from the standalone /user/:userId route) so Lite doesn't flash Full first.
    return (userProfile ? userProfile.uiMode === 'lite' : getCachedUiMode() === 'lite');
};
