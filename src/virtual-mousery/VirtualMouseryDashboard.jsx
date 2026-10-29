import React, { useState, useEffect } from 'react';

// Import the main Virtual-Mousery-Logo (same as used on login page)
import logo from './Virtual-Mousery-Logo.png';

// Import the 9 logos from the virtual-mousery folder (for user selection grid)
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
import axios from 'axios';
import { API_BASE_URL } from '../utils/apiConfig';

const VirtualMouseryDashboard = () => {
    const [logoIndex, setLogoIndex] = useState(() => {
        const stored = localStorage.getItem('virtualMouseryLogoIndex');
        return stored ? parseInt(stored) : 0;
    });

    useEffect(() => {
        localStorage.setItem('virtualMouseryLogoIndex', logoIndex.toString());
    }, [logoIndex]);

    const [userName, setUserName] = useState('');
    const [showName, setShowName] = useState(false);

    useEffect(() => {
        // Fetch user setup data from database
        axios.get(`${API_BASE_URL}/virtual-mousery/setup`)
            .then(response => {
                if (response.data) {
                    setUserName(response.data.name || '');
                    setShowName(!!response.data.name);
                    // Update localStorage from database
                    localStorage.setItem('virtualMouseryName', response.data.name || '');
                    localStorage.setItem('virtualMouseryLogoIndex', String(response.data.logoIndex || 0));
                    // Update logo index if changed
                    setLogoIndex(response.data.logoIndex ?? 0);
                }
            })
            .catch(err => {
                console.error('Failed to fetch setup data:', err);
                // Fall back to localStorage if API fails
                const stored = localStorage.getItem('virtualMouseryName');
                setUserName(stored || '');
                setShowName(!!stored);
            });
    }, []);

    const logos = [logo1, logo2, logo3, logo4, logo5, logo6, logo7, logo8, logo9];

    return (
        <div className="min-h-screen bg-page-bg dark:bg-dark-bg flex flex-col items-center p-6">
            <header className="w-full flex items-center justify-between py-4 px-6 sticky top-0 z-20 bg-gray-100 dark:bg-gray-800">
                <div className="flex items-center gap-4">
                    <img
                        src={logo}
                        alt="Virtual Mousery Logo"
                        className="w-10 h-auto"
                    />
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text">Virtual Mousery</h1>
                </div>

                <div className="flex items-center gap-2 hidden md:flex">
                    <img
                        src={logos[logoIndex]}
                        alt="User Logo"
                        className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                    />
                    <span className="text-gray-700 dark:text-dark-text capitalize">
                        {userName || 'Guest'}
                    </span>
                </div>
            </header>

            <div className="w-full max-w-2xl text-center">
                <img src={logos[logoIndex]} alt="Virtual Mousery Logo" className="w-24 h-auto mb-4" />
                <h1 className="text-3xl font-bold text-gray-900 dark:text-dark-text mb-3">Virtual Mousery</h1>
                <p className="text-gray-500 dark:text-dark-text-secondary">
                    Welcome back. This dashboard is actively being built.
                </p>
                <p className="text-sm text-gray-400 dark:text-dark-text-tertiary mt-2">
                    Set up your Virtual Mousery first, then return here.
                </p>
            </div>
        </div>
    );
};

export default VirtualMouseryDashboard;
