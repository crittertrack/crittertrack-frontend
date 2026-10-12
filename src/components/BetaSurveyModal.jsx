import React, { useEffect, useState } from 'react';
import { AlertCircle, ClipboardList, Loader2, MessageSquare } from 'lucide-react';
import apiClient from '../utils/apiClient';

const AREAS = [
    'My Animals (main list)', 'Collections', 'Enclosures',
    'Animal Care (Reproduction, Health, Feeding & Care)', 'Litter Management',
    'Budget Tracker', 'Marketplace', 'Community', 'Calendar',
    'Tools (calculators and family trees)', 'Other', 'Nothing was difficult'
];
const DIFFICULTIES = [
    'Finding where to start', 'Understanding a term or label',
    'Understanding how sections connect', 'Entering or editing information',
    'Understanding a result', 'Something else'
];
const SUPPORT_OPTIONS = [
    'A short guided checklist', 'Step-by-step examples',
    'Clearer explanations in the app', 'Something else', 'No extra help needed'
];

const ChoiceGroup = ({ label, value, options, onChange, required = false }) => (
    <fieldset>
        <legend className="mb-2 text-sm font-semibold text-gray-800 dark:text-dark-text">
            {label}{required ? ' *' : ' (optional)'}
        </legend>
        <div className="space-y-1.5">
            {options.map(option => (
                <label
                    key={option}
                    className={`flex cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2 text-sm transition ${
                        value === option
                            ? 'border-accent bg-accent/5 dark:border-dark-accent dark:bg-dark-accent/10'
                            : 'border-gray-200 hover:bg-gray-50 dark:border-dark-border dark:hover:bg-dark-surface-hover'
                    }`}
                >
                    <input
                        type="radio"
                        name={label}
                        checked={value === option}
                        onChange={() => onChange(option)}
                        className="h-4 w-4 accent-accent dark:accent-dark-accent"
                    />
                    <span className="text-gray-700 dark:text-dark-text">{option}</span>
                </label>
            ))}
        </div>
    </fieldset>
);

const BetaSurveyModal = ({ onClose }) => {
    const [context, setContext] = useState(null);
    const [loadingContext, setLoadingContext] = useState(true);
    const [contextError, setContextError] = useState('');
    const [phase, setPhase] = useState('summary');
    const [answers, setAnswers] = useState({
        difficultArea: '',
        difficultyType: '',
        expectedVsActual: '',
        helpfulSupport: '',
        stillHappening: '',
        additionalDetail: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [busyAction, setBusyAction] = useState('');
    const [error, setError] = useState('');
    const hasPriorResponse = Boolean(context?.previousSummary);
    const needsDifficulty = answers.difficultArea && answers.difficultArea !== 'Nothing was difficult';
    const busy = submitting || Boolean(busyAction);

    useEffect(() => {
        let active = true;
        apiClient.get('/beta-survey/followup/context')
            .then(response => {
                if (active) setContext(response.data);
            })
            .catch(err => {
                console.error('[BETA SURVEY FOLLOW-UP] Failed to load context:', err);
                if (active) setContextError('Could not load the survey right now. Please close it and try again.');
            })
            .finally(() => {
                if (active) setLoadingContext(false);
            });
        return () => { active = false; };
    }, []);

    const updateAnswer = (key, value) => {
        setAnswers(previous => ({ ...previous, [key]: value }));
        setError('');
    };

    const handleStatusAction = async (action) => {
        setBusyAction(action);
        setError('');
        try {
            await apiClient.post(`/beta-survey/followup/${action}`, {});
            onClose();
        } catch (err) {
            console.error(`[BETA SURVEY FOLLOW-UP] Failed to ${action}:`, err);
            setError(err.response?.data?.message || 'Could not save your choice. Please try again.');
        } finally {
            setBusyAction('');
        }
    };

    const handleSubmit = async () => {
        if (!answers.difficultArea || (needsDifficulty && !answers.difficultyType)) {
            setError('Please answer the required questions before submitting.');
            return;
        }
        setSubmitting(true);
        setError('');
        try {
            await apiClient.post('/beta-survey/followup/submit', {
                ...answers,
                difficultyType: answers.difficultyType || null,
                helpfulSupport: answers.helpfulSupport || null,
                stillHappening: answers.stillHappening || null,
                expectedVsActual: answers.expectedVsActual.trim() || null,
                additionalDetail: answers.additionalDetail.trim() || null,
            });
            onClose();
        } catch (err) {
            console.error('[BETA SURVEY FOLLOW-UP] Failed to submit:', err);
            setError(err.response?.data?.message || 'Could not submit your answers. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const previousSummary = context?.previousSummary;

    return (
        <div className="fixed inset-0 z-[10020] flex items-center justify-center bg-black/50 p-2 sm:p-4">
            <section
                role="dialog"
                aria-modal="true"
                aria-labelledby="beta-followup-title"
                className="flex max-h-[95vh] w-full max-w-xl flex-col rounded-xl bg-white shadow-xl dark:bg-dark-card-bg"
            >
                <header className="flex-shrink-0 rounded-t-xl bg-gradient-to-r from-accent to-primary p-4 text-white dark:from-dark-accent dark:to-dark-primary">
                    <h2 id="beta-followup-title" className="flex items-center gap-2 text-lg font-bold">
                        <ClipboardList size={20} />
                        A quick CritterTrack follow-up
                    </h2>
                    <p className="mt-1 text-sm text-white/90">A few short questions to make the app easier to understand.</p>
                </header>

                <div className="space-y-4 overflow-y-auto p-4 sm:p-5">
                    {loadingContext && (
                        <div className="flex items-center gap-2 py-6 text-sm text-gray-500 dark:text-dark-text-secondary">
                            <Loader2 size={18} className="animate-spin" /> Loading your survey…
                        </div>
                    )}
                    {!loadingContext && contextError && (
                        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
                            <AlertCircle size={17} className="mt-0.5 shrink-0" />{contextError}
                        </div>
                    )}
                    {!loadingContext && !contextError && phase === 'summary' && (
                        <div className="space-y-4">
                            <p className="text-sm leading-relaxed text-gray-700 dark:text-dark-text">
                                {hasPriorResponse
                                    ? 'Thanks for sharing feedback before. This new, shorter survey follows up on what you told us.'
                                    : 'We are collecting feedback to make CritterTrack easier to understand. This short survey takes about a minute.'}
                            </p>
                            {hasPriorResponse && (
                                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-dark-info-blue/40 dark:bg-dark-info-blue/10">
                                    <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-dark-text">
                                        <MessageSquare size={16} /> Your previous feedback
                                    </h3>
                                    <div className="space-y-2 text-sm text-gray-700 dark:text-dark-text">
                                        {previousSummary.confusingFeatures?.length > 0 && (
                                            <p><strong>Areas you marked as confusing:</strong> {previousSummary.confusingFeatures.join(', ')}</p>
                                        )}
                                        {previousSummary.bugsIssues && (
                                            <p><strong>Issue you mentioned:</strong> {previousSummary.bugsIssues}</p>
                                        )}
                                        {previousSummary.featureSuggestion && (
                                            <p><strong>Feature idea you shared:</strong> {previousSummary.featureSuggestion}</p>
                                        )}
                                        {previousSummary.additionalComment && (
                                            <p><strong>Other comment:</strong> {previousSummary.additionalComment}</p>
                                        )}
                                        {!previousSummary.confusingFeatures?.length &&
                                            !previousSummary.bugsIssues &&
                                            !previousSummary.featureSuggestion &&
                                            !previousSummary.additionalComment && (
                                                <p>You completed the earlier survey. You did not leave any written answers for this recap.</p>
                                            )}
                                    </div>
                                </div>
                            )}
                            {!hasPriorResponse && (
                                <p className="text-sm text-gray-600 dark:text-dark-text-secondary">
                                    This is a new follow-up survey; you do not need to have completed the earlier survey.
                                </p>
                            )}
                            <p className="text-xs text-gray-500 dark:text-dark-text-muted">
                                Your written answers are optional. You can skip this for now or choose not to be asked again.
                            </p>
                        </div>
                    )}
                    {!loadingContext && !contextError && phase === 'questions' && (
                        <div className="space-y-5">
                            <ChoiceGroup
                                label="Which area was hardest to understand?"
                                value={answers.difficultArea}
                                options={AREAS}
                                onChange={value => {
                                    updateAnswer('difficultArea', value);
                                    if (value === 'Nothing was difficult') updateAnswer('difficultyType', '');
                                }}
                                required
                            />
                            {needsDifficulty && (
                                <ChoiceGroup
                                    label="What made it difficult?"
                                    value={answers.difficultyType}
                                    options={DIFFICULTIES}
                                    onChange={value => updateAnswer('difficultyType', value)}
                                    required
                                />
                            )}
                            <label className="block text-sm font-semibold text-gray-800 dark:text-dark-text">
                                What did you expect to happen, and what happened instead? (optional)
                                <textarea
                                    value={answers.expectedVsActual}
                                    onChange={event => updateAnswer('expectedVsActual', event.target.value)}
                                    maxLength={2000}
                                    rows={3}
                                    placeholder="Describe the task and what felt unclear."
                                    className="mt-2 w-full resize-y rounded-lg border border-gray-300 bg-white p-3 text-sm font-normal text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent dark:border-dark-border dark:bg-dark-surface dark:text-dark-text"
                                />
                            </label>
                            <ChoiceGroup
                                label="What would help most?"
                                value={answers.helpfulSupport}
                                options={SUPPORT_OPTIONS}
                                onChange={value => updateAnswer('helpfulSupport', value)}
                            />
                            {answers.helpfulSupport === 'Something else' && (
                                <label className="block text-sm font-semibold text-gray-800 dark:text-dark-text">
                                    What kind of help would you prefer? (optional)
                                    <textarea
                                        value={answers.additionalDetail}
                                        onChange={event => updateAnswer('additionalDetail', event.target.value)}
                                        maxLength={2000}
                                        rows={2}
                                        className="mt-2 w-full resize-y rounded-lg border border-gray-300 bg-white p-3 text-sm font-normal text-gray-800 focus:outline-none focus:ring-2 focus:ring-accent dark:border-dark-border dark:bg-dark-surface dark:text-dark-text"
                                    />
                                </label>
                            )}
                            {answers.difficultArea && answers.difficultArea !== 'Nothing was difficult' && (
                                <ChoiceGroup
                                    label="Is this issue still happening?"
                                    value={answers.stillHappening}
                                    options={['Yes', 'No', 'Not sure']}
                                    onChange={value => updateAnswer('stillHappening', value)}
                                />
                            )}
                        </div>
                    )}
                    {error && (
                        <div role="alert" className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
                            <AlertCircle size={17} className="mt-0.5 shrink-0" />{error}
                        </div>
                    )}
                </div>

                <footer className="flex flex-shrink-0 flex-wrap items-center justify-between gap-2 border-t border-gray-100 p-3 dark:border-dark-border sm:p-4">
                    <button
                        type="button"
                        onClick={() => handleStatusAction('dismiss')}
                        disabled={busy || loadingContext}
                        className="rounded-lg px-2 py-2 text-xs text-gray-500 hover:underline disabled:opacity-50 dark:text-dark-text-muted"
                    >
                        Don’t ask again
                    </button>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => phase === 'summary' ? handleStatusAction('skip') : setPhase('summary')}
                            disabled={busy || loadingContext}
                            className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface-hover"
                        >
                            {phase === 'summary' ? 'Skip for now' : 'Back'}
                        </button>
                        {phase === 'summary' ? (
                            <button
                                type="button"
                                onClick={() => { setPhase('questions'); setError(''); }}
                                disabled={busy || loadingContext || Boolean(contextError)}
                                className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent/90 disabled:opacity-50 dark:bg-dark-accent"
                            >
                                Start follow-up
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={busy || !answers.difficultArea || (needsDifficulty && !answers.difficultyType)}
                                className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent/90 disabled:opacity-50 dark:bg-dark-accent"
                            >
                                {submitting && <Loader2 size={16} className="animate-spin" />}
                                {submitting ? 'Submitting…' : 'Submit'}
                            </button>
                        )}
                    </div>
                </footer>
            </section>
        </div>
    );
};

export default BetaSurveyModal;
