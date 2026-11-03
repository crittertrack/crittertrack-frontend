import {
    getFieldLabel,
    getSpeciesCategory as getMappedSpeciesCategory,
    isFieldHiddenForSpecies,
} from './speciesFieldTemplates';

const EGG_LAYING_CATEGORIES = new Set(['Amphibian', 'Bird', 'Fish', 'Invertebrate', 'Reptile']);
const RAT_SPECIES = new Set(['rat', 'fancy rat']);

const CATEGORY_LABELS = {
    Bird: {
        birthDate: 'Hatch date',
        weaningDate: 'Fledging / independence date',
        weaningConfirmed: 'Confirm fledging / independence',
        pregnancyLost: 'Clutch lost',
    },
    Fish: {
        birthDate: 'Spawn / hatch date',
        weaningDate: 'Independence date',
        weaningConfirmed: 'Confirm independence',
        pregnancyLost: 'Spawn / egg loss',
    },
    Amphibian: {
        birthDate: 'Egg-laying / hatch date',
        weaningDate: 'Independence date',
        weaningConfirmed: 'Confirm independence',
        pregnancyLost: 'Egg / clutch loss',
    },
    Invertebrate: {
        birthDate: 'Egg-laying / hatch date',
        weaningDate: 'Independence date',
        weaningConfirmed: 'Confirm independence',
        pregnancyLost: 'Egg sac / clutch loss',
    },
    Reptile: {
        birthDate: 'Egg-laying / hatch date',
        weaningDate: 'Independence date',
        weaningConfirmed: 'Confirm independence',
        pregnancyLost: 'Egg / clutch loss',
    },
};

const EGG_LAYING_LABELS = {
    matingDate: 'Pairing date',
    expectedDueDate: 'Expected hatch date',
    weaningOutcome: 'Fledging / independence outcome',
    weaningNotes: 'Fledging / independence notes',
};

const APPEARANCE_FIELDS = [
    { key: 'color', defaultLabel: 'Color' },
    { key: 'markings', defaultLabel: 'Markings' },
    { key: 'earset', defaultLabel: 'Earset' },
    { key: 'coat', defaultLabel: 'Coat Type' },
    { key: 'eyeColor', defaultLabel: 'Eye Color' },
    { key: 'body', defaultLabel: 'Body' },
];

export const getLitterSpecies = (litter) =>
    litter?.species || litter?.sire?.species || litter?.dam?.species || '';

export const getLitterSpeciesCategory = (species, speciesOptions = []) =>
    speciesOptions.find(option => option.name === species)?.category || getMappedSpeciesCategory(species);

export const isEggLayingSpecies = (species, speciesOptions = []) =>
    EGG_LAYING_CATEGORIES.has(getLitterSpeciesCategory(species, speciesOptions));

export const getLitterFieldLabel = (field, species, defaultLabel, speciesOptions = []) => {
    const category = getLitterSpeciesCategory(species, speciesOptions);
    if (EGG_LAYING_CATEGORIES.has(category)) {
        const categoryLabel = CATEGORY_LABELS[category]?.[field];
        if (categoryLabel) return categoryLabel;
        if (EGG_LAYING_LABELS[field]) return EGG_LAYING_LABELS[field];
    }
    return getFieldLabel(field, species, defaultLabel, category);
};

export const getLitterAppearanceFields = (species, speciesOptions = []) => {
    const category = getLitterSpeciesCategory(species, speciesOptions);
    return APPEARANCE_FIELDS
        .filter(({ key }) => !isFieldHiddenForSpecies(key, species, category))
        .filter(({ key }) => key !== 'earset' || RAT_SPECIES.has((species || '').toLowerCase()))
        .map(({ key, defaultLabel }) => ({
            key,
            label: getFieldLabel(key, species, defaultLabel, category),
        }));
};
