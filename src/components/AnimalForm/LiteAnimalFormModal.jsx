// Lite edit form.
//
// Mirrors the trimmed view modal (LiteAnimalModal): Dashboard, Gallery, Pedigree, and a
// Records tab. That Records tab IS the Full form's Health tab, relabelled — the vet visit,
// medication, vaccination, deworming, medical condition and allergy editors already live
// there, including the from-Supplies medication option, so Lite reuses that UI instead of
// duplicating it. Everything else (Routine Care, Behavior, Breeding, Timeline, the legal and
// paperwork sections) is not part of the Lite surface.
//
// Edit here, read in the view modal — the same split the Full frontend uses.
//
// If you want Lite's Records to diverge, edit this file rather than AnimalFormModalV2.
// See utils/liteMode.js.
import React from 'react';
import AnimalFormModalV2 from './AnimalFormModalV2';

const LITE_FORM_TABS = [
    'dashboard',
    'gallery',
    'pedigree',
    { id: 'health', label: 'Records' },
];

const LiteAnimalFormModal = (props) => <AnimalFormModalV2 {...props} tabs={LITE_FORM_TABS} />;

export default LiteAnimalFormModal;
