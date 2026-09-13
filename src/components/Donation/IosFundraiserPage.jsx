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
                    You guys asked me for an <strong>iOS version</strong> of CritterTrack!
                </p>
                <p>
                    Everything you're using today on the web, the web-app, and on the Android apps coming soon, is
                    built and maintained solely by me, in my own time. I don't take a salary from this project: what
                    comes in through Ko-fi goes straight to hosting and running costs, and the difference is directly
                    paid out of my own pocket. I pledged to provide CritterTrack as a completely free service, and
                    with my current financial status, I can and will continue doing so.
                </p>
                <p>
                    Adding iOS is a whole different story. I have zero iOS experience, so to actually build it, I'd
                    need to hire some extra hands on deck, and that's not something I can cover with my own labor the
                    way I do for web and Android. On top of that, Apple charges a hefty yearly developer fee just to
                    publish <strong>anything</strong>.
                </p>
                <p>
                    AND adding <strong>another</strong> platform means a lot more data traffic. You and I both know
                    that sometimes we already need to have a little bit of patience when many users are busy-bees at
                    the same time, and that's even with our current Production server tier. To keep everything
                    running smoothly once the iOS app drops, we will have to scale our server infrastructure up yet
                    another level to absorb all those new iPhone users.
                </p>
                <p>
                    So, while I would love to pay all of the above with just love and dedication, I need your help to
                    make it happen. New monthly pledges apply to bringing both the full website and our upcoming Lite
                    app to iOS.
                </p>
                <p>
                    I have set our goal to €50/month with the ability to overfund, solely because asking for pledges
                    is not something in my nature. I also want to provide a honest run-down of our current annual
                    costs and the financial situation we are looking at:
                </p>
            </div>

            <div className="bg-gray-50 dark:bg-dark-surface rounded-lg p-5 mb-4">
                <h2 className="text-sm font-bold text-gray-800 dark:text-dark-text mb-3">
                    What it costs to run CritterTrack right now:
                </h2>
                <ul className="list-disc pl-5 space-y-1.5 text-sm text-gray-700 dark:text-dark-text-secondary">
                    <li>Yearly Domain Fee: €18</li>
                    <li>Monthly Web Hosting: €20 / month</li>
                    <li>Current Monthly Server: €20 / month</li>
                </ul>
                <p className="text-xs text-gray-500 dark:text-dark-text-muted mt-3 italic">
                    Note: Releasing the Android Play Store apps also collected a one-time fee of €25 for the
                    developer account (which I have already covered).
                </p>
            </div>

            <div className="bg-gray-50 dark:bg-dark-surface rounded-lg p-5 mb-6">
                <h2 className="text-sm font-bold text-gray-800 dark:text-dark-text mb-3">
                    What is needed in order to create, test, and release iOS smoothly and safely:
                </h2>
                <ul className="list-disc pl-5 space-y-1.5 text-sm text-gray-700 dark:text-dark-text-secondary">
                    <li>MacInCloud Emulator for development: €25 / month</li>
                    <li>Apple's yearly developer fee: €99 / year</li>
                    <li>Hiring an iOS Developer for fact-checking and bug-fixing: €25 to €45 / hour</li>
                    <li>Future Server Upgrade (for iOS traffic sync): €40 / month</li>
                </ul>
            </div>

            <div className="text-sm text-gray-700 dark:text-dark-text-secondary leading-relaxed space-y-4 mb-6">
                <p>
                    If we hit or pass our €50/month goal, it directly offsets these baseline operational costs, builds
                    a rainy-day fund to pay our iOS freelancer, and secures the future server bandwidth we need to
                    keep CritterTrack fast and stable for everyone.
                </p>
                <p className="italic text-gray-500 dark:text-dark-text-muted">
                    Thank you so much for tracking your critters with me and helping expand our community.
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
                        className="px-4 py-2 rounded-lg bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white font-semibold transition shadow-md"
                    >
                        {label}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default IosFundraiserPage;
