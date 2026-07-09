import React, { useState, useMemo } from 'react';
import axios from 'axios';
import { Loader2 } from 'lucide-react';

const COICalculatorPage = ({ API_BASE_URL, authToken, myAnimals }) => {
    const [animal1Id, setAnimal1Id] = useState('');
    const [animal2Id, setAnimal2Id] = useState('');
    const [coi, setCoi] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [selectedSpecies, setSelectedSpecies] = useState('All');

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

    const handleCalculate = async () => {
        if (!animal1Id || !animal2Id) {
            setError('Please select two animals.');
            return;
        }
        setIsLoading(true);
        setError('');
        setCoi(null);
        try {
            const response = await axios.post(
                `${API_BASE_URL}/animals/calculate-coi`,
                { animal1Id, animal2Id },
                { headers: { Authorization: `Bearer ${authToken}` } }
            );
            setCoi(response.data.coi);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to calculate COI.');
            console.error('COI calculation error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const getAnimalDisplayName = (animal) => {
        if (!animal) return '';
        return `${animal.prefix || ''} ${animal.name} ${animal.suffix || ''}`.trim() + ` (${animal.id_public})`;
    };

    return (
        <div className="p-4 sm:p-6 bg-white dark:bg-dark-surface rounded-xl shadow-lg max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-dark-text mb-4">Inbreeding Coefficient (COI) Calculator</h1>
            <p className="text-gray-600 dark:text-dark-text-secondary mb-6">
                Select two animals from your collection to calculate the Coefficient of Inbreeding for their potential offspring. This tool helps you make informed breeding decisions by estimating genetic diversity.
            </p>

            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    {/* Species Selector */}
                    <div className="md:col-span-3">
                        <label htmlFor="species-selector" className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">
                            Filter by Species
                        </label>
                        <select
                            id="species-selector"
                            value={selectedSpecies}
                            onChange={(e) => {
                                setSelectedSpecies(e.target.value);
                                setAnimal1Id('');
                                setAnimal2Id('');
                                setCoi(null);
                                setError('');
                            }}
                            className="w-full p-2 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg text-gray-900 dark:text-dark-text focus:ring-primary focus:border-primary"
                        >
                            {speciesOptions.map(species => (
                                <option key={species} value={species}>{species}</option>
                            ))}
                        </select>
                        <p className="text-xs text-gray-500 dark:text-dark-text-muted mt-1">
                            Filtering by species makes it easier to find animals in large collections.
                        </p>
                    </div>

                    {/* Animal 1 Selector */}
                    <div>
                        <label htmlFor="animal1" className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">
                            Animal 1 (Sire/Dam)
                        </label>
                        <select
                            id="animal1"
                            value={animal1Id}
                            onChange={(e) => setAnimal1Id(e.target.value)}
                            className="w-full p-2 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg text-gray-900 dark:text-dark-text focus:ring-primary focus:border-primary"
                            disabled={filteredAnimals.length === 0}
                        >
                            <option value="">Select Animal 1</option>
                            {filteredAnimals.map(animal => (
                                <option key={animal.id_public} value={animal.id_public}>
                                    {getAnimalDisplayName(animal)}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Animal 2 Selector */}
                    <div>
                        <label htmlFor="animal2" className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">
                            Animal 2 (Sire/Dam)
                        </label>
                        <select
                            id="animal2"
                            value={animal2Id}
                            onChange={(e) => setAnimal2Id(e.target.value)}
                            className="w-full p-2 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg text-gray-900 dark:text-dark-text focus:ring-primary focus:border-primary"
                            disabled={filteredAnimals.length === 0}
                        >
                            <option value="">Select Animal 2</option>
                            {filteredAnimals.map(animal => (
                                <option key={animal.id_public} value={animal.id_public}>
                                    {getAnimalDisplayName(animal)}
                                </option>
                            ))}
                        </select>
                    </div>

                    <button
                        onClick={handleCalculate}
                        disabled={isLoading || !animal1Id || !animal2Id}
                        className="w-full bg-primary text-black font-semibold py-2 px-4 rounded-lg hover:bg-primary-dark transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                        {isLoading ? <Loader2 className="animate-spin mr-2" size={18} /> : null}
                        {isLoading ? 'Calculating...' : 'Calculate COI'}
                    </button>
                </div>

                {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md" role="alert"><p>{error}</p></div>}

                {coi !== null && <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-6 rounded-md shadow-md"><h2 className="text-lg font-bold mb-2">Calculation Result</h2><p className="text-4xl font-extrabold text-blue-600 dark:text-blue-400">{coi.toFixed(4)}%</p></div>}
            </div>
        </div>
    );
};

export default COICalculatorPage;