const fs = require('fs');
const code = fs.readFileSync('src/app.jsx', 'utf8');
const lines = code.split('\n');

// Find all name="fieldName" in the form (tabs 1-13)
const formStart = lines.findIndex((l, i) => i > 9700 && l.includes('activeTab === 1'));
const formEnd = lines.findIndex((l, i) => i > 12200 && l.includes('activeTab === 13'));

const fieldNames = new Set();
for (let i = formStart; i < formEnd + 300; i++) {
    const line = lines[i];
    const nameMatch = line.match(/name=["']([a-zA-Z][a-zA-Z0-9_]*)["']/);
    if (nameMatch) fieldNames.add(nameMatch[1]);
}

// Find all isFieldHidden('X') calls in the whole file
const hiddenChecks = new Set();
for (const line of lines) {
    const m = line.match(/isFieldHidden\(["']([a-zA-Z][a-zA-Z0-9_]*)["']\)/);
    if (m) hiddenChecks.add(m[1]);
}

// Fields in form but without any isFieldHidden guard anywhere
const noGuard = [...fieldNames].filter(f => !hiddenChecks.has(f)).sort();
const hasGuard = [...fieldNames].filter(f => hiddenChecks.has(f)).sort();

console.log('=== FORM FIELDS WITHOUT isFieldHidden GUARD ===');
noGuard.forEach(f => console.log('  ' + f));
console.log('\nTotal unguarded:', noGuard.length);
console.log('\n=== FORM FIELDS WITH isFieldHidden GUARD ===');
hasGuard.forEach(f => console.log('  ' + f));
console.log('\nTotal guarded:', hasGuard.length);

// Also check which isFieldHidden calls reference fields not in FieldTemplateSchema
// (We can compare against the known schema fields from the check script)
