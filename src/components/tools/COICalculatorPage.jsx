import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Scale, Dna, Loader2, Search, Info, Network, ScrollText, X } from 'lucide-react';
import InfoButton from '../shared/InfoButton';
import { compareBreedingLines } from '../../utils/breedingLineColor';
import FamilyTreeView from '../FamilyTree/FamilyTreeView';
import { PedigreeChart } from '../AnimalForm';

// Placeholder id for the hypothetical (not-yet-bred) offspring node used to anchor the
// direct-lines family tree view around a sire/dam pairing that has no real litter yet.
const PAIRING_PREVIEW_ID = '__coi_pairing_preview__';

// A simplified animal selector for the calculator
const AnimalSelector = ({ animals, selectedAnimal, onSelect, title, disabled }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const getFullName = (animal) => [animal.prefix, animal.name, animal.suffix].filter(Boolean).join(' ');
  const filteredAnimals = animals.filter(a => 
    getFullName(a).toLowerCase().includes(searchTerm.toLowerCase()) || 
    a.id_public.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2">{title}</label>
      <div className="relative">
        <input
          type="text"
          placeholder={disabled ? 'Select a species above first...' : 'Search by name or ID...'}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          disabled={disabled}
          className="w-full p-2 border border-gray-300 dark:border-dark-text dark:bg-dark-card-bg dark:text-dark-text dark:placeholder-dark-text-muted rounded-lg disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed dark:disabled:bg-dark-surface dark:disabled:text-dark-text-muted"
        />
        <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-dark-text-muted" />
      </div>
      <div className="mt-2 h-48 overflow-y-auto border dark:border-dark-text rounded-lg bg-gray-50 dark:bg-dark-card-bg">
        {filteredAnimals.map(animal => (
          <button
            key={animal.id_public}
            onClick={() => onSelect(animal)}
            disabled={disabled}
            className={`w-full text-left p-2 text-sm hover:bg-blue-50 dark:hover:bg-dark-surface-hover transition disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent ${selectedAnimal?.id_public === animal.id_public ? 'bg-blue-100 dark:bg-dark-primary/20 text-blue-900 dark:text-dark-primary font-semibold' : 'dark:text-dark-text'}`}
          >
            {getFullName(animal)} ({animal.id_public})
          </button>
        ))}
      </div>
    </div>
  );
};

/**
 * A dedicated page for calculating the Coefficient of Inbreeding (COI).
 */
const COICalculatorPage = ({ myAnimals, authToken, API_BASE_URL, breedingLineDefs = [], animalBreedingLines = {}, onViewAnimal }) => {
  const [sire, setSire] = useState(null);
  const [dam, setDam] = useState(null);
  const [coiResult, setCoiResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedSpecies, setSelectedSpecies] = useState('All');
  const [showFamilyTree, setShowFamilyTree] = useState(false);
  const [showPedigreeChart, setShowPedigreeChart] = useState(false);
  const isSpeciesSupported = useMemo(() => {
    // Currently, COI calculations are supported for Fancy Mouse and Fancy Rat.
    return ['Fancy Mouse', 'Fancy Rat'].includes(selectedSpecies);
  }, [selectedSpecies]);

  const speciesOptions = useMemo(() => {
    if (!myAnimals) return [];
    const allSpecies = [...new Set(myAnimals.map(animal => animal.species))];
    return ['All', ...allSpecies.sort()];
  }, [myAnimals]);

  const filteredAnimals = useMemo(() => {
    if (!myAnimals) return [];
    if (selectedSpecies === 'All') {
        return myAnimals;
    }
    return myAnimals.filter(animal => animal.species === selectedSpecies);
  }, [myAnimals, selectedSpecies]);

  const getFullName = (animal) => [animal?.prefix, animal?.name, animal?.suffix].filter(Boolean).join(' ');

  // Injects a placeholder "expected offspring" node whose sire/dam are the selected pair, so
  // FamilyTreeView's direct-lineage traversal can be anchored on the pairing without a real litter.
  const pairingPreviewAnimals = useMemo(() => {
    if (!sire || !dam) return myAnimals || [];
    const previewNode = {
      id_public: PAIRING_PREVIEW_ID,
      name: 'Expected Offspring',
      prefix: '',
      suffix: '',
      species: sire.species || dam.species,
      gender: 'Unknown',
      sireId_public: sire.id_public,
      damId_public: dam.id_public,
    };
    return [...(myAnimals || []), previewNode];
  }, [myAnimals, sire, dam]);

  const handleFamilyTreeNodeClick = (node) => {
    const clickedAnimal = node?.data?.animal;
    if (!clickedAnimal || clickedAnimal.id_public === PAIRING_PREVIEW_ID || !onViewAnimal) return;
    onViewAnimal(clickedAnimal);
  };

  const handleCalculate = async () => {
    if (!sire || !dam) {
      setError('Please select both a sire and a dam.');
      return;
    }
    setError('');
    setIsLoading(true);
    setCoiResult(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/animals/inbreeding/pairing`, {
        params: { sireId: sire.id_public, damId: dam.id_public, generations: 50, includeAncestors: true },
        headers: { Authorization: `Bearer ${authToken}` }
      });
      console.log('COI API Response:', JSON.stringify(response.data, null, 2)); // For debugging
      const rawResult = response.data;
      const normalizedResult = {
        ...rawResult,
        inbreedingCoefficient: rawResult.inbreedingCoefficient ?? rawResult.total,
        commonAncestors: (rawResult.breakdown || []).map(ancestor => ({
          id_public: ancestor.ancestorId,
          name: ancestor.ancestorName,
          prefix: ancestor.ancestorPrefix,
          suffix: ancestor.ancestorSuffix,
          contribution: (ancestor.contribution_pct || 0) / 100, // Convert percentage back to fraction
        }))
      };
      setCoiResult(normalizedResult);
    } catch (err) {
      console.error("COI Calculation Error:", err);
      setError(err.response?.data?.message || 'Failed to calculate COI. The backend endpoint may not be available.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-full bg-white dark:bg-dark-card-bg rounded-xl shadow-lg flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-dark-text flex-shrink-0 bg-gradient-to-r from-primary/10 to-accent/10">
        <div className="flex items-center gap-3">
          <Scale size={32} className="text-primary flex-shrink-0" />
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-dark-text flex items-center gap-2">
              COI Calculator
              <InfoButton title="COI Calculator" lessonId="coi-calculator">
                <p>Calculates the predicted Coefficient of Inbreeding for offspring from a chosen sire and dam pairing, based on shared ancestors.</p>
              </InfoButton>
            </h2>
            <p className="text-gray-600 dark:text-dark-text-secondary text-xs sm:text-sm mt-1">Calculate the Coefficient of Inbreeding for a potential pairing.</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <label htmlFor="species-selector" className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2">
              Filter by Species
            </label>
            <select
              id="species-selector"
              value={selectedSpecies}
              onChange={e => {
                setSelectedSpecies(e.target.value);
                setSire(null);
                setDam(null);
                setCoiResult(null);
                setError('');
              }}
              className="w-full p-2 border border-gray-300 dark:border-dark-text dark:bg-dark-card-bg dark:text-dark-text rounded-lg"
            >
              {speciesOptions.map(species => (
                <option key={species} value={species}>{species}</option>
              ))}
            </select>
            <p className="text-xs text-gray-500 dark:text-dark-text-muted mt-1">
              Select a species to narrow down the animal lists below.
            </p>
            {!isSpeciesSupported && selectedSpecies !== 'All' && (
              <div className="mt-4 p-3 bg-blue-50 dark:bg-dark-info-blue/20 border border-blue-200 dark:border-dark-info-blue text-blue-800 dark:text-dark-text rounded-lg text-sm">
                <p>COI calculation is currently available for Fancy Mouse and Fancy Rat. Support for other species is in development!</p>
              </div>
            )}
            {selectedSpecies === 'All' && (
              <div className="mt-4 p-3 bg-blue-50 dark:bg-dark-info-blue/20 border border-blue-200 dark:border-dark-info-blue text-blue-800 dark:text-dark-text rounded-lg text-sm">
                <p>Select a specific species above to enable the sire/dam search fields below.</p>
              </div>
            )}

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <AnimalSelector
              animals={filteredAnimals.filter(a => a.gender === 'Male')}
              selectedAnimal={sire}
              onSelect={setSire}
              title="Select Sire"
              disabled={isLoading || !isSpeciesSupported}
            />
            <AnimalSelector
              animals={filteredAnimals.filter(a => a.gender === 'Female')}
              selectedAnimal={dam}
              onSelect={setDam}
              title="Select Dam"
              disabled={isLoading || !isSpeciesSupported}
            />
          </div>

          {(() => {
            const { common, sireOnly, damOnly } = compareBreedingLines(sire?.id_public, dam?.id_public, animalBreedingLines, breedingLineDefs);
            if (common.length > 0) {
              return (
                <div className="flex items-start gap-2 text-sm px-3 py-2 mb-6 rounded-lg bg-blue-50 dark:bg-dark-info-blue/20 border border-blue-200 dark:border-dark-info-blue text-blue-800 dark:text-dark-text">
                  <Info size={16} className="flex-shrink-0 mt-0.5" />
                  <span>
                    Sire and dam share {common.length} assigned breeding line{common.length !== 1 ? 's' : ''}: <span className="font-semibold">{common.map(l => l.name).join(', ')}</span>.
                  </span>
                </div>
              );
            }
            if (sireOnly.length > 0 && damOnly.length > 0) {
              return (
                <div className="flex items-start gap-2 text-sm px-3 py-2 mb-6 rounded-lg bg-blue-50 dark:bg-dark-info-blue/20 border border-blue-200 dark:border-dark-info-blue text-blue-800 dark:text-dark-text">
                  <Info size={16} className="flex-shrink-0 mt-0.5" />
                  <span>
                    Sire and dam are from different breeding lines — Sire: <span className="font-semibold">{sireOnly.map(l => l.name).join(', ')}</span>, Dam: <span className="font-semibold">{damOnly.map(l => l.name).join(', ')}</span>. No shared lines detected.
                  </span>
                </div>
              );
            }
            return null;
          })()}

          <div className="text-center mb-6">
            <button
              onClick={handleCalculate}
              disabled={!sire || !dam || isLoading || !isSpeciesSupported}
              className="px-8 py-3 bg-primary dark:bg-dark-primary text-black font-semibold rounded-lg shadow-md hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mx-auto"
            >
              {isLoading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Calculating...
                </>
              ) : (
                <>
                  <Dna size={20} />
                  Calculate COI
                </>
              )}
            </button>
          </div>

          {sire && dam && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
              <button
                onClick={() => setShowFamilyTree(true)}
                className="px-4 py-2 text-sm bg-white dark:bg-dark-card-bg border border-gray-300 dark:border-dark-text rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-dark-surface-hover transition flex items-center gap-2 font-semibold text-gray-700 dark:text-dark-text"
              >
                <Network size={16} />
                See Entire Expected Family Tree
              </button>
              <button
                onClick={() => setShowPedigreeChart(true)}
                className="px-4 py-2 text-sm bg-white dark:bg-dark-card-bg border border-gray-300 dark:border-dark-text rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-dark-surface-hover transition flex items-center gap-2 font-semibold text-gray-700 dark:text-dark-text"
              >
                <ScrollText size={16} />
                See Combined 4 Generations
              </button>
            </div>
          )}

          {error && (
            <div className="p-4 mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 rounded-lg text-center">
              <p>{error}</p>
            </div>
          )}

          {coiResult && (
            <div className="bg-gray-50 dark:bg-dark-card-bg border border-gray-200 dark:border-dark-text rounded-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 dark:text-dark-text mb-4 text-center">Calculation Result</h3>
              <div className="text-center">
                <p className="text-gray-600 dark:text-dark-text-secondary">The predicted Coefficient of Inbreeding (COI) for offspring from:</p>
                <p className="font-semibold my-2 dark:text-dark-text">{getFullName(sire)} &times; {getFullName(dam)}</p>
                <div className="my-4 p-6 bg-white dark:bg-dark-card-bg border-2 border-primary rounded-full w-40 h-40 mx-auto flex flex-col items-center justify-center shadow-lg">
                  <span className="text-4xl font-bold text-primary">{(coiResult.inbreedingCoefficient ?? 0).toFixed(2)}%</span>
                  <span className="text-sm text-gray-500 dark:text-dark-text-muted">COI</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-dark-text-muted mt-2">Calculated over {coiResult.generations} generations.</p>
              </div>

              {(() => {
                // Handle various possible structures for the ancestor list
                const rawAncestors = coiResult.commonAncestors
                  || coiResult.common_ancestors
                  || (coiResult.ancestorAnalysis && coiResult.ancestorAnalysis.ancestors)
                  || coiResult.ancestors;
                const ancestors = Array.isArray(rawAncestors) ? rawAncestors : [];

                if (ancestors.length === 0) return null;

                return (
                  <div className="mt-6 pt-6 border-t border-gray-200 dark:border-dark-text">
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-dark-text mb-4 text-center flex items-center justify-center gap-2">
                      <Dna size={20} />
                      Common Ancestors ({ancestors.length})
                    </h4>
                    <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                      {ancestors.map((ancestor, index) => (
                        <div key={ancestor.id_public || index} className="bg-white dark:bg-dark-card-bg border border-gray-200 dark:border-dark-text rounded-lg p-3 text-sm">
                          <p className="font-bold text-gray-800 dark:text-dark-text">{getFullName(ancestor)} ({ancestor.id_public})</p>
                          <p className="text-xs text-gray-500 dark:text-dark-text-muted mt-0.5">Contribution: <span className="font-semibold">{(ancestor.contribution * 100).toFixed(4)}%</span></p>
                          {/* Paths are not available in the current API response, so they are hidden. */}
                          {(ancestor.sirePath || ancestor.damPath) &&
                            <div className="mt-2 text-xs grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <div><p className="font-semibold text-blue-700 dark:text-blue-400">Path from Sire:</p><p className="text-gray-600 dark:text-dark-text-secondary">{(ancestor.sirePath || []).join(' → ')}</p></div>
                              <div><p className="font-semibold text-pink-700 dark:text-pink-400">Path from Dam:</p><p className="text-gray-600 dark:text-dark-text-secondary">{(ancestor.damPath || []).join(' → ')}</p></div>
                            </div>
                          }
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {!coiResult && !isLoading && (
             <div className="text-center text-gray-400 dark:text-dark-text-muted mt-8">
                <Scale size={48} className="mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">Select a sire and dam to begin.</p>
                <p className="text-sm mt-2">The calculator will determine the inbreeding coefficient based on their shared ancestors.</p>
              </div>
          )}
        </div>
      </div>

      {showFamilyTree && sire && dam && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white dark:bg-dark-card-bg rounded-xl shadow-2xl w-full max-w-6xl h-[85vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-dark-text flex-shrink-0">
              <h3 className="text-base sm:text-lg font-bold text-gray-800 dark:text-dark-text flex items-center gap-2 truncate">
                <Network size={18} className="flex-shrink-0" />
                <span className="truncate">Expected Family Tree — {getFullName(sire)} &times; {getFullName(dam)}</span>
              </h3>
              <button onClick={() => setShowFamilyTree(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-dark-surface-hover rounded-lg flex-shrink-0" aria-label="Close">
                <X size={20} className="text-gray-600 dark:text-dark-text-secondary" />
              </button>
            </div>
            <div className="flex-1 min-h-0">
              <FamilyTreeView
                animals={pairingPreviewAnimals}
                focusAnimalId={PAIRING_PREVIEW_ID}
                onNodeClick={handleFamilyTreeNodeClick}
                API_BASE_URL={API_BASE_URL}
                authToken={authToken}
                graphMode="direct"
              />
            </div>
          </div>
        </div>
      )}

      {showPedigreeChart && sire && dam && (
        <PedigreeChart
          previewPairing={{ sireId: sire.id_public, damId: dam.id_public, coi: coiResult?.inbreedingCoefficient ?? null }}
          onClose={() => setShowPedigreeChart(false)}
          API_BASE_URL={API_BASE_URL}
          authToken={authToken}
          onViewAnimal={onViewAnimal}
        />
      )}
    </div>
  );
};

export default COICalculatorPage;