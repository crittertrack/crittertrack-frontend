import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ClipboardList, Users, Plus, Edit, Trash2, Search, Loader2, Save, Check, CheckCircle, Undo2, RefreshCw, User, Phone, Tag, Mars, Venus, PawPrint, Home, DollarSign, Calendar, AlertTriangle, ArrowUp, ArrowDown, ChevronDown, ChevronRight } from 'lucide-react';
import apiClient from '../utils/apiClient';
import AnimalImage from './shared/AnimalImage';
import InfoButton from './shared/InfoButton';
import { formatDate } from '../utils/dateFormatter';
import { getCurrencySymbol } from '../utils/locationUtils';
import { formatAnimalDisplayName } from '../utils/animalDisplayName';
import ContactAssignModal from './Contacts/ContactAssignModal';

const EMPTY_WAITLIST_FORM = { name: '', contactInfo: '', contactId: null, contactName: '', entryDate: new Date().toISOString().slice(0, 10), speciesRequests: [{ species: '', counts: { Male: '', Female: '', Any: '' } }], notes: '' };
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
    // Waitlist sort preference: 'oldest' (entryDate ASC, default) | 'newest' (entryDate DESC)
    // | 'manual' (custom order, driven by the chevrons on each card).
    const [wlSort, setWlSort] = useState(() => {
        const saved = localStorage.getItem('wlSort');
        return saved === 'newest' || saved === 'manual' ? saved : 'oldest';
    });
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
    const [paymentFilter, setPaymentFilter] = useState(''); // '' | 'due' | 'done'
    // Shared with Budget Tracker + Supplies currency pickers (same localStorage key).
    const [currency, setCurrency] = useState(() => localStorage.getItem('budgetCurrency') || 'USD');

    // Per-animal reservation editor state, keyed by id_public.
    const [resForms, setResForms] = useState({});
    // The page-level currency drives every per-animal currency dropdown: flipping it also
    // rewrites reservation drafts that are already open, so one change at the top is enough.
    const handleCurrencyChange = (c) => {
        setCurrency(c);
        localStorage.setItem('budgetCurrency', c);
        setResForms(prev => {
            const next = { ...prev };
            Object.keys(next).forEach(id => { next[id] = { ...next[id], priceCurrency: c }; });
            return next;
        });
    };
    const [editingAnimalId, setEditingAnimalId] = useState(null);
    const [resSaving, setResSaving] = useState(false);
    const [rehomingId, setRehomingId] = useState(null);
    // Spinner lock for the card's quick "Paid" action.
    const [paidSavingId, setPaidSavingId] = useState(null);
    // Contacts book — used to spot buyers whose contact is linked to a CritterTrack
    // account (linkedCTUID), so rehoming can offer a true ownership transfer.
    const [contacts, setContacts] = useState([]);

    // Waitlist add/edit form
    const [wlFormVisible, setWlFormVisible] = useState(false);
    const [editingWlId, setEditingWlId] = useState(null);
    const [wlForm, setWlForm] = useState(EMPTY_WAITLIST_FORM);
    const [wlSaving, setWlSaving] = useState(false);
    // Contact picker for the waitlist form (assign an existing Contacts record).
    const [wlContactModalOpen, setWlContactModalOpen] = useState(false);
    const [expandedSpecGroups, setExpandedSpecGroups] = useState({});

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
            // The requested order is passed through so the server returns the entries in
            // that order too (the client re-sorts as well, so both agree).
            const res = await apiClient.get('/waitlist', { params: { sort: wlSort } });
            setWaitlist(res.data || []);
        } catch (err) { console.error('[fetchWaitlist]', err); }
        setWaitlistLoading(false);
    }, [authToken, wlSort]);

    const fetchSpecies = useCallback(async () => {
        try {
            const res = await apiClient.get('/species');
            setSpeciesOptions((res.data || []).map(s => s.name).filter(Boolean));
        } catch (err) { console.error('[fetchSpecies]', err); setSpeciesOptions([]); }
    }, []);

    const fetchContacts = useCallback(async () => {
        if (!authToken) return;
        try {
            const res = await apiClient.get('/contacts');
            setContacts(res.data || []);
        } catch (err) { console.error('[fetchReservationContacts]', err); }
    }, [authToken]);

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
    useEffect(() => { fetchContacts(); }, [fetchContacts]);

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

    // Fulfillment for one species request, counted per gender.
    //
    // Every gender gets its own counter (Female / Male / Any) showing how many animals
    // of that gender are assigned against how many were requested for it.
    //
    // Gender-specific demands are filled first; whatever is left over (extra females,
    // extra males, other genders) can then satisfy an "Any" demand.
    const computeRequestFulfillment = (req, assignedAnimals) => {
        const same = (assignedAnimals || []).filter(a => a.species && a.species.toLowerCase() === (req.species || '').toLowerCase());
        const counts = getGenderCounts(req);
        const requestedFor = (g) => counts.filter(c => c.gender === g).reduce((s, c) => s + c.count, 0);
        const assignedFor = (g) => same.filter(a => a.gender === g).length;

        const cFemale = requestedFor('Female');
        const cMale = requestedFor('Male');
        const cAny = requestedFor('Any');
        const aFemale = assignedFor('Female');
        const aMale = assignedFor('Male');

        // Gender-specific demands are satisfied first…
        const usedFemale = Math.min(aFemale, cFemale);
        const usedMale = Math.min(aMale, cMale);
        // …and everything that is left over can fill an "Any" demand.
        const leftovers = Math.max(0, same.length - usedFemale - usedMale);

        const requested = cFemale + cMale + cAny;
        const fulfilled = usedFemale + usedMale + Math.min(leftovers, cAny);
        // Uncapped: every assigned animal of this species, so extra assignments stay visible.
        const matched = same.length;

        // One counter per gender that was actually asked for. The counters are uncapped
        // (an over-assignment shows as e.g. 2/1 instead of being hidden behind the cap).
        const genderCounters = [
            { gender: 'Female', requested: cFemale, matched: aFemale },
            { gender: 'Male', requested: cMale, matched: aMale },
            { gender: 'Any', requested: cAny, matched: cAny > 0 ? leftovers : 0 },
        ].filter(c => c.requested > 0);

        return {
            ...req,
            breakdown: counts,
            requested,
            fulfilled,
            matched,
            genderCounters,
            remaining: Math.max(0, requested - fulfilled),
            isFulfilled: fulfilled >= requested,
        };
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
                prefix: existing.prefix || a.prefix,
                suffix: existing.suffix || a.suffix,
                species: existing.species || a.species,
                gender: existing.gender || a.gender,
                // The reservation money comes from the live animal (the snapshot only
                // exists on finalized entries).
                reservedPrice: existing.reservedPrice ?? a.reservedPrice ?? null,
                reservedPriceCurrency: existing.reservedPriceCurrency || a.reservedPriceCurrency || null,
                reservedDeposit: existing.reservedDeposit ?? a.reservedDeposit ?? null,
                reservedDepositStatus: existing.reservedDepositStatus ?? a.reservedDepositStatus ?? null,
                reservedPaymentStatus: existing.reservedPaymentStatus ?? a.reservedPaymentStatus ?? null,
            });
        });
        return Array.from(byId.values());
    };

    // The deposit/payment still outstanding for an entry's assigned animals.
    //
    // Each animal carries its own reservation money, and the money can be in different
    // currencies, so the totals are grouped per currency rather than summed blindly.
    //
    // The deposit is PART OF the price, not on top of it: with a price of 75 and a
    // paid deposit of 25, the outstanding payment is 50. The two figures therefore
    // always add up to what is still owed, and never double-count:
    //
    //   deposit due = the charged deposit, while it has not been paid yet
    //   payment due = the price minus the deposit (the balance), while the
    //                 payment is not marked done
    //
    //   price 75, deposit 25 unpaid -> 25 deposit due + 50 payment due = 75 owed
    //   price 75, deposit 25 paid   ->  0 deposit due + 50 payment due = 50 owed
    //   price 75, no deposit        ->  0 deposit due + 75 payment due = 75 owed
    const computeEntryTotals = (assigned) => {
        const byCurrency = new Map();
        const addTo = (currency, key, amount) => {
            const c = currency || 'USD';
            if (!byCurrency.has(c)) byCurrency.set(c, { currency: c, depositDue: 0, paymentDue: 0, totalPrice: 0 });
            byCurrency.get(c)[key] += amount;
        };
        (assigned || []).forEach(a => {
            const currency = a.reservedPriceCurrency || 'USD';
            const deposit = parseFloat(a.reservedDeposit) || 0;
            const price = a.reservedPrice != null ? Number(a.reservedPrice) || 0 : 0;
            if (price > 0) addTo(currency, 'totalPrice', price);
            // A deposit that is charged and not yet marked paid.
            if (deposit > 0 && a.reservedDepositStatus !== 'done') addTo(currency, 'depositDue', deposit);
            // The outstanding payment is the balance: the price minus the deposit
            // (the deposit is part of the price). Never below zero.
            if (price > 0 && a.reservedPaymentStatus !== 'done') {
                addTo(currency, 'paymentDue', Math.max(0, price - deposit));
            }
        });
        return Array.from(byCurrency.values()).filter(t => t.depositDue > 0 || t.paymentDue > 0);
    };

    const computeEntryFulfillment = (entry) => {
        const reqs = entry.speciesRequests || (entry.species ? [{ species: entry.species, genders: entry.genders || [], amount: entry.amount }] : []);
        const assigned = getEntryAssignedAnimals(entry);
        const progress = reqs.map(r => computeRequestFulfillment(r, assigned));
        return {
            progress,
            assigned,
            totals: computeEntryTotals(assigned),
            totalRequested: progress.reduce((s, p) => s + p.requested, 0),
            totalFulfilled: progress.reduce((s, p) => s + p.fulfilled, 0),
            // Uncapped: summed across requests, so over-assignment stays visible.
            totalMatched: progress.reduce((s, p) => s + p.matched, 0),
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
            // Payment filter: only reserved animals carry a payment status, so unassigned
            // animals drop out of both the Due and Done views.
            .filter(a => !paymentFilter || (isAssigned(a) && ((a.reservedPaymentStatus || 'due') === paymentFilter)))
            .filter(a => !q || [a.name, a.prefix, a.suffix, a.id_public, a.species, a.breed, a.reservedBuyerName].filter(Boolean).join(' ').toLowerCase().includes(q))
            .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    }, [baseSaleAnimals, searchTerm, speciesFilter, genderFilter, statusFilter, assignedFilter, paymentFilter]);
    const filtersActive = !!(speciesFilter || genderFilter || statusFilter || assignedFilter !== 'all' || paymentFilter || searchTerm.trim());
    const clearFilters = () => { setSpeciesFilter(''); setGenderFilter(''); setStatusFilter(''); setAssignedFilter('all'); setPaymentFilter(''); setSearchTerm(''); };

    const activeWaitlist = useMemo(() => waitlist.filter(e => e.isActive !== false), [waitlist]);
    const historyWaitlist = useMemo(() => waitlist.filter(e => e.isActive === false), [waitlist]);
    const shownWaitlist = waitlistView === 'active' ? activeWaitlist : historyWaitlist;

    // Waitlist sort: 'oldest' / 'newest' by entryDate, 'manual' = the custom order set
    // with the chevrons on each card.
    //
    // In the custom order, entries that have never been positioned (sortOrder 0) go
    // LAST — otherwise every newly added entry jumped to the top and scrambled the
    // order the user had set.
    const sortedWaitlist = useMemo(() => {
        const entries = [...shownWaitlist];
        const byEntryDate = (a, b) => {
            const da = new Date(a.entryDate || a.createdAt).getTime();
            const db = new Date(b.entryDate || b.createdAt).getTime();
            return da - db;
        };
        if (wlSort === 'manual') {
            return entries.sort((a, b) => {
                const sa = a.sortOrder > 0 ? a.sortOrder : Infinity;
                const sb = b.sortOrder > 0 ? b.sortOrder : Infinity;
                if (sa !== sb) return sa - sb;
                return byEntryDate(a, b);
            });
        }
        return entries.sort((a, b) => (wlSort === 'oldest' ? byEntryDate(a, b) : byEntryDate(b, a)));
    }, [shownWaitlist, wlSort]);

    // Seed/clear an animal's inline editor from its stored reservation.
    // Currency is the exception: it always follows the page-level currency toggle (not the
    // stored value), so flipping the toggle at the top sets every animal's dropdown at once.
    const seedResForm = (animal) => ({
        buyerName: animal.reservedBuyerName || '',
        buyerContact: animal.reservedBuyerContact || '',
        waitlistEntryId: animal.reservedWaitlistEntryId ? String(animal.reservedWaitlistEntryId) : '',
        // When the animal already has a public sale price, pre-fill the reservation editor's
        // price/currency so the seller doesn't have to re-enter it.
        price: animal.reservedPrice ?? (animal.isForSale && animal.salePriceAmount != null ? animal.salePriceAmount : ''),
        priceCurrency: animal.reservedPriceCurrency || (animal.isForSale && animal.salePriceCurrency ? animal.salePriceCurrency : currency),
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
            const isBooking = !!f.buyerName?.trim();
            const salePrice = f.price !== '' && f.price != null ? Number(f.price) : null;
            const status = isBooking ? 'Booked' : 'Available';
            // Only mirror the reservation price to the public sale listing when the animal
            // is Available. When Booked, remove the public sale listing.
            const isForSale = status === 'Available' && salePrice != null;
            const payload = {
                reservedBuyerName: f.buyerName?.trim() || null,
                reservedBuyerContact: f.buyerContact?.trim() || null,
                reservedWaitlistEntryId: f.waitlistEntryId || null,
                reservedPrice: salePrice,
                reservedPriceCurrency: f.priceCurrency || currency,
                reservedDeposit: f.deposit !== '' && f.deposit != null ? Number(f.deposit) : null,
                reservedDepositStatus: f.depositStatus || 'due',
                reservedPaymentStatus: f.paymentStatus || 'due',
                reservedDate: f.date || null,
                status,
                isForSale,
                salePriceAmount: isForSale ? salePrice : null,
                salePriceCurrency: isForSale ? (f.priceCurrency || currency) : null,
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

    // Quick action: flip the reservation's payment status to Done without opening the editor.
    const handleMarkPaid = async (animal) => {
        setPaidSavingId(animal.id_public);
        try {
            await apiClient.put(`/animals/${animal.id_public}`, { reservedPaymentStatus: 'done' });
            setAnimals(prev => prev.map(a => (a.id_public === animal.id_public ? { ...a, reservedPaymentStatus: 'done' } : a)));
            // Keep an open editor draft in sync so the select doesn't show a stale value.
            setResForms(prev => prev[animal.id_public]
                ? { ...prev, [animal.id_public]: { ...prev[animal.id_public], paymentStatus: 'done' } }
                : prev);
            window.dispatchEvent(new Event('animals-changed'));
            showModalMessage?.('Success', `${animal.name || animal.id_public} marked as paid`);
        } catch (err) {
            console.error('[markPaid]', err);
            showModalMessage?.('Error', err.response?.data?.message || 'Failed to mark payment as done');
        }
        setPaidSavingId(null);
    };

    // Find the Contacts record behind a reservation's buyer, so rehoming can offer a true
    // transfer when that contact is linked to a CritterTrack account (linkedCTUID).
    // Sources: the waitlist entry the reservation came from (only while the buyer name still
    // matches that entry — a manually overridden buyer disqualifies it), then an exact
    // name match against the contacts book. Returns the contact's linkedCTUID or null.
    const findLinkedBuyerCtuid = (animal, buyer) => {
        if (!buyer) return null;
        const norm = (s) => (s || '').trim().toLowerCase();
        const b = norm(buyer);
        const entry = animal.reservedWaitlistEntryId
            ? waitlist.find(e => String(e._id) === String(animal.reservedWaitlistEntryId))
            : null;
        if (entry) {
            // The waitlist route populates contactId; fall back to the fetched list for plain ids.
            const entryContact = entry.contactId && typeof entry.contactId === 'object'
                ? entry.contactId
                : contacts.find(c => String(c._id) === String(entry.contactId));
            if (entryContact?.linkedCTUID && (b === norm(entry.name) || b === norm(entryContact.personalName) || b === norm(entryContact.breederName))) {
                return entryContact.linkedCTUID;
            }
        }
        const match = contacts.find(c => c.linkedCTUID && (b === norm(c.personalName) || b === norm(c.breederName)));
        return match ? match.linkedCTUID : null;
    };

    // Resolve a contact's linkedCTUID to a CritterTrack account and, when the user confirms,
    // send a real ownership-transfer request for the rehomed animal (the buyer accepts it
    // from their own account). Failures never undo the rehome itself.
    const maybeSendTrueTransfer = async (animal, buyer, ctuid, price) => {
        try {
            const res = await apiClient.get('/public/profiles/search', { params: { query: ctuid, limit: 10 } });
            const results = res.data || [];
            // linkedCTUID may be formatted ("CTU-1") while id_public is stored plain ("CTU1").
            const norm = (s) => String(s || '').replace(/[^A-Za-z0-9]/g, '').toUpperCase();
            const recipient = results.find(u => norm(u.id_public) === norm(ctuid)) || (results.length === 1 ? results[0] : null);
            if (!recipient?.userId_backend) return;
            if (!window.confirm(`${buyer} is linked to CritterTrack account ${ctuid}. Send a true transfer of ${animal.name || animal.id_public} to their account? They must accept to take ownership.`)) return;
            await apiClient.post('/transfers', {
                animalId_public: animal.id_public,
                toUserId: recipient.userId_backend,
                price: price ?? 0,
                notes: `Recorded via Reservations (rehome sale to ${buyer})`,
                transferType: 'sale',
            });
            showModalMessage?.('Success', `Transfer of ${animal.name || animal.id_public} to ${buyer} (${ctuid}) requested — they must accept to take ownership`);
        } catch (err) {
            console.error('[rehomeTransfer]', err);
            showModalMessage?.('Error', `Rehomed, but the transfer to ${buyer} failed: ${err.response?.data?.message || err.message}`);
        }
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
        // Prefer CTUID-linked ownership over free-text manualownerName.
        const linkedCtuid = findLinkedBuyerCtuid(animal, buyer);
        setRehomingId(animal.id_public);
        try {
            const payload = {
                saleDate,
                salePrice: price,
                saleRecordCurrency: resForm.priceCurrency || animal.reservedPriceCurrency || 'USD',
                buyerName: buyer,
                buyerContact: resForm.buyerContact?.trim() || animal.reservedBuyerContact || null,
                ...(linkedCtuid ? { ownerId_public: linkedCtuid } : { manualownerName: buyer }),
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
            if (linkedCtuid) await maybeSendTrueTransfer(animal, buyer, linkedCtuid, price);
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
                entryDate: entry.entryDate ? new Date(entry.entryDate).toISOString().slice(0, 10) : '',
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
                entryDate: wlForm.entryDate || undefined,
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
        // Collect assigned animals that have sale info (buyer + price) and can be auto-rehomed.
        const assignedAnimals = getEntryAssignedAnimals(entry);
        const animalsToRehome = assignedAnimals.filter(a => {
            const animal = animals.find(an => an.id_public === a.id_public);
            return animal && animal.reservedBuyerName && animal.reservedPrice != null;
        });

        const rehomeNote = animalsToRehome.length > 0
            ? `\n\n${animalsToRehome.length} assigned animal(s) will also be rehomed (sale logged to Budget).`
            : '';
        if (!window.confirm(`Finalize ${entry.name}? This moves them to history.${rehomeNote}`)) return;

        try {
            // Finalize first so the assigned-animal snapshot is captured before reservation links are cleared.
            const res = await apiClient.post(`/waitlist/${entry._id}/finalize`);
            setWaitlist(prev => prev.map(e => (e._id === entry._id ? { ...e, ...res.data } : e)));

            // Then rehome each assigned animal that has sale info.
            let rehomedCount = 0;
            for (const animal of animalsToRehome) {
                const fullAnimal = animals.find(an => an.id_public === animal.id_public);
                if (!fullAnimal) continue;
                const saleDate = fullAnimal.reservedDate
                    ? new Date(fullAnimal.reservedDate).toISOString().slice(0, 10)
                    : todayStr();
                try {
                    await apiClient.put(`/animals/${animal.id_public}`, {
                        saleDate,
                        salePrice: fullAnimal.reservedPrice,
                        saleRecordCurrency: fullAnimal.reservedPriceCurrency || 'USD',
                        buyerName: fullAnimal.reservedBuyerName,
                        buyerContact: fullAnimal.reservedBuyerContact || null,
                        reservedBuyerName: null, reservedBuyerContact: null, reservedWaitlistEntryId: null,
                        reservedPrice: null, reservedDeposit: null, reservedDate: null,
                        reservedDepositStatus: null, reservedPaymentStatus: null,
                        status: 'Rehomed', archived: true,
                    });
                    setAnimals(prev => prev.map(a => (a.id_public === animal.id_public
                        ? { ...a, status: 'Rehomed', archived: true,
                            reservedBuyerName: null, reservedBuyerContact: null, reservedWaitlistEntryId: null,
                            reservedPrice: null, reservedDeposit: null, reservedDate: null,
                            reservedDepositStatus: null, reservedPaymentStatus: null,
                            saleDate, salePrice: fullAnimal.reservedPrice,
                            saleRecordCurrency: fullAnimal.reservedPriceCurrency || 'USD',
                            buyerName: fullAnimal.reservedBuyerName,
                            buyerContact: fullAnimal.reservedBuyerContact || null }
                        : a)));
                    rehomedCount++;
                } catch (rehomeErr) {
                    console.error(`[finalizeWaitlist] Rehome failed for ${animal.id_public}:`, rehomeErr);
                }
            }

            const msg = animalsToRehome.length > 0
                ? `${entry.name} moved to history — ${rehomedCount}/${animalsToRehome.length} animal(s) rehomed.`
                : `${entry.name} moved to history`;
            showModalMessage?.('Success', msg);
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

    // Move a waitlist entry up/down one position by reordering the whole active list
    // and persisting the new sortOrder to the backend. Switches to manual sort mode
    // (this is the "override" the chevrons apply over the oldest/newest default).
    const handleWlMoveUp = async (entry) => {
        const idx = sortedWaitlist.findIndex(e => e._id === entry._id);
        if (idx <= 0) return;
        const ordered = [...sortedWaitlist];
        [ordered[idx - 1], ordered[idx]] = [ordered[idx], ordered[idx - 1]];
        await reorderWaitlist(ordered);
    };

    const handleWlMoveDown = async (entry) => {
        const idx = sortedWaitlist.findIndex(e => e._id === entry._id);
        if (idx < 0 || idx >= sortedWaitlist.length - 1) return;
        const ordered = [...sortedWaitlist];
        [ordered[idx], ordered[idx + 1]] = [ordered[idx + 1], ordered[idx]];
        await reorderWaitlist(ordered);
    };

    // Persist the new order. The active list is sent first (in its new order) and the
    // remaining entries follow, so every entry ends up with a unique position — otherwise
    // two entries could share the same sortOrder and their relative order would flicker.
    const reorderWaitlist = async (orderedActive) => {
        try {
            const orderedIds = [
                ...orderedActive.map(e => e._id),
                ...waitlist.filter(e => !orderedActive.some(a => a._id === e._id)).map(e => e._id),
            ];
            await apiClient.post('/waitlist/reorder', { orderedIds });
            setWlSort('manual');
            localStorage.setItem('wlSort', 'manual');
            await fetchWaitlist();
            showModalMessage?.('Success', 'Waitlist order updated');
        } catch (err) {
            console.error('[reorderWaitlist]', err);
            showModalMessage?.('Error', 'Failed to reorder waitlist entry');
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
                            title="Sets the currency across this page, including every reservation's currency dropdown">
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
                        {/* Outstanding payments up top so overdue buyers are seen first */}
                        {saleAnimals.some(a => (a.reservedPaymentStatus || 'due') === 'due' && a.reservedBuyerName) && (
                            <div className="flex items-start gap-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/60 rounded-xl p-3">
                                <AlertTriangle size={16} className="text-amber-500 dark:text-amber-400 mt-0.5 shrink-0" />
                                <div className="text-sm text-amber-700 dark:text-amber-300">
                                    <span className="font-semibold">Payments due:</span> {saleAnimals.filter(a => (a.reservedPaymentStatus || 'due') === 'due' && a.reservedBuyerName).map(a => formatAnimalDisplayName(a)).join(', ')}
                                </div>
                            </div>
                        )}
                        <div className={`${cardCls} p-2 sm:p-4 mb-4`}>
                            <div className="relative">
                                <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-dark-text-muted w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                                <input type="text" placeholder="Search animals, species, buyers..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                                    className="w-full pl-8 sm:pl-10 pr-2 sm:pr-3 py-1.5 sm:py-2 text-sm border border-gray-300 dark:border-dark-text-muted bg-white dark:bg-dark-card-bg text-gray-900 dark:text-dark-text dark:placeholder-dark-text-muted rounded-lg focus:ring-primary focus:border-primary" />
                            </div>
                            <div className="grid grid-cols-2 lg:grid-cols-5 gap-2 mt-2">
                                {[
                                    { label: 'Species', value: speciesFilter, set: setSpeciesFilter, all: 'All species', opts: filterSpeciesOptions.map(s => [s, s]) },
                                    { label: 'Gender', value: genderFilter, set: setGenderFilter, all: 'All genders', opts: filterGenderOptions.map(g => [g, g]) },
                                    { label: 'Status', value: statusFilter, set: setStatusFilter, all: 'Available & Booked', opts: [['Available', 'Available'], ['Booked', 'Booked']] },
                                    { label: 'Assigned', value: assignedFilter, set: setAssignedFilter, all: null, opts: [['all', 'All'], ['assigned', 'Assigned'], ['unassigned', 'Unassigned']] },
                                    { label: 'Payment', value: paymentFilter, set: setPaymentFilter, all: 'All payments', opts: [['due', 'Due'], ['done', 'Done']] },
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
                                    // Stored deposit amount (read mode); 0/none = deposits not used for this animal.
                                    const depositAmt = parseFloat(animal.reservedDeposit) || 0;
                                    // The balance still to pay: the full price minus the deposit (the
                                    // deposit is part of the price, not on top of it).
                                    const fullPriceAmt = animal.reservedPrice != null ? Number(animal.reservedPrice) || 0 : 0;
                                    const paymentBalance = Math.max(0, fullPriceAmt - depositAmt);
                                    const wlEntry = animal.reservedWaitlistEntryId
                                        ? waitlist.find(e => String(e._id) === String(animal.reservedWaitlistEntryId))
                                        : null;
                                    const wlName = wlEntry?.name || null;
                                    // The buyer name is copied from the waitlist entry when one is picked,
                                    // so only show "via Waitlist" when it adds information.
                                    const showWlName = !!wlName && wlName !== animal.reservedBuyerName;
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
                                                        {/* Prefix + name + suffix, so the animal shows with its full
                                                            display name (matching the rest of the app). */}
                                                        <div className="flex items-baseline gap-2 flex-wrap min-w-0">
                                                            <div className="font-semibold text-gray-800 dark:text-dark-text truncate">{formatAnimalDisplayName(animal)}</div>
                                                            <div className="text-xs text-gray-500 dark:text-dark-text-muted font-mono shrink-0">{animal.id_public}</div>
                                                        </div>
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
                                                        <div className="flex justify-between gap-2 items-start">
                                                            <span className="text-gray-500 dark:text-dark-text-muted flex items-center gap-1 shrink-0"><User size={11} /> Buyer</span>
                                                            {/* A long buyer name wraps onto a second line inside its own
                                                                column — the label stays put instead of the row jumping. */}
                                                            <span className="font-medium text-gray-800 dark:text-dark-text text-right min-w-0 break-words">{animal.reservedBuyerName || <span className="text-gray-400 dark:text-dark-text-muted font-normal">Unassigned</span>}</span>
                                                        </div>
                                                        {showWlName && <div className="flex justify-between gap-2 items-start"><span className="text-gray-500 dark:text-dark-text-muted shrink-0">via Waitlist</span><span className="font-medium text-gray-800 dark:text-dark-text text-right min-w-0 break-words">{wlName}</span></div>}
                                                        <div className="flex justify-between gap-2">
                                                            {/* "Full price" is the total price of the animal — the deposit is
                                                                part of it, not on top of it. */}
                                                            <span className="text-gray-500 dark:text-dark-text-muted flex items-center gap-1"><DollarSign size={11} /> Full price</span>
                                                            <span className="font-medium text-gray-800 dark:text-dark-text">{animal.reservedPrice != null ? `${getCurrencySymbol(animal.reservedPriceCurrency || currency)}${animal.reservedPrice}` : <span className="text-gray-400 dark:text-dark-text-muted font-normal">—</span>}</span>
                                                        </div>
                                                        <div className="flex justify-between gap-2 items-center">
                                                            <span className="text-gray-500 dark:text-dark-text-muted">Deposit{depositAmt > 0 ? ` (${getCurrencySymbol(animal.reservedPriceCurrency || currency)}${animal.reservedDeposit})` : ''}</span>
                                                            {/* Due/Done only means something when a deposit is actually charged */}
                                                            {depositAmt > 0 ? (
                                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${DUE_DONE(animal.reservedDepositStatus)}`}>{animal.reservedDepositStatus === 'done' ? 'Done' : 'Due'}</span>
                                                            ) : (
                                                                <span className="text-gray-400 dark:text-dark-text-muted font-normal">—</span>
                                                            )}
                                                        </div>
                                                        <div className="flex justify-between gap-2 items-center">
                                                            <span className="text-gray-500 dark:text-dark-text-muted">Payment</span>
                                                            <span className="flex items-center gap-1.5">
                                                                {/* The balance still to pay: the full price minus the deposit. */}
                                                                {paymentBalance > 0 && (
                                                                    <span className="text-[11px] text-gray-600 dark:text-dark-text-secondary">
                                                                        {getCurrencySymbol(animal.reservedPriceCurrency || currency)}{paymentBalance}
                                                                    </span>
                                                                )}
                                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${DUE_DONE(animal.reservedPaymentStatus)}`}>{animal.reservedPaymentStatus === 'done' ? 'Done' : 'Due'}</span>
                                                            </span>
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
                                                            <label htmlFor={`wlBuyerPicker-${animal.id_public}`} className="text-xs font-medium text-gray-600 dark:text-dark-text-secondary mb-1 block">Buyer / Adoptee (from waitlist or manual)</label>
                                                            {(() => {
                                                                const fitting = activeWaitlist.filter(e => entryFitsAnimal(e, animal));
                                                                const entryLabel = (e) => {
                                                                    const reqs = e.speciesRequests || (e.species ? [{ species: e.species, genders: e.genders || [] }] : []);
                                                                    const spec = reqs.map(r => r.species + ' (' + getGenderCounts(r).map(c => c.count + ' ' + c.gender).join('/') + ')').join(' + ');
                                                                    return `${e.name}${spec ? ` — ${spec}` : ''}`;
                                                                };
                                                                return (
                                                                    <select id={`wlBuyerPicker-${animal.id_public}`} value={f.waitlistEntryId} onChange={e => setResField(animal, 'waitlistEntryId', e.target.value)} className={inputCls}>
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

                                                        {/* Payment status sits under Price, Deposit status under Deposit so each
                                                            status pairs with its own amount. Deposit status is only shown when a
                                                            deposit is actually charged (> 0) — "Due" means nothing without one. */}
                                                        <div className="grid grid-cols-2 gap-2">
                                                            <div>
                                                                <label htmlFor={`payStatus-${animal.id_public}`} className="text-xs font-medium text-gray-600 dark:text-dark-text-secondary mb-1 block">Payment status</label>
                                                                <select id={`payStatus-${animal.id_public}`} value={f.paymentStatus} onChange={e => setResField(animal, 'paymentStatus', e.target.value)} className={inputCls}>
                                                                    <option value="due">Due</option>
                                                                    <option value="done">Done</option>
                                                                </select>
                                                            </div>
                                                            {(parseFloat(f.deposit) || 0) > 0 && (
                                                                <div>
                                                                    <label htmlFor={`depStatus-${animal.id_public}`} className="text-xs font-medium text-gray-600 dark:text-dark-text-secondary mb-1 block">Deposit status</label>
                                                                    <select id={`depStatus-${animal.id_public}`} value={f.depositStatus} onChange={e => setResField(animal, 'depositStatus', e.target.value)} className={inputCls}>
                                                                        <option value="due">Due</option>
                                                                        <option value="done">Done</option>
                                                                    </select>
                                                                </div>
                                                            )}
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
                                                    {/* Quick "Paid" — only while the payment is still outstanding. */}
                                                    {hasReservation && !isEditing && animal.reservedPaymentStatus !== 'done' && (
                                                        <button onClick={() => handleMarkPaid(animal)} disabled={paidSavingId === animal.id_public} title="Mark payment as done"
                                                            className="flex items-center gap-1 text-xs text-green-700 dark:text-green-400 border border-green-500/60 hover:bg-green-50 dark:hover:bg-green-900/20 px-2 py-1 rounded-lg transition font-medium disabled:opacity-50">
                                                            {paidSavingId === animal.id_public ? <Loader2 size={11} className="animate-spin" /> : <Check size={11} />} Paid
                                                        </button>
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
                            <div className="flex gap-1 bg-gray-100 dark:bg-dark-surface rounded-xl p-1 w-fit">
                                {[
                                    ['oldest', 'Oldest → Newest'],
                                    ['newest', 'Newest → Oldest'],
                                    ['manual', 'Custom order'],
                                ].map(([id, label]) => (
                                    <button key={id} onClick={() => { setWlSort(id); localStorage.setItem('wlSort', id); }}
                                        className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${wlSort === id ? 'bg-white dark:bg-dark-card-bg text-gray-900 dark:text-dark-text shadow' : 'text-gray-500 dark:text-dark-text-muted hover:text-gray-700 dark:hover:text-dark-text'}`}
                                        title={id === 'manual' ? 'Use the order you set with the chevrons on each card' : `Sort waitlist ${label.toLowerCase()}`}>
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
                                    <div>
                                        <label className="text-xs font-medium text-gray-600 dark:text-dark-text-secondary mb-1 block">Entry Date</label>
                                        <input type="date" value={wlForm.entryDate || ''} onChange={e => setWlForm(f => ({ ...f, entryDate: e.target.value }))} className={inputCls} />
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
                            <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3">
                                {sortedWaitlist.map((entry, idx) => {
                                    const ful = computeEntryFulfillment(entry);
                                    return (
                                    <div key={entry._id} data-testid={`waitlist-entry-${entry._id}`} className={cardCls}>
                                        <div className="p-3 sm:p-4 space-y-2.5">
                                            {/* Card header: entry number + name on the left, the manual
                                                order chevrons pinned to the top-right. */}
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex items-start gap-2 min-w-0 flex-1">
                                                    <span className="text-xs font-bold text-gray-700 dark:text-dark-text shrink-0 rounded-md px-1.5 py-0.5 bg-gray-200 dark:bg-dark-surface-hover">{idx + 1}</span>
                                                    {/* The name wraps onto a second line when it is long, rather
                                                        than being truncated or pushing the header to a new row. */}
                                                    <div className="flex items-baseline gap-2 flex-wrap min-w-0">
                                                        <div className="font-semibold text-gray-800 dark:text-dark-text min-w-0 break-words">{entry.name}</div>
                                                        {entry.entryDate && (
                                                            <div className="text-xs text-gray-600 dark:text-dark-text-muted shrink-0 flex items-center gap-1"><Calendar size={10} />{formatDate(entry.entryDate)}</div>
                                                        )}
                                                        {entry.contactInfo && (
                                                            <div className="text-xs text-gray-600 dark:text-dark-text-muted shrink-0 truncate">{entry.contactInfo}</div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1 shrink-0">
                                                    {waitlistView === 'history' && <span className="text-[11px] bg-gray-100 dark:bg-dark-surface text-gray-500 dark:text-dark-text-muted px-2 py-0.5 rounded-full">History</span>}
                                                    {waitlistView === 'active' && (
                                                        <>
                                                            <button onClick={() => idx > 0 && handleWlMoveUp(entry)} disabled={idx === 0} className="flex items-center gap-1 text-xs text-gray-500 dark:text-dark-text-muted hover:text-gray-700 dark:hover:text-dark-text hover:bg-gray-100 dark:hover:bg-dark-surface-hover px-2 py-1.5 rounded-lg transition disabled:opacity-40" title="Move up"><ArrowUp size={12} /></button>
                                                            <button onClick={() => idx < sortedWaitlist.length - 1 && handleWlMoveDown(entry)} disabled={idx === sortedWaitlist.length - 1} className="flex items-center gap-1 text-xs text-gray-500 dark:text-dark-text-muted hover:text-gray-700 dark:hover:text-dark-text hover:bg-gray-100 dark:hover:bg-dark-surface-hover px-2 py-1.5 rounded-lg transition disabled:opacity-40" title="Move down"><ArrowDown size={12} /></button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500 dark:text-dark-text-muted">
                                                {entry.contactId && (
                                                    // The attendee name is replaced with the contact's display name when a
                                                    // contact is assigned, so only show the linked contact when it adds
                                                    // information (e.g. the attendee name was edited afterwards).
                                                    (entry.contactName || entry.contactId?.personalName || 'Linked contact') !== entry.name && (
                                                        <span className="flex items-center gap-1 text-green-700 dark:text-green-400">
                                                            <User size={10} />
                                                            {entry.contactName || (entry.contactId?.personalName || 'Linked contact')}
                                                        </span>
                                                    )
                                                )}
                                            </div>
                                            <div className="bg-gray-50 dark:bg-dark-surface rounded-lg p-2.5 border border-gray-100 dark:border-dark-border">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    {ful.isFulfilled && (
                                                        <span className="inline-flex items-center gap-1 text-[10px] bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-2 py-0.5 rounded-full font-medium"><Check size={9} /> Fulfilled</span>
                                                    )}
                                                    <div className="flex flex-wrap items-center gap-1.5">
                                                        <span className="text-xs font-medium text-gray-700 dark:text-dark-text">Species:</span>
                                                        <span className="text-xs text-gray-600 dark:text-dark-text-muted">
                                                            {entry.speciesRequests?.map(r => r.species).filter(Boolean).join(', ') || '—'}
                                                        </span>
                                                    </div>
                                                </div>
                                                {/* Deposit / payment still outstanding across the entry's
                                                    assigned animals (grouped per currency). These mirror the
                                                    separate "Deposit" and "Payment" statuses on the animal
                                                    card, so they are shown as two separate figures. */}
                                                {ful.totals.length > 0 && (
                                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 pt-2 border-t border-gray-100 dark:border-dark-border">
                                                        {ful.totals.map(t => (
                                                            <span key={t.currency} className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px]">
                                                                {t.depositDue > 0 && (
                                                                    <span className="inline-flex items-center gap-1">
                                                                        <DollarSign size={9} className="text-amber-600 dark:text-amber-400" />
                                                                        <span className="font-medium text-amber-700 dark:text-amber-300">{getCurrencySymbol(t.currency)}{t.depositDue}</span>
                                                                        <span className="text-gray-500 dark:text-dark-text-muted">deposit due</span>
                                                                    </span>
                                                                )}
                                                                {t.paymentDue > 0 && (
                                                                    <span className="inline-flex items-center gap-1">
                                                                        <DollarSign size={9} className="text-amber-600 dark:text-amber-400" />
                                                                        <span className="font-medium text-amber-700 dark:text-amber-300">{getCurrencySymbol(t.currency)}{t.paymentDue}</span>
                                                                        <span className="text-gray-500 dark:text-dark-text-muted">payment due</span>
                                                                    </span>
                                                                )}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            {(() => {
                                                // One row per species request, with a counter per gender.
                                                // The counters are deliberately uncapped, so an over-assignment
                                                // shows as e.g. 2/1 instead of hiding the extra animals.
                                                const groups = ful.progress.map((p, i) => ({
                                                    key: `${entry._id}::${p.species}::${i}`,
                                                    species: p.species,
                                                    breakdown: p.breakdown || [],
                                                    genderCounters: p.genderCounters || [],
                                                    requested: p.requested,
                                                    matched: p.matched,
                                                    assigned: ful.assigned.filter(a => (a.species || '').toLowerCase() === (p.species || '').toLowerCase() && (p.breakdown || []).some(b => b.gender === 'Any' || b.gender === a.gender)),
                                                }));
                                                if (groups.length === 0) return null;
                                                return (
                                                    <div className="space-y-1.5">
                                                        {groups.map(g => {
                                                            const isOpen = !!expandedSpecGroups[g.key];
                                                            const toggle = () => setExpandedSpecGroups(prev => ({ ...prev, [g.key]: !prev[g.key] }));
                                                            return (
                                                                <div key={g.key} className="rounded-lg border border-gray-100 dark:border-dark-border bg-gray-50/50 dark:bg-dark-surface">
                                                                    <button type="button" onClick={toggle} className="w-full flex items-center justify-between gap-2 px-2.5 py-1.5 text-left">
                                                                        <span className="flex items-center gap-1.5 min-w-0">
                                                                            {isOpen ? <ChevronDown size={12} className="shrink-0 text-gray-400" /> : <ChevronRight size={12} className="shrink-0 text-gray-400" />}
                                                                            <span className="text-xs text-gray-700 dark:text-dark-text truncate">{g.species}</span>
                                                                        </span>
                                                                        {/* One counter per gender, so it is clear which gender is
                                                                            short and which is over-assigned. */}
                                                                        <span className="flex items-center gap-1 shrink-0">
                                                                            {g.genderCounters.map(c => {
                                                                                const over = c.matched > c.requested;
                                                                                const done = c.matched >= c.requested;
                                                                                // Over-assignment is never flagged red: the request IS covered
                                                                                // (it is fulfilled), so it keeps the green "done" colour.
                                                                                const cls = done
                                                                                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                                                                                    : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300';
                                                                                const Icon = c.gender === 'Male' ? Mars : c.gender === 'Female' ? Venus : Users;
                                                                                return (
                                                                                    <span key={c.gender}
                                                                                        data-testid={`wl-counter-${g.key}-${c.gender}`}
                                                                                        aria-label={`${c.gender} ${c.matched} of ${c.requested}`}
                                                                                        className={`inline-flex items-center gap-0.5 text-[11px] font-medium px-1.5 py-0.5 rounded-md ${cls}`}
                                                                                        title={`${c.gender}: ${c.matched} assigned of ${c.requested} requested${over ? ' (over-assigned)' : ''}`}>
                                                                                        <Icon size={9} />
                                                                                        {c.matched}/{c.requested}
                                                                                    </span>
                                                                                );
                                                                            })}
                                                                        </span>
                                                                    </button>
                                                                    {isOpen && (
                                                                        <div className="px-2.5 pb-2 space-y-1">
                                                                            {g.assigned.length === 0 ? (
                                                                                <div className="text-[10px] text-gray-400 dark:text-dark-text-muted pl-5">No assigned animals</div>
                                                                            ) : g.assigned.map(a => (
                                                                                <div key={a.id_public} className="flex items-center gap-1.5 pl-5 py-0.5">
                                                                                    {a.gender === 'Male' ? <Mars size={9} className="text-blue-500 shrink-0" /> : a.gender === 'Female' ? <Venus size={9} className="text-pink-500 shrink-0" /> : <Check size={9} className="text-green-600 dark:text-green-400 shrink-0" />}
                                                                                    <span className="text-xs text-gray-700 dark:text-dark-text truncate flex-1">{formatAnimalDisplayName(a)}</span>
                                                                                    <span className="text-[10px] text-gray-400 dark:text-dark-text-muted shrink-0">{a.id_public}</span>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                );
                                            })()}

                                            {entry.notes && <div className="text-xs text-gray-600 dark:text-dark-text-secondary pt-1 text-[11px]">{entry.notes}</div>}

                                            {waitlistView === 'history' && (
                                                <div className="pt-2 border-t border-gray-100 dark:border-dark-border mt-2">
                                                        <div className="text-gray-500 dark:text-dark-text-muted mb-0.5 text-[10px]">Assigned animals</div>
                                                        {ful.assigned.length > 0 ? (
                                                            <div className="flex flex-wrap gap-1">
                                                                {ful.assigned.map((a, i) => (
                                                                    <span key={`${a.id_public}-${i}`} className="inline-flex items-center gap-1 text-[10px] bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-2 py-0.5 rounded-full font-medium">{a.gender === 'Male' ? <Mars size={10} className="text-blue-500" /> : a.gender === 'Female' ? <Venus size={10} className="text-pink-500" /> : <Check size={10} />} {a.id_public ? `${formatAnimalDisplayName(a)} (${a.id_public})` : formatAnimalDisplayName(a)}</span>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <div className="text-gray-400 dark:text-dark-text-muted italic text-[11px]">None assigned via picker</div>
                                                        )}
                                                        {entry.finalizedAt && <div className="text-[11px] text-gray-400 dark:text-dark-text-muted mt-1">Finalized {formatDate(entry.finalizedAt)}</div>}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Actions live in their own row pinned to the bottom-right of the
                                                card, with extra padding below so the buttons never look like
                                                they are falling out of the card. The extra right padding keeps
                                                the last button (Finalize / Delete) off the card's edge. */}
                                            <div className="w-full min-w-0 border-t border-gray-100 dark:border-dark-border mt-2 pt-2 pb-1 sm:pb-2 pr-2 sm:pr-3">
                                                <div className="flex flex-wrap items-center justify-between gap-2">
                                                    <div className="flex flex-wrap items-center gap-1" />
                                                    {/* Primary actions stay pinned to the bottom-right. */}
                                                    <div className="flex flex-wrap items-center justify-end gap-1 ml-auto">
                                                        {waitlistView === 'active' ? (
                                                            <>
                                                                <button onClick={() => openWlForm(entry)} className="flex items-center gap-1 text-xs text-gray-500 dark:text-dark-text-muted hover:text-gray-700 dark:hover:text-dark-text hover:bg-gray-100 dark:hover:bg-dark-surface-hover px-2 py-1.5 rounded-lg transition"><Edit size={11} /> Edit</button>
                                                                <button onClick={() => handleWlDelete(entry._id)} className="flex items-center gap-1 text-xs text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 px-2 py-1.5 rounded-lg transition"><Trash2 size={11} /> Delete</button>
                                                                <button onClick={() => handleWlFinalize(entry)} className="flex items-center gap-1 text-xs font-medium text-white bg-green-600 hover:bg-green-700 px-3 py-1.5 rounded-lg transition"><CheckCircle size={11} /> Finalize</button>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <button onClick={() => handleWlReactivate(entry)} className="flex items-center gap-1 text-xs text-gray-500 dark:text-dark-text-muted hover:text-gray-700 dark:hover:text-dark-text hover:bg-gray-100 dark:hover:bg-dark-surface-hover px-2 py-1.5 rounded-lg transition"><Undo2 size={11} /> Reactivate</button>
                                                                <button onClick={() => handleWlDelete(entry._id)} className="flex items-center gap-1 text-xs text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 px-2 py-1.5 rounded-lg transition"><Trash2 size={11} /> Delete</button>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </>
                )}

            </div>
        </div>
    );
};

export default ReservationsPage;

