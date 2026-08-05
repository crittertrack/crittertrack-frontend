// Canonical Grooming/Special Care & Training schedule field defs ({ lastDoneDate, frequencyDays }
// shape) — single source shared by AnimalList's Feeding & Care tab UI and the global
// NotificationBar's overdue-schedule alert computation, so the two never drift apart.
export const GROOMING_SCHEDULE_DEFS = [
    { key: 'groomingSchedule', label: 'Grooming' },
    { key: 'brushingSchedule', label: 'Brushing' },
    { key: 'bathingSchedule', label: 'Bathing' },
    { key: 'nailCareSchedule', label: 'Nail/Claw/Hoof Care' },
    { key: 'beakHoofScaleSchedule', label: 'Beak/Hoof/Scale Maintenance' },
    { key: 'skinEarCareSchedule', label: 'Skin & Ear Care' },
    { key: 'dentalCareSchedule', label: 'Dental Care' },
    { key: 'specialCareSchedule', label: 'Special Care Needs' },
    { key: 'healthMonitoringSchedule', label: 'Special Observations' },
];
export const TRAINING_SCHEDULE_DEFS = [
    { key: 'exerciseSchedule', label: 'Daily Exercise' },
    { key: 'crateTrainingSchedule', label: 'Crate Training' },
    { key: 'litterTrainingSchedule', label: 'Litter Training' },
    { key: 'leashTrainingSchedule', label: 'Leash Training' },
    { key: 'freeFlightTrainingSchedule', label: 'Free-Flight Training' },
    { key: 'workingRoleTrainingSchedule', label: 'Working Role Training' },
    { key: 'behavioralIssueTrainingSchedule', label: 'Behavioral Issue Training' },
    { key: 'reactivityTrainingSchedule', label: 'Reactivity Training' },
    { key: 'flightRiskTrainingSchedule', label: 'Flight Risk Training' },
];
