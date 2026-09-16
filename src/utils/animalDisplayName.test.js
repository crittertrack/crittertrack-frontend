import { getAnimalDisplayParts } from './animalDisplayName';

describe('animalDisplayName parsing', () => {
  it('strips a manual flag emoji from the suffix and exposes the flag code', () => {
    expect(getAnimalDisplayParts({ prefix: '', name: 'Mochi', suffix: '🇩🇪' })).toEqual({
      flagCode: 'de',
      displayText: 'Mochi',
      segments: ['Mochi'],
    });
  });

  it('keeps ordinary names unchanged when there is no flag emoji', () => {
    expect(getAnimalDisplayParts({ prefix: 'F', name: 'Mochi', suffix: 'Blue' })).toEqual({
      flagCode: null,
      displayText: 'F Mochi Blue',
      segments: ['F', 'Mochi', 'Blue'],
    });
  });
});
