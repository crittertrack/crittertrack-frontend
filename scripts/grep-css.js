// Quick grep helper for built Tailwind CSS classes.
// Usage: node scripts/grep-css.js "regex"
const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, '..', 'build', 'static', 'css');
const src = process.argv[2] || '.';
const re = new RegExp(src, 'g');
for (const f of fs.readdirSync(dir).filter(n => n.endsWith('.css'))) {
    const txt = fs.readFileSync(path.join(dir, f), 'utf8');
    let m;
    while ((m = re.exec(txt)) !== null) {
        const start = Math.max(0, m.index - 20);
        const end = Math.min(txt.length, m.index + m[0].length + 60);
        console.log(f, '=>', txt.slice(start, end).replace(/\s+/g, ' '));
    }
}

