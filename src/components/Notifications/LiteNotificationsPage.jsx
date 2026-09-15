import React, { useState, useEffect, useCallback, useMemo } from 'react';
import apiClient from '../../utils/apiClient';
import {
    ArrowLeft, Loader2, Utensils, ClipboardList, HeartPulse, Baby, Check, Home, Package,
    CheckCircle, XCircle, Trash2, AlertTriangle, PawPrint, Shield,
} from 'lucide-react';
import { parseLocalDate } from '../../utils/dateFormatter';
import { remapLegacyHealthStatus } from '../../utils/medicalStatus';
import { GROOMING_SCHEDULE_DEFS, TRAINING_SCHEDULE_DEFS } from '../../utils/scheduleFieldDefs';
import { useUnreadNotifications } from '../../hooks/useNotificationCounts';

// Lite web's equivalent of crittertrack-lite's Notifications.jsx (the notification bell's
// "quick actions" page) — reached by tapping the NotificationBar ticker instead of a bell icon,
// since Lite web has no header bell. Mirrors that page's categories/quick actions closely so
// the two apps behave the same way; kept self-contained (own date-math helpers, etc.) rather
// than sharing NotificationBar's ticker-summary computations, which aren't structured for
// per-item row rendering.
const SCHEDULE_DEFS = [...GROOMING_SCHEDULE_DEFS, ...TRAINING_SCHEDULE_DEFS];

const hoursSince = (dateStr) => {
    if (!dateStr) return null;
    const then = new Date(dateStr);
    if (isNaN(then.getTime())) return null;
    return (Date.now() - then.getTime()) / 3600000;
};
const daysSince = (dateStr) => {
    if (!dateStr) return null;
    const then = parseLocalDate(dateStr);
    if (isNaN(then.getTime())) return null;
    then.setHours(0, 0, 0, 0);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    return Math.floor((today - then) / 86400000);
};
const isTaskDue = (lastDate, freqDays) => {
    if (!freqDays) return false;
    if (!lastDate) return true;
    const ds = daysSince(lastDate);
    return ds !== null && ds >= Number(freqDays);
};
const cleaningTaskFreqDays = (t) => {
    if (t.frequencyDays) return t.frequencyDays;
    if (!t.frequency) return null;
    const mult = t.frequencyUnit === 'weeks' ? 7 : t.frequencyUnit === 'months' ? 30 : t.frequencyUnit === 'years' ? 365 : 1;
    return t.frequency * mult;
};
const isPastOrToday = (dateStr) => {
    if (!dateStr) return false;
    const then = parseLocalDate(dateStr);
    if (isNaN(then.getTime())) return false;
    then.setHours(0, 0, 0, 0);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    return then <= today;
};
const animalName = (a) => [a.prefix, a.name || 'Unnamed', a.suffix].filter(Boolean).join(' ');

const AlertRow = ({ title, subtitle, onView, actionLabel, onAction, busy }) => (
    <div className="bg-white dark:bg-dark-card-bg rounded-xl p-3 shadow-sm flex items-center gap-3">
        <button onClick={onView} disabled={!onView} className="flex-1 min-w-0 text-left disabled:cursor-default">
            <p className="text-sm font-semibold text-gray-800 dark:text-dark-text truncate">{title}</p>
            {subtitle && <p className="text-xs text-gray-500 dark:text-dark-text-muted truncate">{subtitle}</p>}
        </button>
        {onAction && (
            <button
                onClick={onAction}
                disabled={busy}
                className="flex items-center gap-1 bg-accent dark:bg-dark-accent text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg disabled:opacity-50 flex-shrink-0"
            >
                {busy ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />} {actionLabel}
            </button>
        )}
    </div>
);

// Restocking needs a quantity, so this alert gets its own compact inline input instead of AlertRow.
const SupplyAlertRow = ({ supply, onRestock, busy }) => {
    const [qty, setQty] = useState('');
    const isLow = supply.reorderThreshold != null && supply.currentStock <= supply.reorderThreshold;
    return (
        <div className="bg-white dark:bg-dark-card-bg rounded-xl p-3 shadow-sm space-y-2">
            <div>
                <p className="text-sm font-semibold text-gray-800 dark:text-dark-text truncate">{supply.name}</p>
                <p className="text-xs text-gray-500 dark:text-dark-text-muted">
                    {isLow ? `Low stock: ${supply.currentStock}${supply.unit ? ` ${supply.unit}` : ''}` : `Reorder due ${parseLocalDate(supply.nextOrderDate).toLocaleDateString()}`}
                </p>
            </div>
            <div className="flex items-center gap-2">
                <input
                    type="number"
                    min="1"
                    value={qty}
                    onChange={(e) => setQty(e.target.value)}
                    placeholder={`Qty received${supply.unit ? ` (${supply.unit})` : ''}`}
                    className="flex-1 px-2 py-1.5 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card-bg text-gray-900 dark:text-dark-text text-xs"
                />
                <button
                    onClick={() => { onRestock(qty); setQty(''); }}
                    disabled={busy || !qty}
                    className="flex items-center gap-1 bg-accent dark:bg-dark-accent text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg disabled:opacity-50 flex-shrink-0"
                >
                    {busy ? <Loader2 size={13} className="animate-spin" /> : <Package size={13} />} Restock
                </button>
            </div>
        </div>
    );
};

const CategorySection = ({ icon, title, count, children }) => (
    <div className="space-y-2">
        <div className="flex items-center gap-2 px-1">
            {icon}
            <p className="text-xs font-bold text-gray-400 dark:text-dark-text-muted uppercase">{title}</p>
            {count > 0 && <span className="text-[10px] font-bold bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full px-1.5 py-0.5">{count}</span>}
        </div>
        {count === 0 ? (
            <p className="text-xs text-gray-400 dark:text-dark-text-muted px-1 pb-1">Nothing due right now.</p>
        ) : children}
    </div>
);

// "Requests" tab — same request types/quick actions as NotificationPanel.jsx, as inline page
// content (Lite is page-based, not modal-based) using this page's card styling.
const TYPE_STYLES = {
    content_edited: 'bg-orange-100 dark:bg-orange-900/20 border-orange-300 dark:border-orange-700/50',
    litter_assignment: 'bg-green-50 dark:bg-green-900/10 border-green-300 dark:border-green-700/50',
    mating_reminder: 'bg-indigo-50 dark:bg-indigo-900/10 border-indigo-300 dark:border-indigo-700/50',
};

const RequestsTab = ({ onViewAnimal }) => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(null);

    const fetchNotifications = useCallback(async () => {
        try {
            const response = await apiClient.get('/notifications');
            const all = Array.isArray(response.data) ? response.data : response.data?.notifications || [];
            setNotifications(all);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setLoading(false);
            window.dispatchEvent(new Event('notifications-changed'));
        }
    }, []);

    useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

    const runAction = async (key, fn, { animalsChanged = false } = {}) => {
        setProcessing(key);
        try {
            await fn();
            await fetchNotifications();
            if (animalsChanged) window.dispatchEvent(new Event('animals-changed'));
        } catch (error) {
            console.error('Notification action failed:', error);
        } finally {
            setProcessing(null);
        }
    };

    const handleAcceptTransfer = (n) => runAction(n.transferId, () => apiClient.post(`/transfers/${n.transferId}/accept`, {}), { animalsChanged: true });
    const handleAcceptViewOnly = (n) => runAction(n.transferId, () => apiClient.post(`/transfers/${n.transferId}/accept-view-only`, {}), { animalsChanged: true });
    const handleDeclineTransfer = (n) => runAction(n.transferId, () => apiClient.post(`/transfers/${n.transferId}/decline`, {}), { animalsChanged: true });
    const handleApprove = (n) => runAction(n._id, () => apiClient.post(`/notifications/${n._id}/approve`, {}));
    const handleReject = (n) => runAction(n._id, () => apiClient.post(`/notifications/${n._id}/reject`, {}), { animalsChanged: true });
    const handleDelete = (n) => runAction(n._id, () => apiClient.delete(`/notifications/${n._id}`));

    const pending = notifications.filter((n) => n.status === 'pending' && n.type !== 'broadcast' && n.type !== 'announcement' && n.type !== 'moderator_message');
    const history = notifications.filter((n) => n.status !== 'pending' && n.type !== 'broadcast' && n.type !== 'announcement');

    if (loading) {
        return <div className="flex justify-center py-16"><Loader2 className="animate-spin text-accent" size={28} /></div>;
    }
    if (notifications.length === 0) {
        return <p className="text-center text-gray-400 dark:text-dark-text-muted text-sm py-16">No requests or updates.</p>;
    }

    return (
        <div className="space-y-5">
            {pending.length > 0 && (
                <div className="space-y-2">
                    <p className="text-xs font-bold text-gray-400 dark:text-dark-text-muted uppercase px-1">Pending</p>
                    {pending.map((n) => (
                        <div key={n._id} className={`border rounded-xl p-3 shadow-sm space-y-2 ${TYPE_STYLES[n.type] || 'bg-white dark:bg-dark-card-bg border-gray-100 dark:border-dark-border'}`}>
                            {n.type === 'content_edited' && (
                                <div className="flex items-center gap-1.5 text-orange-700 dark:text-orange-400 text-xs font-bold">
                                    <AlertTriangle size={14} /> Moderation Notice
                                </div>
                            )}
                            {n.type === 'litter_assignment' && (
                                <div className="flex items-center gap-1.5 text-green-700 dark:text-green-400 text-xs font-bold">
                                    <Baby size={14} /> Litter Assignment · {n.parentType === 'sire' ? 'Sire' : 'Dam'}
                                </div>
                            )}
                            {n.type === 'mating_reminder' && (
                                <div className="flex items-center gap-1.5 text-indigo-700 dark:text-indigo-400 text-xs font-bold">
                                    <PawPrint size={14} /> Planned Mating · Today!
                                </div>
                            )}
                            <div className="flex items-start gap-2.5">
                                {n.type === 'content_edited' ? (
                                    <div className="flex-shrink-0 w-12 h-12 bg-orange-200 dark:bg-orange-900/40 rounded-lg flex items-center justify-center">
                                        <Shield size={22} className="text-orange-600 dark:text-orange-400" />
                                    </div>
                                ) : n.animalImageUrl ? (
                                    <button
                                        onClick={() => n.animalId_public && onViewAnimal({ id_public: n.animalId_public, name: n.animalName, prefix: n.animalPrefix, imageUrl: n.animalImageUrl })}
                                        className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-gray-100 dark:bg-dark-surface"
                                    >
                                        <img src={n.animalImageUrl} alt="" className="w-full h-full object-cover" />
                                    </button>
                                ) : null}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-gray-700 dark:text-dark-text-secondary">{n.message}</p>
                                    <p className="text-xs text-gray-400 dark:text-dark-text-muted mt-0.5">{new Date(n.createdAt).toLocaleString()}</p>
                                </div>
                            </div>
                            <div className="flex gap-2 flex-wrap">
                                {n.type === 'transfer_request' && n.transferId && (
                                    <>
                                        <button onClick={() => handleAcceptTransfer(n)} disabled={processing === n.transferId} className="flex items-center gap-1 bg-green-500 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg disabled:opacity-50">
                                            <CheckCircle size={13} /> Accept
                                        </button>
                                        <button onClick={() => handleDeclineTransfer(n)} disabled={processing === n.transferId} className="flex items-center gap-1 bg-red-500 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg disabled:opacity-50">
                                            <XCircle size={13} /> Decline
                                        </button>
                                    </>
                                )}
                                {n.type === 'view_only_offer' && n.transferId && (
                                    <>
                                        <button onClick={() => handleAcceptViewOnly(n)} disabled={processing === n.transferId} className="flex items-center gap-1 bg-info-blue dark:bg-dark-info-blue text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg disabled:opacity-50">
                                            <CheckCircle size={13} /> Accept
                                        </button>
                                        <button onClick={() => handleDeclineTransfer(n)} disabled={processing === n.transferId} className="flex items-center gap-1 bg-gray-500 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg disabled:opacity-50">
                                            <XCircle size={13} /> Decline
                                        </button>
                                    </>
                                )}
                                {n.type === 'link_request' && (
                                    <>
                                        <button onClick={() => handleReject(n)} disabled={processing === n._id} className="flex items-center gap-1 bg-accent dark:bg-dark-accent text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg disabled:opacity-50">
                                            <XCircle size={13} /> Reject
                                        </button>
                                        <button onClick={() => handleApprove(n)} disabled={processing === n._id} title="The link is already in effect — this just clears it from your pending list." className="flex items-center gap-1 bg-gray-500 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg disabled:opacity-50">
                                            <CheckCircle size={13} /> Acknowledge
                                        </button>
                                    </>
                                )}
                                {(n.type === 'breeder_request' || n.type === 'parent_request') && (
                                    <>
                                        <button onClick={() => handleReject(n)} disabled={processing === n._id} className="flex items-center gap-1 bg-accent dark:bg-dark-accent text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg disabled:opacity-50">
                                            <XCircle size={13} /> Reject
                                        </button>
                                        <button onClick={() => handleApprove(n)} disabled={processing === n._id} title="The link is already in effect — this just clears it from your pending list." className="flex items-center gap-1 bg-gray-500 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg disabled:opacity-50">
                                            <CheckCircle size={13} /> Acknowledge
                                        </button>
                                    </>
                                )}
                                {n.type === 'content_edited' && (
                                    <button onClick={() => handleApprove(n)} disabled={processing === n._id} className="flex items-center gap-1 bg-orange-500 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg disabled:opacity-50">
                                        <CheckCircle size={13} /> Acknowledge
                                    </button>
                                )}
                                {(n.type === 'litter_assignment' || n.type === 'mating_reminder') && (
                                    <button onClick={() => handleApprove(n)} disabled={processing === n._id} className="flex items-center gap-1 bg-gray-500 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg disabled:opacity-50">
                                        <CheckCircle size={13} /> Acknowledge
                                    </button>
                                )}
                                {!['link_request', 'breeder_request', 'parent_request', 'transfer_request', 'view_only_offer', 'content_edited', 'litter_assignment', 'mating_reminder'].includes(n.type) && (
                                    <button onClick={() => handleDelete(n)} className="flex items-center gap-1 bg-gray-500 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg">
                                        <Trash2 size={13} /> Delete
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {history.length > 0 && (
                <div className="space-y-2">
                    <p className="text-xs font-bold text-gray-400 dark:text-dark-text-muted uppercase px-1">History</p>
                    {history.map((n) => (
                        <div key={n._id} className="border border-gray-100 dark:border-dark-border rounded-xl p-3 bg-gray-50 dark:bg-dark-surface flex items-start justify-between gap-2">
                            <div className="min-w-0">
                                <p className="text-sm text-gray-700 dark:text-dark-text-secondary">{n.message}</p>
                                <p className="text-xs text-gray-400 dark:text-dark-text-muted mt-0.5">
                                    {new Date(n.createdAt).toLocaleString()} · <span className={n.status === 'approved' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>{n.status}</span>
                                </p>
                            </div>
                            <button onClick={() => handleDelete(n)} className="text-gray-400 dark:text-dark-text-muted hover:text-red-600 flex-shrink-0">
                                <Trash2 size={15} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const LiteNotificationsPage = ({ authToken, API_BASE_URL, navigate, onViewAnimal }) => {
    const [tab, setTab] = useState('alerts'); // 'alerts' | 'requests'
    const { count: requestCount } = useUnreadNotifications(authToken, API_BASE_URL);
    const [animals, setAnimals] = useState([]);
    const [litters, setLitters] = useState([]);
    const [enclosures, setEnclosures] = useState([]);
    const [supplies, setSupplies] = useState([]);
    const [generalCareTasks, setGeneralCareTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [busyKey, setBusyKey] = useState(null);

    const fetchAll = useCallback(async () => {
        setLoading(true);
        try {
            const [animalsRes, littersRes, enclosuresRes, suppliesRes, generalTasksRes] = await Promise.allSettled([
                apiClient.get('/animals'),
                apiClient.get('/litters'),
                apiClient.get('/enclosures'),
                apiClient.get('/supplies'),
                apiClient.get('/users/general-tasks'),
            ]);
            const dataOf = (r) => (r.status === 'fulfilled' ? r.value.data : undefined);
            const animalData = Array.isArray(dataOf(animalsRes)) ? dataOf(animalsRes) : [];
            setAnimals(animalData.filter((a) => !a.isViewOnly && !a.archived));
            if (Array.isArray(dataOf(littersRes))) setLitters(dataOf(littersRes));
            if (Array.isArray(dataOf(enclosuresRes))) setEnclosures(dataOf(enclosuresRes));
            if (Array.isArray(dataOf(suppliesRes))) setSupplies(dataOf(suppliesRes));
            if (Array.isArray(dataOf(generalTasksRes)?.generalCareTasks)) setGeneralCareTasks(dataOf(generalTasksRes).generalCareTasks);
        } catch (error) {
            console.error('Failed to fetch notifications data:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    // Quick actions patch local state directly with the same fields just sent to the server,
    // instead of refetching, so the row updates instantly without a round-trip.
    const patchAnimal = (id, fields) => setAnimals((prev) => prev.map((a) => (a.id_public === id ? { ...a, ...fields } : a)));
    const patchLitter = (id, fields) => setLitters((prev) => prev.map((l) => (l._id === id ? { ...l, ...fields } : l)));
    const patchEnclosure = (id, fields) => setEnclosures((prev) => prev.map((e) => (e._id === id ? { ...e, ...fields } : e)));
    const patchSupply = (id, fields) => setSupplies((prev) => prev.map((s) => (s._id === id ? { ...s, ...fields } : s)));

    const viewAnimal = (a) => onViewAnimal && onViewAnimal(a);

    // ---- Feeding ----
    const feedingAlerts = useMemo(() => (
        animals.filter((a) => a.feedingIntervalHours && (!a.lastFedDate || hoursSince(a.lastFedDate) >= a.feedingIntervalHours))
    ), [animals]);
    const markFed = async (animal) => {
        setBusyKey(`feed-${animal.id_public}`);
        try {
            const fields = { lastFedDate: new Date().toISOString() };
            await apiClient.put(`/animals/${animal.id_public}`, fields);
            patchAnimal(animal.id_public, fields);
        } finally { setBusyKey(null); }
    };

    // ---- Care Tasks: custom animalCareTasks list + the 18 grooming/training schedule fields ----
    const careTaskAlerts = useMemo(() => {
        const out = [];
        animals.forEach((a) => {
            (a.animalCareTasks || []).forEach((task, idx) => {
                if (isTaskDue(task.lastDoneDate, task.frequencyDays)) out.push({ kind: 'custom', animal: a, task, idx, label: task.taskName || 'Care Task' });
            });
            SCHEDULE_DEFS.forEach((def) => {
                const field = a[def.key];
                if (field && isTaskDue(field.lastDoneDate, field.frequencyDays)) out.push({ kind: 'schedule', animal: a, key: def.key, label: def.label });
            });
        });
        return out;
    }, [animals]);
    const markTaskDone = async (animal, idx) => {
        setBusyKey(`task-${animal.id_public}-${idx}`);
        try {
            const nextTasks = (animal.animalCareTasks || []).map((t, i) => i === idx ? { ...t, lastDoneDate: new Date().toISOString() } : t);
            await apiClient.put(`/animals/${animal.id_public}`, { animalCareTasks: nextTasks });
            patchAnimal(animal.id_public, { animalCareTasks: nextTasks });
        } finally { setBusyKey(null); }
    };
    const markScheduleDone = async (animal, key) => {
        setBusyKey(`sched-${animal.id_public}-${key}`);
        try {
            const field = { ...(animal[key] || {}), lastDoneDate: new Date().toISOString(), lastSkipped: false };
            await apiClient.put(`/animals/${animal.id_public}`, { [key]: field });
            patchAnimal(animal.id_public, { [key]: field });
        } finally { setBusyKey(null); }
    };

    // ---- Custom Tasks: standalone tasks not tied to any animal/enclosure (PublicProfile.generalCareTasks) ----
    const generalTaskAlerts = useMemo(() => (
        generalCareTasks
            .filter((t) => isTaskDue(t.lastDoneDate, cleaningTaskFreqDays(t)))
            .map((t) => ({
                task: t,
                bucket: t.type === 'Feeding' ? 'feeding' : (t.type === 'Cleaning' || t.type === 'Maintenance') ? 'enclosureCare' : 'careTasks',
            }))
    ), [generalCareTasks]);
    const markGeneralTaskDone = async (task) => {
        setBusyKey(`gtask-${task.id}`);
        try {
            const nextTasks = generalCareTasks.map((t) => t.id === task.id ? { ...t, lastDoneDate: new Date().toISOString(), lastSkipped: false } : t);
            await apiClient.put('/users/general-tasks', { generalCareTasks: nextTasks });
            setGeneralCareTasks(nextTasks);
        } finally { setBusyKey(null); }
    };

    // ---- Health ----
    const healthStatusAlerts = useMemo(() => (
        animals.filter((a) => ['Concern', 'Critical'].includes(remapLegacyHealthStatus(a.healthStatusOverride || a.healthStatus)))
    ), [animals]);
    const quarantineEndedAlerts = useMemo(() => (
        animals.filter((a) => a.quarantineDetails?.status && a.quarantineDetails.status !== 'None' && a.quarantineDetails.endDate && isPastOrToday(a.quarantineDetails.endDate))
    ), [animals]);
    const clearQuarantine = async (animal) => {
        setBusyKey(`quarantine-${animal.id_public}`);
        try {
            const fields = { quarantineDetails: { ...animal.quarantineDetails, status: 'None' } };
            await apiClient.put(`/animals/${animal.id_public}`, fields);
            patchAnimal(animal.id_public, fields);
        } finally { setBusyKey(null); }
    };

    // ---- Enclosure Care: cleaning/maintenance tasks + supply reorders ----
    const cleaningTaskAlerts = useMemo(() => {
        const out = [];
        enclosures.forEach((enc) => {
            (enc.cleaningTasks || []).forEach((task, idx) => {
                if (isTaskDue(task.lastDoneDate, cleaningTaskFreqDays(task))) out.push({ enclosure: enc, task, idx });
            });
        });
        return out;
    }, [enclosures]);
    const supplyAlerts = useMemo(() => {
        const today = new Date(); today.setHours(0, 0, 0, 0);
        return supplies.filter((s) =>
            (s.reorderThreshold != null && s.currentStock <= s.reorderThreshold) ||
            (s.nextOrderDate && parseLocalDate(s.nextOrderDate) <= today)
        );
    }, [supplies]);
    const markCleaningTaskDone = async (enclosure, idx) => {
        setBusyKey(`clean-${enclosure._id}-${idx}`);
        try {
            const nextTasks = (enclosure.cleaningTasks || []).map((t, i) => i === idx ? { ...t, lastDoneDate: new Date().toISOString() } : t);
            await apiClient.patch(`/enclosures/${enclosure._id}`, { cleaningTasks: nextTasks });
            patchEnclosure(enclosure._id, { cleaningTasks: nextTasks });
        } finally { setBusyKey(null); }
    };
    const restockSupply = async (supply, qty) => {
        const n = Number(qty);
        if (!n || n <= 0) return;
        setBusyKey(`supply-${supply._id}`);
        try {
            const patch = { currentStock: (supply.currentStock || 0) + n };
            if (supply.orderFrequency && supply.orderFrequencyUnit) {
                const base = new Date();
                if (supply.orderFrequencyUnit === 'days') base.setDate(base.getDate() + Number(supply.orderFrequency));
                else if (supply.orderFrequencyUnit === 'weeks') base.setDate(base.getDate() + Number(supply.orderFrequency) * 7);
                else base.setMonth(base.getMonth() + Number(supply.orderFrequency));
                patch.nextOrderDate = base.toISOString().split('T')[0];
            }
            await apiClient.patch(`/supplies/${supply._id}`, patch);
            patchSupply(supply._id, patch);
        } finally { setBusyKey(null); }
    };

    // ---- Breeding ----
    const plannedMatingAlerts = useMemo(() => (
        litters.filter((l) => l.isPlanned && !l.pregnancyDate && !l.birthDate && l.matingDate && isPastOrToday(l.matingDate))
    ), [litters]);
    const dueDateAlerts = useMemo(() => (
        litters.filter((l) => l.pregnancyDate && !l.birthDate && l.expectedDueDate && isPastOrToday(l.expectedDueDate))
    ), [litters]);
    const weaningCheckAlerts = useMemo(() => (
        litters.filter((l) => l.birthDate && l.weaningDate && !l.weaningConfirmed && !l.pregnancyLost && isPastOrToday(l.weaningDate))
    ), [litters]);
    const markMated = async (litter) => {
        setBusyKey(`mate-${litter._id}`);
        try {
            const fields = { matingDate: new Date().toISOString(), isPlanned: false };
            await apiClient.put(`/litters/${litter._id}`, fields);
            patchLitter(litter._id, fields);
        } finally { setBusyKey(null); }
    };
    const markBornToday = async (litter) => {
        setBusyKey(`born-${litter._id}`);
        try {
            const fields = { birthDate: new Date().toISOString() };
            await Promise.all([
                apiClient.put(`/litters/${litter._id}`, fields),
                litter.damId_public
                    ? apiClient.put(`/animals/${litter.damId_public}`, { isPregnant: false, isNursing: true })
                    : Promise.resolve(),
            ]);
            patchLitter(litter._id, fields);
        } finally { setBusyKey(null); }
    };
    const markWeanedToday = async (litter) => {
        setBusyKey(`wean-${litter._id}`);
        try {
            const fields = { weaningDate: new Date().toISOString(), weaningConfirmed: true };
            await Promise.all([
                apiClient.put(`/litters/${litter._id}`, fields),
                litter.damId_public
                    ? apiClient.put(`/animals/${litter.damId_public}`, { isNursing: false })
                    : Promise.resolve(),
            ]);
            patchLitter(litter._id, fields);
        } finally { setBusyKey(null); }
    };

    const generalFeedingAlerts = useMemo(() => generalTaskAlerts.filter((t) => t.bucket === 'feeding'), [generalTaskAlerts]);
    const generalCareTaskAlerts = useMemo(() => generalTaskAlerts.filter((t) => t.bucket === 'careTasks'), [generalTaskAlerts]);
    const generalEnclosureAlerts = useMemo(() => generalTaskAlerts.filter((t) => t.bucket === 'enclosureCare'), [generalTaskAlerts]);

    const totalCount = feedingAlerts.length + careTaskAlerts.length + healthStatusAlerts.length + quarantineEndedAlerts.length
        + cleaningTaskAlerts.length + supplyAlerts.length + plannedMatingAlerts.length + dueDateAlerts.length + weaningCheckAlerts.length
        + generalTaskAlerts.length;

    return (
        <div className="w-full max-w-2xl mx-auto">
            <div className="flex items-center gap-2 mb-3">
                <button onClick={() => navigate(-1)} className="p-1.5 -ml-1.5 rounded-lg text-gray-600 dark:text-dark-text-secondary hover:bg-white/50 dark:hover:bg-dark-surface-hover">
                    <ArrowLeft size={20} />
                </button>
                <h1 className="text-xl font-bold text-gray-800 dark:text-dark-text">Notifications</h1>
            </div>
            <div className="flex gap-1">
                {[
                    { key: 'alerts', label: 'Care Alerts', count: totalCount },
                    { key: 'requests', label: 'Requests', count: requestCount },
                ].map(({ key, label, count }) => (
                    <button
                        key={key}
                        onClick={() => setTab(key)}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition ${
                            tab === key ? 'bg-accent dark:bg-dark-accent text-white' : 'bg-white dark:bg-dark-card-bg text-gray-500 dark:text-dark-text-muted'
                        }`}
                    >
                        {label}
                        {count > 0 && (
                            <span className={`text-[10px] font-bold rounded-full px-1.5 py-0.5 ${tab === key ? 'bg-white/25 text-white' : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'}`}>
                                {count}
                            </span>
                        )}
                    </button>
                ))}
            </div>
            <div className="pt-3 pb-8 space-y-5">
                {tab === 'requests' ? (
                    <RequestsTab onViewAnimal={viewAnimal} />
                ) : loading ? (
                    <div className="flex justify-center py-16"><Loader2 className="animate-spin text-accent" size={28} /></div>
                ) : (
                    <>
                        <CategorySection icon={<Utensils size={14} className="text-gray-400 dark:text-dark-text-muted" />} title="Feeding" count={feedingAlerts.length + generalFeedingAlerts.length}>
                            <div className="space-y-2">
                                {feedingAlerts.map((a) => (
                                    <AlertRow
                                        key={a.id_public}
                                        title={animalName(a)}
                                        subtitle={a.lastFedDate ? `Last fed ${new Date(a.lastFedDate).toLocaleDateString()}` : 'Never fed'}
                                        onView={() => viewAnimal(a)}
                                        actionLabel="Mark Fed"
                                        onAction={() => markFed(a)}
                                        busy={busyKey === `feed-${a.id_public}`}
                                    />
                                ))}
                                {generalFeedingAlerts.map(({ task }) => (
                                    <AlertRow
                                        key={`gtask-${task.id}`}
                                        title={task.taskName}
                                        subtitle="Custom task"
                                        actionLabel="Mark Done"
                                        onAction={() => markGeneralTaskDone(task)}
                                        busy={busyKey === `gtask-${task.id}`}
                                    />
                                ))}
                            </div>
                        </CategorySection>

                        <CategorySection icon={<ClipboardList size={14} className="text-gray-400 dark:text-dark-text-muted" />} title="Care Tasks" count={careTaskAlerts.length + generalCareTaskAlerts.length}>
                            <div className="space-y-2">
                                {careTaskAlerts.map((item) => (
                                    <AlertRow
                                        key={item.kind === 'custom' ? `custom-${item.animal.id_public}-${item.idx}` : `sched-${item.animal.id_public}-${item.key}`}
                                        title={item.label}
                                        subtitle={animalName(item.animal)}
                                        onView={() => viewAnimal(item.animal)}
                                        actionLabel="Mark Done"
                                        onAction={() => item.kind === 'custom' ? markTaskDone(item.animal, item.idx) : markScheduleDone(item.animal, item.key)}
                                        busy={busyKey === (item.kind === 'custom' ? `task-${item.animal.id_public}-${item.idx}` : `sched-${item.animal.id_public}-${item.key}`)}
                                    />
                                ))}
                                {generalCareTaskAlerts.map(({ task }) => (
                                    <AlertRow
                                        key={`gtask-${task.id}`}
                                        title={task.taskName}
                                        subtitle="Custom task"
                                        actionLabel="Mark Done"
                                        onAction={() => markGeneralTaskDone(task)}
                                        busy={busyKey === `gtask-${task.id}`}
                                    />
                                ))}
                            </div>
                        </CategorySection>

                        <CategorySection icon={<HeartPulse size={14} className="text-gray-400 dark:text-dark-text-muted" />} title="Health" count={healthStatusAlerts.length + quarantineEndedAlerts.length}>
                            <div className="space-y-2">
                                {healthStatusAlerts.map((a) => (
                                    <AlertRow
                                        key={`hs-${a.id_public}`}
                                        title={animalName(a)}
                                        subtitle={`Health status: ${a.healthStatusOverride || a.healthStatus}`}
                                        onView={() => viewAnimal(a)}
                                    />
                                ))}
                                {quarantineEndedAlerts.map((a) => (
                                    <AlertRow
                                        key={`q-${a.id_public}`}
                                        title={animalName(a)}
                                        subtitle="Quarantine/isolation end date has passed — review status"
                                        onView={() => viewAnimal(a)}
                                        actionLabel="Clear"
                                        onAction={() => clearQuarantine(a)}
                                        busy={busyKey === `quarantine-${a.id_public}`}
                                    />
                                ))}
                            </div>
                        </CategorySection>

                        <CategorySection icon={<Home size={14} className="text-gray-400 dark:text-dark-text-muted" />} title="Enclosure Care" count={cleaningTaskAlerts.length + supplyAlerts.length + generalEnclosureAlerts.length}>
                            <div className="space-y-2">
                                {cleaningTaskAlerts.map(({ enclosure, task, idx }) => (
                                    <AlertRow
                                        key={`clean-${enclosure._id}-${idx}`}
                                        title={task.taskName || task.type || 'Cleaning Task'}
                                        subtitle={enclosure.name}
                                        onView={() => navigate('/enclosures')}
                                        actionLabel="Mark Done"
                                        onAction={() => markCleaningTaskDone(enclosure, idx)}
                                        busy={busyKey === `clean-${enclosure._id}-${idx}`}
                                    />
                                ))}
                                {generalEnclosureAlerts.map(({ task }) => (
                                    <AlertRow
                                        key={`gtask-${task.id}`}
                                        title={task.taskName}
                                        subtitle="Custom task"
                                        actionLabel="Mark Done"
                                        onAction={() => markGeneralTaskDone(task)}
                                        busy={busyKey === `gtask-${task.id}`}
                                    />
                                ))}
                                {supplyAlerts.map((s) => (
                                    <SupplyAlertRow
                                        key={`supply-${s._id}`}
                                        supply={s}
                                        onRestock={(qty) => restockSupply(s, qty)}
                                        busy={busyKey === `supply-${s._id}`}
                                    />
                                ))}
                            </div>
                        </CategorySection>

                        <CategorySection icon={<Baby size={14} className="text-gray-400 dark:text-dark-text-muted" />} title="Breeding" count={plannedMatingAlerts.length + dueDateAlerts.length + weaningCheckAlerts.length}>
                            <div className="space-y-2">
                                {plannedMatingAlerts.map((l) => (
                                    <AlertRow
                                        key={`mate-${l._id}`}
                                        title={l.breedingPairCodeName || l.litter_id_public || 'Planned Mating'}
                                        subtitle="Planned mating date has arrived"
                                        onView={() => navigate('/litters')}
                                        actionLabel="Mark Mated"
                                        onAction={() => markMated(l)}
                                        busy={busyKey === `mate-${l._id}`}
                                    />
                                ))}
                                {dueDateAlerts.map((l) => (
                                    <AlertRow
                                        key={`due-${l._id}`}
                                        title={l.breedingPairCodeName || l.litter_id_public || 'Litter'}
                                        subtitle="Expected due date has arrived"
                                        onView={() => navigate('/litters')}
                                        actionLabel="Born Today"
                                        onAction={() => markBornToday(l)}
                                        busy={busyKey === `born-${l._id}`}
                                    />
                                ))}
                                {weaningCheckAlerts.map((l) => (
                                    <AlertRow
                                        key={`wean-${l._id}`}
                                        title={l.breedingPairCodeName || l.litter_id_public || 'Litter'}
                                        subtitle="Expected weaning date has arrived"
                                        onView={() => navigate('/litters')}
                                        actionLabel="Wean Today"
                                        onAction={() => markWeanedToday(l)}
                                        busy={busyKey === `wean-${l._id}`}
                                    />
                                ))}
                            </div>
                        </CategorySection>
                    </>
                )}
            </div>
        </div>
    );
};

export default LiteNotificationsPage;
