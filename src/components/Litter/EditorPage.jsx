import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import apiClient from '../../utils/apiClient';
import EditorShell from './editor/EditorShell';

/**
 * Full-page litter create/edit route.
 *   /litters/new               -> create
 *   /litters/:ctlId/edit       -> edit (canonical)
 *   /litter/edit/:litterId     -> edit (legacy alias)
 *   /litter/edit               -> create (legacy alias)
 */
const LittersEditorPage = ({ userProfile, authToken, API_BASE_URL, showModalMessage, speciesOptions = [] }) => {
    const navigate = useNavigate();
    const { ctlId, litterId } = useParams();
    const id = ctlId || litterId;
    const isEdit = !!id;

    const [litter, setLitter] = useState(null);
    const [loading, setLoading] = useState(isEdit);
    const [failed, setFailed] = useState(false);

    const load = useCallback(async () => {
        if (!id) return;
        setLoading(true);
        setFailed(false);
        try {
            const res = await apiClient.get(`/litters/${encodeURIComponent(id)}`);
            setLitter(res.data);
        } catch (err) {
            setLitter(null);
            setFailed(true);
            if (err?.response?.status !== 404 && showModalMessage) showModalMessage('Error', 'Failed to load this litter.');
        } finally {
            setLoading(false);
        }
    }, [id, showModalMessage]);

    useEffect(() => { load(); }, [load]);

    if (loading) {
        return <div className="flex items-center justify-center py-20 text-gray-500 dark:text-dark-text-muted"><Loader2 className="animate-spin mr-2" size={20} /> Loading litter…</div>;
    }

    if (isEdit && (failed || !litter)) {
        return (
            <div className="max-w-3xl mx-auto p-6 text-center space-y-3">
                <p className="text-gray-700 dark:text-dark-text">This litter could not be found.</p>
                <button type="button" onClick={() => navigate('/litters')} className="px-4 py-2 rounded-lg border border-gray-300 dark:border-dark-border text-sm">Back to litters</button>
            </div>
        );
    }

    const detailsPath = (l) => (l?.litter_id_public ? `/litters/${encodeURIComponent(l.litter_id_public)}` : '/litters');

    return (
        <EditorShell
            // Remount if the route switches between litters (or create <-> edit).
            key={litter?._id || 'new'}
            litter={litter}
            userProfile={userProfile}
            authToken={authToken}
            API_BASE_URL={API_BASE_URL}
            showModalMessage={showModalMessage}
            speciesOptions={speciesOptions}
            onDone={(saved) => navigate(isEdit ? detailsPath(saved || litter) : '/litters')}
            onCancel={() => navigate(isEdit ? detailsPath(litter) : '/litters')}
        />
    );
};

export default LittersEditorPage;
