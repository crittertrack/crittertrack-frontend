// Network side of the full-page litter editor. Ported from LitterManagement/index.jsx
// (handleSubmit / handleUpdateLitter / image handlers) with the same order of operations and
// side effects (dam nursing sync, "All lost" reset, parent links on linked offspring, COI).
import apiClient from '../../../utils/apiClient';
import { decodeErrorMessage } from '../../../utils/imageDecode';
import { compressImageToMaxSize } from '../../../utils/imageCompression';
import { resolveDuplicateLitter } from '../../../utils/litterDuplicate';
import {
    reconcileLitterFormCounts, buildCreatePayload, buildUpdatePayload, buildNewOffspringBodies,
} from './litterFormModel';

const SERVER_MAX_BYTES = 500 * 1024;
const TARGET_BYTES = 400 * 1024;

const fire = (name, detail) => window.dispatchEvent(new CustomEvent(name, { detail }));

/** Pregnant -> Nursing once a real birth date is recorded. */
export const syncDamPostBirth = async (damId) => {
    if (!damId) return;
    try {
        await apiClient.put(`/animals/${damId}`, { isPregnant: false, isNursing: true });
        fire('animal-updated', { id_public: damId, isPregnant: false, isNursing: true });
    } catch (err) {
        console.warn('Failed to sync dam nursing state after birth:', err?.response?.data?.message || err?.message);
    }
};

/** "All lost" birth outcome clears every reproductive state on the dam. */
export const clearDamReproState = async (damId) => {
    if (!damId) return;
    try {
        const state = { isPregnant: false, isNursing: false, isInMating: false };
        await apiClient.put(`/animals/${damId}`, state);
        fire('animal-updated', { id_public: damId, ...state });
    } catch (err) {
        console.warn('Failed to clear dam reproductive state after All lost outcome:', err?.message);
    }
};

/** Compress and upload one photo; returns the litter's full image list. */
export const uploadLitterImage = async (litterId, file) => {
    const blob = await compressImageToMaxSize(file, TARGET_BYTES, { maxWidth: 1600, maxHeight: 1600, startQuality: 0.82, forceJpeg: true });
    if (blob.size > SERVER_MAX_BYTES) {
        throw new Error(`That photo is too large (${Math.round(blob.size / 1024)} KB). Please pick a smaller image or crop it first.`);
    }
    const fd = new FormData();
    fd.append('image', blob, 'litter-photo.jpg');
    const resp = await apiClient.post(`/litters/${litterId}/images`, fd);
    return resp.data.images || [];
};

export const deleteLitterImage = async (litterId, r2Key) => {
    const resp = await apiClient.delete(`/litters/${litterId}/images/${encodeURIComponent(r2Key)}`);
    return resp.data.images || [];
};

export const imageErrorMessage = (err, fallback) => err?.response?.data?.message || decodeErrorMessage(err) || fallback;

/** Create the placeholder animals; failures are reported, not thrown, so the litter still saves. */
const createOffspringAnimals = async (bodies) => {
    const results = await Promise.allSettled(bodies.map(b => apiClient.post('/animals', b)));
    const ids = results.filter(r => r.status === 'fulfilled').map(r => r.value.data.id_public);
    return { ids, failed: results.length - ids.length };
};

const warnProceed = (warnings) =>
    warnings.length === 0 || window.confirm(`Warning:\n${warnings.join('\n')}\n\nSave anyway?`);

/**
 * Create a litter. Returns { status: 'created' | 'adopted' | 'cancelled', litter?, message?, failedOffspring? }.
 * `ctx`: { myAnimals, pendingImages, createCounts, sire, dam, userProfile, authToken, API_BASE_URL }
 */
export const createLitter = async (form, ctx) => {
    const { myAnimals, pendingImages, createCounts, sire, dam, userProfile, authToken, API_BASE_URL } = ctx;

    const linked = myAnimals.filter(a => (form.linkedOffspringIds || []).includes(a.id_public));
    const { correctedCounts, warnings } = reconcileLitterFormCounts(form, linked);
    if (!warnProceed(warnings)) return { status: 'cancelled' };

    const payload = buildCreatePayload(form, correctedCounts, form.linkedOffspringIds || []);

    let response;
    try {
        response = await apiClient.post('/litters', payload);
    } catch (err) {
        const duplicate = err.response?.status === 409 && err.response.data?.duplicate;
        if (!duplicate) throw err;
        const resolution = await resolveDuplicateLitter({ duplicate, authToken, API_BASE_URL });
        if (resolution.action === 'adopted') {
            return { status: 'adopted', litter: resolution.litter, message: 'Adopted the existing litter into your Litter Management!' };
        }
        if (resolution.action !== 'create-anyway') return { status: 'cancelled' };
        response = await apiClient.post('/litters', { ...payload, confirmDuplicate: true });
    }

    const litterId = response.data.litterId_backend;
    const publicId = response.data.litter_id_public;

    if (form.birthDate) await syncDamPostBirth(form.damId_public);
    if (form.birthOutcome === 'All lost') await clearDamReproState(form.damId_public);

    // Photos staged while creating.
    for (const { file } of pendingImages) {
        try { await uploadLitterImage(litterId, file); } catch (err) { console.error('Failed to upload litter image:', err); }
    }

    // COI in the background; never blocks or fails the save.
    apiClient.get('/animals/inbreeding/pairing', { params: { sireId: form.sireId_public, damId: form.damId_public, generations: 20 } })
        .then(r => (r.data.inbreedingCoefficient != null
            ? apiClient.put(`/litters/${litterId}`, { inbreedingCoefficient: r.data.inbreedingCoefficient })
            : null))
        .catch(() => {});

    // Placeholder animals, then record the full offspring list on the litter.
    const bodies = buildNewOffspringBodies({
        counts: createCounts,
        species: sire?.species || dam?.species || form.species,
        birthDate: form.birthDate,
        sireId: form.sireId_public,
        damId: form.damId_public,
        breederId: userProfile?.id_public,
    });
    const created = bodies.length ? await createOffspringAnimals(bodies) : { ids: [], failed: 0 };
    created.ids.forEach(id => apiClient.get(`/animals/${id}/inbreeding`, { params: { generations: 20 } }).catch(() => {}));

    const allIds = [...created.ids, ...(form.linkedOffspringIds || [])];
    if (allIds.length) {
        await apiClient.put(`/litters/${litterId}`, { offspringIds_public: allIds, numberBorn: allIds.length });
    }

    const parts = [];
    if (created.ids.length) parts.push(`${created.ids.length} new animal(s) created`);
    if ((form.linkedOffspringIds || []).length) parts.push(`${form.linkedOffspringIds.length} animal(s) linked`);
    const message = parts.length ? `Litter created with ${parts.join(', ')}!` : 'Litter created successfully!';

    window.dispatchEvent(new Event('animals-changed'));
    return { status: 'created', litter: { ...response.data, litter_id_public: publicId }, message, failedOffspring: created.failed };
};

/**
 * Update a litter. `original` is the stored litter being edited.
 * Returns { status: 'updated' | 'cancelled', message?, failedOffspring? }.
 */
export const updateLitter = async (form, ctx) => {
    const { litterId, original, myAnimals, createCounts, sire, dam, userProfile } = ctx;

    const bodies = buildNewOffspringBodies({
        counts: createCounts,
        species: sire?.species || dam?.species || form.species,
        birthDate: form.birthDate,
        sireId: form.sireId_public,
        damId: form.damId_public,
        breederId: userProfile?.id_public,
    });

    // Reconcile and warn BEFORE creating anything, counting the placeholders by sex, so cancelling
    // the prompt never leaves orphan animals behind (the old form created them first).
    const linked = [
        ...myAnimals.filter(a => (form.linkedOffspringIds || []).includes(a.id_public)),
        ...bodies.map(b => ({ gender: b.gender })),
    ];
    const { correctedCounts, warnings } = reconcileLitterFormCounts(form, linked);
    if (!warnProceed(warnings)) return { status: 'cancelled' };

    const created = bodies.length ? await createOffspringAnimals(bodies) : { ids: [], failed: 0 };
    const allIds = [...created.ids, ...(form.linkedOffspringIds || [])];

    const isNewBirth = !!form.birthDate && !original?.birthDate;
    await apiClient.put(`/litters/${litterId}`, buildUpdatePayload(form, correctedCounts, allIds, original));

    if (isNewBirth) await syncDamPostBirth(form.damId_public);
    if (form.birthOutcome === 'All lost') await clearDamReproState(form.damId_public);
    window.dispatchEvent(new Event('animals-changed'));

    // Keep linked offspring pointing at this litter's parents. allSettled: animals the user no
    // longer owns (transferred / sold) are skipped silently rather than aborting the save.
    const linkedIds = form.linkedOffspringIds || [];
    if (linkedIds.length) {
        const parentPatch = { sireId_public: form.sireId_public || null, damId_public: form.damId_public || null };
        await Promise.allSettled(linkedIds.map(id =>
            apiClient.put(`/animals/${id}`, parentPatch)
                .then(() => fire('animal-updated', { id_public: id, ...parentPatch }))
                .catch(err => console.warn(`[updateLitter] Could not update parent links for ${id}:`, err?.response?.data?.message || err?.message))
        ));
    }

    return { status: 'updated', message: 'Litter updated successfully!', failedOffspring: created.failed };
};
