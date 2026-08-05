// Maps an activity action code to a human-readable label
export const getActionLabel = (action) => {
    const labels = {
        login: 'Logged in',
        logout: 'Logged out',
        password_change: 'Changed password',
        profile_update: 'Updated profile',
        profile_image_change: 'Changed profile photo',
        privacy_settings_change: 'Updated privacy settings',
        animal_create: 'Added a new animal',
        animal_update: 'Updated animal',
        animal_delete: 'Deleted animal',
        animal_image_upload: 'Uploaded animal photo',
        animal_image_delete: 'Deleted animal photo',
        animal_visibility_change: 'Changed animal visibility',
        animal_transfer_initiate: 'Initiated animal transfer',
        animal_transfer_accept: 'Accepted animal transfer',
        animal_transfer_reject: 'Rejected animal transfer',
        litter_create: 'Recorded a new litter',
        litter_update: 'Updated litter',
        litter_delete: 'Deleted litter',
        message_send: 'Sent a message',
        message_delete: 'Deleted a message',
        report_submit: 'Submitted a report',
        transaction_create: 'Added a budget transaction',
        transaction_delete: 'Deleted a budget transaction',
        // Enclosure / Management panel actions
        enclosure_create: 'Created an enclosure',
        enclosure_update: 'Updated enclosure',
        enclosure_delete: 'Deleted an enclosure',
        enclosure_assign: 'Assigned animal to enclosure',
        enclosure_unassign: 'Unassigned animal from enclosure',
        enclosure_task_done: 'Completed enclosure task',
        care_task_done: 'Completed a care task',
        animal_fed: 'Fed an animal',
        reproduction_update: 'Updated reproduction status',
    };
    return labels[action] || action?.replace(/_/g, ' ') || 'Unknown action';
};

// Maps an activity action code to a Tailwind bg color class for indicator dots
export const getActionColor = (action) => {
    if (!action) return 'bg-gray-300';
    if (action.startsWith('animal_')) return 'bg-accent';
    if (action.startsWith('litter_')) return 'bg-purple-400';
    if (action.startsWith('transaction_')) return 'bg-emerald-400';
    if (action.startsWith('message_')) return 'bg-blue-400';
    if (action === 'login' || action === 'logout') return 'bg-gray-400';
    if (action.startsWith('profile_') || action.startsWith('privacy_')) return 'bg-yellow-400';
    if (action === 'report_submit') return 'bg-red-400';
    // Enclosure / Management panel actions
    if (action.startsWith('enclosure_')) return 'bg-cyan-400';
    if (action === 'enclosure_task_done' || action === 'care_task_done') return 'bg-teal-400';
    if (action === 'animal_fed') return 'bg-orange-400';
    if (action === 'reproduction_update') return 'bg-pink-400';
    return 'bg-gray-300';
};
