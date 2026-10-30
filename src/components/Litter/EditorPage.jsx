import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import apiClient from '../../utils/apiClient';
import EditorShell from './editor/EditorShell';

// Full-page litter create/edit. Routes:
//   /litters/new, /litter/edit                 -> create
//   /litters/:ctlId/edit  (CTL public id)      -> edit
//   /litter/edit/:litterId (backend _id, legacy) -> edit
// Both id styles are accepted so old links keep working.
const LittersEditorPage = ({
    authToken,
    API_BASE_URL,
    userProfile,
    showModalMessage,
    speciesOptions = [],
}) => {
    const navigate = useNavigate();
    const params = useParams();
    const [searchParams] = useSearchParams();
    const idParam = params.ctlId || params.litterId || null;
    const isEdit = !!idParam;

    const [litter, setLitter] = useState(null);
    const [loading, setLoading] = useState(isEdit);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        if (!isEdit) return undefined;
        let cancelled = false;
        setLoading(true);
        setFailed(false);
        // GET /litters returns the user's litters with sire/dam already resolved, which the
        // editor needs; it also means only litters the user can edit are found.
        apiClient.get('/litters')
            .then(res => {
                if (cancelled) return;
                const all = Array.isArray(res.data) ? res.data : [];
                const found = all.find(l => l._id === idParam || l.litter_id_public === idParam);
                if (found) setLitter(found); else setFailed(true);
            })
            .catch(() => { if (!cancelled) setFailed(true); })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, [idParam, isEdit]);

    const tab = searchParams.get('tab');
    const detailsPath = (l) => {
        const id = l?.litter_id_public;
        if (!id) return '/litters';
        return `/litters/${encodeURIComponent(id)}${tab ? `?tab=${encodeURIComponent(tab)}` : ''}`;
    };

    const handleDone = useCallback((saved) => navigate(detailsPath(saved || litter)), [navigate, litter, tab]); // eslint-disable-line react-hooks/exhaustive-deps
    const handleCancel = useCallback(() => navigate(isEdit ? detailsPath(litter) : '/litters'), [navigate, isEdit, litter, tab]); // eslint-disable-line react-hooks/exhaustive-deps

    if (loading) {
        return <div className="flex items-center justify-center py-20 text-gray-500"><Loader2 className="animate-spin mr-2" size={20} /> Loading litter…</div>;
    }

    if (isEdit && (failed || !litter)) {
        return (
            <div className="max-w-3xl mx-auto p-6 text-center space-y-3">
                <p className="text-gray-700 dark:text-dark-text">That litter could not be found, or you don't have permission to edit it.</p>
                <button type="button" onClick={() => navigate('/litters')} className="px-4 py-2 rounded-lg border border-gray-300 dark:border-dark-border text-sm">Back to litters</button>
            </div>
        );
    }

    return (
        <EditorShell
            key={litter?._id || 'new'}
            litter={litter}
            onDone={handleDone}
            onCancel={handleCancel}
            userProfile={userProfile}
            authToken={authToken}
            API_BASE_URL={API_BASE_URL}
            showModalMessage={showModalMessage}
            speciesOptions={speciesOptions}
        />
    );
};

export default LittersEditorPage;
