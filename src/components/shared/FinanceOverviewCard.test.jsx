import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import FinanceOverviewCard from './FinanceOverviewCard';
import apiClient from '../../utils/apiClient';

jest.mock('../../utils/apiClient', () => ({ __esModule: true, default: { get: jest.fn() } }));

const litterData = {
    totalCost: 120, totalRevenue: 60, net: -60, costRecoupedPercent: 50, breakEvenRemaining: 60,
    expectedRevenue: 50, reservedDeposit: 10, costPerOffspringBorn: 15,
    costByCategory: { medical: 80, food: 40 },
    offspring: { sold: 1, reserved: 1, available: 0, kept: 5, deceased: 0 },
};

beforeEach(() => { apiClient.get.mockReset(); });

describe('FinanceOverviewCard', () => {
    it('shows litter numbers with kept offspring labelled as no revenue', async () => {
        apiClient.get.mockResolvedValue({ data: litterData });
        render(<FinanceOverviewCard kind="litter" id="CTL1" />);

        await waitFor(() => expect(screen.getByTestId('finance-recouped')).toBeTruthy());
        expect(apiClient.get).toHaveBeenCalledWith('/budget/overview/litter/CTL1');
        expect(screen.getByTestId('finance-recouped').textContent).toContain('50%');
        expect(screen.getByTestId('finance-offspring').textContent).toContain('Kept, no revenue: 5');
        expect(screen.getByTestId('finance-expected')).toBeTruthy();
        expect(screen.getByTestId('finance-categories').textContent).toContain('Medical & vet');
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
