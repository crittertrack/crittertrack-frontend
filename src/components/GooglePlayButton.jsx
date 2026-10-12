import React from 'react';
import { ANDROID_PLAY_STORE_URL } from '../utils/appDownloads';
import { openExternalLink } from '../utils/externalLink';

const GooglePlayButton = ({ className = '' }) => (
    <button
        type="button"
        onClick={() => openExternalLink(ANDROID_PLAY_STORE_URL)}
        aria-label="Get it on Google Play"
        className={`mx-auto block aspect-[239/71] w-full max-w-[320px] overflow-hidden rounded-xl transition hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700 ${className}`}
    >
        <img
            src="/GetItOnGooglePlay_Badge_Web_color_English.png"
            alt="Get it on Google Play"
            className="block h-full w-full"
        />
    </button>
);

export default GooglePlayButton;
