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
            <h2 className="text-xl font-bold text-gray-800 mb-4">Choose Your Support Method</h2>
            <div className="space-y-4">
                {/* One-Time Donation */}
                <div className="border-2 border-primary/30 rounded-lg p-6 bg-gradient-to-r from-primary/5 to-accent/5 hover:shadow-md transition">
                    <div className="flex items-start gap-4">
                        <div className="bg-primary/20 p-3 rounded-lg">
                            <DollarSign size={24} className="text-primary-dark" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-lg text-gray-800 mb-2">One-Time Donation</h3>
                            <p className="text-sm text-gray-600 mb-4">
                                Make a one-time contribution of any amount you choose. Perfect for showing your appreciation 
                                or celebrating a milestone in your breeding program.
                            </p>
                            <form action="https://www.paypal.com/donate" method="post" target="_blank">
                                <input type="hidden" name="business" value="crittertrackowner@gmail.com" />
                                <input type="hidden" name="no_recurring" value="1" />
                                <input type="hidden" name="item_name" value="Support CritterTrack Development" />
                                <input type="hidden" name="currency_code" value="USD" />
                                <button
                                    type="submit"
                                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition shadow-md flex items-center justify-center gap-2"
                                >
                                    <Heart size={18} />
                                    Donate via PayPal
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Monthly Subscription */}
                <div className="border-2 border-accent/30 rounded-lg p-6 bg-gradient-to-r from-accent/5 to-primary/5 hover:shadow-md transition">
                    <div className="flex items-start gap-4">
                        <div className="bg-accent/20 p-3 rounded-lg">
                            <RefreshCw size={24} className="text-accent-dark" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-lg text-gray-800 mb-2">Monthly Support</h3>
                            <p className="text-sm text-gray-600 mb-4">
                                Become a recurring supporter with a monthly contribution. Your ongoing support helps ensure 
                                CritterTrack's long-term sustainability. Cancel anytime through your PayPal account.
                            </p>
                            {subSuccess ? (
                                <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 text-center">
                                    <p className="text-green-700 font-bold mb-1">💚 Thank you for subscribing!</p>
                                    <p className="text-green-600 text-sm">Your Monthly Supporter badge is now active on your profile.</p>
                                </div>
                            ) : (
                                <>
                                    {subError && (
                                        <p className="text-red-600 text-sm mb-3 bg-red-50 border border-red-200 rounded p-3">{subError}</p>
                                    )}
                                    <button
                                        onClick={handleSubscribe}
                                        disabled={subLoading}
                                        className="w-full bg-gradient-to-r from-accent to-accent/80 hover:from-accent-dark hover:to-accent text-white font-semibold py-3 px-6 rounded-lg transition shadow-md flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                                    >
                                        <Heart size={18} className="fill-current" />
                                        {subLoading ? 'Redirecting to PayPal...' : 'Support for $5/month'}
                                    </button>
                                    {!authToken && (
                                        <p className="text-xs text-gray-500 mt-2 text-center">Log in to CritterTrack first to receive your 💚 badge automatically.</p>
                                    )}
                                </>
                            )}
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
                            <h3 className="font-bold text-lg text-gray-800 mb-2">Ko-fi Shop</h3>
                            <p className="text-sm text-gray-600 mb-4">
                                Support CritterTrack by purchasing the Mouse Magic genetics guide. Currently Available in English and French! Every purchase helps 
                                fund server costs and development while you get quality products in return.
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
                    All donations are processed securely through PayPal. You are not required to have a PayPal account to donate. 
                    Monthly subscriptions can be cancelled at any time through your PayPal account settings.
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
