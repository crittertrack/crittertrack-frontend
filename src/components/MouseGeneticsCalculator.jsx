import React, { useState } from 'react';
import { Calculator, Book, X } from 'lucide-react';

// Gene definitions based on mouse genetics
const GENES = {
    A: {
        name: 'Agouti',
        alleles: {
            'Ay': { name: 'Dominant Yellow', dominant: true, lethal: true, info: 'Lethal when homozygous' },
            'Avy': { name: 'Viable Yellow (Brindle)', dominant: true, info: 'Causes brindle pattern' },
            'A': { name: 'Agouti', dominant: true, info: 'Wild-type agouti pattern' },
            'at': { name: 'Tan', info: 'Tan belly pattern' },
            'a': { name: 'Non-agouti (Black)', info: 'Solid color, no agouti banding' },
            'ae': { name: 'Extreme Non-agouti', info: 'Very dark, minimal tan' }
        }
    },
    B: {
        name: 'Brown',
        alleles: {
            'B': { name: 'Black', dominant: true, info: 'Wild-type black pigment' },
            'b': { name: 'Brown (Chocolate)', info: 'Brown/chocolate pigment' }
        }
    },
    C: {
        name: 'Color/Albino',
        alleles: {
            'C': { name: 'Full Color', dominant: true, info: 'Full color expression' },
            'cch': { name: 'Chinchilla', info: 'Removes yellow/red pigment' },
            'ce': { name: 'Extreme Dilution (Beige)', info: 'Beige with ruby eyes' },
            'ch': { name: 'Himalayan (Pointed)', info: 'Temperature-sensitive coloring' },
            'c': { name: 'Albino', info: 'No pigment, pink eyes white' }
        }
    },
    D: {
        name: 'Dilution',
        alleles: {
            'D': { name: 'Full Density', dominant: true, info: 'Full color density' },
            'd': { name: 'Dilute (Blue)', info: 'Dilutes black to blue, brown to lilac' }
        }
    },
    E: {
        name: 'Extension',
        alleles: {
            'E': { name: 'Full Extension', dominant: true, info: 'Normal eumelanin extension' },
            'e': { name: 'Recessive Yellow', info: 'Yellow/red color' }
        }
    },
    P: {
        name: 'Pink-eye',
        alleles: {
            'P': { name: 'Dark Eyes', dominant: true, info: 'Normal eye color' },
            'p': { name: 'Pink Eyes', info: 'Pink/ruby eyes, dilutes color' }
        }
    },
    S: {
        name: 'Piebald Spotting',
        alleles: {
            'S': { name: 'Self (No Spotting)', dominant: true, info: 'No white spotting' },
            's': { name: 'Piebald', info: 'White belly and feet spotting' }
        }
    },
    W: {
        name: 'Dominant Spotting',
        alleles: {
            'W': { name: 'Dominant Spot', lethal: true, info: 'Lethal when homozygous, causes banding' },
            'Wsh': { name: 'Rumpwhite', lethal: true, info: 'Lethal when homozygous, variable white' },
            'w': { name: 'No Spotting', info: 'No white spotting' }
        }
    }
};

// Color calculation rules
const calculateColor = (genotype) => {
    // Extract alleles
    const A1 = genotype.A[0], A2 = genotype.A[1];
    const B1 = genotype.B[0], B2 = genotype.B[1];
    const C1 = genotype.C[0], C2 = genotype.C[1];
    const D1 = genotype.D[0], D2 = genotype.D[1];
    const E1 = genotype.E[0], E2 = genotype.E[1];
    const P1 = genotype.P[0], P2 = genotype.P[1];

    // Check for lethals
    if ((A1 === 'Ay' && A2 === 'Ay')) return 'Lethal (Yellow homozygous)';
    if ((genotype.W && genotype.W[0] === 'W' && genotype.W[1] === 'W')) return 'Lethal (W homozygous)';

    // Albino overrides everything
    if (C1 === 'c' && C2 === 'c') return 'Pink-Eyed White (Albino)';

    // Recessive red
    if (E1 === 'e' && E2 === 'e') {
        if (P1 === 'p' && P2 === 'p') return 'Recessive Fawn';
        return 'Recessive Red (Yellow)';
    }

    // Dominant yellow/brindle
    if (A1 === 'Ay' || A2 === 'Ay') {
        if (P1 === 'p' && P2 === 'p') return 'Dominant Fawn';
        return 'Dominant Yellow';
    }
    if (A1 === 'Avy' || A2 === 'Avy') return 'Brindle';

    // Base color determination
    let baseColor = 'Black';
    let isAgouti = (A1 === 'A' || A2 === 'A');
    let isTan = (A1 === 'at' || A2 === 'at') && !(A1 === 'A' || A2 === 'A');

    // Brown modification
    if (B1 === 'b' && B2 === 'b') {
        baseColor = isAgouti ? 'Cinnamon' : 'Chocolate';
    }

    // Blue dilution
    if (D1 === 'd' && D2 === 'd') {
        if (baseColor === 'Black') baseColor = isAgouti ? 'Blue Agouti' : 'Blue';
        else if (baseColor === 'Chocolate') baseColor = isAgouti ? 'Lilac Agouti' : 'Lilac';
        else if (baseColor === 'Cinnamon') baseColor = 'Lilac Agouti';
    }

    // Pink-eye dilution
    if (P1 === 'p' && P2 === 'p') {
        if (baseColor === 'Black') baseColor = isAgouti ? 'Argente' : 'Dove';
        else if (baseColor === 'Chocolate') baseColor = isAgouti ? 'Silver Agouti' : 'Champagne';
        else if (baseColor === 'Blue') baseColor = isAgouti ? 'Blue Argente' : 'Silver';
        else if (baseColor === 'Lilac') baseColor = 'Lavender';
    }

    // C locus modifications
    if (C1 === 'cch' || C2 === 'cch') {
        if (C1 === 'cch' && C2 === 'cch') {
            if (isAgouti) baseColor = 'Chinchilla';
            else if (isTan) baseColor = 'Silver Fox';
            else baseColor = 'Chinchilla (self)';
        }
    }
    if ((C1 === 'ch' || C2 === 'ch') && !(C1 === 'C' || C2 === 'C')) {
        if (C1 === 'ch' && C2 === 'ch') baseColor = 'Sealpoint Siamese';
        else baseColor = 'Himalayan';
    }
    if ((C1 === 'ce' || C2 === 'ce') && !(C1 === 'C' || C2 === 'C')) {
        if (C1 === 'ce' && C2 === 'ce') baseColor = 'Beige (BEW)';
    }

    // Agouti/Tan patterns
    if (isAgouti && baseColor === 'Black') baseColor = 'Agouti';
    if (isTan) {
        if (baseColor.includes('Black')) baseColor = 'Black Tan';
        else if (baseColor.includes('Chocolate')) baseColor = 'Chocolate Tan';
        else if (baseColor.includes('Blue')) baseColor = 'Blue Tan';
        else baseColor = baseColor + ' Tan';
    }

    return baseColor;
};

const MouseGeneticsCalculator = ({ onClose, API_BASE_URL, authToken }) => {
    const [showExamples, setShowExamples] = useState(false);
    const [activeTab, setActiveTab] = useState('self');
    
    // Parent genotypes
    const [parent1, setParent1] = useState({
        A: ['A', 'a'],
        B: ['B', 'B'],
        C: ['C', 'C'],
        D: ['D', 'D'],
        E: ['E', 'E'],
        P: ['P', 'P'],
        S: ['S', 's'],
        W: ['w', 'w']
    });

    const [parent2, setParent2] = useState({
        A: ['A', 'a'],
        B: ['B', 'B'],
        C: ['C', 'C'],
        D: ['D', 'D'],
        E: ['E', 'E'],
        P: ['P', 'P'],
        S: ['S', 's'],
        W: ['w', 'w']
    });

    const updateParentGene = (parent, gene, alleleIndex, value) => {
        const setter = parent === 1 ? setParent1 : setParent2;
        const current = parent === 1 ? parent1 : parent2;
        
        setter({
            ...current,
            [gene]: alleleIndex === 0 
                ? [value, current[gene][1]]
                : [current[gene][0], value]
        });
    };

    // Calculate offspring
    const calculateOffspring = () => {
        const results = {};
        const genes = Object.keys(parent1);

        // Generate all combinations
        genes.forEach(gene => {
            const p1 = parent1[gene];
            const p2 = parent2[gene];
            
            const combinations = [
                [p1[0], p2[0]],
                [p1[0], p2[1]],
                [p1[1], p2[0]],
                [p1[1], p2[1]]
            ];

            combinations.forEach(combo => {
                const sorted = combo.sort((a, b) => {
                    const alleles = Object.keys(GENES[gene].alleles);
                    return alleles.indexOf(a) - alleles.indexOf(b);
                });
                
                const key = sorted.join('');
                if (!results[key]) results[key] = { count: 0, genotype: {} };
                results[key].count++;
                if (!results[key].genotype[gene]) results[key].genotype[gene] = sorted;
            });
        });

        return results;
    };

    const EXAMPLE_TABS = {
        self: {
            name: 'Self Colors',
            examples: [
                { name: 'Black', genotype: 'aa BB CC DD EE PP', description: 'Solid black mouse' },
                { name: 'Chocolate', genotype: 'aa bb CC DD EE PP', description: 'Solid brown/chocolate' },
                { name: 'Blue', genotype: 'aa BB CC dd EE PP', description: 'Blue-gray dilute' },
                { name: 'Lilac', genotype: 'aa bb CC dd EE PP', description: 'Dove-gray dilute chocolate' },
                { name: 'Dove', genotype: 'aa BB CC DD EE pp', description: 'Pink-eyed dilute black' },
                { name: 'Champagne', genotype: 'aa bb CC DD EE pp', description: 'Pink-eyed dilute chocolate' }
            ]
        },
        agouti: {
            name: 'Agouti Varieties',
            examples: [
                { name: 'Agouti', genotype: 'AA BB CC DD EE PP', description: 'Wild-type agouti' },
                { name: 'Cinnamon', genotype: 'AA bb CC DD EE PP', description: 'Brown agouti' },
                { name: 'Argente', genotype: 'AA BB CC DD EE pp', description: 'Pink-eyed agouti' },
                { name: 'Silver Agouti', genotype: 'AA bb CC DD EE pp', description: 'Pink-eyed cinnamon' }
            ]
        },
        tan: {
            name: 'Tan Varieties',
            examples: [
                { name: 'Black Tan', genotype: 'atat BB CC DD EE PP', description: 'Black with tan belly' },
                { name: 'Chocolate Tan', genotype: 'atat bb CC DD EE PP', description: 'Chocolate with tan belly' },
                { name: 'Blue Tan', genotype: 'atat BB CC dd EE PP', description: 'Blue with tan belly' },
                { name: 'Fox', genotype: 'atat BB cchcch DD EE PP', description: 'Chinchilla tan (silver fox)' }
            ]
        },
        cdilute: {
            name: 'C-Locus Dilutes',
            examples: [
                { name: 'Chinchilla', genotype: 'AA BB cchcch DD EE PP', description: 'Silvered agouti, no yellow' },
                { name: 'Himalayan', genotype: 'aa BB chch DD EE PP', description: 'Points on extremities' },
                { name: 'Siamese', genotype: 'aa BB chch DD EE PP', description: 'Darker pointed' },
                { name: 'Beige (BEW)', genotype: 'aa BB cece DD EE PP', description: 'Beige with ruby eyes' },
                { name: 'PEW', genotype: 'aa BB cc DD EE PP', description: 'Pink-eyed white (albino)' }
            ]
        },
        marked: {
            name: 'Marked Varieties',
            examples: [
                { name: 'Piebald', genotype: 'aa BB CC DD EE PP ss', description: 'White belly and feet' },
                { name: 'Banded', genotype: 'aa BB CC DD EE PP Ww', description: 'White belt (Dutch)' },
                { name: 'Rumpwhite', genotype: 'aa BB CC DD EE PP Wshw', description: 'Variable white rear' }
            ]
        },
        yellow: {
            name: 'Yellow/Red Varieties',
            examples: [
                { name: 'Dominant Yellow', genotype: 'Aya BB CC DD EE PP', description: 'Yellow with dark eyes' },
                { name: 'Recessive Yellow', genotype: 'aa BB CC DD ee PP', description: 'Yellow (orange-red)' },
                { name: 'Dominant Fawn', genotype: 'Aya BB CC DD EE pp', description: 'Pale yellow, pink eyes' },
                { name: 'Recessive Fawn', genotype: 'aa BB CC DD ee pp', description: 'Pale yellow, pink eyes' },
                { name: 'Brindle', genotype: 'Avya BB CC DD EE PP', description: 'Mottled yellow and agouti' }
            ]
        }
    };

    if (showExamples) {
        return (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                    <div className="flex justify-between items-center border-b p-6">
                        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                            <Book size={28} className="text-primary" />
                            Mouse Genetics Examples
                        </h2>
                        <button onClick={() => setShowExamples(false)} className="text-gray-500 hover:text-gray-800">
                            <X size={24} />
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-2 px-6 pt-4 border-b overflow-x-auto">
                        {Object.keys(EXAMPLE_TABS).map(tabKey => (
                            <button
                                key={tabKey}
                                onClick={() => setActiveTab(tabKey)}
                                className={`px-4 py-2 font-semibold rounded-t-lg transition whitespace-nowrap ${
                                    activeTab === tabKey 
                                        ? 'bg-primary text-black border-b-2 border-primary' 
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                {EXAMPLE_TABS[tabKey].name}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <div className="flex-1 overflow-y-auto p-6">
                        <div className="space-y-4">
                            {EXAMPLE_TABS[activeTab].examples.map((example, idx) => (
                                <div key={idx} className="border-2 border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                                    <h3 className="text-lg font-bold text-gray-800 mb-2">{example.name}</h3>
                                    <p className="text-sm text-gray-600 mb-2">{example.description}</p>
                                    <p className="text-xs font-mono bg-gray-100 p-2 rounded">{example.genotype}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl my-8">
                <div className="flex justify-between items-center border-b p-6">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <Calculator size={28} className="text-primary" />
                        Mouse Genetics Calculator
                    </h2>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => setShowExamples(true)}
                            className="bg-accent hover:bg-accent/90 text-white font-semibold px-4 py-2 rounded-lg flex items-center gap-2"
                        >
                            <Book size={18} />
                            Examples
                        </button>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
                            <X size={24} />
                        </button>
                    </div>
                </div>

                <div className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                        {/* Parent 1 */}
                        <div className="border-2 border-primary rounded-lg p-4">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Parent 1</h3>
                            {Object.keys(GENES).map(gene => (
                                <div key={gene} className="mb-3">
                                    <label className="text-sm font-semibold text-gray-700 mb-1 block">
                                        {gene} - {GENES[gene].name}
                                    </label>
                                    <div className="flex gap-2">
                                        <select
                                            value={parent1[gene][0]}
                                            onChange={(e) => updateParentGene(1, gene, 0, e.target.value)}
                                            className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                                        >
                                            {Object.keys(GENES[gene].alleles).map(allele => (
                                                <option key={allele} value={allele}>
                                                    {allele} - {GENES[gene].alleles[allele].name}
                                                </option>
                                            ))}
                                        </select>
                                        <select
                                            value={parent1[gene][1]}
                                            onChange={(e) => updateParentGene(1, gene, 1, e.target.value)}
                                            className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                                        >
                                            {Object.keys(GENES[gene].alleles).map(allele => (
                                                <option key={allele} value={allele}>
                                                    {allele} - {GENES[gene].alleles[allele].name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            ))}
                            <div className="mt-4 p-3 bg-primary/10 rounded-lg">
                                <p className="font-bold text-gray-800">Phenotype:</p>
                                <p className="text-sm">{calculateColor(parent1)}</p>
                            </div>
                        </div>

                        {/* Parent 2 */}
                        <div className="border-2 border-accent rounded-lg p-4">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Parent 2</h3>
                            {Object.keys(GENES).map(gene => (
                                <div key={gene} className="mb-3">
                                    <label className="text-sm font-semibold text-gray-700 mb-1 block">
                                        {gene} - {GENES[gene].name}
                                    </label>
                                    <div className="flex gap-2">
                                        <select
                                            value={parent2[gene][0]}
                                            onChange={(e) => updateParentGene(2, gene, 0, e.target.value)}
                                            className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                                        >
                                            {Object.keys(GENES[gene].alleles).map(allele => (
                                                <option key={allele} value={allele}>
                                                    {allele} - {GENES[gene].alleles[allele].name}
                                                </option>
                                            ))}
                                        </select>
                                        <select
                                            value={parent2[gene][1]}
                                            onChange={(e) => updateParentGene(2, gene, 1, e.target.value)}
                                            className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                                        >
                                            {Object.keys(GENES[gene].alleles).map(allele => (
                                                <option key={allele} value={allele}>
                                                    {allele} - {GENES[gene].alleles[allele].name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            ))}
                            <div className="mt-4 p-3 bg-accent/10 rounded-lg">
                                <p className="font-bold text-gray-800">Phenotype:</p>
                                <p className="text-sm">{calculateColor(parent2)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Offspring Results */}
                    <div className="border-2 border-gray-300 rounded-lg p-4">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Expected Offspring</h3>
                        <p className="text-sm text-gray-600 mb-4">
                            This calculator shows simplified Punnett square results. Colors are approximations based on major genes.
                        </p>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-center text-gray-700">
                                Breeding {calculateColor(parent1)} × {calculateColor(parent2)}
                            </p>
                            <p className="text-sm text-center text-gray-500 mt-2">
                                Full offspring analysis requires complex interaction calculations
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MouseGeneticsCalculator;
