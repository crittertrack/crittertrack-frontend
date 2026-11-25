import { deriveStoredStatus, deriveLitterFormStatus, LITTER_STATUS_LABELS } from './litterStatus';

describe('litterStatus', () => {
    it('labels a lost pregnancy as its own terminal status', () => {
        expect(LITTER_STATUS_LABELS.lost).toBe('Pregnancy lost');
        expect(deriveStoredStatus({ pregnancyLost: true, pregnancyDate: '2026-01-10' })).toBe('lost');
        expect(deriveStoredStatus({ pregnancyLost: true, matingDate: '2026-01-01' })).toBe('lost');
    });

    it('still treats a litter with a birth date as born, even if also flagged lost', () => {
        expect(deriveStoredStatus({ pregnancyLost: true, birthDate: '2026-02-01' })).toBe('born');
    });

    it('derives lost for a form flagged pregnancy-lost without a birth date', () => {
        expect(deriveLitterFormStatus({ matingDate: '2026-01-05', pregnancyDate: '2026-01-15', pregnancyLost: true })).toBe('lost');
        expect(deriveLitterFormStatus(
            { matingDate: '2026-01-05', pregnancyLost: true },
            { pregnancyDate: '2026-01-15', pregnancyLost: true }
        )).toBe('lost');
    });
});