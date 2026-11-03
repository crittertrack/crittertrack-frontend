import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import UseSupplyForm from './UseSupplyForm';
import FinanceOverviewCard from './FinanceOverviewCard';
import apiClient from '../../utils/apiClient';

jest.mock('../../utils/apiClient', () => ({ __esModule: true, default: { get: jest.fn(), post: jest.fn() } }));

const supplies = [
    { _id: 's1', name: 'Mash', unit: 'kg', currentStock: 2, costPerUnit: 10 },
    { _id: 's2', name: 'Pellets', unit: 'g', currentStock: 500, costPerUnit: null },
];

beforeEach(() => {
    apiClient.get.mockReset();
    apiClient.post.mockReset();
    apiClient.get.mockResolvedValue({ data: supplies });
    apiClient.post.mockResolvedValue({ data: {} });
});

describe('UseSupplyForm', () => {
    it('records a use for a litter with the chosen supply, quantity and unit', async () => {
        const onDone = jest.fn();
        render(<UseSupplyForm litterId="CTL1" onDone={onDone} onCancel={jest.fn()} />);

        await screen.findByTestId('use-supply-select');
        fireEvent.change(screen.getByTestId('use-supply-select'), { target: { value: 's1' } });
        fireEvent.change(screen.getByTestId('use-supply-qty'), { target: { value: '50' } });
        fireEvent.change(screen.getByLabelText('Unit'), { target: { value: 'g' } });
        fireEvent.click(screen.getByText('Record use'));

        await waitFor(() => expect(apiClient.post).toHaveBeenCalled());
        expect(apiClient.post).toHaveBeenCalledWith('/supplies/use', expect.objectContaining({
            supplyId: 's1', quantity: 50, unit: 'g', litterId: 'CTL1',
        }));
        await waitFor(() => expect(onDone).toHaveBeenCalled());
    });

    it('warns when the chosen supply has no price', async () => {
        render(<UseSupplyForm animalId="CTC1" onDone={jest.fn()} onCancel={jest.fn()} />);
        await screen.findByTestId('use-supply-select');
        fireEvent.change(screen.getByTestId('use-supply-select'), { target: { value: 's2' } });
        expect(screen.getByTestId('use-supply-unpriced')).toBeTruthy();
    });

    it('asks for a supply and a quantity before saving', async () => {
        render(<UseSupplyForm litterId="CTL1" onDone={jest.fn()} onCancel={jest.fn()} />);
        await screen.findByTestId('use-supply-select');
        fireEvent.click(screen.getByText('Record use'));
        expect(screen.getByRole('alert').textContent).toMatch(/Choose a supply/);
        expect(apiClient.post).not.toHaveBeenCalled();
    });

    it('shows the server message when the use is rejected', async () => {
        apiClient.post.mockRejectedValue({ response: { data: { message: 'Cannot convert ml to the inventory unit kg.' } } });
        render(<UseSupplyForm litterId="CTL1" onDone={jest.fn()} onCancel={jest.fn()} />);
        await screen.findByTestId('use-supply-select');
        fireEvent.change(screen.getByTestId('use-supply-select'), { target: { value: 's1' } });
        fireEvent.change(screen.getByTestId('use-supply-qty'), { target: { value: '5' } });
        fireEvent.click(screen.getByText('Record use'));
        await waitFor(() => expect(screen.getByRole('alert').textContent).toMatch(/Cannot convert/));
    });
});

describe('FinanceOverviewCard supplies used', () => {
    const data = {
        totalCost: 40, totalRevenue: 0, net: -40, expectedRevenue: 0, costByCategory: { medical: 40 },
        costRecoupedPercent: 0, breakEvenRemaining: 40, costPerOffspringBorn: 5, offspring: { kept: 8 },
        usage: {
            totalCost: 3.5, count: 3, unpricedCount: 1, unpricedSupplies: ['Pellets'],
            bySupply: [{ supplyName: 'Mash', unit: 'kg', quantity: 0.35, cost: 3.5 }],
        },
    };

    it('shows supplies used separately and warns about unpriced supplies', async () => {
        apiClient.get.mockResolvedValue({ data });
        render(<FinanceOverviewCard kind="litter" id="CTL1" />);
        await waitFor(() => expect(screen.getByTestId('finance-usage')).toBeTruthy());
        expect(screen.getByTestId('finance-usage').textContent).toContain('Mash');
        expect(screen.getByTestId('finance-usage').textContent).toContain('350 g');
        expect(screen.getByTestId('finance-unpriced').textContent).toMatch(/Pellets/);
    });

    it('opens the use-supplies form and reloads after recording', async () => {
        apiClient.get.mockImplementation((url) => Promise.resolve({ data: url === '/supplies' ? supplies : data }));
        render(<FinanceOverviewCard kind="litter" id="CTL1" />);
        fireEvent.click(await screen.findByTestId('open-use-supply'));
        await screen.findByTestId('use-supply-form');
        // The dropdown only renders once the supplies have loaded.
        await screen.findByTestId('use-supply-select');

        fireEvent.change(screen.getByTestId('use-supply-select'), { target: { value: 's1' } });
        fireEvent.change(screen.getByTestId('use-supply-qty'), { target: { value: '1' } });
        fireEvent.click(screen.getByText('Record use'));

        await waitFor(() => expect(apiClient.post).toHaveBeenCalledWith('/supplies/use', expect.objectContaining({ litterId: 'CTL1' })));
        await waitFor(() => expect(screen.queryByTestId('use-supply-form')).toBeNull());
        const overviewCalls = apiClient.get.mock.calls.filter(([url]) => url === '/budget/overview/litter/CTL1');
        expect(overviewCalls.length).toBe(2);
    });
});
