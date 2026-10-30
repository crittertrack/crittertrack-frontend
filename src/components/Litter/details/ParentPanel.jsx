import React from 'react';
import { Mars, Venus, SquareArrowOutUpRight } from 'lucide-react';
import { formatDate, calculateBreedingAge } from '../../../utils/dateFormatter';
import { formatAnimalDisplayName } from '../../../utils/animalDisplayName';
import { breedingLineBgStyle, hideRedundantLegacyLines, sortLinesGradientFirst } from '../../../utils/breedingLineColor';
import { dayOf, varietyOf } from './helpers';
import { Muted } from './ui';

const Line = ({ label, children }) => (
    <div className="text-sm leading-snug">
        <span className="text-gray-500 dark:text-dark-text-muted">{label}: </span>
        <span className="text-gray-900 dark:text-dark-text">{children}</span>
    </div>
);

const NA = <Muted>Not recorded</Muted>;

/** Age of the parent on the mating date, or null if either date is missing. */
const ageAtMating = (animal, matingDate) => {
    if (!animal?.birthDate || !matingDate) return null;
    const born = dayOf(animal.birthDate);
    const mated = dayOf(matingDate);
    if (!born || !mated || mated < born) return null;
    return calculateBreedingAge(animal.birthDate, matingDate);
};

export default function ParentPanel({
    role, animal, fallbackId, matingDate, onView, breedingLineDefs = [], animalBreedingLines = {},
}) {
    const isSire = role === 'Sire';
    const id = animal?.id_public || fallbackId || null;
    const img = animal?.imageUrl || animal?.photoUrl || null;
    const Icon = isSire ? Mars : Venus;
    const iconClass = isSire ? 'text-primary' : 'text-accent';

    const assigned = (id && animalBreedingLines[id]) || [];
    const lines = sortLinesGradientFirst(hideRedundantLegacyLines(
        breedingLineDefs.filter(l => assigned.includes(l.id) && l.name && l.enabled !== false)
    ));
    const variety = varietyOf(animal);
    const age = ageAtMating(animal, matingDate);
    const coi = animal?.inbreedingCoefficient;
    const open = () => id && onView && onView(animal || { id_public: id });

    return (
        <section data-testid={`parent-${role.toLowerCase()}`} className="rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card-bg p-4 flex flex-col">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-gray-500 dark:text-dark-text-muted">
                    <Icon size={14} strokeWidth={2.5} className={iconClass} /> {role.toUpperCase()}
                </div>
                {id && (
                    <button
                        type="button"
                        onClick={open}
                        title={`Open ${role.toLowerCase()}`}
                        aria-label={`Open ${role.toLowerCase()}`}
                        className="p-1 rounded-md text-gray-500 dark:text-dark-text-muted hover:bg-gray-100 dark:hover:bg-dark-surface"
                    >
                        <SquareArrowOutUpRight size={16} />
                    </button>
                )}
            </div>

            {!animal && !fallbackId ? (
                <div className="text-sm text-gray-400 dark:text-dark-text-muted py-6 text-center">No {role.toLowerCase()} assigned</div>
            ) : (
                <div className="flex gap-4 flex-1">
                    <div className="shrink-0 w-28 sm:w-32 self-stretch min-h-[8rem] rounded-lg overflow-hidden bg-gray-100 dark:bg-dark-surface flex items-center justify-center">
                        {img
                            ? <img src={img} alt="" className="w-full h-full object-cover" />
                            : <Icon size={32} className="text-gray-300 dark:text-dark-text-muted" />}
                    </div>
                    <div className="min-w-0 flex-1 space-y-1">
                        <div className="font-semibold text-gray-900 dark:text-dark-text break-words">
                            {animal ? formatAnimalDisplayName(animal) : fallbackId}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-dark-text-muted">{id}</div>
                        <Line label="Variety">{variety || NA}</Line>
                        <Line label="Genetic code">{animal?.geneticCode || NA}</Line>
                        <Line label="Born">{animal?.birthDate ? formatDate(animal.birthDate) : NA}</Line>
                        <Line label="Age at mating">{age || NA}</Line>
                        <div className="text-sm leading-snug flex flex-wrap items-center gap-x-1.5 gap-y-1">
                            <span className="text-gray-500 dark:text-dark-text-muted">Breeding lines:</span>
                            {lines.length === 0 ? <Muted>None</Muted> : lines.map(l => (
                                <span key={l.id} className="inline-flex items-center gap-1 text-xs text-gray-800 dark:text-dark-text">
                                    <span className="inline-block w-2 h-2 rounded-full" style={breedingLineBgStyle(l.color)} />{l.name}
                                </span>
                            ))}
                        </div>
                        <Line label="Own COI">{coi !== null && coi !== undefined ? `${Number(coi).toFixed(2)}%` : NA}</Line>
                    </div>
                </div>
            )}
        </section>
    );
}
