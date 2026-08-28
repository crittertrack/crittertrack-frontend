import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Info, HelpCircle } from 'lucide-react';
import { calculatePhenotype, GENE_LOCI, MOUSE_POSSIBLE_HET_LOCI, getLastMousePhenotypeBreakdown } from './GeneticsCalculator';
import { matchFancyRatPhenotype, RAT_GENE_LOCI, RAT_POSSIBLE_HET_LOCI } from '../data/fancyRatPhenotypeRules';
import { matchSyrianHamsterPhenotype, SYRIAN_HAMSTER_GENE_LOCI, SYRIAN_HAMSTER_POSSIBLE_HET_LOCI } from '../data/syrianHamsterPhenotypeRules';
import { matchCampbellsDwarfHamsterPhenotype, CAMPBELLS_DWARF_HAMSTER_GENE_LOCI, CAMPBELLS_DWARF_HAMSTER_POSSIBLE_HET_LOCI } from '../data/campbellsDwarfHamsterPhenotypeRules';
import { matchRussianDwarfHamsterPhenotype, RUSSIAN_DWARF_HAMSTER_GENE_LOCI, RUSSIAN_DWARF_HAMSTER_POSSIBLE_HET_LOCI } from '../data/russianDwarfHamsterPhenotypeRules';
import { matchBallPythonPhenotype, BALL_PYTHON_GENE_LOCI, getBallPythonComboLabel, parseBallPythonGeneticCode, BALL_PYTHON_POSSIBLE_HET_LOCI } from '../data/ballPythonPhenotypeRules';

// Shared "Possible Hets" (unconfirmed/probability-based carrier) editor used across every species'
// genetic code builder modal. Lets a breeder note e.g. "66% Het. Clown" without asserting a
// confirmed genotype.
function PossibleHetsEditor({ possibleHets, lociList, onAdd, onChange, onRemove, title = 'Possible Hets' }) {
  return (
    <div className="bg-white dark:bg-dark-surface p-4 rounded border border-gray-200 dark:border-dark-border">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-dark-text">{title}</h3>
        <button
          type="button"
          onClick={onAdd}
          className="px-3 py-1 text-sm bg-gray-100 dark:bg-dark-card-bg hover:bg-gray-200 dark:hover:bg-dark-surface-hover text-gray-800 dark:text-dark-text rounded transition"
        >
          + Add
        </button>
      </div>
      <p className="text-xs text-gray-500 dark:text-dark-text-muted mb-3">
        Unconfirmed carrier status (e.g. from a Het. x Het. pairing) — not a confirmed genotype, just a breeding-record note like "Het. Blue".
      </p>
      {possibleHets.length === 0 ? (
        <p className="text-sm text-gray-400 dark:text-dark-text-muted">None added.</p>
      ) : (
        <div className="space-y-2">
          {possibleHets.map((entry, index) => (
            <div key={index} className="flex gap-2 items-center">
              <select
                value={entry.locus}
                onChange={(e) => onChange(index, 'locus', e.target.value)}
                className="flex-1 p-2 border border-gray-300 dark:border-dark-text-muted rounded bg-white dark:bg-dark-card-bg text-gray-900 dark:text-dark-text focus:ring-accent focus:border-accent"
              >
                {lociList.map(({ locus, name }) => (
                  <option key={locus} value={locus}>{name}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="px-2 py-1 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Generic add/change/remove helpers shared by every species' Possible Hets editor (Ball Python's
// own handlers are left as-is for backward compatibility, but behave identically).
function addPossibleHetEntry(setter, lociList) {
  const firstLocus = lociList[0]?.locus;
  if (!firstLocus) return;
  setter(prev => [...prev, { locus: firstLocus, percent: 50 }]);
}

function changePossibleHetEntry(setter, index, field, val) {
  setter(prev => prev.map((entry, i) => (
    i === index ? { ...entry, [field]: field === 'percent' ? Number(val) : val } : entry
  )));
}

function removePossibleHetEntry(setter, index) {
  setter(prev => prev.filter((_, i) => i !== index));
}

const RAT_GENE_ORDER = ['A', 'B', 'Be', 'Bu', 'C', 'D', 'G', 'M', 'Mo', 'P', 'Pe', 'R', 'Me', 'Dal', 'Dw', 'H', 'Hs', 'Ma', 'Ro', 'Sf', 'Wh', 'Ws', 'Re', 'Ve', 'Sm', 'Lu', 'Sy', 'Sk', 'hr', 'hrl', 'sa', 'nz', 'fz', 'pw', 'Du', 'dr', 'Mx'];

export function parseRatGeneticCode(codeString) {
  if (!codeString) return {};
  const genotype = {};
  codeString.trim().split(/[\s,]+/).forEach(part => {
    if (!part.match(/^[A-Za-z]+\/[A-Za-z]+$/)) return;
    const [a, b] = part.split('/');
    const reversed = `${b}/${a}`;
    for (const [locus, data] of Object.entries(RAT_GENE_LOCI)) {
      if (data.combinations.includes(part)) { genotype[locus] = part; return; }
      if (data.combinations.includes(reversed)) { genotype[locus] = reversed; return; }
    }
  });
  return genotype;
}

function buildRatGeneticCode(genotype) {
  return RAT_GENE_ORDER
    .filter(locus => genotype[locus] && genotype[locus] !== '')
    .map(locus => genotype[locus])
    .join(' ');
}

const HAMSTER_GENE_ORDER = ['a', 'b', 'cd', 'ce', 'd', 'dg', 'e', 'p', 'sg', 'lg', 'u', 'ba', 'ds', 'wh', 's', 'rd', 'hr', 'l', 'rx', 'sa', 'to'];

export function parseHamsterGeneticCode(codeString) {
  if (!codeString) return {};
  const genotype = {};
  codeString.trim().split(/[\s,]+/).forEach(part => {
    if (!part.match(/^[A-Za-z]+\/[A-Za-z]+$/)) return;
    const [a, b] = part.split('/');
    const reversed = `${b}/${a}`;
    for (const [locus, data] of Object.entries(SYRIAN_HAMSTER_GENE_LOCI)) {
      const allCombos = data.maleCombinations ? [...data.combinations, ...data.maleCombinations] : data.combinations;
      if (allCombos.includes(part)) { genotype[locus] = part; return; }
      if (allCombos.includes(reversed)) { genotype[locus] = reversed; return; }
    }
  });
  return genotype;
}

function buildHamsterGeneticCode(genotype) {
  return HAMSTER_GENE_ORDER
    .filter(locus => genotype[locus] && genotype[locus] !== '')
    .map(locus => genotype[locus])
    .join(' ');
}

const CAMPBELLS_GENE_ORDER = ['a', 'b', 'd', 'p', 'c', 'di', 'dg', 'u', 'mo', 'mi', 'si', 'rx', 'sa', 'wa'];

export function parseCampbellsGeneticCode(codeString) {
  if (!codeString) return {};
  const genotype = {};
  codeString.trim().split(/[\s,]+/).forEach(part => {
    if (!part.match(/^[A-Za-z]+\/[A-Za-z]+$/)) return;
    const [a, b] = part.split('/');
    const reversed = `${b}/${a}`;
    for (const [locus, data] of Object.entries(CAMPBELLS_DWARF_HAMSTER_GENE_LOCI)) {
      if (data.combinations.includes(part)) { genotype[locus] = part; return; }
      if (data.combinations.includes(reversed)) { genotype[locus] = reversed; return; }
    }
  });
  return genotype;
}

function buildCampbellsGeneticCode(genotype) {
  return CAMPBELLS_GENE_ORDER
    .filter(locus => genotype[locus] && genotype[locus] !== '')
    .map(locus => genotype[locus])
    .join(' ');
}

const RUSSIAN_DWARF_GENE_ORDER = ['a', 'd', 'p', 'm', 'ma', 'pe', 'me', 'u', 'mi', 's', 'wh', 'rx', 'sa', 'wa'];

export function parseRussianDwarfGeneticCode(codeString) {
  if (!codeString) return {};
  const genotype = {};
  codeString.trim().split(/[\s,]+/).forEach(part => {
    if (!part.match(/^[A-Za-z]+\/[A-Za-z]+$/)) return;
    const [a, b] = part.split('/');
    const reversed = `${b}/${a}`;
    for (const [locus, data] of Object.entries(RUSSIAN_DWARF_HAMSTER_GENE_LOCI)) {
      if (data.combinations.includes(part)) { genotype[locus] = part; return; }
      if (data.combinations.includes(reversed)) { genotype[locus] = reversed; return; }
    }
  });
  return genotype;
}

function buildRussianDwarfGeneticCode(genotype) {
  return RUSSIAN_DWARF_GENE_ORDER
    .filter(locus => genotype[locus] && genotype[locus] !== '')
    .map(locus => genotype[locus])
    .join(' ');
}

const BALL_PYTHON_GENE_ORDER = ['cinBp', 'ban', 'cg', 'pas', 'en', 'fi', 'cho', 'van', 'pin', 'puz', 'wom', 'sab', 'od', 'yb', 'grv', 'spc', 'ob', 'rus', 'spe', 'mys', 'chn', 'hon', 'bam', 'sch', 'spn', 'asp', 'jol', 'lor', 'raz', 'bon', 'huf', 'cyp', 'gra', 'jav', 'bld', 'cal', 'dst', 'dsc', 'bh', 'spk', 'jag', 'krg', 'ahi', 'dot', 'web', 'acd', 'bng', 'caf', 'gob', 'grm', 'jed', 'nov', 'bad', 'bgo', 'blz', 'blt', 'crm', 'gnx', 'nya', 'orb', 'pxl', 'qke', 'sat', 'hur', 'cpr', 'fsn', 'ksm', 'rpr', 'stc', 'trj', 'wke', 'zwd', 'mar', 'pch', 'rvn', 'sgr', 'vdo', 'mos', 'rgn', 'rhd', 'stk', 'tar', 'mck', 'stg', 'nny', 'lmb', 'cha', 'sp', 'les', 'moj', 'but', 'pha', 'dad', 'pi', 'cl', 'gs', 'albCdy', 'lacGhi', 'ax', 'hy', 'cml', 'dg', 'sun', 'rax', 'tof', 'lav', 'ult', 'leo', 'cry', 'mig', 'vnt', 'zbr', 'shr', 'rbw', 'snt', 'spd', 'pnt'];

function buildBallPythonGeneticCode(genotype) {
  return BALL_PYTHON_GENE_ORDER
    .filter(locus => genotype[locus] && genotype[locus] !== '')
    .map(locus => genotype[locus])
    .join(' ');
}

// Parse a Fancy Mouse genetic code string into a { locus: 'X/x' } genotype object.
export function parseMouseGeneticCode(codeString) {
  if (!codeString) return {};

  const genotype = {};
  const parts = codeString.replace(/,/g, ' ').trim().split(/\s+/);

  parts.forEach(part => {
    let match = part.match(/^([A-Za-z]+)\/([A-Za-z]+)$/);
    let allele1, allele2;

    if (match) {
      allele1 = match[1];
      allele2 = match[2];
    } else {
      match = part.match(/^([A-Za-z])([A-Za-z])$/);
      if (match) {
        allele1 = match[1];
        allele2 = match[2];
      }
    }

    if (allele1 && allele2) {
      // First, try to find an exact match (preserving case)
      const exactMatch = `${allele1}/${allele2}`;

      for (const [locus, data] of Object.entries(GENE_LOCI)) {
        const found = data.combinations.find(combo => combo === exactMatch);

        if (found) {
          genotype[locus] = found;
          return; // Exit early if exact match found
        }
      }

      // If no exact match, try case-insensitive matching
      const normalized = `${allele1.toLowerCase()}/${allele2.toLowerCase()}`;

      for (const [locus, data] of Object.entries(GENE_LOCI)) {
        const matchingCombo = data.combinations.find(combo =>
          combo.toLowerCase() === normalized
        );

        if (matchingCombo) {
          genotype[locus] = matchingCombo; // Use the properly formatted version from GENE_LOCI
          break;
        }
      }
    }
  });

  return genotype;
}

const GeneticCodeBuilder = ({ species, gender, value, onChange, onOpenCommunityForm, possibleHets, onPossibleHetsChange, onSeedAppearance }) => {
  const [showBuilderModal, setShowBuilderModal] = useState(false);
  const [mode, setMode] = useState('visual'); // 'visual' or 'manual'
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Build genetic code string from genotype object
  const buildGeneticCode = (genotype) => {
    // Define the correct order of genes (matching GENE_LOCI keys)
    const geneOrder = ['A', 'B', 'C', 'D', 'E', 'Ln', 'P', 'S', 'W', 'Spl', 'Rn', 'Si', 'Mobr', 'U', 'Go', 'Re', 'Sa', 'Rst', 'Fz', 'Nu'];
    
    return geneOrder
      .filter(locus => genotype[locus] && genotype[locus] !== '')
      .map(locus => genotype[locus])
      .join(' ');
  };
  
  const [genotype, setGenotype] = useState(() => parseMouseGeneticCode(value));
  const [showRatBuilderModal, setShowRatBuilderModal] = useState(false);
  const [ratMode, setRatMode] = useState('visual');
  const [ratGenotype, setRatGenotype] = useState(() => parseRatGeneticCode(value));
  const [showHamsterBuilderModal, setShowHamsterBuilderModal] = useState(false);
  const [hamsterMode, setHamsterMode] = useState('visual');
  const [hamsterGenotype, setHamsterGenotype] = useState(() => parseHamsterGeneticCode(value));
  const [showCampbellsBuilderModal, setShowCampbellsBuilderModal] = useState(false);
  const [campbellsMode, setCampbellsMode] = useState('visual');
  const [campbellsGenotype, setCampbellsGenotype] = useState(() => parseCampbellsGeneticCode(value));
  const [showRussianDwarfBuilderModal, setShowRussianDwarfBuilderModal] = useState(false);
  const [russianDwarfMode, setRussianDwarfMode] = useState('visual');
  const [russianDwarfGenotype, setRussianDwarfGenotype] = useState(() => parseRussianDwarfGeneticCode(value));
  const [showBallPythonBuilderModal, setShowBallPythonBuilderModal] = useState(false);
  const [ballPythonMode, setBallPythonMode] = useState('visual');
  const [ballPythonGenotype, setBallPythonGenotype] = useState(() => parseBallPythonGeneticCode(value));
  const [ballPythonPossibleHets, setBallPythonPossibleHets] = useState(() => possibleHets || []);
  const [mousePossibleHets, setMousePossibleHets] = useState(() => possibleHets || []);
  const [ratPossibleHets, setRatPossibleHets] = useState(() => possibleHets || []);
  const [hamsterPossibleHets, setHamsterPossibleHets] = useState(() => possibleHets || []);
  const [campbellsPossibleHets, setCampbellsPossibleHets] = useState(() => possibleHets || []);
  const [russianDwarfPossibleHets, setRussianDwarfPossibleHets] = useState(() => possibleHets || []);

  // Get valid combinations for a locus based on gender
  const getValidCombinations = (locus) => {
    const geneData = GENE_LOCI[locus];
    if (!geneData) return [];

    const combos = (locus === 'Mobr' && gender === 'Male' && geneData.maleCombinations)
      ? geneData.maleCombinations
      : geneData.combinations;

    // Hide the '/-' wildcard option everywhere — old saved genotypes with '/-' still parse/display
    // fine, it's just no longer offered here.
    return combos.filter(combo => !combo.endsWith('/-'));
  };
  
  // Handle dropdown change
  const handleGeneChange = (locus, combination) => {
    const newGenotype = { ...genotype, [locus]: combination };
    setGenotype(newGenotype);
  };
  
  // Handle save from modal
  const handleSave = () => {
    onChange(buildGeneticCode(genotype));
    if (onPossibleHetsChange) onPossibleHetsChange(mousePossibleHets);
    setShowBuilderModal(false);
  };
  
  // Handle manual text change in modal
  const handleManualChange = (e) => {
    const newValue = e.target.value;
    if (mode === 'visual') {
      setGenotype(parseMouseGeneticCode(newValue));
    }
  };
  
  // Small "Seed to Appearance" button shown under the Phenotype/Carries preview box for
  // rodent species. Copies the categorized breakdown into the Appearance tab's fields.
  const renderSeedAppearanceButton = (breakdown, carrierTraits) => {
    if (!onSeedAppearance) return null;
    return (
      <div className="pt-1">
        <button
          type="button"
          onClick={() => onSeedAppearance({ ...breakdown, carrierTraits })}
          className="px-2 py-1 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white rounded transition"
        >
          Seed to Appearance
        </button>
      </div>
    );
  };

  // For Fancy Mouse: show button to open builder
  if (species === 'Fancy Mouse') {
    return (
      <>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary">
            Genetic Code
          </label>
          
          {/* Display current value + button */}
          <div className="flex gap-2">
            <div className="flex-1 p-2 border border-gray-300 dark:border-dark-text-muted rounded bg-gray-50 dark:bg-dark-surface text-gray-900 dark:text-dark-text font-mono text-sm min-h-[42px] flex items-center">
              {value || <span className="text-gray-400 dark:text-dark-text-muted">Not set</span>}
            </div>
            <div data-tutorial-target="genetic-code-add-btn">
              <button
                type="button"
                onClick={() => setShowBuilderModal(true)}
                className="px-4 py-2 bg-accent hover:bg-accent/90 text-white rounded font-medium transition whitespace-nowrap"
              >
              {value ? 'Edit Genes' : 'Add'}
            </button>
            </div>
          </div>

          {value && (() => {
            const result = calculatePhenotype(parseMouseGeneticCode(value), parseMouseGeneticCode(value));
            const breakdown = getLastMousePhenotypeBreakdown();
            const hetNotes = mousePossibleHets
              .filter(h => h && h.locus && h.percent)
              .map(h => `Het. ${MOUSE_POSSIBLE_HET_LOCI.find(l => l.locus === h.locus)?.name || h.locus}`);
            if (!result.phenotype && (!result.carriers || result.carriers.length === 0) && hetNotes.length === 0) return null;
            return (
              <div className="bg-blue-50 dark:bg-dark-info-blue/20 p-3 rounded-lg border border-blue-200 dark:border-dark-info-blue/60 space-y-1">
                {result.phenotype && (
                  <div>
                    <div className="text-sm font-medium text-blue-900 dark:text-blue-300">Phenotype:</div>
                    <div className="text-base font-semibold text-blue-800 dark:text-blue-200">{result.phenotype}</div>
                  </div>
                )}
                {result.carriers && result.carriers.length > 0 && (
                  <div>
                    <div className="text-sm font-medium text-blue-900 dark:text-blue-300">Carries:</div>
                    <div className="text-sm text-blue-700 dark:text-blue-300">{result.carriers.join(', ')}</div>
                  </div>
                )}
                {hetNotes.length > 0 && (
                  <div>
                    <div className="text-sm font-medium text-blue-900 dark:text-blue-300">Possible Carries:</div>
                    <div className="text-sm text-blue-700 dark:text-blue-300">{hetNotes.join(', ')}</div>
                  </div>
                )}
                {renderSeedAppearanceButton(breakdown, (result.carriers || []).join(', '))}
              </div>
            );
          })()}

          <p className="text-xs text-gray-500 dark:text-dark-text-muted">
            Click the button to use the visual gene selector
          </p>
        </div>
        
        {/* Full-Screen Builder Modal */}
        {showBuilderModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-dark-card-bg rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">
              {/* Header */}
              <div className="flex justify-between items-center border-b dark:border-dark-border p-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-dark-text">
                  Genetic Code Builder - {species}
                </h2>
                <div className="flex gap-2">
                  <div data-tutorial-target="switch-manual-btn">
                    <button
                      type="button"
                      onClick={() => setMode(mode === 'visual' ? 'manual' : 'visual')}
                      className="px-4 py-2 bg-gray-100 dark:bg-dark-surface hover:bg-gray-200 dark:hover:bg-dark-surface-hover text-gray-800 dark:text-dark-text rounded-lg transition"
                    >
                    {mode === 'visual' ? 'Switch to Manual' : 'Switch to Visual'}
                  </button>
                  </div>
                  <div data-tutorial-target="genetic-cancel-btn">
                    <button
                      type="button"
                      onClick={() => setShowBuilderModal(false)}
                      className="px-4 py-2 bg-gray-200 dark:bg-dark-surface hover:bg-gray-300 dark:hover:bg-dark-surface-hover text-gray-800 dark:text-dark-text rounded-lg transition"
                    >
                      Cancel
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={handleSave}
                    className="px-4 py-2 bg-accent hover:bg-accent/90 text-white rounded-lg font-semibold transition"
                  >
                    Save Genetics
                  </button>
                </div>
              </div>
              
              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">{mode === 'visual' ? (
                <div className="space-y-4">
                  {/* Preview of generated code */}
                  <div className="bg-blue-50 dark:bg-dark-info-blue/20 p-4 rounded-lg border border-blue-200 dark:border-dark-info-blue/60 space-y-3">
                    {(() => {
                      const geneticCode = buildGeneticCode(genotype);
                      const result = geneticCode ? calculatePhenotype(genotype, genotype) : { phenotype: '', carriers: [], hidden: [], notes: [] };
                      return (
                        <>
                          {result.phenotype && (
                            <div>
                              <div className="text-sm font-medium text-blue-900 dark:text-blue-300">Phenotype:</div>
                              <div className="text-base font-semibold text-blue-800 dark:text-blue-200">
                                {result.phenotype}
                              </div>
                            </div>
                          )}
                          {result.carriers && result.carriers.length > 0 && (
                            <div>
                              <div className="text-sm font-medium text-blue-900 dark:text-blue-300">Carries:</div>
                              <div className="text-sm text-blue-700 dark:text-blue-300">
                                {result.carriers.join(', ')}
                              </div>
                            </div>
                          )}
                          <div>
                            <div className="text-sm font-medium text-blue-900 dark:text-blue-300">Genotype:</div>
                            <div className="font-mono text-base text-blue-800 dark:text-blue-200">
                              {geneticCode || 'Select genes below...'}
                            </div>
                          </div>
                          {result.notes && result.notes.length > 0 && (
                            <div className="text-xs text-orange-600 dark:text-orange-400 italic">
                              Note: {result.notes.join('; ')}
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>

                  <PossibleHetsEditor
                    possibleHets={mousePossibleHets}
                    lociList={MOUSE_POSSIBLE_HET_LOCI}
                    title="Possible Carried Genes"
                    onAdd={() => addPossibleHetEntry(setMousePossibleHets, MOUSE_POSSIBLE_HET_LOCI)}
                    onChange={(index, field, val) => changePossibleHetEntry(setMousePossibleHets, index, field, val)}
                    onRemove={(index) => removePossibleHetEntry(setMousePossibleHets, index)}
                  />

                  {/* All Genes (Color, Markings, Coat, etc.) */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-dark-text mb-3">All Genes</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {['A', 'B', 'C', 'D', 'E', 'Ln', 'P', 'S', 'W', 'Spl', 'Rn', 'Si', 'Mobr', 'U', 'Go', 'Re', 'Sa', 'Rst', 'Fz', 'Nu'].map(locus => (
                        <div key={locus} className="bg-white dark:bg-dark-surface p-3 rounded border border-gray-200 dark:border-dark-border h-48 flex flex-col">
                          <label className="block text-sm font-semibold text-gray-700 dark:text-dark-text-secondary mb-1">
                            {GENE_LOCI[locus].name} ({locus})
                          </label>
                          {GENE_LOCI[locus].description && (
                            <p className="text-xs text-gray-500 dark:text-dark-text-muted mb-2 leading-snug flex-1 overflow-hidden">{GENE_LOCI[locus].description}</p>
                          )}
                          <select
                            value={genotype[locus] || ''}
                            onChange={(e) => handleGeneChange(locus, e.target.value)}
                            className="w-full p-2 border border-gray-300 dark:border-dark-text-muted rounded bg-white dark:bg-dark-card-bg text-gray-900 dark:text-dark-text focus:ring-accent focus:border-accent mt-auto"
                          >
                            <option value="">-</option>
                            {getValidCombinations(locus).map(combo => (
                              <option key={combo} value={combo}>{combo}</option>
                            ))}
                          </select>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 dark:bg-dark-info-blue/20 p-4 rounded text-sm text-blue-800 dark:text-blue-300">
                    <div className="flex items-start gap-2">
                      <Info size={18} className="flex-shrink-0 mt-0.5" />
                      <div>
                        <strong>Tip:</strong> Select the genotype for each gene that applies to your animal. 
                        Leave genes blank if unknown or not applicable. The genetic code will be generated automatically.
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2">
                      Manual Entry
                    </label>
                    <textarea
                      value={buildGeneticCode(genotype)}
                      onChange={handleManualChange}
                      placeholder="e.g., A/A B/b C/C D/D E/E P/P"
                      className="w-full p-3 border border-gray-300 dark:border-dark-text-muted rounded bg-white dark:bg-dark-card-bg text-gray-900 dark:text-dark-text focus:ring-accent focus:border-accent font-mono text-sm"
                      rows="4"
                    />
                  </div>
                  <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded text-sm text-amber-800 dark:text-amber-300">
                    <div className="flex items-start gap-2">
                      <Info size={18} className="flex-shrink-0 mt-0.5" />
                      <div>
                        Enter genetic code manually in format: <code className="bg-white dark:bg-dark-card-bg px-1 rounded">A/A B/b C/C</code>
                        <br />Use the Visual mode for easier selection with dropdowns.
                      </div>
                    </div>
                  </div>
                </div>
              )}
              </div>
            </div>
          </div>
        )}
      </>
    );
  }
  
  // For Fancy Rat: full visual builder (mirrors Fancy Mouse)
  if (species === 'Fancy Rat') {
    const RAT_GENE_GROUPS = [
      { label: 'Color Genes',   loci: ['A', 'B', 'Be', 'Bu', 'C', 'D', 'G', 'M', 'Mo', 'P', 'Pe', 'R', 'Me'] },
      { label: 'Marking Genes', loci: ['Dal', 'Dw', 'H', 'Hs', 'Ma', 'Ro', 'Sf', 'Wh', 'Ws'] },
      { label: 'Coat Genes',    loci: ['Re', 'Ve', 'Sm', 'Lu', 'Sy', 'Sk', 'hr', 'hrl', 'sa', 'nz', 'fz', 'pw'] },
      { label: 'Ear Type',      loci: ['Du'] },
      { label: 'Body Type',     loci: ['dr', 'Mx'] },
    ];

    const handleRatGeneChange = (locus, combination) => {
      setRatGenotype(prev => ({ ...prev, [locus]: combination }));
    };

    const handleRatSave = () => {
      onChange(buildRatGeneticCode(ratGenotype));
      if (onPossibleHetsChange) onPossibleHetsChange(ratPossibleHets);
      setShowRatBuilderModal(false);
    };

    const handleRatManualChange = (e) => {
      setRatGenotype(parseRatGeneticCode(e.target.value));
    };

    return (
      <>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary">Genetic Code</label>
          <div className="flex gap-2">
            <div className="flex-1 p-2 border border-gray-300 dark:border-dark-text-muted rounded bg-gray-50 dark:bg-dark-surface text-gray-900 dark:text-dark-text font-mono text-sm min-h-[42px] flex items-center">
              {value || <span className="text-gray-400 dark:text-dark-text-muted">Not set</span>}
            </div>
            <button
              type="button"
              onClick={() => setShowRatBuilderModal(true)}
              className="px-4 py-2 bg-accent hover:bg-accent/90 text-white rounded font-medium transition whitespace-nowrap"
            >
              {value ? 'Edit Genes' : 'Add'}
            </button>
          </div>
          {value && (() => {
            const result = matchFancyRatPhenotype(parseRatGeneticCode(value));
            const breakdown = result.breakdown || {};
            const hetNotes = ratPossibleHets
              .filter(h => h && h.locus && h.percent)
              .map(h => `Het. ${RAT_POSSIBLE_HET_LOCI.find(l => l.locus === h.locus)?.name || h.locus}`);
            if (!result.phenotype && (!result.carriers || result.carriers.length === 0) && hetNotes.length === 0) return null;
            return (
              <div className="bg-blue-50 dark:bg-dark-info-blue/20 p-3 rounded-lg border border-blue-200 dark:border-dark-info-blue/60 space-y-1">
                {result.phenotype && (
                  <div>
                    <div className="text-sm font-medium text-blue-900 dark:text-blue-300">Phenotype:</div>
                    <div className="text-base font-semibold text-blue-800 dark:text-blue-200">{result.phenotype}</div>
                  </div>
                )}
                {result.carriers && result.carriers.length > 0 && (
                  <div>
                    <div className="text-sm font-medium text-blue-900 dark:text-blue-300">Carries:</div>
                    <div className="text-sm text-blue-700 dark:text-blue-300">{result.carriers.join(', ')}</div>
                  </div>
                )}
                {hetNotes.length > 0 && (
                  <div>
                    <div className="text-sm font-medium text-blue-900 dark:text-blue-300">Possible Carries:</div>
                    <div className="text-sm text-blue-700 dark:text-blue-300">{hetNotes.join(', ')}</div>
                  </div>
                )}
                {renderSeedAppearanceButton(breakdown, (result.carriers || []).join(', '))}
              </div>
            );
          })()}
          <p className="text-xs text-gray-500 dark:text-dark-text-muted">Click the button to use the visual gene selector</p>
        </div>

        {showRatBuilderModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-dark-card-bg rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">

              {/* Header */}
              <div className="flex justify-between items-center border-b dark:border-dark-border p-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-dark-text">Genetic Code Builder — Fancy Rat</h2>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setRatMode(ratMode === 'visual' ? 'manual' : 'visual')}
                    className="px-4 py-2 bg-gray-100 dark:bg-dark-surface hover:bg-gray-200 dark:hover:bg-dark-surface-hover text-gray-800 dark:text-dark-text rounded-lg transition"
                  >
                    {ratMode === 'visual' ? 'Switch to Manual' : 'Switch to Visual'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowRatBuilderModal(false)}
                    className="px-4 py-2 bg-gray-200 dark:bg-dark-surface hover:bg-gray-300 dark:hover:bg-dark-surface-hover text-gray-800 dark:text-dark-text rounded-lg transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleRatSave}
                    className="px-4 py-2 bg-accent hover:bg-accent/90 text-white rounded-lg font-semibold transition"
                  >
                    Save Genetics
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {ratMode === 'visual' ? (
                  <div className="space-y-6">

                    {/* Phenotype preview */}
                    <div className="bg-blue-50 dark:bg-dark-info-blue/20 p-4 rounded-lg border border-blue-200 dark:border-dark-info-blue/60 space-y-2">
                      {(() => {
                        const ratCode = buildRatGeneticCode(ratGenotype);
                        const result = ratCode ? matchFancyRatPhenotype(ratGenotype) : null;
                        return (
                          <>
                            {result?.phenotype && (
                              <div>
                                <div className="text-sm font-medium text-blue-900 dark:text-blue-300">Phenotype:</div>
                                <div className="text-base font-semibold text-blue-800 dark:text-blue-200">{result.phenotype}</div>
                              </div>
                            )}
                            {result?.alternates && result.alternates.length > 0 && (
                              <div className="text-xs text-blue-700 dark:text-blue-400 italic">
                                Also known as: {result.alternates.join(', ')}
                              </div>
                            )}
                            <div>
                              <div className="text-sm font-medium text-blue-900 dark:text-blue-300">Genotype:</div>
                              <div className="font-mono text-base text-blue-800 dark:text-blue-200">{ratCode || 'Select genes below…'}</div>
                            </div>
                            {result?.carriers && result.carriers.length > 0 && (
                              <div>
                                <div className="text-sm font-medium text-blue-900 dark:text-blue-300">Carries:</div>
                                <div className="text-sm text-blue-700 dark:text-blue-300">{result.carriers.join(', ')}</div>
                              </div>
                            )}
                            {result?.notes && (
                              <div className="text-xs text-orange-600 dark:text-orange-400 italic">Note: {result.notes}</div>
                            )}
                          </>
                        );
                      })()}
                    </div>

                    <PossibleHetsEditor
                      possibleHets={ratPossibleHets}
                      lociList={RAT_POSSIBLE_HET_LOCI}
                      title="Possible Carried Genes"
                      onAdd={() => addPossibleHetEntry(setRatPossibleHets, RAT_POSSIBLE_HET_LOCI)}
                      onChange={(index, field, val) => changePossibleHetEntry(setRatPossibleHets, index, field, val)}
                      onRemove={(index) => removePossibleHetEntry(setRatPossibleHets, index)}
                    />

                    {/* Gene groups */}
                    {RAT_GENE_GROUPS.map(group => (
                      <div key={group.label}>
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-dark-text mb-3">{group.label}</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                          {group.loci.map(locus => (
                            <div key={locus} className="bg-white dark:bg-dark-surface p-3 rounded border border-gray-200 dark:border-dark-border h-48 flex flex-col">
                              <label className="block text-sm font-semibold text-gray-700 dark:text-dark-text-secondary mb-1">
                                {RAT_GENE_LOCI[locus].name} ({locus})
                              </label>
                              {RAT_GENE_LOCI[locus].description && (
                                <p className="text-xs text-gray-500 dark:text-dark-text-muted mb-2 leading-snug flex-1 overflow-hidden">
                                  {RAT_GENE_LOCI[locus].description}
                                </p>
                              )}
                              <select
                                value={ratGenotype[locus] || ''}
                                onChange={(e) => handleRatGeneChange(locus, e.target.value)}
                                className="w-full p-2 border border-gray-300 dark:border-dark-text-muted rounded bg-white dark:bg-dark-card-bg text-gray-900 dark:text-dark-text focus:ring-accent focus:border-accent mt-auto"
                              >
                                <option value="">—</option>
                                {RAT_GENE_LOCI[locus].combinations.map(combo => (
                                  <option key={combo} value={combo}>{combo}</option>
                                ))}
                              </select>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}

                    <div className="bg-blue-50 dark:bg-dark-info-blue/20 p-4 rounded text-sm text-blue-800 dark:text-blue-300">
                      <div className="flex items-start gap-2">
                        <Info size={18} className="flex-shrink-0 mt-0.5" />
                        <div>
                          <strong>Tip:</strong> Select the genotype for each gene that applies to your animal.
                          Leave genes blank if unknown or not applicable. The genetic code is generated automatically.
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2">Manual Entry</label>
                      <textarea
                        value={buildRatGeneticCode(ratGenotype)}
                        onChange={handleRatManualChange}
                        placeholder="e.g., a/a m/m h/h Re/re du/du"
                        className="w-full p-3 border border-gray-300 dark:border-dark-text-muted rounded bg-white dark:bg-dark-card-bg text-gray-900 dark:text-dark-text focus:ring-accent focus:border-accent font-mono text-sm"
                        rows="4"
                      />
                    </div>
                    <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded text-sm text-amber-800 dark:text-amber-300">
                      <div className="flex items-start gap-2">
                        <Info size={18} className="flex-shrink-0 mt-0.5" />
                        <div>
                          Enter genetic code manually in format: <code className="bg-white dark:bg-dark-card-bg px-1 rounded">a/a m/m h/h</code>
                          <br />Use the Visual mode for easier selection with dropdowns.
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // For Syrian Hamster: full visual builder (mirrors Fancy Rat)
  if (species === 'Syrian Hamster') {
    const HAMSTER_GENE_GROUPS = [
      { label: 'Color Genes',   loci: ['a', 'b', 'cd', 'ce', 'd', 'dg', 'e', 'p', 'sg', 'lg', 'u'] },
      { label: 'Marking Genes', loci: ['ba', 'ds', 'wh', 's', 'rd'] },
      { label: 'Coat Genes',    loci: ['hr', 'l', 'rx', 'sa'] },
      { label: 'Sex-Linked',    loci: ['to'] },
    ];

    // 'to' is sex-linked: males can only be to/Y or To/Y
    const getValidHamsterCombinations = (locus) => {
      const geneData = SYRIAN_HAMSTER_GENE_LOCI[locus];
      if (!geneData) return [];
      if (locus === 'to' && gender === 'Male' && geneData.maleCombinations) {
        return geneData.maleCombinations;
      }
      return geneData.combinations;
    };

    const handleHamsterGeneChange = (locus, combination) => {
      setHamsterGenotype(prev => ({ ...prev, [locus]: combination }));
    };

    const handleHamsterSave = () => {
      onChange(buildHamsterGeneticCode(hamsterGenotype));
      if (onPossibleHetsChange) onPossibleHetsChange(hamsterPossibleHets);
      setShowHamsterBuilderModal(false);
    };

    const handleHamsterManualChange = (e) => {
      setHamsterGenotype(parseHamsterGeneticCode(e.target.value));
    };

    return (
      <>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary">Genetic Code</label>
          <div className="flex gap-2">
            <div className="flex-1 p-2 border border-gray-300 dark:border-dark-text-muted rounded bg-gray-50 dark:bg-dark-surface text-gray-900 dark:text-dark-text font-mono text-sm min-h-[42px] flex items-center">
              {value || <span className="text-gray-400 dark:text-dark-text-muted">Not set</span>}
            </div>
            <button
              type="button"
              onClick={() => setShowHamsterBuilderModal(true)}
              className="px-4 py-2 bg-accent hover:bg-accent/90 text-white rounded font-medium transition whitespace-nowrap"
            >
              {value ? 'Edit Genes' : 'Add'}
            </button>
          </div>
          {value && (() => {
            const result = matchSyrianHamsterPhenotype(parseHamsterGeneticCode(value));
            const breakdown = result.breakdown || {};
            const hetNotes = hamsterPossibleHets
              .filter(h => h && h.locus && h.percent)
              .map(h => `Het. ${SYRIAN_HAMSTER_POSSIBLE_HET_LOCI.find(l => l.locus === h.locus)?.name || h.locus}`);
            if (!result.phenotype && (!result.carriers || result.carriers.length === 0) && hetNotes.length === 0) return null;
            return (
              <div className="bg-blue-50 dark:bg-dark-info-blue/20 p-3 rounded-lg border border-blue-200 dark:border-dark-info-blue/60 space-y-1">
                {result.phenotype && (
                  <div>
                    <div className="text-sm font-medium text-blue-900 dark:text-blue-300">Phenotype:</div>
                    <div className="text-base font-semibold text-blue-800 dark:text-blue-200">{result.phenotype}</div>
                  </div>
                )}
                {result.carriers && result.carriers.length > 0 && (
                  <div>
                    <div className="text-sm font-medium text-blue-900 dark:text-blue-300">Carries:</div>
                    <div className="text-sm text-blue-700 dark:text-blue-300">{result.carriers.join(', ')}</div>
                  </div>
                )}
                {hetNotes.length > 0 && (
                  <div>
                    <div className="text-sm font-medium text-blue-900 dark:text-blue-300">Possible Carries:</div>
                    <div className="text-sm text-blue-700 dark:text-blue-300">{hetNotes.join(', ')}</div>
                  </div>
                )}
                {renderSeedAppearanceButton(breakdown, (result.carriers || []).join(', '))}
              </div>
            );
          })()}
          <p className="text-xs text-gray-500 dark:text-dark-text-muted">Click the button to use the visual gene selector</p>
        </div>

        {showHamsterBuilderModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-dark-card-bg rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">

              {/* Header */}
              <div className="flex justify-between items-center border-b dark:border-dark-border p-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-dark-text">Genetic Code Builder — Syrian Hamster</h2>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setHamsterMode(hamsterMode === 'visual' ? 'manual' : 'visual')}
                    className="px-4 py-2 bg-gray-100 dark:bg-dark-surface hover:bg-gray-200 dark:hover:bg-dark-surface-hover text-gray-800 dark:text-dark-text rounded-lg transition"
                  >
                    {hamsterMode === 'visual' ? 'Switch to Manual' : 'Switch to Visual'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowHamsterBuilderModal(false)}
                    className="px-4 py-2 bg-gray-200 dark:bg-dark-surface hover:bg-gray-300 dark:hover:bg-dark-surface-hover text-gray-800 dark:text-dark-text rounded-lg transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleHamsterSave}
                    className="px-4 py-2 bg-accent hover:bg-accent/90 text-white rounded-lg font-semibold transition"
                  >
                    Save Genetics
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {hamsterMode === 'visual' ? (
                  <div className="space-y-6">

                    {/* Phenotype preview */}
                    <div className="bg-blue-50 dark:bg-dark-info-blue/20 p-4 rounded-lg border border-blue-200 dark:border-dark-info-blue/60 space-y-2">
                      {(() => {
                        const hamsterCode = buildHamsterGeneticCode(hamsterGenotype);
                        const result = hamsterCode ? matchSyrianHamsterPhenotype(hamsterGenotype) : null;
                        return (
                          <>
                            {result?.phenotype && (
                              <div>
                                <div className="text-sm font-medium text-blue-900 dark:text-blue-300">Phenotype:</div>
                                <div className="text-base font-semibold text-blue-800 dark:text-blue-200">{result.phenotype}</div>
                              </div>
                            )}
                            <div>
                              <div className="text-sm font-medium text-blue-900 dark:text-blue-300">Genotype:</div>
                              <div className="font-mono text-base text-blue-800 dark:text-blue-200">{hamsterCode || 'Select genes below…'}</div>
                            </div>
                            {result?.carriers && result.carriers.length > 0 && (
                              <div>
                                <div className="text-sm font-medium text-blue-900 dark:text-blue-300">Carries:</div>
                                <div className="text-sm text-blue-700 dark:text-blue-300">{result.carriers.join(', ')}</div>
                              </div>
                            )}
                            {result?.notes && result.notes.length > 0 && (
                              <div className="text-xs text-orange-600 dark:text-orange-400 italic">Note: {result.notes.join('; ')}</div>
                            )}
                          </>
                        );
                      })()}
                    </div>

                    <PossibleHetsEditor
                      possibleHets={hamsterPossibleHets}
                      lociList={SYRIAN_HAMSTER_POSSIBLE_HET_LOCI}
                      title="Possible Carried Genes"
                      onAdd={() => addPossibleHetEntry(setHamsterPossibleHets, SYRIAN_HAMSTER_POSSIBLE_HET_LOCI)}
                      onChange={(index, field, val) => changePossibleHetEntry(setHamsterPossibleHets, index, field, val)}
                      onRemove={(index) => removePossibleHetEntry(setHamsterPossibleHets, index)}
                    />

                    {/* Gene groups */}
                    {HAMSTER_GENE_GROUPS.map(group => (
                      <div key={group.label}>
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-dark-text mb-3">{group.label}</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                          {group.loci.map(locus => (
                            <div key={locus} className="bg-white dark:bg-dark-surface p-3 rounded border border-gray-200 dark:border-dark-border h-48 flex flex-col">
                              <label className="block text-sm font-semibold text-gray-700 dark:text-dark-text-secondary mb-1">
                                {SYRIAN_HAMSTER_GENE_LOCI[locus].name} ({locus})
                              </label>
                              {SYRIAN_HAMSTER_GENE_LOCI[locus].description && (
                                <p className="text-xs text-gray-500 dark:text-dark-text-muted mb-2 leading-snug flex-1 overflow-hidden">
                                  {SYRIAN_HAMSTER_GENE_LOCI[locus].description}
                                </p>
                              )}
                              <select
                                value={hamsterGenotype[locus] || ''}
                                onChange={(e) => handleHamsterGeneChange(locus, e.target.value)}
                                className="w-full p-2 border border-gray-300 dark:border-dark-text-muted rounded bg-white dark:bg-dark-card-bg text-gray-900 dark:text-dark-text focus:ring-accent focus:border-accent mt-auto"
                              >
                                <option value="">—</option>
                                {getValidHamsterCombinations(locus).map(combo => (
                                  <option key={combo} value={combo}>{combo}</option>
                                ))}
                              </select>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}

                    <div className="bg-blue-50 dark:bg-dark-info-blue/20 p-4 rounded text-sm text-blue-800 dark:text-blue-300">
                      <div className="flex items-start gap-2">
                        <Info size={18} className="flex-shrink-0 mt-0.5" />
                        <div>
                          <strong>Tip:</strong> Select the genotype for each gene that applies to your animal.
                          Leave genes blank if unknown or not applicable. The genetic code is generated automatically.
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2">Manual Entry</label>
                      <textarea
                        value={buildHamsterGeneticCode(hamsterGenotype)}
                        onChange={handleHamsterManualChange}
                        placeholder="e.g., a/a d/d To/to Ba/ba"
                        className="w-full p-3 border border-gray-300 dark:border-dark-text-muted rounded bg-white dark:bg-dark-card-bg text-gray-900 dark:text-dark-text focus:ring-accent focus:border-accent font-mono text-sm"
                        rows="4"
                      />
                    </div>
                    <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded text-sm text-amber-800 dark:text-amber-300">
                      <div className="flex items-start gap-2">
                        <Info size={18} className="flex-shrink-0 mt-0.5" />
                        <div>
                          Enter genetic code manually in format: <code className="bg-white dark:bg-dark-card-bg px-1 rounded">a/a d/d To/to</code>
                          <br />Use the Visual mode for easier selection with dropdowns.
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // For Campbell's Dwarf Hamster: full visual builder (mirrors Syrian Hamster)
  if (species === 'Campbells Dwarf Hamster') {
    const CAMPBELLS_GENE_GROUPS = [
      { label: 'Color Genes',   loci: ['a', 'b', 'd', 'p', 'c', 'di', 'dg'] },
      { label: 'Pattern Genes', loci: ['u', 'mo', 'mi', 'si'] },
      { label: 'Coat Genes',    loci: ['rx', 'sa', 'wa'] },
    ];

    const handleCampbellsGeneChange = (locus, combination) => {
      setCampbellsGenotype(prev => ({ ...prev, [locus]: combination }));
    };

    const handleCampbellsSave = () => {
      onChange(buildCampbellsGeneticCode(campbellsGenotype));
      if (onPossibleHetsChange) onPossibleHetsChange(campbellsPossibleHets);
      setShowCampbellsBuilderModal(false);
    };

    const handleCampbellsManualChange = (e) => {
      setCampbellsGenotype(parseCampbellsGeneticCode(e.target.value));
    };

    return (
      <>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary">Genetic Code</label>
          <div className="flex gap-2">
            <div className="flex-1 p-2 border border-gray-300 dark:border-dark-text-muted rounded bg-gray-50 dark:bg-dark-surface text-gray-900 dark:text-dark-text font-mono text-sm min-h-[42px] flex items-center">
              {value || <span className="text-gray-400 dark:text-dark-text-muted">Not set</span>}
            </div>
            <button
              type="button"
              onClick={() => setShowCampbellsBuilderModal(true)}
              className="px-4 py-2 bg-accent hover:bg-accent/90 text-white rounded font-medium transition whitespace-nowrap"
            >
              {value ? 'Edit Genes' : 'Add'}
            </button>
          </div>
          {value && (() => {
            const result = matchCampbellsDwarfHamsterPhenotype(parseCampbellsGeneticCode(value));
            const breakdown = result.breakdown || {};
            const hetNotes = campbellsPossibleHets
              .filter(h => h && h.locus && h.percent)
              .map(h => `Het. ${CAMPBELLS_DWARF_HAMSTER_POSSIBLE_HET_LOCI.find(l => l.locus === h.locus)?.name || h.locus}`);
            if (!result.phenotype && (!result.carriers || result.carriers.length === 0) && hetNotes.length === 0) return null;
            return (
              <div className="bg-blue-50 dark:bg-dark-info-blue/20 p-3 rounded-lg border border-blue-200 dark:border-dark-info-blue/60 space-y-1">
                {result.phenotype && (
                  <div>
                    <div className="text-sm font-medium text-blue-900 dark:text-blue-300">Phenotype:</div>
                    <div className="text-base font-semibold text-blue-800 dark:text-blue-200">{result.phenotype}</div>
                  </div>
                )}
                {result.carriers && result.carriers.length > 0 && (
                  <div>
                    <div className="text-sm font-medium text-blue-900 dark:text-blue-300">Carries:</div>
                    <div className="text-sm text-blue-700 dark:text-blue-300">{result.carriers.join(', ')}</div>
                  </div>
                )}
                {hetNotes.length > 0 && (
                  <div>
                    <div className="text-sm font-medium text-blue-900 dark:text-blue-300">Possible Carries:</div>
                    <div className="text-sm text-blue-700 dark:text-blue-300">{hetNotes.join(', ')}</div>
                  </div>
                )}
                {renderSeedAppearanceButton(breakdown, (result.carriers || []).join(', '))}
              </div>
            );
          })()}
          <p className="text-xs text-gray-500 dark:text-dark-text-muted">Click the button to use the visual gene selector</p>
        </div>

        {showCampbellsBuilderModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-dark-card-bg rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">

              {/* Header */}
              <div className="flex justify-between items-center border-b dark:border-dark-border p-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-dark-text">Genetic Code Builder — Campbell's Dwarf Hamster</h2>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setCampbellsMode(campbellsMode === 'visual' ? 'manual' : 'visual')}
                    className="px-4 py-2 bg-gray-100 dark:bg-dark-surface hover:bg-gray-200 dark:hover:bg-dark-surface-hover text-gray-800 dark:text-dark-text rounded-lg transition"
                  >
                    {campbellsMode === 'visual' ? 'Switch to Manual' : 'Switch to Visual'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCampbellsBuilderModal(false)}
                    className="px-4 py-2 bg-gray-200 dark:bg-dark-surface hover:bg-gray-300 dark:hover:bg-dark-surface-hover text-gray-800 dark:text-dark-text rounded-lg transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleCampbellsSave}
                    className="px-4 py-2 bg-accent hover:bg-accent/90 text-white rounded-lg font-semibold transition"
                  >
                    Save Genetics
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {campbellsMode === 'visual' ? (
                  <div className="space-y-6">

                    {/* Phenotype preview */}
                    <div className="bg-blue-50 dark:bg-dark-info-blue/20 p-4 rounded-lg border border-blue-200 dark:border-dark-info-blue/60 space-y-2">
                      {(() => {
                        const campbellsCode = buildCampbellsGeneticCode(campbellsGenotype);
                        const result = campbellsCode ? matchCampbellsDwarfHamsterPhenotype(campbellsGenotype) : null;
                        return (
                          <>
                            {result?.phenotype && (
                              <div>
                                <div className="text-sm font-medium text-blue-900 dark:text-blue-300">Phenotype:</div>
                                <div className="text-base font-semibold text-blue-800 dark:text-blue-200">{result.phenotype}</div>
                              </div>
                            )}
                            <div>
                              <div className="text-sm font-medium text-blue-900 dark:text-blue-300">Genotype:</div>
                              <div className="font-mono text-base text-blue-800 dark:text-blue-200">{campbellsCode || 'Select genes below…'}</div>
                            </div>
                            {result?.carriers && result.carriers.length > 0 && (
                              <div>
                                <div className="text-sm font-medium text-blue-900 dark:text-blue-300">Carries:</div>
                                <div className="text-sm text-blue-700 dark:text-blue-300">{result.carriers.join(', ')}</div>
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </div>

                    <PossibleHetsEditor
                      possibleHets={campbellsPossibleHets}
                      lociList={CAMPBELLS_DWARF_HAMSTER_POSSIBLE_HET_LOCI}
                      title="Possible Carried Genes"
                      onAdd={() => addPossibleHetEntry(setCampbellsPossibleHets, CAMPBELLS_DWARF_HAMSTER_POSSIBLE_HET_LOCI)}
                      onChange={(index, field, val) => changePossibleHetEntry(setCampbellsPossibleHets, index, field, val)}
                      onRemove={(index) => removePossibleHetEntry(setCampbellsPossibleHets, index)}
                    />

                    {/* Gene groups */}
                    {CAMPBELLS_GENE_GROUPS.map(group => (
                      <div key={group.label}>
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-dark-text mb-3">{group.label}</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                          {group.loci.map(locus => (
                            <div key={locus} className="bg-white dark:bg-dark-surface p-3 rounded border border-gray-200 dark:border-dark-border h-48 flex flex-col">
                              <label className="block text-sm font-semibold text-gray-700 dark:text-dark-text-secondary mb-1">
                                {CAMPBELLS_DWARF_HAMSTER_GENE_LOCI[locus].name} ({locus})
                              </label>
                              {CAMPBELLS_DWARF_HAMSTER_GENE_LOCI[locus].description && (
                                <p className="text-xs text-gray-500 dark:text-dark-text-muted mb-2 leading-snug flex-1 overflow-hidden">
                                  {CAMPBELLS_DWARF_HAMSTER_GENE_LOCI[locus].description}
                                </p>
                              )}
                              <select
                                value={campbellsGenotype[locus] || ''}
                                onChange={(e) => handleCampbellsGeneChange(locus, e.target.value)}
                                className="w-full p-2 border border-gray-300 dark:border-dark-text-muted rounded bg-white dark:bg-dark-card-bg text-gray-900 dark:text-dark-text focus:ring-accent focus:border-accent mt-auto"
                              >
                                <option value="">—</option>
                                {CAMPBELLS_DWARF_HAMSTER_GENE_LOCI[locus].combinations.map(combo => (
                                  <option key={combo} value={combo}>{combo}</option>
                                ))}
                              </select>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}

                    <div className="bg-blue-50 dark:bg-dark-info-blue/20 p-4 rounded text-sm text-blue-800 dark:text-blue-300">
                      <div className="flex items-start gap-2">
                        <Info size={18} className="flex-shrink-0 mt-0.5" />
                        <div>
                          <strong>Tip:</strong> Select the genotype for each gene that applies to your animal.
                          Leave genes blank if unknown or not applicable. The genetic code is generated automatically.
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2">Manual Entry</label>
                      <textarea
                        value={buildCampbellsGeneticCode(campbellsGenotype)}
                        onChange={handleCampbellsManualChange}
                        placeholder="e.g., a/a d/d Mo/mo"
                        className="w-full p-3 border border-gray-300 dark:border-dark-text-muted rounded bg-white dark:bg-dark-card-bg text-gray-900 dark:text-dark-text focus:ring-accent focus:border-accent font-mono text-sm"
                        rows="4"
                      />
                    </div>
                    <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded text-sm text-amber-800 dark:text-amber-300">
                      <div className="flex items-start gap-2">
                        <Info size={18} className="flex-shrink-0 mt-0.5" />
                        <div>
                          Enter genetic code manually in format: <code className="bg-white dark:bg-dark-card-bg px-1 rounded">a/a d/d Mo/mo</code>
                          <br />Use the Visual mode for easier selection with dropdowns.
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // For Russian Dwarf Hamster: full visual builder (mirrors Campbells)
  if (species === 'Russian Dwarf Hamster') {
    const RUSSIAN_DWARF_GENE_GROUPS = [
      { label: 'Color Genes',    loci: ['a', 'd', 'p', 'm', 'ma'] },
      { label: 'Marking Genes',  loci: ['pe', 'me', 'u', 'mi', 's', 'wh'] },
      { label: 'Coat Genes',     loci: ['rx', 'sa', 'wa'] },
    ];

    const handleRussianDwarfGeneChange = (locus, combination) => {
      setRussianDwarfGenotype(prev => ({ ...prev, [locus]: combination }));
    };

    const handleRussianDwarfSave = () => {
      onChange(buildRussianDwarfGeneticCode(russianDwarfGenotype));
      if (onPossibleHetsChange) onPossibleHetsChange(russianDwarfPossibleHets);
      setShowRussianDwarfBuilderModal(false);
    };

    const handleRussianDwarfManualChange = (e) => {
      setRussianDwarfGenotype(parseRussianDwarfGeneticCode(e.target.value));
    };

    return (
      <>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary">Genetic Code</label>
          <div className="flex gap-2">
            <div className="flex-1 p-2 border border-gray-300 dark:border-dark-text-muted rounded bg-gray-50 dark:bg-dark-surface text-gray-900 dark:text-dark-text font-mono text-sm min-h-[42px] flex items-center">
              {value || <span className="text-gray-400 dark:text-dark-text-muted">Not set</span>}
            </div>
            <button
              type="button"
              onClick={() => setShowRussianDwarfBuilderModal(true)}
              className="px-4 py-2 bg-accent hover:bg-accent/90 text-white rounded font-medium transition whitespace-nowrap"
            >
              {value ? 'Edit Genes' : 'Add'}
            </button>
          </div>
          {value && (() => {
            const result = matchRussianDwarfHamsterPhenotype(parseRussianDwarfGeneticCode(value));
            const breakdown = result.breakdown || {};
            const hetNotes = russianDwarfPossibleHets
              .filter(h => h && h.locus && h.percent)
              .map(h => `Het. ${RUSSIAN_DWARF_HAMSTER_POSSIBLE_HET_LOCI.find(l => l.locus === h.locus)?.name || h.locus}`);
            if (!result.phenotype && (!result.carriers || result.carriers.length === 0) && hetNotes.length === 0) return null;
            return (
              <div className="bg-blue-50 dark:bg-dark-info-blue/20 p-3 rounded-lg border border-blue-200 dark:border-dark-info-blue/60 space-y-1">
                {result.phenotype && (
                  <div>
                    <div className="text-sm font-medium text-blue-900 dark:text-blue-300">Phenotype:</div>
                    <div className="text-base font-semibold text-blue-800 dark:text-blue-200">{result.phenotype}</div>
                  </div>
                )}
                {result.carriers && result.carriers.length > 0 && (
                  <div>
                    <div className="text-sm font-medium text-blue-900 dark:text-blue-300">Carries:</div>
                    <div className="text-sm text-blue-700 dark:text-blue-300">{result.carriers.join(', ')}</div>
                  </div>
                )}
                {hetNotes.length > 0 && (
                  <div>
                    <div className="text-sm font-medium text-blue-900 dark:text-blue-300">Possible Carries:</div>
                    <div className="text-sm text-blue-700 dark:text-blue-300">{hetNotes.join(', ')}</div>
                  </div>
                )}
                {renderSeedAppearanceButton(breakdown, (result.carriers || []).join(', '))}
              </div>
            );
          })()}
          <p className="text-xs text-gray-500 dark:text-dark-text-muted">Click the button to use the visual gene selector</p>
        </div>

        {showRussianDwarfBuilderModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-dark-card-bg rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">

              {/* Header */}
              <div className="flex justify-between items-center border-b dark:border-dark-border p-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-dark-text">Genetic Code Builder — Russian Dwarf Hamster</h2>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setRussianDwarfMode(russianDwarfMode === 'visual' ? 'manual' : 'visual')}
                    className="px-4 py-2 bg-gray-100 dark:bg-dark-surface hover:bg-gray-200 dark:hover:bg-dark-surface-hover text-gray-800 dark:text-dark-text rounded-lg transition"
                  >
                    {russianDwarfMode === 'visual' ? 'Switch to Manual' : 'Switch to Visual'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowRussianDwarfBuilderModal(false)}
                    className="px-4 py-2 bg-gray-200 dark:bg-dark-surface hover:bg-gray-300 dark:hover:bg-dark-surface-hover text-gray-800 dark:text-dark-text rounded-lg transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleRussianDwarfSave}
                    className="px-4 py-2 bg-accent hover:bg-accent/90 text-white rounded-lg font-semibold transition"
                  >
                    Save Genetics
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {russianDwarfMode === 'visual' ? (
                  <div className="space-y-6">

                    {/* Phenotype preview */}
                    <div className="bg-blue-50 dark:bg-dark-info-blue/20 p-4 rounded-lg border border-blue-200 dark:border-dark-info-blue/60 space-y-2">
                      {(() => {
                        const russianDwarfCode = buildRussianDwarfGeneticCode(russianDwarfGenotype);
                        const result = russianDwarfCode ? matchRussianDwarfHamsterPhenotype(russianDwarfGenotype) : null;
                        return (
                          <>
                            {result?.phenotype && (
                              <div>
                                <div className="text-sm font-medium text-blue-900 dark:text-blue-300">Phenotype:</div>
                                <div className="text-base font-semibold text-blue-800 dark:text-blue-200">{result.phenotype}</div>
                              </div>
                            )}
                            <div>
                              <div className="text-sm font-medium text-blue-900 dark:text-blue-300">Genotype:</div>
                              <div className="font-mono text-base text-blue-800 dark:text-blue-200">{russianDwarfCode || 'Select genes below…'}</div>
                            </div>
                            {result?.carriers && result.carriers.length > 0 && (
                              <div>
                                <div className="text-sm font-medium text-blue-900 dark:text-blue-300">Carries:</div>
                                <div className="text-sm text-blue-700 dark:text-blue-300">{result.carriers.join(', ')}</div>
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </div>

                    <PossibleHetsEditor
                      possibleHets={russianDwarfPossibleHets}
                      lociList={RUSSIAN_DWARF_HAMSTER_POSSIBLE_HET_LOCI}
                      title="Possible Carried Genes"
                      onAdd={() => addPossibleHetEntry(setRussianDwarfPossibleHets, RUSSIAN_DWARF_HAMSTER_POSSIBLE_HET_LOCI)}
                      onChange={(index, field, val) => changePossibleHetEntry(setRussianDwarfPossibleHets, index, field, val)}
                      onRemove={(index) => removePossibleHetEntry(setRussianDwarfPossibleHets, index)}
                    />

                    {/* Gene groups */}
                    {RUSSIAN_DWARF_GENE_GROUPS.map(group => (
                      <div key={group.label}>
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-dark-text mb-3">{group.label}</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                          {group.loci.map(locus => (
                            <div key={locus} className="bg-white dark:bg-dark-surface p-3 rounded border border-gray-200 dark:border-dark-border h-48 flex flex-col">
                              <label className="block text-sm font-semibold text-gray-700 dark:text-dark-text-secondary mb-1">
                                {RUSSIAN_DWARF_HAMSTER_GENE_LOCI[locus].name} ({locus})
                              </label>
                              {RUSSIAN_DWARF_HAMSTER_GENE_LOCI[locus].description && (
                                <p className="text-xs text-gray-500 dark:text-dark-text-muted mb-2 leading-snug flex-1 overflow-hidden">
                                  {RUSSIAN_DWARF_HAMSTER_GENE_LOCI[locus].description}
                                </p>
                              )}
                              <select
                                value={russianDwarfGenotype[locus] || ''}
                                onChange={(e) => handleRussianDwarfGeneChange(locus, e.target.value)}
                                className="w-full p-2 border border-gray-300 dark:border-dark-text-muted rounded bg-white dark:bg-dark-card-bg text-gray-900 dark:text-dark-text focus:ring-accent focus:border-accent mt-auto"
                              >
                                <option value="">—</option>
                                {RUSSIAN_DWARF_HAMSTER_GENE_LOCI[locus].combinations.map(combo => (
                                  <option key={combo} value={combo}>{combo}</option>
                                ))}
                              </select>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}

                    <div className="bg-blue-50 dark:bg-dark-info-blue/20 p-4 rounded text-sm text-blue-800 dark:text-blue-300">
                      <div className="flex items-start gap-2">
                        <Info size={18} className="flex-shrink-0 mt-0.5" />
                        <div>
                          <strong>Tip:</strong> Select the genotype for each gene that applies to your animal.
                          Leave genes blank if unknown or not applicable. The genetic code is generated automatically.
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2">Manual Entry</label>
                      <textarea
                        value={buildRussianDwarfGeneticCode(russianDwarfGenotype)}
                        onChange={handleRussianDwarfManualChange}
                        placeholder="e.g., a/a d/d Ma/ma"
                        className="w-full p-3 border border-gray-300 dark:border-dark-text-muted rounded bg-white dark:bg-dark-card-bg text-gray-900 dark:text-dark-text focus:ring-accent focus:border-accent font-mono text-sm"
                        rows="4"
                      />
                    </div>
                    <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded text-sm text-amber-800 dark:text-amber-300">
                      <div className="flex items-start gap-2">
                        <Info size={18} className="flex-shrink-0 mt-0.5" />
                        <div>
                          Enter genetic code manually in format: <code className="bg-white dark:bg-dark-card-bg px-1 rounded">a/a d/d Ma/ma</code>
                          <br />Use the Visual mode for easier selection with dropdowns.
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // For Ball Python: full visual builder (mirrors Russian Dwarf Hamster)
  if (species === 'Ball Python') {
    const BALL_PYTHON_GENE_GROUPS = [
      { label: 'Cinnamon / Black Pastel (multi-allelic)', loci: ['cinBp'] },
      { label: 'Incomplete Dominant Genes',                loci: ['pas', 'en', 'fi', 'cho', 'van', 'pin', 'puz', 'wom', 'sab', 'od', 'ban', 'cg', 'yb', 'grv', 'spc', 'ob', 'rus', 'spe', 'mys', 'chn', 'hon', 'bam', 'sch', 'spn', 'asp', 'jol', 'lor', 'raz', 'bon', 'huf', 'cyp', 'gra', 'jav', 'bld', 'dsc', 'bh', 'spk', 'jag', 'dot', 'bng', 'gob', 'grm', 'jed', 'blt', 'crm', 'gnx', 'orb', 'pxl', 'qke', 'sat', 'hur', 'cpr', 'fsn', 'ksm', 'rpr', 'trj', 'wke', 'zwd', 'mar', 'pch', 'rvn', 'vdo', 'mos', 'rhd', 'stk', 'tar', 'mck', 'nny', 'lmb', 'cha'] },
      { label: 'Dominant Genes',                            loci: ['sp', 'cal', 'dst', 'krg', 'ahi', 'web', 'acd', 'caf', 'nov', 'bad', 'bgo', 'blz', 'nya', 'stc', 'sgr', 'rgn', 'stg'] },
      { label: 'BEL Complex (Lesser/Mojave/Butter/Phantom/Daddy)', loci: ['les', 'moj', 'but', 'pha', 'dad'] },
      { label: 'Albino / Candy (multi-allelic)',            loci: ['albCdy'] },
      { label: 'Lace / GHI (multi-allelic)',                 loci: ['lacGhi'] },
      { label: 'Recessive Genes',                            loci: ['pi', 'cl', 'gs', 'ax', 'hy', 'cml', 'dg', 'sun', 'rax', 'tof', 'lav', 'ult', 'leo', 'cry', 'mig', 'vnt', 'zbr', 'shr', 'rbw', 'snt', 'spd', 'pnt'] },
    ];

    const handleBallPythonGeneChange = (locus, combination) => {
      setBallPythonGenotype(prev => ({ ...prev, [locus]: combination }));
    };

    const handleBallPythonSave = () => {
      onChange(buildBallPythonGeneticCode(ballPythonGenotype));
      if (onPossibleHetsChange) onPossibleHetsChange(ballPythonPossibleHets);
      setShowBallPythonBuilderModal(false);
    };

    const handleBallPythonManualChange = (e) => {
      setBallPythonGenotype(parseBallPythonGeneticCode(e.target.value));
    };

    const handleAddPossibleHet = () => {
      const firstLocus = BALL_PYTHON_POSSIBLE_HET_LOCI[0]?.locus;
      if (!firstLocus) return;
      setBallPythonPossibleHets(prev => [...prev, { locus: firstLocus, percent: 50 }]);
    };

    const handlePossibleHetChange = (index, field, val) => {
      setBallPythonPossibleHets(prev => prev.map((entry, i) => (
        i === index ? { ...entry, [field]: field === 'percent' ? Number(val) : val } : entry
      )));
    };

    const handleRemovePossibleHet = (index) => {
      setBallPythonPossibleHets(prev => prev.filter((_, i) => i !== index));
    };

    return (
      <>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary">Genetic Code</label>
          <div className="flex gap-2">
            <div className="flex-1 p-2 border border-gray-300 dark:border-dark-text-muted rounded bg-gray-50 dark:bg-dark-surface text-gray-900 dark:text-dark-text font-mono text-sm min-h-[42px] flex items-center">
              {value || <span className="text-gray-400 dark:text-dark-text-muted">Not set</span>}
            </div>
            <button
              type="button"
              onClick={() => setShowBallPythonBuilderModal(true)}
              className="px-4 py-2 bg-accent hover:bg-accent/90 text-white rounded font-medium transition whitespace-nowrap"
            >
              {value ? 'Edit Genes' : 'Add'}
            </button>
          </div>
          {value && (() => {
            const result = matchBallPythonPhenotype(parseBallPythonGeneticCode(value));
            const hetNotes = ballPythonPossibleHets
              .filter(h => h && h.locus && h.percent)
              .map(h => `${h.percent}% Het. ${BALL_PYTHON_POSSIBLE_HET_LOCI.find(l => l.locus === h.locus)?.name || h.locus}`);
            const displayName = result.phenotype && result.phenotype !== 'Normal' ? result.phenotype : null;
            if (!displayName && hetNotes.length === 0) return null;
            return (
              <div className="bg-blue-50 dark:bg-dark-info-blue/20 p-3 rounded-lg border border-blue-200 dark:border-dark-info-blue/60 space-y-1">
                {displayName && (
                  <div>
                    <div className="text-sm font-medium text-blue-900 dark:text-blue-300">Phenotype:</div>
                    <div className="text-base font-semibold text-blue-800 dark:text-blue-200">{displayName}</div>
                  </div>
                )}
                {hetNotes.length > 0 && (
                  <div>
                    <div className="text-sm font-medium text-blue-900 dark:text-blue-300">Possible Carries:</div>
                    <div className="text-sm text-blue-700 dark:text-blue-300">{hetNotes.join(', ')}</div>
                  </div>
                )}
              </div>
            );
          })()}
          <p className="text-xs text-gray-500 dark:text-dark-text-muted">Click the button to use the visual gene selector</p>
        </div>

        {showBallPythonBuilderModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-dark-card-bg rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">

              {/* Header */}
              <div className="flex justify-between items-center border-b dark:border-dark-border p-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-dark-text">Genetic Code Builder — Ball Python</h2>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setBallPythonMode(ballPythonMode === 'visual' ? 'manual' : 'visual')}
                    className="px-4 py-2 bg-gray-100 dark:bg-dark-surface hover:bg-gray-200 dark:hover:bg-dark-surface-hover text-gray-800 dark:text-dark-text rounded-lg transition"
                  >
                    {ballPythonMode === 'visual' ? 'Switch to Manual' : 'Switch to Visual'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowBallPythonBuilderModal(false)}
                    className="px-4 py-2 bg-gray-200 dark:bg-dark-surface hover:bg-gray-300 dark:hover:bg-dark-surface-hover text-gray-800 dark:text-dark-text rounded-lg transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleBallPythonSave}
                    className="px-4 py-2 bg-accent hover:bg-accent/90 text-white rounded-lg font-semibold transition"
                  >
                    Save Genetics
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {ballPythonMode === 'visual' ? (
                  <div className="space-y-6">

                    {/* Phenotype preview */}
                    <div className="bg-blue-50 dark:bg-dark-info-blue/20 p-4 rounded-lg border border-blue-200 dark:border-dark-info-blue/60 space-y-2">
                      {(() => {
                        const ballPythonCode = buildBallPythonGeneticCode(ballPythonGenotype);
                        const result = ballPythonCode ? matchBallPythonPhenotype(ballPythonGenotype) : null;
                        const hetNotes = ballPythonPossibleHets
                          .filter(h => h && h.locus && h.percent)
                          .map(h => `${h.percent}% Het. ${BALL_PYTHON_POSSIBLE_HET_LOCI.find(l => l.locus === h.locus)?.name || h.locus}`);
                        const displayName = [result?.phenotype && result.phenotype !== 'Normal' ? result.phenotype : null, ...hetNotes].filter(Boolean).join(' ') || (hetNotes.length ? hetNotes.join(' ') : null);
                        return (
                          <>
                            {displayName && (
                              <div>
                                <div className="text-sm font-medium text-blue-900 dark:text-blue-300">Phenotype:</div>
                                <div className={`text-base font-semibold ${displayName.includes('LETHAL') ? 'text-red-600' : 'text-blue-800 dark:text-blue-200'}`}>{displayName}</div>
                              </div>
                            )}
                            <div>
                              <div className="text-sm font-medium text-blue-900 dark:text-blue-300">Genotype:</div>
                              <div className="font-mono text-base text-blue-800 dark:text-blue-200">{ballPythonCode || 'Select genes below…'}</div>
                            </div>
                            {result?.carriers && result.carriers.length > 0 && (
                              <div>
                                <div className="text-sm font-medium text-blue-900 dark:text-blue-300">Carries:</div>
                                <div className="text-sm text-blue-700 dark:text-blue-300">{result.carriers.join(', ')}</div>
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </div>

                    {/* Possible Hets (unconfirmed/probability-based carrier notes) */}
                    <div className="bg-white dark:bg-dark-surface p-4 rounded border border-gray-200 dark:border-dark-border">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-dark-text">Possible Hets</h3>
                        <button
                          type="button"
                          onClick={handleAddPossibleHet}
                          className="px-3 py-1 text-sm bg-gray-100 dark:bg-dark-card-bg hover:bg-gray-200 dark:hover:bg-dark-surface-hover text-gray-800 dark:text-dark-text rounded transition"
                        >
                          + Add
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-dark-text-muted mb-3">
                        Unconfirmed carrier status (e.g. from a Het. x Het. pairing) — not a confirmed genotype, just a breeding-record note like "66% Het. Clown".
                      </p>
                      {ballPythonPossibleHets.length === 0 ? (
                        <p className="text-sm text-gray-400 dark:text-dark-text-muted">None added.</p>
                      ) : (
                        <div className="space-y-2">
                          {ballPythonPossibleHets.map((entry, index) => (
                            <div key={index} className="flex gap-2 items-center">
                              <select
                                value={entry.locus}
                                onChange={(e) => handlePossibleHetChange(index, 'locus', e.target.value)}
                                className="flex-1 p-2 border border-gray-300 dark:border-dark-text-muted rounded bg-white dark:bg-dark-card-bg text-gray-900 dark:text-dark-text focus:ring-accent focus:border-accent"
                              >
                                {BALL_PYTHON_POSSIBLE_HET_LOCI.map(({ locus, name }) => (
                                  <option key={locus} value={locus}>{name}</option>
                                ))}
                              </select>
                              <select
                                value={entry.percent}
                                onChange={(e) => handlePossibleHetChange(index, 'percent', e.target.value)}
                                className="w-28 p-2 border border-gray-300 dark:border-dark-text-muted rounded bg-white dark:bg-dark-card-bg text-gray-900 dark:text-dark-text focus:ring-accent focus:border-accent"
                              >
                                {[100, 66, 50, 25].map(p => (
                                  <option key={p} value={p}>{p}%</option>
                                ))}
                              </select>
                              <button
                                type="button"
                                onClick={() => handleRemovePossibleHet(index)}
                                className="px-2 py-1 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition"
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Gene groups */}
                    {BALL_PYTHON_GENE_GROUPS.map(group => (
                      <div key={group.label}>
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-dark-text mb-3">{group.label}</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                          {group.loci.map(locus => (
                            <div key={locus} className="bg-white dark:bg-dark-surface p-3 rounded border border-gray-200 dark:border-dark-border h-48 flex flex-col">
                              <label className="block text-sm font-semibold text-gray-700 dark:text-dark-text-secondary mb-1">
                                {BALL_PYTHON_GENE_LOCI[locus].name} ({locus})
                              </label>
                              {BALL_PYTHON_GENE_LOCI[locus].description && (
                                <p className="text-xs text-gray-500 dark:text-dark-text-muted mb-2 leading-snug flex-1 overflow-hidden">
                                  {BALL_PYTHON_GENE_LOCI[locus].description}
                                </p>
                              )}
                              <select
                                value={ballPythonGenotype[locus] || ''}
                                onChange={(e) => handleBallPythonGeneChange(locus, e.target.value)}
                                className="w-full p-2 border border-gray-300 dark:border-dark-text-muted rounded bg-white dark:bg-dark-card-bg text-gray-900 dark:text-dark-text focus:ring-accent focus:border-accent mt-auto"
                              >
                                <option value="">—</option>
                                {BALL_PYTHON_GENE_LOCI[locus].combinations.map(combo => (
                                  <option key={combo} value={combo}>{getBallPythonComboLabel(locus, combo)}</option>
                                ))}
                              </select>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}

                    <div className="bg-blue-50 dark:bg-dark-info-blue/20 p-4 rounded text-sm text-blue-800 dark:text-blue-300">
                      <div className="flex items-start gap-2">
                        <Info size={18} className="flex-shrink-0 mt-0.5" />
                        <div>
                          <strong>Tip:</strong> Select the genotype for each gene that applies to your animal.
                          Leave genes blank if unknown or not applicable. The genetic code is generated automatically.
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2">Manual Entry</label>
                      <textarea
                        value={buildBallPythonGeneticCode(ballPythonGenotype)}
                        onChange={handleBallPythonManualChange}
                        placeholder="e.g., Pas/pas Sp/sp pi/pi"
                        className="w-full p-3 border border-gray-300 dark:border-dark-text-muted rounded bg-white dark:bg-dark-card-bg text-gray-900 dark:text-dark-text focus:ring-accent focus:border-accent font-mono text-sm"
                        rows="4"
                      />
                    </div>
                    <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded text-sm text-amber-800 dark:text-amber-300">
                      <div className="flex items-start gap-2">
                        <Info size={18} className="flex-shrink-0 mt-0.5" />
                        <div>
                          Enter genetic code manually in format: <code className="bg-white dark:bg-dark-card-bg px-1 rounded">Pas/pas Sp/sp pi/pi</code>
                          <br />Use the Visual mode for easier selection with dropdowns.
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // For other species: simple manual entry + community button
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary">
        Genetic Code
      </label>
      
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="e.g., A/A B/b C/C or custom format for your species"
        className="w-full p-2 border border-gray-300 dark:border-dark-text-muted rounded bg-white dark:bg-dark-card-bg text-gray-900 dark:text-dark-text focus:ring-primary focus:border-primary font-mono text-sm"
      />
      
      <div className="bg-purple-50 dark:bg-dark-accent-purple-bg p-3 rounded text-xs text-purple-800 dark:text-dark-accent-purple">
        <div className="flex items-start gap-2">
          <HelpCircle size={16} className="flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="font-medium mb-1">
              Genetic data for {species} is not yet available
            </div>
            <div className="mb-2">
              For now, you can enter genetic information manually. If you know the genetics for this species, please help the community!
            </div>
            <button
              type="button"
              onClick={onOpenCommunityForm}
              className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs font-medium transition"
            >
              Submit Genetics Info for {species}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneticCodeBuilder;
