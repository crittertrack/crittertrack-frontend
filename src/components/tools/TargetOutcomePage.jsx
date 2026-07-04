import React, { useState } from 'react';
import { Target, Dna, Loader2, Search } from 'lucide-react';

// This is a placeholder for the actual calculation logic. In a real implementation,
// this would likely be a backend endpoint that can efficiently query and
// calculate genetic probabilities across all animals.
const findPotentialPairings = (allAnimals, targetGenetics) => {
  console.log('Finding pairings for:', targetGenetics);

  // Example result structure.
  const exampleResults = [
    {
      sire: allAnimals.find(a => a.gender === 'Male' && a.id_public === 'CTC6189'),
      dam: allAnimals.find(a => a.gender === 'Female' && a.id_public === 'CTC6194'),
      probability: 0.25, // 25% chance
    },
    {
      sire: allAnimals.find(a => a.gender === 'Male' && a.name === 'Fiero'),
      dam: allAnimals.find(a => a.gender === 'Female' && a.name === 'Favilla'),
      probability: 0.125, // 12.5% chance
    },
  ].filter(p => p.sire && p.dam); // Filter out any undefined animals from this example

  return new Promise(resolve => {
    setTimeout(() => {
      resolve(exampleResults);
    }, 1500); // Simulate network/calculation delay
  });
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