export const getSpeciesDisplayName = (species) => {
    const displayNames = {
        'Fancy Mouse': 'Fancy Mice',
        'Mouse': 'Fancy Mice', // Backwards compatibility
        'Fancy Rat': 'Fancy Rats',
        'Rat': 'Fancy Rats', // Backwards compatibility
        'Russian Dwarf Hamster': 'Russian Dwarf Hamsters',
        'Campbells Dwarf Hamster': 'Campbells Dwarf Hamsters',
        'Chinese Dwarf Hamster': 'Chinese Dwarf Hamsters',
        'Syrian Hamster': 'Syrian Hamsters',
        'Hamster': 'Hamsters', // Backwards compatibility
        'Guinea Pig': 'Guinea Pigs'
    };
    return displayNames[species] || species;
};

// Map species to their latin names for display
export const getSpeciesLatinName = (species) => {
    const latinNames = {
        'Fancy Mouse': 'Mus musculus',
        'Mouse': 'Mus musculus',
        'Fancy Rat': 'Rattus norvegicus',
        'Rat': 'Rattus norvegicus',
        'Russian Dwarf Hamster': 'Phodopus sungorus',
        'Campbells Dwarf Hamster': 'Phodopus campbelli',
        'Chinese Dwarf Hamster': 'Cricetulus barabensis',
        'Syrian Hamster': 'Mesocricetus auratus',
        'Guinea Pig': 'Cavia porcellus'
    };
    return latinNames[species] || null;
};
