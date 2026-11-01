import React from 'react';
import { render, screen, within } from '@testing-library/react';
import apiClient from '../../../utils/apiClient';
import GeneticsTab from './GeneticsTab';

jest.mock('../../../utils/apiClient', () => ({
    get: jest.fn().mockResolvedValue({ data: {} }),
}));

describe('GeneticsTab expected offspring', () => {
    it('calculates traits from assigned parents when the litter has no species field', () => {
        render(
            <GeneticsTab
                litter={{
                    sire: {
                        species: 'Russian Dwarf Hamster',
                        geneticCode: 'a/a D/D P/P M/M ma/ma',
                    },
                    dam: {
                        species: 'Russian Dwarf Hamster',
                        geneticCode: 'A/a D/D P/P M/M ma/ma',
                    },
                }}
            />,
        );

        expect(screen.getByText('Expected Offspring')).toBeTruthy();
        expect(screen.getByText('Agouti')).toBeTruthy();
        expect(screen.getByText('Black')).toBeTruthy();
        expect(screen.queryByText('No expected traits recorded.')).toBeNull();
    });

    it('summarizes the offspring already loaded for the litter', () => {
        render(
            <GeneticsTab
                litter={{
                    species: 'Russian Dwarf Hamster',
                    sire: { geneticCode: 'a/a' },
                    dam: { geneticCode: 'A/a' },
                }}
                offspring={[
                    { color: 'Black' },
                    { color: 'Black' },
                    { color: 'Agouti' },
                    { color: 'Agouti' },
                ]}
            />,
        );

        expect(screen.getByText('Observed traits from 4 linked offspring.')).toBeTruthy();
        expect(screen.getByText('Color: Black')).toBeTruthy();
        expect(screen.getByText('Color: Agouti')).toBeTruthy();
        expect(screen.queryByText('No linked offspring recorded.')).toBeNull();
    });

    it('loads genetic codes for assigned parents when litter data omits them', async () => {
        apiClient.get.mockImplementation((url) => Promise.resolve({
            data: {
                geneticCode: url.endsWith('sire-id') ? 'B/B' : 'B/b',
            },
        }));

        render(
            <GeneticsTab
                litter={{
                    species: 'Fancy Mouse',
                    sire: { id_public: 'sire-id' },
                    dam: { id_public: 'dam-id' },
                }}
            />,
        );

        expect(await screen.findByText('Chocolate (carrier)')).toBeTruthy();
        expect(apiClient.get).toHaveBeenCalledWith('/animals/any/sire-id');
        expect(apiClient.get).toHaveBeenCalledWith('/animals/any/dam-id');
    });

    it('shows genetic discoveries and suggested parent updates without changing records', () => {
        render(
            <GeneticsTab
                litter={{
                    species: 'Fancy Mouse',
                    sire: { geneticCode: 'B/B' },
                    dam: { geneticCode: 'B/B' },
                }}
                offspring={[{ geneticCode: 'b/b' }]}
            />,
        );

        expect(screen.getAllByText('Chocolate').length).toBeGreaterThan(0);
        expect(screen.getByText('Review Sire genetic code')).toBeTruthy();
        expect(screen.getByText('Review Dam genetic code')).toBeTruthy();
        expect(screen.getAllByText('B/b')).toHaveLength(2);
        const discoveriesSection = screen.getByText('Genetic Discoveries').parentElement;
        expect(within(discoveriesSection).queryByText('100%')).toBeNull();
    });

    it('shows each expected and confirmed percentage only once beside its bar', () => {
        render(
            <GeneticsTab
                litter={{
                    species: 'Fancy Mouse',
                    sire: { geneticCode: 'B/B' },
                    dam: { geneticCode: 'B/b' },
                }}
                offspring={[
                    { geneticCode: 'B/B Go/Go' },
                    { geneticCode: 'B/b Go/Go' },
                ]}
            />,
        );

        const expectedSection = screen.getByText('Expected Offspring').parentElement;
        const confirmedSection = screen.getByText('Confirmed Offspring').parentElement;
        expect(within(expectedSection).getAllByText('50%')).toHaveLength(1);
        expect(within(expectedSection).getAllByText('100%')).toHaveLength(1);
        expect(within(confirmedSection).getAllByText('50%')).toHaveLength(1);
        expect(within(confirmedSection).getAllByText('100%')).toHaveLength(1);
    });
});
