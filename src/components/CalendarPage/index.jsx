import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Calendar, ChevronLeft, ChevronRight, Search, X,
    CalendarPlus, Hourglass, BellRing, Cake, Rainbow,
    PartyPopper, UtensilsCrossed, Wrench, HandCoins, Package, Bell
} from 'lucide-react';

const CalendarPage = ({ authToken, API_BASE_URL }) => {
    const [calendarMonth, setCalendarMonth] = useState(() => { const d = new Date(); d.setDate(1); return d; });
    const [calendarTooltip, setCalendarTooltip] = useState(null);
    const [calendarQuery, setCalendarQuery] = useState('');

    const [calendarEventFilters, setCalendarEventFilters] = useState({
        planned: true, mated: true, due: true, born: true, weaned: true,
        birthday: true, feeding: true, maintenance: true, caretask: true, supply: true, milestone: true,
    });

    const [litters, setLitters] = useState([]);
    const [animals, setAnimals] = useState([]);
    const [supplies, setSupplies] = useState([]);
    const [enclosures, setEnclosures] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authToken) return;
        const headers = { Authorization: `Bearer ${authToken}` };
        setLoading(true);
        Promise.all([
            axios.get(`${API_BASE_URL}/litters`, { headers }),
            axios.get(`${API_BASE_URL}/animals?isOwned=true`, { headers }),
            axios.get(`${API_BASE_URL}/supplies`, { headers }),
            axios.get(`${API_BASE_URL}/enclosures`, { headers }),
        ]).then(([l, a, s, e]) => {
            setLitters(Array.isArray(l.data) ? l.data : []);
            setAnimals(Array.isArray(a.data) ? a.data : []);
            setSupplies(Array.isArray(s.data) ? s.data : []);
            setEnclosures(Array.isArray(e.data) ? e.data : []);
        }).catch(() => {}).finally(() => setLoading(false));
    }, [authToken, API_BASE_URL]);

    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;

    const localeFirstDay = (() => {
        try {
            const loc = new Intl.Locale(navigator.language || 'en-US');
            const fw = loc.weekInfo?.firstDay ?? (loc.getWeekInfo?.()?.firstDay ?? 7);
            return fw % 7;
        } catch(e) { return 0; }
    })();

    const typeStyles = {
        planned:     { bg: 'bg-indigo-100 hover:bg-indigo-200 text-indigo-800 border border-dashed border-indigo-400', dot: 'bg-indigo-400', label: 'Planned Mating', Icon: CalendarPlus },
        mated:       { bg: 'bg-purple-100 hover:bg-purple-200 text-purple-800 border border-purple-300', dot: 'bg-purple-400', label: 'Mated', Icon: Hourglass },
        due:         { bg: 'bg-amber-100 hover:bg-amber-200 text-amber-800 border border-amber-300', dot: 'bg-amber-400', label: 'Due', Icon: BellRing },
        born:        { bg: 'bg-green-100 hover:bg-green-200 text-green-800 border border-green-500', dot: 'bg-green-500', label: 'Born', Icon: Cake },
        weaned:      { bg: 'bg-sky-100 hover:bg-sky-200 text-sky-800 border border-sky-300', dot: 'bg-sky-400', label: 'Weaned', Icon: Rainbow },
        birthday:    { bg: 'bg-pink-100 hover:bg-pink-200 text-pink-800 border border-pink-300', dot: 'bg-pink-400', label: 'Birthdate', Icon: PartyPopper },
        feeding:     { bg: 'bg-orange-100 hover:bg-orange-200 text-orange-800 border border-orange-300', dot: 'bg-orange-400', label: 'Feeding Due', Icon: UtensilsCrossed },
        maintenance: { bg: 'bg-yellow-100 hover:bg-yellow-200 text-yellow-800 border border-yellow-400', dot: 'bg-yellow-400', label: 'Maintenance', Icon: Wrench },
        caretask:    { bg: 'bg-teal-100 hover:bg-teal-200 text-teal-800 border border-teal-300', dot: 'bg-teal-400', label: 'Care Task', Icon: HandCoins },
        supply:      { bg: 'bg-red-100 hover:bg-red-200 text-red-800 border border-red-300', dot: 'bg-red-400', label: 'Supply Order', Icon: Package },
        milestone:   { bg: 'bg-lime-100 hover:bg-lime-200 text-lime-800 border border-lime-300', dot: 'bg-lime-400', label: 'Milestone', Icon: Bell },
    };

    const fmtD = (v) => {
        if (!v) return null;
        try { const d = new Date(v); if (isNaN(d)) return null; return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }); } catch(e) { return null; }
    };
    const getAnimalDisplayName = (a) => [a.prefix, a.name, a.suffix].filter(Boolean).join(' ') || a.id_public || 'Unknown';
    const getParentDisplayName = (parentObj, parentIdPublic) => {
        if (parentObj && (parentObj.prefix || parentObj.name || parentObj.suffix)) {
            return [parentObj.prefix, parentObj.name, parentObj.suffix].filter(Boolean).join(' ');
        }
        return parentObj?.name || parentIdPublic || '?';
    };
    const getPairDisplayForPill = (litter) => {
        if (litter?.breedingPairCodeName) return litter.breedingPairCodeName;
        const sireName = getParentDisplayName(litter?.sire, litter?.sireId_public);
        const damName = getParentDisplayName(litter?.dam, litter?.damId_public);
        return `${sireName} × ${damName}`;
    };
    const getAgeShort = (birthDate) => {
        if (!birthDate) return null;
        const born = new Date(String(birthDate).substring(0, 10) + 'T00:00:00');
        if (isNaN(born)) return null;
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        const ageDays = Math.max(0, Math.round((now - born) / 86400000));
        const years = Math.floor(ageDays / 365);
        const months = Math.floor((ageDays % 365) / 30);
        if (years > 0) return `${years}y`;
        return null;
    };
    const getDueStatusText = (expectedDueDate) => {
        if (!expectedDueDate) return 'Due';
        const due = new Date(expectedDueDate);
        if (isNaN(due)) return 'Due';
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        due.setHours(0, 0, 0, 0);
        const diff = Math.round((due - now) / 86400000);
        if (diff > 0) return `Due in ${diff}d`;
        if (diff === 0) return 'Due today';
        return `${Math.abs(diff)}d overdue`;
    };
    const getLitterName = (l) => l.breedingPairCodeName || l.litter_id_public || 'Unnamed Litter';
    const getSireDam = (l) => `${getParentDisplayName(l.sire, l.sireId_public)} · ${getParentDisplayName(l.dam, l.damId_public)}`;
    const nextDueDate = (lastDate, freqDays) => {
        if (!freqDays) return null;
        const base = lastDate ? new Date(lastDate.substring(0,10) + 'T00:00:00') : new Date();
        if (isNaN(base.getTime())) return null;
        const next = new Date(base);
        next.setDate(next.getDate() + Number(freqDays));
        return `${next.getFullYear()}-${String(next.getMonth()+1).padStart(2,'0')}-${String(next.getDate()).padStart(2,'0')}`;
    };

    const getEventIcon = (type, size = 12, className = '') => {
        const IconComp = typeStyles[type]?.Icon;
        return IconComp ? <IconComp size={size} className={className} /> : null;
    };

    // Build event map
    const eventMap = {};
    const q = calendarQuery.trim().toLowerCase();

    const addLitterEvent = (dateVal, type, litter) => {
        if (!dateVal || !calendarEventFilters[type]) return;
        try {
            const s = typeof dateVal === 'string' ? dateVal.substring(0,10) : null;
            const d = s ? new Date(s + 'T00:00:00') : new Date(dateVal);
            if (isNaN(d.getTime())) return;
            const k = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
            if (!eventMap[k]) eventMap[k] = [];
            if (eventMap[k].some(e => e.litter?._id === litter._id && e.type === type)) return;
            eventMap[k].push({ type, litter });
        } catch(e) {}
    };

    const addAnimalEvent = (dateVal, type, animal) => {
        if (!dateVal || !calendarEventFilters[type]) return;
        try {
            const s = typeof dateVal === 'string' ? dateVal.substring(0,10) : null;
            let d = s ? new Date(s + 'T00:00:00') : new Date(dateVal);
            if (isNaN(d.getTime())) return;
            // For birthdays, show the anniversary in the current viewed year/month
            if (type === 'birthday') {
                d = new Date(year, d.getMonth(), d.getDate());
            }
            const k = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
            if (!eventMap[k]) eventMap[k] = [];
            if (eventMap[k].some(e => e.animal?._id === animal._id && e.type === type)) return;
            eventMap[k].push({ type, animal });
        } catch(e) {}
    };

    // Litter events — planned litters get their own 'planned' type
    const filteredLitters = litters.filter(l => {
        if (!q) return true;
        return [l.breedingPairCodeName, l.litter_id_public,
            getParentDisplayName(l.sire, l.sireId_public),
            getParentDisplayName(l.dam, l.damId_public)]
            .filter(Boolean).join(' ').toLowerCase().includes(q);
    });
    filteredLitters.forEach(l => {
        if (l.isPlanned) {
            if (l.matingDate) {
                // Mated but not yet a full litter: show mated on matingDate + due on expectedDueDate
                addLitterEvent(l.matingDate, 'mated', l);
                addLitterEvent(l.expectedDueDate, 'due', l);
            } else {
                // Planned mating only: show under 'planned' using expectedDueDate
                const dateToShow = l.expectedDueDate;
                addLitterEvent(dateToShow, 'planned', l);
            }
        } else {
            addLitterEvent(l.matingDate, 'mated', l);
            addLitterEvent(l.expectedDueDate, 'due', l);
            addLitterEvent(l.birthDate, 'born', l);
            addLitterEvent(l.weaningDate, 'weaned', l);
        }
    });

    // Animal events
    animals.forEach(a => {
        addAnimalEvent(a.birthDate, 'birthday', a);
        const feedNext = nextDueDate(a.lastFedDate, a.feedingFrequencyDays);
        if (feedNext) addAnimalEvent(feedNext, 'feeding', {
            ...a,
            _calLabel: a.name || a.id_public,
            _calDetail: `Feed every ${a.feedingFrequencyDays}d`,
            _calFeedType: a.dietType || '',
        });
        const maintNext = nextDueDate(a.lastMaintenanceDate, a.maintenanceFrequencyDays);
        if (maintNext) addAnimalEvent(maintNext, 'maintenance', { ...a, _calLabel: a.name || a.id_public, _calDetail: `Maintenance every ${a.maintenanceFrequencyDays}d` });
        (a.careTasks || []).forEach(t => {
            const dn = nextDueDate(t.lastDoneDate, t.frequencyDays);
            if (dn) addAnimalEvent(dn, 'caretask', {
                ...a,
                _calLabel: t.taskName || t.name || 'Enclosure Task',
                _calDetail: a.name || a.id_public,
                _calSubject: '',
            });
        });
        (a.animalCareTasks || []).forEach(t => {
            const dn = nextDueDate(t.lastDoneDate, t.frequencyDays);
            if (dn) addAnimalEvent(dn, 'caretask', {
                ...a,
                _calLabel: t.taskName || t.name || 'Animal Task',
                _calDetail: a.name || a.id_public,
                _calSubject: '',
            });
        });
    });

    // Enclosure cleaning tasks
    enclosures.forEach(enc => {
        (enc.cleaningTasks || []).forEach(t => {
            const dn = nextDueDate(t.lastDoneDate, t.frequencyDays);
            if (dn && calendarEventFilters.caretask) {
                if (!eventMap[dn]) eventMap[dn] = [];
                eventMap[dn].push({
                    type: 'caretask',
                    animal: {
                        _id: enc._id,
                        _calLabel: t.taskName || t.name || 'Cleaning Task',
                        _calDetail: enc.name || 'Enclosure',
                        _calSubject: enc.name || 'Enclosure',
                        _calAnimalName: 'Enclosure',
                        id_public: enc._id,
                    },
                });
            }
        });
    });

    // Supplies
    supplies.forEach(s => {
        if (s.nextOrderDate) addAnimalEvent(s.nextOrderDate.substring(0,10), 'supply', {
            _id: s._id,
            _calLabel: s.name || 'Supply',
            _calDetail: s.category || '',
            _calAmount: s.reorderThreshold,
            _calUnit: s.unit,
            id_public: s._id,
        });
    });

    // Animal milestones
    if (calendarEventFilters.milestone) {
        animals.forEach(a => {
            (a.milestones || []).forEach(m => {
                if (!m.startDate || !m.label) return;
                try {
                    const start = new Date(String(m.startDate).substring(0, 10) + 'T00:00:00');
                    if (isNaN(start.getTime())) return;
                    const animalName = getAnimalDisplayName(a);
                    if (m.interval && m.intervalUnit) {
                        // Recurring: find occurrences that land in viewed month
                        const intervalMs = (() => {
                            const n = Number(m.interval);
                            if (m.intervalUnit === 'day')   return n * 86400000;
                            if (m.intervalUnit === 'week')  return n * 7 * 86400000;
                            if (m.intervalUnit === 'month') return null; // handle separately
                            if (m.intervalUnit === 'year')  return null; // handle separately
                            return null;
                        })();
                        if (intervalMs) {
                            // Fast path for day/week intervals
                            const mStart = new Date(year, month, 1);
                            const mEnd = new Date(year, month + 1, 0);
                            let cur = new Date(start);
                            // advance to first occurrence on or after start of month
                            if (cur < mStart) {
                                const steps = Math.ceil((mStart - cur) / intervalMs);
                                cur = new Date(cur.getTime() + steps * intervalMs);
                            }
                            while (cur <= mEnd) {
                                const k = `${cur.getFullYear()}-${String(cur.getMonth()+1).padStart(2,'0')}-${String(cur.getDate()).padStart(2,'0')}`;
                                if (!eventMap[k]) eventMap[k] = [];
                                eventMap[k].push({ type: 'milestone', animal: { ...a, _calLabel: m.label, _calDetail: animalName, _milestoneInterval: m.interval, _milestoneUnit: m.intervalUnit } });
                                cur = new Date(cur.getTime() + intervalMs);
                            }
                        } else {
                            // Month/year intervals
                            const n = Number(m.interval);
                            let cur = new Date(start);
                            while (cur.getFullYear() < year || (cur.getFullYear() === year && cur.getMonth() <= month)) {
                                if (cur.getFullYear() === year && cur.getMonth() === month) {
                                    const k = `${cur.getFullYear()}-${String(cur.getMonth()+1).padStart(2,'0')}-${String(cur.getDate()).padStart(2,'0')}`;
                                    if (!eventMap[k]) eventMap[k] = [];
                                    eventMap[k].push({ type: 'milestone', animal: { ...a, _calLabel: m.label, _calDetail: animalName, _milestoneInterval: m.interval, _milestoneUnit: m.intervalUnit } });
                                }
                                const nextMonth = cur.getMonth() + (m.intervalUnit === 'year' ? n * 12 : n);
                                cur = new Date(cur.getFullYear(), nextMonth, cur.getDate());
                                if (cur.getFullYear() > year + 1) break; // safety guard
                            }
                        }
                    } else {
                        // One-time: only show in the exact month/year
                        if (start.getFullYear() === year && start.getMonth() === month) {
                            const k = `${start.getFullYear()}-${String(start.getMonth()+1).padStart(2,'0')}-${String(start.getDate()).padStart(2,'0')}`;
                            if (!eventMap[k]) eventMap[k] = [];
                            eventMap[k].push({ type: 'milestone', animal: { ...a, _calLabel: m.label, _calDetail: animalName } });
                        }
                    }
                } catch(e) {}
            });
        });
    }

    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month + 1, 0);
    const monthEventList = Object.entries(eventMap)
        .flatMap(([dateKey, events]) => events.map(ev => ({ dateKey, ...ev })))
        .filter(ev => { const d = new Date(`${ev.dateKey}T00:00:00`); return d >= monthStart && d <= monthEnd; })
        .sort((a, b) => {
            if (a.dateKey < b.dateKey) return -1;
            if (a.dateKey > b.dateKey) return 1;
            const order = { planned: 0, mated: 1, due: 2, born: 3, weaned: 4, birthday: 5, feeding: 6, maintenance: 7, caretask: 8, supply: 9, milestone: 10 };
            return (order[a.type] ?? 99) - (order[b.type] ?? 99);
        });

    const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    const allDayAbbr = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    const dayNames = [...allDayAbbr.slice(localeFirstDay), ...allDayAbbr.slice(0, localeFirstDay)];
    const isWeekendCol = dayNames.map(d => d === 'Sun' || d === 'Sat');
    const rawFirstDay = new Date(year, month, 1).getDay();
    const firstDayOffset = (rawFirstDay - localeFirstDay + 7) % 7;
    const cells = [];
    for (let i = 0; i < firstDayOffset; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    while (cells.length % 7 !== 0) cells.push(null);

    // Returns { bold, rest } — bold is the primary name, rest is the descriptor
    const getPillParts = (ev) => {
        if (ev.animal) {
            const a = ev.animal;
            const animalName = a._calAnimalName || getAnimalDisplayName(a);
            if (ev.type === 'birthday') {
                const birthYear = new Date(String(a.birthDate).substring(0,10) + 'T00:00:00').getFullYear();
                const turning = year - birthYear;
                return { prefix: 'Birthdate:', bold: animalName, rest: turning > 0 ? `${turning} ${turning === 1 ? 'year' : 'years'}` : '', restBold: true };
            }
            if (ev.type === 'feeding') {
                const feedType = (a._calFeedType || '').trim();
                return { prefix: 'Feed:', bold: animalName, rest: feedType };
            }
            if (ev.type === 'maintenance') return { prefix: 'Maintenance:', bold: animalName, rest: '' };
            if (ev.type === 'caretask') {
                const taskName = a._calLabel || 'Task';
                const subject = (a._calSubject || '').trim();
                return { prefix: 'Task:', bold: animalName, rest: subject ? `${taskName} · ${subject}` : taskName };
            }
            if (ev.type === 'supply') {
                const amount = (a._calAmount != null && a._calAmount !== '')
                    ? `${a._calAmount}${a._calUnit ? ` ${a._calUnit}` : ''}`
                    : '';
                return { prefix: 'Order:', bold: a._calLabel || 'Supply', rest: amount };
            }
            if (ev.type === 'milestone') {
                return { prefix: 'Milestone:', bold: a._calLabel || 'Milestone', rest: a._calDetail || '' };
            }
            return { bold: getAnimalDisplayName(a), rest: '' };
        }
        const l = ev.litter;
        const pairBase = getPairDisplayForPill(l);
        const codeName = l?.breedingPairCodeName;
        if (ev.type === 'planned') return { prefix: 'Mate:', bold: pairBase, rest: '' };
        if (ev.type === 'mated') return { prefix: 'Mated:', bold: pairBase, rest: '' };
        if (ev.type === 'due') {
            let dueText;
            if (l.birthDate && l.expectedDueDate) {
                const due = new Date(l.expectedDueDate); due.setHours(0,0,0,0);
                const born = new Date(l.birthDate); born.setHours(0,0,0,0);
                const diff = Math.round((born - due) / 86400000);
                dueText = diff > 0 ? `${diff}d overdue` : diff === 0 ? 'On time' : `${Math.abs(diff)}d early`;
            } else {
                dueText = getDueStatusText(l.expectedDueDate);
            }
            if (codeName) return { prefix: 'Birth:', bold: codeName, rest: dueText };
            return { prefix: 'Birth:', bold: pairBase, rest: dueText };
        }
        if (ev.type === 'born') {
            const total = l.litterSizeBorn ?? l.numberBorn ?? 0;
            return { bold: codeName || pairBase, rest: `${total} born` };
        }
        if (ev.type === 'weaned') {
            const total = l.litterSizeWeaned ?? l.numberWeaned ?? (l.litterSizeBorn ?? l.numberBorn ?? 0);
            const wd = l.weaningDate ? new Date(l.weaningDate) : null;
            const now = new Date();
            now.setHours(0, 0, 0, 0);
            let weanedPastOrToday = false;
            if (wd && !isNaN(wd)) { wd.setHours(0, 0, 0, 0); weanedPastOrToday = wd <= now; }
            const verb = weanedPastOrToday ? 'weaned' : 'to wean';
            return { prefix: 'Wean:', bold: codeName || pairBase, rest: `${total} ${verb}` };
        }
        return { bold: pairBase, rest: '' };
    };
    const PillLabel = ({ ev }) => {
        const { prefix, bold, rest, restBold } = getPillParts(ev);
        return <div><div>{prefix && <span className="font-normal">{prefix} </span>}<span className="font-bold">{bold}</span></div>{rest && <div className={restBold ? 'font-bold' : 'font-normal'}>{rest}</div>}</div>;
    };

    const TooltipRow = ({ label, value }) => value ? (
        <div className="flex gap-2 text-sm"><span className="text-gray-500 w-36 flex-shrink-0">{label}</span><span className="text-gray-800 font-medium">{value}</span></div>
    ) : null;

    return (
        <div className="w-full max-w-7xl bg-white p-3 sm:p-6 rounded-xl shadow-lg">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-3 mb-4">
                <h2 className="text-xl sm:text-3xl font-bold text-gray-800 flex items-center">
                    <Calendar className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 text-primary-dark" />
                    Calendar
                </h2>
            </div>

            {/* Calendar widget */}
            <div className="bg-white rounded-xl border-2 border-gray-200 shadow-sm overflow-hidden">
                {/* Month Navigation */}
                <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
                    <button onClick={() => setCalendarMonth(new Date(year, month - 1, 1))} className="p-1.5 rounded-lg hover:bg-gray-200 transition">
                        <ChevronLeft size={20} className="text-gray-600" />
                    </button>
                    <h3 className="text-lg font-bold text-gray-800">{monthNames[month]} {year}</h3>
                    <button onClick={() => setCalendarMonth(new Date(year, month + 1, 1))} className="p-1.5 rounded-lg hover:bg-gray-200 transition">
                        <ChevronRight size={20} className="text-gray-600" />
                    </button>
                </div>

                {/* Filters */}
                <div className="px-4 py-3 bg-white border-b border-gray-200 space-y-3">
                    <div className="flex flex-col md:flex-row md:items-center gap-2">
                        <div className="flex items-center gap-2 w-full md:w-auto">
                            <Search size={14} className="text-gray-400" />
                            <input
                                value={calendarQuery}
                                onChange={e => setCalendarQuery(e.target.value)}
                                placeholder="Filter by pair, litter ID, sire or dam"
                                className="w-full md:w-80 p-2 text-sm border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                            />
                        </div>

                    </div>
                    <div className="flex flex-wrap gap-2">
                        {Object.entries(typeStyles).map(([key, style]) => (
                            <button
                                key={key}
                                onClick={() => setCalendarEventFilters(prev => ({ ...prev, [key]: !prev[key] }))}
                                className={`px-2.5 py-1 text-xs font-medium rounded-full border transition ${calendarEventFilters[key] ? style.bg : 'border-gray-300 text-gray-500 bg-white hover:bg-gray-50'}`}
                            >
                                <span className="inline-flex items-center gap-1">
                                    {getEventIcon(key, 12)}
                                    <span>{style.label}</span>
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Day-of-week headers */}
                <div className="grid grid-cols-7 border-b-2 border-gray-300 bg-gray-50">
                    {dayNames.map((d, i) => (
                        <div key={d} className={`py-2 text-center text-xs font-bold uppercase tracking-wide ${isWeekendCol[i] ? 'text-rose-400' : 'text-gray-500'}`}>{d}</div>
                    ))}
                </div>

                {/* Day Cells */}
                <div className="relative">
                    {loading && (
                        <div className="absolute inset-0 z-10 bg-white/70 backdrop-blur-[2px] flex flex-col items-center justify-center gap-3 rounded-b-xl">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            <span className="text-sm text-gray-500 font-medium">Loading events…</span>
                        </div>
                    )}
                <div className="grid grid-cols-7 divide-x divide-y divide-gray-300">
                    {cells.map((day, idx) => {
                        const colIdx = idx % 7;
                        const isWeekend = isWeekendCol[colIdx];
                        if (day === null) return <div key={`blank-${idx}`} className={`min-h-[96px] ${isWeekend ? 'bg-rose-50/40' : 'bg-gray-50/60'}`} />;
                        const dateKey = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
                        const events = eventMap[dateKey] || [];
                        const isToday = dateKey === todayStr;
                        return (
                            <div key={dateKey} className={`min-h-[96px] p-1.5 ${isToday ? 'bg-blue-50' : isWeekend ? 'bg-rose-50/30 hover:bg-rose-50/60' : 'hover:bg-gray-50/80'}`}>
                                <span className={`inline-flex items-center justify-center w-6 h-6 text-sm rounded-full font-medium ${isToday ? 'bg-primary text-black ring-2 ring-primary/40 font-bold' : 'text-gray-700'}`}>
                                    {day}
                                </span>
                                <div className="mt-0.5 space-y-0.5">
                                    {events.map((ev, i) => {
                                        const st = (ev.type === 'due' && ev.litter?.birthDate)
                                            ? { ...typeStyles.due, bg: 'bg-gray-100 hover:bg-gray-200 text-gray-500 border border-gray-300', label: 'Due (Born)' }
                                            : (typeStyles[ev.type] || typeStyles.born);
                                        return (
                                            <button
                                                key={i}
                                                onClick={() => setCalendarTooltip(t => (t?.key === `${dateKey}-${i}`) ? null : { key: `${dateKey}-${i}`, litter: ev.litter, animal: ev.animal, type: ev.type })}
                                                className={`w-full text-left px-1.5 py-1 rounded text-[11px] leading-tight font-medium break-words transition-colors ${st.bg}`}
                                                title={ev.animal ? `${st.label}: ${getAnimalDisplayName(ev.animal)}` : `${st.label}: ${getLitterName(ev.litter)} (${getSireDam(ev.litter)})`}
                                            >
                                                <span className="inline-flex items-start gap-1.5">
                                                    {getEventIcon(ev.type, 11, 'mt-[1px] flex-shrink-0')}
                                                    <PillLabel ev={ev} />
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
                </div>

                {/* Selected event detail */}
                {calendarTooltip && (() => {
                    if (calendarTooltip.animal) {
                        const a = calendarTooltip.animal;
                        const st = typeStyles[calendarTooltip.type] || typeStyles.born;
                        return (
                            <div className="mx-3 mb-3 mt-2 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                                <div className="flex justify-between items-start gap-2 mb-2">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${st.bg}`}>{st.label}</span>
                                        <span className="font-bold text-gray-800 text-sm">{a._calLabel || getAnimalDisplayName(a)}</span>
                                    </div>
                                    <button onClick={() => setCalendarTooltip(null)} className="text-gray-400 hover:text-gray-600 flex-shrink-0"><X size={16} /></button>
                                </div>
                                <div className="space-y-1">
                                    {calendarTooltip.type === 'birthday' && (<>
                                        {a.id_public && <TooltipRow label="ID:" value={a.id_public} />}
                                        {a.species && <TooltipRow label="Species:" value={a.species} />}
                                        {a.gender && <TooltipRow label="Gender:" value={a.gender} />}
                                        {a.birthDate && (() => {
                                            const born = new Date(String(a.birthDate).substring(0,10) + 'T00:00:00');
                                            const now = new Date(); now.setHours(0,0,0,0);
                                            const ageDays = Math.round((now - born) / 86400000);
                                            const years = Math.floor(ageDays / 365);
                                            const months = Math.floor((ageDays % 365) / 30);
                                            const ageStr = years > 0 ? `${years}y ${months}m` : `${months} month${months !== 1 ? 's' : ''}`;
                                            return (<>
                                                <TooltipRow label="Birthday:" value={fmtD(a.birthDate)} />
                                                <TooltipRow label="Age (today):" value={ageStr} />
                                            </>);
                                        })()}
                                    </>)}
                                    {(calendarTooltip.type === 'feeding' || calendarTooltip.type === 'maintenance') && (<>
                                        {a.id_public && <TooltipRow label="Animal:" value={getAnimalDisplayName(a)} />}
                                        {a.species && <TooltipRow label="Species:" value={a.species} />}
                                        <TooltipRow label="Schedule:" value={a._calDetail} />
                                    </>)}
                                    {calendarTooltip.type === 'caretask' && (<>
                                        <TooltipRow label="Task:" value={a._calLabel} />
                                        <TooltipRow label="Animal / Enclosure:" value={a._calDetail} />
                                    </>)}
                                    {calendarTooltip.type === 'supply' && (<>
                                        <TooltipRow label="Supply:" value={a._calLabel} />
                                        <TooltipRow label="Category:" value={a._calDetail} />
                                    </>)}
                                    {calendarTooltip.type === 'milestone' && (<>
                                        <TooltipRow label="Animal:" value={a._calDetail} />
                                        {a._milestoneInterval && a._milestoneUnit && (
                                            <TooltipRow label="Repeats:" value={`Every ${a._milestoneInterval} ${a._milestoneUnit}${a._milestoneInterval > 1 ? 's' : ''}`} />
                                        )}
                                        {!a._milestoneInterval && <TooltipRow label="Type:" value="One-time" />}
                                    </>)}
                                </div>
                            </div>
                        );
                    }

                    const l = calendarTooltip.litter;
                    const type = calendarTooltip.type;
                    const sn = getParentDisplayName(l.sire, l.sireId_public);
                    const dn = getParentDisplayName(l.dam, l.damId_public);
                    const pairName = l.breedingPairCodeName || l.litter_id_public || 'Unnamed Litter';
                    const callId = l.litter_id_public;

                    const daysStatus = (() => {
                        if (l.birthDate) return { text: `Born ${fmtD(l.birthDate)}`, cls: 'text-green-600 font-semibold' };
                        if (!l.expectedDueDate) return null;
                        const due = new Date(l.expectedDueDate); if (isNaN(due)) return null;
                        const now = new Date(); now.setHours(0,0,0,0); due.setHours(0,0,0,0);
                        const diff = Math.round((due - now) / 86400000);
                        if (diff > 0) return { text: `${diff} day${diff !== 1 ? 's' : ''} remaining`, cls: 'text-green-600' };
                        if (diff === 0) return { text: 'Due today', cls: 'text-amber-600 font-semibold' };
                        return { text: `${Math.abs(diff)} day${Math.abs(diff) !== 1 ? 's' : ''} overdue`, cls: 'text-red-600 font-semibold' };
                    })();

                    const Row = ({ label, value, cls }) => {
                        if (value == null || value === '') return null;
                        return <div className="flex gap-2 text-sm"><span className="text-gray-500 w-32 flex-shrink-0">{label}</span><span className={`text-gray-800 font-medium ${cls || ''}`}>{value}</span></div>;
                    };

                    const tooltipPillStyle = (type === 'due' && l.birthDate)
                        ? { bg: 'bg-gray-100 text-gray-500 border border-gray-300', label: 'Due (Born)' }
                        : (typeStyles[type] || typeStyles.born);

                    return (
                        <div className="mx-3 mb-3 mt-2 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                            <div className="flex justify-between items-start gap-2 mb-3 pb-2 border-b border-gray-200">
                                <div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${tooltipPillStyle.bg}`}>{tooltipPillStyle.label}</span>
                                        <span className="font-bold text-gray-800 text-sm">{l.breedingPairCodeName ? pairName : `${sn} · ${dn}`}</span>
                                    </div>
                                    {callId && <p className="text-xs text-gray-400 mt-0.5">{callId}</p>}
                                </div>
                                <button onClick={() => setCalendarTooltip(null)} className="text-gray-400 hover:text-gray-600 flex-shrink-0"><X size={16} /></button>
                            </div>
                            <div className="space-y-1.5">
                                {type === 'due' && (<>
                                    <Row label="Mated:" value={fmtD(l.matingDate)} />
                                    <Row label="Due:" value={fmtD(l.expectedDueDate)} />
                                    {daysStatus && <div className="flex gap-2 text-sm"><span className="text-gray-500 w-32 flex-shrink-0">Status:</span><span className={daysStatus.cls}>{daysStatus.text}</span></div>}
                                    <Row label="Method:" value={l.breedingMethod && l.breedingMethod !== 'Unknown' ? l.breedingMethod : null} />
                                    <Row label="Condition:" value={l.breedingConditionAtTime || null} />
                                </>)}
                                {type === 'born' && (<>
                                    <Row label="Birth Method:" value={l.birthMethod || null} />
                                    <Row label="Born:" value={fmtD(l.birthDate)} />
                                    <Row label="Total:" value={l.litterSizeBorn ?? l.numberBorn ?? null} />
                                    <Row label="Males:" value={l.maleCount ?? null} />
                                    <Row label="Females:" value={l.femaleCount ?? null} />
                                    <div className="flex gap-2 text-sm"><span className="text-gray-500 w-32 flex-shrink-0">Stillborn:</span><span className="text-gray-800 font-medium">{l.stillbornCount ?? 0}</span></div>
                                    <div className="flex gap-2 text-sm"><span className="text-gray-500 w-32 flex-shrink-0">Weaned:</span><span className="text-gray-800 font-medium">{l.litterSizeWeaned ?? l.numberWeaned ?? 0}</span></div>
                                    <Row label="Weaning Date:" value={fmtD(l.weaningDate)} />
                                </>)}
                                {type === 'weaned' && (() => {
                                    const weanStatus = (() => {
                                        if (!l.weaningDate) return null;
                                        const wd = new Date(l.weaningDate); if (isNaN(wd)) return null;
                                        const now = new Date(); now.setHours(0,0,0,0); wd.setHours(0,0,0,0);
                                        const diff = Math.round((wd - now) / 86400000);
                                        if (diff > 0) return { text: `Due in ${diff} day${diff !== 1 ? 's' : ''}`, cls: 'text-green-600' };
                                        if (diff === 0) return { text: 'Weaning today', cls: 'text-amber-600 font-semibold' };
                                        return { text: `${Math.abs(diff)} day${Math.abs(diff) !== 1 ? 's' : ''} overdue`, cls: 'text-red-600 font-semibold' };
                                    })();
                                    const ageInDays = (() => {
                                        if (!l.birthDate || !l.weaningDate) return null;
                                        const b = new Date(l.birthDate); const w = new Date(l.weaningDate);
                                        if (isNaN(b) || isNaN(w)) return null;
                                        return Math.round((w - b) / 86400000);
                                    })();
                                    return (<>
                                        <Row label="Born:" value={fmtD(l.birthDate)} />
                                        <Row label="Weaning Date:" value={fmtD(l.weaningDate)} />
                                        {ageInDays != null && <div className="flex gap-2 text-sm"><span className="text-gray-500 w-32 flex-shrink-0">Age:</span><span className="text-gray-800 font-medium">{ageInDays} day{ageInDays !== 1 ? 's' : ''}</span></div>}
                                        {weanStatus && <div className="flex gap-2 text-sm"><span className="text-gray-500 w-32 flex-shrink-0">Status:</span><span className={weanStatus.cls}>{weanStatus.text}</span></div>}
                                    </>);
                                })()}
                                {(type === 'mated' || type === 'planned') && (<>
                                    <Row label="Planned Mating:" value={type === 'planned' ? fmtD(l.matingDate) : null} />
                                    <Row label="Mating Date:" value={type === 'mated' ? fmtD(l.matingDate) : null} />
                                    <Row label="Expected Due:" value={fmtD(l.expectedDueDate)} />
                                    <Row label="Method:" value={l.breedingMethod && l.breedingMethod !== 'Unknown' ? l.breedingMethod : null} />
                                    <Row label="Condition:" value={l.breedingConditionAtTime || null} />
                                </>)}
                            </div>
                        </div>
                    );
                })()}

                {/* Month Agenda */}
                <div className="mx-3 mb-3 p-3 bg-white border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-semibold text-gray-800">Month Agenda</h4>
                        <span className="text-xs text-gray-500">{monthEventList.length} event{monthEventList.length !== 1 ? 's' : ''}</span>
                    </div>
                    {monthEventList.length === 0 ? (
                        <p className="text-xs text-gray-500">No events this month.</p>
                    ) : (
                        <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                            {monthEventList.map((ev, idx) => {
                                const st = (ev.type === 'due' && ev.litter?.birthDate)
                                    ? { ...typeStyles.due, bg: 'bg-gray-100 text-gray-500 border border-gray-300', label: 'Due (Born)' }
                                    : (typeStyles[ev.type] || typeStyles.born);
                                return (
                                    <button
                                        key={`${ev.dateKey}-${ev.type}-${ev.litter?._id ?? ev.animal?._id ?? idx}-${idx}`}
                                        onClick={() => setCalendarTooltip({ key: `${ev.dateKey}-${idx}`, litter: ev.litter, animal: ev.animal, type: ev.type })}
                                        className="w-full text-left px-2 py-1.5 rounded border border-gray-200 hover:bg-gray-50 transition"
                                    >
                                        <div className="flex items-center justify-between gap-2">
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full ${st.bg}`}>
                                                {getEventIcon(ev.type, 11)}
                                                {st.label}
                                            </span>
                                            <span className="text-[11px] text-gray-500">{fmtD(ev.dateKey)}</span>
                                        </div>
                                        <div className="text-xs text-gray-800 mt-1 truncate"><PillLabel ev={ev} /></div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>


            </div>
        </div>
    );
};

export default CalendarPage;
