import React from 'react';
import { render, screen } from '@testing-library/react';
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
});
