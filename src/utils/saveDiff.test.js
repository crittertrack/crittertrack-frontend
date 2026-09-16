import { buildChangedSaveFields } from './saveDiff';

describe('saveDiff helpers', () => {
  it('ignores unchanged data even when falsey defaults are present', () => {
    const baseline = {
      suffix: 'A',
      crateTrained: null,
      leashTrained: null,
      litterTrained: null,
      freeFlightTrained: null,
      imageUrl: 'https://example.com/pic.jpg',
      extraImages: ['https://example.com/extra.jpg'],
    };

    const current = {
      suffix: 'A',
      crateTrained: false,
      leashTrained: false,
      litterTrained: false,
      freeFlightTrained: false,
      imageUrl: 'https://example.com/pic.jpg',
      extraImages: ['https://example.com/extra.jpg'],
    };

    expect(buildChangedSaveFields(current, baseline)).toEqual({});
  });

  it('keeps only fields that actually changed', () => {
    const baseline = {
      suffix: 'A',
      name: 'Milo',
      imageUrl: 'https://example.com/old.jpg',
    };

    const current = {
      suffix: 'B',
      name: 'Milo',
      imageUrl: 'https://example.com/old.jpg',
    };

    expect(buildChangedSaveFields(current, baseline)).toEqual({ suffix: 'B' });
  });
});
