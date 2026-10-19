import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import apiClient from '../utils/apiClient';
import ReservationsPage from './ReservationsPage';

jest.mock('../utils/apiClient', () => ({
    __esModule: true,
    default: { get: jest.fn(), post: jest.fn(), put: jest.fn(), patch: jest.fn(), delete: jest.fn() },
}));
jest.mock('react-router-dom', () => ({ useNavigate: () => jest.fn() }), { virtual: true });

const animals = [
    { id_public: 'CTC1', name: 'Peanut', species: 'Fancy Rat', gender: 'Female', status: 'Available', imageUrl: null },
    { id_public: 'CTC2', name: 'Butter', species: 'Fancy Rat', gender: 'Male', status: 'Booked', reservedBuyerName: 'Jane', reservedPrice: 40, reservedDepositStatus: 'done', reservedPaymentStatus: 'due' },
    { id_public: 'CTC3', name: 'Retired Doe', species: 'Fancy Rat', gender: 'Female', status: 'Retired' },
    { id_public: 'CTC4', name: 'Whiskers', species: 'Fancy Mouse', gender: 'Female', status: 'Available' },
];
const waitlist = [
    { _id: 'W1', name: 'Jane', contactInfo: 'jane@example.com', speciesRequests: [{ species: 'Fancy Rat', genders: ['Female'], amount: 2 }], isActive: true, assignedAnimals: [] },
    { _id: 'W2', name: 'Sam', contactInfo: 'sam@example.com', speciesRequests: [{ species: 'Fancy Mouse', genders: ['Any'], amount: 3 }], isActive: true, assignedAnimals: [] },
];

const contacts = [
    { _id: 'C1', personalName: 'Jane Doe', breederName: 'Doe Rats', linkedCTUID: 'CTU-1', isKeeper: true, isBreeder: true, breederStatus: 'active', address: { city: 'Portland', country: 'USA' } },
    { _id: 'C2', personalName: 'Sam Smith', linkedCTUID: 'CTU-2', isKeeper: true, isBreeder: false, breederStatus: 'active', address: {} },
];

const setup = async (overrides = {}) => {
    apiClient.get.mockImplementation((url) => {
        if (url === '/animals') return Promise.resolve({ data: overrides.animals || animals });
        if (url === '/waitlist') return Promise.resolve({ data: overrides.waitlist || waitlist });
        if (url === '/species') return Promise.resolve({ data: [{ name: 'Fancy Rat' }, { name: 'Fancy Mouse' }, { name: 'Fancy Gerbil' }] });
        if (url === '/contacts') return Promise.resolve({ data: overrides.contacts || contacts });
        return Promise.resolve({ data: [] });
    });
    apiClient.put.mockImplementation((url, payload) => Promise.resolve({ data: { animal: payload } }));
    apiClient.post.mockImplementation((url, payload) => Promise.resolve({ data: { _id: 'NEW', ...payload } }));
    apiClient.patch.mockImplementation((url, payload) => Promise.resolve({ data: payload }));
    apiClient.delete.mockImplementation(() => Promise.resolve({ data: {} }));
    const showModalMessage = jest.fn();
    const onViewAnimal = jest.fn();
    const utils = render(<ReservationsPage authToken="t" API_BASE_URL="/api" showModalMessage={showModalMessage} onViewAnimal={onViewAnimal} />);
    await screen.findByText('Reservations');
    // Await the async animal data load so assertions run after the cards render.
    await screen.findByText('Peanut');
    return { ...utils, showModalMessage, onViewAnimal };
};

beforeEach(() => jest.clearAllMocks());

test('animals tab lists only Available and Booked animals', async () => {
    await setup();
    // Available / Booked animals are each rendered once as a card (no reservation -> no banner)
    expect(screen.getAllByText('Peanut').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Whiskers').length).toBeGreaterThan(0);
    // Butter is rendered once as a card, plus once in the "Payments due" banner
    expect(screen.getAllByText('Butter').length).toBeGreaterThan(0);
    expect(screen.queryByText('Retired Doe')).toBeNull();
});

test('buyer picker only shows waitlist entries fitting the animal species/gender', async () => {
    await setup();
    const peanutCard = screen.getByTestId('animal-card-CTC1');
    fireEvent.click(within(peanutCard).getByText('Assign'));
    // The reservation editor's waitlist picker is below the "Buyer / Adoptee…" label
    const label = screen.getByText('Buyer / Adoptee (from waitlist or manual)');
    const select = label.closest('div').querySelector('select');
    fireEvent.click(select);
    // Peanut = Female Fancy Rat: only Jane (Fancy Rat / Female) fits; Sam (Fancy Mouse) does not
    await waitFor(() => {
        const optionTexts = Array.from(select.querySelectorAll('option')).map(o => o.textContent);
        expect(optionTexts.some(t => t.includes('Jane'))).toBe(true);
        expect(optionTexts.some(t => t.includes('Sam'))).toBe(false);
    });
});

test('assigning a buyer saves the reservation via PUT', async () => {
    await setup();
    const peanutCard = screen.getByTestId('animal-card-CTC1');
    fireEvent.click(within(peanutCard).getByText('Assign'));
    fireEvent.change(screen.getByPlaceholderText('Buyer name'), { target: { value: 'Sam' } });
    fireEvent.click(screen.getByText('Save'));
    await waitFor(() => expect(apiClient.put).toHaveBeenCalled());
    const [url, payload] = apiClient.put.mock.calls[0];
    expect(url).toBe('/animals/CTC1');
    expect(payload.reservedBuyerName).toBe('Sam');
    expect(payload.status).toBe('Booked');
});

test('rehomed button promotes the reservation to sale + rehomed status', async () => {
    await setup();
    const butterCard = screen.getByTestId('animal-card-CTC2');
    window.confirm = jest.fn(() => true);
    fireEvent.click(within(butterCard).getByText('Rehomed'));
    await waitFor(() => expect(apiClient.put).toHaveBeenCalled());
    const [url, payload] = apiClient.put.mock.calls[0];
    expect(url).toBe('/animals/CTC2');
    expect(payload.status).toBe('Rehomed');
    expect(payload.archived).toBe(true);
    expect(payload.salePrice).toBe(40);
    expect(payload.buyerName).toBe('Jane');
    expect(payload.saleDate).toBeTruthy();
});

test('waitlist tab shows active/history toggle and entry details', async () => {
    await setup();
    fireEvent.click(screen.getByText('Waitlist'));
    expect(await screen.findByText('Jane')).toBeTruthy();
    expect(screen.getByText('Fancy Rat')).toBeTruthy();
    fireEvent.click(screen.getByText(/History \(0\)/));
    expect(await screen.findByText('No history yet')).toBeTruthy();
});

test('adding a multi-species waitlist entry posts speciesRequests array', async () => {
    await setup();
    fireEvent.click(screen.getByText('Waitlist'));
    fireEvent.click(screen.getByText('Add to Waitlist'));
    await screen.findByText('New Waitlist Entry');
    fireEvent.change(screen.getByPlaceholderText('e.g. Jane Doe'), { target: { value: 'Test Buyer' } });
    // Species row 1: Fancy Mouse, 3 Male + 2 Female
    fireEvent.change(screen.getAllByPlaceholderText('e.g. Fancy Mouse')[0], { target: { value: 'Fancy Mouse' } });
    fireEvent.change(screen.getAllByLabelText('Male count')[0], { target: { value: '3' } });
    fireEvent.change(screen.getAllByLabelText('Female count')[0], { target: { value: '2' } });
    // Species row 2: Fancy Rat, 7 of any gender
    fireEvent.click(screen.getByText('+ Add species'));
    fireEvent.change(screen.getAllByPlaceholderText('e.g. Fancy Mouse')[1], { target: { value: 'Fancy Rat' } });
    fireEvent.change(screen.getAllByLabelText('Any count')[1], { target: { value: '7' } });
    fireEvent.click(screen.getByText('Add'));
    await waitFor(() => expect(apiClient.post).toHaveBeenCalledWith('/waitlist', expect.objectContaining({
        name: 'Test Buyer',
        speciesRequests: [
            expect.objectContaining({
                species: 'Fancy Mouse',
                amount: 5,
                genderCounts: [{ gender: 'Male', count: 3 }, { gender: 'Female', count: 2 }],
            }),
            expect.objectContaining({
                species: 'Fancy Rat',
                amount: 7,
                genderCounts: [{ gender: 'Any', count: 7 }],
            }),
        ],
    })));
});

test('waitlist card shows the per-gender split and fulfillment respects it', async () => {
    const split = [{
        _id: 'W9', name: 'Pat', speciesRequests: [{ species: 'Fancy Mouse', genderCounts: [{ gender: 'Male', count: 3 }, { gender: 'Female', count: 2 }], amount: 5 }],
        isActive: true,
        // 2 males assigned -> only 2/5 filled; a third female must not count toward the male slots
        assignedAnimals: [
            { id_public: 'A1', species: 'Fancy Mouse', gender: 'Male' },
            { id_public: 'A2', species: 'Fancy Mouse', gender: 'Male' },
        ],
    }];
    await setup({ waitlist: split });
    fireEvent.click(screen.getByText('Waitlist'));
    await screen.findByText('Pat');
    expect(screen.getByText(/3 Male \/ 2 Female/)).toBeTruthy();
    expect(screen.getByText(/2\/5/)).toBeTruthy();
});

test('active waitlist entry counts live animals reserved to it via reservedWaitlistEntryId', async () => {
    const live = [{
        _id: 'W10', name: 'Lee', contactInfo: 'lee@example.com',
        speciesRequests: [{ species: 'Fancy Mouse', genders: ['Female'], amount: 1 }],
        isActive: true,
        // No snapshot yet: the backend only writes assignedAnimals when the entry is finalized.
        assignedAnimals: [],
    }];
    const reservedAnimals = [
        ...animals,
        { id_public: 'CTC5', name: 'Nibbles', species: 'Fancy Mouse', gender: 'Female', status: 'Booked', reservedWaitlistEntryId: 'W10' },
    ];
    await setup({ waitlist: live, animals: reservedAnimals });
    fireEvent.click(screen.getByText('Waitlist'));
    await screen.findByText('Lee');
    // The live reservation counts toward the fulfillment, so the entry reads 1/1 and is fulfilled.
    expect(screen.getByText(/1\/1/)).toBeTruthy();
    expect(screen.getByText(/Fulfilled/)).toBeTruthy();
});

test('finalizing a waitlist entry calls the finalize endpoint', async () => {
    await setup();
    fireEvent.click(screen.getByText('Waitlist'));
    await screen.findByText('Jane');
    window.confirm = jest.fn(() => true);
    // Scope the Finalize button to Jane's entry (rows for Jane + Sam both render a button)
    const janeCard = screen.getByText('Jane').closest('[class*="space-y-2.5"]');
    fireEvent.click(within(janeCard).getByText('Finalize'));
    await waitFor(() => expect(apiClient.post).toHaveBeenCalledWith('/waitlist/W1/finalize'));
});

// --- Waitlist: assigning an existing contact -----------------------------------------------

// Opens the waitlist tab, opens the new-entry form and returns the form element.
const openNewWaitlistForm = async () => {
    fireEvent.click(screen.getByText('Waitlist'));
    fireEvent.click(screen.getByText('Add to Waitlist'));
    return await screen.findByText('New Waitlist Entry');
};

test('assigning a contact to a new waitlist entry posts its contactId', async () => {
    await setup();
    await openNewWaitlistForm();
    fireEvent.change(screen.getByPlaceholderText('e.g. Jane Doe'), { target: { value: 'Test Buyer' } });
    fireEvent.change(screen.getAllByPlaceholderText('e.g. Fancy Mouse')[0], { target: { value: 'Fancy Mouse' } });

    // Open the contact picker and choose an existing Contacts record.
    fireEvent.click(screen.getByText('Click to assign a contact'));
    await screen.findByText('Jane Doe (Doe Rats)');
    fireEvent.click(screen.getByText('Jane Doe (Doe Rats)'));

    // The form now shows the assigned contact and the address was copied into Contact Info.
    expect(screen.getByText('Jane Doe (Doe Rats)')).toBeTruthy();
    expect(screen.getByDisplayValue('Portland, USA')).toBeTruthy();

    fireEvent.click(screen.getByText('Add'));
    await waitFor(() => expect(apiClient.post).toHaveBeenCalledWith('/waitlist', expect.objectContaining({
        // The typed name was replaced by the contact's display name on assignment.
        name: 'Jane Doe (Doe Rats)',
        contactId: 'C1',
    })));
});

test('assigning a contact replaces the attendee name with the contact display name', async () => {
    await setup();
    await openNewWaitlistForm();
    fireEvent.change(screen.getByPlaceholderText('e.g. Jane Doe'), { target: { value: 'Test Buyer' } });
    fireEvent.change(screen.getAllByPlaceholderText('e.g. Fancy Mouse')[0], { target: { value: 'Fancy Mouse' } });

    fireEvent.click(screen.getByText('Click to assign a contact'));
    await screen.findByText('Jane Doe (Doe Rats)');
    fireEvent.click(screen.getByText('Jane Doe (Doe Rats)'));

    // The attendee name field now holds the contact's display name.
    expect(screen.getByPlaceholderText('e.g. Jane Doe').value).toBe('Jane Doe (Doe Rats)');

    fireEvent.click(screen.getByText('Add'));
    await waitFor(() => expect(apiClient.post).toHaveBeenCalledWith('/waitlist', expect.objectContaining({
        name: 'Jane Doe (Doe Rats)',
        contactId: 'C1',
    })));
});

test('the name stays editable after a contact is assigned', async () => {
    await setup();
    await openNewWaitlistForm();
    fireEvent.change(screen.getAllByPlaceholderText('e.g. Fancy Mouse')[0], { target: { value: 'Fancy Mouse' } });

    fireEvent.click(screen.getByText('Click to assign a contact'));
    await screen.findByText('Jane Doe (Doe Rats)');
    fireEvent.click(screen.getByText('Jane Doe (Doe Rats)'));

    // The user can still adjust the attendee name afterwards.
    fireEvent.change(screen.getByPlaceholderText('e.g. Jane Doe'), { target: { value: 'Jane D.' } });
    expect(screen.getByPlaceholderText('e.g. Jane Doe').value).toBe('Jane D.');

    fireEvent.click(screen.getByText('Add'));
    await waitFor(() => expect(apiClient.post).toHaveBeenCalledWith('/waitlist', expect.objectContaining({
        name: 'Jane D.',
        contactId: 'C1',
    })));
});

test('the contact picker only offers existing contact records', async () => {
    await setup();
    await openNewWaitlistForm();
    fireEvent.click(screen.getByText('Click to assign a contact'));
    await screen.findByText('Jane Doe (Doe Rats)');
    // No "Search User"/"Manual Entry" modes in the waitlist picker.
    expect(screen.queryByText('Search User')).toBeNull();
    expect(screen.queryByText('Manual Entry')).toBeNull();
});

test('editing a waitlist entry shows the linked contact and can change it', async () => {
    const linked = [{
        _id: 'W20', name: 'Pat', contactInfo: 'pat@example.com',
        contactId: { _id: 'C2', personalName: 'Sam Smith' }, contactName: 'Sam Smith',
        speciesRequests: [{ species: 'Fancy Mouse', genders: ['Any'], amount: 1 }],
        isActive: true, assignedAnimals: [],
    }];
    await setup({ waitlist: linked });
    fireEvent.click(screen.getByText('Waitlist'));
    await screen.findByText('Pat');
    fireEvent.click(screen.getByText('Edit'));
    await screen.findByText('Edit Waitlist Entry');

    // The current link is displayed both on the card and in the edit form.
    expect(screen.getAllByText('Sam Smith').length).toBeGreaterThan(0);

    // Change it to a different contact.
    fireEvent.click(screen.getByText('Change'));
    await screen.findByText('Jane Doe (Doe Rats)');
    fireEvent.click(screen.getByText('Jane Doe (Doe Rats)'));

    fireEvent.click(screen.getByText('Update'));
    await waitFor(() => expect(apiClient.patch).toHaveBeenCalledWith('/waitlist/W20', expect.objectContaining({
        contactId: 'C1',
    })));
});

test('the card shows the linked contact only when it differs from the attendee name', async () => {
    const same = [{
        _id: 'W30', name: 'Sam Smith', contactInfo: 'sam@example.com',
        contactId: { _id: 'C2', personalName: 'Sam Smith' }, contactName: 'Sam Smith',
        speciesRequests: [{ species: 'Fancy Mouse', genders: ['Any'], amount: 1 }],
        isActive: true, assignedAnimals: [],
    }];
    await setup({ waitlist: same });
    fireEvent.click(screen.getByText('Waitlist'));
    await screen.findByText('Sam Smith');
    // The attendee name already is the contact name, so it is not repeated.
    expect(screen.getAllByText('Sam Smith')).toHaveLength(1);
});

test('unlinking a contact sends contactId null', async () => {
    const linked = [{
        _id: 'W21', name: 'Lee', contactInfo: 'lee@example.com',
        contactId: { _id: 'C2', personalName: 'Sam Smith' }, contactName: 'Sam Smith',
        speciesRequests: [{ species: 'Fancy Mouse', genders: ['Any'], amount: 1 }],
        isActive: true, assignedAnimals: [],
    }];
    await setup({ waitlist: linked });
    fireEvent.click(screen.getByText('Waitlist'));
    await screen.findByText('Lee');
    fireEvent.click(screen.getByText('Edit'));
    await screen.findByText('Edit Waitlist Entry');

    fireEvent.click(screen.getByTitle('Unlink contact'));
    expect(screen.getByText('Click to assign a contact')).toBeTruthy();

    fireEvent.click(screen.getByText('Update'));
    await waitFor(() => expect(apiClient.patch).toHaveBeenCalledWith('/waitlist/W21', expect.objectContaining({
        contactId: null,
    })));
});

// --- Animals tab: filters + opening the full animal modal ---------------------------------
const cardIds = () => screen.queryAllByTestId(/^animal-card-/).map(c => c.getAttribute('data-testid').replace('animal-card-', ''));
const pick = (label, value) => fireEvent.change(screen.getByLabelText(`${label} filter`), { target: { value } });

test('filter by species narrows the list and only offers species that exist', async () => {
    await setup();
    const speciesSelect = screen.getByLabelText('Species filter');
    // Retired Doe is a Fancy Rat too, but only Rat + Mouse exist among sale animals
    expect(Array.from(speciesSelect.options).map(o => o.value)).toEqual(['', 'Fancy Mouse', 'Fancy Rat']);
    pick('Species', 'Fancy Mouse');
    expect(cardIds()).toEqual(['CTC4']);
    pick('Species', 'Fancy Rat');
    expect(cardIds().sort()).toEqual(['CTC1', 'CTC2']);
});

test('filter by gender', async () => {
    await setup();
    pick('Gender', 'Male');
    expect(cardIds()).toEqual(['CTC2']);
    pick('Gender', 'Female');
    expect(cardIds().sort()).toEqual(['CTC1', 'CTC4']);
});

test('filter by status (Available / Booked)', async () => {
    await setup();
    pick('Status', 'Booked');
    expect(cardIds()).toEqual(['CTC2']);
    pick('Status', 'Available');
    expect(cardIds().sort()).toEqual(['CTC1', 'CTC4']);
});

test('filter by assigned / unassigned', async () => {
    await setup();
    pick('Assigned', 'assigned');
    expect(cardIds()).toEqual(['CTC2']);
    pick('Assigned', 'unassigned');
    expect(cardIds().sort()).toEqual(['CTC1', 'CTC4']);
    pick('Assigned', 'all');
    expect(cardIds()).toHaveLength(3);
});

test('filters combine, show a count, and Clear filters resets them', async () => {
    await setup();
    pick('Species', 'Fancy Rat');
    pick('Assigned', 'unassigned');
    expect(cardIds()).toEqual(['CTC1']);
    expect(screen.getByText('Showing 1 of 3 animals')).toBeTruthy();
    // A combination with no matches shows the empty state instead of a blank page
    pick('Gender', 'Male');
    expect(cardIds()).toEqual([]);
    fireEvent.click(screen.getByText('Clear filters'));
    expect(cardIds()).toHaveLength(3);
    expect(screen.queryByText('Clear filters')).toBeNull();
});

test('clicking the animal image opens the full animal modal for that animal', async () => {
    const { onViewAnimal } = await setup();
    fireEvent.click(within(screen.getByTestId('animal-card-CTC2')).getByLabelText('Open Butter'));
    expect(onViewAnimal).toHaveBeenCalledTimes(1);
    expect(onViewAnimal.mock.calls[0][0]).toEqual(expect.objectContaining({ id_public: 'CTC2', name: 'Butter' }));
});

test('edits made in the animal modal (animal-updated) are reflected in the list', async () => {
    await setup();
    // Booked -> filter shows Butter; modal changes Peanut to Booked, so it now matches too
    pick('Status', 'Booked');
    expect(cardIds()).toEqual(['CTC2']);
    window.dispatchEvent(new CustomEvent('animal-updated', { detail: { id_public: 'CTC1', status: 'Booked' } }));
    await waitFor(() => expect(cardIds().sort()).toEqual(['CTC1', 'CTC2']));
    // ...and moving Butter to Retired drops it from the sale list entirely
    window.dispatchEvent(new CustomEvent('animal-updated', { detail: { id_public: 'CTC2', status: 'Retired' } }));
    await waitFor(() => expect(cardIds()).toEqual(['CTC1']));
});


