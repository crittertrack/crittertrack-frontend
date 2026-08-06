// Species Templates: decides which Animal fields are hidden and which UI labels are
// renamed, based on the species' category. Source of truth for the classification:
// IMPOSSIBLE_FIELDS_BY_SPECIES.md, HIDE_FIELDS_BY_SPECIES.md, RENAMEABLE_FIELDS_BY_SPECIES.md.

// Mirrors the `category` field on the backend Species model (Mammal/Reptile/Bird/
// Amphibian/Fish/Invertebrate/Other). Kept as a static map so hide/rename decisions
// don't require an extra API round-trip - falls back to 'Other' (no hides/renames) for
// any custom/user-added species not in this list.
export const SPECIES_CATEGORY_MAP = {
    // Amphibian
    'Axolotl': 'Amphibian', 'Dart Poison Frog': 'Amphibian', 'Fire-Bellied Toad': 'Amphibian',
    'Pacman Frog': 'Amphibian', 'Tiger Salamander': 'Amphibian', 'Tomato Frog': 'Amphibian',
    "White's Tree Frog": 'Amphibian',
    // Bird
    'African Grey Parrot': 'Bird', 'Budgie': 'Bird', 'Canary': 'Bird', 'Cockatiel': 'Bird',
    'Cockatoo': 'Bird', 'Conure': 'Bird', 'Dove': 'Bird', 'Lovebird': 'Bird', 'Macaw': 'Bird',
    'Zebra Finch': 'Bird',
    // Fish
    'Angelfish': 'Fish', 'Betta Fish': 'Fish', 'Corydoras': 'Fish', 'Discus': 'Fish',
    'Fancy Goldfish': 'Fish', 'Guppy': 'Fish', 'Koi': 'Fish', 'Oscar': 'Fish', 'Platy': 'Fish',
    // Invertebrate
    'Bumble Bee': 'Invertebrate', 'Cubaris Isopod': 'Invertebrate', 'Curlyhair Tarantula': 'Invertebrate',
    'Giant African Millipede': 'Invertebrate', 'Giant Yellow Spotted Isopod': 'Invertebrate',
    'Gooty Sapphire Ornamental Tarantula': 'Invertebrate', 'Hermit Crab': 'Invertebrate',
    'Hissing Cockroach': 'Invertebrate', 'Honey Bee': 'Invertebrate', 'Jumping Spider': 'Invertebrate',
    'Land Snail': 'Invertebrate', 'Pill Millipede': 'Invertebrate', 'Plum Isopod': 'Invertebrate',
    'Praying Mantis': 'Invertebrate', 'Roly-Poly Isopod': 'Invertebrate', 'Scorpion': 'Invertebrate',
    'Smooth Isopod': 'Invertebrate', 'Stick Insect': 'Invertebrate', 'Tarantula': 'Invertebrate',
    // Invertebrate - casing aliases seen in live data (DB entries don't exactly match the catalogued names)
    'Plum isopod': 'Invertebrate', 'Roly-Poly isopod': 'Invertebrate', 'Pill millipede': 'Invertebrate',
    // Mammal
    'African Pygmy Dormouse': 'Mammal', 'African Pygmy Mouse': 'Mammal', 'Campbells Dwarf Hamster': 'Mammal',
    'Cat': 'Mammal', 'Chinchilla': 'Mammal', 'Chinese Dwarf Hamster': 'Mammal', 'Deer Mouse': 'Mammal',
    'Degu': 'Mammal', 'Dog': 'Mammal', 'Fancy Mouse': 'Mammal', 'Mouse': 'Mammal', 'Fancy Rat': 'Mammal',
    'Rat': 'Mammal', 'Fat-tailed Gerbil': 'Mammal', 'Ferret': 'Mammal', 'Gerbil': 'Mammal',
    'Guinea Pig': 'Mammal', 'Hedgehog': 'Mammal', 'Natal Rats': 'Mammal', 'Prairie Dog': 'Mammal',
    'Rabbit': 'Mammal', 'Roborovski Dwarf Hamster': 'Mammal', 'Russian Dwarf Hamster': 'Mammal',
    'Sugar Glider': 'Mammal', 'Syrian Hamster': 'Mammal', 'Hamster': 'Mammal',
    // Mammal - casing alias seen in live data
    'Deer mouse': 'Mammal',
    // Reptile
    '3 Lined Knobtail Gecko': 'Reptile', 'Ball Python': 'Reptile', 'Banded Knobtails Gecko': 'Reptile',
    'Bearded Dragon': 'Reptile', 'Blue-Tongued Skink': 'Reptile', 'Cape African House Snake': 'Reptile',
    'Centralian Rough Knobtail Gecko': 'Reptile', 'Chameleon': 'Reptile', 'Corn Snake': 'Reptile',
    'Crested Gecko': 'Reptile', 'Eastern Kingsnake': 'Reptile', 'Gargoyle Gecko': 'Reptile',
    'Giant Day Gecko': 'Reptile', 'Leopard Gecko': 'Reptile', 'Pilbara Knobtail Gecko': 'Reptile',
    'Red-Eared Slider': 'Reptile', 'Russian Tortoise': 'Reptile', 'Thicktail Gecko': 'Reptile',
    // Other
    'Other': 'Other',
};

export const getSpeciesCategory = (speciesName) => SPECIES_CATEGORY_MAP[speciesName] || 'Other';

const EGG_LAYING = ['Bird', 'Reptile', 'Amphibian', 'Fish', 'Invertebrate'];
const forCategories = (categories, label) => Object.fromEntries(categories.map(c => [c, label]));

// Fields hidden per species category - merges anatomically-impossible fields
// (IMPOSSIBLE_FIELDS_BY_SPECIES.md) with not-meaningfully-used fields (HIDE_FIELDS_BY_SPECIES.md).
export const HIDDEN_FIELDS_BY_CATEGORY = {
    Amphibian: [
        'earset', 'heightAtWithers', 'eartagNumber', 'heatStatus', 'lastHeatDate', 'estrusCycleLength',
        'isNursing', 'nursingStartDate', 'weaningDate', 'heartwormStatus', 'hipElbowScores', 'eyeClearance',
        'cardiacClearance', 'reproductiveClearances', 'sheddingLevel', 'brushingFrequency', 'coatCareNotes',
        'brushingSchedule', 'freeFlightTrained', 'flightRiskTrainingSchedule', 'leashTrained', 'leashTrainingSchedule',
        'crateTrained', 'crateTrainingSchedule', 'litterTrained', 'litterTrainingSchedule', 'nailColor', 'strain',
        'pedigreeRegistrationId', 'tattooId', 'exerciseRequirements', 'dailyExerciseMinutes', 'trainingLevel',
        'trainingDisciplines', 'certifications', 'workingRole', 'workingRoleTrainingSchedule',
        'behavioralIssueTrainingSchedule', 'reactivityTrainingSchedule', 'exerciseSchedule', 'attachmentStyle',
        'bondingBehavior',
    ],
    Bird: [
        'earset', 'heightAtWithers', 'eartagNumber', 'heatStatus', 'lastHeatDate', 'estrusCycleLength',
        'isNursing', 'nursingStartDate', 'weaningDate', 'heartwormStatus', 'hipElbowScores', 'eyeClearance',
        'cardiacClearance', 'reproductiveClearances', 'dentalRecords', 'dentalCareRequirements', 'dentalCareSchedule',
        'sheddingRecords', 'waterParameterChecks', 'brushingFrequency', 'coatCareNotes', 'brushingSchedule', 'strain', 'tattooId',
    ],
    Fish: [
        'earset', 'heightAtWithers', 'eartagNumber', 'ringId', 'nailColor', 'heatStatus', 'lastHeatDate',
        'estrusCycleLength', 'isNursing', 'nursingStartDate', 'weaningDate', 'isNeutered', 'spayNeuterDate',
        'heartwormStatus', 'hipElbowScores', 'eyeClearance', 'cardiacClearance', 'reproductiveClearances',
        'sheddingRecords', 'moltingRecords', 'sheddingLevel', 'brushingFrequency', 'coatCareNotes', 'brushingSchedule',
        'freeFlightTrained', 'flightRiskTrainingSchedule', 'leashTrained', 'leashTrainingSchedule', 'crateTrained',
        'crateTrainingSchedule', 'litterTrained', 'litterTrainingSchedule', 'breed', 'bodyConditionScore',
        'pedigreeRegistrationId', 'tattooId', 'studFeeCurrency', 'studFeeAmount', 'exerciseRequirements',
        'dailyExerciseMinutes', 'trainingLevel', 'trainingDisciplines', 'certifications', 'workingRole',
        'workingRoleTrainingSchedule', 'behavioralIssueTrainingSchedule', 'reactivityTrainingSchedule',
        'exerciseSchedule', 'attachmentStyle', 'bondingBehavior',
    ],
    Invertebrate: [
        'earset', 'nailColor', 'heightAtWithers', 'eartagNumber', 'microchipNumber', 'heatStatus', 'lastHeatDate',
        'estrusCycleLength', 'isNursing', 'nursingStartDate', 'weaningDate', 'isNeutered', 'spayNeuterDate',
        'artificialInseminationUsed', 'dewormingRecords', 'allergies', 'heartwormStatus', 'hipElbowScores',
        'eyeClearance', 'cardiacClearance', 'reproductiveClearances', 'dentalRecords', 'dentalCareRequirements', 'dentalCareSchedule',
        'sheddingRecords', 'waterParameterChecks', 'vaccinations', 'sheddingLevel', 'brushingFrequency',
        'coatCareNotes', 'brushingSchedule', 'leashTrained', 'leashTrainingSchedule', 'crateTrained',
        'crateTrainingSchedule', 'litterTrained', 'litterTrainingSchedule', 'bodyConditionScore',
        'pedigreeRegistrationId', 'tattooId', 'studFeeCurrency', 'studFeeAmount', 'exerciseRequirements',
        'dailyExerciseMinutes', 'trainingLevel', 'trainingDisciplines', 'certifications', 'workingRole',
        'workingRoleTrainingSchedule', 'behavioralIssueTrainingSchedule', 'reactivityTrainingSchedule',
        'exerciseSchedule', 'attachmentStyle', 'bondingBehavior',
    ],
    Mammal: [
        'sheddingRecords', 'moltingRecords', 'waterParameterChecks', 'freeFlightTrained',
        'flightRiskTrainingSchedule',
    ],
    Reptile: [
        'earset', 'heightAtWithers', 'eartagNumber', 'heatStatus', 'lastHeatDate', 'estrusCycleLength',
        'isNursing', 'nursingStartDate', 'weaningDate', 'heartwormStatus', 'hipElbowScores', 'eyeClearance',
        'cardiacClearance', 'reproductiveClearances', 'sheddingLevel', 'brushingFrequency', 'coatCareNotes',
        'brushingSchedule', 'freeFlightTrained', 'flightRiskTrainingSchedule', 'crateTrained',
        'crateTrainingSchedule', 'litterTrained', 'litterTrainingSchedule', 'strain', 'tattooId',
        'exerciseRequirements', 'dailyExerciseMinutes', 'trainingLevel', 'trainingDisciplines', 'certifications',
        'workingRole', 'workingRoleTrainingSchedule', 'behavioralIssueTrainingSchedule', 'reactivityTrainingSchedule',
        'exerciseSchedule',
    ],
    Other: [],
};

// categoryOverride lets callers with access to the real Species collection record
// (which may differ from our static map for custom/user-added species) take priority.
export const isFieldHiddenForSpecies = (fieldName, speciesName, categoryOverride) => {
    const category = categoryOverride || getSpeciesCategory(speciesName);
    return (HIDDEN_FIELDS_BY_CATEGORY[category] || []).includes(fieldName);
};

// Species-specific label overrides take priority over category-wide overrides
// (e.g. colonyId -> "Hive ID" only for actual bees, not every Invertebrate).
const SPECIES_LABEL_OVERRIDES = {
    colonyId: { 'Honey Bee': 'Hive ID', 'Bumble Bee': 'Hive ID' },
};

// Field label overrides by category - same underlying data slot, different display label.
export const FIELD_LABEL_OVERRIDES = {
    coat: { Reptile: 'Scalation', Bird: 'Plumage', Amphibian: 'Skin', Fish: 'Skin', Invertebrate: 'Coloring' },
    coatPattern: { Reptile: 'Scale Pattern', Bird: 'Plumage Pattern', Amphibian: 'Skin Pattern', Fish: 'Skin Pattern', Invertebrate: 'Skin Pattern' },
    breed: { Amphibian: 'Subspecies', Invertebrate: 'Subspecies', Reptile: 'Subspecies' },
    chestGirth: { Fish: 'Body Girth', Invertebrate: 'Body Girth' },
    colonyId: { Invertebrate: 'Colony ID' },
    expectedDueDate: forCategories(EGG_LAYING, 'Expected Hatch Date'),
    litterCount: forCategories(EGG_LAYING, 'Clutch/Brood Count'),
    litterSizeBorn: forCategories(EGG_LAYING, 'Clutch Size (Hatched)'),
    litterSizeWeaned: forCategories(EGG_LAYING, 'Clutch Size (Fledged/Independent)'),
    litterId: forCategories(EGG_LAYING, 'Clutch ID'),
    stillbornCount: forCategories(EGG_LAYING, 'Unhatched/Non-Viable Egg Count'),
    gestationLength: forCategories(EGG_LAYING, 'Incubation Period'),
    deliveryMethod: forCategories(EGG_LAYING, 'Laying Method'),
    isPregnant: forCategories(EGG_LAYING, 'Gravid'),
    lastPregnancyDate: forCategories(EGG_LAYING, 'Last Gravid Date'),
    bedding: { Reptile: 'Substrate', Amphibian: 'Substrate', Fish: 'Substrate', Invertebrate: 'Substrate' },
    beakHoofScaleMaintenance: { Bird: 'Beak Maintenance', Reptile: 'Scale Maintenance' },
    skinEarCareNeeds: { Amphibian: 'Skin Care', Fish: 'Skin Care', Invertebrate: 'Skin Care', Reptile: 'Skin Care' },
    groomingNeeds: { Bird: 'Preening Needs' },
    groomingNotes: { Bird: 'Preening Notes' },
    bathingFrequency: { Reptile: 'Soaking Frequency' },
};

export const getFieldLabel = (fieldName, speciesName, defaultLabel, categoryOverride) => {
    const speciesOverride = SPECIES_LABEL_OVERRIDES[fieldName]?.[speciesName];
    if (speciesOverride) return speciesOverride;
    const category = categoryOverride || getSpeciesCategory(speciesName);
    return FIELD_LABEL_OVERRIDES[fieldName]?.[category] || defaultLabel;
};
