import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Flame, Gem, Star, User } from 'lucide-react';

const API_BASE_URL = '/api';

const getDonationBadge = (user) => {
    if (!user) return null;
    
    const now = new Date();
    
    // Check for monthly subscription (diamond badge)
    if (user.monthlyDonationActive) {
        return {
            type: 'diamond',
            icon: <Gem size={16} />,
            title: 'Monthly Supporter',
            className: 'bg-gradient-to-r from-blue-400 to-pink-500 text-white'
        };
    }
    
    // Check for one-time donation within last 31 days (gift badge)
    if (user.lastDonationDate) {
        const lastDonation = new Date(user.lastDonationDate);
        const daysSince = Math.floor((now - lastDonation) / (1000 * 60 * 60 * 24));
        
        if (daysSince <= 31) {
            return {
                type: 'gift',
                icon: <Flame size={16} />,
                title: 'Recent Supporter',
                className: 'bg-gradient-to-r from-green-400 to-blue-500 text-white'
            };
        }
    }
    
    return null;
};

// Donation Badge Component
const DonationBadge = ({ user, badge: badgeProp, size = 'sm' }) => {
    const badge = badgeProp ?? getDonationBadge(user);
    if (!badge) return null;
    
    const sizeClasses = {
        xs: 'text-sm',
        sm: 'text-base',
        md: 'text-lg',
        lg: 'text-xl'
    };
    
    return (
        <span className={`inline-flex items-center ${sizeClasses[size]}`} title={badge.title}>
            {badge.icon}
        </span>
    );
};


const UserProfileCard = ({ userProfile, API_BASE_URL }) => {
    const [avgRating, setAvgRating] = useState(0);
    const [ratingCount, setRatingCount] = useState(0);

    useEffect(() => {
        if (!API_BASE_URL || !userProfile?.id_public) return;
        axios.get(`${API_BASE_URL}/public/ratings/${userProfile.id_public}`)
            .then(r => {
                setAvgRating(r.data?.average ?? 0);
                setRatingCount(r.data?.count ?? 0);
            })
            .catch(() => {});
    }, [API_BASE_URL, userProfile?.id_public]);

    if (!userProfile) return null;

    const formattedCreationDate = userProfile.creationDate
        ? new Intl.DateTimeFormat('en-GB', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(userProfile.creationDate))
        : 'N/A';

    const isPersonalNameVisible = userProfile.showPersonalName ?? true;
    const isBreederNameVisible = userProfile.showBreederName ?? false;
    const filledStars = Math.round(avgRating);

    return (
        <div className="bg-white p-3 rounded-xl shadow-lg flex flex-col items-center text-center justify-between h-full" style={{minWidth: '200px', maxWidth: '220px'}}>
            {/* Names at top */}
            <div className="mb-2 w-full">
                <div className="flex items-center justify-center gap-2 mb-2">
                    <DonationBadge user={userProfile} size="sm" />
                </div>
                {isPersonalNameVisible && (
                    <h3 className="text-sm font-bold text-gray-900 line-clamp-3">
                        {userProfile.personalName}
                    </h3>
                )}
                
                {(isBreederNameVisible && userProfile.breederName) && (
                    <div className="text-xs text-gray-700 font-semibold line-clamp-1">
                        {userProfile.breederName}
                    </div>
                )}

                {(!isPersonalNameVisible && !isBreederNameVisible) && (
                    <h3 className="text-xs font-bold text-gray-500">
                        (Name Hidden)
                    </h3>
                )}
            </div>

            {/* Image centered */}
            <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 overflow-hidden shadow-inner mb-2">
                {(userProfile.profileImage || userProfile.profileImageUrl || userProfile.imageUrl || userProfile.avatarUrl || userProfile.avatar || userProfile.profile_image) ? (
                    <img src={userProfile.profileImage || userProfile.profileImageUrl || userProfile.imageUrl || userProfile.avatarUrl || userProfile.avatar || userProfile.profile_image} alt={userProfile.personalName} className="w-full h-full object-cover" />
                ) : (
                    <User size={32} />
                )}
            </div>

            {/* Other info below image */}
            <div className="w-full space-y-1">
                <div className="flex justify-center gap-0.5 mb-0.5">
                    {[1,2,3,4,5].map(n => (
                        <Star key={n} size={13} className={n <= filledStars ? 'text-amber-400 fill-current' : 'text-gray-200 fill-current'} />
                    ))}
                </div>
                {ratingCount > 0 && (
                    <div className="text-xs text-gray-400">{avgRating.toFixed(1)} ({ratingCount})</div>
                )}
                <div className="text-sm font-extrabold text-accent">
                    {userProfile.id_public}
                </div>
                
                <div className="text-xs text-gray-600">
                    {formattedCreationDate}
                </div>
            </div>
        </div>
    );
};

// Textarea with a small Bold/Italic formatting toolbar.
// Uses onMouseDown + e.preventDefault() so the textarea never loses focus/selection.

export default UserProfileCard;
