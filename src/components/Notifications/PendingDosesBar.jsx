import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Pill, Check, Clock, SkipForward } from 'lucide-react';
import apiClient from '../../utils/apiClient';

// Shows medication doses waiting on the owner with Given / Snooze / Skip actions (the in-app side of
// the dose reminders pushed by the backend's utils/doseReminders.js). Also records the browser's
// time zone once so doses are scheduled at the owner's local time. Renders nothing when there is
// nothing pending.
const POLL_MS = 60000;

const formatTime = (value) => {
    const d = new Date(value);
    return isNaN(d.getTime()) ? '' : d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
};

const PendingDosesBar = ({ authToken }) => {
    const [doses, setDoses] = useState([]);
    const [maxSnoozes, setMaxSnoozes] = useState(3);
    const [busyId, setBusyId] = useState(null);
    const [error, setError] = useState('');
    const [snoozeMinutes, setSnoozeMinutes] = useState(30);

    const load = useCallback(async () => {
        if (!authToken) return;
        try {
            const res = await apiClient.get('/medication-doses/pending');
            setDoses(Array.isArray(res.data?.doses) ? res.data.doses : []);
            if (res.data?.maxSnoozes) setMaxSnoozes(res.data.maxSnoozes);
        } catch (err) {
            // Best effort: the banner is a convenience on top of push notifications.
        }
    }, [authToken]);

    // Record the device time zone once per session, and pick up the user's preferred snooze length.
    useEffect(() => {
        if (!authToken) return;
        apiClient.get('/medication-doses/settings').then((res) => {
            if (res.data?.snoozeMinutes) setSnoozeMinutes(res.data.snoozeMinutes);
            const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            if (zone && zone !== res.data?.timeZone) {
                apiClient.put('/medication-doses/settings', { timeZone: zone }).catch(() => {});
            }
        }).catch(() => {});
    }, [authToken]);

    useEffect(() => {
        load();
        if (!authToken) return undefined;
        const timer = setInterval(load, POLL_MS);
        const onFocus = () => load();
        window.addEventListener('focus', onFocus);
        return () => { clearInterval(timer); window.removeEventListener('focus', onFocus); };
    }, [authToken, load]);

    const act = async (dose, action) => {
        setBusyId(dose.id);
        setError('');
        try {
            if (action === 'snooze') await apiClient.post(`/medication-doses/${dose.id}/snooze`, { minutes: snoozeMinutes });
            else await apiClient.post(`/medication-doses/${dose.id}/${action}`);
            if (action === 'given') window.dispatchEvent(new CustomEvent('medication-dose-updated', { detail: { id: dose.id } }));
            await load();
        } catch (err) {
            setError(err.response?.data?.message || 'That did not work. Please try again.');
            await load();
        } finally {
            setBusyId(null);
        }
    };

    if (!doses.length) return null;
    const now = Date.now();
    const btn = 'inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium disabled:opacity-50';
    const neutral = `${btn} bg-gray-200 dark:bg-dark-surface text-gray-800 dark:text-dark-text hover:bg-gray-300`;

    // A snoozed dose stays in the list (dimmed) so it can still be marked given early.
    return (
        <div className="bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-700 px-3 py-2" role="region" aria-label="Medication doses due">
            <div className="max-w-5xl mx-auto space-y-1.5">
                {doses.map((dose) => {
                    const snoozed = dose.snoozedUntil && new Date(dose.snoozedUntil).getTime() > now;
                    const canSnooze = (dose.snoozeCount || 0) < maxSnoozes;
                    const busy = busyId === dose.id;
                    return (
                        <div key={dose.id} className={`flex flex-wrap items-center gap-2 text-sm ${snoozed ? 'opacity-70' : ''}`}>
                            <Pill size={16} className="text-amber-600 dark:text-amber-400 flex-shrink-0" />
                            <span className="flex-1 min-w-[12rem] text-gray-800 dark:text-dark-text">
                                <Link to="/animals?view=health" className="font-semibold hover:underline">{dose.animalName || 'Animal'}</Link>
                                {': '}{dose.medicationName || 'Medication'}{dose.dose ? ` (${dose.dose})` : ''}
                                <span className="text-gray-500 dark:text-dark-text-muted">
                                    {' '}due {formatTime(dose.scheduledAt)}
                                    {snoozed ? `, snoozed until ${formatTime(dose.snoozedUntil)}` : ''}
                                </span>
                            </span>
                            <button type="button" disabled={busy} onClick={() => act(dose, 'given')}
                                className={`${btn} bg-emerald-600 text-white hover:bg-emerald-700`}>
                                <Check size={14} /> Given
                            </button>
                            <button type="button" disabled={busy || !canSnooze} onClick={() => act(dose, 'snooze')}
                                title={canSnooze ? `Remind me again in ${snoozeMinutes} minutes` : 'Snooze limit reached'}
                                className={neutral}>
                                <Clock size={14} /> Snooze {snoozeMinutes}m
                            </button>
                            <button type="button" disabled={busy} onClick={() => act(dose, 'skip')} className={neutral}>
                                <SkipForward size={14} /> Skip
                            </button>
                        </div>
                    );
                })}
                {error && <p className="text-xs text-red-600 dark:text-red-400" role="alert">{error}</p>}
            </div>
        </div>
    );
};

export default PendingDosesBar;
