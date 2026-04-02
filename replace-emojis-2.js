// replace-emojis-2.js — Replace all remaining emojis with Lucide icon JSX
const fs = require('fs');
let content = fs.readFileSync('src/app.jsx', 'utf8');
let count = 0;
let errors = 0;

function r(from, to, label) {
  if (!content.includes(from)) {
    console.error('❌ NOT FOUND: ' + (label || from.substring(0, 80).replace(/\n/g, '\\n')));
    errors++;
    return;
  }
  const n = content.split(from).length - 1;
  content = content.split(from).join(to);
  count++;
  console.log('✅ ' + n + 'x — ' + (label || from.substring(0, 60).replace(/\n/g, '\\n')));
}

// ============================================================
// 1. IMPORTS — add new lucide icons
// ============================================================
r(
  `, Dumbbell } from 'lucide-react';`,
  `, Dumbbell, Gem, Flame, Baby, PawPrint, ArrowRight, LockOpen, Camera, BarChart2 } from 'lucide-react';`,
  'Add Gem, Flame, Baby, PawPrint, ArrowRight, LockOpen, Camera, BarChart2'
);

// ============================================================
// 2. DONATION BADGE — icon property stored as JSX element
// ============================================================
r(`icon: '💎',`, `icon: <Gem size={16} />,`, 'Diamond badge icon');
r(`icon: '🔥',`, `icon: <Flame size={16} />,`, 'Fire badge icon');

// ============================================================
// 3. SELECT <option> tags — can't use Lucide, just remove emoji
// ============================================================
r(`>🏠 Owner<`, `>Owner<`, '<option> Owner');
r(`>🌙 Retired Breeder<`, `>Retired Breeder<`, '<option> Retired Breeder');
r(`>🍽️ No food selected 🍽️<`, `>No food selected<`, '<option> No food selected');
r(
  `No food items in supply 🍽️ add some in Supplies & Inventory`,
  `No food items in supply — add some in Supplies & Inventory`,
  '<option disabled> No food items'
);

// ============================================================
// 4. GLOBAL SEARCH heading
// ============================================================
r(
  `<h3 className="text-xl font-bold text-gray-800">Global Search 🔎</h3>`,
  `<h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">Global Search <Search size={18} className="flex-shrink-0" /></h3>`,
  'Global Search heading'
);

// ============================================================
// 5. STAR RATINGS
// ============================================================
// RatingStarRow — interactive / display star button
r(
  `>★</button>`,
  `><Star size={20} className="inline-block align-middle fill-current" /></button>`,
  'RatingStarRow star button'
);

// Distribution bar single star label
r(
  `<span className="text-amber-400 text-xs shrink-0">★</span>`,
  `<Star size={12} className="inline-block align-middle fill-current text-amber-400 flex-shrink-0" />`,
  'Distribution bar star'
);

// Big aggregate star row
r(
  `<span key={n} className={\`text-xl \${n <= Math.round(ratingData.average) ? 'text-amber-400' : 'text-gray-200'}\`}>★</span>`,
  `<Star key={n} size={20} className={\`inline-block align-middle \${n <= Math.round(ratingData.average) ? 'fill-current text-amber-400' : 'text-gray-200'}\`} />`,
  'Aggregate rating stars'
);

// Empty-state star
r(
  `<p className="text-3xl mb-2">☆</p>`,
  `<p className="mb-2 flex justify-center"><Star size={32} className="text-gray-200" /></p>`,
  'Empty-state star'
);

// Per-review star row
r(
  `<span key={n} className={\`text-sm \${n <= r.score ? 'text-amber-400' : 'text-gray-200'}\`}>★</span>`,
  `<Star key={n} size={14} className={\`inline-block align-middle \${n <= r.score ? 'fill-current text-amber-400' : 'text-gray-200'}\`} />`,
  'Per-review stars'
);

// Quick rating link — single star span
r(
  `<span>★</span>`,
  `<Star size={12} className="inline-block align-middle fill-current" />`,
  'Quick rating link star'
);

// My received ratings average
r(
  `{n <= Math.round(myReceivedRatings.average) ? '★' : '☆'}`,
  `{n <= Math.round(myReceivedRatings.average) ? <Star size={16} className="inline-block align-middle fill-current text-amber-400" /> : <Star size={16} className="inline-block align-middle text-gray-200" />}`,
  'My received ratings avg stars'
);

// Single yellow star in my profile
r(
  `<span className="text-yellow-400">★</span>`,
  `<Star size={14} className="inline-block align-middle fill-current text-yellow-400" />`,
  'My profile single star'
);

// User review list stars
r(
  `{n <= r.score ? '★' : '☆'}`,
  `{n <= r.score ? <Star size={14} className="inline-block align-middle fill-current text-amber-400" /> : <Star size={14} className="inline-block align-middle text-gray-200" />}`,
  'User review list stars'
);

// ============================================================
// 6. GENDER SYMBOLS
// ============================================================
r(
  `}>{isSire ? '♂' : '♀'}</div>`,
  `}>{isSire ? <Mars size={16} /> : <Venus size={16} />}</div>`,
  'Gender symbols (♂/♀)'
);

// ============================================================
// 7. PROFILE ID FOUNDER BADGES
// ============================================================
r(
  `<span className="mr-1">🔑</span>`,
  `<Key size={14} className="inline-block align-middle mr-1 text-amber-500" />`,
  'Key founder badge'
);
r(
  `<span className="mr-1">🌱</span>`,
  `<Sprout size={14} className="inline-block align-middle mr-1 text-green-500" />`,
  'Seedling early-member badge'
);

// ============================================================
// 8. OWNER VIEW / VIEW-ONLY labels
// ============================================================
r(
  `👁️ OWNER VIEW - All Data Visible`,
  `OWNER VIEW - All Data Visible`,
  'Owner view label (remove eye emoji, Eye icon already nearby)'
);
r(
  `🔒 VIEW-ONLY\n                            </span>`,
  `<Lock size={12} className="inline-block align-middle mr-1" /> VIEW-ONLY\n                            </span>`,
  'VIEW-ONLY label (mobile)'
);
r(
  `🔒 VIEW-ONLY - Read Only Access`,
  `VIEW-ONLY - Read Only Access`,
  'VIEW-ONLY - Read Only Access label'
);

// ============================================================
// 9. TAG / LABEL icon (🏷️) — multiple locations
// ============================================================
r(
  `<span className="text-lg">🏷️</span>`,
  `<Tag size={18} className="inline-block align-middle" />`,
  '🏷️ tag spans (all occurrences)'
);
// Available for Sale label
r(
  `🏷️ Available for Sale`,
  `<Tag size={14} className="inline-block align-middle mr-1" /> Available for Sale`,
  'Available for Sale tag'
);
// For Sale in available listing
r(
  `<><span>🏷️</span> For Sale</>`,
  `<><Tag size={14} className="inline-block align-middle mr-1" /> For Sale</>`,
  'For Sale pill'
);

// ============================================================
// 10. PEDIGREE / TREE
// ============================================================
r(
  `🌳 Pedigree: Sire and Dam`,
  `<TreeDeciduous size={14} className="inline-block align-middle mr-1" /> Pedigree: Sire and Dam`,
  'Pedigree: Sire and Dam'
);

// ============================================================
// 11. PLANNED / HOURGLASS badges
// ============================================================
r(
  `>⏳ Planned</span>`,
  `><Hourglass size={12} className="inline-block align-middle mr-0.5" /> Planned</span>`,
  '⏳ Planned badge (inline)'
);
r(
  `>⏳ Planned mating</span>`,
  `><Hourglass size={12} className="inline-block align-middle mr-0.5" /> Planned mating</span>`,
  '⏳ Planned mating badge'
);
r(
  `<span className="text-white text-xs">⏳</span>`,
  `<Hourglass size={12} className="inline-block align-middle text-white" />`,
  '⏳ hourglass white span'
);
// Uploading state
r(
  `{litterImageUploading ? '⏳ Uploading…' : '+ Add Photo'}`,
  `{litterImageUploading ? <><Loader2 size={14} className="inline-block align-middle animate-spin mr-1" />Uploading…</> : '+ Add Photo'}`,
  '⏳ uploading state'
);

// ============================================================
// 12. TRAINING CHECK MARKS (✓)
// ============================================================
r(
  `>✓ {getLabel('crateTrained', 'Crate Trained')}</span>}`,
  `><Check size={12} className="inline-block align-middle mr-0.5" /> {getLabel('crateTrained', 'Crate Trained')}</span>}`,
  '✓ Crate Trained'
);
r(
  `>✓ {getLabel('litterTrained', 'Litter Trained')}</span>}`,
  `><Check size={12} className="inline-block align-middle mr-0.5" /> {getLabel('litterTrained', 'Litter Trained')}</span>}`,
  '✓ Litter Trained'
);
r(
  `>✓ {getLabel('leashTrained', 'Leash Trained')}</span>}`,
  `><Check size={12} className="inline-block align-middle mr-0.5" /> {getLabel('leashTrained', 'Leash Trained')}</span>}`,
  '✓ Leash Trained'
);
r(
  `>✓ {getLabel('freeFlightTrained', 'Free Flight Trained')}</span>}`,
  `><Check size={12} className="inline-block align-middle mr-0.5" /> {getLabel('freeFlightTrained', 'Free Flight Trained')}</span>}`,
  '✓ Free Flight Trained'
);
// Rehomed check
r(
  `✓ Rehomed`,
  `<Check size={14} className="inline-block align-middle mr-0.5" /> Rehomed`,
  '✓ Rehomed'
);

// ============================================================
// 13. PHOTO / CAMERA (📷)
// ============================================================
// Large empty state camera div
r(
  `<div className="text-5xl mb-3">📷</div>`,
  `<Camera size={48} className="text-gray-300 mx-auto mb-3" />`,
  '📷 large camera empty state'
);
// Litter Photos heading
r(
  `<span>📷</span> Litter Photos`,
  `<Camera size={16} className="inline-block align-middle mr-1" /> Litter Photos`,
  '📷 Litter Photos heading'
);

// ============================================================
// 14. EDIT PENCIL (✏️)
// ============================================================
r(
  `<span className="text-base">✏️</span>`,
  `<Edit size={16} className="inline-block align-middle" />`,
  '✏️ edit pencil spans'
);

// ============================================================
// 15. CHECKMARK / DONE / FED (✅)
// ============================================================
r(
  `<span className="text-green-600 font-medium text-sm">✅ Fed</span>`,
  `<span className="text-green-600 font-medium text-sm flex items-center gap-0.5"><Check size={12} className="flex-shrink-0" /> Fed</span>`,
  '✅ Fed'
);
r(
  `<span className="text-green-600">✅ Completed: {c.newValue}</span>`,
  `<span className="text-green-600 flex items-center gap-0.5"><Check size={12} className="flex-shrink-0" /> Completed: {c.newValue}</span>`,
  '✅ Completed'
);
r(
  `className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200">✅ Done</button>`,
  `className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200 flex items-center gap-0.5"><Check size={10} className="flex-shrink-0" /> Done</button>`,
  '✅ Done button'
);
r(
  `{task.lastDoneDate ? <span>✅ Last: {formatDateShort(task.lastDoneDate)}</span> : <span className="text-orange-500">❌ Never done</span>}`,
  `{task.lastDoneDate ? <span className="flex items-center gap-0.5 text-green-600"><Check size={10} className="flex-shrink-0" /> Last: {formatDateShort(task.lastDoneDate)}</span> : <span className="text-orange-500 flex items-center gap-0.5"><X size={10} className="flex-shrink-0" /> Never done</span>}`,
  '✅/❌ task last done / never done'
);

// ============================================================
// 16. ARROW RIGHT (➡️)
// ============================================================
r(
  `➡️ <span className="text-green-600">{fmtVal(c.newValue)}</span>`,
  `<ArrowRight size={14} className="inline-block align-middle mr-0.5" /> <span className="text-green-600">{fmtVal(c.newValue)}</span>`,
  '➡️ arrow right value change'
);

// ============================================================
// 17. LOCK (🔒) — species locked
// ============================================================
r(
  `<span className="text-sm text-gray-400">🔒 Locked</span>`,
  `<span className="text-sm text-gray-400 flex items-center gap-1"><Lock size={14} /> Locked</span>`,
  '🔒 Locked species label'
);

// ============================================================
// 18. CLOSE X BUTTONS (✕)
// ============================================================
r(
  `>✕</button>`,
  `><X size={14} /></button>`,
  '✕ close buttons'
);

// ============================================================
// 19. BREEDING / BIRTH SECTION HEADERS (🧬 👶)
// ============================================================
r(
  `<span className="text-purple-600 mr-2">🧬</span>Breeding Information`,
  `<Dna size={18} className="inline-block align-middle text-purple-600 mr-2 flex-shrink-0" />Breeding Information`,
  '🧬 Breeding Information header'
);
r(
  `<span className="text-green-600 mr-2">👶</span>Birth & Offspring Details`,
  `<Baby size={18} className="inline-block align-middle text-green-600 mr-2 flex-shrink-0" />Birth & Offspring Details`,
  '👶 Birth & Offspring Details header'
);

// ============================================================
// 20. TOTAL BORN info (🔢)
// ============================================================
r(
  `🔢 <strong>Total Born auto-set`,
  `<Hash size={12} className="inline-block align-middle mr-0.5" /> <strong>Total Born auto-set`,
  '🔢 Total Born auto-set'
);

// ============================================================
// 21. GLOBE (🌍)
// ============================================================
r(
  `🌍 Species you add`,
  `<Globe size={12} className="inline-block align-middle mr-1" /> Species you add`,
  '🌍 Globe species note'
);

// ============================================================
// 22. WORK IN PROGRESS (🚧)
// ============================================================
r(
  `🚧 Work in Progress:`,
  `<Wrench size={12} className="inline-block align-middle mr-1" /> Work in Progress:`,
  '🚧 Work in Progress'
);

// ============================================================
// 23. EGG / FOR STUD (🥚)
// ============================================================
r(
  `🥚 Available for Stud`,
  `<Egg size={14} className="inline-block align-middle mr-1" /> Available for Stud`,
  '🥚 Available for Stud label'
);
r(
  `<><span>🥚</span> For Stud</>`,
  `<><Egg size={14} className="inline-block align-middle mr-1" /> For Stud</>`,
  '🥚 For Stud pill'
);

// ============================================================
// 24. LIFE STAGE (🌱)
// ============================================================
r(
  `🌱 Life Stage`,
  `<Sprout size={18} className="inline-block align-middle mr-2" /> Life Stage`,
  '🌱 Life Stage heading'
);

// ============================================================
// 25. DELETE BUTTONS (🗑️)
// ============================================================
r(
  `className="text-red-500 hover:text-red-700 p-1" title="Delete record">🗑️</button>`,
  `className="text-red-500 hover:text-red-700 p-1" title="Delete record"><Trash2 size={14} /></button>`,
  '🗑️ Delete record buttons'
);
r(
  `className="text-red-400 hover:text-red-600 font-bold leading-none">🗑️</button>`,
  `className="text-red-400 hover:text-red-600 p-0.5" title="Remove"><Trash2 size={14} /></button>`,
  '🗑️ Care task delete button'
);
r(
  `className="text-red-400 hover:text-red-600 font-bold text-sm leading-none">🗑️</button>`,
  `className="text-red-400 hover:text-red-600 p-0.5" title="Remove"><Trash2 size={14} /></button>`,
  '🗑️ Cleaning task delete button'
);

// ============================================================
// 26. EMAIL (📧)
// ============================================================
r(
  `📧 Check your email`,
  `<Mail size={14} className="inline-block align-middle mr-1" /> Check your email`,
  '📧 email instruction'
);

// ============================================================
// 27. REPEAT / FREQUENCY (🔄)
// ============================================================
r(
  `🔄 every {item.orderFrequency}`,
  `<RefreshCw size={12} className="inline-block align-middle mr-0.5" /> every {item.orderFrequency}`,
  '🔄 order frequency'
);
r(
  `🔄 Every {a.feedingFrequencyDays}d`,
  `<RefreshCw size={12} className="inline-block align-middle mr-0.5" /> Every {a.feedingFrequencyDays}d`,
  '🔄 feeding frequency'
);
r(
  `🔄 Every {task.frequencyDays}d`,
  `<RefreshCw size={12} className="inline-block align-middle mr-0.5" /> Every {task.frequencyDays}d`,
  '🔄 task frequency (both occurrences)'
);

// ============================================================
// 28. SPARKLES empty state (✨)
// ============================================================
r(
  `<div className="text-5xl mb-3">✨</div>`,
  `<Sparkles size={48} className="text-gray-300 mx-auto mb-3" />`,
  '✨ sparkles empty state'
);

// ============================================================
// 29. PREGNANCY / NURSING BUTTONS (🥜 🍼)
// ============================================================
r(
  `className="text-xs px-1.5 py-0.5 rounded bg-pink-100 text-pink-700 hover:bg-pink-200 border border-pink-200 whitespace-nowrap">🥜 Set as Pregnant</button>}`,
  `className="text-xs px-1.5 py-0.5 rounded bg-pink-100 text-pink-700 hover:bg-pink-200 border border-pink-200 whitespace-nowrap flex items-center gap-0.5"><Bean size={10} className="flex-shrink-0" /> Set as Pregnant</button>}`,
  '🥜 Set as Pregnant button'
);
r(
  `className="text-xs px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-200 whitespace-nowrap">🍼 Set as Nursing</button>}`,
  `className="text-xs px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-200 whitespace-nowrap flex items-center gap-0.5"><Milk size={10} className="flex-shrink-0" /> Set as Nursing</button>}`,
  '🍼 Set as Nursing button'
);

// ============================================================
// 30. REORDER ALERT (❗)
// ============================================================
r(
  `❗ {supplyReorderDue.length} to reorder`,
  `<AlertCircle size={12} className="inline-block align-middle mr-0.5" /> {supplyReorderDue.length} to reorder`,
  '❗ reorder alert'
);

// ============================================================
// 31. RELEASE (🔓)
// ============================================================
r(
  `🔓 Release`,
  `<LockOpen size={14} className="inline-block align-middle mr-1" /> Release`,
  '🔓 Release button'
);

// ============================================================
// 32. BROADCAST STYLE OBJECTS — emoji: 'ℹ️' fields
// ============================================================
// Change to empty string; render `{styles.emoji}` will output nothing
r(`emoji: 'ℹ️',`, `emoji: '',`, 'ℹ️ emoji in broadcast style objects');

// ============================================================
// 33. URGENT BROADCAST POPUP title (🚨 ⚠️)
// ============================================================
r(
  `{isAlert ? '🚨 URGENT ALERT' : '⚠️ Important Notice'}`,
  `{isAlert ? <><AlertCircle size={18} className="inline-block align-middle mr-1" /> URGENT ALERT</> : <><AlertTriangle size={18} className="inline-block align-middle mr-1" /> Important Notice</>}`,
  '🚨/⚠️ Urgent broadcast title'
);

// ============================================================
// 34. NOTIFICATION PANEL — moderation / litter / mating headers
// ============================================================
r(
  `<span className="mr-2">⚠️</span>\n                                                    <span>Moderation Notice</span>`,
  `<AlertTriangle size={16} className="mr-2 flex-shrink-0" />\n                                                    <span>Moderation Notice</span>`,
  '⚠️ Moderation Notice header'
);
r(
  `<span className="mr-2">🐣</span>\n                                                    <span>Litter Assignment`,
  `<Baby size={16} className="mr-2 flex-shrink-0" />\n                                                    <span>Litter Assignment`,
  '🐣 Litter Assignment header'
);
r(
  `<span className="mr-2">🐾</span>\n                                                    <span>Planned Mating`,
  `<PawPrint size={16} className="mr-2 flex-shrink-0" />\n                                                    <span>Planned Mating`,
  '🐾 Planned Mating header'
);
// Thumbnail fallback icons
r(
  `{notification.type === 'litter_assignment' ? <span className="text-3xl">🐣</span> : notification.type === 'mating_reminder' ? <span className="text-3xl">🐾</span> : <AlertCircle size={28} />}`,
  `{notification.type === 'litter_assignment' ? <Baby size={28} className="text-green-500" /> : notification.type === 'mating_reminder' ? <PawPrint size={28} className="text-indigo-500" /> : <AlertCircle size={28} />}`,
  '🐣/🐾 notification thumbnail fallback'
);

// ============================================================
// 35. SUSPENDED ACCOUNT warning (⚠️)
// ============================================================
r(
  `⚠️ You have reached 3 warnings`,
  `<AlertTriangle size={14} className="inline-block align-middle mr-1" /> You have reached 3 warnings`,
  '⚠️ account suspended warning'
);

// ============================================================
// 36. SUPPORT CRITTERTRACK (❤️)
// ============================================================
r(
  `❤️ Support CritterTrack`,
  `<Heart size={14} className="inline-block align-middle mr-1 text-red-400 fill-current" /> Support CritterTrack`,
  '❤️ Support CritterTrack'
);

// ============================================================
// 37. REPRODUCTIVE STATUS (🌿)
// ============================================================
r(
  `🌿 Reproductive Status`,
  `<Leaf size={16} className="inline-block align-middle mr-2 text-green-600" /> Reproductive Status`,
  '🌿 Reproductive Status heading'
);

// ============================================================
// 38. KEEPER label (🏠)
// ============================================================
r(
  `<span className="text-sm text-gray-600">🏠 Keeper</span>`,
  `<span className="text-sm text-gray-600 flex items-center gap-1"><Home size={14} /> Keeper</span>`,
  '🏠 Keeper label'
);

// ============================================================
// 39. SVG CHART LABELS (📏 📈) — inside SVG <text> cannot use Lucide
// ============================================================
r(
  `<text x={58} y={y} textAnchor="end" dy="0.3em" fontSize="11" fill="#999">📏</text>`,
  `<text x={58} y={y} textAnchor="end" dy="0.3em" fontSize="11" fill="#999">·</text>`,
  '📏 SVG y-axis label (remove emoji)'
);
r(
  `📈 No growth data recorded yet`,
  `No growth data recorded yet`,
  '📈 SVG empty growth chart text'
);

// ============================================================
// 40. BREEDING RECORDS header (📊)
// ============================================================
r(
  `<span className="text-purple-600 mr-2">📊</span>Breeding Records`,
  `<BarChart2 size={18} className="inline-block align-middle text-purple-600 mr-2 flex-shrink-0" />Breeding Records`,
  '📊 Breeding Records header'
);

// ============================================================
// 41. EXPAND ARROW (▶️)
// ============================================================
r(
  `<span className={\`text-lg transition-transform \${isExpanded ? 'rotate-90' : ''}\`}>▶️</span>`,
  `<ChevronRight size={18} className={\`inline-block align-middle transition-transform \${isExpanded ? 'rotate-90' : ''}\`} />`,
  '▶️ expand/collapse chevron'
);

// ============================================================
// 42. LEGAL / ADMINISTRATIVE heading (📋)
// ============================================================
r(
  `<h3 className="text-lg font-semibold text-gray-700">📋 Legal/Administrative</h3>`,
  `<h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2"><ClipboardList size={18} className="flex-shrink-0" /> Legal/Administrative</h3>`,
  '📋 Legal/Administrative heading'
);

// ============================================================
// 43. HOW TRANSFER WORKS (ℹ️)
// ============================================================
r(
  `<p className="font-semibold mb-1">ℹ️ How Transfer Works</p>`,
  `<p className="font-semibold mb-1 flex items-center gap-1"><Info size={14} className="flex-shrink-0" /> How Transfer Works</p>`,
  'ℹ️ How Transfer Works'
);

// ============================================================
// 44. REPORT BUTTON (⚠)
// ============================================================
r(
  `⚠ Report`,
  `Report`,
  '⚠ Report button (remove emoji, keep text)'
);

// ============================================================
// SUMMARY
// ============================================================
fs.writeFileSync('src/app.jsx', content, 'utf8');
console.log('\n' + (errors === 0 ? '🎉' : '⚠') + ' Done: ' + count + ' replaced, ' + errors + ' not found');
