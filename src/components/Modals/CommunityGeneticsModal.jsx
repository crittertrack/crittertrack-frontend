import React, { useState } from 'react';
import axios from 'axios';
import { X, Loader2 } from 'lucide-react';

// ==================== COMMUNITY GENETICS MODAL ====================
const CommunityGeneticsModal = ({ species, onClose, authToken, API_BASE_URL, showModalMessage }) => {
    const [formData, setFormData] = useState({
        genes: '',
        alleles: '',
        phenotypeInfo: '',
        references: '',
        contactEmail: ''
    });
    const [submitting, setSubmitting] = useState(false);
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        
        try {
            await axios.post(
                `${API_BASE_URL}/api/species-genetics-feedback`,
                {
                    species,
                    ...formData,
                    submittedAt: new Date().toISOString()
                },
                { headers: { Authorization: `Bearer ${authToken}` } }
            );
            
            showModalMessage('Thank you for your contribution! Our team will review your submission.');
            onClose();
        } catch (error) {
            console.error('Failed to submit genetics feedback:', error);
            showModalMessage('Failed to submit. Please try again later.', 'error');
        } finally {
            setSubmitting(false);
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-2xl font-bold text-gray-800">
                        Submit Genetics Info for {species}
                    </h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X size={24} />
                    </button>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg mb-6">
                    <p className="text-sm text-blue-900">
                        Help us build a comprehensive genetics database! Share your knowledge about {species} genetics.
                        Your submission may be used to create a visual builder for this species.
                    </p>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            What genes/loci exist for {species}? *
                        </label>
                        <textarea
                            required
                            value={formData.genes}
                            onChange={(e) => setFormData(prev => ({ ...prev, genes: e.target.value }))}
                            placeholder="e.g., A (Agouti), B (Brown), C (Albino), D (Dilution)..."
                            className="w-full p-2 border border-gray-300 rounded focus:ring-primary focus:border-primary"
                            rows="3"
                        />
                        <p className="text-xs text-gray-500 mt-1">List the gene loci and their names</p>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            What are the possible allele combinations? *
                        </label>
                        <textarea
                            required
                            value={formData.alleles}
                            onChange={(e) => setFormData(prev => ({ ...prev, alleles: e.target.value }))}
                            placeholder="e.g., A: A/A, A/a, a/a&#10;B: B/B, B/b, b/b&#10;C: C/C, C/c, c/c, ch/ch, C/ch, c/ch..."
                            className="w-full p-2 border border-gray-300 rounded focus:ring-primary focus:border-primary font-mono text-sm"
                            rows="5"
                        />
                        <p className="text-xs text-gray-500 mt-1">List all valid allele combinations for each gene</p>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Phenotype information (optional)
                        </label>
                        <textarea
                            value={formData.phenotypeInfo}
                            onChange={(e) => setFormData(prev => ({ ...prev, phenotypeInfo: e.target.value }))}
                            placeholder="e.g., A/A = Agouti color, a/a = Non-agouti/Black..."
                            className="w-full p-2 border border-gray-300 rounded focus:ring-primary focus:border-primary"
                            rows="4"
                        />
                        <p className="text-xs text-gray-500 mt-1">Describe what each genotype looks like</p>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            References or sources (optional)
                        </label>
                        <textarea
                            value={formData.references}
                            onChange={(e) => setFormData(prev => ({ ...prev, references: e.target.value }))}
                            placeholder="e.g., Books, websites, breeding clubs, scientific papers..."
                            className="w-full p-2 border border-gray-300 rounded focus:ring-primary focus:border-primary"
                            rows="2"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Contact email (optional)
                        </label>
                        <input
                            type="email"
                            value={formData.contactEmail}
                            onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
                            placeholder="your@email.com"
                            className="w-full p-2 border border-gray-300 rounded focus:ring-primary focus:border-primary"
                        />
                        <p className="text-xs text-gray-500 mt-1">In case we have questions about your submission</p>
                    </div>
                    
                    <div className="flex gap-3 pt-4">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition flex items-center justify-center gap-2"
                        >
                            {submitting ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                'Submit Genetics Info'
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 rounded-lg transition"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export { CommunityGeneticsModal };
