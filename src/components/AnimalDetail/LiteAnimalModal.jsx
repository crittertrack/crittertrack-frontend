// Lite view of an animal.
//
// Identical to AnimalModalV2 apart from the tab set and its order: Dashboard, Records,
// Gallery, Pedigree. The Records tab folds Identification Numbers, Appearance and the
// quick-capture record types into one page, read-only — editing lives in the edit form
// (see LiteAnimalFormModal).
//
// If you want Lite to diverge further, edit here rather than in AnimalModalV2 — the Full
// modal stays the reference implementation. See utils/liteMode.js.
import React from 'react';
import AnimalModalV2 from './AnimalModalV2';

// Order is passed straight through to AnimalModalV2, which honours the caller's order.
const LITE_TABS = ['dashboard', 'records', 'gallery', 'pedigree'];

const LiteAnimalModal = (props) => <AnimalModalV2 {...props} tabs={LITE_TABS} />;

export default LiteAnimalModal;
