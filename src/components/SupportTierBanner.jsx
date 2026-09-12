import React, { useState } from 'react';
import { X } from 'lucide-react';
import { openExternalLink } from '../utils/externalLink';

const MINI_SUPPORTER_URL = 'https://ko-fi.com/summary/7c3baac5-0a8b-4d13-bb94-148065db7506';
const GENTLE_SUPPORTER_URL = 'https://ko-fi.com/summary/e1ecabb4-94c1-4ade-98f7-6e56339b1653';
const DEDICATED_SUPPORTER_URL = 'https://ko-fi.com/summary/d534a92a-edb3-440d-8a0d-47f52ad71615';
const MAJOR_SUPPORTER_URL = 'https://ko-fi.com/summary/e5616750-e310-4bc1-a69a-1024857d3560';

const MINI_PRICE = 2.5;
const GENTLE_PRICE = 5;
const DEDICATED_PRICE = 10;
const MAJOR_PRICE = 15;

// Manually update these as new qualifying continuing monthly Ko-fi subscribers sign up in each
// tier — there's no backend tracking for this, it's a hand-maintained count.
const CURRENT_MINI_SUPPORTERS = 0;
const CURRENT_GENTLE_SUPPORTERS = 0;
const CURRENT_DEDICATED_SUPPORTERS = 0;
const CURRENT_MAJOR_SUPPORTERS = 0;

// Internal monthly euro goal used only to compute the progress bar, not shown to users.
const GOAL_MONTHLY_TOTAL = 30;

const DISMISS_KEY = 'ct_dismissed_ios_fundraiser_banner_v1';

// iOS-release fundraiser banner — sits between the header and NotificationBar. Asks for a
// minimum amount of continuing monthly support, in any mix of tiers, before committing to an
// Apple Developer Program subscription (a real ongoing cost, unlike the one-time Google Play fee).
const SupportTierBanner = () => {
    const [dismissed, setDismissed] = useState(() => {
        try { return localStorage.getItem(DISMISS_KEY) === 'true'; } catch { return false; }
    });

    if (dismissed) return null;

    const dismiss = () => {
        try { localStorage.setItem(DISMISS_KEY, 'true'); } catch { /* ignore */ }
        setDismissed(true);
    };

    const currentMonthlyTotal =
        CURRENT_MINI_SUPPORTERS * MINI_PRICE +
        CURRENT_GENTLE_SUPPORTERS * GENTLE_PRICE +
        CURRENT_DEDICATED_SUPPORTERS * DEDICATED_PRICE +
        CURRENT_MAJOR_SUPPORTERS * MAJOR_PRICE;
    const percentage = Math.min(100, Math.round((currentMonthlyTotal / GOAL_MONTHLY_TOTAL) * 100));

    return (
        <div className="max-w-7xl mx-auto mb-3 bg-gradient-to-r from-blue-500 to-blue-700 text-white text-sm rounded-lg shadow-md px-4 py-3 flex items-center justify-between gap-3">
            <div className="flex-1">
                <span>
                    📱 Users have asked for an <strong>iOS version</strong> of CritterTrack! Apple charges a hefty ongoing yearly fee just to publish and maintain an app on the App Store. I already cover most of CritterTrack's costs out of pocket, but it needs to be sustainable long-term. So before I can even start that work, I need enough continuing monthly Ko-fi support, in any mix of tiers, to make it possible. We can do this together! Pick a tier and help get iOS launched:{' '}
                    <button type="button" onClick={() => openExternalLink(MINI_SUPPORTER_URL)} className="underline font-medium hover:text-blue-100">Mini</button>,{' '}
                    <button type="button" onClick={() => openExternalLink(GENTLE_SUPPORTER_URL)} className="underline font-medium hover:text-blue-100">Gentle</button>,{' '}
                    <button type="button" onClick={() => openExternalLink(DEDICATED_SUPPORTER_URL)} className="underline font-medium hover:text-blue-100">Dedicated</button>, or{' '}
                    <button type="button" onClick={() => openExternalLink(MAJOR_SUPPORTER_URL)} className="underline font-medium hover:text-blue-100">Major</button>. 💜
                </span>
                <div className="mt-2 bg-white/20 rounded-full h-1.5 max-w-xs">
                    <div className="bg-white h-1.5 rounded-full transition-all duration-300" style={{ width: `${percentage}%` }} />
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
