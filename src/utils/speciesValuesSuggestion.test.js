import { validateSuggestion, buildSuggestionBody, withoutCovered, MAX_DAYS } from './speciesValuesSuggestion';

describe('validateSuggestion', () => {
  it('needs a species', () => {
    expect(validateSuggestion({ species: '', gestationDays: 20, weaningDays: '' })).toMatch(/select a species/i);
  });

  it('needs at least one of gestation or weaning', () => {
    expect(validateSuggestion({ species: 'Gerbil', gestationDays: '', weaningDays: '' })).toMatch(/or both/i);
    expect(validateSuggestion({ species: 'Gerbil' })).toMatch(/or both/i);
    expect(validateSuggestion({ species: 'Gerbil', gestationDays: '24', weaningDays: '' })).toBeNull();
    expect(validateSuggestion({ species: 'Gerbil', gestationDays: '', weaningDays: '21' })).toBeNull();
    expect(validateSuggestion({ species: 'Gerbil', gestationDays: '24', weaningDays: '21' })).toBeNull();
  });

  it('rejects non-whole, zero, negative and too-large durations', () => {
    for (const bad of ['0', '-2', '1.5', 'abc', String(MAX_DAYS + 1)]) {
      expect(validateSuggestion({ species: 'Gerbil', gestationDays: bad, weaningDays: '' })).toMatch(/gestation must be/i);
      expect(validateSuggestion({ species: 'Gerbil', gestationDays: '', weaningDays: bad })).toMatch(/weaning must be/i);
    }
  });

  it('rejects a bad value even when the other one is fine', () => {
    expect(validateSuggestion({ species: 'Gerbil', gestationDays: '24', weaningDays: '0' })).toMatch(/weaning/i);
  });
});

describe('withoutCovered', () => {
  const options = [{ name: 'Fancy Rat' }, { name: 'Gerbil' }, { name: 'Syrian Hamster' }];

  it('hides species that already have values, ignoring case', () => {
    expect(withoutCovered(options, ['fancy rat', 'Syrian Hamster']).map((s) => s.name)).toEqual(['Gerbil']);
  });

  it('shows everything when the covered list is empty (e.g. it failed to load)', () => {
    expect(withoutCovered(options, [])).toBe(options);
    expect(withoutCovered(options)).toBe(options);
  });
});

describe('buildSuggestionBody', () => {
  it('sends numbers for filled boxes and null for empty ones', () => {
    expect(buildSuggestionBody({ species: 'Gerbil', gestationDays: '24', weaningDays: '' }))
      .toEqual({ species: 'Gerbil', gestationDays: 24, weaningDays: null });
    expect(buildSuggestionBody({ species: 'Gerbil', gestationDays: '', weaningDays: ' 21 ' }))
      .toEqual({ species: 'Gerbil', gestationDays: null, weaningDays: 21 });
  });
});
