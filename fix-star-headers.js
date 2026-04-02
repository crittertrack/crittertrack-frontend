const fs = require('fs');
let content = fs.readFileSync('src/app.jsx', 'utf8');
let count = 0;

// Replace ⭐ Breeder headings (with border-b)
content = content.replace(
  /className="text-lg font-semibold text-gray-700 border-b pb-2 mb-3">\u2B50 Breeder<\/h3>/g,
  'className="text-lg font-semibold text-gray-700 border-b pb-2 mb-3 flex items-center gap-1.5"><Star size={16} className="flex-shrink-0 text-gray-400" /> Breeder</h3>'
);
// count not needed, verified below

// Replace &#x1F4A0; Breeding Lines headings
content = content.replace(
  /className="text-lg font-semibold text-gray-700">&#x1F4A0; Breeding Lines<\/h3>/g,
  'className="text-lg font-semibold text-gray-700 flex items-center gap-1.5"><Network size={16} className="flex-shrink-0 text-gray-400" /> Breeding Lines</h3>'
);

// Verify
const remaining = (content.match(/\u2B50 Breeder<\/h3>|&#x1F4A0; Breeding Lines<\/h3>/g) || []).length;
fs.writeFileSync('src/app.jsx', content, 'utf8');
console.log(remaining === 0 ? 'All clear!' : 'Still ' + remaining + ' remaining');
