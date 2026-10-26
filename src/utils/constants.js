export const GENDER_OPTIONS = ['Male', 'Female', 'Intersex', 'Mixed', 'Unknown'];
export const LIFESTAGE_OPTIONS = ['Newborn', 'Juvenile', 'Sub-adult', 'Adult', 'Senior', 'Mixed'];
export const STATUS_OPTIONS = ['Pet', 'Growout', 'Breeder', 'Available', 'Booked', 'Retired', 'Deceased', 'Culled', 'Rehomed', 'Unknown'];
// Statuses for animals that have died. 'Culled' behaves identically to 'Deceased'
// everywhere (memorial banner/corner badge, enclosure exclusion, alert suppression)
// it only exists so breeders can tell a deliberate cull from a natural death.
export const DEAD_STATUSES = ['Deceased', 'Culled'];
export const isDeadStatus = (status) => DEAD_STATUSES.includes(status);
export const DEFAULT_SPECIES_OPTIONS = ['Fancy Mouse', 'Fancy Rat', 'Russian Dwarf Hamster', 'Campbells Dwarf Hamster', 'Chinese Dwarf Hamster', 'Syrian Hamster', 'Guinea Pig'];
