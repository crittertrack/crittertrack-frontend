import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ClipboardList, Users, Plus, Edit, Trash2, Search, Loader2, Save, Check, CheckCircle, Undo2, RefreshCw, User, Phone, Tag, Mars, Venus, PawPrint, Home, DollarSign, Calendar, AlertTriangle } from 'lucide-react';
import apiClient from '../utils/apiClient';
import AnimalImage from './shared/AnimalImage';
import InfoButton from './shared/InfoButton';
import { formatDate } from '../utils/dateFormatter';
import { getCurrencySymbol } from '../utils/locationUtils';
import ContactAssignModal from './Contacts/ContactAssignModal';

const EMPTY_WAITLIST_FORM = { name: '', contactInfo: '', contactId: null, contactName: '', speciesRequests: [{ species: '', counts: { Male: '', Female: '', Any: '' } }], notes: '' };
const GENDER_CHOICES = ['Male', 'Female', 'Any'];
const CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CHF', 'INR', 'AED'];
const STATUS_PILL = {
    Available: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
    Booked: 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300',
};
const DUE_DONE = (status) => status === 'done'
    ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
    : 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300';
const todayStr = () => new Date().toISOString().slice(0, 10);
// Normalises a species request to [{ gender, count }]. Legacy entries only have
// `genders` + a single total `amount`, so derive counts from those.
const getGenderCounts = (req) => {
    if (Array.isArray(req.genderCounts) && req.genderCounts.length > 0) return req.genderCounts.filter(c => c.count > 0);
    const amount = Number(req.amount) > 0 ? Number(req.amount) : 1;
    const g = req.genders || [];
    if (g.length === 1 && g[0] !== 'Any') return [{ gender: g[0], count: amount }];
    return [{ gender: 'Any', count: amount }];
};

const ReservationsPage = ({ authToken, API_BASE_URL, showModalMessage, onViewAnimal }) => {
    const [activeTab, setActiveTab] = useState('animals');
    const [waitlistView, setWaitlistView] = useState('active'); // 'active' | 'history'
    const [animals, setAnimals] = useState([]);
    const [animalsLoading, setAnimalsLoading] = useState(true);
    const [waitlist, setWaitlist] = useState([]);
    const [waitlistLoading, setWaitlistLoading] = useState(true);
    const [speciesOptions, setSpeciesOptions] = useState([]);
    const [wlSpeciesFocus, setWlSpeciesFocus] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    // Animals-tab filters ('' / 'all' = no filter).
    const [speciesFilter, setSpeciesFilter] = useState('');
    const [genderFilter, setGenderFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [assignedFilter, setAssignedFilter] = useState('all'); // 'all' | 'assigned' | 'unassigned'
    // Shared with Budget Tracker + Supplies currency pickers (same localStorage key).
    const [currency, setCurrency] = useState(() => localStorage.getItem('budgetCurrency') || 'USD');
    const handleCurrencyChange = (c) => { setCurrency(c); localStorage.setItem('budgetCurrency', c); };

    // Per-animal reservation editor state, keyed by id_public.
    const [resForms, setResForms] = useState({});
    const [editingAnimalId, setEditingAnimalId] = useState(null);
    const [resSaving, setResSaving] = useState(false);
    const [rehomingId, setRehomingId] = useState(null);

    // Waitlist add/edit form
    const [wlFormVisible, setWlFormVisible] = useState(false);
    const [editingWlId, setEditingWlId] = useState(null);
    const [wlForm, setWlForm] = useState(EMPTY_WAITLIST_FORM);
    const [wlSaving, setWlSaving] = useState(false);
    // Contact picker for the waitlist form (assign an existing Contacts record).
    const [wlContactModalOpen, setWlContactModalOpen] = useState(false);

    const fetchAnimals = useCallback(async () => {
        if (!authToken) return;
        setAnimalsLoading(true);
        try {
            const res = await apiClient.get('/animals');
            setAnimals((res.data || []).filter(a => !a.archived && !a.isViewOnly));
        } catch (err) { console.error('[fetchReservationAnimals]', err); }
        setAnimalsLoading(false);
    }, [authToken]);

    const fetchWaitlist = useCallback(async () => {
        if (!authToken) return;
        setWaitlistLoading(true);
        try {
            const res = await apiClient.get('/waitlist');
            setWaitlist(res.data || []);
        } catch (err) { console.error('[fetchWaitlist]', err); }
        setWaitlistLoading(false);
    }, [authToken]);

    const fetchSpecies = useCallback(async () => {
        try {
            const res = await apiClient.get('/species');
            setSpeciesOptions((res.data || []).map(s => s.name).filter(Boolean));
        } catch (err) { console.error('[fetchSpecies]', err); setSpeciesOptions([]); }
    }, []);

    useEffect(() => { fetchAnimals(); }, [fetchAnimals]);

    // The full animal modal (opened from the card image) edits animals outside this page and
    // broadcasts 'animal-updated' / 'animals-changed' — mirror those so status, species etc.
    // changed there show up here immediately (an animal that is no longer Available/Booked
    // simply drops out of the list via the sale filter).
    useEffect(() => {
        const onUpdated = (e) => {
            const u = e.detail;
            if (!u?.id_public) return;
            setAnimals(prev => (u.archived
                ? prev.filter(a => a.id_public !== u.id_public)
                : prev.map(a => (a.id_public === u.id_public ? { ...a, ...u } : a))));
        };
        const onChanged = () => {
            if (!authToken) return;
            apiClient.get('/animals')
                .then(res => setAnimals((res.data || []).filter(a => !a.archived && !a.isViewOnly)))
                .catch(err => console.error('[refreshReservationAnimals]', err));
        };
        window.addEventListener('animal-updated', onUpdated);
        window.addEventListener('animals-changed', onChanged);
        return () => {
            window.removeEventListener('animal-updated', onUpdated);
            window.removeEventListener('animals-changed', onChanged);
        };
    }, [authToken]);
    useEffect(() => { fetchWaitlist(); }, [fetchWaitlist]);
    useEffect(() => { fetchSpecies(); }, [fetchSpecies]);

    // --- Waitlist multi-species helpers ---------------------------------------
    // A waitlist entry "fits" an animal if ANY of its speciesRequests matches the
    // animal's species AND (genders includes 'Any' OR genders includes the animal's gender).
    const entryFitsAnimal = (entry, animal) => {
        const reqs = entry.speciesRequests || (entry.species ? [{ species: entry.species, genders: entry.genders || [], amount: entry.amount }] : []);
        return reqs.some(req => {
            if (!req.species || req.species.toLowerCase() !== (animal.species || '').toLowerCase()) return false;
            return getGenderCounts(req).some(c => c.gender === 'Any' || c.gender === animal.gender);
        });
    };

    // Fulfillment for one species request. Gender-specific counts are filled first;
    // leftover animals of that species can then satisfy the "Any" count.
    const computeRequestFulfillment = (req, assignedAnimals) => {
        const same = (assignedAnimals || []).filter(a => a.species && a.species.toLowerCase() === (req.species || '').toLowerCase());
        const counts = getGenderCounts(req);
        let usedSpecific = 0;
        let fulfilled = 0;
        let requested = 0;
        counts.filter(c => c.gender !== 'Any').forEach(c => {
            const used = Math.min(same.filter(a => a.gender === c.gender).length, c.count);
            usedSpecific += used; fulfilled += used; requested += c.count;
        });
        const anyCount = counts.filter(c => c.gender === 'Any').reduce((s, c) => s + c.count, 0);
        fulfilled += Math.min(Math.max(0, same.length - usedSpecific), anyCount);
        requested += anyCount;
        return { ...req, breakdown: counts, requested, fulfilled, remaining: Math.max(0, requested - fulfilled), isFulfilled: fulfilled >= requested };
    };

    // The animals that count towards an entry's fulfillment. Two sources:
    //  - the snapshot stored on the entry (finalized entries), and
    //  - the live animals still reserved to this entry (active entries), which the
    //    backend only copies into assignedAnimals when the entry is finalized.
    // The live reservation is the source of truth while an entry is active, so without it
    // an active entry would always show "0 / N" fulfilled.
    const getEntryAssignedAnimals = (entry) => {
        const byId = new Map();
        (entry.assignedAnimals || []).forEach(a => {
            if (!a?.id_public) return;
            byId.set(a.id_public, { ...a });
        });
        animals.forEach(a => {
            if (!a?.id_public || !a.reservedWaitlistEntryId) return;
            if (String(a.reservedWaitlistEntryId) !== String(entry._id)) return;
            const existing = byId.get(a.id_public) || {};
            byId.set(a.id_public, {
                ...existing,
                id_public: a.id_public,
                name: existing.name || a.name,
                species: existing.species || a.species,
                gender: existing.gender || a.gender,
            });
        });
        return Array.from(byId.values());
    };

    const computeEntryFulfillment = (entry) => {
        const reqs = entry.speciesRequests || (entry.species ? [{ species: entry.species, genders: entry.genders || [], amount: entry.amount }] : []);
        const assigned = getEntryAssignedAnimals(entry);
        const progress = reqs.map(r => computeRequestFulfillment(r, assigned));
        return {
            progress,
            assigned,
            totalRequested: progress.reduce((s, p) => s + p.requested, 0),
            totalFulfilled: progress.reduce((s, p) => s + p.fulfilled, 0),
            isFulfilled: progress.length > 0 && progress.every(p => p.isFulfilled),
        };
    };

    const emptySpeciesRequest = () => ({ species: '', counts: { Male: '', Female: '', Any: '' } });
    const setWlCount = (reqIndex, g, value) => setWlForm(f => {
        const reqs = [...f.speciesRequests];
        reqs[reqIndex] = { ...reqs[reqIndex], counts: { ...reqs[reqIndex].counts, [g]: value } };
        return { ...f, speciesRequests: reqs };
    });
    const addWlSpeciesRow = () => setWlForm(f => ({ ...f, speciesRequests: [...f.speciesRequests, emptySpeciesRequest()] }));
    const removeWlSpeciesRow = (idx) => setWlForm(f => {
        const reqs = f.speciesRequests.filter((_, i) => i !== idx);
        return { ...f, speciesRequests: reqs.length > 0 ? reqs : [emptySpeciesRequest()] };
    });
    const setWlSpeciesField = (reqIndex, field, value) => setWlForm(f => {
        const reqs = [...f.speciesRequests];
        reqs[reqIndex] = { ...reqs[reqIndex], [field]: value };
        return { ...f, speciesRequests: reqs };
    });

    // Animals available for sale: status Available or Booked.
    const baseSaleAnimals = useMemo(
        () => animals.filter(a => a.status === 'Available' || a.status === 'Booked'),
        [animals]
    );
    // Species/gender choices only list what actually exists among sale animals.
    const filterSpeciesOptions = useMemo(
        () => [...new Set(baseSaleAnimals.map(a => a.species).filter(Boolean))].sort((a, b) => a.localeCompare(b)),
        [baseSaleAnimals]
    );
    const filterGenderOptions = useMemo(
        () => [...new Set(baseSaleAnimals.map(a => a.gender).filter(Boolean))].sort((a, b) => a.localeCompare(b)),
        [baseSaleAnimals]
    );
    const isAssigned = (a) => !!(a.reservedBuyerName || a.reservedWaitlistEntryId);
    const saleAnimals = useMemo(() => {
        const q = searchTerm.trim().toLowerCase();
        return baseSaleAnimals
            .filter(a => !speciesFilter || a.species === speciesFilter)
            .filter(a => !genderFilter || a.gender === genderFilter)
            .filter(a => !statusFilter || a.status === statusFilter)
            .filter(a => assignedFilter === 'all' || (assignedFilter === 'assigned' ? isAssigned(a) : !isAssigned(a)))
            .filter(a => !q || [a.name, a.prefix, a.suffix, a.id_public, a.species, a.breed, a.reservedBuyerName].filter(Boolean).join(' ').toLowerCase().includes(q))
            .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    }, [baseSaleAnimals, searchTerm, speciesFilter, genderFilter, statusFilter, assignedFilter]);
    const filtersActive = !!(speciesFilter || genderFilter || statusFilter || assignedFilter !== 'all' || searchTerm.trim());
    const clearFilters = () => { setSpeciesFilter(''); setGenderFilter(''); setStatusFilter(''); setAssignedFilter('all'); setSearchTerm(''); };

    const activeWaitlist = useMemo(() => waitlist.filter(e => e.isActive !== false), [waitlist]);
    const historyWaitlist = useMemo(() => waitlist.filter(e => e.isActive === false), [waitlist]);
    const shownWaitlist = waitlistView === 'active' ? activeWaitlist : historyWaitlist;

    // Seed/clear an animal's inline editor from its stored reservation.
    const seedResForm = (animal) => ({
        buyerName: animal.reservedBuyerName || '',
        buyerContact: animal.reservedBuyerContact || '',
        waitlistEntryId: animal.reservedWaitlistEntryId ? String(animal.reservedWaitlistEntryId) : '',
        price: animal.reservedPrice ?? '',
        priceCurrency: animal.reservedPriceCurrency || 'USD',
        deposit: animal.reservedDeposit ?? '',
        depositStatus: animal.reservedDepositStatus || 'due',
        paymentStatus: animal.reservedPaymentStatus || 'due',
        date: animal.reservedDate ? new Date(animal.reservedDate).toISOString().slice(0, 10) : '',
    });
    const getResForm = (animal) => resForms[animal.id_public] || seedResForm(animal);
    const setResField = (animal, field, value) => {
        if (field === 'waitlistEntryId') {
            // Picking a waitlist entry fills the buyer name/contact from it.
            const entry = waitlist.find(e => String(e._id) === String(value));
            setResForms(prev => ({
                ...prev,
                [animal.id_public]: {
                    ...(prev[animal.id_public] || seedResForm(animal)),
                    waitlistEntryId: value,
                    buyerName: entry ? entry.name : (prev[animal.id_public]?.buyerName ?? animal.reservedBuyerName ?? ''),
                    buyerContact: entry ? (entry.contactInfo || '') : (prev[animal.id_public]?.buyerContact ?? animal.reservedBuyerContact ?? ''),
                },
            }));
            return;
        }
        setResForms(prev => ({ ...prev, [animal.id_public]: { ...(prev[animal.id_public] || seedResForm(animal)), [field]: value } }));
    };
    const handleSaveReservation = async (animal) => {
        const f = getResForm(animal);
        setResSaving(true);
        try {
            const payload = {
                reservedBuyerName: f.buyerName?.trim() || null,
                reservedBuyerContact: f.buyerContact?.trim() || null,
                reservedWaitlistEntryId: f.waitlistEntryId || null,
                reservedPrice: f.price !== '' && f.price != null ? Number(f.price) : null,
                reservedPriceCurrency: f.priceCurrency || 'USD',
                reservedDeposit: f.deposit !== '' && f.deposit != null ? Number(f.deposit) : null,
                reservedDepositStatus: f.depositStatus || 'due',
                reservedPaymentStatus: f.paymentStatus || 'due',
                reservedDate: f.date || null,
                // Claiming an animal for a buyer marks it Booked; clearing the buyer frees it back.
                status: f.buyerName?.trim() ? 'Booked' : 'Available',
            };
            const res = await apiClient.put(`/animals/${animal.id_public}`, payload);
            const updated = res.data?.animal || res.data;
            setAnimals(prev => prev.map(a => (a.id_public === animal.id_public ? { ...a, ...(updated || {}), ...payload } : a)));
            setResForms(prev => { const next = { ...prev }; delete next[animal.id_public]; return next; });
            setEditingAnimalId(null);
            window.dispatchEvent(new Event('animals-changed'));
            showModalMessage?.('Success', 'Reservation saved');
        } catch (err) {
            console.error('[saveReservation]', err);
            showModalMessage?.('Error', err.response?.data?.message || 'Failed to save reservation');
        }
        setResSaving(false);
    };

    const handleClearReservation = async (animal) => {
        if (!window.confirm(`Clear the reservation for ${animal.name || animal.id_public}?`)) return;
        setResSaving(true);
        try {
            const payload = {
                reservedBuyerName: null, reservedBuyerContact: null, reservedWaitlistEntryId: null,
                reservedPrice: null, reservedDeposit: null, reservedDate: null,
                reservedDepositStatus: null, reservedPaymentStatus: null, status: 'Available',
            };
            await apiClient.put(`/animals/${animal.id_public}`, payload);
            setAnimals(prev => prev.map(a => (a.id_public === animal.id_public ? { ...a, ...payload } : a)));
            setResForms(prev => { const next = { ...prev }; delete next[animal.id_public]; return next; });
            setEditingAnimalId(null);
            window.dispatchEvent(new Event('animals-changed'));
        } catch (err) {
            console.error('[clearReservation]', err);
            showModalMessage?.('Error', 'Failed to clear reservation');
        }
        setResSaving(false);
    };

    // Quick action: promote the reservation into the animal's Sale info (date, price, buyer —
    // which auto-creates the Budget sale transaction server-side) and mark Rehomed + archived.
    const handleRehome = async (animal) => {
        const resForm = getResForm(animal);
        const buyer = (resForm.buyerName?.trim() || animal.reservedBuyerName || '').trim();
        const price = resForm.price !== '' && resForm.price != null ? Number(resForm.price) : (animal.reservedPrice ?? null);
        if (!buyer) { showModalMessage?.('Missing buyer', 'Assign a buyer/adoptee before rehoming.'); return; }
        if (price == null || Number.isNaN(price)) { showModalMessage?.('Missing price', 'Enter the payment amount before rehoming.'); return; }
        const saleDate = resForm.date || (animal.reservedDate ? new Date(animal.reservedDate).toISOString().slice(0, 10) : todayStr());
        if (!window.confirm(`Mark ${animal.name || animal.id_public} as Rehomed and record the sale to ${buyer}?`)) return;
        setRehomingId(animal.id_public);
        try {
            const payload = {
                saleDate,
                salePrice: price,
                saleRecordCurrency: resForm.priceCurrency || animal.reservedPriceCurrency || 'USD',
                buyerName: buyer,
                buyerContact: resForm.buyerContact?.trim() || animal.reservedBuyerContact || null,
                // Clear the pending reservation — it has been fulfilled.
                reservedBuyerName: null, reservedBuyerContact: null, reservedWaitlistEntryId: null,
                reservedPrice: null, reservedDeposit: null, reservedDate: null,
                reservedDepositStatus: null, reservedPaymentStatus: null,
                status: 'Rehomed', archived: true,
            };
            const res = await apiClient.put(`/animals/${animal.id_public}`, payload);
            const updated = res.data?.animal || res.data;
            setAnimals(prev => prev.map(a => (a.id_public === animal.id_public ? { ...a, ...(updated || {}), ...payload } : a)));
            setResForms(prev => { const next = { ...prev }; delete next[animal.id_public]; return next; });
            setEditingAnimalId(null);
            window.dispatchEvent(new CustomEvent('animal-updated', { detail: { id_public: animal.id_public, status: 'Rehomed', archived: true } }));
            window.dispatchEvent(new Event('animals-changed'));
            showModalMessage?.('Success', `${animal.name || animal.id_public} marked as Rehomed — sale logged to Budget`);
        } catch (err) {
            console.error('[rehomeAnimal]', err);
            showModalMessage?.('Error', err.response?.data?.message || 'Failed to rehome animal');
        }
        setRehomingId(null);
    };

    const openWlForm = (entry) => {
        if (entry) {
            const reqs = entry.speciesRequests || (entry.species ? [{ species: entry.species, genders: entry.genders || [], amount: String(entry.amount ?? 1) }] : [emptySpeciesRequest()]);
            setWlForm({
                name: entry.name || '', contactInfo: entry.contactInfo || '',
                contactId: entry.contactId?._id || entry.contactId || null,
                contactName: entry.contactName || (entry.contactId?.personalName || ''),
                speciesRequests: reqs.map(r => { const counts = { Male: '', Female: '', Any: '' }; getGenderCounts(r).forEach(c => { counts[c.gender] = String(c.count); }); return { species: r.species || '', counts }; }),
                notes: entry.notes || '',
            });
            setEditingWlId(entry._id);
        } else {
            setWlForm(EMPTY_WAITLIST_FORM);
            setEditingWlId(null);
        }
        setWlFormVisible(true);
    };

    const handleWlSave = async () => {
        if (!wlForm.name.trim()) { showModalMessage?.('Missing name', 'Enter the waitlist attendee name.'); return; }
        // At least one species row must be filled in.
        const validRows = wlForm.speciesRequests.filter(r => r.species?.trim());
        if (validRows.length === 0) { showModalMessage?.('Missing species', 'Add at least one species request.'); return; }
        setWlSaving(true);
        try {
            const payload = {
                name: wlForm.name.trim(), contactInfo: wlForm.contactInfo?.trim() || '',
                // null explicitly unlinks the contact; an id links/relinks it.
                contactId: wlForm.contactId || null,
                speciesRequests: validRows.map(r => {
                    let genderCounts = GENDER_CHOICES
                        .map(g => ({ gender: g, count: parseInt(r.counts?.[g], 10) || 0 }))
                        .filter(c => c.count > 0);
                    if (genderCounts.length === 0) genderCounts = [{ gender: 'Any', count: 1 }];
                    return {
                        species: r.species.trim(),
                        genderCounts,
                        genders: genderCounts.map(c => c.gender),
                        amount: genderCounts.reduce((s, c) => s + c.count, 0),
                    };
                }),
                notes: wlForm.notes?.trim() || '',
            };
            if (editingWlId) {
                const res = await apiClient.patch(`/waitlist/${editingWlId}`, payload);
                setWaitlist(prev => prev.map(e => (e._id === editingWlId ? { ...e, ...res.data } : e)));
            } else {
                const res = await apiClient.post('/waitlist', payload);
                setWaitlist(prev => [res.data, ...prev]);
            }
            setWlForm(EMPTY_WAITLIST_FORM);
            setEditingWlId(null);
            setWlFormVisible(false);
            showModalMessage?.('Success', editingWlId ? 'Waitlist entry updated' : 'Added to waitlist');
        } catch (err) {
            console.error('[saveWaitlist]', err);
            showModalMessage?.('Error', err.response?.data?.message || 'Failed to save waitlist entry');
        }
        setWlSaving(false);
    };

    const handleWlDelete = async (id) => {
        if (!window.confirm('Delete this waitlist entry?')) return;
        try {
            await apiClient.delete(`/waitlist/${id}`);
            setWaitlist(prev => prev.filter(e => e._id !== id));
        } catch (err) {
            console.error('[deleteWaitlist]', err);
            showModalMessage?.('Error', 'Failed to delete waitlist entry');
        }
    };

    const handleWlFinalize = async (entry) => {
        if (!window.confirm(`Finalize ${entry.name}? This moves them to history.`)) return;
        try {
            const res = await apiClient.post(`/waitlist/${entry._id}/finalize`);
            setWaitlist(prev => prev.map(e => (e._id === entry._id ? { ...e, ...res.data } : e)));
            showModalMessage?.('Success', `${entry.name} moved to history`);
        } catch (err) {
            console.error('[finalizeWaitlist]', err);
            showModalMessage?.('Error', 'Failed to finalize waitlist entry');
        }
    };

    const handleWlReactivate = async (entry) => {
        try {
            const res = await apiClient.patch(`/waitlist/${entry._id}`, { isActive: true });
            setWaitlist(prev => prev.map(e => (e._id === entry._id ? { ...e, ...res.data } : e)));
        } catch (err) {
            console.error('[reactivateWaitlist]', err);
            showModalMessage?.('Error', 'Failed to reactivate entry');
        }
    };

    const inputCls = 'w-full text-sm border border-gray-300 dark:border-dark-text dark:bg-dark-surface dark:text-dark-text dark:placeholder-dark-text-muted rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-green-400 focus:border-green-400';
    const cardCls = 'bg-white dark:bg-dark-card-bg rounded-xl shadow-lg overflow-hidden';

    return (
        <div className="p-3 sm:p-6 max-w-7xl mx-auto">
            <div className="space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                        <ClipboardList size={18} className="text-green-600 dark:text-green-400" />
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-dark-text">Reservations</h3>
                        <InfoButton title="Reservations" lessonId="reservations">
                            <p>Track planned sales for Available / Booked animals: assign a buyer, record price, deposit and payment status, then rehome in one click.</p>
                            <p>The Waitlist tab collects interested buyers; picking one on an animal links them, and finalizing archives them to history with their assigned animals.</p>
                        </InfoButton>
                    </div>
                    <label className="flex items-center gap-2 text-xs text-gray-500 dark:text-dark-text-muted">
                        Currency:
                        <select value={currency} onChange={e => handleCurrencyChange(e.target.value)}
                            className="border border-gray-300 dark:border-dark-text dark:bg-dark-surface dark:text-dark-text rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-green-400 focus:border-green-400"
                            title="Sets the currency symbol shown across this page">
                            {CURRENCIES.map(c => <option key={c} value={c}>{getCurrencySymbol(c)} {c}</option>)}
                        </select>
                    </label>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 bg-gray-100 dark:bg-dark-surface rounded-xl p-1 w-fit">
                    {[{ id: 'animals', label: 'Animals', icon: PawPrint }, { id: 'waitlist', label: 'Waitlist', icon: Users }].map(t => (
                        <button key={t.id} onClick={() => setActiveTab(t.id)}
                            className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition ${activeTab === t.id ? 'bg-white dark:bg-dark-card-bg text-gray-900 dark:text-dark-text shadow' : 'text-gray-500 dark:text-dark-text-muted hover:text-gray-700 dark:hover:text-dark-text'}`}>
                            <t.icon size={14} /> {t.label}
                            <span className="text-xs bg-gray-200 dark:bg-dark-surface-hover px-1.5 py-0.5 rounded-full">{t.id === 'animals' ? saleAnimals.length : activeWaitlist.length}</span>
                        </button>
                    ))}
                </div>

                {activeTab === 'animals' && (
                    <>
                        <div className={`${cardCls} p-2 sm:p-4 mb-4`}>
                            <div className="relative">
                                <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-dark-text-muted w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                                <input type="text" placeholder="Search animals, species, buyers..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                                    className="w-full pl-8 sm:pl-10 pr-2 sm:pr-3 py-1.5 sm:py-2 text-sm border border-gray-300 dark:border-dark-text-muted bg-white dark:bg-dark-card-bg text-gray-900 dark:text-dark-text dark:placeholder-dark-text-muted rounded-lg focus:ring-primary focus:border-primary" />
                            </div>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mt-2">
                                {[
                                    { label: 'Species', value: speciesFilter, set: setSpeciesFilter, all: 'All species', opts: filterSpeciesOptions.map(s => [s, s]) },
                                    { label: 'Gender', value: genderFilter, set: setGenderFilter, all: 'All genders', opts: filterGenderOptions.map(g => [g, g]) },
                                    { label: 'Status', value: statusFilter, set: setStatusFilter, all: 'Available & Booked', opts: [['Available', 'Available'], ['Booked', 'Booked']] },
                                    { label: 'Assigned', value: assignedFilter, set: setAssignedFilter, all: null, opts: [['all', 'All'], ['assigned', 'Assigned'], ['unassigned', 'Unassigned']] },
                                ].map(f => (
                                    <label key={f.label} className="text-[10px] font-medium text-gray-500 dark:text-dark-text-muted">
                                        {f.label}
                                        <select aria-label={`${f.label} filter`} value={f.value} onChange={e => f.set(e.target.value)} className={`${inputCls} w-full mt-0.5`}>
                                            {f.all && <option value="">{f.all}</option>}
                                            {f.opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                                        </select>
                                    </label>
                                ))}
                            </div>
                            {filtersActive && (
                                <div className="flex items-center justify-between mt-2 text-xs text-gray-500 dark:text-dark-text-muted">
                                    <span>Showing {saleAnimals.length} of {baseSaleAnimals.length} animals</span>
                                    <button type="button" onClick={clearFilters} className="text-green-600 dark:text-green-400 hover:underline">Clear filters</button>
                                </div>
                            )}
                        </div>

                        {animalsLoading ? (
                            <div className="text-center py-12 text-gray-500 dark:text-dark-text-muted"><Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin" /> Loading animals...</div>
                        ) : saleAnimals.length === 0 ? (
                            <div className={`${cardCls} text-center py-8 sm:py-12 text-gray-500 dark:text-dark-text-muted`}>
                                <PawPrint className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 text-gray-300 dark:text-dark-border" />
                                <p className="text-base sm:text-lg font-medium">No animals for sale</p>
                                <p className="text-xs sm:text-sm mt-1">Mark animals as Available or Booked to reserve them here</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
                                {saleAnimals.map(animal => {
                                    const f = getResForm(animal);
                                    const isEditing = editingAnimalId === animal.id_public;
                                    const imgSrc = animal.imageUrl || animal.photoUrl;
                                    const hasReservation = !!(animal.reservedBuyerName || f.buyerName);
                                    const wlName = animal.reservedWaitlistEntryId
                                        ? (waitlist.find(e => String(e._id) === String(animal.reservedWaitlistEntryId))?.name || null)
                                        : null;
                                    return (
                                        <div key={animal.id_public} data-testid={`animal-card-${animal.id_public}`} className={cardCls}>
                                            <div className="p-3 sm:p-4 space-y-3">
                                                <div className="flex items-start gap-3">
                                                    <button type="button" onClick={() => onViewAnimal?.(animal)} disabled={!onViewAnimal}
                                                        aria-label={`Open ${animal.name || animal.id_public}`} title="Open full animal details"
                                                        className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-dark-surface flex items-center justify-center ring-0 hover:ring-2 hover:ring-green-400 focus:outline-none focus:ring-2 focus:ring-green-400 transition cursor-pointer disabled:cursor-default">
                                                        <AnimalImage src={imgSrc} alt={animal.name} className="w-full h-full object-cover" iconSize={22} />
                                                    </button>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="font-semibold text-gray-800 dark:text-dark-text truncate">
                                                            {[animal.prefix, animal.name, animal.suffix].filter(Boolean).join(' ') || 'Unnamed'}
                                                        </div>
                                                        <div className="text-xs text-gray-500 dark:text-dark-text-muted font-mono">{animal.id_public}</div>
                                                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${STATUS_PILL[animal.status] || STATUS_PILL.Available}`}>{animal.status}</span>
                                                            <span className="text-[11px] text-gray-500 dark:text-dark-text-muted">{[animal.species, animal.gender].filter(Boolean).join(' • ')}</span>
                                                        </div>
                                                    </div>
                                                    <button onClick={fetchAnimals} title="Refresh" className="text-gray-400 hover:text-gray-600 dark:hover:text-dark-text transition"><RefreshCw size={13} /></button>
                                                </div>

                                                {/* Reservation summary (read mode) */}
                                                {!isEditing && (
                                                    <div className="text-xs sm:text-sm space-y-1 bg-gray-50 dark:bg-dark-surface rounded-lg p-2.5">
                                                        <div className="flex justify-between gap-2">
                                                            <span className="text-gray-500 dark:text-dark-text-muted flex items-center gap-1"><User size={11} /> Buyer</span>
                                                            <span className="font-medium text-gray-800 dark:text-dark-text text-right truncate">{animal.reservedBuyerName || <span className="text-gray-400 dark:text-dark-text-muted font-normal">Unassigned</span>}</span>
                                                        </div>
                                                        {wlName && <div className="flex justify-between gap-2"><span className="text-gray-500 dark:text-dark-text-muted">via Waitlist</span><span className="font-medium text-gray-800 dark:text-dark-text text-right truncate">{wlName}</span></div>}
                                                        <div className="flex justify-between gap-2">
                                                            <span className="text-gray-500 dark:text-dark-text-muted flex items-center gap-1"><DollarSign size={11} /> Price</span>
                                                            <span className="font-medium text-gray-800 dark:text-dark-text">{animal.reservedPrice != null ? `${getCurrencySymbol(animal.reservedPriceCurrency || currency)}${animal.reservedPrice}` : <span className="text-gray-400 dark:text-dark-text-muted font-normal">—</span>}</span>
                                                        </div>
                                                        <div className="flex justify-between gap-2 items-center">
                                                            <span className="text-gray-500 dark:text-dark-text-muted">Deposit{animal.reservedDeposit != null ? ` (${getCurrencySymbol(animal.reservedPriceCurrency || currency)}${animal.reservedDeposit})` : ''}</span>
                                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${DUE_DONE(animal.reservedDepositStatus)}`}>{animal.reservedDepositStatus === 'done' ? 'Done' : 'Due'}</span>
                                                        </div>
                                                        <div className="flex justify-between gap-2 items-center">
                                                            <span className="text-gray-500 dark:text-dark-text-muted">Payment</span>
                                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${DUE_DONE(animal.reservedPaymentStatus)}`}>{animal.reservedPaymentStatus === 'done' ? 'Done' : 'Due'}</span>
                                                        </div>
                                                        {animal.reservedDate && <div className="flex justify-between gap-2"><span className="text-gray-500 dark:text-dark-text-muted flex items-center gap-1"><Calendar size={11} /> Date</span><span className="font-medium text-gray-800 dark:text-dark-text">{formatDate(animal.reservedDate)}</span></div>}
                                                    </div>
                                                )}

                                                {/* Reservation editor */}
                                                {isEditing && (
                                                    <div className="space-y-2.5 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-700/40 rounded-lg p-3">
                                                        <div>
                                                            {/* Buyer / adoptee picker: only show waitlist entries that fit this animal's
                                                                species + genders. Falls back to manual entry when nothing fits. */}
                                                            <label className="text-xs font-medium text-gray-600 dark:text-dark-text-secondary mb-1 block">Buyer / Adoptee (from waitlist or manual)</label>
                                                            {(() => {
                                                                const fitting = activeWaitlist.filter(e => entryFitsAnimal(e, animal));
                                                                const entryLabel = (e) => {
                                                                    const reqs = e.speciesRequests || (e.species ? [{ species: e.species, genders: e.genders || [] }] : []);
                                                                    const spec = reqs.map(r => r.species + ' (' + getGenderCounts(r).map(c => c.count + ' ' + c.gender).join('/') + ')').join(' + ');
                                                                    return `${e.name}${spec ? ` — ${spec}` : ''}`;
                                                                };
                                                                return (
                                                                    <select value={f.waitlistEntryId} onChange={e => setResField(animal, 'waitlistEntryId', e.target.value)} className={inputCls}>
                                                                        <option value="">Manual entry…</option>
                                                                        {fitting.length > 0 ? fitting.map(e => <option key={e._id} value={e._id}>{entryLabel(e)}</option>) : <option value="" disabled className="text-gray-400">No matching waitlist entries</option>}
                                                                    </select>
                                                                );
                                                            })()}
                                                            <input type="text" value={f.buyerName} onChange={e => setResField(animal, 'buyerName', e.target.value)} placeholder="Buyer name" className={`${inputCls} mt-1.5`} />
                                                            <input type="text" value={f.buyerContact} onChange={e => setResField(animal, 'buyerContact', e.target.value)} placeholder="Phone, email, or address" className={`${inputCls} mt-1.5`} />
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-2">
                                                            <div>
                                                                <label className="text-xs font-medium text-gray-600 dark:text-dark-text-secondary mb-1 block">Price ({getCurrencySymbol(f.priceCurrency)})</label>
                                                                <input type="number" min="0" step="0.01" value={f.price} onChange={e => setResField(animal, 'price', e.target.value)} placeholder="0.00" className={inputCls} />
                                                            </div>
                                                            <div>
                                                                <label className="text-xs font-medium text-gray-600 dark:text-dark-text-secondary mb-1 block">Deposit</label>
                                                                <input type="number" min="0" step="0.01" value={f.deposit} onChange={e => setResField(animal, 'deposit', e.target.value)} placeholder="0.00" className={inputCls} />
                                                            </div>
                                                        </div>

                                                        <div className="grid grid-cols-2 gap-2">
                                                            <div>
                                                                <label className="text-xs font-medium text-gray-600 dark:text-dark-text-secondary mb-1 block">Deposit status</label>
                                                                <select value={f.depositStatus} onChange={e => setResField(animal, 'depositStatus', e.target.value)} className={inputCls}>
                                                                    <option value="due">Due</option>
                                                                    <option value="done">Done</option>
                                                                </select>
                                                            </div>
                                                            <div>
                                                                <label className="text-xs font-medium text-gray-600 dark:text-dark-text-secondary mb-1 block">Payment status</label>
                                                                <select value={f.paymentStatus} onChange={e => setResField(animal, 'paymentStatus', e.target.value)} className={inputCls}>
                                                                    <option value="due">Due</option>
                                                                    <option value="done">Done</option>
                                                                </select>
                                                            </div>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-2">
                                                            <div>
                                                                <label className="text-xs font-medium text-gray-600 dark:text-dark-text-secondary mb-1 block">Date</label>
                                                                <input type="date" value={f.date} onChange={e => setResField(animal, 'date', e.target.value)} className={inputCls} />
                                                            </div>
                                                            <div>
                                                                <label className="text-xs font-medium text-gray-600 dark:text-dark-text-secondary mb-1 block">Currency</label>
                                                                <select value={f.priceCurrency} onChange={e => setResField(animal, 'priceCurrency', e.target.value)} className={inputCls}>
                                                                    {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                                                                </select>
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-2 justify-end pt-1">
                                                            <button onClick={() => { setEditingAnimalId(null); setResForms(prev => { const n = { ...prev }; delete n[animal.id_public]; return n; }); }} className="px-2.5 py-1 text-xs text-gray-600 dark:text-dark-text-muted hover:bg-gray-100 dark:hover:bg-dark-surface-hover rounded-lg transition">Cancel</button>
                                                            <button onClick={() => handleSaveReservation(animal)} disabled={resSaving} className="px-2.5 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded-lg font-medium transition disabled:opacity-50 flex items-center gap-1">
                                                                {resSaving ? <Loader2 size={11} className="animate-spin" /> : <Save size={11} />} Save
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="flex gap-2 justify-end flex-wrap">
                                                    {!isEditing && (
                                                        <button onClick={() => setEditingAnimalId(animal.id_public)} className="flex items-center gap-1 text-xs text-gray-500 dark:text-dark-text-muted hover:text-gray-700 dark:hover:text-dark-text hover:bg-gray-100 dark:hover:bg-dark-surface-hover px-2 py-1 rounded-lg transition"><Edit size={11} /> {hasReservation ? 'Edit' : 'Assign'}</button>
                                                    )}
                                                    {hasReservation && !isEditing && (
                                                        <button onClick={() => handleClearReservation(animal)} className="flex items-center gap-1 text-xs text-gray-500 dark:text-dark-text-muted hover:text-gray-700 dark:hover:text-dark-text hover:bg-gray-100 dark:hover:bg-dark-surface-hover px-2 py-1 rounded-lg transition"><Undo2 size={11} /> Clear</button>
                                                    )}
                                                    <button onClick={() => handleRehome(animal)} disabled={rehomingId === animal.id_public}
                                                        className="flex items-center gap-1 text-xs text-white bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 px-2.5 py-1 rounded-lg transition font-medium disabled:opacity-50">
                                                        {rehomingId === animal.id_public ? <Loader2 size={11} className="animate-spin" /> : <Home size={11} />} Rehomed
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </>
                )}

                {activeTab === 'waitlist' && (
                    <>
                        <div className="flex items-center justify-between flex-wrap gap-2">
                            <div className="flex gap-1 bg-gray-100 dark:bg-dark-surface rounded-xl p-1 w-fit">
                                {[['active', `Active (${activeWaitlist.length})`], ['history', `History (${historyWaitlist.length})`]].map(([id, label]) => (
                                    <button key={id} onClick={() => setWaitlistView(id)}
                                        className={`px-4 py-1.5 text-sm font-medium rounded-lg transition ${waitlistView === id ? 'bg-white dark:bg-dark-card-bg text-gray-900 dark:text-dark-text shadow' : 'text-gray-500 dark:text-dark-text-muted hover:text-gray-700 dark:hover:text-dark-text'}`}>
                                        {label}
                                    </button>
                                ))}
                            </div>
                            <button onClick={() => openWlForm(null)}
                                className="flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg font-medium transition">
                                <Plus size={14} /> Add to Waitlist
                            </button>
                        </div>

                        {wlFormVisible && (
                            <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-700/40 rounded-xl p-4 space-y-3">
                                <h4 className="text-sm font-semibold text-green-800 dark:text-green-300">{editingWlId ? 'Edit Waitlist Entry' : 'New Waitlist Entry'}</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs font-medium text-gray-600 dark:text-dark-text-secondary mb-1 block">Name *</label>
                                        <input type="text" value={wlForm.name} onChange={e => setWlForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Jane Doe" className={inputCls} />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-gray-600 dark:text-dark-text-secondary mb-1 block">Contact Info</label>
                                        <input type="text" value={wlForm.contactInfo} onChange={e => setWlForm(f => ({ ...f, contactInfo: e.target.value }))} placeholder="Phone, email, or address" className={inputCls} />
                                    </div>
                                {/* Assigned contact: pick an existing Contacts record, or unlink the current one. */}
                                <div className="mt-2">
                                    <label className="text-[10px] font-medium text-gray-500 dark:text-dark-text-muted block mb-1">Assigned Contact</label>
                                    {wlForm.contactId ? (
                                        <div className="flex items-center justify-between gap-2 p-2.5 border border-green-200 dark:border-green-700/40 rounded-lg bg-white/60 dark:bg-dark-surface/40">
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-gray-800 dark:text-dark-text truncate">{wlForm.contactName || 'Linked contact'}</p>
                                                {wlForm.contactInfo && <p className="text-[11px] text-gray-500 dark:text-dark-text-muted truncate">{wlForm.contactInfo}</p>}
                                            </div>
                                            <div className="flex items-center gap-1 shrink-0">
                                                <button type="button" onClick={() => setWlContactModalOpen(true)} className="px-2 py-1 text-xs text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition">Change</button>
                                                <button type="button" title="Unlink contact" onClick={() => setWlForm(f => ({ ...f, contactId: null, contactName: '' }))} className="px-2 py-1 text-xs text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition">Unlink</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <button type="button" onClick={() => setWlContactModalOpen(true)} className="w-full text-left p-2.5 border border-dashed border-green-300 dark:border-green-700/40 rounded-lg text-sm text-gray-500 dark:text-dark-text-muted hover:border-green-500 dark:hover:border-green-500 transition">
                                            Click to assign a contact
                                        </button>
                                    )}
                                </div>
                                {/* Species requests: one row per species with its own amount + genders */}
                                <div className="space-y-2 mt-2">
                                    <label className="text-[10px] font-medium text-gray-500 dark:text-dark-text-muted block mb-1 flex items-center justify-between">
                                        Species requests
                                        <button type="button" onClick={addWlSpeciesRow} className="text-xs text-green-600 dark:text-green-400 hover:underline px-1">+ Add species</button>
                                    </label>
                                    {wlForm.speciesRequests.map((req, i) => {
                                        const total = GENDER_CHOICES.reduce((s, g) => s + (parseInt(req.counts?.[g], 10) || 0), 0);
                                        const filteredSpecies = speciesOptions.filter(s => !req.species || s.toLowerCase().includes(req.species.toLowerCase()));
                                        return (
                                            <div key={i} className="border border-green-200 dark:border-green-700/40 rounded-lg p-2.5 space-y-2 bg-white/60 dark:bg-dark-surface/40">
                                                <div className="relative">
                                                    <label className="text-[10px] font-medium text-gray-600 dark:text-dark-text-secondary block mb-1">Species {i + 1}</label>
                                                    <input type="text" value={req.species} onChange={e => setWlSpeciesField(i, 'species', e.target.value)} onFocus={() => setWlSpeciesFocus(i)} onBlur={() => setTimeout(() => setWlSpeciesFocus(null), 150)} placeholder="e.g. Fancy Mouse" className={inputCls + ' w-full'} />
                                                    {wlSpeciesFocus === i && speciesOptions.length > 0 && (
                                                        <div className="absolute z-20 w-full bg-white dark:bg-dark-card-bg border border-gray-300 dark:border-dark-text rounded-lg mt-1 max-h-48 overflow-y-auto shadow-lg">
                                                            {filteredSpecies.slice(0, 8).map(s => (
                                                                <button key={s} type="button" onClick={() => { setWlSpeciesField(i, 'species', s); setWlSpeciesFocus(null); }} className="w-full text-left text-xs px-3 py-2 text-gray-800 dark:text-dark-text hover:bg-gray-100 dark:hover:bg-dark-surface-hover transition">{s}</button>
                                                            ))}
                                                            {filteredSpecies.length === 0 && <div className="text-xs text-gray-400 dark:text-dark-text-muted px-3 py-2">No matching species</div>}
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-medium text-gray-600 dark:text-dark-text-secondary block mb-1">How many of each gender? (leave blank for none)</label>
                                                    <div className="grid grid-cols-3 gap-2">
                                                        {GENDER_CHOICES.map(g => (
                                                            <div key={g}>
                                                                <div className="flex items-center gap-1 text-[10px] text-gray-500 dark:text-dark-text-muted mb-0.5">
                                                                    {g === 'Male' ? <Mars size={10} /> : g === 'Female' ? <Venus size={10} /> : <Users size={10} />} {g === 'Any' ? 'Any gender' : g}
                                                                </div>
                                                                <input type="number" min="0" value={req.counts?.[g] ?? ''} onChange={e => setWlCount(i, g, e.target.value)} placeholder="0" aria-label={g + ' count'} className={inputCls + ' w-full'} />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[11px] text-gray-500 dark:text-dark-text-muted">Total: <span className="font-semibold">{total || 1}</span></span>
                                                    {wlForm.speciesRequests.length > 1 && (
                                                        <button type="button" onClick={() => removeWlSpeciesRow(i)} className="text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 px-2 py-1 rounded-lg transition" title="Remove species"><Trash2 size={14} /></button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="mt-2">
                                    <label className="text-[10px] font-medium text-gray-500 dark:text-dark-text-muted block mb-1">Notes</label>
                                    <input type="text" value={wlForm.notes} onChange={e => setWlForm(f => ({ ...f, notes: e.target.value }))} placeholder="Preferences, timing, etc." className={inputCls} />
                                </div>
                                </div>
                                <div className="flex gap-2 justify-end">
                                    <button onClick={() => { setWlFormVisible(false); setEditingWlId(null); setWlForm(EMPTY_WAITLIST_FORM); }} className="px-3 py-1.5 text-sm text-gray-600 dark:text-dark-text-muted hover:bg-gray-100 dark:hover:bg-dark-surface-hover rounded-lg transition">Cancel</button>
                                    <button onClick={handleWlSave} disabled={wlSaving} className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg font-medium transition disabled:opacity-50 flex items-center gap-1">
                                        {wlSaving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />} {editingWlId ? 'Update' : 'Add'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {wlContactModalOpen && (
                            <ContactAssignModal
                                isOpen={wlContactModalOpen}
                                contactOnly
                                target="Contact"
                                API_BASE_URL={API_BASE_URL}
                                authToken={authToken}
                                onClose={() => setWlContactModalOpen(false)}
                                onSelect={(sel) => {
                                    setWlForm(f => ({
                                        ...f,
                                        contactId: sel.contactId || null,
                                        contactName: sel.name || '',
                                        // Assigning a contact replaces the attendee name with the
                                        // contact's display name, so both point at the same person.
                                        // The name stays editable afterwards if it needs tweaking.
                                        name: sel.name || f.name,
                                        // Fill the free-text contact info from the contact's address.
                                        contactInfo: sel.contactInfo || f.contactInfo || '',
                                    }));
                                    setWlContactModalOpen(false);
                                }}
                            />
                        )}

                        {waitlistLoading ? (
                            <div className="text-center py-12 text-gray-500 dark:text-dark-text-muted"><Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin" /> Loading waitlist...</div>
                        ) : shownWaitlist.length === 0 ? (
                            <div className={`${cardCls} text-center py-8 sm:py-12 text-gray-500 dark:text-dark-text-muted`}>
                                <Users className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 text-gray-300 dark:text-dark-border" />
                                <p className="text-base sm:text-lg font-medium">{waitlistView === 'active' ? 'Waitlist is empty' : 'No history yet'}</p>
                                <p className="text-xs sm:text-sm mt-1">{waitlistView === 'active' ? 'Add interested buyers so you can assign them to animals' : 'Finalized entries will show here with their assigned animals'}</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
                                {shownWaitlist.map(entry => {
                                    const ful = computeEntryFulfillment(entry);
                                    return (
                                    <div key={entry._id} className={cardCls}>
                                        <div className="p-3 sm:p-4 space-y-2.5">
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <div className="w-9 h-9 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 flex items-center justify-center flex-shrink-0"><User size={16} /></div>
                                                    <div className="min-w-0">
                                                        <div className="font-semibold text-gray-800 dark:text-dark-text truncate">{entry.name}</div>
                                                        {entry.contactInfo && <div className="text-xs text-gray-500 dark:text-dark-text-muted truncate flex items-center gap-1"><Phone size={10} /> {entry.contactInfo}</div>}
                                                        {entry.contactId && (
                                                            // The attendee name is replaced with the contact's display name when a
                                                            // contact is assigned, so only show the linked contact when it adds
                                                            // information (e.g. the attendee name was edited afterwards).
                                                            (entry.contactName || entry.contactId?.personalName || 'Linked contact') !== entry.name && (
                                                                <div className="text-xs text-green-700 dark:text-green-400 truncate flex items-center gap-1">
                                                                    <User size={10} /> {entry.contactName || (entry.contactId?.personalName || 'Linked contact')}
                                                                </div>
                                                            )
                                                        )}
                                                    </div>
                                                </div>
                                                {waitlistView === 'history' && <span className="text-[11px] bg-gray-100 dark:bg-dark-surface text-gray-500 dark:text-dark-text-muted px-2 py-0.5 rounded-full shrink-0">History</span>}
                                            </div>

                                            <div className="text-xs sm:text-sm space-y-1 bg-gray-50 dark:bg-dark-surface rounded-lg p-2.5">
                                                {ful.isFulfilled && (
                                                    <span className="inline-flex items-center gap-1 text-[10px] bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-2 py-0.5 rounded-full font-medium mb-1"><Check size={10} /> Fulfilled</span>
                                                )}
                                                {ful.progress.map((p, pi) => (
                                                    <div key={pi} className="flex justify-between gap-2 mb-0.5">
                                                        <span className="text-gray-500 dark:text-dark-text-muted flex items-center gap-1"><Tag size={10} /> {p.species}</span>
                                                        <span className="text-right text-[11px]">
                                                            {p.breakdown.map(b => b.count + ' ' + b.gender).join(' / ')}{` • ${p.fulfilled}/${p.requested}`}
                                                        </span>
                                                    </div>
                                                ))}
                                                {ful.progress.length > 1 && (
                                                    <div className="flex justify-between gap-2 border-t border-gray-200 dark:border-dark-text-muted pt-0.5 mt-0.5">
                                                        <span className="text-gray-500 dark:text-dark-text-muted text-[10px]">Total</span>
                                                        <span className={`text-right text-[11px] font-medium ${ful.isFulfilled ? 'text-green-700 dark:text-green-400' : 'text-amber-700 dark:text-amber-400'}`}>{ful.totalFulfilled}/{ful.totalRequested}</span>
                                                    </div>
                                                )}
                                                {entry.notes && <div className="text-gray-600 dark:text-dark-text-secondary pt-1 text-[11px]">{entry.notes}</div>}
                                                {waitlistView === 'history' && (
                                                    <div className="pt-1 border-t border-gray-200 dark:border-dark-border mt-1">
                                                        <div className="text-gray-500 dark:text-dark-text-muted mb-0.5 text-[10px]">Assigned animals</div>
                                                        {ful.assigned.length > 0 ? (
                                                            <div className="flex flex-wrap gap-1">
                                                                {ful.assigned.map((a, i) => (
                                                                    <span key={`${a.id_public}-${i}`} className="inline-flex items-center gap-1 text-[10px] bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-2 py-0.5 rounded-full font-medium"><Check size={10} /> {a.name ? `${a.name} (${a.id_public})` : a.id_public}</span>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <div className="text-gray-400 dark:text-dark-text-muted italic text-[11px]">None assigned via picker</div>
                                                        )}
                                                        {entry.finalizedAt && <div className="text-[11px] text-gray-400 dark:text-dark-text-muted mt-1">Finalized {formatDate(entry.finalizedAt)}</div>}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex gap-2 justify-end flex-wrap">
                                                {waitlistView === 'active' ? (
                                                    <>
                                                        <button onClick={() => openWlForm(entry)} className="flex items-center gap-1 text-xs text-gray-500 dark:text-dark-text-muted hover:text-gray-700 dark:hover:text-dark-text hover:bg-gray-100 dark:hover:bg-dark-surface-hover px-2 py-1 rounded-lg transition"><Edit size={11} /> Edit</button>
                                                        <button onClick={() => handleWlDelete(entry._id)} className="flex items-center gap-1 text-xs text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 px-2 py-1 rounded-lg transition"><Trash2 size={11} /> Delete</button>
                                                        <button onClick={() => handleWlFinalize(entry)} className="flex items-center gap-1 text-xs text-white bg-green-600 hover:bg-green-700 px-2.5 py-1 rounded-lg transition font-medium"><CheckCircle size={11} /> Finalize</button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button onClick={() => handleWlReactivate(entry)} className="flex items-center gap-1 text-xs text-gray-500 dark:text-dark-text-muted hover:text-gray-700 dark:hover:text-dark-text hover:bg-gray-100 dark:hover:bg-dark-surface-hover px-2 py-1 rounded-lg transition"><Undo2 size={11} /> Reactivate</button>
                                                        <button onClick={() => handleWlDelete(entry._id)} className="flex items-center gap-1 text-xs text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 px-2 py-1 rounded-lg transition"><Trash2 size={11} /> Delete</button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    );
                                })}
                            </div>
                        )}
                    </>
                )}

                {activeTab === 'animals' && saleAnimals.some(a => (a.reservedPaymentStatus || 'due') === 'due' && a.reservedBuyerName) && (
                    <div className="flex items-start gap-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/60 rounded-xl p-3">
                        <AlertTriangle size={16} className="text-amber-500 dark:text-amber-400 mt-0.5 shrink-0" />
                        <div className="text-sm text-amber-700 dark:text-amber-300">
                            <span className="font-semibold">Payments due:</span> {saleAnimals.filter(a => (a.reservedPaymentStatus || 'due') === 'due' && a.reservedBuyerName).map(a => a.name || a.id_public).join(', ')}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReservationsPage;

