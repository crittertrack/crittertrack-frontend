import React, { useState } from 'react';
import { X } from 'lucide-react';
import { openExternalLink } from '../utils/externalLink';
import {
    MINI_SUPPORTER_URL, GENTLE_SUPPORTER_URL, DEDICATED_SUPPORTER_URL, MAJOR_SUPPORTER_URL,
    useIosFundraiserTotal, getIosFundraiserPercentage, getFundraiserStatusText,
} from '../utils/iosFundraiser';

const DISMISS_KEY = 'ct_dismissed_ios_fundraiser_banner_v1';

// iOS-release fundraiser banner — sits between the header and NotificationBar. Asks for a
// minimum amount of continuing monthly support, in any mix of tiers, before committing to an
// Apple Developer Program subscription (a real ongoing cost, unlike the one-time Google Play fee).
const SupportTierBanner = () => {
    const [dismissed, setDismissed] = useState(() => {
        try { return localStorage.getItem(DISMISS_KEY) === 'true'; } catch { return false; }
    });

    const total = useIosFundraiserTotal();

    if (dismissed) return null;

    const dismiss = () => {
        try { localStorage.setItem(DISMISS_KEY, 'true'); } catch { /* ignore */ }
        setDismissed(true);
    };

    const percentage = getIosFundraiserPercentage(total);

    return (
        <div className="max-w-7xl mx-auto mb-3 bg-gradient-to-r from-blue-500 to-blue-700 text-white text-sm rounded-lg shadow-md px-4 py-3 flex items-center justify-between gap-3">
            <div className="flex-1">
                <span>
                    📱 You guys asked me for an <strong>iOS version</strong> of CritterTrack! Here's the thing: I've managed to work my way through web and Android myself, and thanks to how forgiving those platforms are, I can keep providing that for free (yes, that stays)! iOS is a whole different story: I have zero iOS experience, so to actually build it, I need to hire some extra hands on deck. On top of that, Apple charges a hefty yearly developer fee just to publish <strong>anything</strong>. And adding <strong>another</strong> platform means a lot more data traffic, so I'd also need to upgrade our server tier to keep everything running smoothly. This is where you guys can make the magic happen, and we can make this work together, pick a tier and help get iOS launched:{' '}
                    <button type="button" onClick={() => openExternalLink(MINI_SUPPORTER_URL)} className="underline font-medium hover:text-blue-100">Mini</button>,{' '}
                    <button type="button" onClick={() => openExternalLink(GENTLE_SUPPORTER_URL)} className="underline font-medium hover:text-blue-100">Gentle</button>,{' '}
                    <button type="button" onClick={() => openExternalLink(DEDICATED_SUPPORTER_URL)} className="underline font-medium hover:text-blue-100">Dedicated</button>, or{' '}
                    <button type="button" onClick={() => openExternalLink(MAJOR_SUPPORTER_URL)} className="underline font-medium hover:text-blue-100">Major</button>! 💜 This applies to both the full website and our upcoming Lite app.
                </span>
                <div className="mt-2 bg-white/20 rounded-full h-1.5 max-w-md">
                    <div className="bg-white h-1.5 rounded-full transition-all duration-300" style={{ width: `${percentage}%` }} />
                </div>
                <p className="mt-1 text-xs text-blue-100">
                    {getFundraiserStatusText(total)}
                </p>
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
