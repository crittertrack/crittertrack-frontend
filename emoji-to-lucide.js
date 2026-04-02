// Comprehensive emoji → Lucide icon replacement for app.jsx
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'app.jsx');
let content = fs.readFileSync(filePath, 'utf8');

const iSize = `size={16} className="inline-block align-middle mr-1 flex-shrink-0"`;
const iSm = `size={14} className="inline-block align-middle mr-1 flex-shrink-0"`;

// ── 1. ADD MISSING IMPORTS ──────────────────────────────────────────────────
content = content.replace(
  `Share2 } from 'lucide-react';`,
  `Share2, Hash, Dna, TreeDeciduous, Tag, Egg, Hospital, Brain, Trophy, Scale, FileCheck, Palette, Sprout, Ruler, FolderOpen, Leaf, Microscope, Pill, Stethoscope, UtensilsCrossed, Droplets, Thermometer, Feather, Medal, Target, Key, Dumbbell } from 'lucide-react';`
);

// ── 2. TAB ICON ARRAYS — replace emoji strings with component references ────
const tabIconMap = [
  [`icon: '📋'`, `icon: ClipboardList`],
  [`icon: '🔒'`, `icon: Lock`],
  [`icon: '🎨'`, `icon: Palette`],
  [`icon: '🏷️'`, `icon: Tag`],
  [`icon: '🌳'`, `icon: TreeDeciduous`],
  [`icon: '🥚'`, `icon: Egg`],
  [`icon: '🏥'`, `icon: Hospital`],
  [`icon: '🏠'`, `icon: Home`],
  [`icon: '🧠'`, `icon: Brain`],
  [`icon: '📝'`, `icon: FileText`],
  [`icon: '⚖️'`, `icon: Scale`],
  [`icon: '🏆'`, `icon: Trophy`],
  [`icon: '📄'`, `icon: FileCheck`],
  [`icon: '🖼️'`, `icon: Images`],
  [`icon: '📜'`, `icon: ScrollText`],
];
for (const [from, to] of tabIconMap) {
  content = content.split(from).join(to);
}

// ── 3. TAB BUTTON RENDERING — render component instead of string ────────────
content = content.split(`<span className="sm:mr-1">{tab.icon}</span>`).join(
  `{React.createElement(tab.icon, { size: 14, className: 'inline-block align-middle flex-shrink-0' })}`
);
// Must come before the simpler mr-1 replacement
content = content.split(`<span className="mr-1">{tab.icon}</span>`).join(
  `{React.createElement(tab.icon, { size: 14, className: 'inline-block align-middle flex-shrink-0 mr-1' })}`
);

// ── 4. NOTIFICATION HUB CONFIGS — emoji → component refs ───────────────────
content = content.replace(
  `mated:  { label: 'Mating',         bg: 'bg-purple-100 text-purple-700', border: 'border-purple-200', icon: '❤️' },
        due:    { label: 'Expected Birth', bg: 'bg-amber-100 text-amber-700',   border: 'border-amber-200',  icon: '🐣' },
        weaned: { label: 'Weaning',        bg: 'bg-sky-100 text-sky-700',       border: 'border-sky-200',    icon: '🍼' },`,
  `mated:  { label: 'Mating',         bg: 'bg-purple-100 text-purple-700', border: 'border-purple-200', icon: Heart },
        due:    { label: 'Expected Birth', bg: 'bg-amber-100 text-amber-700',   border: 'border-amber-200',  icon: Egg },
        weaned: { label: 'Weaning',        bg: 'bg-sky-100 text-sky-700',       border: 'border-sky-200',    icon: Milk },`
);
content = content.replace(
  `feeding:     { bg: 'bg-orange-100 text-orange-700', border: 'border-orange-200', icon: '🍽️' },
        care:        { bg: 'bg-purple-100 text-purple-700', border: 'border-purple-200', icon: '🧴' },
        maintenance: { bg: 'bg-yellow-100 text-yellow-800', border: 'border-yellow-200', icon: '🔧' },
        supplies:    { bg: 'bg-emerald-100 text-emerald-700', border: 'border-emerald-200', icon: '📦' },`,
  `feeding:     { bg: 'bg-orange-100 text-orange-700', border: 'border-orange-200', icon: UtensilsCrossed },
        care:        { bg: 'bg-purple-100 text-purple-700', border: 'border-purple-200', icon: Droplets },
        maintenance: { bg: 'bg-yellow-100 text-yellow-800', border: 'border-yellow-200', icon: Wrench },
        supplies:    { bg: 'bg-emerald-100 text-emerald-700', border: 'border-emerald-200', icon: Package },`
);
// fallback icon in mgmt render
content = content.split(`{ bg: 'bg-gray-100 text-gray-700', border: 'border-gray-200', icon: '⚠️' }`).join(
  `{ bg: 'bg-gray-100 text-gray-700', border: 'border-gray-200', icon: AlertTriangle }`
);

// ── 5. NOTIFICATION HUB PILL RENDERS — use React.createElement for icon ────
content = content.split(`{cfg.icon} {cfg.label}`).join(
  `{React.createElement(cfg.icon, { size: 10, className: 'inline-block align-middle mr-0.5' })} {cfg.label}`
);
content = content.split(`{cfg.icon} {item.label}`).join(
  `{React.createElement(cfg.icon, { size: 10, className: 'inline-block align-middle mr-0.5' })} {item.label}`
);

// ── 6. SECTION HEADERS — replace emoji with inline Lucide icons ─────────────
const headerMap = [
  // double-emoji headers first (must come before single-emoji matches)
  [`>🏷️🥚 Availability for Sale or Stud</h3>`, `><Tag ${iSize} /> Availability for Sale or Stud</h3>`],
  [`>🩹💊 Active Medical Records</h3>`, `><Pill ${iSize} /> Active Medical Records</h3>`],
  [`>🌓🏃 Activity</h3>`, `><Activity ${iSize} /> Activity</h3>`],
  [`>🌓🏃 Training &amp; Working</h3>`, `><Dumbbell ${iSize} /> Training &amp; Working</h3>`],
  [`>🌓🏃 Training & Working</h3>`, `><Dumbbell ${iSize} /> Training & Working</h3>`],
  // single-emoji headers
  [`>🔢 Identification Numbers</h3>`, `><Hash ${iSize} /> Identification Numbers</h3>`],
  [`>🧬 Genetic Code</h3>`, `><Dna ${iSize} /> Genetic Code</h3>`],
  [`>🧬 {getLabel('geneticCode', 'Genetic Code')}</h3>`, `><Dna ${iSize} /> {getLabel('geneticCode', 'Genetic Code')}</h3>`],
  [`>🧬 {getFieldLabel('geneticCode', 'Genetic Code')}</h3>`, `><Dna ${iSize} /> {getFieldLabel('geneticCode', 'Genetic Code')}</h3>`],
  [`>🌳 Parents</h3>`, `><TreeDeciduous ${iSize} /> Parents</h3>`],
  [`>🌳 Pedigree: Sire and Dam</h3>`, `><TreeDeciduous ${iSize} /> Pedigree: Sire and Dam</h3>`],
  [`>👥 Ownership</h3>`, `><Users ${iSize} /> Ownership</h3>`],
  [`>🏠 Keeper</h3>`, `><Home ${iSize} /> Keeper</h3>`],
  [`>🏠 Keeper History</h3>`, `><Home ${iSize} /> Keeper History</h3>`],
  [`>🏠 Animal Care</h3>`, `><Home ${iSize} /> Animal Care</h3>`],
  [`>✨ Appearance</h3>`, `><Sparkles ${iSize} /> Appearance</h3>`],
  [`>🌱 {getLabel('lifeStage', 'Life Stage')}</h3>`, `><Sprout ${iSize} /> {getLabel('lifeStage', 'Life Stage')}</h3>`],
  [`>🌱 {getFieldLabel('lifeStage', 'Life Stage')}</h3>`, `><Sprout ${iSize} /> {getFieldLabel('lifeStage', 'Life Stage')}</h3>`],
  [`>📏 Measurements &amp; Growth Tracking</h3>`, `><Ruler ${iSize} /> Measurements &amp; Growth Tracking</h3>`],
  [`>📏 Measurements & Growth Tracking</h3>`, `><Ruler ${iSize} /> Measurements & Growth Tracking</h3>`],
  [`>📏 Measurements</h3>`, `><Ruler ${iSize} /> Measurements</h3>`],
  [`>🗂️ Classification</h3>`, `><FolderOpen ${iSize} /> Classification</h3>`],
  [`>🌍 Origin</h3>`, `><Globe ${iSize} /> Origin</h3>`],
  [`>🏷️ Tags</h3>`, `><Tag ${iSize} /> Tags</h3>`],
  [`>🌿 Reproductive Status</h3>`, `><Leaf ${iSize} /> Reproductive Status</h3>`],
  [`>🔄 Estrus/Cycle</h3>`, `><RefreshCw ${iSize} /> Estrus/Cycle</h3>`],
  // ♂️ and ♀️ — match prefix (covers both plain </h3> and with child spans)
  [`>♂️ Sire Information`, `><Mars ${iSize} /> Sire Information`],
  [`>♀️ Dam Information`, `><Venus ${iSize} /> Dam Information`],
  [`>🛡️ Preventive Care</h3>`, `><Shield ${iSize} /> Preventive Care</h3>`],
  [`>🔬 Procedures &amp; Diagnostics</h3>`, `><Microscope ${iSize} /> Procedures &amp; Diagnostics</h3>`],
  [`>🔬 Procedures & Diagnostics</h3>`, `><Microscope ${iSize} /> Procedures & Diagnostics</h3>`],
  [`>🏥 Health Clearances &amp; Screening</h3>`, `><Hospital ${iSize} /> Health Clearances &amp; Screening</h3>`],
  [`>🏥 Health Clearances & Screening</h3>`, `><Hospital ${iSize} /> Health Clearances & Screening</h3>`],
  [`>🩺 Veterinary Care</h3>`, `><Stethoscope ${iSize} /> Veterinary Care</h3>`],
  [`>🍽️ Nutrition</h3>`, `><UtensilsCrossed ${iSize} /> Nutrition</h3>`],
  [`>🏡 Housing &amp; Enclosure</h3>`, `><Home ${iSize} /> Housing &amp; Enclosure</h3>`],
  [`>🏡 Housing & Enclosure</h3>`, `><Home ${iSize} /> Housing & Enclosure</h3>`],
  [`>🧴 Animal Care</h3>`, `><Droplets ${iSize} /> Animal Care</h3>`],
  [`>🌡️ Environment</h3>`, `><Thermometer ${iSize} /> Environment</h3>`],
  [`>✂️ Grooming</h3>`, `><Scissors ${iSize} /> Grooming</h3>`],
  [`>💭 Behavior</h3>`, `><MessageSquare ${iSize} /> Behavior</h3>`],
  [`>⚠️ Known Issues</h3>`, `><AlertTriangle ${iSize} /> Known Issues</h3>`],
  [`>📝 Remarks &amp; Notes</h3>`, `><FileText ${iSize} /> Remarks &amp; Notes</h3>`],
  [`>📝 Remarks & Notes</h3>`, `><FileText ${iSize} /> Remarks & Notes</h3>`],
  [`>🕊️ Information</h3>`, `><Feather ${iSize} /> Information</h3>`],
  [`>🥇 Show Titles &amp; Ratings</h3>`, `><Medal ${iSize} /> Show Titles &amp; Ratings</h3>`],
  [`>🥇 Show Titles & Ratings</h3>`, `><Medal ${iSize} /> Show Titles & Ratings</h3>`],
  [`>🎯 Working &amp; Performance</h3>`, `><Target ${iSize} /> Working &amp; Performance</h3>`],
  [`>🎯 Working & Performance</h3>`, `><Target ${iSize} /> Working & Performance</h3>`],
  [`>🔑 Licensing &amp; Permits</h3>`, `><Key ${iSize} /> Licensing &amp; Permits</h3>`],
  [`>🔑 Licensing & Permits</h3>`, `><Key ${iSize} /> Licensing & Permits</h3>`],
  [`>📋 Legal / Administrative</h3>`, `><ClipboardList ${iSize} /> Legal / Administrative</h3>`],
  [`>🚫 Restrictions</h3>`, `><Ban ${iSize} /> Restrictions</h3>`],
  [`>🖼️ Photo Gallery</h3>`, `><Images ${iSize} /> Photo Gallery</h3>`],
];

for (const [from, to] of headerMap) {
  content = content.split(from).join(to);
}

// ── 7. MOBILE PEDIGREE LABEL ────────────────────────────────────────────────
content = content.split(`>🌳 Pedigree</span>`).join(
  `><TreeDeciduous ${iSm} /> Pedigree</span>`
);

// ── 8. WARNING BANNER HEADING ───────────────────────────────────────────────
content = content.split(`>⚠️ Official Warning`).join(
  `><AlertTriangle ${iSize} /> Official Warning`
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Done! app.jsx transformed.');

// Verify a few key replacements
const verify = [
  `Hash, Dna, TreeDeciduous`,
  `icon: ClipboardList`,
  `icon: Hospital`,
  `React.createElement(tab.icon`,
  `React.createElement(cfg.icon`,
  `icon: Heart`,
  `icon: UtensilsCrossed`,
];
for (const v of verify) {
  console.log(v, content.includes(v) ? '✅' : '❌');
}
