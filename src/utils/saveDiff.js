const normalizeForSaveComparison = (value) => {
  if (value === undefined || value === null || value === '') return null;

  if (Array.isArray(value)) {
    return value.map(item => normalizeForSaveComparison(item));
  }

  if (typeof value === 'object') {
    if (value instanceof Date) return value.toISOString();

    return Object.keys(value).sort().reduce((acc, key) => {
      acc[key] = normalizeForSaveComparison(value[key]);
      return acc;
    }, {});
  }

  return value;
};

export const valuesEquivalentForSave = (left, right) => {
  if ((left === null || left === undefined || left === '' || left === false) &&
      (right === null || right === undefined || right === '' || right === false)) {
    return true;
  }

  if ((left === null || left === undefined || left === '') && (right === null || right === undefined || right === '')) {
    return true;
  }

  const normalizedLeft = normalizeForSaveComparison(left);
  const normalizedRight = normalizeForSaveComparison(right);

  return JSON.stringify(normalizedLeft) === JSON.stringify(normalizedRight);
};

export const buildChangedSaveFields = (currentValues = {}, baselineValues = {}) => {
  const result = {};
  const allKeys = new Set([...Object.keys(currentValues), ...Object.keys(baselineValues)]);

  allKeys.forEach((key) => {
    if (!valuesEquivalentForSave(currentValues[key], baselineValues[key])) {
      result[key] = currentValues[key];
    }
  });

  return result;
};
