import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
    AlertCircle, AlertTriangle, Baby, Check, CheckCircle,
    Info, Loader2, PawPrint, Shield, XCircle, X
} from 'lucide-react';

const API_BASE_URL = '/api';


// Poll Component for Broadcasts

const BroadcastPoll = ({ poll, onVote, isVoting, styles, authToken, API_BASE_URL, notificationId, onOptionsUpdated }) => {
    const [selectedOptions, setSelectedOptions] = useState([]);
    const [suggestionText, setSuggestionText] = useState('');
    const [isSuggesting, setIsSuggesting] = useState(false);
    const [suggestError, setSuggestError] = useState('');
    const hasEnded = poll.pollEndsAt && new Date() > new Date(poll.pollEndsAt);
    const hasVoted = poll.userVote && poll.userVote.length > 0;
    
    const handleOptionToggle = (index) => {
        if (hasVoted || hasEnded) return;
        
        setSelectedOptions(prev => {
            if (poll.allowMultipleChoices) {
                return prev.includes(index) 
                    ? prev.filter(i => i !== index)
                    : [...prev, index];
            } else {
                return [index];
            }
        });
    };
    
    const handleSubmitVote = () => {
        if (selectedOptions.length === 0 || isVoting) return;
        onVote(selectedOptions);
    };
    
    const getTotalVotes = () => {
        return poll.pollOptions?.reduce((sum, option) => sum + (option.votes || 0), 0) || 0;
    };
    
    const getOptionPercentage = (votes) => {
        const total = getTotalVotes();
        return total > 0 ? Math.round((votes / total) * 100) : 0;
    };
    
    return (
        <div className="mt-3">
            <div className="grid grid-cols-2 gap-2">
                {poll.pollOptions?.map((option, index) => {
                    const isSelected = selectedOptions.includes(index);
                    const hasUserVote = hasVoted && poll.userVote.includes(index);
                    const percentage = getOptionPercentage(option.votes || 0);
                    
                    return (
                        <div key={index} className="relative">
                            <button
                                onClick={() => handleOptionToggle(index)}
                                disabled={hasVoted || hasEnded || isVoting}
                                className={`w-full text-left p-2 rounded-md border transition-all text-sm ${
                                    hasVoted || hasEnded
                                        ? 'cursor-not-allowed opacity-60'
                                        : `cursor-pointer ${styles.optionBg} border-gray-300 hover:border-gray-400`
                                } ${
                                    isSelected || hasUserVote 
                                        ? `border-green-500 ${styles.optionBg}` 
                                        : ''
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className={`w-3.5 h-3.5 rounded mr-2.5 border-2 ${
                                            isSelected || hasUserVote 
                                                ? 'bg-green-500 border-green-500' 
                                                : 'border-gray-400'
                                        } ${poll.allowMultipleChoices ? '' : 'rounded-full'}`}>
                                            {(isSelected || hasUserVote) && (
                                                <Check size={10} className="text-white m-0.5" />
                                            )}
                                        </div>
                                        <span className={styles.text}>{option.text}</span>
                                        {hasUserVote && <span className="ml-2 text-green-600 text-xs font-medium">(Your vote)</span>}
                                    </div>
                                    {(hasVoted || hasEnded) && (
                                        <div className="flex items-center gap-2">
                                            <span className={`${styles.subtitle} text-xs`}>
                                                {option.votes || 0} votes ({percentage}%)
                                            </span>
                                        </div>
                                    )}
                                </div>
                                
                                {/* Results bar */}
                                {(hasVoted || hasEnded) && percentage > 0 && (
                                    <div className="mt-1.5 bg-gray-200 rounded-full h-1.5">
                                        <div 
                                            className={`${styles.resultBar} h-1.5 rounded-full transition-all duration-300`}
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                )}
                            </button>
                        </div>
                    );
                })}
            </div>
            
            {!hasVoted && !hasEnded && (
                <button
                    onClick={handleSubmitVote}
                    disabled={selectedOptions.length === 0 || isVoting}
                    className={`mt-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                        selectedOptions.length === 0 || isVoting
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : styles.button
                    }`}
                >
                    {isVoting ? 'Voting...' : `Vote ${poll.allowMultipleChoices ? '(Multiple allowed)' : ''}`}
                </button>
            )}

            {poll.allowUserSuggestions && !hasEnded && (
                <div className="mt-3">
                    <p className={`text-xs font-medium ${styles.subtitle} mb-1`}>Suggest an option:</p>
                    <div className="flex gap-1.5">
                        <input
                            type="text"
                            maxLength={100}
                            placeholder="Your option?"
                            value={suggestionText}
                            onChange={e => { setSuggestionText(e.target.value); setSuggestError(''); }}
                            className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                        <button
                            onClick={async () => {
                                if (!suggestionText.trim() || isSuggesting) return;
                                setIsSuggesting(true);
                                setSuggestError('');
                                try {
                                    const res = await axios.post(`${API_BASE_URL}/moderation/poll/suggest-option`,
                                        { notificationId, optionText: suggestionText.trim() },
                                        { headers: { Authorization: `Bearer ${authToken}` } }
                                    );
                                    setSuggestionText('');
                                    if (onOptionsUpdated) onOptionsUpdated(res.data.pollOptions);
                                } catch (err) {
                                    setSuggestError(err.response?.data?.error || 'Failed to add option');
                                } finally {
                                    setIsSuggesting(false);
                                }
                            }}
                            disabled={!suggestionText.trim() || isSuggesting}
                            className={`px-2 py-1 rounded text-xs font-medium transition ${
                                !suggestionText.trim() || isSuggesting
                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    : styles.button
                            }`}
                        >
                            {isSuggesting ? '?' : 'Add'}
                        </button>
                    </div>
                    {suggestError && <p className="text-xs text-red-500 mt-1">{suggestError}</p>}
                </div>
            )}
            
            <div className={`mt-2 text-xs ${styles.subtitle} flex justify-between`}>
                <span>Total votes: {getTotalVotes()}</span>
                {poll.pollEndsAt && (
                    <span>
                        {hasEnded ? 'Poll ended' : `Ends: ${new Date(poll.pollEndsAt).toLocaleDateString()}`}
                    </span>
                )}
            </div>
        </div>
    );
};

// System Broadcast Banner Component (for info/announcements - shows in banner area)

const BroadcastBanner = ({ authToken, API_BASE_URL }) => {
    const [broadcasts, setBroadcasts] = useState([]);
    const [dismissedIds, setDismissedIds] = useState(() => {
        const saved = localStorage.getItem('dismissedBroadcasts');
        return saved ? JSON.parse(saved) : [];
    });
    const [pollVotes, setPollVotes] = useState({});
    const [votingInProgress, setVotingInProgress] = useState({});

    useEffect(() => {
        const fetchBroadcasts = async () => {
            if (!authToken) return;
            try {
                const response = await axios.get(`${API_BASE_URL}/notifications`, {
                    headers: { Authorization: `Bearer ${authToken}` }
                });
            const allNotifications = Array.isArray(response.data) ? response.data : response.data?.notifications || [];
                // Filter for broadcast/announcement types that are NOT warning/alert (show info, announcement, or undefined)
            const broadcastNotifications = allNotifications.filter(n => {
                    const isBroadcastType = n.type === 'broadcast' || n.type === 'announcement';
                    const isNotUrgent = n.broadcastType !== 'warning' && n.broadcastType !== 'alert';
                    const isNotDismissed = !dismissedIds.includes(n._id);
                    return isBroadcastType && isNotUrgent && isNotDismissed;
                });
                setBroadcasts(broadcastNotifications);
            } catch (error) {
                console.error('Failed to fetch broadcasts:', error);
            }
        };
        fetchBroadcasts();
        // Refresh every 60 seconds for updates
        const interval = setInterval(fetchBroadcasts, 60000);
        return () => clearInterval(interval);
    }, [authToken, API_BASE_URL, dismissedIds]);

    const handleDismiss = (id) => {
        const newDismissed = [...dismissedIds, id];
        setDismissedIds(newDismissed);
        localStorage.setItem('dismissedBroadcasts', JSON.stringify(newDismissed));
        setBroadcasts(prev => prev.filter(b => b._id !== id));
    };

    const handlePollVote = async (notificationId, selectedOptions) => {
        if (!authToken || votingInProgress[notificationId]) return;
        
        setVotingInProgress(prev => ({ ...prev, [notificationId]: true }));
        
        // Optimistic update - update UI immediately
        const previousBroadcasts = broadcasts;
        setPollVotes(prev => ({ ...prev, [notificationId]: selectedOptions }));
        
        setBroadcasts(prev => prev.map(broadcast => {
            if (broadcast._id === notificationId) {
                // Calculate optimistic vote counts
                const updatedOptions = broadcast.pollOptions.map((option, index) => {
                    if (selectedOptions.includes(index)) {
                        return {
                            ...option,
                            votes: (option.votes || 0) + 1
                        };
                    }
                    return option;
                });
                
                return {
                    ...broadcast,
                    userVote: selectedOptions,
                    pollOptions: updatedOptions
                };
            }
            return broadcast;
        }));
        
        try {
            console.log('[POLL] Voting:', { notificationId, selectedOptions });
            
            const response = await axios.post(
                `${API_BASE_URL}/moderation/poll/vote`,
                { notificationId, selectedOptions },
                { headers: { Authorization: `Bearer ${authToken}` } }
            );
            
            console.log('[POLL] Vote response:', response.data);
            
            // Update with actual server response
            setBroadcasts(prev => prev.map(broadcast => {
                if (broadcast._id === notificationId) {
                    return {
                        ...broadcast,
                        userVote: response.data.userVote || selectedOptions,
                        pollOptions: response.data.pollResults || broadcast.pollOptions
                    };
                }
                return broadcast;
            }));
        } catch (error) {
            console.error('[POLL] Failed to vote on poll:', error);
            console.error('[POLL] Error response:', error.response?.data);
            
            // Revert optimistic update on error
            setBroadcasts(previousBroadcasts);
            setPollVotes(prev => {
                const updated = { ...prev };
                delete updated[notificationId];
                return updated;
            });
        } finally {
            setVotingInProgress(prev => ({ ...prev, [notificationId]: false }));
        }
    };

    if (broadcasts.length === 0) return null;

    // Style configurations for different broadcast types
    const getStyles = (broadcastType) => {
        if (broadcastType === 'announcement') {
            // Announcement: Purple/violet - more prominent
            return {
                bg: 'bg-purple-50',
                border: 'border-purple-500',
                icon: 'text-purple-500',
                title: 'text-purple-800',
                text: 'text-purple-700',
                subtitle: 'text-purple-500',
                dismissBtn: 'text-purple-400 hover:text-purple-600',
                emoji: '',
                label: 'Announcement'
            };
        }
        if (broadcastType === 'poll') {
            // Poll: Green - interactive
            return {
                bg: 'bg-green-50',
                border: 'border-green-500',
                icon: 'text-green-500',
                title: 'text-green-800',
                text: 'text-green-700',
                subtitle: 'text-green-500',
                dismissBtn: 'text-green-400 hover:text-green-600',
                emoji: '',
                label: 'Poll',
                button: 'bg-green-500 hover:bg-green-600 text-white',
                optionBg: 'bg-green-100 hover:bg-green-200',
                resultBar: 'bg-green-400'
            };
        }
        // Info: Blue - standard informational
        return {
            bg: 'bg-blue-50',
            border: 'border-blue-400',
            icon: 'text-blue-400',
            title: 'text-blue-800',
            text: 'text-blue-700',
            subtitle: 'text-blue-500',
            dismissBtn: 'text-blue-400 hover:text-blue-600',
            emoji: '',
            label: 'Info'
        };
    };

    return (
        <div className="w-full max-w-7xl mx-auto">
            {broadcasts.map(broadcast => {
                const styles = getStyles(broadcast.broadcastType);
                return (
                    <div key={broadcast._id} className={`${styles.bg} border-l-4 ${styles.border} p-3 rounded-lg shadow-sm mb-2`}>
                            <div className="flex items-start">
                                <div className="flex-shrink-0">
                                    <Info className={`h-5 w-5 ${styles.icon}`} />
                                </div>
                                <div className="ml-2.5 flex-1">
                                    <div className="flex justify-between items-start">
                                        <h3 className={`text-base font-bold ${styles.title} leading-snug`}>
                                            {styles.emoji} {broadcast.broadcastType === 'poll' ? (broadcast.pollQuestion || broadcast.title) : (broadcast.title || `System ${styles.label}`)}
                                        </h3>
                                        <button 
                                            onClick={() => handleDismiss(broadcast._id)}
                                            className={`${styles.dismissBtn} ml-2`}
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                    {broadcast.message && (
                                        <p className={`mt-1.5 ${styles.text} text-sm`}>{broadcast.message}</p>
                                    )}
                                    
                                    {broadcast.broadcastType === 'poll' && broadcast.pollQuestion && (
                                        <BroadcastPoll
                                            poll={broadcast}
                                            onVote={(selectedOptions) => handlePollVote(broadcast._id, selectedOptions)}
                                            isVoting={votingInProgress[broadcast._id] || false}
                                            styles={styles}
                                            authToken={authToken}
                                            API_BASE_URL={API_BASE_URL}
                                            notificationId={broadcast._id}
                                            onOptionsUpdated={(opts) => setBroadcasts(prev => prev.map(b => b._id === broadcast._id ? { ...b, pollOptions: opts } : b))}
                                        />
                                    )}
                                    
                                    <p className={`mt-1.5 ${styles.subtitle} text-xs`}>
                                        {new Date(broadcast.createdAt).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                })}
        </div>
    );
};

// Urgent Broadcast Popup Component (for warning/alert types - shows as modal popup)

const UrgentBroadcastPopup = ({ authToken, API_BASE_URL }) => {
    const [urgentBroadcast, setUrgentBroadcast] = useState(null);
    const [acknowledgedIds, setAcknowledgedIds] = useState(() => {
        const saved = localStorage.getItem('acknowledgedUrgentBroadcasts');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        const fetchUrgentBroadcasts = async () => {
            if (!authToken) return;
            try {
                const response = await axios.get(`${API_BASE_URL}/notifications`, {
                    headers: { Authorization: `Bearer ${authToken}` }
                });
            const allNotifications = Array.isArray(response.data) ? response.data : response.data?.notifications || [];
                // Filter for urgent broadcast types (warning/alert) - these MUST have explicit broadcastType
            const urgentNotifications = allNotifications.filter(n => {
                    const isBroadcastType = n.type === 'broadcast' || n.type === 'announcement';
                    const isUrgent = n.broadcastType === 'warning' || n.broadcastType === 'alert';
                    const isNotAcknowledged = !acknowledgedIds.includes(n._id);
                    return isBroadcastType && isUrgent && isNotAcknowledged;
                });
                // Show the most recent one
                if (urgentNotifications.length > 0) {
                    setUrgentBroadcast(urgentNotifications[0]);
                } else {
                    setUrgentBroadcast(null);
                }
            } catch (error) {
                console.error('Failed to fetch urgent broadcasts:', error);
            }
        };
        fetchUrgentBroadcasts();
        // Check every 60 seconds for urgent broadcasts
        const interval = setInterval(fetchUrgentBroadcasts, 60000);
        return () => clearInterval(interval);
    }, [authToken, API_BASE_URL, acknowledgedIds]);

    const handleAcknowledge = () => {
        if (urgentBroadcast) {
            const newAcknowledged = [...acknowledgedIds, urgentBroadcast._id];
            setAcknowledgedIds(newAcknowledged);
            localStorage.setItem('acknowledgedUrgentBroadcasts', JSON.stringify(newAcknowledged));
            setUrgentBroadcast(null);
        }
    };

    if (!urgentBroadcast) return null;

    const isAlert = urgentBroadcast.broadcastType === 'alert';
    const bgColor = isAlert ? 'bg-red-50' : 'bg-orange-50';
    const borderColor = isAlert ? 'border-red-500' : 'border-orange-500';
    const textColor = isAlert ? 'text-red-800' : 'text-orange-800';
    const iconColor = isAlert ? 'text-red-500' : 'text-orange-500';
    const btnColor = isAlert ? 'bg-red-600 hover:bg-red-700' : 'bg-orange-600 hover:bg-orange-700';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
            <div className={`${bgColor} border-2 ${borderColor} rounded-xl shadow-2xl max-w-lg w-full p-6 animate-pulse-once`}>
                <div className="flex items-start">
                    <div className="flex-shrink-0">
                        <AlertTriangle className={`h-8 w-8 ${iconColor}`} />
                    </div>
                    <div className="ml-4 flex-1">
                        <h3 className={`text-xl font-bold ${textColor}`}>
                            {isAlert ? <><AlertCircle size={18} className="inline-block align-middle mr-1" /> URGENT ALERT</> : <><AlertTriangle size={18} className="inline-block align-middle mr-1" /> Important Notice</>}
                        </h3>
                        <h4 className={`text-lg font-semibold ${textColor} mt-2`}>
                            {urgentBroadcast.title || 'System Message'}
                        </h4>
                        <p className={`mt-3 ${textColor} text-sm leading-relaxed`}>
                            {urgentBroadcast.message}
                        </p>
                        <p className={`mt-3 text-xs ${iconColor}`}>
                            {new Date(urgentBroadcast.createdAt).toLocaleString()}
                        </p>
                        <button
                            onClick={handleAcknowledge}
                            className={`mt-4 w-full ${btnColor} text-white font-semibold py-3 px-4 rounded-lg transition-colors`}
                        >
                            I Understand
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Notification Panel Component

export { BroadcastPoll, BroadcastBanner, UrgentBroadcastPopup };
