import { readFileSync, writeFileSync } from 'fs';

const file = 'c:\\Projects\\crittertrack-frontend\\src\\app.jsx';
let content = readFileSync(file, 'utf8');

// Block to insert after Variety in instances 1 & 2 (RouterLink breeder)
const insertBlock12 = `
                                        {animal.carrierTraits && (
                                            <p className="text-sm text-gray-700"><span className="font-semibold">Carrier:</span> {animal.carrierTraits}</p>
                                        )}
                                        {animal.geneticCode && (
                                            <p className="text-sm text-gray-700"><span className="font-semibold">Genetic Code:</span> <code className="bg-gray-100 px-1 rounded font-mono">{animal.geneticCode}</code></p>
                                        )}
                                        {animal.remarks && (
                                            <p className="text-sm text-gray-700 line-clamp-2"><span className="font-semibold">Remarks:</span> {animal.remarks}</p>
                                        )}
                                        {/* Breeder + IDs inline */}
                                        <div className="border-t border-gray-200 pt-2 text-sm space-y-2">
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
                                                <>
                                                    <hr className="border-gray-200" />
                                                    <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                                                        {animal.breederAssignedId && <div><span className="text-gray-500">Assigned ID:</span> <strong>{animal.breederAssignedId}</strong></div>}
                                                        {animal.microchipNumber && <div><span className="text-gray-500">Microchip:</span> <strong>{animal.microchipNumber}</strong></div>}
                                                        {animal.pedigreeRegistrationId && <div><span className="text-gray-500">Pedigree Reg:</span> <strong>{animal.pedigreeRegistrationId}</strong></div>}
                                                    </div>
                                                </>
                                            )}
                                        </div>`;

// Block to insert after Variety in instance 3 (button breeder)
const insertBlock3 = `
                                        {animal.carrierTraits && (
                                            <p className="text-sm text-gray-700"><span className="font-semibold">Carrier:</span> {animal.carrierTraits}</p>
                                        )}
                                        {animal.geneticCode && (
                                            <p className="text-sm text-gray-700"><span className="font-semibold">Genetic Code:</span> <code className="bg-gray-100 px-1 rounded font-mono">{animal.geneticCode}</code></p>
                                        )}
                                        {animal.remarks && (
                                            <p className="text-sm text-gray-700 line-clamp-2"><span className="font-semibold">Remarks:</span> {animal.remarks}</p>
                                        )}
                                        {/* Breeder + IDs inline */}
                                        <div className="border-t border-gray-200 pt-2 text-sm space-y-2">
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
                                            {(animal.breederAssignedId || animal.microchipNumber || animal.pedigreeRegistrationId) && (
                                                <>
                                                    <hr className="border-gray-200" />
                                                    <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                                                        {animal.breederAssignedId && <div><span className="text-gray-500">Assigned ID:</span> <strong>{animal.breederAssignedId}</strong></div>}
                                                        {animal.microchipNumber && <div><span className="text-gray-500">Microchip:</span> <strong>{animal.microchipNumber}</strong></div>}
                                                        {animal.pedigreeRegistrationId && <div><span className="text-gray-500">Pedigree Reg:</span> <strong>{animal.pedigreeRegistrationId}</strong></div>}
                                                    </div>
                                                </>
                                            )}
                                        </div>`;

// The unique anchor after Variety in instances 1 & 2 (filter Boolean length check)
const anchor12 = `                                        {[animal.color, animal.coatPattern, animal.coat, animal.earset, animal.phenotype, animal.morph, animal.markings, animal.eyeColor, animal.nailColor, animal.size].filter(Boolean).length > 0 && (
                                            <p className="text-sm text-gray-700">
                                                <span className="font-semibold">Variety:</span> {[animal.color, animal.coatPattern, animal.coat, animal.earset, animal.phenotype, animal.morph, animal.markings, animal.eyeColor, animal.nailColor, animal.size].filter(Boolean).join(' ')}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                            {/* Parents */}`;

const replace12 = `                                        {[animal.color, animal.coatPattern, animal.coat, animal.earset, animal.phenotype, animal.morph, animal.markings, animal.eyeColor, animal.nailColor, animal.size].filter(Boolean).length > 0 && (
                                            <p className="text-sm text-gray-700">
                                                <span className="font-semibold">Variety:</span> {[animal.color, animal.coatPattern, animal.coat, animal.earset, animal.phenotype, animal.morph, animal.markings, animal.eyeColor, animal.nailColor, animal.size].filter(Boolean).join(' ')}
                                            </p>
                                        )}` + insertBlock12 + `
                                    </div>
                                </div>
                            </div>
                            {/* Parents */}`;

// Instance 3 anchor (earset conditional check)
const anchor3 = `                                        {(animal.color || animal.coat || animal.coatPattern || animal.earset) && (
                                            <p className="text-sm text-gray-700">
                                                <span className="font-semibold">Variety:</span> {[animal.color, animal.coatPattern, animal.coat, animal.earset, animal.phenotype, animal.morph, animal.markings, animal.eyeColor, animal.nailColor, animal.size].filter(Boolean).join(' ')}
                                            </p>
                                        )}

                                    </div>
                                </div>
                            </div>
                            {/* Parents */}`;

const replace3 = `                                        {(animal.color || animal.coat || animal.coatPattern || animal.earset) && (
                                            <p className="text-sm text-gray-700">
                                                <span className="font-semibold">Variety:</span> {[animal.color, animal.coatPattern, animal.coat, animal.earset, animal.phenotype, animal.morph, animal.markings, animal.eyeColor, animal.nailColor, animal.size].filter(Boolean).join(' ')}
                                            </p>
                                        )}` + insertBlock3 + `
                                    </div>
                                </div>
                            </div>
                            {/* Parents */}`;

let c12 = 0, pos = 0;
while ((pos = content.indexOf(anchor12, pos)) !== -1) { c12++; pos++; }
console.log(`anchor12 found: ${c12} times`);

let c3 = 0; pos = 0;
while ((pos = content.indexOf(anchor3, pos)) !== -1) { c3++; pos++; }
console.log(`anchor3 found: ${c3} times`);

content = content.replaceAll(anchor12, replace12);
content = content.replaceAll(anchor3, replace3);

writeFileSync(file, content, 'utf8');
console.log('Done writing.');
