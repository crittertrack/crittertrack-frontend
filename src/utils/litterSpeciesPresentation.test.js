import {
    getLitterAppearanceFields,
    getLitterFieldLabel,
    getLitterSpeciesCategory,
    isEggLayingSpecies,
} from './litterSpeciesPresentation';

describe('litter species presentation', () => {
    it('uses mammal labels and appearance fields for a hamster litter', () => {
        expect(getLitterSpeciesCategory('Syrian Hamster')).toBe('Mammal');
        expect(isEggLayingSpecies('Syrian Hamster')).toBe(false);
        expect(getLitterFieldLabel('birthDate', 'Syrian Hamster', 'Birth date')).toBe('Birth date');
        expect(getLitterAppearanceFields('Syrian Hamster').map(({ key }) => key)).toEqual([
            'color', 'markings', 'coat', 'eyeColor', 'body',
        ]);
    });

    it('keeps rat earset available while using the existing rat appearance fields', () => {
        const fields = getLitterAppearanceFields('Fancy Rat');
        expect(fields.map(({ key }) => key)).toEqual([
            'color', 'markings', 'earset', 'coat', 'eyeColor', 'body',
        ]);
        expect(fields.find(({ key }) => key === 'earset').label).toBe('Earset');
    });

    it('uses reptile morph and scalation terms without changing underlying keys', () => {
        const fields = getLitterAppearanceFields('Leopard Gecko');
        expect(fields.find(({ key }) => key === 'color')).toEqual({ key: 'color', label: 'Morph' });
        expect(fields.find(({ key }) => key === 'coat')).toEqual({ key: 'coat', label: 'Scalation' });
        expect(fields.find(({ key }) => key === 'markings').label).toBe('Scale Pattern');
        expect(fields.some(({ key }) => key === 'earset')).toBe(false);
    });

    it('uses species catalog categories for custom egg-laying species', () => {
        const options = [{ name: 'Custom Gecko', category: 'Reptile' }];
        expect(isEggLayingSpecies('Custom Gecko', options)).toBe(true);
        expect(getLitterFieldLabel('birthDate', 'Custom Gecko', 'Birth date', options)).toBe('Egg-laying / hatch date');
    });
});
