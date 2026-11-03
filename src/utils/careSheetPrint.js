const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
})[character]);

const parseRecords = (value) => {
    if (Array.isArray(value)) return value.filter(Boolean);
    if (typeof value !== 'string') return [];
    try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
    } catch (error) {
        console.warn('Unable to parse care sheet record list:', error);
        return [];
    }
};

const formatDate = (value) => {
    if (!value) return '';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString();
};

const makeSection = (title, items) => ({
    title,
    items: items.filter(([, value]) => value !== null && value !== undefined && value !== ''),
});

const medicationLabel = (record) => {
    const name = record.name || record.medication;
    if (!name) return '';
    const details = [
        record.dose || record.dosage,
        record.intervalValue && record.intervalUnit
            ? `every ${record.intervalValue} ${record.intervalUnit}`
            : record.frequency,
        record.reason,
        record.notes,
        record.stopDate ? `through ${formatDate(record.stopDate)}` : '',
    ].filter(Boolean);
    return [name, ...details].join(' — ');
};

const activeMedications = (animal) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return parseRecords(animal.medications).filter(record => {
        if (['inactive', 'stopped', 'complete', 'completed'].includes(String(record.status || '').toLowerCase())) return false;
        if (!record.stopDate) return true;
        const stopDate = new Date(record.stopDate);
        return Number.isNaN(stopDate.getTime()) || stopDate >= today;
    });
};

const taskLabel = (task) => {
    const schedule = task.frequencyDays
        ? `every ${task.frequencyDays} day${task.frequencyDays === 1 ? '' : 's'}`
        : '';
    return [task.taskName, schedule, task.notes].filter(Boolean).join(' — ');
};

const formatAnimalName = (animal) => [animal.prefix, animal.name, animal.suffix].filter(Boolean).join(' ') || 'Unnamed animal';

const animalSections = (animal, enclosureInfo) => {
    const dietSupplies = parseRecords(animal.dietSupplies).map(item =>
        [item.name, item.quantity != null ? `${item.quantity}${item.unit ? ` ${item.unit}` : ''}` : ''].filter(Boolean).join(' — ')
    ).filter(Boolean);
    const supplements = parseRecords(animal.supplementSupplies).map(item =>
        [item.name, item.dosage, item.quantity != null ? `${item.quantity}${item.unit ? ` ${item.unit}` : ''}` : ''].filter(Boolean).join(' — ')
    ).filter(Boolean);
    const careTasks = parseRecords(animal.animalCareTasks).map(taskLabel).filter(Boolean);
    const medications = activeMedications(animal).map(medicationLabel).filter(Boolean);
    const allergies = parseRecords(animal.allergies).map(item =>
        [item.allergen || item.name, item.reaction ? `Reaction: ${item.reaction}` : '', item.notes].filter(Boolean).join(' — ')
    ).filter(Boolean);
    const conditions = parseRecords(animal.medicalConditions).map(item =>
        [item.condition || item.name, item.severity, item.notes].filter(Boolean).join(' — ')
    ).filter(Boolean);

    return [
        makeSection('Feeding & Water', [
            ['Diet', animal.dietType],
            ['Schedule', animal.feedingSchedule],
            ['Portion', animal.portionSize],
            ['Method', animal.feedingMethod],
            ['Feeding location', animal.feedingLocation],
            ['Water access', animal.waterAccess],
            ['Diet supplies', dietSupplies.length ? dietSupplies.join('; ') : ''],
            ['Supplements', animal.supplements],
            ['Supplement details', supplements.length ? supplements.join('; ') : ''],
            ['Dietary restrictions', animal.dietaryRestrictions],
            ['Dietary preferences', animal.dietaryPreferences],
            ['Feeding notes', animal.feedingBehaviorNotes],
        ]),
        makeSection('Daily & Routine Care', [
            ['Special care needs', animal.specialCareNeeds],
            ['Additional requirements', animal.additionalSpecialRequirements],
            ['Care tasks', careTasks.length ? careTasks.join('; ') : ''],
            ['Exercise', animal.exerciseRequirements],
            ['Grooming', animal.groomingNeeds],
            ['Cleaning schedule', animal.spotCleaningFrequency || animal.deepCleaningFrequency
                ? [animal.spotCleaningFrequency && `Spot clean: ${animal.spotCleaningFrequency}`, animal.deepCleaningFrequency && `Deep clean: ${animal.deepCleaningFrequency}`].filter(Boolean).join('; ')
                : ''],
            ['Handling', animal.handlingTolerance],
            ['Behavior notes', [animal.temperament, animal.behavioralIssues, animal.reactivityNotes, animal.escapeBehavior].filter(Boolean).join('; ')],
            ['Environment notes', animal.environmentNotes],
        ]),
        makeSection('Health & Medication', [
            ['Health status', animal.healthStatusOverride || animal.healthStatus],
            ['Medications', medications.length ? medications.join('; ') : ''],
            ['Allergies', allergies.length ? allergies.join('; ') : ''],
            ['Medical conditions', conditions.length ? conditions.join('; ') : ''],
            ['Quarantine', animal.quarantineStatus?.active
                ? [animal.quarantineStatus.reason, animal.quarantineStatus.endDate && `Until ${formatDate(animal.quarantineStatus.endDate)}`].filter(Boolean).join('; ') || 'Active'
                : ''],
            ['Primary veterinarian', animal.primaryVet],
        ]),
        makeSection('Housing & Environment', [
            ['Assigned enclosure', enclosureInfo?.name],
            ['Housing type', animal.housingType],
            ['Bedding / substrate', enclosureInfo?.bedding || animal.bedding],
            ['Temperature', enclosureInfo?.tempMin != null || enclosureInfo?.tempMax != null
                ? `${enclosureInfo.tempMin ?? '?'}–${enclosureInfo.tempMax ?? '?'}°${enclosureInfo.temperatureUnit || 'C'}`
                : animal.temperatureRange],
            ['Humidity', enclosureInfo?.humidityMin != null || enclosureInfo?.humidityMax != null
                ? `${enclosureInfo.humidityMin ?? '?'}–${enclosureInfo.humidityMax ?? '?'}%`
                : animal.humidity],
            ['Lighting', enclosureInfo?.lightsOnTime && enclosureInfo?.lightsOffTime
                ? `${enclosureInfo.lightsOnTime}–${enclosureInfo.lightsOffTime}`
                : animal.lighting || enclosureInfo?.lightingType],
            ['Enrichment', enclosureInfo?.enrichment || animal.enrichment],
            ['Other enclosure notes', enclosureInfo?.notes],
        ]),
    ].filter(section => section.items.length > 0);
};

const enclosureSections = (enclosure) => {
    const tasks = parseRecords(enclosure.cleaningTasks).map(task => {
        const supplies = parseRecords(task.assignedSupplies).map(supply =>
            `${supply.quantity ?? 1}${supply.unit ? ` ${supply.unit}` : ''} × ${supply.supplyName || supply.name || 'supply'}`
        );
        return [
            task.type,
            task.taskName,
            task.frequency ? `every ${task.frequency} ${task.frequencyUnit || 'days'}` : '',
            task.lastDoneDate ? `last done ${formatDate(task.lastDoneDate)}` : '',
            supplies.length ? `supplies: ${supplies.join(', ')}` : '',
            task.notes,
        ].filter(Boolean).join(' — ');
    }).filter(Boolean);

    return [
        makeSection('Enclosure Details', [
            ['Type', enclosure.enclosureType],
            ['Purpose', enclosure.purposeDescription || enclosure.purpose],
            ['Location', enclosure.locationName || enclosure.location],
            ['Capacity', enclosure.capacity],
            ['Dimensions', enclosure.dimensions
                ? [enclosure.dimensions.length, enclosure.dimensions.width, enclosure.dimensions.height].filter(value => value != null).join(' × ') +
                  (enclosure.dimensions.unit ? ` ${enclosure.dimensions.unit}` : '')
                : ''],
            ['Suitable species', Array.isArray(enclosure.speciesLabels) ? enclosure.speciesLabels.join(', ') : ''],
        ]),
        makeSection('Environment & Setup', [
            ['Temperature', enclosure.tempMin != null || enclosure.tempMax != null
                ? `${enclosure.tempMin ?? '?'}–${enclosure.tempMax ?? '?'}°${enclosure.temperatureUnit || 'C'}`
                : ''],
            ['Humidity', enclosure.humidityMin != null || enclosure.humidityMax != null
                ? `${enclosure.humidityMin ?? '?'}–${enclosure.humidityMax ?? '?'}%`
                : ''],
            ['Lighting schedule', enclosure.lightsOnTime && enclosure.lightsOffTime
                ? `${enclosure.lightsOnTime}–${enclosure.lightsOffTime}`
                : enclosure.lightingSchedule || ''],
            ['Lighting type', enclosure.lightingType],
            ['Bedding / substrate', enclosure.bedding],
            ['Enrichment', enclosure.enrichment],
            ['Notes', enclosure.notes],
        ]),
        makeSection('Cleaning & Maintenance Tasks', [['Tasks', tasks.length ? tasks.join('; ') : '']]),
    ].filter(section => section.items.length > 0);
};

const renderSections = (sections) => sections.map(section => `
    <section>
        <h2>${escapeHtml(section.title)}</h2>
        <dl>${section.items.map(([label, value]) => `
            <div class="detail"><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>
        `).join('')}</dl>
    </section>
`).join('');

const renderAnimalOccupants = (animals = []) => animals.map(animal => {
    const name = formatAnimalName(animal);
    const details = animalSections(animal, null);
    return `
        <article class="occupant">
            <h3>${escapeHtml(name)} <span>${escapeHtml(animal.id_public || '')}</span></h3>
            <p class="meta">${escapeHtml([animal.species, animal.gender, animal.status].filter(Boolean).join(' · '))}</p>
            ${renderSections(details)}
        </article>
    `;
}).join('');

export const buildAnimalCareSheet = (animal, enclosureInfo) => {
    const name = formatAnimalName(animal);
    return {
        title: `Care Sheet — ${name}`,
        subtitle: [animal.species, animal.id_public, animal.gender, animal.status].filter(Boolean).join(' · '),
        sections: animalSections(animal, enclosureInfo),
        occupants: '',
    };
};

export const buildEnclosureCareSheet = (enclosure, animals = []) => ({
    title: `Care Sheet — ${enclosure.name || 'Enclosure'}`,
    subtitle: [enclosure.enclosureType, enclosure.locationName || enclosure.location].filter(Boolean).join(' · '),
    sections: enclosureSections(enclosure),
    occupants: renderAnimalOccupants(animals),
});

export const buildCareSheetHtml = ({ title, subtitle, sections, occupants = '' }) => `
<!doctype html>
<html>
<head>
    <meta charset="utf-8">
    <title>${escapeHtml(title)}</title>
    <style>
        @page { size: A4; margin: 14mm; }
        * { box-sizing: border-box; }
        body { margin: 0; color: #172033; font: 10pt/1.4 Arial, sans-serif; }
        header { border-bottom: 2px solid #334155; margin-bottom: 12px; padding-bottom: 8px; }
        h1 { font-size: 20pt; line-height: 1.15; margin: 0 0 4px; }
        header p, .meta { color: #475569; margin: 0; }
        .generated { color: #64748b; font-size: 8pt; margin-top: 5px; }
        h2 { font-size: 12pt; margin: 14px 0 5px; padding-bottom: 3px; border-bottom: 1px solid #cbd5e1; }
        h3 { font-size: 11pt; margin: 12px 0 2px; }
        h3 span { color: #475569; font-size: 9pt; font-weight: normal; }
        dl { margin: 0; }
        .detail { display: grid; grid-template-columns: 32% 1fr; gap: 8px; padding: 3px 0; border-bottom: 1px solid #e2e8f0; break-inside: avoid; }
        dt { font-weight: 700; }
        dd { margin: 0; white-space: pre-wrap; overflow-wrap: anywhere; }
        .checklist { margin-top: 16px; }
        .checklist-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 7px 16px; }
        .check { display: flex; gap: 7px; align-items: flex-start; }
        .box { width: 12px; height: 12px; border: 1px solid #334155; flex: 0 0 12px; margin-top: 1px; }
        .write-lines { margin-top: 14px; }
        .line { height: 22px; border-bottom: 1px solid #94a3b8; }
        .occupant { break-inside: avoid; margin-top: 12px; padding-top: 6px; border-top: 1px solid #94a3b8; }
        .occupant section h2 { font-size: 10pt; margin-top: 8px; }
        footer { margin-top: 18px; border-top: 1px solid #cbd5e1; padding-top: 5px; color: #64748b; font-size: 8pt; }
        @media print { .occupant { break-inside: avoid-page; } }
    </style>
</head>
<body>
    <header>
        <h1>${escapeHtml(title)}</h1>
        ${subtitle ? `<p>${escapeHtml(subtitle)}</p>` : ''}
        <p class="generated">Prepared ${escapeHtml(new Date().toLocaleString())} · CritterTrack</p>
    </header>
    ${renderSections(sections)}
    ${occupants ? `<section><h2>Animals in this Enclosure</h2>${occupants}</section>` : ''}
    <section class="checklist">
        <h2>Caregiver Checklist</h2>
        <div class="checklist-grid">
            ${['Food provided as directed', 'Fresh water checked / refreshed', 'Medication given as directed', 'Enclosure secure and clean', 'Animals checked and accounted for', 'Concerns recorded for owner'].map(item => `<div class="check"><span class="box"></span><span>${escapeHtml(item)}</span></div>`).join('')}
        </div>
    </section>
    <section class="write-lines">
        <h2>Caregiver & Emergency Contacts</h2>
        <p>Owner / primary contact: _____________________________________  Phone: _________________________</p>
        <p>Veterinarian / emergency clinic: _____________________________  Phone: _________________________</p>
        <p>Emergency instructions:</p>
        <div class="line"></div><div class="line"></div>
        <p>Care notes / observations:</p>
        <div class="line"></div><div class="line"></div>
    </section>
    <footer>This sheet reflects information recorded in CritterTrack when printed. Confirm current instructions and medication directions with the animal's owner.</footer>
    <script>window.onload = () => { window.focus(); window.print(); };</script>
</body>
</html>
`;

export const printCareSheet = (sheet) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) throw new Error('Allow pop-ups to print the care sheet.');
    printWindow.opener = null;
    printWindow.document.write(buildCareSheetHtml(sheet));
    printWindow.document.close();
};
