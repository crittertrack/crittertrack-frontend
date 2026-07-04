import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Scale, Dna, Loader2, Search } from 'lucide-react';

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
      <label className="block text-sm font-medium text-gray-700 mb-2">{title}</label>
      <div className="relative">
        <input
          type="text"
          placeholder="Search by name or ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          disabled={disabled}
          className="w-full p-2 border border-gray-300 rounded-lg"
        />
        <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
      </div>
      <div className="mt-2 h-48 overflow-y-auto border rounded-lg bg-gray-50">
        {filteredAnimals.map(animal => (
          <button
            key={animal.id_public}
            onClick={() => onSelect(animal)}
            disabled={disabled}
            className={`w-full text-left p-2 text-sm hover:bg-blue-50 transition ${selectedAnimal?.id_public === animal.id_public ? 'bg-blue-100 font-semibold' : ''}`}
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
const COICalculatorPage = ({ myAnimals, authToken, API_BASE_URL }) => {
  const [sire, setSire] = useState(null);
  const [dam, setDam] = useState(null);
  const [coiResult, setCoiResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const getFullName = (animal) => [animal?.prefix, animal?.name, animal?.suffix].filter(Boolean).join(' ');

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
        params: { sireId: sire.id_public, damId: dam.id_public, generations: 50 },
        headers: { Authorization: `Bearer ${authToken}` }
      });
      setCoiResult({ 
        coi: response.data.inbreedingCoefficient ?? 0, 
        generations: response.data.generations || 50 
      });
    } catch (err) {
      console.error("COI Calculation Error:", err);
      setError(err.response?.data?.message || 'Failed to calculate COI. The backend endpoint may not be available.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-full bg-white rounded-xl shadow-lg flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 flex-shrink-0 bg-gradient-to-r from-primary/10 to-accent/10">
        <div className="flex items-center gap-3">
          <Scale size={32} className="text-primary flex-shrink-0" />
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">COI Calculator</h2>
            <p className="text-gray-600 text-xs sm:text-sm mt-1">Calculate the Coefficient of Inbreeding for a potential pairing.</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <AnimalSelector
              animals={myAnimals.filter(a => a.gender === 'Male')}
              selectedAnimal={sire}
              onSelect={setSire}
              title="Select Sire"
              disabled={isLoading}
            />
            <AnimalSelector
              animals={myAnimals.filter(a => a.gender === 'Female')}
              selectedAnimal={dam}
              onSelect={setDam}
              title="Select Dam"
              disabled={isLoading}
            />
          </div>

          <div className="text-center mb-6">
            <button
              onClick={handleCalculate}
              disabled={!sire || !dam || isLoading}
              className="px-8 py-3 bg-primary text-black font-semibold rounded-lg shadow-md hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mx-auto"
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

          {error && (
            <div className="p-4 mb-6 bg-red-50 border border-red-200 text-red-800 rounded-lg text-center">
              <p>{error}</p>
            </div>
          )}

          {coiResult && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Calculation Result</h3>
              <div className="text-center">
                <p className="text-gray-600">The predicted Coefficient of Inbreeding (COI) for offspring from:</p>
                <p className="font-semibold my-2">{getFullName(sire)} &times; {getFullName(dam)}</p>
                <div className="my-4 p-6 bg-white border-2 border-primary rounded-full w-40 h-40 mx-auto flex flex-col items-center justify-center shadow-lg">
                  <span className="text-4xl font-bold text-primary">{coiResult.coi.toFixed(2)}%</span>
                  <span className="text-sm text-gray-500">COI</span>
                </div>
                <p className="text-xs text-gray-500 mt-2">Calculated over {coiResult.generations} generations.</p>
              </div>
            </div>
          )}

          {!coiResult && !isLoading && (
             <div className="text-center text-gray-400 mt-8">
                <Scale size={48} className="mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">Select a sire and dam to begin.</p>
                <p className="text-sm mt-2">The calculator will determine the inbreeding coefficient based on their shared ancestors.</p>
              </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default COICalculatorPage;