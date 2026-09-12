import React from 'react';
import { Smartphone } from 'lucide-react';
import { openExternalLink } from '../../utils/externalLink';
import {
    MINI_SUPPORTER_URL, GENTLE_SUPPORTER_URL, DEDICATED_SUPPORTER_URL, MAJOR_SUPPORTER_URL,
    useIosFundraiserTotal, getIosFundraiserPercentage, getFundraiserStatusText,
} from '../../utils/iosFundraiser';

// Full "why iOS needs support" story. The banner and login panel only show a short summary
// with the progress bar and tier buttons, and link here via "Read more" for the full context.
const IosFundraiserPage = () => {
    const total = useIosFundraiserTotal();
    const percentage = getIosFundraiserPercentage(total);

    const tiers = [
        { label: 'Mini', url: MINI_SUPPORTER_URL },
        { label: 'Gentle', url: GENTLE_SUPPORTER_URL },
        { label: 'Dedicated', url: DEDICATED_SUPPORTER_URL },
        { label: 'Major', url: MAJOR_SUPPORTER_URL },
    ];

    return (
        <div className="w-full max-w-3xl mx-auto bg-white dark:bg-dark-card-bg p-8 rounded-xl shadow-lg">
            <div className="flex items-center gap-3 mb-2">
                <div className="bg-gradient-to-r from-blue-500 to-blue-700 p-3 rounded-full">
                    <Smartphone size={32} className="text-white" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-dark-text">Bringing CritterTrack to iOS</h1>
                    <p className="text-gray-500 dark:text-dark-text-muted text-sm">Why this one needs extra support</p>
                </div>
            </div>

            <div className="text-sm text-gray-700 dark:text-dark-text-secondary leading-relaxed space-y-4 mt-4 mb-6">
                <p>
                    You guys asked me for an <strong>iOS version</strong> of CritterTrack! I already cover the costs of
                    the web and Android versions myself, and thanks to how forgiving those platforms are, I can keep
                    providing that for free (yes, that stays).
                </p>
                <p>
                    iOS is a whole different story. I have zero iOS experience, so to actually build it, I need to
                    hire some extra hands on deck. On top of that, Apple charges a hefty yearly developer fee just to
                    publish <strong>anything</strong>. And adding <strong>another</strong> platform means a lot more
                    data traffic, so I'd also need to upgrade our server tier to keep everything running smoothly.
                </p>
                <p>
                    This applies to both the full website and our upcoming Lite app. This is where you guys can make
                    the magic happen, and we can make this work together!
                </p>
            </div>

            <div className="bg-gray-100 dark:bg-dark-surface rounded-full h-1.5 mb-2 max-w-md">
                <div
                    className="bg-gradient-to-r from-pink-500 to-red-500 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                />
            </div>
            <p className="text-xs text-gray-500 dark:text-dark-text-muted mb-6">
                {getFundraiserStatusText(total)}
            </p>

            <p className="text-sm text-gray-600 dark:text-dark-text-secondary mb-2">
                Pick a tier and help get iOS launched:
            </p>
            <div className="flex flex-wrap gap-2">
                {tiers.map(({ label, url }) => (
                    <button
                        key={label}
                        type="button"
                        onClick={() => openExternalLink(url)}
                        className="px-4 py-2 rounded-lg bg-blue-50 dark:bg-dark-surface text-blue-700 dark:text-dark-text font-semibold hover:bg-blue-100 dark:hover:bg-dark-surface-hover transition"
                    >
                        {label}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default IosFundraiserPage;
