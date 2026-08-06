// Single source of truth for colors that need a raw hex string in JS (chart libs,
// canvas, inline style objects) — pulls from tailwind.config.js so JS and Tailwind
// classes never drift apart. Prefer a Tailwind className over this when possible.
const { theme } = require('../../tailwind.config.js');

module.exports = theme.extend.colors;
