// Manual Pedigree (free-text ancestors not linked to a registered CritterTrack animal) has been
// retired from the UI.
//
// Why: manual entries never fed COI/AVK or the parent cards — only sireId_public/damId_public
// do — so users kept hitting "why doesn't this show up everywhere?". Rather than keep answering
// that, the entry UI is off. Existing entries are still stored and still render, read-only, so
// nobody loses data; creating new ones now requires making a real CritterTrack animal instead.
//
// Flip this back to true to restore the entry UI. No migration is involved either way.
export const MANUAL_PEDIGREE_ENABLED = false;
