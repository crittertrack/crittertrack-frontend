import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
    AlertTriangle, Baby, Bell, CheckCircle, ChevronDown, ChevronUp,
    Droplets, Egg, Heart, Loader2, Milk, Package, PawPrint, Shield,
    UtensilsCrossed, Wrench, X, XCircle
} from 'lucide-react';
import { formatDate } from '../../utils/dateFormatter';
import { BroadcastPoll } from './Banners';

const API_BASE_URL = '/api';

const NotificationsHub = ({ authToken, API_BASE_URL }) => {
    // -- Breeding Reminders ------------------------------------------
    const [breedingEnabled] = useState(() => {
        try { return localStorage.getItem('ct_urgency_enabled') !== 'false'; } catch { return true; }
    });
    const [breedingDismissed, setBreedingDismissed] = useState(() => {
        try { return JSON.parse(localStorage.getItem('ct_urgency_dismissed') || '{}'); } catch { return {}; }
    });
    const [litters, setLitters] = useState(() => {
        try { return JSON.parse(localStorage.getItem('ct_hub_litters') || '[]'); } catch { return []; }
    });
    const [littersLoading, setLittersLoading] = useState(true);

    // -- Management Alerts -------------------------------------------
    const [mgmtEnabled] = useState(() => {
        try { return localStorage.getItem('ct_mgmt_urgency_enabled') !== 'false'; } catch { return true; }
    });
    const [mgmtDismissed, setMgmtDismissed] = useState(() => {
        try { return JSON.parse(localStorage.getItem('ct_mgmt_urgency_dismissed') || '{}'); } catch { return {}; }
    });
    const [animals, setAnimals] = useState(() => {
        try { return JSON.parse(localStorage.getItem('ct_hub_animals') || '[]'); } catch { return []; }
    });
    const [enclosures, setEnclosures] = useState(() => {
        try { return JSON.parse(localStorage.getItem('ct_hub_enclosures') || '[]'); } catch { return []; }
    });
    const [supplies, setSupplies] = useState(() => {
        try { return JSON.parse(localStorage.getItem('ct_hub_supplies') || '[]'); } catch { return []; }
    });
    const [mgmtLoading, setMgmtLoading] = useState(true);

    // -- Broadcasts --------------------------------------------------
    const [broadcasts, setBroadcasts] = useState(() => {
        try { return JSON.parse(localStorage.getItem('ct_hub_broadcasts') || '[]'); } catch { return []; }
    });
    const [dismissedBroadcastIds, setDismissedBroadcastIds] = useState(() => {
        try { const saved = localStorage.getItem('dismissedBroadcasts'); return saved ? JSON.parse(saved) : []; } catch { return []; }
    });
    const [votingInProgress, setVotingInProgress] = useState({});

    // -- Data Fetching -----------------------------------------------
    useEffect(() => {
        if (!authToken) return;
        axios.get(`${API_BASE_URL}/litters`, { headers: { Authorization: `Bearer ${authToken}` } })
            .then(res => {
                const data = Array.isArray(res.data) ? res.data : [];
                setLitters(data);
                try { localStorage.setItem('ct_hub_litters', JSON.stringify(data)); } catch {}
            })
            .catch(() => {})
            .finally(() => setLittersLoading(false));
    }, [authToken, API_BASE_URL]);

    useEffect(() => {
        if (!authToken) return;
        Promise.all([
            axios.get(`${API_BASE_URL}/animals`, { headers: { Authorization: `Bearer ${authToken}` }, params: { isOwned: 'true' } }),
            axios.get(`${API_BASE_URL}/enclosures`, { headers: { Authorization: `Bearer ${authToken}` } }),
            axios.get(`${API_BASE_URL}/supplies`, { headers: { Authorization: `Bearer ${authToken}` } }),
        ])
            .then(([ar, er, sr]) => {
                const a = Array.isArray(ar.data) ? ar.data : [];
                const e = Array.isArray(er.data) ? er.data : [];
                const s = Array.isArray(sr.data) ? sr.data : [];
                setAnimals(a); setEnclosures(e); setSupplies(s);
                try {
                    localStorage.setItem('ct_hub_animals', JSON.stringify(a));
                    localStorage.setItem('ct_hub_enclosures', JSON.stringify(e));
                    localStorage.setItem('ct_hub_supplies', JSON.stringify(s));
                } catch {}
            })
            .catch(() => {})
            .finally(() => setMgmtLoading(false));
    }, [authToken, API_BASE_URL]);

    useEffect(() => {
        const fetchBroadcasts = async () => {
            if (!authToken) return;
            try {
                const response = await axios.get(`${API_BASE_URL}/notifications`, {
                    headers: { Authorization: `Bearer ${authToken}` }
                });
                const broadcastNotifications = (response.data || []).filter(n => {
                    const isBroadcastType = n.type === 'broadcast' || n.type === 'announcement';
                    const isNotUrgent = n.broadcastType !== 'warning' && n.broadcastType !== 'alert';
                    const isNotDismissed = !dismissedBroadcastIds.includes(n._id);
                    return isBroadcastType && isNotUrgent && isNotDismissed;
                });
                setBroadcasts(broadcastNotifications);
                try { localStorage.setItem('ct_hub_broadcasts', JSON.stringify(broadcastNotifications)); } catch {}
            } catch {}
        };
        fetchBroadcasts();
        const interval = setInterval(fetchBroadcasts, 60000);
        return () => clearInterval(interval);
    }, [authToken, API_BASE_URL, dismissedBroadcastIds]);

    // -- Compute breeding items --------------------------------------
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
    const breedingItems = [];
    if (breedingEnabled && !littersLoading) {
        const parseLocalDate = (v) => {
            if (!v) return null;
            const s = typeof v === 'string' ? v.substring(0, 10) : null;
            const d = s ? new Date(s + 'T00:00:00') : new Date(v);
            return isNaN(d.getTime()) ? null : d;
        };
        litters.forEach(l => {
            const pairName = l.breedingPairCodeName || l.litter_id_public || 'Unnamed Litter';
            const sn = [l.sire?.prefix, l.sire?.name || l.sireId_public || '?', l.sire?.suffix].filter(Boolean).join(' ');
            const dn = [l.dam?.prefix, l.dam?.name || l.damId_public || '?', l.dam?.suffix].filter(Boolean).join(' ');
            const sireDam = `${sn} \u00d7 ${dn}`;
            const callId = l.litter_id_public;
            if (l.matingDate && !l.birthDate) {
                const mated = parseLocalDate(l.matingDate);
                if (mated) {
                    const diff = Math.round((mated - today) / 86400000);
                    if (diff === 0) {
                        const key = `${l._id}-mated-${todayStr}`;
                        if (!breedingDismissed[key]) breedingItems.push({ key, type: 'mated', pairName, sireDam, callId, diff });
                    }
                }
            }
            if (l.expectedDueDate && !l.birthDate) {
                const due = parseLocalDate(l.expectedDueDate);
                if (due) {
                    const diff = Math.round((due - today) / 86400000);
                    if (diff <= 0) {
                        const key = `${l._id}-due-${todayStr}`;
                        if (!breedingDismissed[key]) breedingItems.push({ key, type: 'due', pairName, sireDam, callId, diff });
                    }
                }
            }
            if (l.weaningDate && !l.weaningDismissed) {
                const wean = parseLocalDate(l.weaningDate);
                if (wean) {
                    const diff = Math.round((wean - today) / 86400000);
                    if (diff <= 0) {
                        const key = `${l._id}-weaned-${todayStr}`;
                        if (!breedingDismissed[key]) breedingItems.push({ key, type: 'weaned', pairName, sireDam, callId, diff, litterId: l._id });
                    }
                }
            }
        });
    }

    // -- Compute management items ------------------------------------
    const mgmtItems = [];
    if (mgmtEnabled && !mgmtLoading) {
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
        const feedingDue = animals.filter(a => isTaskDue(a.lastFedDate, a.feedingFrequencyDays));
        if (feedingDue.length > 0) {
            const key = 'mgmt-feeding';
            if (!mgmtDismissed[key]) mgmtItems.push({ key, type: 'feeding', label: 'Feeding', icon: '\uD83C\uDF7D\uFE0F', description: `${feedingDue.length} animal${feedingDue.length !== 1 ? 's' : ''} overdue` });
        }
        let careDueCount = 0;
        animals.forEach(a => {
            careDueCount += (a.careTasks || []).filter(t => isTaskDue(t.lastDoneDate, t.frequencyDays)).length;
            careDueCount += (a.animalCareTasks || []).filter(t => isTaskDue(t.lastDoneDate, t.frequencyDays)).length;
        });
        if (careDueCount > 0) {
            const key = 'mgmt-care';
            if (!mgmtDismissed[key]) mgmtItems.push({ key, type: 'care', label: 'Animal Care', icon: '\uD83E\uDDF4', description: `${careDueCount} task${careDueCount !== 1 ? 's' : ''} due` });
        }
        let maintDueCount = 0;
        enclosures.forEach(enc => {
            maintDueCount += (enc.cleaningTasks || []).filter(t => isTaskDue(t.lastDoneDate, t.frequencyDays)).length;
        });
        if (maintDueCount > 0) {
            const key = 'mgmt-maintenance';
            if (!mgmtDismissed[key]) mgmtItems.push({ key, type: 'maintenance', label: 'Maintenance', icon: '\uD83D\uDD27', description: `${maintDueCount} enclosure task${maintDueCount !== 1 ? 's' : ''} overdue` });
        }
        const suppliesDue = supplies.filter(s =>
            (s.reorderThreshold != null && s.currentStock <= s.reorderThreshold) ||
            (s.nextOrderDate && new Date(s.nextOrderDate) <= today)
        );
        if (suppliesDue.length > 0) {
            const key = 'mgmt-supplies';
            if (!mgmtDismissed[key]) mgmtItems.push({ key, type: 'supplies', label: 'Supplies', icon: '\uD83D\uDCE6', description: `${suppliesDue.length} item${suppliesDue.length !== 1 ? 's' : ''} need restocking` });
        }
    }

    // -- Dismiss handlers --------------------------------------------
    const dismissBreeding = (key) => {
        const next = { ...breedingDismissed, [key]: true };
        setBreedingDismissed(next);
        try { localStorage.setItem('ct_urgency_dismissed', JSON.stringify(next)); } catch {}
    };
    const dismissWeaningPermanently = async (litterId, key) => {
        try {
            await axios.put(`${API_BASE_URL}/litters/${litterId}`, { weaningDismissed: true }, { headers: { Authorization: `Bearer ${authToken}` } });
            setLitters(prev => prev.map(l => l._id === litterId ? { ...l, weaningDismissed: true } : l));
        } catch { /* fall back to local dismiss */ }
        dismissBreeding(key);
    };
    const dismissMgmt = (key) => {
        const next = { ...mgmtDismissed, [key]: true };
        setMgmtDismissed(next);
        try { localStorage.setItem('ct_mgmt_urgency_dismissed', JSON.stringify(next)); } catch {}
    };
    const dismissBroadcast = (id) => {
        const newDismissed = [...dismissedBroadcastIds, id];
        setDismissedBroadcastIds(newDismissed);
        try { localStorage.setItem('dismissedBroadcasts', JSON.stringify(newDismissed)); } catch {}
        setBroadcasts(prev => prev.filter(b => b._id !== id));
    };
    const handlePollVote = async (notificationId, selectedOptions) => {
        if (!authToken || votingInProgress[notificationId]) return;
        setVotingInProgress(prev => ({ ...prev, [notificationId]: true }));
        const previousBroadcasts = broadcasts;
        setBroadcasts(prev => prev.map(broadcast => {
            if (broadcast._id === notificationId) {
                const updatedOptions = broadcast.pollOptions.map((option, index) =>
                    selectedOptions.includes(index) ? { ...option, votes: (option.votes || 0) + 1 } : option
                );
                return { ...broadcast, userVote: selectedOptions, pollOptions: updatedOptions };
            }
            return broadcast;
        }));
        try {
            const response = await axios.post(
                `${API_BASE_URL}/moderation/poll/vote`,
                { notificationId, selectedOptions },
                { headers: { Authorization: `Bearer ${authToken}` } }
            );
            setBroadcasts(prev => prev.map(broadcast =>
                broadcast._id === notificationId
                    ? { ...broadcast, userVote: response.data.userVote || selectedOptions, pollOptions: response.data.pollResults || broadcast.pollOptions }
                    : broadcast
            ));
        } catch {
            setBroadcasts(previousBroadcasts);
        } finally {
            setVotingInProgress(prev => ({ ...prev, [notificationId]: false }));
        }
    };

    // -- Render ------------------------------------------------------
    const [selectedBroadcast, setSelectedBroadcast] = useState(null);

    const totalCount = breedingItems.length + mgmtItems.length + broadcasts.length;
    const isLoading = littersLoading || mgmtLoading;

    const breedingTypeConfig = {
        mated:  { label: 'Mating',         bg: 'bg-purple-100 text-purple-700', border: 'border-purple-200', icon: Heart },
        due:    { label: 'Expected Birth', bg: 'bg-amber-100 text-amber-700',   border: 'border-amber-200',  icon: Egg },
        weaned: { label: 'Weaning',        bg: 'bg-sky-100 text-sky-700',       border: 'border-sky-200',    icon: Milk },
    };
    const mgmtTypeConfig = {
        feeding:     { bg: 'bg-orange-100 text-orange-700', border: 'border-orange-200', icon: UtensilsCrossed },
        care:        { bg: 'bg-purple-100 text-purple-700', border: 'border-purple-200', icon: Droplets },
        maintenance: { bg: 'bg-yellow-100 text-yellow-800', border: 'border-yellow-200', icon: Wrench },
        supplies:    { bg: 'bg-emerald-100 text-emerald-700', border: 'border-emerald-200', icon: Package },
    };
    const getBroadcastStyles = (broadcastType) => {
        if (broadcastType === 'announcement') return { bg: 'bg-purple-50', border: 'border-purple-300', pill: 'bg-purple-100 text-purple-700', title: 'text-purple-800', sub: 'text-purple-400', dismiss: 'text-purple-400 hover:text-purple-600', icon: 'text-purple-400', label: 'Announcement', button: 'bg-purple-500 hover:bg-purple-600 text-white', optionBg: 'bg-purple-100 hover:bg-purple-200', resultBar: 'bg-purple-400', subtitle: 'text-purple-400', text: 'text-purple-700' };
        if (broadcastType === 'poll') return { bg: 'bg-green-50', border: 'border-green-300', pill: 'bg-green-100 text-green-700', title: 'text-green-800', sub: 'text-green-400', dismiss: 'text-green-400 hover:text-green-600', icon: 'text-green-400', label: 'Poll', button: 'bg-green-500 hover:bg-green-600 text-white', optionBg: 'bg-green-100 hover:bg-green-200', resultBar: 'bg-green-400', subtitle: 'text-green-400', text: 'text-green-700' };
        return { bg: 'bg-blue-50', border: 'border-blue-300', pill: 'bg-blue-100 text-blue-700', title: 'text-blue-800', sub: 'text-blue-400', dismiss: 'text-blue-400 hover:text-blue-600', icon: 'text-blue-400', label: 'Info', button: 'bg-blue-500 hover:bg-blue-600 text-white', optionBg: 'bg-blue-100 hover:bg-blue-200', resultBar: 'bg-blue-400', subtitle: 'text-blue-400', text: 'text-blue-700' };
    };

    const hasReminders = breedingItems.length > 0 || mgmtItems.length > 0;
    const hasNews = broadcasts.length > 0;

    return (
        <>
        <div className="bg-white rounded-xl shadow-md flex flex-col" style={{ height: '280px' }}>
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100 flex-shrink-0">
                <div className="flex items-center gap-2">
                    <Bell size={15} className="text-primary" />
                    <span className="font-semibold text-gray-800 text-sm">Reminders &amp; News</span>
                </div>
                {totalCount > 0 && (
                    <span className="text-xs bg-red-500 text-white px-1.5 py-0.5 rounded-full font-bold">{totalCount}</span>
                )}
            </div>

            {isLoading && litters.length === 0 && animals.length === 0 && broadcasts.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">Loading...</div>
            ) : totalCount === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-1.5 text-gray-400">
                    <CheckCircle size={26} className="text-green-400" />
                    <span className="text-sm font-medium text-gray-500">All caught up!</span>
                    <span className="text-xs">No reminders or news.</span>
                </div>
            ) : (
                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Reminder rows ? always shown unless both empty */}
                    <div className="overflow-y-auto divide-y divide-gray-200 flex-shrink-0" style={{ height: '52px' }}>
                        {hasReminders ? (
                            <>
                                {breedingItems.map(item => {
                                    const cfg = breedingTypeConfig[item.type] || breedingTypeConfig.due;
                                    const statusText = item.type === 'mated' && item.diff > 0
                                        ? `In ${item.diff}d`
                                        : item.diff === 0 ? 'Due today'
                                        : `${Math.abs(item.diff)}d overdue`;
                                    return (
                                        <div key={item.key} className="flex items-center gap-2 px-3 py-2.5">
                                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${cfg.bg}`}>{React.createElement(cfg.icon, { size: 10, className: 'inline-block align-middle mr-0.5' })} {cfg.label}</span>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-1.5">
                                                    <p className="text-sm font-semibold text-gray-800 truncate">{item.pairName}</p>
                                                    {item.callId && item.callId !== item.pairName && <span className="text-xs text-gray-400 flex-shrink-0">{item.callId}</span>}
                                                </div>
                                                <p className="text-xs text-gray-500 truncate">{item.sireDam}</p>
                                            </div>
                                            <span className={`text-xs font-bold flex-shrink-0 ${item.diff < 0 ? 'text-red-600' : item.diff === 0 ? 'text-purple-600' : 'text-gray-600'}`}>{statusText}</span>
                                            {item.type === 'weaned' ? (
                                                <div className="flex items-center gap-1.5 flex-shrink-0">
                                                    <button onClick={() => dismissBreeding(item.key)} className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200 flex-shrink-0">Snooze</button>
                                                    <button onClick={() => dismissWeaningPermanently(item.litterId, item.key)} className="text-xs font-medium px-2 py-0.5 rounded-full bg-pink-100 text-pink-700 hover:bg-pink-200 flex-shrink-0" title="Mark weaning complete ? stops this reminder permanently">Done</button>
                                                </div>
                                            ) : (
                                                <button onClick={() => dismissBreeding(item.key)} className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200 flex-shrink-0">Snooze</button>
                                            )}
                                        </div>
                                    );
                                })}
                                {mgmtItems.map(item => {
                                    const cfg = mgmtTypeConfig[item.type] || { bg: 'bg-gray-100 text-gray-700', border: 'border-gray-200', icon: AlertTriangle };
                                    return (
                                        <div key={item.key} className="flex items-center gap-2 px-3 py-2.5">
                                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${cfg.bg}`}>{React.createElement(cfg.icon, { size: 10, className: 'inline-block align-middle mr-0.5' })} {item.label}</span>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-gray-700 font-medium truncate">{item.description}</p>
                                            </div>
                                            <span className="text-xs font-bold text-red-600 flex-shrink-0">Action needed</span>
                                            <button onClick={() => dismissMgmt(item.key)} className="p-0.5 text-gray-400 hover:text-gray-600 flex-shrink-0"><X size={13} /></button>
                                        </div>
                                    );
                                })}
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-3 gap-0.5 text-gray-400">
                                <span className="text-xs font-medium text-gray-500">All caught up!</span>
                                <span className="text-xs">No reminders.</span>
                            </div>
                        )}
                    </div>

                    {/* News card strip ? always shown unless both empty */}
                    <div className="mt-auto flex-shrink-0 border-t border-gray-200 flex-1 overflow-hidden flex flex-col">
                        {hasNews ? (
                            <div className="flex gap-2 overflow-x-auto px-3 py-2 flex-1" style={{ scrollbarWidth: 'thin' }}>
                                {broadcasts.map(broadcast => {
                                    const styles = getBroadcastStyles(broadcast.broadcastType);
                                    return (
                                        <div
                                            key={broadcast._id}
                                            className={`flex-shrink-0 w-48 rounded-lg border ${styles.border} ${styles.bg} px-2.5 py-2 flex flex-col relative cursor-pointer hover:opacity-90 transition h-full overflow-hidden`}
                                            onClick={() => setSelectedBroadcast(broadcast)}
                                        >
                                            <button onClick={(e) => { e.stopPropagation(); dismissBroadcast(broadcast._id); }} className={`absolute top-1 right-1 ${styles.dismiss}`}><X size={11} /></button>
                                            <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full self-start ${styles.pill} mb-1`}>{styles.label}</span>
                                            <p className={`text-xs font-bold ${styles.title} line-clamp-2 pr-3 leading-tight mb-1`}>{broadcast.broadcastType === 'poll' ? (broadcast.pollQuestion || broadcast.title) : (broadcast.title || `System ${styles.label}`)}</p>
                                            {broadcast.broadcastType === 'poll' && broadcast.pollOptions ? (
                                                <>
                                                    {broadcast.pollOptions?.[0] && (
                                                        <p className={`text-xs ${styles.text} opacity-70 line-clamp-1 leading-snug`}>◆ {broadcast.pollOptions[0].text}</p>
                                                    )}
                                                    {broadcast.pollOptions?.[1] && (
                                                        <p className={`text-xs ${styles.text} opacity-70 line-clamp-1 leading-snug`}>◆ {broadcast.pollOptions[1].text}</p>
                                                    )}
                                                    {broadcast.pollOptions?.[2] && (
                                                        <p className={`text-xs ${styles.text} opacity-70 line-clamp-1 leading-snug`}>◆ {broadcast.pollOptions[2].text}</p>
                                                    )}
                                                    {broadcast.pollOptions?.[3] && (
                                                        <p className={`text-xs ${styles.text} opacity-70 line-clamp-1 leading-snug mb-1`}>◆ {broadcast.pollOptions[3].text}</p>
                                                    )}
                                                </>
                                            ) : broadcast.message && (
                                                <p className={`text-xs ${styles.text} line-clamp-4 leading-snug mb-1`}>{broadcast.message}</p>
                                            )}
                                            <p className={`text-xs ${styles.sub} mt-auto`}>{new Date(broadcast.createdAt).toLocaleDateString('en-GB')}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center flex-1 gap-0.5 text-gray-400">
                                <span className="text-xs font-medium text-gray-500">All caught up!</span>
                                <span className="text-xs">No news.</span>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>

        {/* Broadcast detail modal */}
        {selectedBroadcast && (() => {
            const styles = getBroadcastStyles(selectedBroadcast.broadcastType);
            return (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4" onClick={() => setSelectedBroadcast(null)}>
                    <div className={`bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[80vh] flex flex-col border-t-4 ${styles.border}`} onClick={e => e.stopPropagation()}>
                        <div className={`flex items-start justify-between px-5 py-4 border-b border-gray-100`}>
                            <div className="flex items-center gap-2 min-w-0">
                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${styles.pill}`}>{styles.label}</span>
                                <h3 className={`text-base font-bold ${styles.title} leading-snug`}>{selectedBroadcast.broadcastType === 'poll' ? (selectedBroadcast.pollQuestion || selectedBroadcast.title) : (selectedBroadcast.title || `System ${styles.label}`)}</h3>
                            </div>
                            <button onClick={() => setSelectedBroadcast(null)} className="text-gray-400 hover:text-gray-600 flex-shrink-0 ml-2"><X size={18} /></button>
                        </div>
                        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                            {selectedBroadcast.message && <p className={`text-sm ${styles.text}`}>{selectedBroadcast.message}</p>}
                            {selectedBroadcast.broadcastType === 'poll' && selectedBroadcast.pollQuestion && (
                                <BroadcastPoll
                                    poll={selectedBroadcast}
                                    onVote={async (selectedOptions) => {
                                        await handlePollVote(selectedBroadcast._id, selectedOptions);
                                        setSelectedBroadcast(prev => prev ? { ...prev, userVote: selectedOptions } : null);
                                    }}
                                    isVoting={votingInProgress[selectedBroadcast._id] || false}
                                    styles={styles}
                                    authToken={authToken}
                                    API_BASE_URL={API_BASE_URL}
                                    notificationId={selectedBroadcast._id}
                                    onOptionsUpdated={(opts) => setSelectedBroadcast(prev => prev ? { ...prev, pollOptions: opts } : null)}
                                />
                            )}
                            <p className={`text-xs ${styles.sub}`}>{new Date(selectedBroadcast.createdAt).toLocaleString('en-GB')}</p>
                        </div>
                        <div className="px-5 py-3 border-t border-gray-100 flex justify-end">
                            <button
                                onClick={() => { dismissBroadcast(selectedBroadcast._id); setSelectedBroadcast(null); }}
                                className="text-xs text-gray-400 hover:text-gray-600 underline mr-4"
                            >Dismiss</button>
                            <button onClick={() => setSelectedBroadcast(null)} className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg font-medium">Close</button>
                        </div>
                    </div>
                </div>
            );
        })()}
        </>
    );
};

// Urgency Alerts Banner ? shows due-today/overdue litter events on every page (can be disabled per user)

export default NotificationsHub;
