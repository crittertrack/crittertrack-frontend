const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, 'src', 'app.jsx');
let c = fs.readFileSync(filePath, 'utf8');

// ── 1. Add color to every tab entry (global replace — safe since these strings are unique) ──
const colorMap = [
  [`{ id: 1, label: 'Overview', icon: ClipboardList }`, `{ id: 1, label: 'Overview', icon: ClipboardList, color: 'text-blue-500' }`],
  [`{ id: 2, label: 'Status & Privacy', icon: Lock }`, `{ id: 2, label: 'Status & Privacy', icon: Lock, color: 'text-slate-500' }`],
  [`{ id: 2, label: 'Status', icon: Lock }`, `{ id: 2, label: 'Status', icon: Lock, color: 'text-slate-500' }`],
  [`{ id: 3, label: 'Physical', icon: Palette }`, `{ id: 3, label: 'Physical', icon: Palette, color: 'text-pink-500' }`],
  [`{ id: 4, label: 'Identification', icon: Tag }`, `{ id: 4, label: 'Identification', icon: Tag, color: 'text-amber-500' }`],
  [`{ id: 5, label: 'Lineage', icon: TreeDeciduous }`, `{ id: 5, label: 'Lineage', icon: TreeDeciduous, color: 'text-green-600' }`],
  [`{ id: 6, label: 'Breeding', icon: Egg }`, `{ id: 6, label: 'Breeding', icon: Egg, color: 'text-yellow-500' }`],
  [`{ id: 7, label: 'Health', icon: Hospital }`, `{ id: 7, label: 'Health', icon: Hospital, color: 'text-red-500' }`],
  [`{ id: 8, label: 'Animal Care', icon: Home }`, `{ id: 8, label: 'Animal Care', icon: Home, color: 'text-teal-500' }`],
  [`{ id: 9, label: 'Behavior', icon: Brain }`, `{ id: 9, label: 'Behavior', icon: Brain, color: 'text-purple-500' }`],
  [`{ id: 10, label: 'Records', icon: FileText }`, `{ id: 10, label: 'Records', icon: FileText, color: 'text-indigo-500' }`],
  [`{ id: 11, label: 'End of Life', icon: Scale }`, `{ id: 11, label: 'End of Life', icon: Scale, color: 'text-gray-500' }`],
  // Show has id 11 in one tab bar, id 12 in others
  [`{ id: 11, label: 'Show', icon: Trophy }`, `{ id: 11, label: 'Show', icon: Trophy, color: 'text-yellow-600' }`],
  [`{ id: 12, label: 'Show', icon: Trophy }`, `{ id: 12, label: 'Show', icon: Trophy, color: 'text-yellow-600' }`],
  [`{ id: 13, label: 'Legal', icon: FileCheck }`, `{ id: 13, label: 'Legal', icon: FileCheck, color: 'text-blue-600' }`],
  [`{ id: 14, label: 'Gallery', icon: Images }`, `{ id: 14, label: 'Gallery', icon: Images, color: 'text-rose-500' }`],
  [`{ id: 14, label: 'Logs', icon: ScrollText }`, `{ id: 14, label: 'Logs', icon: ScrollText, color: 'text-gray-600' }`],
  [`{ id: 15, label: 'Logs', icon: ScrollText }`, `{ id: 15, label: 'Logs', icon: ScrollText, color: 'text-gray-600' }`],
];
for (const [from, to] of colorMap) {
  c = c.split(from).join(to);
}

// ── 2. Update createElement calls to use tab.color + mr-1.5 spacing ──
c = c.split(`React.createElement(tab.icon, { size: 14, className: 'inline-block align-middle flex-shrink-0' })`).join(
  `React.createElement(tab.icon, { size: 14, className: \`inline-block align-middle flex-shrink-0 mr-1.5 \${tab.color || ''}\` })`
);
c = c.split(`React.createElement(tab.icon, { size: 14, className: 'inline-block align-middle flex-shrink-0 mr-1' })`).join(
  `React.createElement(tab.icon, { size: 14, className: \`inline-block align-middle flex-shrink-0 mr-1.5 \${tab.color || ''}\` })`
);

fs.writeFileSync(filePath, c, 'utf8');
console.log('Done!');

const checks = [
  `color: 'text-blue-500'`,
  `color: 'text-red-500'`,
  `color: 'text-green-600'`,
  `color: 'text-purple-500'`,
  `color: 'text-yellow-600'`,
  `mr-1.5 \${tab.color`,
];
checks.forEach(v => console.log(c.includes(v) ? '✅' : '❌', v));
