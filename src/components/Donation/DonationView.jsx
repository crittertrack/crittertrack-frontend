import React from 'react';
import axios from 'axios';
import { ArrowLeft, Heart, DollarSign, RefreshCw, ShoppingBag } from 'lucide-react';

const DonationView = ({ onBack, authToken, userProfile, API_BASE_URL }) => {
    const [subSuccess, setSubSuccess] = React.useState(false);
    const [subError, setSubError] = React.useState('');
    const [subLoading, setSubLoading] = React.useState(false);

    // On return from PayPal, activate the badge
    React.useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (!params.get('subscribed') || !authToken) return;
        const subscriptionID = params.get('subscription_id') || params.get('ba_token');
        if (!subscriptionID) { setSubSuccess(true); return; } // fallback – webhook will handle it
        axios.post(
            `${API_BASE_URL}/payments/paypal/subscription/activate`,
            { subscriptionID },
            { headers: { Authorization: `Bearer ${authToken}` } }
        ).then(() => setSubSuccess(true))
         .catch(() => {
             // Webhook will still fire, so just show success
             setSubSuccess(true);
         });
    }, [authToken, API_BASE_URL]);

    const handleSubscribe = async () => {
        setSubLoading(true);
        setSubError('');
        try {
            const headers = authToken ? { Authorization: `Bearer ${authToken}` } : {};
            const res = await axios.post(
                `${API_BASE_URL}/payments/paypal/subscription/create`,
                {},
                { headers }
            );
            window.location.href = res.data.approvalUrl;
        } catch (err) {
            setSubError('Could not start subscription. Please try again.');
            setSubLoading(false);
        }
    };

    return (
        <div className="w-full max-w-2xl bg-white p-8 rounded-xl shadow-lg">
            {/* Back Button */}
            <button 
                onClick={onBack}
                className="flex items-center text-gray-600 hover:text-gray-800 font-medium mb-6 transition"
            >
                <ArrowLeft size={20} className="mr-2" />
                Back
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="bg-gradient-to-r from-pink-500 to-red-500 p-3 rounded-full">
                    <Heart size={32} className="text-white fill-current" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Support CritterTrack</h1>
                    <p className="text-gray-500 text-sm">Help keep this platform running</p>
                </div>
            </div>

            {/* Description */}
            <div className="bg-gradient-to-r from-primary/10 to-accent/10 border-2 border-primary/20 rounded-lg p-6 mb-6">
                <p className="text-gray-700 leading-relaxed mb-4">
                    CritterTrack is provided <strong>completely free of charge</strong> to all users. There are no premium tiers, 
                    paywalls, or required subscriptions. However, hosting, maintaining, and improving this platform requires resources.
                </p>
                <p className="text-gray-700 leading-relaxed">
                    If you find CritterTrack valuable for managing your breeding program, please consider supporting its 
                    continued development with a voluntary donation. Every contribution, no matter the size, helps keep this 
                    platform running and improving.
                </p>
            </div>

            {/* Personal Note */}
            <div className="bg-accent/10 border-2 border-accent/30 rounded-lg p-5 mb-6">
                <p className="text-sm text-gray-700 font-semibold mb-2 flex items-center gap-2">
                    <Heart size={18} className="text-accent fill-current" />
                    A note from the developer
                </p>
                <p className="text-sm text-gray-600 leading-relaxed">
                    CritterTrack is developed and maintained by a single developer who is passionate about helping breeders 
                    manage their programs effectively. Your support directly contributes to server costs, new features, 
                    and ongoing maintenance. Thank you for being part of this community!
                </p>
            </div>

            {/* Donation Options */}
            <h2 className="text-xl font-bold text-gray-800 mb-4">How to Support</h2>
            <div className="space-y-4">
                {/* Ko-fi Donation */}
                <div className="border-2 border-blue-500/30 rounded-lg p-6 bg-gradient-to-r from-blue-500/5 to-cyan-500/5 hover:shadow-md transition">
                    <div className="flex items-start gap-4">
                        <div className="bg-blue-500/20 p-3 rounded-lg">
                            <Heart size={24} className="text-blue-600" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-lg text-gray-800 mb-2">Support CritterTrack on Ko-fi</h3>
                            <p className="text-sm text-gray-600 mb-4">
                                Support CritterTrack with a one-time or recurring donation on Ko-fi. Every contribution, no matter the size,
                                helps fund server costs and development, ensuring the platform remains free and continuously improves.
                            </p>
                            <a
                                href="https://ko-fi.com/crittertrack"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold py-3 px-6 rounded-lg transition shadow-md flex items-center justify-center gap-2"
                            >
                                <Heart size={18} className="fill-current" />
                                Donate on Ko-fi
                            </a>
                        </div>
                    </div>
                </div>

                {/* Ko-fi Shop */}
                <div className="border-2 border-blue-500/30 rounded-lg p-6 bg-gradient-to-r from-blue-500/5 to-cyan-500/5 hover:shadow-md transition">
                    <div className="flex items-start gap-4">
                        <div className="bg-blue-500/20 p-3 rounded-lg">
                            <ShoppingBag size={24} className="text-blue-600" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-lg text-gray-800 mb-2">Ko-fi Shop - Mouse Magic Genetics Guide</h3>
                            <p className="text-sm text-gray-600 mb-4">
                                Support CritterTrack by purchasing the Mouse Magic genetics guide. Currently Available in English and French!
                                Every purchase helps fund server costs and development while you get quality products in return.
                            </p>
                            <a
                                href="https://ko-fi.com/mousemagic/shop"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold py-3 px-6 rounded-lg transition shadow-md flex items-center justify-center gap-2"
                            >
                                <ShoppingBag size={18} />
                                Buy Mouse Magic Genetics Guide
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Note */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-xs text-gray-600 text-center leading-relaxed">
                    All donations are processed securely through Ko-fi. You are not required to have a Ko-fi account to donate.
                </p>
            </div>

            {/* Thank You */}
            <div className="mt-6 text-center">
                <p className="text-sm text-gray-500 italic">
                    Thank you for considering supporting CritterTrack. Your generosity is deeply appreciated! 💚
                </p>
            </div>
        </div>
    );
};

export default DonationView;
