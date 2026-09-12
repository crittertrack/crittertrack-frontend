// Shared config for the iOS fundraiser, used by SupportTierBanner (post-login) and the
// login screen's Support CritterTrack panel, so both stay in sync.
export const MINI_SUPPORTER_URL = 'https://ko-fi.com/summary/7c3baac5-0a8b-4d13-bb94-148065db7506';
export const GENTLE_SUPPORTER_URL = 'https://ko-fi.com/summary/e1ecabb4-94c1-4ade-98f7-6e56339b1653';
export const DEDICATED_SUPPORTER_URL = 'https://ko-fi.com/summary/d534a92a-edb3-440d-8a0d-47f52ad71615';
export const MAJOR_SUPPORTER_URL = 'https://ko-fi.com/summary/e5616750-e310-4bc1-a69a-1024857d3560';

export const MINI_PRICE = 2.5;
export const GENTLE_PRICE = 5;
export const DEDICATED_PRICE = 10;
export const MAJOR_PRICE = 15;

// Manually update these as new qualifying continuing monthly Ko-fi subscribers sign up in each
// tier — there's no backend tracking for this, it's a hand-maintained count.
export const CURRENT_MINI_SUPPORTERS = 0;
export const CURRENT_GENTLE_SUPPORTERS = 0;
export const CURRENT_DEDICATED_SUPPORTERS = 0;
export const CURRENT_MAJOR_SUPPORTERS = 0;

// Monthly EUR goal needed in ongoing (recurring) Ko-fi support: covers both the iOS development
// work itself (with a buffer for the unexpected) and Apple's ongoing yearly developer fee to
// keep publishing and updating it afterward. Shown to users next to the progress bar.
export const GOAL_MONTHLY_TOTAL = 30;

export const getIosFundraiserCurrentTotal = () => (
    CURRENT_MINI_SUPPORTERS * MINI_PRICE +
    CURRENT_GENTLE_SUPPORTERS * GENTLE_PRICE +
    CURRENT_DEDICATED_SUPPORTERS * DEDICATED_PRICE +
    CURRENT_MAJOR_SUPPORTERS * MAJOR_PRICE
);

export const getIosFundraiserPercentage = () => Math.min(100, Math.round((getIosFundraiserCurrentTotal() / GOAL_MONTHLY_TOTAL) * 100));

// Ko-fi shows each visitor amounts in their own local currency/format. We don't have a live
// exchange rate source, so rather than guess a converted number (and risk showing something
// wrong), we keep the real EUR figure but format it using the visitor's own locale conventions.
export const formatFundraiserAmount = (amount) => {
    try {
        return new Intl.NumberFormat(navigator.language, { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(amount);
    } catch {
        return `€${amount}`;
    }
};
