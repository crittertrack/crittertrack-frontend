import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
    AlertCircle, AlertTriangle, Baby, Bell, Check, CheckCircle,
    ChevronDown, ChevronUp, Info, Loader2, PawPrint, Shield, Sparkles, XCircle, X
} from 'lucide-react';
import { formatDate } from '../../utils/dateFormatter';

const API_BASE_URL = '/api';

const WarningBanner = ({ authToken, API_BASE_URL, userProfile }) => {
    const [warnings, setWarnings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWarnings = async () => {
            if (!authToken) {
                setLoading(false);
                return;
            }
            try {
                // Get warnings from userProfile or fetch if not available
                let userWarnings = [];
                
                if (userProfile?.warnings !== undefined) {
                    userWarnings = userProfile.warnings || [];
                } else {
                    // Fetch user profile to get warnings
                    const response = await axios.get(`${API_BASE_URL}/users/profile`, {
                        headers: { Authorization: `Bearer ${authToken}` }
                    });
                    userWarnings = response.data?.warnings || [];
                }
                
                // Filter to only active (non-lifted) warnings
                const activeWarnings = userWarnings.filter(w => !w.isLifted);
                setWarnings(activeWarnings);
            } catch (error) {
                console.error('Failed to fetch user profile:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchWarnings();
    }, [authToken, API_BASE_URL, userProfile?.warnings]);

    if (loading || warnings.length === 0) {
        return null;
    }

    return (
        <div className="w-full flex justify-center">
            <div className="w-full max-w-7xl px-6">
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg shadow-md mb-3">
                    <div className="flex items-start">
                        <div className="flex-shrink-0">
                            <AlertCircle className="h-6 w-6 text-yellow-400" />
                        </div>
                        <div className="ml-3 flex-1">
                            <h3 className="text-lg font-bold text-yellow-800"><AlertTriangle size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Official Warning{warnings.length !== 1 ? 's' : ''} from Moderation Team</h3>
                            <div className="mt-3 text-yellow-700">
                                <p className="text-sm font-semibold mb-2">
                                    You have {warnings.length} active warning{warnings.length !== 1 ? 's' : ''}:
                                </p>
                                <div className="space-y-3">
                                    {warnings.map((warning, index) => (
                                        <div key={index} className="bg-yellow-100 p-2 rounded text-xs">
                                            <p className="font-semibold">Warning #{index + 1}</p>
                                            {warning.subject && <p className="mt-1"><strong>Regarding:</strong> {warning.subject}</p>}
                                            <p className="mt-1"><strong>Reason:</strong> {warning.reason}</p>
                                            <p className="mt-1"><strong>Date:</strong> {new Date(warning.date).toLocaleString('en-GB')}</p>
                                            {warning.category && <p className="mt-1"><strong>Category:</strong> {warning.category}</p>}
                                        </div>
                                    ))}
                                </div>
                                {warnings.length >= 3 && (
                                    <p className="text-xs mt-3 text-red-600 font-semibold">
                                        <AlertTriangle size={14} className="inline-block align-middle mr-1" /> You have reached 3 warnings - your account is suspended. Contact moderators for appeal.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Moderator Inform Banner Component

const InformBanner = ({ authToken, API_BASE_URL }) => {
    const [messages, setMessages] = useState([]);
    const [processing, setProcessing] = useState(null);

    const fetchMessages = async () => {
        if (!authToken) return;
        try {
            const response = await axios.get(`${API_BASE_URL}/notifications`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            const all = response.data?.notifications || response.data || [];
            setMessages(all.filter(n => n.type === 'moderator_message' && n.status === 'pending'));
        } catch (error) {
            console.error('Failed to fetch moderator messages:', error);
        }
    };

    useEffect(() => { fetchMessages(); }, [authToken, API_BASE_URL]);

    const handleAcknowledge = async (id) => {
        setProcessing(id);
        try {
            await axios.post(`${API_BASE_URL}/notifications/${id}/approve`, {}, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            setMessages(prev => prev.filter(m => m._id !== id));
        } catch (error) {
            console.error('Failed to acknowledge moderation notice:', error);
        } finally {
            setProcessing(null);
        }
    };

    if (messages.length === 0) return null;

    return (
        <div className="w-full flex justify-center">
            <div className="w-full max-w-7xl px-6">
                {messages.map((msg, index) => (
                    <div key={msg._id} className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-lg shadow-md mb-3">
                        <div className="flex items-start">
                            <div className="flex-shrink-0">
                                <Info className="h-6 w-6 text-blue-400" />
                            </div>
                            <div className="ml-3 flex-1">
                                <h3 className="text-lg font-bold text-blue-800">
                                    <Info size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Notice from Moderation Team
                                </h3>
                                <div className="mt-2 text-blue-700">
                                    <p className="text-sm">{msg.message}</p>
                                    {msg.metadata?.subject && <p className="text-xs font-semibold mt-1"><strong>Regarding:</strong> {msg.metadata.subject}</p>}
                                    <p className="text-xs text-blue-500 mt-1">{new Date(msg.createdAt).toLocaleString('en-GB')}</p>
                                </div>
                                <div className="mt-3">
                                    <button
                                        onClick={() => handleAcknowledge(msg._id)}
                                        disabled={processing === msg._id}
                                        className="flex items-center space-x-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
                                    >
                                        <CheckCircle size={14} />
                                        <span>Acknowledge</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

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
                        {hasEnded ? 'Poll ended' : `Ends: ${new Date(poll.pollEndsAt).toLocaleDateString('en-GB')}`}
                    </span>
                )}
            </div>
        </div>
    );
};

// Notifications Hub ? combines Breeding Reminders, Management Alerts, and Broadcasts in one fixed panel

const UrgencyAlertsBanner = ({ authToken, API_BASE_URL }) => {
    const [enabled, setEnabled] = useState(() => {
        try { return localStorage.getItem('ct_urgency_enabled') !== 'false'; } catch { return true; }
    });
    const [dismissed, setDismissed] = useState(() => {
        try { return JSON.parse(localStorage.getItem('ct_urgency_dismissed') || '{}'); } catch { return {}; }
    });
    const [litters, setLitters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [collapsed, setCollapsed] = useState(false);

    useEffect(() => {
        if (!authToken) return;
        axios.get(`${API_BASE_URL}/litters`, { headers: { Authorization: `Bearer ${authToken}` } })
            .then(res => setLitters(Array.isArray(res.data) ? res.data : []))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [authToken, API_BASE_URL]);

    // Sync enabled state if toggled from another part of the app (e.g. ProfileView)
    useEffect(() => {
        const onStorage = (e) => {
            try { setEnabled(localStorage.getItem('ct_urgency_enabled') !== 'false'); } catch {}
            if (!e.key || e.key === 'ct_urgency_dismissed') {
                try { setDismissed(JSON.parse(localStorage.getItem('ct_urgency_dismissed') || '{}')); } catch {}
            }
        };
        window.addEventListener('storage', onStorage);
        return () => window.removeEventListener('storage', onStorage);
    }, []);

    const saveEnabled = (val) => {
        setEnabled(val);
        try { localStorage.setItem('ct_urgency_enabled', val ? 'true' : 'false'); } catch {}
    };

    const dismiss = (key) => {
        const next = { ...dismissed, [key]: true };
        setDismissed(next);
        try { localStorage.setItem('ct_urgency_dismissed', JSON.stringify(next)); } catch {}
    };

    const dismissWeaningPermanently = async (litterId, key) => {
        try {
            await axios.put(`${API_BASE_URL}/litters/${litterId}`, { weaningDismissed: true }, { headers: { Authorization: `Bearer ${authToken}` } });
            setLitters(prev => prev.map(l => l._id === litterId ? { ...l, weaningDismissed: true } : l));
        } catch { /* fall back to local dismiss */ }
        dismiss(key);
    };

    const dismissAll = (items) => {
        const next = { ...dismissed };
        items.forEach(item => { next[item.key] = true; });
        setDismissed(next);
        try { localStorage.setItem('ct_urgency_dismissed', JSON.stringify(next)); } catch {}
    };

    if (!enabled || loading) return null;

    const today = new Date(); today.setHours(0, 0, 0, 0);
    const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
    const urgentItems = [];

    litters.forEach(l => {
        const pairName = l.breedingPairCodeName || l.litter_id_public || 'Unnamed Litter';
        const sn = l.sire?.name || l.sireId_public || '?';
        const dn = l.dam?.name || l.damId_public || '?';
        const sireDam = `${sn} \u00d7 ${dn}`;
        const callId = l.litter_id_public;

        // Parse a stored date string as LOCAL midnight to avoid UTC timezone shifting
        const parseLocalDate = (v) => {
            if (!v) return null;
            const s = typeof v === 'string' ? v.substring(0, 10) : null;
            const d = s ? new Date(s + 'T00:00:00') : new Date(v);
            return isNaN(d.getTime()) ? null : d;
        };

        // Mating due ? matingDate is today and litter not yet born
        if (l.matingDate && !l.birthDate) {
            const mated = parseLocalDate(l.matingDate);
            if (mated) {
                const diff = Math.round((mated - today) / 86400000);
                if (diff === 0) {
                    const key = `${l._id}-mated-${todayStr}`;
                    if (!dismissed[key]) urgentItems.push({ key, type: 'mated', pairName, sireDam, callId, diff });
                }
            }
        }

        // Expected Birth ? only if NOT already born
        if (l.expectedDueDate && !l.birthDate) {
            const due = parseLocalDate(l.expectedDueDate);
            if (due) {
                const diff = Math.round((due - today) / 86400000);
                if (diff <= 0) {
                    const key = `${l._id}-due-${todayStr}`;
                    if (!dismissed[key]) urgentItems.push({ key, type: 'due', pairName, sireDam, callId, diff });
                }
            }
        }

        // Weaning
        if (l.weaningDate && !l.weaningDismissed) {
            const wean = parseLocalDate(l.weaningDate);
            if (wean) {
                const diff = Math.round((wean - today) / 86400000);
                if (diff <= 0) {
                    const key = `${l._id}-weaned-${todayStr}`;
                    if (!dismissed[key]) urgentItems.push({ key, type: 'weaned', pairName, sireDam, callId, diff, litterId: l._id });
                }
            }
        }
    });

    if (urgentItems.length === 0) return null;

    const typeConfig = {
        mated:  { label: 'Mating',         bg: 'bg-purple-100 text-purple-700', icon: '\u2665\uFE0F' },
        due:    { label: 'Expected Birth', bg: 'bg-amber-100 text-amber-700',   icon: '\uD83D\uDC23' },
        weaned: { label: 'Weaning',        bg: 'bg-sky-100 text-sky-700',       icon: '\uD83C\uDF7C' },
    };

    return (
        <div className="mx-2 sm:mx-4 mt-1 mb-4 rounded-xl border-2 border-purple-300 bg-purple-50 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2 bg-purple-100 border-b border-purple-200">
                <div className="flex items-center gap-2">
                    <Sparkles size={15} className="text-purple-600 flex-shrink-0" />
                    <span className="text-sm font-bold text-purple-800">
                        {urgentItems.length} Breeding Reminder{urgentItems.length !== 1 ? 's' : ''}
                    </span>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => setCollapsed(c => !c)}
                        className="p-1 rounded hover:bg-purple-200 text-purple-600"
                        title={collapsed ? 'Expand' : 'Collapse'}
                    >
                        {collapsed ? <ChevronDown size={15} /> : <ChevronUp size={15} />}
                    </button>
                    <button
                        onClick={() => dismissAll(urgentItems)}
                        className="p-1 rounded hover:bg-purple-200 text-purple-500 hover:text-purple-700"
                        title="Dismiss all"
                    >
                        <X size={15} />
                    </button>
                </div>
            </div>

            {/* Items */}
            {!collapsed && (
                <div className="divide-y divide-purple-200">
                    {urgentItems.map(item => {
                        const cfg = typeConfig[item.type] || typeConfig.due;
                        const statusText = item.type === 'mated' && item.diff > 0
                            ? `In ${item.diff} day${item.diff !== 1 ? 's' : ''}`
                            : item.diff === 0
                            ? 'Due today'
                            : `${Math.abs(item.diff)} day${Math.abs(item.diff) !== 1 ? 's' : ''} overdue`;
                        return (
                            <div key={item.key} className="flex items-center gap-2 sm:gap-3 px-3 py-2.5">
                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${cfg.bg}`}>
                                    {React.createElement(cfg.icon, { size: 10, className: 'inline-block align-middle mr-0.5' })} {cfg.label}
                                </span>
                                <div className="flex-1 min-w-0">
                                    <span className="font-semibold text-gray-800 text-sm">{item.pairName}</span>
                                    <span className="text-gray-400 text-sm mx-1">?</span>
                                    <span className="text-gray-600 text-sm truncate">{item.sireDam}</span>
                                    {item.callId && <span className="text-xs text-gray-400 ml-1.5">{item.callId}</span>}
                                </div>
                                <span className={`text-xs font-bold flex-shrink-0 ${item.diff === 0 ? 'text-purple-600' : 'text-red-600'}`}>
                                    {statusText}
                                </span>
                                {item.type === 'weaned' ? (
                                    <div className="flex items-center gap-1.5 flex-shrink-0">
                                        <button
                                            onClick={() => dismiss(item.key)}
                                            className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200"
                                        >
                                            Snooze
                                        </button>
                                        <button
                                            onClick={() => dismissWeaningPermanently(item.litterId, item.key)}
                                            className="text-xs font-medium px-2 py-0.5 rounded-full bg-pink-100 text-pink-700 hover:bg-pink-200"
                                            title="Mark weaning complete ? stops this reminder permanently"
                                        >
                                            Done
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => dismiss(item.key)}
                                        className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200 flex-shrink-0"
                                    >
                                        Snooze
                                    </button>
                                )}
                            </div>
                        );
                    })}
                    <div className="px-3 py-1.5 flex justify-end">
                        <span className="text-xs text-gray-400">
                            <button onClick={() => saveEnabled(false)} className="underline hover:text-gray-600">Turn off alerts</button>
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};

// Management Urgency Banner ? due-today/overdue animal care, maintenance & supply tasks

const MgmtUrgencyBanner = ({ authToken, API_BASE_URL }) => {
    const [enabled, setEnabled] = useState(() => {
        try { return localStorage.getItem('ct_mgmt_urgency_enabled') !== 'false'; } catch { return true; }
    });
    const [dismissed, setDismissed] = useState(() => {
        try { return JSON.parse(localStorage.getItem('ct_mgmt_urgency_dismissed') || '{}'); } catch { return {}; }
    });
    const [animals, setAnimals] = useState([]);
    const [enclosures, setEnclosures] = useState([]);
    const [supplies, setSupplies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [collapsed, setCollapsed] = useState(false);

    useEffect(() => {
        if (!authToken) return;
        Promise.all([
            axios.get(`${API_BASE_URL}/animals`, { headers: { Authorization: `Bearer ${authToken}` }, params: { isOwned: 'true' } }),
            axios.get(`${API_BASE_URL}/enclosures`, { headers: { Authorization: `Bearer ${authToken}` } }),
            axios.get(`${API_BASE_URL}/supplies`, { headers: { Authorization: `Bearer ${authToken}` } }),
        ])
            .then(([ar, er, sr]) => {
                setAnimals(Array.isArray(ar.data) ? ar.data : []);
                setEnclosures(Array.isArray(er.data) ? er.data : []);
                setSupplies(Array.isArray(sr.data) ? sr.data : []);
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [authToken, API_BASE_URL]);

    useEffect(() => {
        const onStorage = () => {
            try { setEnabled(localStorage.getItem('ct_mgmt_urgency_enabled') !== 'false'); } catch {}
        };
        window.addEventListener('storage', onStorage);
        return () => window.removeEventListener('storage', onStorage);
    }, []);

    const saveEnabled = (val) => {
        setEnabled(val);
        try { localStorage.setItem('ct_mgmt_urgency_enabled', val ? 'true' : 'false'); } catch {}
    };

    const dismiss = (key) => {
        const next = { ...dismissed, [key]: true };
        setDismissed(next);
        try { localStorage.setItem('ct_mgmt_urgency_dismissed', JSON.stringify(next)); } catch {}
    };

    const dismissAll = (items) => {
        const next = { ...dismissed };
        items.forEach(item => { next[item.key] = true; });
        setDismissed(next);
        try { localStorage.setItem('ct_mgmt_urgency_dismissed', JSON.stringify(next)); } catch {}
    };

    if (!enabled || loading) return null;

    const today = new Date(); today.setHours(0, 0, 0, 0);
    const daysSince = (dateStr) => {
        if (!dateStr) return null;
        const d = new Date(dateStr); d.setHours(0, 0, 0, 0);
        return Math.floor((today - d) / 86400000);
    };
    const isTaskDue = (lastDate, freqDays) => {
        if (!freqDays) return false;
        if (!lastDate) return true;
        const ds = daysSince(lastDate);
        return ds !== null && ds >= Number(freqDays);
    };

    const urgentItems = [];

    // Feeding
    const feedingDue = animals.filter(a => isTaskDue(a.lastFedDate, a.feedingFrequencyDays));
    if (feedingDue.length > 0) {
        const key = 'mgmt-feeding';
        if (!dismissed[key]) urgentItems.push({ key, type: 'feeding', label: 'Feeding', icon: '\uD83C\uDF7D\uFE0F', description: `${feedingDue.length} animal${feedingDue.length !== 1 ? 's' : ''} overdue` });
    }

    // Animal care tasks
    let careDueCount = 0;
    animals.forEach(a => {
        careDueCount += (a.careTasks || []).filter(t => isTaskDue(t.lastDoneDate, t.frequencyDays)).length;
        careDueCount += (a.animalCareTasks || []).filter(t => isTaskDue(t.lastDoneDate, t.frequencyDays)).length;
    });
    if (careDueCount > 0) {
        const key = 'mgmt-care';
        if (!dismissed[key]) urgentItems.push({ key, type: 'care', label: 'Animal Care', icon: '\uD83E\uDDF4', description: `${careDueCount} task${careDueCount !== 1 ? 's' : ''} due` });
    }

    // Enclosure cleaning
    let maintDueCount = 0;
    enclosures.forEach(enc => {
        maintDueCount += (enc.cleaningTasks || []).filter(t => isTaskDue(t.lastDoneDate, t.frequencyDays)).length;
    });
    if (maintDueCount > 0) {
        const key = 'mgmt-maintenance';
        if (!dismissed[key]) urgentItems.push({ key, type: 'maintenance', label: 'Maintenance', icon: '\uD83D\uDD27', description: `${maintDueCount} enclosure task${maintDueCount !== 1 ? 's' : ''} overdue` });
    }

    // Supplies
    const suppliesDue = supplies.filter(s =>
        (s.reorderThreshold != null && s.currentStock <= s.reorderThreshold) ||
        (s.nextOrderDate && new Date(s.nextOrderDate) <= today)
    );
    if (suppliesDue.length > 0) {
        const key = 'mgmt-supplies';
        if (!dismissed[key]) urgentItems.push({ key, type: 'supplies', label: 'Supplies', icon: '\uD83D\uDCE6', description: `${suppliesDue.length} item${suppliesDue.length !== 1 ? 's' : ''} need restocking` });
    }

    if (urgentItems.length === 0) return null;

    const typeBg = {
        feeding:     'bg-orange-100 text-orange-700',
        care:        'bg-purple-100 text-purple-700',
        maintenance: 'bg-yellow-100 text-yellow-800',
        supplies:    'bg-emerald-100 text-emerald-700',
    };

    return (
        <div className="mx-2 sm:mx-4 mt-1 mb-4 rounded-xl border-2 border-purple-300 bg-purple-50 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2 bg-purple-100 border-b border-purple-200">
                <div className="flex items-center gap-2">
                    <Sparkles size={15} className="text-purple-600 flex-shrink-0" />
                    <span className="text-sm font-bold text-purple-800">
                        {urgentItems.length} Management Alert{urgentItems.length !== 1 ? 's' : ''}
                    </span>
                </div>
                <div className="flex items-center gap-1">
                    <button onClick={() => setCollapsed(c => !c)} className="p-1 rounded hover:bg-purple-200 text-purple-600" title={collapsed ? 'Expand' : 'Collapse'}>
                        {collapsed ? <ChevronDown size={15} /> : <ChevronUp size={15} />}
                    </button>
                    <button onClick={() => dismissAll(urgentItems)} className="p-1 rounded hover:bg-purple-200 text-purple-500 hover:text-purple-700" title="Dismiss all">
                        <X size={15} />
                    </button>
                </div>
            </div>
            {!collapsed && (
                <div className="divide-y divide-purple-200">
                    {urgentItems.map(item => (
                        <div key={item.key} className="flex items-center gap-2 sm:gap-3 px-3 py-2.5">
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${typeBg[item.type] || 'bg-gray-100 text-gray-700'}`}>
                                {item.icon} {item.label}
                            </span>
                            <div className="flex-1 min-w-0">
                                <span className="text-sm text-gray-700 font-medium">{item.description}</span>
                            </div>
                            <span className="text-xs font-bold text-red-600 flex-shrink-0">Action needed</span>
                            <button onClick={() => dismiss(item.key)} className="p-0.5 text-gray-400 hover:text-gray-600 flex-shrink-0" title="Dismiss">
                                <X size={14} />
                            </button>
                        </div>
                    ))}
                    <div className="px-3 py-1.5 flex justify-end">
                        <span className="text-xs text-gray-400">
                            <button onClick={() => saveEnabled(false)} className="underline hover:text-gray-600">Turn off alerts</button>
                        </span>
                    </div>
                </div>
            )}
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
                // Filter for broadcast/announcement types that are NOT warning/alert (show info, announcement, or undefined)
                const broadcastNotifications = (response.data || []).filter(n => {
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
        <div className="w-full max-w-4xl mx-auto">
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
                                        {new Date(broadcast.createdAt).toLocaleString('en-GB')}
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
                // Filter for urgent broadcast types (warning/alert) - these MUST have explicit broadcastType
                const urgentNotifications = (response.data || []).filter(n => {
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
                            {new Date(urgentBroadcast.createdAt).toLocaleString('en-GB')}
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

export { WarningBanner, InformBanner, BroadcastPoll, UrgencyAlertsBanner, MgmtUrgencyBanner, BroadcastBanner, UrgentBroadcastPopup };
