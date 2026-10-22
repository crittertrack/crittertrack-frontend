const fs = require('fs');
const out = fs.readFileSync('testout.txt', 'utf8').replace(/\u001b\[[0-9;]*m/g, '');
const lines = out.split('\n');
const names = [
  'shows extra assignments even when more animals are assigned than requested',
  'waitlist card shows the per-gender split and fulfillment respects it',
  'the card shows the linked contact only when it differs from the attendee name',
];
for (const n of names) {
  const i = lines.findIndex(l => l.includes('\u25cf ' + n));
  if (i === -1) { console.log('NOT FOUND', n); continue; }
  console.log('\n########## ' + n);
  console.log(lines.slice(i, i + 40).join('\n'));
}
