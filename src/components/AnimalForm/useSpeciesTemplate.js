import { useMemo } from 'react';

// Data derived from RENAMEABLE_FIELDS_BY_SPECIES.md, HIDE_FIELDS_BY_SPECIES.md, and IMPOSSIBLE_FIELDS_BY_SPECIES.md
const speciesTemplates = {
  Amphibian: {
    rename: {
      coat: 'Skin',
      coatPattern: 'Skin Pattern',
      breed: 'Subspecies',
      lifeStage: 'Tadpole/Froglet',
      expectedDueDate: 'Expected Hatch Date',
      litterCount: 'Clutch Count',
      litterSizeBorn: 'Clutch Size Born',
      litterSizeWeaned: 'Clutch Size Weaned',
      litterId: 'Clutch ID',
      stillbornCount: 'Non-Viable/Unhatched Egg Count',
      gestationLength: 'Incubation Period',
      deliveryMethod: 'Laying Method',
      birthEventDate: 'Hatch Event Date',
      isPregnant: 'isGravid',
      lastPregnancyDate: 'Last Gravid Date',
      bedding: 'Substrate',
      skinEarCareNeeds: 'Skin Care',
    },
    hide: [
      'earset', 'nailColor', 'heightAtWithers', 'eartagNumber', 'heatStatus', 'lastHeatDate', 'estrusCycleLength', 'isNursing', 'nursingStartDate', 'weaningDate', 'heartwormStatus', 'hipElbowScores', 'eyeClearance', 'cardiacClearance', 'reproductiveClearances', 'sheddingLevel', 'brushingFrequency', 'coatCareNotes', 'freeFlightTrained', 'leashTrained', 'crateTrained', 'litterTrained',
      'strain', 'pedigreeRegistrationId', 'tattooId', 'exerciseRequirements', 'dailyExerciseMinutes', 'trainingLevel', 'trainingDisciplines', 'certifications', 'workingRole', 'attachmentStyle', 'bondingBehavior'
    ],
  },
  Bird: {
    rename: {
      coat: 'Plumage',
      coatPattern: 'Plumage Pattern',
      lifeStage: 'Hatchling',
      expectedDueDate: 'Expected Hatch Date',
      litterCount: 'Clutch Count',
      litterSizeBorn: 'Clutch Size Born',
      litterSizeWeaned: 'Clutch Size Weaned',
      litterId: 'Clutch ID',
      stillbornCount: 'Non-Viable/Unhatched Egg Count',
      gestationLength: 'Incubation Period',
      deliveryMethod: 'Laying Method',
      birthEventDate: 'Hatch Event Date',
      beakHoofScaleMaintenance: 'Beak Maintenance',
      groomingNeeds: 'Preening Needs',
      groomingNotes: 'Preening Notes',
      nailCareRequirements: 'Talon Care',
    },
    hide: [
      'earset', 'heightAtWithers', 'eartagNumber', 'heatStatus', 'lastHeatDate', 'estrusCycleLength', 'isNursing', 'nursingStartDate', 'weaningDate', 'heartwormStatus', 'hipElbowScores', 'eyeClearance', 'cardiacClearance', 'reproductiveClearances', 'dentalRecords', 'dentalCareRequirements', 'sheddingRecords', 'moltingRecords', 'waterParameterChecks', 'sheddingLevel', 'brushingFrequency', 'coatCareNotes',
      'strain', 'tattooId'
    ],
  },
  Fish: {
    rename: {
      coat: 'Skin',
      coatPattern: 'Skin Pattern',
      lifeStage: 'Fry',
      chestGirth: 'Body Girth',
      expectedDueDate: 'Expected Hatch Date',
      litterCount: 'Brood Count',
      litterSizeBorn: 'Brood Size Born',
      litterSizeWeaned: 'Brood Size Weaned',
      litterId: 'Brood ID',
      stillbornCount: 'Non-Viable/Unhatched Egg Count',
      gestationLength: 'Incubation Period',
      deliveryMethod: 'Laying Method',
      birthEventDate: 'Hatch Event Date',
      isPregnant: 'isGravid',
      lastPregnancyDate: 'Last Gravid Date',
      bedding: 'Substrate',
      skinEarCareNeeds: 'Skin Care',
    },
    hide: [
      'earset', 'nailColor', 'heightAtWithers', 'ringId', 'heatStatus', 'lastHeatDate', 'estrusCycleLength', 'isNursing', 'nursingStartDate', 'weaningDate', 'isNeutered', 'spayNeuterDate', 'heartwormStatus', 'hipElbowScores', 'eyeClearance', 'cardiacClearance', 'reproductiveClearances', 'sheddingRecords', 'moltingRecords', 'sheddingLevel', 'brushingFrequency', 'coatCareNotes', 'freeFlightTrained', 'leashTrained', 'crateTrained', 'litterTrained',
      'breed', 'bodyConditionScore', 'pedigreeRegistrationId', 'tattooId', 'studFeeCurrency', 'studFeeAmount', 'exerciseRequirements', 'dailyExerciseMinutes', 'trainingLevel', 'trainingDisciplines', 'certifications', 'workingRole', 'attachmentStyle', 'bondingBehavior'
    ],
  },
  Invertebrate: {
    rename: {
      coat: 'Coloring',
      coatPattern: 'Skin Pattern',
      breed: 'Subspecies',
      lifeStage: 'Larva/Nymph/Instar',
      chestGirth: 'Body Girth',
      colonyId: 'Colony ID',
      expectedDueDate: 'Expected Hatch Date',
      litterCount: 'Brood Count',
      litterSizeBorn: 'Brood Size Born',
      litterSizeWeaned: 'Brood Size Weaned',
      litterId: 'Brood ID',
      stillbornCount: 'Non-Viable/Unhatched Egg Count',
      gestationLength: 'Incubation Period',
      deliveryMethod: 'Laying Method',
      birthEventDate: 'Hatch Event Date',
      isPregnant: 'isGravid',
      lastPregnancyDate: 'Last Gravid Date',
      bedding: 'Substrate',
      skinEarCareNeeds: 'Skin Care',
    },
    hide: [
      'earset', 'nailColor', 'heightAtWithers', 'microchipNumber', 'eartagNumber', 'heatStatus', 'lastHeatDate', 'estrusCycleLength', 'isNursing', 'nursingStartDate', 'weaningDate', 'isNeutered', 'spayNeuterDate', 'artificialInseminationUsed', 'dewormingRecords', 'allergies', 'heartwormStatus', 'hipElbowScores', 'eyeClearance', 'cardiacClearance', 'reproductiveClearances', 'dentalRecords', 'dentalCareRequirements', 'vaccinations', 'waterParameterChecks', 'sheddingLevel', 'brushingFrequency', 'coatCareNotes', 'leashTrained', 'crateTrained', 'litterTrained',
      'bodyConditionScore', 'pedigreeRegistrationId', 'tattooId', 'studFeeCurrency', 'studFeeAmount', 'exerciseRequirements', 'dailyExerciseMinutes', 'trainingLevel', 'trainingDisciplines', 'certifications', 'workingRole', 'attachmentStyle', 'bondingBehavior'
    ],
  },
  Mammal: {
    rename: {
      lifeStage: 'Pup/Kit/Juvenile',
    },
    hide: [
      'moltingRecords', 'waterParameterChecks',
      'origin'
    ],
  },
  Reptile: {
    rename: {
      coat: 'Scalation',
      coatPattern: 'Scale Pattern',
      breed: 'Subspecies',
      lifeStage: 'Hatchling',
      chestGirth: 'Body Girth',
      expectedDueDate: 'Expected Hatch Date',
      litterCount: 'Clutch Count',
      litterSizeBorn: 'Clutch Size Born',
      litterSizeWeaned: 'Clutch Size Weaned',
      litterId: 'Clutch ID',
      stillbornCount: 'Non-Viable/Unhatched Egg Count',
      gestationLength: 'Incubation Period',
      deliveryMethod: 'Laying Method',
      birthEventDate: 'Hatch Event Date',
      isPregnant: 'isGravid',
      lastPregnancyDate: 'Last Gravid Date',
      bedding: 'Substrate',
      beakHoofScaleMaintenance: 'Scale Maintenance',
      skinEarCareNeeds: 'Skin Care',
      nailCareRequirements: 'Claw Care',
      bathingFrequency: 'Soaking Frequency',
    },
    hide: [
      'earset', 'heightAtWithers', 'eartagNumber', 'heatStatus', 'lastHeatDate', 'estrusCycleLength', 'isNursing', 'nursingStartDate', 'weaningDate', 'heartwormStatus', 'hipElbowScores', 'eyeClearance', 'cardiacClearance', 'reproductiveClearances', 'dentalRecords', 'sheddingLevel', 'brushingFrequency', 'coatCareNotes', 'crateTrained', 'litterTrained',
      'strain', 'tattooId', 'exerciseRequirements', 'dailyExerciseMinutes', 'trainingLevel', 'trainingDisciplines', 'certifications', 'workingRole'
    ],
  },
  Other: {
    rename: {},
    hide: [],
  },
};

// Data derived from SPECIES_AND_FIELDS.md
const speciesToCategory = {
  'Axolotl': 'Amphibian', 'Dart Poison Frog': 'Amphibian', 'Fire-Bellied Toad': 'Amphibian', 'Pacman Frog': 'Amphibian', 'Tiger Salamander': 'Amphibian', 'Tomato Frog': 'Amphibian', 'White\'s Tree Frog': 'Amphibian',
  'African Grey Parrot': 'Bird', 'Budgie': 'Bird', 'Canary': 'Bird', 'Cockatiel': 'Bird', 'Cockatoo': 'Bird', 'Conure': 'Bird', 'Dove': 'Bird', 'Lovebird': 'Bird', 'Macaw': 'Bird', 'Zebra Finch': 'Bird',
  'Angelfish': 'Fish', 'Betta Fish': 'Fish', 'Corydoras': 'Fish', 'Discus': 'Fish', 'Fancy Goldfish': 'Fish', 'Guppy': 'Fish', 'Koi': 'Fish', 'Oscar': 'Fish', 'Platy': 'Fish',
  'Bumble Bee': 'Invertebrate', 'Cubaris Isopod': 'Invertebrate', 'Curlyhair Tarantula': 'Invertebrate', 'Giant African Millipede': 'Invertebrate', 'Giant Yellow Spotted Isopod': 'Invertebrate', 'Gooty Sapphire Ornamental Tarantula': 'Invertebrate', 'Hermit Crab': 'Invertebrate', 'Hissing Cockroach': 'Invertebrate', 'Honey Bee': 'Invertebrate', 'Jumping Spider': 'Invertebrate', 'Land Snail': 'Invertebrate', 'Pill Millipede': 'Invertebrate', 'Plum Isopod': 'Invertebrate', 'Praying Mantis': 'Invertebrate', 'Roly-Poly Isopod': 'Invertebrate', 'Scorpion': 'Invertebrate', 'Smooth Isopod': 'Invertebrate', 'Stick Insect': 'Invertebrate', 'Tarantula': 'Invertebrate',
  'African Pygmy Dormouse': 'Mammal', 'African Pygmy Mouse': 'Mammal', 'Campbells Dwarf Hamster': 'Mammal', 'Cat': 'Mammal', 'Chinchilla': 'Mammal', 'Chinese Dwarf Hamster': 'Mammal', 'Deer Mouse': 'Mammal', 'Degu': 'Mammal', 'Dog': 'Mammal', 'Fancy Mouse': 'Mammal', 'Fancy Rat': 'Mammal', 'Fat-tailed Gerbil': 'Mammal', 'Ferret': 'Mammal', 'Gerbil': 'Mammal', 'Guinea Pig': 'Mammal', 'Hedgehog': 'Mammal', 'Natal Rats': 'Mammal', 'Prairie Dog': 'Mammal', 'Rabbit': 'Mammal', 'Roborovski Dwarf Hamster': 'Mammal', 'Russian Dwarf Hamster': 'Mammal', 'Sugar Glider': 'Mammal', 'Syrian Hamster': 'Mammal',
  '3 Lined Knobtail Gecko': 'Reptile', 'Ball Python': 'Reptile', 'Banded Knobtails Gecko': 'Reptile', 'Bearded Dragon': 'Reptile', 'Blue-Tongued Skink': 'Reptile', 'Cape African House Snake': 'Reptile', 'Centralian Rough Knobtail Gecko': 'Reptile', 'Chameleon': 'Reptile', 'Corn Snake': 'Reptile', 'Crested Gecko': 'Reptile', 'Eastern Kingsnake': 'Reptile', 'Gargoyle Gecko': 'Reptile', 'Giant Day Gecko': 'Reptile', 'Leopard Gecko': 'Reptile', 'Pilbara Knobtail Gecko': 'Reptile', 'Red-Eared Slider': 'Reptile', 'Russian Tortoise': 'Reptile', 'Thicktail Gecko': 'Reptile',
  'Other': 'Other',
};

/**
 * Returns the general category for a given species name.
 * @param {string} speciesName - The specific species name (e.g., "Ball Python").
 * @returns {string} The general category (e.g., "Reptile"). Defaults to 'Other'.
 */
function getSpeciesCategory(speciesName) {
  return speciesToCategory[speciesName] || 'Other';
}

/**
 * Converts a camelCase field name to a user-friendly Title Case label.
 * @param {string} fieldName - The field name in camelCase (e.g., 'coatPattern').
 * @returns {string} The formatted label (e.g., 'Coat Pattern').
 */
function formatLabel(fieldName) {
  if (!fieldName) return '';
  const result = fieldName.replace(/([A-Z])/g, ' $1');
  return result.charAt(0).toUpperCase() + result.slice(1);
}

/**
 * A custom hook to get species-specific field templates (labels and visibility).
 *
 * @param {string} speciesName - The name of the animal's species.
 * @returns {{isFieldVisible: (fieldName: string) => boolean, getFieldLabel: (fieldName: string) => string}}
 *          An object containing helper functions for templating.
 */
export function useSpeciesTemplate(speciesName) {
  const template = useMemo(() => {
    const category = getSpeciesCategory(speciesName);
    return speciesTemplates[category] || speciesTemplates.Other;
  }, [speciesName]);

  const isFieldVisible = (fieldName) => {
    return !template.hide.includes(fieldName);
  };

  const getFieldLabel = (fieldName) => {
    return template.rename[fieldName] || formatLabel(fieldName);
  };

  return { isFieldVisible, getFieldLabel };
}