import { convertFeedingQuantity, getCompatibleFeedingUnits } from './feedingUnits';

test('converts compatible mass and volume quantities into inventory units', () => {
    expect(convertFeedingQuantity(100, 'g', 'kg')).toBeCloseTo(0.1);
    expect(convertFeedingQuantity(1, 'mg', 'g')).toBeCloseTo(0.001);
    expect(convertFeedingQuantity(2, 'l', 'ml')).toBe(2000);
});

test('rejects conversions between incompatible or different custom units', () => {
    expect(convertFeedingQuantity(1, 'ml', 'g')).toBeNull();
    expect(convertFeedingQuantity(1, 'scoop', 'kg')).toBeNull();
    expect(convertFeedingQuantity(1, 'scoop', 'scoop')).toBe(1);
});

test('offers unit choices compatible with the inventory measurement', () => {
    expect(getCompatibleFeedingUnits('kg')).toContain('g');
    expect(getCompatibleFeedingUnits('ml')).toContain('l');
    expect(getCompatibleFeedingUnits('scoop')).toEqual(['scoop']);
});
