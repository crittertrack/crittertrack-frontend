import React, { useState } from 'react';
import axios from 'axios';
import { Loader2 } from 'lucide-react';

const FEATURE_OPTIONS = [
    'My Animals (main list)', 'Collections', 'Enclosures',
    'Animal Care (Reproduction, Health, Feeding & Care)', 'Litter Management',
    'Budget Tracker', 'Marketplace', 'Community', 'Calendar',
    'Tools (Offspring/COI/Target Outcome Calculators, Family Tree Explorer)', 'Other'
];
const SPECIES_OPTIONS = [
    'Mammal (Mice, Rats, Hamsters, Guinea Pigs, etc.)',
    'Reptile (Snakes, Geckos, Bearded Dragons, etc.)',
    'Bird (Budgies, Cockatiels, Parrots, etc.)',
    'Fish (Bettas, Guppies, Goldfish, etc.)',
    'Invertebrate (Tarantulas, Isopods, Mantises, etc.)',
    'Amphibian (Axolotls, Frogs, Salamanders, etc.)',
    'Multiple categories', 'Other'
];
const DEVICE_OPTIONS = ['Desktop', 'Phone', 'Tablet', 'Mix'];
const PRIOR_SOLUTION_OPTIONS = ['Spreadsheet', 'Paper or notebook', 'Another app', 'Nothing formal'];
const HOW_HEARD_OPTIONS = ['Social media', 'Friend or referral', 'Forum or community', 'Search', 'Other'];

const StarRating = ({ value, onChange }) => (
    <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(n => (
            <button
                key={n}
                type="button"
                onClick={() => onChange(n)}
                aria-label={`${n} star${n > 1 ? 's' : ''}`}
                className={`text-2xl leading-none transition ${
                    n <= value ? 'text-yellow-400' : 'text-gray-300 dark:text-dark-border'
                } hover:text-yellow-400`}
            >
                ★
            </button>
        ))}
    </div>
);

const ChoiceGroup = ({ options, value, onChange }) => (
    <div className="flex flex-wrap gap-2">
        {options.map(opt => (
            <button
                key={opt}
                type="button"
                onClick={() => onChange(opt)}
                className={`px-3 py-1.5 rounded-full text-xs sm:text-sm border transition ${
                    value === opt
                        ? 'bg-accent dark:bg-dark-accent text-white border-accent dark:border-dark-accent'
                        : 'bg-white dark:bg-dark-surface text-gray-700 dark:text-dark-text-secondary border-gray-300 dark:border-dark-border hover:border-accent dark:hover:border-dark-accent'
                }`}
            >
                {opt}
            </button>
        ))}
    </div>
);

const Question = ({ number, text, children }) => (
    <div className="border-b border-gray-100 dark:border-dark-border pb-3 sm:pb-4 last:border-b-0 last:pb-0">
        <p className="text-xs sm:text-sm font-semibold text-gray-800 dark:text-dark-text mb-2">
            {number}. {text}
        </p>
        {children}
    </div>
);

const textAreaClass = "w-full text-xs sm:text-sm rounded-lg border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-surface text-gray-800 dark:text-dark-text placeholder-gray-400 dark:placeholder-dark-text-muted p-2 focus:outline-none focus:ring-2 focus:ring-accent dark:focus:ring-dark-accent resize-none";

const BetaSurveyModal = ({ API_BASE_URL, authToken, onClose }) => {
    const [submitting, setSubmitting] = useState(false);
    const [skipping, setSkipping] = useState(false);
    const [dismissing, setDismissing] = useState(false);
    const [answers, setAnswers] = useState({
        q1_overallSatisfaction: 0,
        q2_mostUsedFeature: '',
        q3_mostConfusingFeature: '',
        q4_appSpeed: 0,
        q5_easeOfNavigation: 0,
        q6_visualDesign: 0,
        q7_primarySpecies: '',
        q8_primaryDevice: '',
        q9_priorSolution: '',
        q9_priorSolutionOther: '',
        q10_howHeard: '',
        q11_likelihoodToRecommend: 0,
        q12_likelyToKeepUsing: 0,
        q13_bugsIssues: '',
        q14_magicWandFeature: '',
        q15_anythingElse: ''
    });

    const busy = submitting || skipping || dismissing;
    const authHeader = { headers: { Authorization: `Bearer ${authToken}` } };

    const set = (key) => (value) => setAnswers(prev => ({ ...prev, [key]: value }));

    const handleSkip = async () => {
        setSkipping(true);
        try {
            await axios.post(`${API_BASE_URL}/beta-survey/skip`, {}, authHeader);
        } catch (error) {
            console.error('[BETA SURVEY] Failed to skip:', error);
        } finally {
            setSkipping(false);
            onClose();
        }
    };

    const handleDismiss = async () => {
        setDismissing(true);
        try {
            await axios.post(`${API_BASE_URL}/beta-survey/dismiss`, {}, authHeader);
        } catch (error) {
            console.error('[BETA SURVEY] Failed to dismiss:', error);
        } finally {
            setDismissing(false);
            onClose();
        }
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            const payload = { ...answers };
            // Send 0-value stars as null (not answered)
            ['q1_overallSatisfaction', 'q4_appSpeed', 'q5_easeOfNavigation', 'q6_visualDesign', 'q11_likelihoodToRecommend', 'q12_likelyToKeepUsing']
                .forEach(key => { if (!payload[key]) payload[key] = null; });
            Object.keys(payload).forEach(key => { if (payload[key] === '') payload[key] = null; });

            await axios.post(`${API_BASE_URL}/beta-survey/submit`, payload, authHeader);
        } catch (error) {
            console.error('[BETA SURVEY] Failed to submit:', error);
        } finally {
            setSubmitting(false);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-white dark:bg-dark-card-bg rounded-lg shadow-xl max-w-5xl w-full max-h-[95vh] sm:max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="bg-gradient-to-r from-accent to-primary dark:from-dark-accent dark:to-dark-primary text-white p-3 sm:p-4 rounded-t-lg flex-shrink-0">
                    <h2 className="text-lg sm:text-xl font-bold">Help us wrap up the beta! 📝</h2>
                    <p className="text-xs sm:text-sm text-white/90">A few quick questions — everything here is optional.</p>
                </div>

                {/* Content - Scrollable */}
                <div className="p-3 sm:p-5 space-y-3 sm:space-y-4 overflow-y-auto flex-1">
                    <Question number={1} text="Overall satisfaction">
                        <StarRating value={answers.q1_overallSatisfaction} onChange={set('q1_overallSatisfaction')} />
                    </Question>

                    <Question number={2} text="Most-used feature">
                        <ChoiceGroup options={FEATURE_OPTIONS} value={answers.q2_mostUsedFeature} onChange={set('q2_mostUsedFeature')} />
                    </Question>

                    <Question number={3} text="Most confusing feature">
                        <ChoiceGroup options={[...FEATURE_OPTIONS, 'None']} value={answers.q3_mostConfusingFeature} onChange={set('q3_mostConfusingFeature')} />
                    </Question>

                    <Question number={4} text="App speed/responsiveness">
                        <StarRating value={answers.q4_appSpeed} onChange={set('q4_appSpeed')} />
                    </Question>

                    <Question number={5} text="Ease of navigation/intuitiveness">
                        <StarRating value={answers.q5_easeOfNavigation} onChange={set('q5_easeOfNavigation')} />
                    </Question>

                    <Question number={6} text="Visual design/look & feel">
                        <StarRating value={answers.q6_visualDesign} onChange={set('q6_visualDesign')} />
                    </Question>

                    <Question number={7} text="Primary species managed">
                        <ChoiceGroup options={SPECIES_OPTIONS} value={answers.q7_primarySpecies} onChange={set('q7_primarySpecies')} />
                    </Question>

                    <Question number={8} text="Primary device">
                        <ChoiceGroup options={DEVICE_OPTIONS} value={answers.q8_primaryDevice} onChange={set('q8_primaryDevice')} />
                    </Question>

                    <Question number={9} text="What did you use before CritterTrack?">
                        <ChoiceGroup options={PRIOR_SOLUTION_OPTIONS} value={answers.q9_priorSolution} onChange={set('q9_priorSolution')} />
                        {answers.q9_priorSolution === 'Another app' && (
                            <input
                                type="text"
                                value={answers.q9_priorSolutionOther}
                                onChange={(e) => set('q9_priorSolutionOther')(e.target.value)}
                                placeholder="Which app?"
                                className="mt-2 w-full text-xs sm:text-sm rounded-lg border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-surface text-gray-800 dark:text-dark-text placeholder-gray-400 dark:placeholder-dark-text-muted px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-accent dark:focus:ring-dark-accent"
                            />
                        )}
                    </Question>

                    <Question number={10} text="How did you hear about CritterTrack?">
                        <ChoiceGroup options={HOW_HEARD_OPTIONS} value={answers.q10_howHeard} onChange={set('q10_howHeard')} />
                    </Question>

                    <Question number={11} text="Likelihood to recommend">
                        <StarRating value={answers.q11_likelihoodToRecommend} onChange={set('q11_likelihoodToRecommend')} />
                    </Question>

                    <Question number={12} text="Likely to keep using after beta">
                        <StarRating value={answers.q12_likelyToKeepUsing} onChange={set('q12_likelyToKeepUsing')} />
                    </Question>

                    <Question number={13} text="Any bugs or issues you ran into?">
                        <textarea
                            rows={2}
                            value={answers.q13_bugsIssues}
                            onChange={(e) => set('q13_bugsIssues')(e.target.value)}
                            placeholder="Optional"
                            className={textAreaClass}
                        />
                    </Question>

                    <Question number={14} text="If you could wave a magic wand and add ONE thing to CritterTrack, no matter how unrealistic/impossible it might seem, what would it be?">
                        <textarea
                            rows={2}
                            value={answers.q14_magicWandFeature}
                            onChange={(e) => set('q14_magicWandFeature')(e.target.value)}
                            placeholder="Optional"
                            className={textAreaClass}
                        />
                    </Question>

                    <Question number={15} text="Anything else?">
                        <textarea
                            rows={2}
                            value={answers.q15_anythingElse}
                            onChange={(e) => set('q15_anythingElse')(e.target.value)}
                            placeholder="Optional"
                            className={textAreaClass}
                        />
                    </Question>

                    {/* Action Buttons - Sticky for mobile */}
                    <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2 sm:pt-1 sticky bottom-0 bg-white dark:bg-dark-card-bg pb-2 sm:pb-0 sm:static">
                        <button
                            type="button"
                            onClick={handleDismiss}
                            disabled={busy}
                            className="px-4 py-2.5 text-gray-600 dark:text-dark-text-secondary hover:bg-gray-100 dark:hover:bg-dark-surface-hover rounded-lg transition font-medium text-sm disabled:opacity-50"
                        >
                            Do not show again
                        </button>
                        <button
                            type="button"
                            onClick={handleSkip}
                            disabled={busy}
                            className="px-4 py-2.5 border border-gray-300 dark:border-dark-border text-gray-700 dark:text-dark-text rounded-lg hover:bg-gray-50 dark:hover:bg-dark-surface-hover transition font-medium text-sm disabled:opacity-50"
                        >
                            Skip for now
                        </button>
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={busy}
                            className="px-4 sm:px-6 py-2.5 bg-accent dark:bg-dark-accent text-white rounded-lg hover:bg-accent/90 dark:hover:bg-dark-accent/90 transition font-medium text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {submitting ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    <span>Submitting...</span>
                                </>
                            ) : (
                                'Finished'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BetaSurveyModal;
