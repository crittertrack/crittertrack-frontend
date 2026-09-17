import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { AnimalNameWithFlag, getAnimalDisplayParts } from './animalDisplayName';

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

  it('keeps the flag anchored to the start of the text when a dashboard card opts into left alignment', () => {
    const html = renderToStaticMarkup(
      <AnimalNameWithFlag
        animal={{ prefix: '', name: 'Mochi', suffix: '🇨🇿' }}
        wrapperClassName="inline-flex items-start justify-start gap-1.5 text-left"
        wrapperStyle={{ display: 'inline-flex', alignItems: 'flex-start', justifyContent: 'flex-start', textAlign: 'left' }}
      />
    );

    expect(html).toContain('justify-content:flex-start');
    expect(html).toContain('align-items:flex-start');
    expect(html).not.toContain('justify-content:center');
  });
});
