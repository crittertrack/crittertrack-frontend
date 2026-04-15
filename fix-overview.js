const fs = require('fs');
const file = 'c:\\Projects\\crittertrack-frontend\\src\\app.jsx';
const content = fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');

// ─── Change 1: Add genetic code after carrier traits in all 3 instances ───────
// Pattern: the carrier traits closing  `)}` immediately followed by a remarks or breeder block
// We find each instance by looking for the carrier closing and inserting after it.

const geneticInsert = 
`                                        {animal.geneticCode && (
                                            <p className="text-sm text-gray-700"><span className="font-semibold">Genetic Code:</span> <code className="bg-gray-100 px-1 rounded font-mono">{animal.geneticCode}</code></p>
                                        )}`;

// All 3 share this exact carrier closing signature:
const carrierClose = `                                        {animal.carrierTraits && (
                                            <p className="text-sm text-gray-700"><span className="font-semibold">Carrier:</span> {animal.carrierTraits}</p>
                                        )}`;

// Count occurrences
const count1 = (content.match(new RegExp(carrierClose.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
console.log('carrierTraits block occurrences:', count1);

// Replace all 3 occurrences by inserting genetic code after each
let result = content.split(carrierClose).join(carrierClose + '\n' + geneticInsert);

// ─── Change 2 & 3: Restructure the breeder/IDs grid for instances 1 & 2 ──────
// They share the same exact block (RouterLink breeder):
const oldGrid12 = `                                        {/* Breeder + IDs inline */}
                                        <div className="border-t border-gray-200 pt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                                            <div>
                                                <span className="text-gray-500">Breeder:</span>{' '}
                                                {breederInfo ? (() => {
                                                    const showPersonal = breederInfo.showPersonalName ?? false;
                                                    const showBreeder = breederInfo.showBreederName ?? false;
                                                    let bDisplayName;
                                                    if (showPersonal && showBreeder && breederInfo.personalName && breederInfo.breederName) {
                                                        bDisplayName = \`\${breederInfo.personalName} (\${breederInfo.breederName})\`;
                                                    } else if (showBreeder && breederInfo.breederName) {
                                                        bDisplayName = breederInfo.breederName;
                                                    } else if (showPersonal && breederInfo.personalName) {
                                                        bDisplayName = breederInfo.personalName;
                                                    } else {
                                                        bDisplayName = 'Unknown Breeder';
                                                    }
                                                    return <RouterLink to={\`/user/\${breederInfo.id_public}\`} className="text-blue-600 hover:underline font-semibold">{bDisplayName}</RouterLink>;
                                                })() : <span className="font-mono text-accent">{animal.manualBreederName || animal.breederId_public || '\u2014'}</span>}
                                            </div>
                                            <div><span className="text-gray-500">CTC ID:</span> <strong>{animal.id_public}</strong></div>
                                            {animal.breederAssignedId && <div><span className="text-gray-500">ID:</span> <strong>{animal.breederAssignedId}</strong></div>}
                                            {animal.microchipNumber && <div><span className="text-gray-500">Microchip:</span> <strong>{animal.microchipNumber}</strong></div>}
                                            {animal.pedigreeRegistrationId && <div><span className="text-gray-500">Pedigree Reg:</span> <strong>{animal.pedigreeRegistrationId}</strong></div>}
                                        </div>`;

const newGrid12 = `                                        {/* Breeder + IDs */}
                                        <div className="border-t border-gray-200 pt-2 space-y-2 text-sm">
                                            <div>
                                                <span className="text-gray-500">Breeder:</span>{' '}
                                                {breederInfo ? (() => {
                                                    const showPersonal = breederInfo.showPersonalName ?? false;
                                                    const showBreeder = breederInfo.showBreederName ?? false;
                                                    let bDisplayName;
                                                    if (showPersonal && showBreeder && breederInfo.personalName && breederInfo.breederName) {
                                                        bDisplayName = \`\${breederInfo.personalName} (\${breederInfo.breederName})\`;
                                                    } else if (showBreeder && breederInfo.breederName) {
                                                        bDisplayName = breederInfo.breederName;
                                                    } else if (showPersonal && breederInfo.personalName) {
                                                        bDisplayName = breederInfo.personalName;
                                                    } else {
                                                        bDisplayName = 'Unknown Breeder';
                                                    }
                                                    return <RouterLink to={\`/user/\${breederInfo.id_public}\`} className="text-blue-600 hover:underline font-semibold">{bDisplayName}</RouterLink>;
                                                })() : <span className="font-mono text-accent">{animal.manualBreederName || animal.breederId_public || '\u2014'}</span>}
                                            </div>
                                            {(animal.breederAssignedId || animal.microchipNumber || animal.pedigreeRegistrationId) && (
                                                <hr className="border-gray-200" />
                                            )}
                                            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                                                {animal.breederAssignedId && <div><span className="text-gray-500">Assigned ID:</span> <strong>{animal.breederAssignedId}</strong></div>}
                                                {animal.microchipNumber && <div><span className="text-gray-500">Microchip:</span> <strong>{animal.microchipNumber}</strong></div>}
                                                {animal.pedigreeRegistrationId && <div><span className="text-gray-500">Pedigree Reg:</span> <strong>{animal.pedigreeRegistrationId}</strong></div>}
                                            </div>
                                        </div>`;

const count12 = (result.match(new RegExp(oldGrid12.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
console.log('Grid 1+2 occurrences:', count12);
result = result.split(oldGrid12).join(newGrid12);

// ─── Change 4: Restructure the breeder/IDs grid for instance 3 ───────────────
const oldGrid3 = `                                        {/* Breeder + IDs inline */}
                                        <div className="border-t border-gray-200 pt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                                            {animal.breederId_public && (
                                                <div>
                                                    <span className="text-gray-500">Breeder:</span>{' '}
                                                    {breederInfo ? (
                                                        <button
                                                            onClick={() => onViewProfile && onViewProfile(breederInfo)}
                                                            className="text-primary hover:underline font-medium"
                                                        >
                                                            {(() => {
                                                                const showPersonal = breederInfo.showPersonalName ?? false;
                                                                const showBreeder = breederInfo.showBreederName ?? false;
                                                                if (showPersonal && showBreeder && breederInfo.personalName && breederInfo.breederName) {
                                                                    return \`\${breederInfo.personalName} (\${breederInfo.breederName})\`;
                                                                } else if (showBreeder && breederInfo.breederName) {
                                                                    return breederInfo.breederName;
                                                                } else if (showPersonal && breederInfo.personalName) {
                                                                    return breederInfo.personalName;
                                                                } else {
                                                                    return 'Unknown Breeder';
                                                                }
                                                            })()}
                                                        </button>
                                                    ) : (
                                                        <span className="font-mono text-accent">{animal.breederId_public}</span>
                                                    )}
                                                </div>
                                            )}
                                            <div><span className="text-gray-500">CTC ID:</span> <strong>{animal.id_public}</strong></div>
                                            {animal.breederAssignedId && <div><span className="text-gray-500">ID:</span> <strong>{animal.breederAssignedId}</strong></div>}
                                            {animal.microchipNumber && <div><span className="text-gray-500">Microchip:</span> <strong>{animal.microchipNumber}</strong></div>}
                                            {animal.pedigreeRegistrationId && <div><span className="text-gray-500">Pedigree Reg:</span> <strong>{animal.pedigreeRegistrationId}</strong></div>}
                                        </div>`;

const newGrid3 = `                                        {/* Breeder + IDs */}
                                        {animal.breederId_public && (
                                            <div className="border-t border-gray-200 pt-2 space-y-2 text-sm">
                                                <div>
                                                    <span className="text-gray-500">Breeder:</span>{' '}
                                                    {breederInfo ? (
                                                        <button
                                                            onClick={() => onViewProfile && onViewProfile(breederInfo)}
                                                            className="text-primary hover:underline font-medium"
                                                        >
                                                            {(() => {
                                                                const showPersonal = breederInfo.showPersonalName ?? false;
                                                                const showBreeder = breederInfo.showBreederName ?? false;
                                                                if (showPersonal && showBreeder && breederInfo.personalName && breederInfo.breederName) {
                                                                    return \`\${breederInfo.personalName} (\${breederInfo.breederName})\`;
                                                                } else if (showBreeder && breederInfo.breederName) {
                                                                    return breederInfo.breederName;
                                                                } else if (showPersonal && breederInfo.personalName) {
                                                                    return breederInfo.personalName;
                                                                } else {
                                                                    return 'Unknown Breeder';
                                                                }
                                                            })()}
                                                        </button>
                                                    ) : (
                                                        <span className="font-mono text-accent">{animal.breederId_public}</span>
                                                    )}
                                                </div>
                                                {(animal.breederAssignedId || animal.microchipNumber || animal.pedigreeRegistrationId) && (
                                                    <hr className="border-gray-200" />
                                                )}
                                                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                                                    {animal.breederAssignedId && <div><span className="text-gray-500">Assigned ID:</span> <strong>{animal.breederAssignedId}</strong></div>}
                                                    {animal.microchipNumber && <div><span className="text-gray-500">Microchip:</span> <strong>{animal.microchipNumber}</strong></div>}
                                                    {animal.pedigreeRegistrationId && <div><span className="text-gray-500">Pedigree Reg:</span> <strong>{animal.pedigreeRegistrationId}</strong></div>}
                                                </div>
                                            </div>
                                        )}`;

const count3 = (result.match(new RegExp(oldGrid3.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
console.log('Grid 3 occurrences:', count3);
result = result.split(oldGrid3).join(newGrid3);

fs.writeFileSync(file, result, 'utf8');
console.log('Done.');
