import { computeLitterStats, buildTimeline, nextMilestone, varietyOf } from './helpers';

describe('computeLitterStats', () => {
    it('treats null as not recorded, never as zero', () => {
        const s = computeLitterStats({}, 'planned');
        expect(s.totalBorn).toBeNull();
        expect(s.male).toBeNull();
        expect(s.stillborn).toBeNull();
        expect(s.anyLossRecorded).toBe(false);
    });

    it('keeps a recorded zero distinct from missing', () => {
        const s = computeLitterStats({ litterSizeBorn: 4, maleCount: 2, femaleCount: 2, unknownCount: 0, stillbornCount: 0 }, 'born');
        expect(s.unknown).toBe(0);
        expect(s.stillborn).toBe(0);
        expect(s.anyLossRecorded).toBe(true);
    });

    it('does not double count culls inside losses', () => {
        const s = computeLitterStats({ litterSizeBorn: 10, lossesCount: 3, hasCulls: true, cullsCount: 2, stillbornCount: 1 }, 'born');
        expect(s.postnatal).toBe(1);
        expect(s.culls).toBe(2);
        expect(s.liveBorn).toBe(9);
        expect(s.surviving).toBe(6);
    });

    it('adds extracted losses back so total born is the real total', () => {
        const s = computeLitterStats({ litterSizeBorn: 7, maleCount: 4, femaleCount: 3, lossesCount: 2, extractLossesFromTotal: true }, 'born');
        expect(s.totalBorn).toBe(9);
        expect(s.sexExcludesLosses).toBe(true);
    });

    it('reports weaning as pending until confirmed, and computes survival once weaned', () => {
        expect(computeLitterStats({ litterSizeBorn: 8 }, 'born').weanedState).toBe('pending');
        const s = computeLitterStats({ litterSizeBorn: 8, stillbornCount: 0, litterSizeWeaned: 6, weaningConfirmed: true }, 'born');
        expect(s.weanedState).toBe('value');
        expect(s.survivalPct).toBe(75);
    });
});

describe('buildTimeline', () => {
    it('marks unrecorded steps as missing and labels weaning by confirmation', () => {
        const steps = buildTimeline({ matingDate: '2026-01-01' }, 'mated');
        expect(steps.map(s => s.key)).toEqual(['mating', 'pregnancy', 'due', 'birth', 'weaning']);
        expect(steps[0].done).toBe(true);
        expect(steps[1].missing).toBe(true);
        expect(steps[4].label).toBe('Expected weaning');
        expect(buildTimeline({ weaningDate: '2026-03-01', weaningConfirmed: true }, 'born')[4].label).toBe('Weaned');
    });
});

describe('nextMilestone', () => {
    const now = new Date('2026-05-10T12:00:00');
    it('points at the due date for a mated litter', () => {
        const m = nextMilestone({ matingDate: '2026-05-01', expectedDueDate: '2026-05-22' }, 'mated', now);
        expect(m).toMatchObject({ label: 'Birth due', days: 12 });
    });
    it('points at weaning for a born litter and ends once weaned', () => {
        expect(nextMilestone({ birthDate: '2026-04-20', weaningDate: '2026-05-15' }, 'born', now)).toMatchObject({ label: 'Weaning', days: 5 });
        expect(nextMilestone({ birthDate: '2026-04-20', weaningDate: '2026-05-15', weaningConfirmed: true }, 'born', now)).toBeNull();
    });
});

describe('varietyOf', () => {
    it('joins the available trait fields', () => {
        expect(varietyOf({ color: 'Black', markings: 'Tan', coat: 'Shorthair' })).toBe('Black Tan Shorthair');
        expect(varietyOf(null)).toBe('');
    });
});
