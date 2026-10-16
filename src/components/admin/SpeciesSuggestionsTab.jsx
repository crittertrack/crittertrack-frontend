import React, { useEffect, useState, useCallback } from 'react';
import { RefreshCw, Loader2, PawPrint } from 'lucide-react';
import apiClient from '../../utils/apiClient';
import SpeciesSuggestionCard from './SpeciesSuggestionCard';

// Moderation panel -> read-only list of gestation / weaning durations users suggested for a species
// (sent from the Help Center article "Auto-Calculated Due & Weaning Dates"). Nothing is applied or
// changed from here: accepted values are added to the auto-calculation rules in the code.
const SpeciesSuggestionsTab = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const load = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const res = await apiClient.get('/feedback/admin');
            setItems((Array.isArray(res.data) ? res.data : []).filter((f) => f.type === 'species-values'));
        } catch (err) {
            setError(err?.response?.data?.error || 'Failed to load suggestions.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    return (
        <div>
            <div className="mb-4 flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                    <PawPrint size={28} className="text-red-600" />
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Species Value Suggestions</h2>
                        <p className="text-sm text-gray-500">Gestation / weaning durations users suggest for species with no auto-calculation yet ({items.length}).</p>
                    </div>
                </div>
                <button type="button" onClick={load} disabled={loading} className="flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-50">
                    <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh
                </button>
            </div>

            {error && <p role="alert" className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
            {loading && items.length === 0 && <p className="flex items-center gap-2 text-sm text-gray-500"><Loader2 size={16} className="animate-spin" /> Loading...</p>}
            {!loading && !error && items.length === 0 && <p className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">No suggestions yet.</p>}

            <ul className="space-y-3">
                {items.map((item) => <SpeciesSuggestionCard key={item._id} item={item} />)}
            </ul>
        </div>
    );
};

export default SpeciesSuggestionsTab;
