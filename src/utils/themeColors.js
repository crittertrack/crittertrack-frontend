// Single source of truth for the app's colors — required by both tailwind.config.js
// (Node-side, at build time) and any component that needs a raw hex string in JS
// (chart libs, canvas, inline style objects). Prefer a Tailwind className over this
// when possible. Lives in src/ so CRA's bundler can resolve it (tailwind.config.js
// itself is outside src/, but Node has no such restriction when it requires this file).
module.exports = {
  // Light mode colors (existing)
  'page-bg': '#F1D1DC',
  'primary': '#9ED4E0',
  'primary-dark': '#7fd4e0', // A slightly darker shade for hover state
  'accent': '#D27096',

  // Dark mode colors
  'dark-bg': '#1B1A20',
  'dark-surface': '#66666b',
  'dark-surface-hover': '#2D2B34',
  'dark-border': '#35343D',
  'dark-primary': '#7eaab3',
  'dark-primary-hover': '#6f949d',
  'dark-accent': '#b46280',
  'dark-text': '#1B1A20',
  'dark-text-secondary': '#1B1A20',
  'dark-text-muted': '#90909B',

  // Consolidated stray colors (see colors.md) — one token per near-duplicate
  // shade family instead of dozens of hand-typed hex literals.
  'accent-purple': '#7c3aed', // was #7c3aed / #9333ea / #8b5cf6
  'accent-purple-dark': '#6a1b9a', // was #6a1b9a / #7b1fa2 / #9c27b0

  // Female pedigree/family-tree card background — kept separate from page-bg
  // (which is more saturated) since these need to stay a very pale wash.
  'pedigree-female-bg': '#fdeef6',
  // Male pedigree/family-tree card background — was #e8f1ff / #dbeafe.
  'pedigree-male-bg': '#e8f1ff',
  // Pale purple wash paired with accent-purple text/borders (litter cards, species badges).
  'accent-purple-bg': '#f3e8ff',

  // Blue family (status badges, buttons, links across admin/moderation panels).
  'info-indigo': '#6366f1', // was #6366f1 / #2563eb
  'info-blue': '#3b82f6', // was #3b82f6 / #007bff / #667eea
  'info-blue-dark': '#1976d2', // was #1976d2 / #1565c0 / #0056b3 / #0d47a1
};
