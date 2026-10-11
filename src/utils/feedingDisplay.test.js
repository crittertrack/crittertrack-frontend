import { getAssignedDietSupplyQuantity, getDietSupplyLabels } from './feedingDisplay';

test('formats assigned diet supplies with quantities', () => {
  expect(getDietSupplyLabels([
    { name: 'Pellets' },
    { name: 'Fresh greens', quantity: 2 },
    { name: 'Calcium powder', quantity: 0.5, unit: 'g' },
  ])).toEqual(['Pellets', 'Fresh greens (2)', 'Calcium powder (0.5 g)']);
});

test('parses serialized diet supplies and ignores invalid entries', () => {
  expect(getDietSupplyLabels('[{"name":"Mealworms","quantity":"3"}]')).toEqual(['Mealworms (3)']);
  expect(getDietSupplyLabels('not valid JSON')).toEqual([]);
  expect(getDietSupplyLabels([{ id: 'missing-name' }, null])).toEqual([]);
});

test('prefills feeding quantity from the assigned supply by id or name', () => {
  expect(getAssignedDietSupplyQuantity(
    [{ id: 'supply-1', name: 'Pellets', quantity: 2.5 }],
    { _id: 'supply-1', name: 'Pellets' },
  )).toBe(2.5);

  expect(getAssignedDietSupplyQuantity(
    '[{"name":"Fresh greens","quantity":40}]',
    { _id: 'supply-2', name: 'Fresh greens' },
  )).toBe(40);
});
