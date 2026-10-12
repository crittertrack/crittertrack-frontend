import React from 'react';
import { Download } from 'lucide-react';
import { ANDROID_PLAY_STORE_URL } from '../utils/appDownloads';
import { openExternalLink } from '../utils/externalLink';

const GooglePlayButton = ({ className = '' }) => (
    <button
        type="button"
        onClick={() => openExternalLink(ANDROID_PLAY_STORE_URL)}
        className={`w-full flex items-center justify-center gap-2 rounded-lg bg-[#16823b] px-4 py-3 font-semibold text-white transition hover:bg-[#116c31] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700 ${className}`}
    >
        <Download size={18} />
        Get the Android app on Google Play
    </button>
);

export default GooglePlayButton;
