// Lite view of an animal.
//
// Identical to AnimalModalV2 apart from the tab set: Lite keeps only Dashboard, Gallery and
// Pedigree, plus a Records tab that folds Identification Numbers, Appearance and the
// quick-capture record types into one page (see LiteRecordsTabContent).
//
// If you want Lite to diverge further, edit here rather than in AnimalModalV2 — the Full
// modal stays the reference implementation. See utils/liteMode.js.
import React from 'react';
import AnimalModalV2 from './AnimalModalV2';

const LITE_TABS = ['dashboard', 'gallery', 'pedigree', 'records'];

const LiteAnimalModal = (props) => <AnimalModalV2 {...props} tabs={LITE_TABS} />;

export default LiteAnimalModal;
