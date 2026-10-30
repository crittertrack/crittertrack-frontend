import React from 'react';
import { linkableOffspring, linkOffspring, unlinkOffspring } from '../litterFormModel';
import { SectionTitle, cardClass } from '../fields';
import CreatePlaceholdersCard from './CreatePlaceholdersCard';

const animalLabel = (a) =>
    `${a.prefix ? `${a.prefix} ` : ''}${a.name}${a.suffix ? ` ${a.suffix}` : ''} - ${a.id_public} (${a.gender}${a.birthDate ? `, ${new Date(a.birthDate).toLocaleDateString()}` : ''})`;

export default function OffspringSection({
    form,
    setForm,
    myAnimals,
    animalsLoaded,
    linkedCounts,
    createCounts,
    setCreateCounts,
}) {
    const hasParents = !!(form.sireId_public && form.damId_public);
    const candidates = linkableOffspring(myAnimals, form);

    const toggle = (animal, checked) => {
        if (!checked) return setForm(fd => unlinkOffspring(fd, animal.id_public));
        const result = linkOffspring(form, animal);
        if (result.needsConfirm) {
            const { animalDate, litterDate } = result.needsConfirm;
            const ok = window.confirm(
                `This animal has a different birth date (${animalDate}) than the litter (${litterDate}).\n\n` +
                'Click OK to update the litter birth date to match the animal\'s date, or Cancel to abort linking.'
            );
            if (!ok) return undefined;
            return setForm(linkOffspring(form, animal, { acceptDateChange: true }).form);
        }
        return setForm(result.form);
    };

    if (!hasParents) {
        return (
            <div className={cardClass}>
                <SectionTitle title="Offspring" />
                <p className="text-sm text-gray-500 dark:text-dark-text-muted">Choose a sire and dam first (Identity &amp; parents) to link or create offspring.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className={cardClass}>
                <SectionTitle
                    title="Link existing animals"
                    description={form.birthDate ? 'Only animals with a matching birth date are shown.' : 'The birth date is filled in from the first animal you link.'}
                />
                {!animalsLoaded ? (
                    <p className="text-sm text-gray-500">Loading your animals…</p>
                ) : candidates.length === 0 ? (
                    <p className="text-xs italic text-gray-500 dark:text-dark-text-muted">No matching animals found.</p>
                ) : (
                    <div className="space-y-1">
                        {candidates.map(animal => (
                            <label key={animal.id_public} className="flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-dark-surface">
                                <input
                                    type="checkbox"
                                    className="h-4 w-4"
                                    checked={!!form.linkedOffspringIds?.includes(animal.id_public)}
                                    onChange={(e) => toggle(animal, e.target.checked)}
                                />
                                <span className="text-sm text-gray-800 dark:text-dark-text">{animalLabel(animal)}</span>
                            </label>
                        ))}
                    </div>
                )}
                {form.linkedOffspringIds?.length > 0 && (
                    <p className="text-xs font-semibold text-green-600">{form.linkedOffspringIds.length} animal(s) linked. Unlinking does not delete the animal.</p>
                )}
            </div>

            {form.birthDate && (
                <CreatePlaceholdersCard form={form} linkedCounts={linkedCounts} createCounts={createCounts} setCreateCounts={setCreateCounts} />
            )}
        </div>
    );
}
