import React, { useState } from 'react';
import { X } from 'lucide-react';
import { openExternalLink } from '../utils/externalLink';

const GENTLE_SUPPORTER_URL = 'https://ko-fi.com/summary/e1ecabb4-94c1-4ade-98f7-6e56339b1653';

// Manually update this as new qualifying (Gentle Supporter tier or higher) continuing monthly
// Ko-fi subscribers sign up — there's no backend tracking for this, it's a hand-maintained count.
const CURRENT_SUPPORTERS = 0;
const GOAL_SUPPORTERS = 5;

const DISMISS_KEY = 'ct_dismissed_ios_fundraiser_banner_v1';

// iOS-release fundraiser banner — sits between the header and NotificationBar. Asks for a
// minimum number of continuing monthly supporters before committing to an Apple Developer
// Program subscription (a real ongoing cost, unlike the one-time Google Play fee).
const SupportTierBanner = () => {
    const [dismissed, setDismissed] = useState(() => {
        try { return localStorage.getItem(DISMISS_KEY) === 'true'; } catch { return false; }
    });

    if (dismissed) return null;

    const dismiss = (e) => {
        e.stopPropagation();
        try { localStorage.setItem(DISMISS_KEY, 'true'); } catch { /* ignore */ }
        setDismissed(true);
    };

    const percentage = Math.min(100, Math.round((CURRENT_SUPPORTERS / GOAL_SUPPORTERS) * 100));

    return (
        <div
            onClick={() => openExternalLink(GENTLE_SUPPORTER_URL)}
            className="max-w-7xl mx-auto mb-3 cursor-pointer bg-gradient-to-r from-blue-500 to-blue-700 text-white text-sm rounded-lg shadow-md px-4 py-3 flex items-center justify-between gap-3 hover:from-blue-600 hover:to-blue-800 transition"
        >
            <div className="flex-1">
                <span>
                    📱 Users have asked for an <strong>iOS version</strong> of CritterTrack! Apple charges a hefty ongoing yearly fee just to publish and maintain an app on the App Store, so before starting that work, we'd like at least <strong>{GOAL_SUPPORTERS} continuing monthly Gentle Supporter</strong> (or higher tier) subscriptions to make it sustainable. This covers the developer program fee plus the extra ongoing work of maintaining CritterTrack across three platforms: web, Android, and iOS. Click here to become one on Ko-fi! 💜
                </span>
                <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 bg-white/20 rounded-full h-1.5 max-w-xs">
                        <div className="bg-white h-1.5 rounded-full transition-all duration-300" style={{ width: `${percentage}%` }} />
                    </div>
                    <span className="text-xs whitespace-nowrap">{CURRENT_SUPPORTERS} of {GOAL_SUPPORTERS} so far</span>
                </div>
            </div>
            <button
                onClick={dismiss}
                className="flex-shrink-0 p-1 rounded hover:bg-white/20 transition"
                title="Dismiss"
            >
                <X size={16} />
            </button>
        </div>
    );
};

export default SupportTierBanner;
