import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';

// target="_blank"/window.open do nothing useful inside a Capacitor Android WebView
// (there's no browser chrome to open a new tab in) — route external links through the
// system browser there instead. Web behavior (a real new tab) is unchanged.
export const openExternalLink = (url, target = '_blank') => {
    if (!url) return;
    if (Capacitor.isNativePlatform()) {
        Browser.open({ url });
        return;
    }
    window.open(url, target, 'noopener,noreferrer');
};
