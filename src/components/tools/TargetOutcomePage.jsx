import React, { useState } from 'react';
import { Target, Dna, Loader2, Search } from 'lucide-react';

// This is a placeholder for the actual calculation logic. In a real implementation,
// this would likely be a backend endpoint that can efficiently query and
// calculate genetic probabilities across all animals.
const findPotentialPairings = (allAnimals, target, mode) => {
  console.log(`Finding pairings for ${mode}:`, target);

  // Helper to parse a genetic code string like "Ee/aa/Dd" or "a/a d/d"
  // into a map like { E: ['E', 'e'], A: ['a', 'a'], D: ['D', 'd'] }
  const parseGeneticCode = (codeString) => {
    if (!codeString) return {};
    const loci = {};
    // Normalize separators and split into tokens
    const parts = codeString.trim().replace(/\//g, ' ').split(/\s+/).filter(Boolean);

    for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        if (part.length === 2 && part[0].toUpperCase() === part[1].toUpperCase()) { // Handles "Ee", "aa"
            const locus = part[0].toUpperCase();
            if (!loci[locus]) {
                loci[locus] = [part[0], part[1]].sort();
            }
        } else if (part.length === 1) { // Handles "a a" from "a / a"
            const locus = part.toUpperCase();
            if (!loci[locus] && i + 1 < parts.length) {
                const nextPart = parts[i+1];
                if (nextPart.length === 1 && nextPart.toUpperCase() === locus) {
                    loci[locus] = [part, nextPart].sort();
                    i++; // Skip next part as it's consumed
                }
            }
        }
    }
    return loci;
  };

  if (mode === 'genetics') {
    const targetLoci = parseGeneticCode(target);
    if (Object.keys(targetLoci).length === 0) {
      return Promise.resolve([]);
    }

    const getAlleleProbability = (parentAlleles, desiredAllele) => {
      if (!parentAlleles) return 0; // Parent doesn't have this locus
      const count = parentAlleles.filter(a => a === desiredAllele).length;
      return count / 2;
    };

    const calculateLocusProbability = (sireAlleles, damAlleles, targetAlleles) => {
      const [t1, t2] = targetAlleles;

      const p_t1_sire = getAlleleProbability(sireAlleles, t1);
      const p_t2_sire = getAlleleProbability(sireAlleles, t2);
      const p_t1_dam = getAlleleProbability(damAlleles, t1);
      const p_t2_dam = getAlleleProbability(damAlleles, t2);

      if (t1 === t2) { // Homozygous target, e.g., e/e
        return p_t1_sire * p_t1_dam;
      } else { // Heterozygous target, e.g., E/e
        const prob1 = p_t1_sire * p_t2_dam; // Sire gives t1, Dam gives t2
        const prob2 = p_t2_sire * p_t1_dam; // Sire gives t2, Dam gives t1
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
        for (const [locus, targetAlleles] of Object.entries(targetLoci)) {
          const locusProbability = calculateLocusProbability(sireLoci[locus], damLoci[locus], targetAlleles);
          totalProbability *= locusProbability;
        }
        if (totalProbability > 0) {
          pairings.push({ sire, dam, probability: totalProbability });
        }
      }
    }

    pairings.sort((a, b) => b.probability - a.probability);
    return new Promise(resolve => setTimeout(() => resolve(pairings), 250));
  }

  // Fallback for 'traits' mode or other cases
  return Promise.resolve([]);
};

const getFullName = (animal) => [animal?.prefix, animal?.name, animal?.suffix].filter(Boolean).join(' ');

/**
 * A dedicated page for the Target Outcome Calculator.
 */
const TargetOutcomePage = ({ myAnimals, authToken, API_BASE_URL }) => {
  const [targetGenetics, setTargetGenetics] = useState('');
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFindPairings = async () => {
    if (!targetGenetics.trim()) {
      setError('Please enter the desired target genetics.');
      return;
    }
    setError('');
    setIsLoading(true);
    setResults(null);
    try {
      // In a real app, this might be a backend call:
      // const response = await axios.post(`${API_BASE_URL}/animals/genetics/find-pairs`, { targetGenetics });
      // setResults(response.data);

      // For now, we use a client-side placeholder function
      const potentialPairings = await findPotentialPairings(myAnimals, targetGenetics);
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
        <div className="max-w-4xl mx-auto">
          <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
            <label htmlFor="targetGenetics" className="block text-sm font-medium text-gray-700 mb-2">
              Desired Genetic Code
            </label>
            <div className="relative">
              <input
                id="targetGenetics"
                type="text"
                placeholder="e.g., Ee/aa/Dd"
                value={targetGenetics}
                onChange={(e) => setTargetGenetics(e.target.value)}
                disabled={isLoading}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
              <Dna size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
            <p className="text-xs text-gray-500 mt-2">Enter the genetic combination you want to achieve in the offspring.</p>
          </div>

          <div className="text-center mb-6">
            <button
              onClick={handleFindPairings}
              disabled={!targetGenetics || isLoading}
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
                    <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
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
                <p className="text-lg font-medium">Enter a target to begin.</p>
                <p className="text-sm mt-2">The calculator will search your animals for pairs that could produce the desired outcome.</p>
              </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TargetOutcomePage;