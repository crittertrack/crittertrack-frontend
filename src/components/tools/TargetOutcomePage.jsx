import React, { useState, useMemo, useEffect } from 'react';
import { Target, Dna, Loader2, Search, Settings, Palette } from 'lucide-react';

// This is a placeholder for the actual calculation logic. In a real implementation,
// this would likely be a backend endpoint that can efficiently query and
// calculate genetic probabilities across all animals.
const findPotentialPairings = (allAnimals, target, mode, speciesConfig) => {
  console.log(`Finding pairings for ${mode}:`, target);

  // Helper to parse a genetic code string like "Ee/aa Wsh/w"
  // into a map like { E: ['E', 'e'], A: ['a', 'a'], W: ['Wsh', 'w'] }
  const parseGeneticCode = (codeString) => {
    if (!codeString) return {};
    const loci = {};
    const parts = codeString.trim().split(/[ \t]+/);

    for (const part of parts) {
      let alleles;
      if (part.includes('/')) {
        alleles = part.split('/');
      } else if (part.length === 2 && part[0].toUpperCase() === part[1].toUpperCase()) {
        alleles = [part[0], part[1]];
      } else {
        continue;
      }

      if (alleles.length !== 2 || !alleles[0] || !alleles[1]) continue;

      // Heuristic for locus key: first letter of first allele, capitalized.
      const locusKey = alleles[0].replace(/[^a-zA-Z]/g, '')[0]?.toUpperCase();

      if (locusKey && !loci[locusKey]) {
        loci[locusKey] = alleles.sort();
      }
    }
    return loci;
  };

  let targetLoci;

  if (mode === 'genetics') {
    targetLoci = parseGeneticCode(target);
  } else if (mode === 'traits') {
    const targetLociFromTraits = {};
    if (speciesConfig && speciesConfig.genetics && speciesConfig.genetics.loci) {
        const lociConfig = speciesConfig.genetics.loci;
        for (const traitValue of Object.values(target)) {
            if (!traitValue) continue;

            let found = false;
            for (const locusKey in lociConfig) {
                const locus = lociConfig[locusKey];
                if (locus.phenotypes) {
                    for (const genotypeString in locus.phenotypes) {
                        if (locus.phenotypes[genotypeString] === traitValue) {
                            // Ignore ambiguous genotypes like 'A/-'
                            if (genotypeString.includes('-')) continue;

                            let alleles;
                            if (genotypeString.includes('/')) {
                                alleles = genotypeString.split('/');
                            } else if (genotypeString.length === 2) {
                                alleles = [genotypeString[0], genotypeString[1]];
                            } else {
                                continue;
                            }

                            if (alleles.length === 2 && alleles[0] && alleles[1]) {
                                targetLociFromTraits[locusKey] = alleles.sort();
                                found = true;
                                break;
                            }
                        }
                    }
                }
                if (found) break;
            }
        }
    }
    targetLoci = targetLociFromTraits;
  } else {
    return Promise.resolve([]);
  }

  if (!targetLoci || Object.keys(targetLoci).length === 0) {
    return Promise.resolve([]);
  }

  const getAlleleProbability = (parentAlleles, desiredAllele) => {
    if (!parentAlleles) return 0;
    const count = parentAlleles.filter(a => a === desiredAllele).length;
    return count / 2;
  };

  const calculateLocusProbability = (sireAlleles, damAlleles, targetAlleles) => {
    const [t1, t2] = targetAlleles;
    const p_t1_sire = getAlleleProbability(sireAlleles, t1);
    const p_t2_sire = getAlleleProbability(sireAlleles, t2);
    const p_t1_dam = getAlleleProbability(damAlleles, t1);
    const p_t2_dam = getAlleleProbability(damAlleles, t2);

    if (t1 === t2) {
      return p_t1_sire * p_t1_dam;
    } else {
      const prob1 = p_t1_sire * p_t2_dam;
      const prob2 = p_t2_sire * p_t1_dam;
      return prob1 + prob2;
    }
  };

  const sires = allAnimals.filter(a => a.gender === 'Male' && a.geneticCode);
  const dams = allAnimals.filter(a => a.gender === 'Female' && a.geneticCode);
  const pairings = [];

  for (const sire of sires) {
    for (const dam of dams) {
      const sireLoci = parseGeneticCode(sire.geneticCode);
      const damLoci = parseGeneticCode(dam.geneticCode);
      let totalProbability = 1;
      let possible = true;
      for (const [locus, targetAlleles] of Object.entries(targetLoci)) {
        const locusProbability = calculateLocusProbability(sireLoci[locus], damLoci[locus], targetAlleles);
        if (locusProbability === 0) {
            possible = false;
            break;
        }
        totalProbability *= locusProbability;
      }
      if (possible && totalProbability > 0) {
        pairings.push({ sire, dam, probability: totalProbability });
      }
    }
  }

  pairings.sort((a, b) => b.probability - a.probability);
  return new Promise(resolve => setTimeout(() => resolve(pairings), 250));
};

const getFullName = (animal) => [animal?.prefix, animal?.name, animal?.suffix].filter(Boolean).join(' ');

const TraitSelector = ({ speciesConfig, selectedTraits, onTraitChange, disabled }) => {
  const traitCategories = useMemo(() => {
    const genetics = speciesConfig?.genetics;
    if (!genetics || !genetics.phenotypeCategories || !genetics.loci) {
      return [];
    }

    return genetics.phenotypeCategories.map(category => {
      const options = new Set();
      category.loci.forEach(locusKey => {
        const locus = genetics.loci[locusKey];
        if (locus && locus.phenotypes) {
          Object.values(locus.phenotypes).forEach(phenotype => options.add(phenotype));
        }
      });
      return {
        label: category.label,
        options: Array.from(options).sort(),
      };
    }).filter(category => category.options.length > 0);
  }, [speciesConfig]);

  if (traitCategories.length === 0) {
    return <p className="text-sm text-gray-500 text-center">No visual traits configured for this species.</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {traitCategories.map(category => (
        <div key={category.label}>
          <label htmlFor={`trait-${category.label}`} className="block text-sm font-medium text-gray-700 mb-1">
            {category.label}
          </label>
          <select
            id={`trait-${category.label}`}
            value={selectedTraits[category.label] || ''}
            onChange={(e) => onTraitChange(category.label, e.target.value)}
            disabled={disabled}
            className="w-full p-2 border border-gray-300 rounded-lg bg-white"
          >
            <option value="">Any</option>
            {category.options.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
      ))}
    </div>
  );
};

/**
 * A dedicated page for the Target Outcome Calculator.
 */
const TargetOutcomePage = ({ myAnimals, authToken, API_BASE_URL, speciesOptions, speciesConfigs }) => {
  const [mode, setMode] = useState('traits'); // 'traits' or 'genetics'
  const [selectedSpecies, setSelectedSpecies] = useState('');
  const [targetGenetics, setTargetGenetics] = useState('');
  const [selectedTraits, setSelectedTraits] = useState({});
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const availableSpecies = useMemo(() => {
    if (!myAnimals) return [];
    const speciesSet = new Set(myAnimals.map(a => a.species));
    return speciesOptions.filter(s => speciesSet.has(s.name));
  }, [myAnimals, speciesOptions]);

  useEffect(() => {
    if (availableSpecies.length === 1 && !selectedSpecies) {
      setSelectedSpecies(availableSpecies[0].name);
    }
  }, [availableSpecies, selectedSpecies]);

  useEffect(() => {
    setSelectedTraits({});
    setResults(null);
  }, [selectedSpecies]);

  const handleFindPairings = async () => {
    const isTraitsMode = mode === 'traits';
    const hasTarget = isTraitsMode ? Object.values(selectedTraits).some(v => v) : targetGenetics.trim();

    if (!hasTarget) {
      setError(isTraitsMode ? 'Please select at least one trait.' : 'Please enter the desired genetic code.');
      return;
    }
    setError('');
    setIsLoading(true);
    setResults(null);
    try {
      const target = isTraitsMode ? selectedTraits : targetGenetics;
      const animalsOfSpecies = myAnimals.filter(a => a.species === selectedSpecies);
      const potentialPairings = await findPotentialPairings(animalsOfSpecies, target, mode, speciesConfigs[selectedSpecies]);
      setResults(potentialPairings);

    } catch (err) {
      console.error("Target Outcome Calculation Error:", err);
      setError(err.response?.data?.message || 'Failed to find pairings.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-full bg-white rounded-xl shadow-lg flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 flex-shrink-0 bg-gradient-to-r from-primary/10 to-accent/10">
        <div className="flex items-center gap-3">
          <Target size={32} className="text-primary flex-shrink-0" />
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Target Outcome Calculator</h2>
            <p className="text-gray-600 text-xs sm:text-sm mt-1">Find potential pairings to produce a specific genetic outcome.</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="max-w-5xl mx-auto">
          {/* Species and Mode Selection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="md:col-span-1">
              <label htmlFor="species-select" className="block text-sm font-medium text-gray-700 mb-2">
                Species
              </label>
              <select
                id="species-select"
                value={selectedSpecies}
                onChange={(e) => setSelectedSpecies(e.target.value)}
                disabled={isLoading || availableSpecies.length <= 1}
                className="w-full p-2 border border-gray-300 rounded-lg bg-white"
              >
                <option value="" disabled>Select a species</option>
                {availableSpecies.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
              </select>
            </div>
            <div className="md:col-span-2 self-end">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Calculator Mode
              </label>
              <div className="flex rounded-lg border border-gray-300 p-1 bg-gray-200">
                <button onClick={() => setMode('traits')} disabled={isLoading} className={`w-1/2 p-2 rounded-md text-sm font-semibold flex items-center justify-center gap-2 transition ${mode === 'traits' ? 'bg-white shadow' : 'text-gray-600 hover:bg-gray-300'}`}><Palette size={16} /> Visual Traits</button>
                <button onClick={() => setMode('genetics')} disabled={isLoading} className={`w-1/2 p-2 rounded-md text-sm font-semibold flex items-center justify-center gap-2 transition ${mode === 'genetics' ? 'bg-white shadow' : 'text-gray-600 hover:bg-gray-300'}`}><Settings size={16} /> Genetic Code</button>
              </div>
            </div>
          </div>

          <div className="mb-8 p-4 sm:p-6 border border-gray-200 rounded-lg bg-gray-50">
            {!selectedSpecies ? (
              <p className="text-center text-gray-500">Please select a species to begin.</p>
            ) : mode === 'traits' ? (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Select Desired Traits</h3>
                <TraitSelector
                  speciesConfig={speciesConfigs[selectedSpecies]}
                  selectedTraits={selectedTraits}
                  onTraitChange={(trait, value) => setSelectedTraits(prev => ({ ...prev, [trait]: value }))}
                  disabled={isLoading}
                />
              </div>
            ) : (
              <div>
                <label htmlFor="targetGenetics" className="block text-lg font-semibold text-gray-800 mb-4">
                  Enter Desired Genetic Code
                </label>
                <div className="relative">
                  <input
                    id="targetGenetics"
                    type="text"
                    placeholder="e.g., Ee/aa/Dd"
                    value={targetGenetics}
                    onChange={(e) => setTargetGenetics(e.target.value)}
                    disabled={isLoading}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                  />
                  <Dna size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
                <p className="text-xs text-gray-500 mt-2">Enter the genetic combination you want to achieve in the offspring.</p>
              </div>
            )}
          </div>

          <div className="text-center mb-6">
            <button
              onClick={handleFindPairings}
              disabled={!selectedSpecies || isLoading}
              className="px-8 py-3 bg-primary text-black font-semibold rounded-lg shadow-md hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mx-auto"
            >
              {isLoading ? (
                <><Loader2 size={20} className="animate-spin" /> Searching...</>
              ) : (
                <><Search size={20} /> Find Potential Pairings</>
              )}
            </button>
          </div>

          {error && <div className="p-4 mb-6 bg-red-50 border border-red-200 text-red-800 rounded-lg text-center"><p>{error}</p></div>}

          {results && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Potential Pairings Found ({results.length})</h3>
              {results.length > 0 ? (
                <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                  {results.map(({ sire, dam, probability }, index) => (
                    <div key={sire.id_public + dam.id_public} className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="text-sm">
                          <p><span className="font-semibold text-blue-700">Sire:</span> {getFullName(sire)} ({sire.id_public})</p>
                          <p><span className="font-semibold text-pink-700">Dam:</span> {getFullName(dam)} ({dam.id_public})</p>
                        </div>
                        <div className="text-center ml-4 flex-shrink-0">
                          <p className="text-2xl font-bold text-primary">{(probability * 100).toFixed(1)}%</p>
                          <p className="text-xs text-gray-500">Chance</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (<p className="text-center text-gray-600">No potential pairings found in your animals that can produce the target genetics.</p>)}
            </div>
          )}

          {!results && !isLoading && (
             <div className="text-center text-gray-400 mt-8">
                <Target size={48} className="mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">Select your target criteria above to begin.</p>
                <p className="text-sm mt-2">The calculator will search your animals for pairs that could produce the desired outcome.</p>
              </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TargetOutcomePage;