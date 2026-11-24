
import React from 'react';
import { formatDate } from '../../../utils/dateFormatter';
import { computeLitterStats, nextMilestone, relativeDaysLabel } from './helpers';
import { Check } from 'lucide-react';
import { Panel, Muted, isBlank } from './ui';
import ParentPanel from './ParentPanel';
import TimelinePanel from './TimelinePanel';
import StatsPanel from './StatsPanel';
import ObjectivesPanel from './ObjectivesPanel';
import EventDetailsRow from './EventDetailsRow';
import {
    getLitterFieldLabel,
    getLitterSpecies,
    isEggLayingSpecies
} from '../../../utils/litterSpeciesPresentation';

const Summary = ({ label, children, testId, className }) => {
    const isMissing =
        children === null ||
        children === undefined ||
        children === '' ||
        (typeof children === 'number' && !Number.isFinite(children));

    const displayValue = isMissing
        ? <span className="text-xs text-gray-500 dark:text-dark-text-muted">—</span>
        : children;

    return (
        <div
            className={`rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card-bg px-4 py-3 min-w-0 ${className || ''}`}
            data-testid={testId}
        >
            <div className="text-xs text-gray-500 dark:text-dark-text-muted">
                {label}
            </div>
            <div className="mt-0.5 text-lg font-semibold text-gray-900 dark:text-dark-text">
                {displayValue}
            </div>
        </div>
    );
};

export default function OverviewTab({
    litter,
    status,
    onView,
    onEdit,
    breedingLineDefs = [],
    animalBreedingLines = {},
    showWeanedButton = false,
    handleMarkWeaned,
    handleQuickAction,
    speciesOptions = [],
}) {
    const stats = computeLitterStats(litter, status);
    const milestone = nextMilestone(litter, status);
    const coi = litter.inbreedingCoefficient;

    const species = getLitterSpecies(litter);
    const eggLaying = isEggLayingSpecies(species, speciesOptions);

    const milestoneLabel = eggLaying
        ? ({
            Mating: 'Pairing',
            'Birth due': 'Hatch due',
            Weaning: 'Independence'
        }[milestone?.label] || milestone?.label)
        : milestone?.label;

    const birth = litter.birthDate
        ? formatDate(litter.birthDate)
        : litter.birthDateUnknown
            ? 'Date unknown'
            : null;

    // Raw total born count.
    const totalBorn = stats.totalBorn !== null && stats.totalBorn !== undefined
        ? stats.totalBorn
        : null;

    // Stillborn count.
    const stillbornCount = litter.stillbornCount != null
        ? Number(litter.stillbornCount)
        : null;

    // Postnatal losses, excluding stillborn.
    const lossesCount = litter.lossesCount != null
        ? Number(litter.lossesCount)
        : null;

    // Culls count.
    const cullsCount = litter.hasCulls
        ? (litter.cullsCount != null ? Number(litter.cullsCount) : null)
        : null;

    // Total loss = stillborn + losses + culls.
    const totalLoss =
        stillbornCount !== null ||
        lossesCount !== null ||
        cullsCount !== null
            ? Math.max(
                0,
                (stillbornCount || 0) +
                (lossesCount || 0) +
                (cullsCount || 0)
            )
            : null;

    // Total surviving = total born minus stillborn and postnatal losses.
    // Culls are not subtracted from this calculation.
    const totalSurviving = totalBorn !== null
        ? Math.max(
            0,
            totalBorn -
            (stillbornCount || 0) -
            (lossesCount || 0)
        )
        : null;

    // Total linked = offspring with linked records.
    const linkedCount = Array.isArray(litter.offspringIds_public)
        ? litter.offspringIds_public.length
        : 0;

    // Total offspring VIEW.
    // Extraction checkboxes affect this overview total only.
    const viewTotal = totalBorn !== null
        ? (() => {
            let total = totalBorn;

            if (litter.extractStillbornFromTotal && stillbornCount !== null) {
                total -= stillbornCount;
            }

            if (litter.extractLossesFromTotal && lossesCount !== null) {
                total -= lossesCount;
            }

            return Math.max(0, total);
        })()
        : linkedCount;

    const parentProps = {
        onView,
        breedingLineDefs,
        animalBreedingLines,
        matingDate: litter.matingDate || litter.pairingDate
    };

    return (
        <div className="space-y-4" data-testid="litter-overview">

            {/* SUMMARY CARDS */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3">

                <Summary
                    label={getLitterFieldLabel('birthDate', species, 'Birth date', speciesOptions)}
                    testId="summary-birth"
                    className="min-w-0"
                >
                    {birth || (
                        <Muted>
                            {status === 'born'
                                ? 'Not recorded'
                                : eggLaying
                                    ? 'Not laid or hatched yet'
                                    : 'Not born yet'}
                        </Muted>
                    )}
                </Summary>

                <Summary
                    label="Total born"
                    testId="summary-total-born"
                    className="min-w-0"
                >
                    {totalBorn === null
                        ? <Muted>{status === 'born' ? 'Not recorded' : '—'}</Muted>
                        : totalBorn}
                </Summary>

                <Summary
                    label="Total loss"
                    testId="summary-total-loss"
                    className="min-w-0"
                >
                    {totalLoss === null ? <Muted>—</Muted> : totalLoss}
                </Summary>

                <Summary
                    label="Total surviving"
                    testId="summary-total-surviving"
                    className="min-w-0"
                >
                    {totalSurviving === null ? <Muted>—</Muted> : totalSurviving}
                </Summary>

                <Summary
                    label="Total linked"
                    testId="summary-total-linked"
                    className="min-w-0"
                >
                    {linkedCount}
                </Summary>

                <Summary
                    label="COI"
                    testId="summary-coi"
                    className="min-w-0"
                >
                    {isBlank(coi)
                        ? <Muted>Not calculated</Muted>
                        : `${Number(coi).toFixed(2)}%`}
                </Summary>

                <Summary
                    label="Next milestone"
                    testId="summary-milestone"
                    className="min-w-0"
                >
                    <div className="flex items-center justify-between gap-3 w-full">
                        <div className="flex-1 min-w-0">
                            {milestone ? (
                                <>
                                    <span>{milestoneLabel}</span>

                                    <span className="block text-xs font-normal text-gray-500 dark:text-dark-text-muted">
                                        {formatDate(milestone.date)} · {relativeDaysLabel(milestone.days)}
                                    </span>
                                </>
                            ) : (
                                <Muted>
                                    {status === 'born' &&
                                    litter.weaningConfirmed
                                        ? 'Complete'
                                        : ''}
                                </Muted>
                            )}
                        </div>

                        {(() => {
                            const action =
                                status === 'planned' ? 'mated'
                                : status === 'mated' ? 'pregnant'
                                : status === 'pregnant' ? 'born'
                                : status === 'born' ? 'weaned'
                                : null;

                            if (!action || !handleQuickAction) {
                                return null;
                            }

                            const actionLabel =
                                action === 'born' && eggLaying
                                    ? 'hatched'
                                    : action === 'weaned' && eggLaying
                                        ? 'independent'
                                        : action;

                            return (
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleQuickAction(litter, action);
                                    }}
                                    className="shrink-0 inline-flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                                    title={`Mark as ${actionLabel}`}
                                    aria-label={`Mark as ${actionLabel}`}
                                >
                                    <Check size={14} />
                                </button>
                            );
                        })()}
                    </div>
                </Summary>

            </div>

            {/* PARENTS */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <ParentPanel
                    role="Sire"
                    animal={litter.sire}
                    fallbackId={litter.sireId_public}
                    {...parentProps}
                />

                <ParentPanel
                    role="Dam"
                    animal={litter.dam}
                    fallbackId={litter.damId_public}
                    {...parentProps}
                />
            </div>

            {/* TIMELINE, STATISTICS AND OBJECTIVES */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <TimelinePanel
                    litter={litter}
                    status={status}
                    speciesOptions={speciesOptions}
                />

                <StatsPanel
                    litter={litter}
                    status={status}
                    speciesOptions={speciesOptions}
                />

                <ObjectivesPanel
                    litter={litter}
                    onEdit={onEdit}
                />
            </div>

            {/* EVENT DETAILS */}
            <EventDetailsRow
                litter={litter}
                status={status}
                speciesOptions={speciesOptions}
            />

            {/* ADDITIONAL NOTES */}
            <Panel title="Additional notes" testId="notes-panel">
                {isBlank(litter.notes)
                    ? <Muted>No notes.</Muted>
                    : (
                        <p className="text-sm text-gray-800 dark:text-dark-text whitespace-pre-wrap">
                            {litter.notes}
                        </p>
                    )}
            </Panel>

        </div>
    );
}
