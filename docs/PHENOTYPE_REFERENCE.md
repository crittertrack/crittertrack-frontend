# Mouse Genetics Calculator - Phenotype Text Reference

This document shows all locations where phenotype titles/names appear in the code for easy editing.

## File: MouseGeneticsCalculator.jsx

### 1. LETHAL COMBINATIONS (Lines 158-161)
```javascript
if (genotype.A === 'Ay/Ay (lethal)') return 'LETHAL: Dominant Yellow Homozygous';
if (genotype.W && genotype.W.includes('lethal')) return 'LETHAL: Dominant Spotting Homozygous';
if (genotype.Spl === 'Spl/Spl (lethal)') return 'LETHAL: Splashed Homozygous';
if (genotype.Wsh === 'Wsh/Wsh (lethal)') return 'LETHAL: Rumpwhite Homozygous';
```

### 2. ALBINO (Line 169)
```javascript
return genotype.P === 'p/p' ? 'Pink-Eyed White (Albino)' : 'Pink-Eyed White (Albino)';
```

### 3. RECESSIVE RED/YELLOW (Lines 173-180)
```javascript
if (genotype.E === 'e/e') {
  if (genotype.P === 'p/p') {
    color = 'Recessive Fawn';
  } else {
    color = 'Recessive Red (Yellow)';
  }
  return color;
}
```

### 4. DOMINANT YELLOW (Lines 183-190)
```javascript
if (genotype.A && (genotype.A.startsWith('Ay/'))) {
  if (genotype.P === 'p/p') {
    color = 'Dominant Fawn';
  } else {
    color = 'Dominant Yellow';
  }
  return color;
}
```

### 5. VIABLE YELLOW/BRINDLE (Lines 193-196)
```javascript
if (genotype.A && genotype.A.startsWith('Avy/')) {
  color = 'Brindle (Viable Yellow)';
  return color;
}
```

### 6. BASE COLORS (Lines 206-214)
```javascript
if (isAgouti) {
  pattern = 'Agouti';
  color = isBrown ? 'Cinnamon' : 'Agouti';
} else if (isTan) {
  pattern = 'Tan';
  color = isBrown ? 'Chocolate Tan' : 'Black Tan';
} else if (isBlack) {
  pattern = 'Self';
  color = isBrown ? 'Chocolate' : 'Black';
}
```

### 7. DILUTIONS (Lines 217-224)
```javascript
if (genotype.D === 'd/d') {
  if (color === 'Black') color = 'Blue';
  else if (color === 'Chocolate') color = 'Lilac';
  else if (color === 'Agouti') color = 'Silver Agouti';
  else if (color === 'Cinnamon') color = 'Argente';
  else if (color === 'Black Tan') color = 'Blue Tan';
  else if (color === 'Chocolate Tan') color = 'Lilac Tan';
}
```

### 8. PINK-EYE DILUTION (Lines 226-230)
```javascript
if (genotype.P === 'p/p') {
  if (!color.includes('Fawn') && !color.includes('Yellow')) {
    color = `Pink-Eyed ${color}`;
  }
}
```

### 9. C-LOCUS MODIFICATIONS (Lines 233-244)
```javascript
// Chinchilla
if (genotype.C === 'cch/cch' || genotype.C?.includes('cch/')) {
  if (!genotype.C.includes('C/cch')) {
    color = `Chinchilla ${color}`;
  }
}

// Himalayan
if (genotype.C === 'ch/ch' || (genotype.C?.includes('ch/') && !genotype.C.includes('C/ch') && !genotype.C.includes('cch/ch'))) {
  color = `Himalayan ${color}`;
}

// Beige
if (genotype.C === 'ce/ce' || (genotype.C?.includes('ce/') && !genotype.C.includes('C/ce'))) {
  color = `Beige ${color}`;
}
```

### 10. MARKINGS (Lines 247-275)
```javascript
// Piebald/Banded
if (genotype.S === 's/s') {
  markings.push('Piebald');
} else if (genotype.S === 'S/s') {
  markings.push('Banded');
}

// Dominant Spotting
if (genotype.W && genotype.W.includes('W/')) {
  markings.push('Dominant White Spotting');
} else if (genotype.W && genotype.W.includes('Wsh/')) {
  markings.push('Rumpwhite');
}

// Splashed
if (genotype.Spl && genotype.Spl.includes('Spl/')) {
  markings.push('Splashed');
}

// Roan
if (genotype.Rn && genotype.Rn.includes('Rn/')) {
  markings.push('Roan');
}

// Silvered
if (genotype.Si && genotype.Si.includes('Si/')) {
  markings.push('Silvered');
}

// xbrindle
if (genotype.Mobr && genotype.Mobr.includes('Mobr/')) {
  markings.push('xbrindle');
}

// Longhair
if (genotype.Go && genotype.Go.includes('Go/')) {
  markings.push('Longhair');
}
```

### 11. TEXTURE (Lines 278-293)
```javascript
// Astrex
if (genotype.Re === 're/re') {
  texture = 'Astrex';
}

// Satin
if (genotype.Sa === 'sa/sa') {
  texture = texture ? `${texture} Satin` : 'Satin';
}

// Rosette
if (genotype.Rst && genotype.Rst.includes('Rst/')) {
  texture = texture ? `${texture} Rosette` : 'Rosette';
}

// Fuzz
if (genotype.Fz === 'fz/fz') {
  texture = texture ? `${texture} Fuzz` : 'Fuzz';
}

// Nude/Hairless
if (genotype.Nu === 'nu/nu') {
  texture = 'Nude/Hairless';
}
```

### 12. FINAL RESULT COMBINATION (Lines 296-303)
```javascript
// Combine results
let result = color;
if (markings.length > 0) {
  result += ' ' + markings.join(', ');
}
if (texture) {
  result += ` (${texture})`;
}

return result || 'Unknown';
```

## Summary of Recent Changes Made:

### Gene Names Updated:
- ✅ Splotch → Splashed
- ✅ Mosaic/Brindled → xbrindle
- ✅ Gondola → Shorthair/Longhair
- ✅ Rex → Astrex
- ✅ Rough Coat → Rosette
- ✅ Fuzzy → Fuzz

### Layout Changes:
- ✅ Dropdowns now in 2-column grid layout
- ✅ Smaller text size (text-xs for labels, text-sm for selects)
- ✅ Reduced padding (px-2 py-1 instead of px-3 py-2)

### Phenotype Display Names Updated:
- ✅ "LETHAL: Splotch Homozygous" → "LETHAL: Splashed Homozygous"
- ✅ "Splotch" → "Splashed" (in markings)
- ✅ "Mosaic/Brindled" → "xbrindle" (in markings)
- ✅ "Gondola" → "Longhair" (in markings)
- ✅ "Rex" → "Astrex" (in texture)
- ✅ "Rough" → "Rosette" (in texture)
- ✅ "Fuzzy" → "Fuzz" (in texture)

## Notes:
- All phenotype text is in the `calculatePhenotype` function (lines 147-304)
- Final phenotype is displayed on lines 471-475 (Parent 1) and 503-507 (Parent 2)
- You can edit any of these text strings to change how the phenotype appears to users
