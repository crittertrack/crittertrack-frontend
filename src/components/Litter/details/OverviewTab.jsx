import React from 'react';
import { formatDate } from '../../../utils/dateFormatter';
import { computeLitterStats, nextMilestone, relativeDaysLabel } from './helpers';
import { Panel, Muted, isBlank } from './ui';
import ParentPanel from './ParentPanel';
import TimelinePanel from './TimelinePanel';
import StatsPanel from './StatsPanel';
import ObjectivesPanel from './ObjectivesPanel';
import EventDetailsRow from './EventDetailsRow';

const Summary = ({ label, children, testId }) => (
    <div className="rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card-bg px-4 py-3" data-testid={testId}>
        <div className="text-xs text-gray-500 dark:text-dark-text-muted">{label}</div>
        <div className="mt-0.5 text-lg font-semibold text-gray-900 dark:text-dark-text">{children}</div>
    </div>
);

export default function OverviewTab({
    litter, status, offspring = [], offspringLoading = false, onView, onEdit,
    breedingLineDefs = [], animalBreedingLines = {},
    showWeanedButton = false, handleMarkWeaned,
}) {
    const stats = computeLitterStats(litter, status);
    const milestone = nextMilestone(litter, status);
    const coi = litter.inbreedingCoefficient;

    const birth = litter.birthDate
        ? formatDate(litter.birthDate)
        : litter.birthDateUnknown ? 'Date unknown' : null;

    // Prefer the recorded total; fall back to linked animals so a litter with linked offspring is never blank.
    const total = stats.totalBorn !== null
        ? stats.totalBorn
        : (!offspringLoading && offspring.length > 0 ? offspring.length : null);

    const parentProps = { onView, breedingLineDefs, animalBreedingLines, matingDate: litter.matingDate || litter.pairingDate };

    return (
        <div className="space-y-4" data-testid="litter-overview">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <Summary label="Birth date" testId="summary-birth">{birth || <Muted>{status === 'born' ? 'Not recorded' : 'Not born yet'}</Muted>}</Summary>
                <Summary label="Total offspring" testId="summary-total">{total === null ? <Muted>{status === 'born' ? 'Not recorded' : '—'}</Muted> : total}</Summary>
                <Summary label="COI" testId="summary-coi">{isBlank(coi) ? <Muted>Not calculated</Muted> : `${Number(coi).toFixed(2)}%`}</Summary>
                
<Summary label="Next milestone" testId="summary-milestone">
  <div className="flex items-center justify-between gap-3 w-full">
    {/* Original milestone information - Left */}
    <div className="min-w-0">
      {milestone ? (
        <>
          <span>{milestone.label}</span>
          <span className="block text-xs font-normal text-gray-500 dark:text-dark-text-muted">
            {formatDate(milestone.date)} · {relativeDaysLabel(milestone.days)}
          </span>
        </>
      ) : (
        <Muted>
          {status === 'born' && litter.weaningConfirmed
            ? 'Complete'
            : 'None scheduled'}
        </Muted>
      )}
    </div>

    {/* Reproductive status action - Right */}
    {showWeanedButton && (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          handleMarkWeaned(litter);
        }}
        className="flex items-center gap-1 whitespace-nowrap text-xs px-2 py-1 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors shrink-0"
        title="Mark litter as weaned"
      >
        <Check size={12} />
        Mark Weaned
      </button>
    )}
  </div>
</Summary>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <ParentPanel role="Sire" animal={litter.sire} fallbackId={litter.sireId_public} {...parentProps} />
                <ParentPanel role="Dam" animal={litter.dam} fallbackId={litter.damId_public} {...parentProps} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <TimelinePanel litter={litter} status={status} />
                <StatsPanel litter={litter} status={status} />
                <ObjectivesPanel litter={litter} onEdit={onEdit} />
            </div>

            <EventDetailsRow litter={litter} status={status} />

            <Panel title="Additional notes" testId="notes-panel">
                {isBlank(litter.notes)
                    ? <Muted>No notes.</Muted>
                    : <p className="text-sm text-gray-800 dark:text-dark-text whitespace-pre-wrap">{litter.notes}</p>}
            </Panel>
        </div>
    );
}
