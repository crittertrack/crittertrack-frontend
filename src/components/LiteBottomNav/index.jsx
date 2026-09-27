// Lite rebuild workspace.
//
// Renders nothing on purpose. The Full frontend has no bottom navigation bar, so rendering
// one here is exactly the kind of divergence this file exists to reintroduce later. Keep it
// mounted at the Lite render site (app.jsx) and fill it in as the Lite rebuild progresses.
import React from 'react';

const LiteBottomNav = () => null;

export default LiteBottomNav;
