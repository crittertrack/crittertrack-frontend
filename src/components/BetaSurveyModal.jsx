import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Loader2, Heart, Sparkles, MessageSquare } from 'lucide-react';

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
    'Other'
];
const DEVICE_OPTIONS = ['Desktop', 'Phone', 'Tablet', 'Mix'];
const PRIOR_SOLUTION_OPTIONS = ['Spreadsheet', 'Paper or notebook', 'Another app', 'Nothing formal'];
const HOW_HEARD_OPTIONS = ['Social media', 'Friend or referral', 'Forum or community', 'Search', 'Other'];

// Question metadata, keyed by the field name sent to the backend
const QUESTIONS_META = {
    q1_overallSatisfaction: { number: 1, type: 'star', text: 'Overall, how satisfied are you with CritterTrack?' },
    q2_mostUsedFeature: { number: 2, type: 'choice', multiple: true, text: 'Which features do you use the most?', options: FEATURE_OPTIONS },
    q3_mostConfusingFeature: { number: 3, type: 'choice', multiple: true, exclusiveOption: 'None', text: 'Which features do you find most confusing or hardest to use?', options: [...FEATURE_OPTIONS, 'None'] },
    q4_appSpeed: { number: 4, type: 'star', text: "How would you rate the app's speed and responsiveness?" },
    q5_easeOfNavigation: { number: 5, type: 'star', text: 'How easy is it to navigate and find what you need?' },
    q6_visualDesign: { number: 6, type: 'star', text: 'How would you rate the visual design and overall look & feel?' },
    q7_primarySpecies: { number: 7, type: 'choice', multiple: true, text: 'What types of animals do you manage?', options: SPECIES_OPTIONS },
    q8_primaryDevice: { number: 8, type: 'choice', text: 'What device do you primarily use CritterTrack on?', options: DEVICE_OPTIONS },
    q9_priorSolution: { number: 9, type: 'choice', multiple: true, hasOther: true, text: 'What did you use to track your animals before CritterTrack?', options: PRIOR_SOLUTION_OPTIONS },
    q10_howHeard: { number: 10, type: 'choice', text: 'How did you hear about CritterTrack?', options: HOW_HEARD_OPTIONS },
    q11_likelihoodToRecommend: { number: 11, type: 'star', text: 'How likely are you to recommend CritterTrack to a friend?' },
    q12_likelyToKeepUsing: { number: 12, type: 'star', text: 'How likely are you to keep using CritterTrack after the beta ends?' },
    q13_bugsIssues: { number: 13, type: 'text', text: 'Did you run into any bugs or issues? If so, please describe them.' },
    q14_magicWandFeature: { number: 14, type: 'text', text: 'If you could wave a magic wand and add ONE thing to CritterTrack, no matter how unrealistic/impossible it might seem, what would it be?' },
    q15_anythingElse: { number: 15, type: 'text', text: "Is there anything else you'd like to share with us?" }
};

// Ratings grouped 3-per-page (2 pages), then multiple choice and free text each get their own page
const PAGES = [
    ['q1_overallSatisfaction', 'q4_appSpeed', 'q5_easeOfNavigation'],
    ['q6_visualDesign', 'q11_likelihoodToRecommend', 'q12_likelyToKeepUsing'],
    ['q2_mostUsedFeature'],
    ['q3_mostConfusingFeature'],
    ['q7_primarySpecies'],
    ['q8_primaryDevice'],
    ['q9_priorSolution'],
    ['q10_howHeard'],
    ['q13_bugsIssues'],
    ['q14_magicWandFeature'],
    ['q15_anythingElse']
];

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

const RadioList = ({ options, value, onChange }) => (
    <div className="space-y-1.5">
        {options.map(opt => (
            <label
                key={opt}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border cursor-pointer transition text-xs sm:text-sm ${
                    value === opt
                        ? 'border-accent dark:border-dark-accent bg-accent/5 dark:bg-dark-accent/10'
                        : 'border-gray-200 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-surface-hover'
                }`}
            >
                <input
                    type="radio"
                    checked={value === opt}
                    onChange={() => onChange(opt)}
                    className="w-4 h-4 accent-accent dark:accent-dark-accent flex-shrink-0"
                />
                <span className="text-gray-700 dark:text-dark-text">{opt}</span>
            </label>
        ))}
    </div>
);

const CheckboxList = ({ options, values, onChange, exclusiveOption }) => {
    const toggle = (opt) => {
        if (exclusiveOption && opt === exclusiveOption) {
            onChange(values.includes(opt) ? [] : [opt]);
            return;
        }
        const withoutExclusive = exclusiveOption ? values.filter(v => v !== exclusiveOption) : values;
        onChange(
            withoutExclusive.includes(opt)
                ? withoutExclusive.filter(v => v !== opt)
                : [...withoutExclusive, opt]
        );
    };
    return (
        <div className="space-y-1.5">
            {options.map(opt => (
                <label
                    key={opt}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border cursor-pointer transition text-xs sm:text-sm ${
                        values.includes(opt)
                            ? 'border-accent dark:border-dark-accent bg-accent/5 dark:bg-dark-accent/10'
                            : 'border-gray-200 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-surface-hover'
                    }`}
                >
                    <input
                        type="checkbox"
                        checked={values.includes(opt)}
                        onChange={() => toggle(opt)}
                        className="w-4 h-4 rounded accent-accent dark:accent-dark-accent flex-shrink-0"
                    />
                    <span className="text-gray-700 dark:text-dark-text">{opt}</span>
                </label>
            ))}
        </div>
    );
};

const textAreaClass = "w-full text-xs sm:text-sm rounded-lg border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-surface text-gray-800 dark:text-dark-text placeholder-gray-400 dark:placeholder-dark-text-muted p-2 focus:outline-none focus:ring-2 focus:ring-accent dark:focus:ring-dark-accent resize-none";

const QuestionCard = ({ meta, value, onChange, otherValue, onOtherChange }) => (
    <div className="bg-gray-50 dark:bg-dark-surface rounded-xl border border-gray-100 dark:border-dark-border p-3 sm:p-4">
        <div className="flex items-start gap-2.5 mb-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent dark:bg-dark-accent text-white text-xs font-bold flex items-center justify-center">
                {meta.number}
            </span>
            <div className="pt-0.5">
                <p className="text-xs sm:text-sm font-semibold text-gray-800 dark:text-dark-text">{meta.text}</p>
                {meta.type === 'choice' && (
                    <p className="text-[11px] text-gray-400 dark:text-dark-text-muted mt-0.5">
                        {meta.multiple ? 'Multiple choice — select all that apply' : 'Multiple choice — select one'}
                    </p>
                )}
            </div>
        </div>

        {meta.type === 'star' && <StarRating value={value} onChange={onChange} />}

        {meta.type === 'choice' && (
            <>
                {meta.multiple ? (
                    <CheckboxList options={meta.options} values={value} onChange={onChange} exclusiveOption={meta.exclusiveOption} />
                ) : (
                    <RadioList options={meta.options} value={value} onChange={onChange} />
                )}
                {meta.hasOther && (meta.multiple ? value.includes('Another app') : value === 'Another app') && (
                    <input
                        type="text"
                        value={otherValue}
                        onChange={(e) => onOtherChange(e.target.value)}
                        placeholder="Which app?"
                        className="mt-2 w-full text-xs sm:text-sm rounded-lg border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-surface text-gray-800 dark:text-dark-text placeholder-gray-400 dark:placeholder-dark-text-muted px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-accent dark:focus:ring-dark-accent"
                    />
                )}
            </>
        )}

        {meta.type === 'text' && (
            <textarea
                rows={2}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Optional"
                className={textAreaClass}
            />
        )}
    </div>
);

const BetaSurveyModal = ({ API_BASE_URL, authToken, onClose }) => {
    const [phase, setPhase] = useState('intro'); // 'intro' | 'survey'
    const [pageIndex, setPageIndex] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [skipping, setSkipping] = useState(false);
    const [dismissing, setDismissing] = useState(false);
    const [answers, setAnswers] = useState({
        q1_overallSatisfaction: 0,
        q2_mostUsedFeature: [],
        q3_mostConfusingFeature: [],
        q4_appSpeed: 0,
        q5_easeOfNavigation: 0,
        q6_visualDesign: 0,
        q7_primarySpecies: [],
        q8_primaryDevice: '',
        q9_priorSolution: [],
        q9_priorSolutionOther: '',
        q10_howHeard: '',
        q11_likelihoodToRecommend: 0,
        q12_likelyToKeepUsing: 0,
        q13_bugsIssues: '',
        q14_magicWandFeature: '',
        q15_anythingElse: ''
    });

    const [communityStats, setCommunityStats] = useState(null);
    useEffect(() => {
        axios.get(`${API_BASE_URL}/public/community-stats`)
            .then(res => setCommunityStats(res.data))
            .catch(err => console.error('[BETA SURVEY] Failed to fetch community stats:', err));
    }, [API_BASE_URL]);

    const contentRef = useRef(null);
    useEffect(() => {
        if (contentRef.current) contentRef.current.scrollTop = 0;
    }, [phase, pageIndex]);

    const busy = submitting || skipping || dismissing;
    const authHeader = { headers: { Authorization: `Bearer ${authToken}` } };
    const isLastPage = pageIndex === PAGES.length - 1;

    const set = (key) => (value) => setAnswers(prev => ({ ...prev, [key]: value }));

    const isAnswered = (key) => {
        const meta = QUESTIONS_META[key];
        const value = answers[key];
        if (meta.type === 'star') return value > 0;
        if (meta.type === 'text') return true;
        if (meta.multiple) {
            if (!Array.isArray(value) || value.length === 0) return false;
            if (meta.hasOther && value.includes('Another app')) return answers.q9_priorSolutionOther.trim() !== '';
            return true;
        }
        if (meta.hasOther && value === 'Another app') return answers.q9_priorSolutionOther.trim() !== '';
        return value !== '';
    };
    const isPageComplete = PAGES[pageIndex].every(isAnswered);

    const handleStart = () => {
        setPhase('survey');
        setPageIndex(0);
    };

    const handleBack = () => setPageIndex(i => Math.max(0, i - 1));
    const handleNext = () => setPageIndex(i => Math.min(PAGES.length - 1, i + 1));

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
            <div className="bg-white dark:bg-dark-card-bg rounded-lg shadow-xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="bg-gradient-to-r from-accent to-primary dark:from-dark-accent dark:to-dark-primary text-white p-3 sm:p-4 rounded-t-lg flex-shrink-0">
                    <h2 className="text-lg sm:text-xl font-bold">CritterTrack Final Beta Survey 📝</h2>
                    <p className="text-xs sm:text-sm text-white/90">A few quick questions to help us wrap up the beta.</p>
                </div>

                {/* Content - Scrollable */}
                <div ref={contentRef} className="p-3 sm:p-5 overflow-y-auto flex-1">
                    {phase === 'intro' && (
                        <div className="py-2 sm:py-3 space-y-3 sm:space-y-4">
                            <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-dark-accent-purple-bg dark:to-dark-accent-purple-bg border border-purple-200 dark:border-dark-accent-purple/40 rounded-lg p-3 sm:p-4">
                                <div className="flex gap-2.5 sm:gap-3 items-start">
                                    <Heart className="text-purple-600 dark:text-dark-accent-purple flex-shrink-0" size={20} />
                                    <div>
                                        <h3 className="font-semibold text-gray-800 dark:text-dark-text text-xs sm:text-sm mb-1">Thank you for testing CritterTrack!</h3>
                                        <p className="text-xs sm:text-sm text-gray-600 dark:text-dark-text-secondary leading-relaxed">
                                            Every animal you've logged, every bug you've reported, and every bit of
                                            patience with a work-in-progress app has directly shaped what CritterTrack
                                            has become. We couldn't have gotten this far without people like you.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-blue-50 dark:bg-dark-info-blue/20 border-l-4 border-blue-500 dark:border-dark-info-blue rounded p-3 sm:p-4">
                                <div className="flex gap-2.5 sm:gap-3 items-start">
                                    <Sparkles className="text-blue-500 dark:text-dark-info-blue flex-shrink-0" size={20} />
                                    <div>
                                        <h3 className="font-semibold text-gray-800 dark:text-dark-text text-xs sm:text-sm mb-1.5">Fun facts about CritterTrack</h3>
                                        <ul className="text-xs sm:text-sm text-gray-600 dark:text-dark-text-secondary leading-relaxed space-y-1 list-disc list-inside">
                                            {communityStats && (
                                                <>
                                                    <li>{communityStats.totalUsers.toLocaleString()}+ animal keepers have joined CritterTrack</li>
                                                    <li>{communityStats.totalAnimals.toLocaleString()}+ animals logged so far, across {communityStats.totalCountries} countries</li>
                                                </>
                                            )}
                                            <li>70+ species supported across 6 categories — from Fancy Mice to Ball Pythons to Axolotls</li>
                                            <li>10 major tool areas, including genetics calculators and a full Family Tree Explorer</li>
                                            <li>You're one of the first people to ever use this app — beta testers shape the whole roadmap</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gradient-to-r from-accent/10 to-primary/10 dark:from-dark-accent/20 dark:to-dark-primary/20 border border-accent/20 dark:border-dark-accent/30 rounded-lg p-3 sm:p-4">
                                <div className="flex gap-2.5 sm:gap-3 items-start">
                                    <MessageSquare className="text-accent dark:text-dark-accent flex-shrink-0" size={20} />
                                    <div>
                                        <h3 className="font-semibold text-gray-800 dark:text-dark-text text-xs sm:text-sm mb-1">What happens with your answers?</h3>
                                        <p className="text-xs sm:text-sm text-gray-600 dark:text-dark-text-secondary leading-relaxed">
                                            Your ratings and comments go straight into planning what gets polished or
                                            built next. It only takes a couple of minutes — the ratings and multiple-
                                            choice questions help us the most, and the open-ended questions at the end
                                            are optional if you're short on time.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {phase === 'survey' && (
                        <>
                            {/* Progress bar */}
                            <div className="mb-4">
                                <div className="flex justify-between text-xs text-gray-500 dark:text-dark-text-secondary mb-1">
                                    <span>Page {pageIndex + 1} of {PAGES.length}</span>
                                </div>
                                <div className="w-full h-1.5 bg-gray-200 dark:bg-dark-surface rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-accent dark:bg-dark-accent rounded-full transition-all duration-300"
                                        style={{ width: `${((pageIndex + 1) / PAGES.length) * 100}%` }}
                                    />
                                </div>
                            </div>

                            <div className="space-y-3 sm:space-y-4">
                                {PAGES[pageIndex].map(key => (
                                    <QuestionCard
                                        key={key}
                                        meta={QUESTIONS_META[key]}
                                        value={answers[key]}
                                        onChange={set(key)}
                                        otherValue={answers.q9_priorSolutionOther}
                                        onOtherChange={set('q9_priorSolutionOther')}
                                    />
                                ))}
                            </div>

                            {!isPageComplete && (
                                <p className="text-xs text-amber-600 dark:text-dark-accent-purple mt-2 sm:mt-3">
                                    Please answer every question above to continue.
                                </p>
                            )}
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="border-t border-gray-100 dark:border-dark-border p-3 sm:p-4 flex-shrink-0">
                    {phase === 'intro' ? (
                        <div className="flex flex-col sm:flex-row justify-end gap-2">
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
                                onClick={handleStart}
                                disabled={busy}
                                className="px-4 sm:px-6 py-2.5 bg-accent dark:bg-dark-accent text-white rounded-lg hover:bg-accent/90 dark:hover:bg-dark-accent/90 transition font-medium text-sm disabled:opacity-50"
                            >
                                Start Survey
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center justify-between gap-2">
                            <button
                                type="button"
                                onClick={handleDismiss}
                                disabled={busy}
                                className="text-xs text-gray-400 dark:text-dark-text-muted hover:underline disabled:opacity-50"
                            >
                                Do not show again
                            </button>
                            <div className="flex items-center gap-2">
                                {pageIndex > 0 && (
                                    <button
                                        type="button"
                                        onClick={handleBack}
                                        disabled={busy}
                                        className="px-3 sm:px-4 py-2.5 border border-gray-300 dark:border-dark-border text-gray-700 dark:text-dark-text rounded-lg hover:bg-gray-50 dark:hover:bg-dark-surface-hover transition font-medium text-sm disabled:opacity-50"
                                    >
                                        Back
                                    </button>
                                )}
                                {isLastPage ? (
                                    <button
                                        type="button"
                                        onClick={handleSubmit}
                                        disabled={busy || !isPageComplete}
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
                                ) : (
                                    <button
                                        type="button"
                                        onClick={handleNext}
                                        disabled={busy || !isPageComplete}
                                        className="px-4 sm:px-6 py-2.5 bg-accent dark:bg-dark-accent text-white rounded-lg hover:bg-accent/90 dark:hover:bg-dark-accent/90 transition font-medium text-sm disabled:opacity-50"
                                    >
                                        Next
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BetaSurveyModal;
