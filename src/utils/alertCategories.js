// Single source of truth for the optional per-user alert categories — shown as checkboxes in the
// Dashboard's Alerts dropdown (AnimalList/index.jsx) and used to gate what the global
// NotificationBar computes/displays, so the two never drift apart.
export const ALERT_CATEGORIES = {
    feeding: 'Feeding Due',
    grooming: 'Grooming / Special Care',
    training: 'Training Schedules',
    reproduction: 'Reproduction',
    health: 'Medical / Quarantine',
    maintenance: 'Enclosure Maintenance',
    supplies: 'Supply Restocking',
    birthdays: 'Birthdays',
};
