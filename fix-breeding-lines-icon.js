const fs = require('fs');
let c = fs.readFileSync('src/app.jsx', 'utf8');
c = c.split('<Network size={16} className="flex-shrink-0 text-gray-400" /> Breeding Lines')
     .join('<TableOfContents size={16} className="flex-shrink-0 text-gray-400" /> Breeding Lines');
fs.writeFileSync('src/app.jsx', c, 'utf8');
const remaining = (c.match(/Network.*Breeding Lines/g) || []).length;
const replaced = (c.match(/TableOfContents.*Breeding Lines/g) || []).length;
console.log('TableOfContents Breeding Lines:', replaced, '| Network Breeding Lines remaining:', remaining);
