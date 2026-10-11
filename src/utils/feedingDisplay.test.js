import { getDietSupplyLabels } from './feedingDisplay';

test('formats assigned diet supplies with quantities', () => {
  expect(getDietSupplyLabels([
    { name: 'Pellets' },
    { name: 'Fresh greens', quantity: 2 },
  ])).toEqual(['Pellets', 'Fresh greens (2)']);
});

test('parses serialized diet supplies and ignores invalid entries', () => {
  expect(getDietSupplyLabels('[{"name":"Mealworms","quantity":"3"}]')).toEqual(['Mealworms (3)']);
  expect(getDietSupplyLabels('not valid JSON')).toEqual([]);
  expect(getDietSupplyLabels([{ id: 'missing-name' }, null])).toEqual([]);
});
