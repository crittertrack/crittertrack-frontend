import React, { useState } from 'react';
import { Mars, Venus, VenusAndMars, Eye, EyeOff, Heart, HeartOff, Loader2, User, Users, Circle } from 'lucide-react';
import { formatAnimalDisplayName } from '../../../utils/animalDisplayName';
import AddOffspringModal from './AddOffspringModal';

const OffspringTab = ({ offspring, loading, onView, animalBreedingLines = {}, breedingLineDefs = [] }) => {
    const [search, setSearch] = useState('');
    const [genderFilter, setGenderFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [addOpen, setAddOpen] = useState(false);
    if (loading) return <div className="flex items-center py-8 text-gray-500"><Loader2 className="animate-spin mr-2" size={18} /> Loading offspring…</div>;
    const filtered = offspring.filter(a => {
        if (search && !(a.name || '').toLowerCase().includes(search.toLowerCase())) return false;
        if (genderFilter !== 'all' && a.gender !== genderFilter) return false;
        if (statusFilter !== 'all' && a.status !== statusFilter) return false;
        return true;
    });
    const total = offspring.length;
    const male = offspring.filter(a => a.gender === 'Male').length;
    const female = offspring.filter(a => a.gender === 'Female').length;
    const intersex = offspring.filter(a => a.gender === 'Intersex').length;
    const mixed = 0; // excluded
    const unknown = total - male - female - intersex - mixed;
    return (
        <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
                <input value={search} onChange={e => setSearch(e.target.value)} className="border rounded px-2 py-1 text-sm" placeholder="Search offspring" />
                <select value={genderFilter} onChange={e => setGenderFilter(e.target.value)} className="border rounded px-2 py-1 text-sm">
                    <option value="all">All genders</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Intersex">Intersex</option>
                    <option value="Mixed">Mixed</option>
                    <option value="Unknown">Unknown</option>
                </select>
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border rounded px-2 py-1 text-sm">
                    <option value="all">All statuses</option>
                    {[...new Set(offspring.map(a => a.status).filter(Boolean))].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <span className="text-xs text-gray-500 flex items-center gap-2">Total {total} / <Mars size={12} className="text-blue-500"/> {male} / <Venus size={12} className="text-pink-500"/> {female} / <VenusAndMars size={12} className="text-purple-500"/> {intersex} / <Circle size={12} className="text-gray-400"/> {unknown}</span>
                <button type="button" onClick={() => setAddOpen(true)} className="ml-auto px-3 py-1 text-sm rounded bg-primary text-black">+ Add offspring</button>
            </div>
            {!filtered.length ? (
                <div className="py-8 text-center text-sm text-gray-500 dark:text-dark-text-muted">No offspring match.</div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {filtered.map(a => (
                        <div key={a.id_public || a._id} className="rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card-bg p-3">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-2">
                                    {a.gender === 'Male' ? <Mars size={14} className="text-blue-500"/> : a.gender === 'Female' ? <Venus size={14} className="text-pink-500"/> : a.gender === 'Intersex' ? <VenusAndMars size={14} className="text-purple-500"/> : a.gender === 'Mixed' ? <Users size={14} className="text-teal-500"/> : <Circle size={14} className="text-gray-400"/>}
                                    <span className="font-medium text-sm">{formatAnimalDisplayName(a)}</span>
                                </div>
                                <div className="flex gap-1">
                                    {(a.isDisplay || a.isPublic || a.isDisplayAnimal) ? <Eye size={14} className="text-green-500" /> : <EyeOff size={14} className="text-gray-400" />}
                                    {a.isOwned || a.owned ? <Heart size={14} className="text-red-500" /> : <HeartOff size={14} className="text-gray-400" />}
                                </div>
                            </div>
                            <button type="button" onClick={() => onView && onView(a)} className="flex gap-3 mt-2 w-full text-left">
                                {(a.imageUrl || a.photoUrl) ? (
                                    <img src={a.imageUrl || a.photoUrl} alt="" className="w-16 h-16 rounded-lg object-cover" />
                                ) : (
                                    <div className="w-16 h-16 rounded-lg bg-gray-100 dark:bg-dark-surface" />
                                )}
                                <div className="text-xs space-y-1 min-w-0">
                                    <div className="truncate">{a.variety || [a.color, a.markings, a.coat, a.earset].filter(Boolean).join(' ') || '—'}</div>
                                    <div className="font-mono truncate">{a.geneticCode || '—'}</div>
                                    <div>{a.status || '—'}</div>
                                    <div className="text-gray-500">{a.ownerId_public ? (a.ownerInfo?.breederName || a.ownerInfo?.personalName || a.manualownerName || a.ownerId_public) : (a.manualownerName || a.owner || a.ownerName || '')}</div>
                                </div>
                            </button>
                            <button type="button" className="mt-2 text-xs text-red-500">Unlink</button>
                        </div>
                    ))}
                </div>
            )}
        <AddOffspringModal open={addOpen} onClose={() => setAddOpen(false)} />
        </div>
    );
};

export default OffspringTab;