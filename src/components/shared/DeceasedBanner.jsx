import React from 'react';

// User-provided dove silhouette (public domain memorial motif) for the photo corner badge.
const DOVE_IMG = '/images/peace-dove.png';

// Straddles the photo's bottom-right corner -- the badge's own center sits exactly on the
// corner point, so it partially overlaps the image and partially hangs off it. `positionClassName`
// lets a caller nudge the anchor point (e.g. raise it above the true corner) when other UI overlaps.
const DeceasedCornerBadge = ({ iconClassName = 'w-8 h-8', positionClassName = 'bottom-0 right-0' }) => (
    <div className={`absolute translate-x-1/2 translate-y-1/2 ${positionClassName}`}>
        <img src={DOVE_IMG} alt="" className={`${iconClassName} object-contain drop-shadow-md`} />
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
