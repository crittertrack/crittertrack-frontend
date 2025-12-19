# Genetics Enhancement Implementation Plan

## Overview
Enhance the genetics calculator and animal profile genetic code management with three major features:
1. **Animal Selection for Calculator** - Select owned animals to auto-fill genetics
2. **Genetic Code Builder** - Visual tool to build genetic codes for animal profiles
3. **Community Species Genetics Feedback** - Help build calculators for other species

---

## Phase 1: Animal Selection for Calculator (Logged-in Users)

### Components Needed:
- Animal selector dropdown/modal for Parent 1 and Parent 2
- Parse genetic code from animal profile to fill calculator dropdowns
- Only show for logged-in users (authToken present)

### Implementation Steps:
1. Add "Select Animal" button above each parent section
2. Create modal/dropdown showing user's owned animals
   - Filter by species (Fancy Mouse only for now)
   - Filter by gender (Males for Sire, Females for Dam)
3. Parse geneticCode from selected animal
4. Map parsed code to GENE_LOCI dropdowns
5. Fill parent genotype automatically

### Genetic Code Format:
Current: Text field (e.g., "A/A B/b C/C D/D")
Parsed: Split by spaces, extract locus and alleles

### UI Changes:
```jsx
// Above parent section
<button onClick={openAnimalSelector}>
  Select from My Animals
</button>

// Animal selector modal
<Modal>
  <select species filter />
  <animal list with images>
    - Name
    - ID
    - Genetic Code preview
    - Select button
  </select>
</Modal>
```

---

## Phase 2: Genetic Code Builder

### Purpose:
Replace simple text input with visual builder that offers:
- Manual text entry (current method)
- Visual dropdown selection (new method)

### Components:
1. **GeneticCodeBuilderModal**
   - Two tabs: "Manual Entry" | "Visual Builder"
   - Manual: Simple text input (current)
   - Visual: Dropdowns for each locus (like calculator)
   - Save button generates genetic code string

2. **Integration Points:**
   - Animal creation/edit form
   - Replaces current geneticCode input field
   - Button: "Build Genetic Code" opens modal

### Visual Builder:
```jsx
<div className="grid grid-cols-2 gap-4">
  {GENE_LOCI.map(locus => (
    <select>
      <option>A - Agouti</option>
      <option>a/a</option>
      <option>A/a</option>
      ...
    </select>
  ))}
</div>

// Generate code button
onClick={() => {
  const code = Object.entries(selections)
    .filter(([_, value]) => value)
    .map(([locus, alleles]) => `${locus}/${alleles}`)
    .join(' ');
  setGeneticCode(code);
}}
```

### Data Flow:
1. User clicks "Build Genetic Code"
2. Modal opens with two tabs
3. User chooses manual or visual
4. Visual: Select alleles from dropdowns
5. Click "Save" → generates genetic code string
6. String populates geneticCode field in animal form

---

## Phase 3: Community Species Genetics Feedback

### Purpose:
Allow users to submit genetics information for species other than Fancy Mouse to help build future calculators.

### Components:
1. **Feedback Button in Calculator**
   - Only visible when logged in
   - "Help Build Calculators for Other Species"

2. **Species Genetics Submission Form**
   - Species dropdown (all species in database)
   - Gene name input (e.g., "Agouti", "Dilution")
   - Allele combinations textarea
   - Phenotype result input
   - Example/notes textarea
   - Submit to backend

### Backend Route:
```javascript
POST /api/species-genetics-feedback
{
  species: "Syrian Hamster",
  geneName: "Dominant Spot",
  alleleCombinations: "Ds/ds, Ds/Ds",
  phenotypeResult: "Banded, Double Banded",
  notes: "Ds/Ds may be lethal in some lines",
  submittedBy: userId
}
```

### UI Placement:
- Button in calculator header (next to "View Examples")
- Modal form for submission
- Success message after submission
- Admin review system (future)

---

## Implementation Order

### Week 1: Animal Selection
1. ✅ Add props to MouseGeneticsCalculator (myAnimals, authToken already passed)
2. ✅ Create animal selector modal component
3. ✅ Add "Select Animal" buttons
4. ✅ Parse genetic code string to genotype object
5. ✅ Test with existing animals

### Week 2: Genetic Code Builder
1. ✅ Create GeneticCodeBuilderModal component
2. ✅ Add manual/visual tabs
3. ✅ Visual tab: Reuse GENE_LOCI from calculator
4. ✅ Generate code string from selections
5. ✅ Integrate into animal form
6. ✅ Test code generation and parsing

### Week 3: Community Feedback
1. ✅ Create backend route for species genetics feedback
2. ✅ Create frontend submission form
3. ✅ Add button to calculator
4. ✅ Test submission flow
5. ✅ Create admin review panel (future enhancement)

---

## Technical Considerations

### Genetic Code Parsing:
```javascript
// Parse "A/A B/b C/C" → {A: 'A/A', B: 'B/b', C: 'C/C'}
function parseGeneticCode(codeString) {
  const genotype = {};
  const parts = codeString.split(/\s+/);
  
  parts.forEach(part => {
    // Match patterns like "A/A", "B/b", etc.
    const match = part.match(/^([A-Za-z]+)\/([A-Za-z]+)$/);
    if (match) {
      const locus = match[1][0].toUpperCase();
      genotype[locus] = part;
    }
  });
  
  return genotype;
}
```

### Genetic Code Generation:
```javascript
// Generate from selections {A: 'A/A', B: 'B/b'} → "A/A B/b"
function generateGeneticCode(genotype) {
  return Object.entries(genotype)
    .filter(([_, value]) => value && value !== '')
    .map(([_, alleles]) => alleles)
    .join(' ');
}
```

### Species Support:
- Phase 1: Fancy Mouse only (existing calculator)
- Future: Add calculators for other species based on community feedback
- Modular design allows easy addition of new species calculators

---

## Database Schema Changes

### Animal Model (existing):
```javascript
geneticCode: { type: String, default: '' }
// No changes needed
```

### New: SpeciesGeneticsFeedback Model:
```javascript
{
  species: String,
  geneName: String,
  alleleCombinations: String,
  phenotypeResult: String,
  notes: String,
  submittedBy: ObjectId (ref: User),
  status: {type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending'},
  reviewedBy: ObjectId (ref: User),
  reviewNotes: String,
  createdAt: Date
}
```

---

## User Stories

### Story 1: Quick Breeding Prediction
> As a breeder, I want to select two of my animals from dropdowns in the calculator, so I can quickly see predicted offspring without manually entering genetics.

### Story 2: Easy Genetic Code Entry
> As a user, I want a visual tool to build genetic codes for my animals, so I don't have to memorize genetic notation syntax.

### Story 3: Community Contribution
> As a user with knowledge of other species genetics, I want to submit genetic information, so the community can eventually have calculators for all species.

---

## Success Metrics
- 80% of users with genetic codes use animal selector instead of manual entry
- 50% reduction in genetic code entry errors
- 100+ community genetics submissions in first month
- 5+ species with enough data for future calculators

