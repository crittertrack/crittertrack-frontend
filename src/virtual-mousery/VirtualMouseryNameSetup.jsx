import React, { useState, useEffect } from 'react';

// Import the 9 logos from the virtual-mousery folder (same as existing logo import)
import logo1 from './01_detective.png';
import logo2 from './02_researcher.png';
import logo3 from './03_floral.png';
import logo4 from './04_scientist.png';
import logo5 from './05_gardener.png';
import logo6 from './06_aviator.png';
import logo7 from './07_nature.png';
import logo8 from './08_hoodie.png';
import logo9 from './09_gentleman.png';

// Import axios for API calls
import apiClient from '../utils/apiClient';
import { API_BASE_URL } from '../utils/apiConfig';

const VirtualMouseryNameSetup = ({ onSuccess }) => {
    const [name, setName] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [selectedLogoIndex, setSelectedLogoIndex] = useState(0);

    const logos = [logo1, logo2, logo3, logo4, logo5, logo6, logo7, logo8, logo9];

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) {
            setError('Please enter a name for your Virtual Mousery.');
            return;
        }
        setSaving(true);
        setError('');
        
        try {
            // Save to database via API instead of localStorage
            await apiClient.post(`/virtual-mousery/setup`, {
                name: name.trim(),
                logoIndex: selectedLogoIndex
            });
            
            // Also keep localStorage in sync
            localStorage.setItem('virtualMouseryName', name.trim());
            localStorage.setItem('virtualMouseryLogoIndex', selectedLogoIndex.toString());
            
            onSuccess();
        } catch (err) {
            console.error('Save to database failed:', err);
            setError('Failed to save. Please try again.');
        } finally {
            setSaving(false);
        }
    };
// Auto-check on mount: if name already set, go to dashboard
    useEffect(() => {
        async function checkSetup() {
            try {
                const res = await apiClient.get('/virtual-mousery/setup');
                if (res.data.name) {
                    onSuccess();
                }
            } catch (err) {
                // No setup yet — show the form
            }
        }
        checkSetup();
    }, [onSuccess]);

    return (
        <div className="min-h-screen bg-page-bg dark:bg-dark-bg flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="rounded-xl bg-white dark:bg-dark-card-bg p-8 shadow-lg border border-gray-200 dark:border-dark-border">
                    <div className="text-center mb-6">
                        <img src={logos[selectedLogoIndex]} alt="Virtual Mousery Logo" className="h-32 w-auto mx-auto" />
                        <p className="text-sm text-gray-500 dark:text-dark-text-secondary mt-1">Set up your Virtual Mousery</p>
                    </div>

                    {error && (
                        <div className="mb-4 flex items-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-dark-text">Virtual Mousery Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g. Buddy's Lounge"
                                    autoFocus
                                    className="w-full px-3 py-3 border border-gray-300 dark:border-dark-text-muted bg-white dark:bg-dark-card-bg text-gray-900 dark:text-dark-text rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition"
                                    maxLength={50}
                                />
                            </div>
                            <div className="mb-4">
                              <label className="text-sm font-medium text-gray-700 dark:text-dark-text">Choose Your Mousery Logo</label>
                              <div className="grid grid-cols-3 gap-2 mt-2">
                                {logos.map((logo, index) => (
                                  <button
                                    key={index}
                                    type="button"
                                    className={`rounded-lg p-2 ${
                                      selectedLogoIndex === index
                                        ? 'border-primary bg-primary/20'
                                        : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                                    }`}
                                    onClick={() => setSelectedLogoIndex(index)}
                                    aria-label={`Select logo ${index + 1}`}
                                  >
                                    <img
                                      src={logo}
                                      alt="Mousery logo"
                                      className="h-16 w-auto"
                                    />
                                  </button>
                                ))}
                              </div>
                            </div>
                            <button
                                type="submit"
                                disabled={saving}
                                className="w-full py-3 font-semibold text-white bg-primary rounded-lg transition hover:bg-primary-dark disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {saving ? 'Saving...' : 'Save Mousery'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default VirtualMouseryNameSetup;
