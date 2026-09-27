import React, { useState } from 'react';
import { Mars, Venus, CircleDot } from 'lucide-react';
import AnimalImage from '../shared/AnimalImage';
import apiClient from '../../utils/apiClient';
import { formatLocalDate } from '../../utils/dateFormatter';
import { AnimalNameWithFlag } from '../../utils/animalDisplayName';

// Lite's "My Animals" list is a flat set of horizontal rows rather than the Full frontend's
// species-grouped card grid — see the isLite branch in AnimalList/index.jsx.
//
// Row shape: identity + image on the left, status/ID in the middle, the two quick toggles on
// the right. Only the fields a breeder scans for at a glance live here; everything else is on
// the animal's modal.

// Reproductive pill, mirroring the Full card (AnimalList/index.jsx) exactly: first matching
// flag wins, since these states are effectively exclusive. Keep the labels, colors and
// precedence order in sync with getReproState() there.
const REPRO_STATES = [
    ['isPregnant',     'Pregnant',       'bg-pink-100 dark:bg-pink-900/30 text-pink-800 dark:text-pink-300'],
    ['isNursing',      'Nursing',        'bg-violet-100 dark:bg-violet-900/30 text-violet-800 dark:text-violet-300'],
    ['isInMating',     'In Mating',      'bg-sky-100 dark:bg-sky-900/30 text-sky-800 dark:text-sky-300'],
    ['isPlannedMating', 'Planned Mating', 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300'],
];

const getReproState = (animal) => {
    const hit = REPRO_STATES.find(([key]) => animal[key]);
    return hit ? { label: hit[1], color: hit[2] } : null;
};

// Years/months/days, stopping at deceasedDate when the animal has died. Mirrors
// calculateAgeDetailed() in utils/dateFormatter.js, which has no end-date support.
const ageDetailed = (birthDate, endDate) => {
    if (!birthDate) return null;
    const born = new Date(birthDate);
    if (isNaN(born.getTime())) return null;
    const end = endDate ? new Date(endDate) : new Date();
    if (isNaN(end.getTime()) || born > end) return null;
    let years = end.getFullYear() - born.getFullYear();
    let months = end.getMonth() - born.getMonth();
    let days = end.getDate() - born.getDate();
    if (days < 0) {
        months--;
        days += new Date(end.getFullYear(), end.getMonth(), 0).getDate();
    }
    if (months < 0) { years--; months += 12; }
    if (years > 0) return `${years}y ${months}m ${days}d`;
    if (months > 0) return `${months}m ${days}d`;
    return `${days}d`;
};

const varietyOf = (a) =>
    [a.color, a.coat, a.earset, a.markings, a.eyeColor, a.body].filter(Boolean).join(' ') || '';

const LiteAnimalRow = ({ animal, onViewAnimal, toggleAnimalOwned, onUpdateAnimal }) => {
    const [busy, setBusy] = useState(false);

    const reproState = getReproState(animal);
    const age = ageDetailed(animal.birthDate, animal.deceasedDate);

    const togglePublic = async () => {
        if (busy) return;
        const next = !animal.isDisplay;
        setBusy(true);
        // Optimistic, matching AnimalModalV2's public toggle: flip locally, PUT, roll back on failure.
        onUpdateAnimal?.({ ...animal, isDisplay: next });
        try {
            await apiClient.put(`/animals/${animal.id_public}`, { isDisplay: next });
        } catch {
            onUpdateAnimal?.({ ...animal, isDisplay: !next });
        } finally {
            setBusy(false);
        }
    };

    return (
        <div
            onClick={() => onViewAnimal(animal)}
            className="flex items-center gap-3 px-3 py-2 bg-white dark:bg-dark-card-bg border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-surface-hover transition cursor-pointer"
        >
            {/* LEFT — image + identity + variety + birthdate/age. min-w-0 + truncate keeps a long
                name/variety from pushing the middle column out of alignment. */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 dark:bg-dark-surface flex-shrink-0">
                    <AnimalImage src={animal.imageUrl || animal.photoUrl} alt="" iconSize={20} FallbackIcon={CircleDot} />
                </div>
                <div className="min-w-0">
                    <div className="flex items-center gap-1.5 min-w-0">
                        {/* Same flag-in-front-of-name treatment the card view uses. */}
                        <AnimalNameWithFlag
                            animal={animal}
                            textClassName="text-sm font-semibold text-gray-900 dark:text-dark-text truncate"
                            wrapperClassName="flex items-center gap-1.5 min-w-0"
                        />
                        {animal.gender === 'Male' && <Mars size={13} className="text-blue-500 shrink-0" />}
                        {animal.gender === 'Female' && <Venus size={13} className="text-pink-500 shrink-0" />}
                    </div>
                    {varietyOf(animal) && (
                        <p className="text-xs text-gray-500 dark:text-dark-text-muted truncate">{varietyOf(animal)}</p>
                    )}
                    <p className="text-xs text-gray-400 dark:text-dark-text-muted">
                        {animal.birthDate ? formatLocalDate(animal.birthDate) : 'No birthdate'}
                        {age && <span> · {age}</span>}
                    </p>
                </div>
            </div>

            {/* MIDDLE — reproductive status, general status, CTC ID. Fixed-width and rigid, with
                the LEFT and RIGHT columns both set to flex-1 below so they absorb equal slack.
                That's what actually centres this block: whichever way the name/variety text
                stretches, it grows both sides by the same amount and the status/ID pills stay
                at the horizontal midpoint. */}
            <div className="hidden sm:flex flex-col items-start gap-1 w-48 shrink-0 grow-0 basis-48">
                {reproState && (
                    <span className={`text-[10px] font-semibold px-2 py-1 rounded-full whitespace-nowrap ${reproState.color}`}>
                        {reproState.label}
                    </span>
                )}
                <span className="text-[10px] font-semibold px-2 py-1 rounded-full whitespace-nowrap bg-gray-100 dark:bg-dark-surface text-gray-600 dark:text-dark-text-secondary">
                    {animal.status || '—'}
                </span>
                <span className="text-[10px] font-mono text-gray-400 dark:text-dark-text-muted">{animal.id_public}</span>
            </div>

            {/* RIGHT — owned + public toggles. Shares flex-1 with the left column so the middle
                block above lands at the centre. The inner box is a fixed width with the buttons
                right-aligned, so "Unowned" vs "Owned" doesn't shift the row's right edge. */}
            <div className="flex-1 min-w-0 flex justify-end" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-end gap-1.5 w-28 sm:w-40 shrink-0">
                <button
                    onClick={() => toggleAnimalOwned(animal.id_public, !animal.isOwned)}
                    className={`px-2 py-1 text-[11px] font-semibold rounded-lg transition ${
                        animal.isOwned
                            ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                            : 'bg-gray-100 dark:bg-dark-surface text-gray-500 dark:text-dark-text-muted'
                    }`}
                    title={animal.isOwned ? 'Mark as Not Owned' : 'Mark as Owned'}
                >{animal.isOwned ? 'Owned' : 'Unowned'}</button>
                <button
                    onClick={togglePublic}
                    disabled={busy}
                    className={`px-2 py-1 text-[11px] font-semibold rounded-lg transition disabled:opacity-50 ${
                        animal.isDisplay
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                            : 'bg-gray-100 dark:bg-dark-surface text-gray-500 dark:text-dark-text-muted'
                    }`}
                    title={animal.isDisplay ? 'Make Private' : 'Make Public'}
                >{animal.isDisplay ? 'Public' : 'Private'}</button>
              </div>
            </div>
        </div>
    );
};

export default LiteAnimalRow;
