import React from 'react';

// Inline SVG dove silhouette (public domain memorial motif) for the photo corner badge.
// Inline SVG (instead of an external /images/peace-dove.png ) so the badge can never show
// a broken-image icon if the image file fails to load.
const DoveIcon = ({ size = 16, className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M20 7s-2-4-8-4-8 4-8 4 0 1 2 2 2 2 2 2 4 0 4 0 4-4 4-4" />
        <path d="M12 13c-2 0-3-2-3-4s1-4 3-4 3 2 3 4-1 4-3 4" />
        <circle cx="12" cy="11" r="1" fill="currentColor" />
    </svg>
);

// Hand-drawn rainbow (not lucide's single-tone icon) so each arc gets its own hue -- a
// "Rainbow Bridge" memorial motif, deliberately not a ribbon, to avoid resembling SimpleBreed's.
const RainbowIcon = ({ size = 16, className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M22 17a10 10 0 0 0-20 0" stroke="#f87171" />
        <path d="M6 17a6 6 0 0 1 12 0" stroke="#facc15" />
        <path d="M10 17a2 2 0 0 1 4 0" stroke="#60a5fa" />
    </svg>
);

// Straddles the photo's bottom-right corner -- the badge's own center sits exactly on the
// corner point, so it partially overlaps the image and partially hangs off it. `positionClassName`
// lets a caller nudge the anchor point (e.g. raise it above the true corner) when other UI overlaps.
const DeceasedCornerBadge = ({ iconClassName = 'w-8 h-8', positionClassName = 'bottom-0 right-0' }) => (
    <div className={`absolute translate-x-1/2 translate-y-1/2 ${positionClassName}`}>
        <DoveIcon size={16} className={`${iconClassName} drop-shadow-md`} />
    </div>
);

// Replaces a card's plain "Deceased" status-bar text, matching that bar's original padding/
// font/text size exactly (size="sm" = AnimalList card, size="md" = PublicProfileView card).
const DeceasedBanner = ({ size = 'md' }) => {
    const isSm = size === 'sm';
    return (
        <div className={`w-full mt-auto bg-gray-800/90 dark:bg-black/80 text-center border-t border-gray-700 dark:border-black/60 ${isSm ? 'py-0.5 sm:py-1' : 'py-1'}`}>
            <div className={`font-medium capitalize text-white ${isSm ? 'text-[10px] sm:text-xs' : 'text-xs'}`}>Deceased</div>
        </div>
    );
};

export default DeceasedBanner;
export { RainbowIcon, DeceasedCornerBadge };
