// Lite rebuild workspace.
//
// Renders the Full component verbatim so Lite is pixel-identical to the regular frontend
// right now. This file exists as the DIVERGENCE POINT: to make Lite behave differently,
// edit here — do not edit the Full component. The Full component stays the reference.
//
// See utils/liteMode.js for how the Lite/Full switch is decided.
import React from 'react';
import AnimalFormModalV2 from './AnimalFormModalV2';

const LiteAnimalFormModal = (props) => <AnimalFormModalV2 {...props} />;

export default LiteAnimalFormModal;
