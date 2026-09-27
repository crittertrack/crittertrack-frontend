// Lite rebuild workspace.
//
// Renders the Full component verbatim so Lite is pixel-identical to the regular frontend
// right now. This file exists as the DIVERGENCE POINT: to make Lite behave differently,
// edit here — do not edit the Full component. The Full component stays the reference.
//
// See utils/liteMode.js for how the Lite/Full switch is decided.
import React from 'react';
import NotificationPanel from './NotificationPanel';

// The Full frontend has no notifications *page* — its bell opens this same panel as an
// overlay. Lite now does the identical thing, so the panel is mounted full-screen here and
// closing it returns to the app.
const LiteNotificationsPage = ({ navigate, onNotificationChange, ...rest }) => (
    <NotificationPanel
        {...rest}
        onClose={() => navigate('/')}
        onNotificationChange={onNotificationChange || (() => {})}
    />
);

export default LiteNotificationsPage;
