import {
    EMPTY_LITTER_FORM,
    toDateInput,
    formFromLitter,
    initialExtras,
    reconcileLitterFormCounts,
    validateLitterForm,
    buildCreatePayload,
    buildUpdatePayload,
    buildNewOffspringBodies,
    isFormDirty,
    setSexCount,
    setStillbornSex,
    setLossSex,
    toggleExtractStillborn,
    toggleExtractLosses,
    linkableOffspring,
    linkOffspring,
    unlinkOffspring,
    countLinkedBySex,
    remainingToCreate,
} from './litterFormModel';

const form = (over = {}) => ({ ...EMPTY_LITTER_FORM, sireId_public: 'CTC1', damId_public: 'CTC2', ...over });

describe('toDateInput', () => {
    it('keeps YYYY-MM-DD and strips the time part', () => {
        expect(toDateInput('2026-03-04')).toBe('2026-03-04');
        expect(toDateInput('2026-03-04T10:20:30.000Z')).toBe('2026-03-04');
    });
    it('returns empty for missing or invalid values', () => {
        expect(toDateInput(null)).toBe('');
        expect(toDateInput('')).toBe('');
        expect(toDateInput('not-a-date')).toBe('');
    });
});

describe('formFromLitter', () => {
    it('maps stored fields and legacy aliases onto the form', () => {
        const fd = formFromLitter({
            sireId_public: 'CTC1', damId_public: 'CTC2', numberBorn: 6, numberWeaned: 4,
            stillborn: 1, losses: 1, pairingDate: '2026-01-02T00:00:00.000Z',
            maleStillbornCount: 1, hasCulls: true, cullsCount: 1,
            sire: { species: 'Fancy Rat' },
        });
        expect(fd.litterSizeBorn).toBe(6);
        expect(fd.litterSizeWeaned).toBe(4);
        expect(fd.stillbornCount).toBe(1);
        expect(fd.lossesCount).toBe(1);
        expect(fd.matingDate).toBe('2026-01-02');
        expect(fd.maleStillborn).toBe(1);
        expect(fd.cullsCount).toBe(1);
        expect(fd.species).toBe('Fancy Rat');
    });
    it('blanks the birth date when it is marked unknown and drops culls when not flagged', () => {
        const fd = formFromLitter({ birthDate: '2026-02-02', birthDateUnknown: true, cullsCount: 3 });
        expect(fd.birthDate).toBe('');
        expect(fd.birthDateUnknown).toBe(true);
        expect(fd.cullsCount).toBeNull();
    });
});

describe('initialExtras', () => {
    it('expands mating/birth extras only when they hold data', () => {
        expect(initialExtras({})).toEqual({ matingExtra: false, birthExtra: false });
        expect(initialExtras({ breedingMethod: 'AI', birthMethod: 'Natural' })).toEqual({ matingExtra: true, birthExtra: true });
        expect(initialExtras({ breedingMethod: 'Unknown', outcome: 'Unknown' }).matingExtra).toBe(false);
    });
});

describe('reconcileLitterFormCounts', () => {
    it('silently raises the total to the gender sum', () => {
        const { correctedCounts, warnings } = reconcileLitterFormCounts(form({ maleCount: 3, femaleCount: 4, litterSizeBorn: 5 }));
        expect(correctedCounts.litterSizeBorn).toBe(7);
        expect(correctedCounts.numberBorn).toBe(7);
        expect(warnings).toEqual([]);
    });
    it('never lets gender counts drop below the linked animals', () => {
        const linked = [{ gender: 'Male' }, { gender: 'Male' }, { gender: 'Female' }, { gender: 'Unknown' }];
        const { correctedCounts } = reconcileLitterFormCounts(form({ maleCount: 1 }), linked);
        expect(correctedCounts).toMatchObject({ maleCount: 2, femaleCount: 1, unknownCount: 1, litterSizeBorn: 4 });
    });
    it('warns, without correcting, when stillborn/losses/weaned exceed the total', () => {
        const { correctedCounts, warnings } = reconcileLitterFormCounts(form({ litterSizeBorn: 4, stillbornCount: 5, lossesCount: 1, litterSizeWeaned: 3 }));
        expect(correctedCounts.litterSizeBorn).toBe(4);
        expect(warnings.join(' ')).toMatch(/Stillborn \(5\) exceeds Total Born \(4\)/);
        expect(warnings.join(' ')).toMatch(/Stillborn \+ Losses \+ Weaned \(9\)/);
    });
    it('warns when culls exceed losses, but only if culls are enabled', () => {
        expect(reconcileLitterFormCounts(form({ litterSizeBorn: 6, hasCulls: true, cullsCount: 2, lossesCount: 1 })).warnings.join(' ')).toMatch(/Culls \(2\)/);
        expect(reconcileLitterFormCounts(form({ litterSizeBorn: 6, hasCulls: false, cullsCount: 2, lossesCount: 1 })).warnings).toEqual([]);
    });
    it('returns null counts for an empty litter', () => {
        expect(reconcileLitterFormCounts(form()).correctedCounts).toEqual({ maleCount: null, femaleCount: null, unknownCount: null, litterSizeBorn: null, numberBorn: null });
    });
});

describe('validateLitterForm', () => {
    it('requires a sire and a dam and rejects the same animal twice', () => {
        expect(validateLitterForm(EMPTY_LITTER_FORM)).toMatchObject({ sireId_public: expect.any(String), damId_public: expect.any(String) });
        expect(validateLitterForm(form({ damId_public: 'CTC1' })).damId_public).toMatch(/different/);
    });
    it('rejects mixed species', () => {
        const errors = validateLitterForm(form(), { sire: { species: 'Fancy Rat' }, dam: { species: 'Fancy Mouse' } });
        expect(errors.damId_public).toMatch(/same species/);
    });
    it('rejects a birth date after the dam died, but allows a deceased sire', () => {
        const dam = { name: 'Dot', deceasedDate: '2026-01-01' };
        expect(validateLitterForm(form({ birthDate: '2026-02-01' }), { dam }).birthDate).toMatch(/deceased/);
        expect(validateLitterForm(form({ birthDate: '2026-02-01' }), { sire: { deceasedDate: '2025-01-01' }, dam: {} }).birthDate).toBeUndefined();
        expect(validateLitterForm(form({ birthDate: '2026-02-01', birthDateUnknown: true }), { dam }).birthDate).toBeUndefined();
    });
    it('rejects a birth date before mating', () => {
        expect(validateLitterForm(form({ matingDate: '2026-03-01', birthDate: '2026-02-01' })).birthDate).toMatch(/before the mating/);
    });
    it('accepts a valid form', () => {
        expect(validateLitterForm(form({ matingDate: '2026-01-01', birthDate: '2026-01-22' }), { sire: { species: 'Fancy Rat' }, dam: { species: 'Fancy Rat' } })).toEqual({});
    });
});

describe('payload builders', () => {
    const counts = { maleCount: 2, femaleCount: 3, unknownCount: null, litterSizeBorn: 5, numberBorn: 5 };

    it('create: derives isPlanned from the dates and nulls empty fields', () => {
        const future = new Date(Date.now() + 5 * 86400000).toISOString().slice(0, 10);
        const planned = buildCreatePayload(form({ matingDate: future }), counts, []);
        expect(planned.isPlanned).toBe(true);
        expect(planned.birthDate).toBeNull();
        expect(planned.breedingConditionAtTime).toBeNull();
        expect(planned.offspringIds_public).toEqual([]);

        const born = buildCreatePayload(form({ birthDate: '2026-01-01' }), counts, ['CTC9']);
        expect(born.isPlanned).toBe(false);
        expect(born.offspringIds_public).toEqual(['CTC9']);
        expect(born.litterSizeBorn).toBe(5);
    });
    it('create: only includes pregnancy-lost fields when flagged, defaulting the reason', () => {
        expect(buildCreatePayload(form(), counts, [])).not.toHaveProperty('pregnancyLost');
        expect(buildCreatePayload(form({ pregnancyLost: true }), counts, [])).toMatchObject({ pregnancyLost: true, pregnancyLostReason: 'Unknown' });
    });
    it('update: omits isPlanned unless a date edit changes the status', () => {
        const original = { matingDate: '2026-01-01T00:00:00.000Z', isPlanned: true };
        const unchanged = buildUpdatePayload(form({ matingDate: '2026-01-01', notes: 'edited' }), counts, [], original);
        expect(unchanged).not.toHaveProperty('isPlanned');
        expect(unchanged.notes).toBe('edited');

        const nowBorn = buildUpdatePayload(form({ matingDate: '2026-01-01', birthDate: '2026-01-22' }), counts, [], original);
        expect(nowBorn.isPlanned).toBe(false);
    });
    it('update: clears pregnancy-lost details when the flag is off', () => {
        const p = buildUpdatePayload(form({ pregnancyLost: false, pregnancyLostReason: 'Reabsorbed' }), counts, [], {});
        expect(p).toMatchObject({ pregnancyLost: false, pregnancyLostReason: null, pregnancyLostNotes: null });
    });
    it('maps sex-specific stillborn/loss fields to the API names', () => {
        const p = buildCreatePayload(form({ maleStillborn: 1, femaleLosses: 2 }), counts, []);
        expect(p).toMatchObject({ maleStillbornCount: 1, femaleLossesCount: 2, unknownLossesCount: null });
    });
});

describe('buildNewOffspringBodies', () => {
    it('creates M/F/U animals in order with the parents and breeder set', () => {
        const bodies = buildNewOffspringBodies({
            counts: { males: 2, females: 1, unknown: 1 }, species: 'Fancy Rat', birthDate: '2026-01-01',
            sireId: 'CTC1', damId: 'CTC2', breederId: 'CTU7',
        });
        expect(bodies.map(b => b.name)).toEqual(['M1', 'M2', 'F1', 'U1']);
        expect(bodies[0]).toMatchObject({ gender: 'Male', species: 'Fancy Rat', sireId_public: 'CTC1', damId_public: 'CTC2', breederId_public: 'CTU7', creatorId_public: 'CTU7', isOwned: true, status: 'Pet' });
    });
    it('returns nothing when no counts are set', () => {
        expect(buildNewOffspringBodies({ counts: { males: 0, females: '', unknown: null }, species: 'x', birthDate: 'd', sireId: 'a', damId: 'b', breederId: 'c' })).toEqual([]);
    });
});

describe('sex breakdown arithmetic', () => {
    it('setSexCount keeps Total Born equal to M + F + U (null when zero)', () => {
        let fd = setSexCount(form(), 'maleCount', 3);
        fd = setSexCount(fd, 'femaleCount', 2);
        fd = setSexCount(fd, 'unknownCount', 1);
        expect(fd.litterSizeBorn).toBe(6);
        expect(setSexCount(setSexCount(form(), 'maleCount', 2), 'maleCount', null).litterSizeBorn).toBeNull();
    });
    it('setStillbornSex keeps Total Stillborn equal to the sum', () => {
        let fd = setStillbornSex(form(), 'maleStillborn', 1);
        fd = setStillbornSex(fd, 'unknownStillborn', 2);
        expect(fd.stillbornCount).toBe(3);
    });
    it('setLossSex sums losses and leaves M/F/U alone when not extracting', () => {
        const fd = setLossSex(form({ maleCount: 3, femaleCount: 3, litterSizeBorn: 6 }), 'maleLosses', 2);
        expect(fd.lossesCount).toBe(2);
        expect(fd).toMatchObject({ maleCount: 3, femaleCount: 3, litterSizeBorn: 6 });
    });
    it('setLossSex moves the matching count by the change in losses when extracting', () => {
        let fd = form({ maleCount: 3, femaleCount: 3, litterSizeBorn: 6, extractLossesFromTotal: true });
        fd = setLossSex(fd, 'maleLosses', 2);
        expect(fd).toMatchObject({ maleCount: 1, femaleCount: 3, litterSizeBorn: 4, lossesCount: 2 });
        fd = setLossSex(fd, 'maleLosses', 1);
        expect(fd).toMatchObject({ maleCount: 2, litterSizeBorn: 5, lossesCount: 1 });
    });
    it('setLossSex never drives a count below zero when extracting', () => {
        const fd = setLossSex(form({ maleCount: 1, litterSizeBorn: 1, extractLossesFromTotal: true }), 'maleLosses', 5);
        expect(fd.maleCount).toBeNull();
    });
    it('toggleExtractStillborn subtracts then restores the stillborn from M/F/U', () => {
        const base = form({ maleCount: 3, femaleCount: 2, unknownCount: 1, litterSizeBorn: 6, maleStillborn: 1, femaleStillborn: 1 });
        const on = toggleExtractStillborn(base, true);
        expect(on).toMatchObject({ extractStillbornFromTotal: true, maleCount: 2, femaleCount: 1, unknownCount: 1, litterSizeBorn: 4 });
        const off = toggleExtractStillborn(on, false);
        expect(off).toMatchObject({ extractStillbornFromTotal: false, maleCount: 3, femaleCount: 2, unknownCount: 1, litterSizeBorn: 6 });
    });
    it('toggleExtractLosses clamps at zero and nulls empty counts', () => {
        const on = toggleExtractLosses(form({ maleCount: 1, femaleCount: 2, litterSizeBorn: 3, maleLosses: 4 }), true);
        expect(on).toMatchObject({ extractLossesFromTotal: true, maleCount: null, femaleCount: 2, litterSizeBorn: 2 });
    });
});

describe('offspring linking', () => {
    const animals = [
        { id_public: 'A1', sireId_public: 'CTC1', damId_public: 'CTC2', gender: 'Male', birthDate: '2026-01-01T00:00:00.000Z' },
        { id_public: 'A2', sireId_public: 'CTC1', damId_public: 'CTC2', gender: 'Female', birthDate: '2026-01-05T00:00:00.000Z' },
        { id_public: 'A3', sireId_public: 'CTC1', damId_public: 'CTC2', gender: 'Unknown' },
        { id_public: 'A4', sireId_public: 'CTC9', damId_public: 'CTC2', gender: 'Male', birthDate: '2026-01-01' },
    ];

    it('linkableOffspring matches parents, and birth date when both sides have one', () => {
        expect(linkableOffspring(animals, form()).map(a => a.id_public)).toEqual(['A1', 'A2', 'A3']);
        expect(linkableOffspring(animals, form({ birthDate: '2026-01-01' })).map(a => a.id_public)).toEqual(['A1', 'A3']);
    });
    it('linkOffspring fills the birth date from the first linked animal', () => {
        const { form: next } = linkOffspring(form(), animals[0]);
        expect(next).toMatchObject({ linkedOffspringIds: ['A1'], birthDate: '2026-01-01', birthDateUnknown: false });
    });
    it('linkOffspring leaves the date alone when the animal has none', () => {
        expect(linkOffspring(form(), animals[2]).form.birthDate).toBe('');
    });
    it('linkOffspring asks for confirmation on a date mismatch, then moves the litter date', () => {
        const base = form({ birthDate: '2026-01-01' });
        expect(linkOffspring(base, animals[1])).toEqual({ needsConfirm: { animalDate: '2026-01-05', litterDate: '2026-01-01' } });
        const { form: next } = linkOffspring(base, animals[1], { acceptDateChange: true });
        expect(next).toMatchObject({ birthDate: '2026-01-05', linkedOffspringIds: ['A2'] });
    });
    it('unlinkOffspring removes only that animal', () => {
        expect(unlinkOffspring(form({ linkedOffspringIds: ['A1', 'A2'] }), 'A1').linkedOffspringIds).toEqual(['A2']);
    });
    it('countLinkedBySex buckets non male/female as Unknown', () => {
        expect(countLinkedBySex(animals, ['A1', 'A2', 'A3'])).toEqual({ Male: 1, Female: 1, Unknown: 1 });
    });
    it('remainingToCreate is the shortfall per sex, never negative', () => {
        const r = remainingToCreate(form({ maleCount: 3, femaleCount: 1, unknownCount: 0 }), { Male: 1, Female: 2, Unknown: 0 });
        expect(r).toEqual({ males: 2, females: 0, unknown: 0, total: 2 });
    });
});

describe('isFormDirty', () => {
    it('detects changes', () => {
        expect(isFormDirty(form(), form())).toBe(false);
        expect(isFormDirty(form({ notes: 'x' }), form())).toBe(true);
    });
});
