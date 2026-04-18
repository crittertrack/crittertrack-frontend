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
    return 'bg-gray-300';
};
