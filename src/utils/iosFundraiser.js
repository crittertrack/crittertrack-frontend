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

// Internal monthly euro goal used only to compute the progress bar, not shown to users.
export const GOAL_MONTHLY_TOTAL = 30;

export const getIosFundraiserPercentage = () => {
    const currentMonthlyTotal =
        CURRENT_MINI_SUPPORTERS * MINI_PRICE +
        CURRENT_GENTLE_SUPPORTERS * GENTLE_PRICE +
        CURRENT_DEDICATED_SUPPORTERS * DEDICATED_PRICE +
        CURRENT_MAJOR_SUPPORTERS * MAJOR_PRICE;
    return Math.min(100, Math.round((currentMonthlyTotal / GOAL_MONTHLY_TOTAL) * 100));
};
