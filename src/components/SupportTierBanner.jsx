import React, { useState } from 'react';
import { X } from 'lucide-react';

const MINI_SUPPORTER_URL = 'https://ko-fi.com/summary/7c3baac5-0a8b-4d13-bb94-148065db7506';

// Approx EUR conversion rates — static, not a live FX feed (good enough for a rough "from ~X/month" hint).
const EUR_RATES = {
    EUR: 1, USD: 1.08, GBP: 0.85, CAD: 1.47, AUD: 1.63, NZD: 1.78, JPY: 160, CNY: 7.7,
    INR: 90, BRL: 5.9, MXN: 18.5, CHF: 0.94, SEK: 11.3, NOK: 11.6, DKK: 7.46, PLN: 4.3,
    CZK: 25.2, HUF: 390, ZAR: 20, SGD: 1.45, HKD: 8.4, KRW: 1480,
};

// Region -> currency for the handful of locales users are likely to have; everything else falls back to EUR.
const REGION_CURRENCY = {
    US: 'USD', GB: 'GBP', CA: 'CAD', AU: 'AUD', NZ: 'NZD', JP: 'JPY', CN: 'CNY', IN: 'INR',
    BR: 'BRL', MX: 'MXN', CH: 'CHF', SE: 'SEK', NO: 'NOK', DK: 'DKK', PL: 'PLN', CZ: 'CZK',
    HU: 'HUF', ZA: 'ZAR', SG: 'SGD', HK: 'HKD', KR: 'KRW',
    DE: 'EUR', FR: 'EUR', IT: 'EUR', ES: 'EUR', NL: 'EUR', BE: 'EUR', AT: 'EUR', IE: 'EUR',
    PT: 'EUR', FI: 'EUR', GR: 'EUR', SK: 'EUR', SI: 'EUR', EE: 'EUR', LV: 'EUR', LT: 'EUR',
    LU: 'EUR', MT: 'EUR', CY: 'EUR', HR: 'EUR',
};

const EUR_PRICE = 2.5;
const DISMISS_KEY = 'ct_dismissed_support_banner_v1';

const formatLocalPrice = () => {
    const locale = navigator.language || 'en-US';
    let region = null;
    try { region = new Intl.Locale(locale).maximize().region; } catch { /* unsupported browser */ }
    const currency = REGION_CURRENCY[region] || 'EUR';
    const amount = EUR_PRICE * (EUR_RATES[currency] || 1);
    try {
        return new Intl.NumberFormat(locale, { style: 'currency', currency, maximumFractionDigits: 2 }).format(amount);
    } catch {
        return `€${EUR_PRICE.toFixed(2)}`;
    }
};

// Small, temporary promo banner pointing at the Ko-fi "Mini Supporter" tier — sits between the
// header and NotificationBar. Safe to delete this file (and its one import in app.jsx) once retired.
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

    return (
        <div
            onClick={() => window.open(MINI_SUPPORTER_URL, '_blank', 'noopener,noreferrer')}
            className="max-w-xl mx-auto mb-3 cursor-pointer bg-gradient-to-r from-blue-500 to-blue-700 text-white text-sm rounded-lg shadow-md px-4 py-2 flex items-center justify-between gap-3 hover:from-blue-600 hover:to-blue-800 transition"
        >
            <span>
                🌰 Did you know you can support CritterTrack? The lowest tier, <strong>Mini Supporter</strong>, is just{' '}
                <strong>{formatLocalPrice()}/month</strong> — click here to support.
            </span>
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
