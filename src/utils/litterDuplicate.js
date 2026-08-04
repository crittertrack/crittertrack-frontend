import axios from 'axios';

/**
 * Walks the user through resolving a 409 duplicate-litter response from POST /litters.
 * - Own record: offer to create a separate entry anyway, or cancel.
 * - Someone else's record for the same pairing: offer to adopt it into this user's own
 *   Litter Management (no duplicate created), fall back to creating a separate entry anyway,
 *   or cancel entirely.
 *
 * Returns { action: 'adopted' | 'create-anyway' | 'cancel', litter? }.
 */
export const resolveDuplicateLitter = async ({ duplicate, authToken, API_BASE_URL }) => {
    const ctl = duplicate.litter_id_public ? `CTL-${duplicate.litter_id_public}`.replace('CTL-CTL-', 'CTL-') : 'this pairing';

    if (duplicate.isOwnRecord) {
        const createAnyway = window.confirm(
            `You already have a litter entry (${ctl}) for this pairing around this date.\n\nCreate a separate new entry anyway?`
        );
        return { action: createAnyway ? 'create-anyway' : 'cancel' };
    }

    const ownerLabel = duplicate.creatorName || 'another user';
    const adopt = window.confirm(
        `An entry for this pairing (${ctl}) already exists, created by ${ownerLabel}.\n\n` +
        `Adopt it into your own Litter Management instead of creating a new one? You'll get full edit access.`
    );
    if (adopt) {
        const resp = await axios.post(`${API_BASE_URL}/litters/${duplicate.litterId_backend}/adopt`, {}, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        return { action: 'adopted', litter: resp.data.litter };
    }

    const createAnyway = window.confirm('Create a separate new entry instead?');
    return { action: createAnyway ? 'create-anyway' : 'cancel' };
};
