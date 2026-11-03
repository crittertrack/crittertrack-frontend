import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import FinanceOverviewCard from './FinanceOverviewCard';
import apiClient from '../../utils/apiClient';

jest.mock('../../utils/apiClient', () => ({ __esModule: true, default: { get: jest.fn(), post: jest.fn() } }));

const litterData = {
    totalCost: 120, totalRevenue: 70, net: -50, costRecoupedPercent: 58, breakEvenRemaining: 50,
    expectedRevenue: 50, reservedDeposit: 10, costPerOffspringBorn: 15,
    costByCategory: { medical: 80, food: 40 },
    offspring: { sold: 1, booked: 1, available: 1, kept: 2, deceased: 1, cull: 1 },
    offspringDetails: [
        { id: 'A', displayName: 'Sir Milo Jr', status: 'available', amount: 40, deposit: null, depositPaid: null, amountPaid: null },
        { id: 'B', displayName: 'Nala', status: 'booked', amount: 50, deposit: 10, depositPaid: true, amountPaid: false },
        { id: 'C', displayName: 'Rex', status: 'sold', amount: 60, deposit: null, depositPaid: null, amountPaid: true },
        { id: 'D', displayName: 'Kept One', status: 'kept', amount: null, deposit: null, depositPaid: null, amountPaid: null },
        { id: 'E', displayName: 'Gone', status: 'deceased', amount: null, deposit: null, depositPaid: null, amountPaid: null },
        { id: 'F', displayName: 'Culled One', status: 'cull', amount: null, deposit: null, depositPaid: null, amountPaid: null },
    ],
};

beforeEach(() => { apiClient.get.mockReset(); apiClient.post.mockReset(); });

describe('FinanceOverviewCard', () => {
    it('shows the litter stat cards and category costs', async () => {
        apiClient.get.mockResolvedValue({ data: litterData });
        render(<FinanceOverviewCard kind="litter" id="CTL1" />);

        await waitFor(() => expect(screen.getByTestId('finance-recouped')).toBeTruthy());
        expect(apiClient.get).toHaveBeenCalledWith('/budget/overview/litter/CTL1');
        expect(screen.getByTestId('finance-recouped').textContent).toContain('58%');
        expect(screen.getByTestId('finance-categories').textContent).toContain('Medical & vet');
        // The old "Expected (reserved)" card is gone.
        expect(screen.queryByTestId('finance-expected')).toBeNull();
    });

    it('lists offspring in a table with prefix/name/suffix, status, deposit and full price', async () => {
        apiClient.get.mockResolvedValue({ data: litterData });
        render(<FinanceOverviewCard kind="litter" id="CTL1" />);

        const table = await screen.findByTestId('finance-offspring-details');
        const rows = table.querySelectorAll('tbody tr');
        expect(rows).toHaveLength(6);
        expect(rows[0].textContent).toContain('Sir Milo Jr');
        expect(rows[0].textContent).toContain('Available');
        expect(rows[1].textContent).toContain('Booked');
        expect(rows[2].textContent).toContain('Sold');
        expect(rows[3].textContent).toContain('Kept');
        expect(rows[4].textContent).toContain('Deceased');
        expect(rows[5].textContent).toContain('Culled');
        expect(table.textContent).toContain('Full price');
        expect(table.textContent).toContain('Deposit');
    });

    it('colours price badges: green paid, red due, gray not applicable', async () => {
        apiClient.get.mockResolvedValue({ data: litterData });
        render(<FinanceOverviewCard kind="litter" id="CTL1" />);

        const table = await screen.findByTestId('finance-offspring-details');
        const rows = table.querySelectorAll('tbody tr');
        const tones = (row) => Array.from(row.querySelectorAll('[data-tone]')).map(el => el.getAttribute('data-tone'));
        expect(tones(rows[1])).toEqual(['paid', 'due']); // booked: deposit done, balance still due
        expect(tones(rows[2])).toEqual(['paid']); // sold: paid
        expect(tones(rows[0])).toEqual(['na']); // available: asking price only
        expect(tones(rows[3])).toEqual([]); // kept: nothing to show
    });

    it('shows a total row under the deposit and full price columns', async () => {
        apiClient.get.mockResolvedValue({ data: litterData });
        render(<FinanceOverviewCard kind="litter" id="CTL1" />);

        const table = await screen.findByTestId('finance-offspring-details');
        const footer = table.querySelector('tfoot').textContent;
        expect(footer).toContain('Total');
        expect(footer).toContain('10.00'); // deposits
        expect(footer).toContain('150.00'); // 40 + 50 + 60
    });

    it('shows the supplies as a table below the offspring table', async () => {
        apiClient.get.mockResolvedValue({ data: {
            ...litterData,
            usage: { count: 1, totalCost: 6, unpricedCount: 0, unpricedSupplies: [], bySupply: [{ supplyName: 'Aspen', unit: 'kg', quantity: 3, cost: 6 }] },
        } });
        render(<FinanceOverviewCard kind="litter" id="CTL1" />);

        const supplies = await screen.findByTestId('finance-supplies');
        expect(supplies.querySelector('table')).toBeTruthy();
        expect(supplies.textContent).toContain('Aspen');
        expect(supplies.textContent).toContain('3 kg');
    });

    it('adds a manual litter expense and refreshes the numbers', async () => {
        apiClient.get.mockResolvedValue({ data: litterData });
        apiClient.post.mockResolvedValue({ data: {} });
        render(<FinanceOverviewCard kind="litter" id="CTL1" />);

        fireEvent.click(await screen.findByTestId('open-manual-expense'));
        fireEvent.change(screen.getByLabelText('Amount'), { target: { value: '25.5' } });
        fireEvent.change(screen.getByLabelText('Category'), { target: { value: 'medical' } });
        fireEvent.change(screen.getByLabelText('Note'), { target: { value: 'Vet check' } });
        fireEvent.submit(screen.getByTestId('manual-expense-form'));

        await waitFor(() => expect(apiClient.post).toHaveBeenCalled());
        const [url, body] = apiClient.post.mock.calls[0];
        expect(url).toBe('/budget/litters/CTL1/manual-expense');
        expect(body).toEqual(expect.objectContaining({ amount: 25.5, category: 'medical', note: 'Vet check' }));
        await waitFor(() => expect(apiClient.get).toHaveBeenCalledTimes(2));
        expect(screen.queryByTestId('manual-expense-form')).toBeNull();
    });

    it('rejects an empty expense amount without calling the server', async () => {
        apiClient.get.mockResolvedValue({ data: litterData });
        render(<FinanceOverviewCard kind="litter" id="CTL1" />);

        fireEvent.click(await screen.findByTestId('open-manual-expense'));
        fireEvent.submit(screen.getByTestId('manual-expense-form'));

        expect((await screen.findByRole('alert')).textContent).toMatch(/amount/i);
        expect(apiClient.post).not.toHaveBeenCalled();
    });

    it('does not offer the manual expense button on an animal', async () => {
        apiClient.get.mockResolvedValue({ data: { totalCost: 10, totalRevenue: 0, net: -10, expectedRevenue: 0, costByCategory: { food: 10 } } });
        render(<FinanceOverviewCard kind="animal" id="CTC9" />);

        await screen.findByTestId('finance-net');
        expect(screen.queryByTestId('open-manual-expense')).toBeNull();
    });

    it('shows animal net instead of litter-only stats', async () => {
        apiClient.get.mockResolvedValue({ data: { totalCost: 10, totalRevenue: 0, net: -10, expectedRevenue: 0, costByCategory: { food: 10 } } });
        render(<FinanceOverviewCard kind="animal" id="CTC9" />);

        await waitFor(() => expect(screen.getByTestId('finance-net')).toBeTruthy());
        expect(apiClient.get).toHaveBeenCalledWith('/budget/overview/animal/CTC9');
        expect(screen.queryByTestId('finance-recouped')).toBeNull();
    });

    it('shows a helpful empty message when nothing is recorded', async () => {
        apiClient.get.mockResolvedValue({ data: { totalCost: 0, totalRevenue: 0, net: 0, expectedRevenue: 0, costByCategory: {}, offspring: {} } });
        render(<FinanceOverviewCard kind="litter" id="CTL2" />);

        await waitFor(() => expect(screen.getByText(/No costs or sales recorded yet/)).toBeTruthy());
    });

    it('renders nothing when the record is not yours (404)', async () => {
        apiClient.get.mockRejectedValue({ response: { status: 404 } });
        const { container } = render(<FinanceOverviewCard kind="animal" id="CTC3" />);

        await waitFor(() => expect(apiClient.get).toHaveBeenCalled());
        await waitFor(() => expect(container.firstChild).toBeNull());
    });

    it('shows a retryable error for other failures', async () => {
        apiClient.get.mockRejectedValueOnce({ response: { status: 500 } });
        apiClient.get.mockResolvedValueOnce({ data: litterData });
        render(<FinanceOverviewCard kind="litter" id="CTL1" />);

        const retry = await screen.findByText('Retry');
        fireEvent.click(retry);
        await waitFor(() => expect(screen.getByTestId('finance-recouped')).toBeTruthy());
        expect(apiClient.get).toHaveBeenCalledTimes(2);
    });
});
