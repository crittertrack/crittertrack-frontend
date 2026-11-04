import React from 'react';
import { render, screen, fireEvent, within, waitFor } from '@testing-library/react';
import apiClient from '../../utils/apiClient';
import ContactsListPage from './ContactsListPage';
import AddContactPage from './AddContactPage';
import ContactAssignModal from './ContactAssignModal';
import { contactHasCategory, getContactCategoryKeys, withCategory } from './contactCategories';

// react-router-dom (v7) doesn't resolve under this jest setup, so like the other suites it is
// mocked virtually with just the pieces these pages use.
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    __esModule: true,
    Link: ({ to, children, className }) => <a href={to} className={className}>{children}</a>,
    NavLink: ({ to, children, className }) => <a href={to} className={typeof className === 'function' ? className({ isActive: false }) : className}>{children}</a>,
    Outlet: () => null,
    useParams: () => ({ contactId: 'c9' }),
    useNavigate: () => mockNavigate,
}), { virtual: true });

jest.mock('../../utils/apiClient', () => ({
    __esModule: true,
    default: { get: jest.fn(), post: jest.fn(), put: jest.fn() },
}));

const contacts = [
    { _id: 'c1', personalName: 'Olive Owner', isKeeper: true, isBreeder: false, categories: [] },
    { _id: 'c2', personalName: 'Bob Breeder', isKeeper: false, isBreeder: true, breederStatus: 'active', categories: [] },
    { _id: 'c3', personalName: 'Vera Vet', isKeeper: false, isBreeder: false, categories: ['vet'] },
    { _id: 'c4', personalName: 'Jo Judge', isKeeper: true, isBreeder: false, categories: ['judge', 'vet'] },
];

describe('contact category helpers', () => {
    it('maps Owner and Breeder to the legacy flags and the rest to categories', () => {
        expect(contactHasCategory(contacts[0], 'owner')).toBe(true);
        expect(contactHasCategory(contacts[0], 'breeder')).toBe(false);
        expect(contactHasCategory(contacts[2], 'vet')).toBe(true);
        expect(getContactCategoryKeys(contacts[3])).toEqual(['owner', 'vet', 'judge']);
    });

    it('withCategory switches each kind on and off', () => {
        let form = { isKeeper: false, isBreeder: false, categories: [] };
        form = withCategory(form, 'owner', true);
        form = withCategory(form, 'judge', true);
        form = withCategory(form, 'judge', true);
        expect(form).toEqual({ isKeeper: true, isBreeder: false, categories: ['judge'] });
        form = withCategory(form, 'owner', false);
        form = withCategory(form, 'judge', false);
        expect(form).toEqual({ isKeeper: false, isBreeder: false, categories: [] });
    });
});

describe('ContactsListPage category filter', () => {
    beforeEach(() => {
        apiClient.get.mockResolvedValue({ data: contacts });
    });

    const setup = async () => {
        render(<ContactsListPage showModalMessage={jest.fn()} />);
        await screen.findByText('Olive Owner');
    };

    it('has a single Category dropdown with every category, and no category buttons', async () => {
        await setup();
        const select = screen.getByRole('combobox', { name: 'Category' });
        const options = within(select).getAllByRole('option').map(o => o.textContent);
        expect(options).toEqual(['All Categories', 'Owner', 'Breeder', 'Vet', 'Judge', 'Stud / Co-breeder', 'Rescue / Shelter', 'Trainer / Handler', 'Club / Association', 'Other']);
        expect(screen.queryByRole('button', { name: 'Owner' })).toBeNull();
        expect(screen.queryByRole('button', { name: 'Breeder' })).toBeNull();
    });

    it('filters by Owner, Breeder and an extra category through the same dropdown', async () => {
        await setup();
        const select = screen.getByRole('combobox', { name: 'Category' });

        fireEvent.change(select, { target: { value: 'owner' } });
        expect(screen.getByText('Olive Owner')).toBeTruthy();
        expect(screen.getByText('Jo Judge')).toBeTruthy();
        expect(screen.queryByText('Bob Breeder')).toBeNull();
        expect(screen.queryByText('Vera Vet')).toBeNull();

        fireEvent.change(select, { target: { value: 'breeder' } });
        expect(screen.getByText('Bob Breeder')).toBeTruthy();
        expect(screen.queryByText('Olive Owner')).toBeNull();

        fireEvent.change(select, { target: { value: 'vet' } });
        expect(screen.getByText('Vera Vet')).toBeTruthy();
        expect(screen.getByText('Jo Judge')).toBeTruthy();
        expect(screen.queryByText('Olive Owner')).toBeNull();

        fireEvent.change(select, { target: { value: '' } });
        expect(screen.getByText('Olive Owner')).toBeTruthy();
        expect(screen.getByText('Bob Breeder')).toBeTruthy();
    });

    it('shows the Breeder status dropdown only when the Breeder category is selected', async () => {
        await setup();
        const category = screen.getByRole('combobox', { name: 'Category' });
        expect(screen.queryByRole('combobox', { name: 'Breeder status' })).toBeNull();

        fireEvent.change(category, { target: { value: 'vet' } });
        expect(screen.queryByRole('combobox', { name: 'Breeder status' })).toBeNull();

        fireEvent.change(category, { target: { value: 'breeder' } });
        expect(screen.getByRole('combobox', { name: 'Breeder status' })).toBeTruthy();
    });

    it('clears a Retired status choice when leaving Breeder, so no hidden filter lingers', async () => {
        apiClient.get.mockResolvedValue({ data: [
            ...contacts,
            { _id: 'c5', personalName: 'Rita Retired', isKeeper: false, isBreeder: true, breederStatus: 'retired', categories: [] },
        ] });
        await setup();
        const category = screen.getByRole('combobox', { name: 'Category' });

        fireEvent.change(category, { target: { value: 'breeder' } });
        fireEvent.change(screen.getByRole('combobox', { name: 'Breeder status' }), { target: { value: 'retired' } });
        expect(screen.getByText('Rita Retired')).toBeTruthy();
        expect(screen.queryByText('Bob Breeder')).toBeNull();

        fireEvent.change(category, { target: { value: '' } });
        expect(screen.getByText('Olive Owner')).toBeTruthy();
        expect(screen.getByText('Bob Breeder')).toBeTruthy();
        expect(screen.getByText('Rita Retired')).toBeTruthy();
    });

    it('shows a badge for every category on a contact', async () => {
        await setup();
        const row = screen.getByText('Jo Judge').closest('a');
        expect(within(row).getByText('Owner')).toBeTruthy();
        expect(within(row).getByText('Vet')).toBeTruthy();
        expect(within(row).getByText('Judge')).toBeTruthy();
    });
});

describe('ContactDetailPage delete', () => {
    const detail = { _id: 'c9', personalName: 'Duplicate Dan', isKeeper: true, isBreeder: false, categories: [] };

    beforeEach(() => {
        mockNavigate.mockClear();
        apiClient.delete = jest.fn().mockResolvedValue({ data: { message: 'Contact deleted successfully' } });
        apiClient.get.mockImplementation((url) => Promise.resolve({ data: url === '/contacts/c9' ? detail : [] }));
    });

    const open = async (showModalMessage = jest.fn()) => {
        const ContactDetailPage = require('./ContactDetailPage').default;
        render(<ContactDetailPage showModalMessage={showModalMessage} />);
        await screen.findByRole('button', { name: /delete/i });
        return showModalMessage;
    };

    it('deletes the contact after confirmation and returns to the list', async () => {
        window.confirm = jest.fn(() => true);
        const showModalMessage = await open();
        fireEvent.click(screen.getByRole('button', { name: /delete/i }));
        await waitFor(() => expect(apiClient.delete).toHaveBeenCalledWith('/contacts/c9'));
        expect(window.confirm).toHaveBeenCalledWith(expect.stringContaining('Duplicate Dan'));
        await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/contacts'));
        expect(showModalMessage).toHaveBeenCalledWith('Success', expect.stringContaining('Duplicate Dan'));
    });

    it('does nothing when the confirmation is declined', async () => {
        window.confirm = jest.fn(() => false);
        await open();
        fireEvent.click(screen.getByRole('button', { name: /delete/i }));
        expect(apiClient.delete).not.toHaveBeenCalled();
        expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('shows an error and stays on the page when the delete fails', async () => {
        window.confirm = jest.fn(() => true);
        apiClient.delete.mockRejectedValue({ response: { data: { message: 'boom' } } });
        const showModalMessage = await open();
        fireEvent.click(screen.getByRole('button', { name: /delete/i }));
        await waitFor(() => expect(showModalMessage).toHaveBeenCalledWith('Error', expect.stringContaining('boom')));
        expect(mockNavigate).not.toHaveBeenCalledWith('/contacts');
    });
});

describe('ContactAssignModal category filter', () => {
    const pickerContacts = [
        ...contacts,
        { _id: 'c5', personalName: 'Rita Retired', isKeeper: false, isBreeder: true, breederStatus: 'retired', categories: ['vet'] },
    ];

    const open = async () => {
        apiClient.get.mockResolvedValue({ data: pickerContacts });
        render(<ContactAssignModal isOpen onClose={jest.fn()} onSelect={jest.fn()} target="Owner" contactOnly />);
        await screen.findByText('Olive Owner');
    };

    it('uses one Category dropdown instead of the Owners/Breeders buttons', async () => {
        await open();
        const select = screen.getByRole('combobox', { name: 'Category' });
        expect(within(select).getAllByRole('option').map(o => o.textContent)).toEqual(
            ['All Categories', 'Owner', 'Breeder', 'Vet', 'Judge', 'Stud / Co-breeder', 'Rescue / Shelter', 'Trainer / Handler', 'Club / Association', 'Other']
        );
        expect(screen.queryByRole('button', { name: 'Owners' })).toBeNull();
        expect(screen.queryByRole('button', { name: 'Breeders' })).toBeNull();
    });

    it('filters by Owner, Breeder and an extra category', async () => {
        await open();
        const select = screen.getByRole('combobox', { name: 'Category' });

        fireEvent.change(select, { target: { value: 'owner' } });
        expect(screen.getByText('Olive Owner')).toBeTruthy();
        expect(screen.getByText('Jo Judge')).toBeTruthy();
        expect(screen.queryByText('Bob Breeder')).toBeNull();

        fireEvent.change(select, { target: { value: 'breeder' } });
        expect(screen.getByText('Bob Breeder')).toBeTruthy();
        expect(screen.queryByText('Olive Owner')).toBeNull();

        fireEvent.change(select, { target: { value: 'judge' } });
        expect(screen.getByText('Jo Judge')).toBeTruthy();
        expect(screen.queryByText('Vera Vet')).toBeNull();
    });

    it('hides retired breeders by default, offers the toggle only for All/Breeder, and keeps them under other categories', async () => {
        await open();
        const select = screen.getByRole('combobox', { name: 'Category' });
        expect(screen.queryByText('Rita Retired')).toBeNull();
        expect(screen.getByLabelText('Show retired breeders')).toBeTruthy();

        fireEvent.click(screen.getByLabelText('Show retired breeders'));
        expect(screen.getByText('Rita Retired')).toBeTruthy();
        fireEvent.click(screen.getByLabelText('Show retired breeders'));

        fireEvent.change(select, { target: { value: 'vet' } });
        expect(screen.queryByLabelText('Show retired breeders')).toBeNull();
        expect(screen.getByText('Vera Vet')).toBeTruthy();
        expect(screen.getByText('Rita Retired')).toBeTruthy();
    });
});

describe('AddContactPage category assignment', () => {
    it('saves Owner and extra categories chosen in the single checklist', async () => {
        apiClient.post.mockResolvedValue({ data: {} });
        apiClient.get.mockResolvedValue({ data: [] });
        const { container } = render(<AddContactPage showModalMessage={jest.fn()} userProfile={{}} />);

        fireEvent.change(screen.getByLabelText(/personal name/i), { target: { value: 'Pat Person' } });
        fireEvent.click(screen.getByLabelText('Owner'));
        fireEvent.click(screen.getByLabelText('Vet'));
        fireEvent.submit(container.querySelector('form'));

        await waitFor(() => expect(apiClient.post).toHaveBeenCalledWith('/contacts', expect.objectContaining({
            isKeeper: true,
            isBreeder: false,
            categories: ['vet'],
        })));
    });
});
