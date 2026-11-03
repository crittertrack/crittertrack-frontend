import {
    buildAnimalCareSheet,
    buildCareSheetHtml,
    buildEnclosureCareSheet,
    printCareSheet
} from './careSheetPrint';

it('builds an animal care sheet from feeding, routine, and active health records', () => {
    const sheet = buildAnimalCareSheet({
        prefix: 'Little',
        name: 'Mochi',
        species: 'Fancy Rat',
        id_public: 'CTC123',
        feedingSchedule: 'Morning and evening',
        portionSize: '1 tablespoon',
        dietaryRestrictions: 'No citrus',
        animalCareTasks: [{ taskName: 'Weigh', frequencyDays: 7 }],
        medications: [
            { name: 'Medication A', dose: '2 mg', intervalValue: 1, intervalUnit: 'day' },
            { name: 'Medication B', status: 'completed' }
        ],
        allergies: [{ allergen: 'Peanuts', reaction: 'Swelling' }]
    }, { name: 'Upper cage' });

    const html = buildCareSheetHtml(sheet);
    expect(sheet.title).toContain('Little Mochi');
    expect(html).toContain('Morning and evening');
    expect(html).toContain('1 tablespoon');
    expect(html).toContain('No citrus');
    expect(html).toContain('Weigh — every 7 days');
    expect(html).toContain('Medication A — 2 mg — every 1 day');
    expect(html).not.toContain('Medication B');
    expect(html).toContain('Peanuts — Reaction: Swelling');
    expect(html).toContain('Upper cage');
    expect(html).toContain('Caregiver Checklist');
    expect(html).toContain('emergency clinic');
});

it('includes enclosure environment, cleaning tasks, and assigned animals', () => {
    const sheet = buildEnclosureCareSheet({
        name: 'Nursery',
        enclosureType: 'Vivarium',
        tempMin: 24,
        tempMax: 28,
        temperatureUnit: 'C',
        cleaningTasks: [{ type: 'Cleaning', taskName: 'Spot clean', frequency: 2, frequencyUnit: 'days' }]
    }, [{
        name: 'Pip',
        species: 'Gecko',
        id_public: 'CTC456',
        dietType: 'Insects',
        feedingSchedule: 'Every evening'
    }]);

    const html = buildCareSheetHtml(sheet);
    expect(sheet.title).toContain('Nursery');
    expect(html).toContain('24–28°C');
    expect(html).toContain('Spot clean — every 2 days');
    expect(html).toContain('Pip');
    expect(html).toContain('Every evening');
});

it('lists enclosure animals compactly as species - gender - variety without status or health', () => {
    const sheet = buildEnclosureCareSheet({ name: 'Nursery' }, [{
        prefix: 'Little',
        name: 'Mochi',
        suffix: 'of Oz',
        id_public: 'CTC789',
        species: 'Fancy Rat',
        gender: 'Female',
        status: 'Breeder',
        color: 'Black',
        coat: 'Rex',
        eyeColor: 'Ruby',
        healthStatus: 'Healthy',
        feedingSchedule: 'Every evening'
    }]);

    const html = buildCareSheetHtml(sheet);
    expect(sheet.occupants).toContain('Little Mochi of Oz');
    expect(sheet.occupants).toContain('CTC789');
    expect(sheet.occupants).toContain('Fancy Rat - Female - Black Rex Ruby');
    expect(sheet.occupants).toContain('Every evening');
    expect(sheet.occupants).not.toContain('Breeder');
    expect(sheet.occupants).not.toContain('Healthy');
    expect(sheet.occupants).not.toContain('Health status');
    expect(html).toContain('Animals in this Enclosure');
});

it('escapes record content before writing a printable document', () => {
    const printWindow = {
        document: { write: jest.fn(), close: jest.fn() },
        opener: window
    };
    const openSpy = jest.spyOn(window, 'open').mockReturnValue(printWindow);

    printCareSheet({
        title: '<script>bad()</script>',
        subtitle: '',
        sections: [{ title: 'Notes', items: [['Care note', '<img src=x onerror=alert(1)>']] }]
    });

    expect(printWindow.document.write).toHaveBeenCalledWith(expect.stringContaining('&lt;script&gt;bad()&lt;/script&gt;'));
    expect(printWindow.document.write.mock.calls[0][0]).toContain('&lt;img src=x onerror=alert(1)&gt;');
    expect(printWindow.document.close).toHaveBeenCalled();
    openSpy.mockRestore();
});
