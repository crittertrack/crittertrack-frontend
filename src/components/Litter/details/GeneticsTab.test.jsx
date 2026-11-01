import React from 'react';
import { render, screen, within } from '@testing-library/react';
import apiClient from '../../../utils/apiClient';
import GeneticsTab from './GeneticsTab';

jest.mock('../../../utils/apiClient', () => ({
    get: jest.fn().mockResolvedValue({ data: {} }),
}));

describe('GeneticsTab expected offspring', () => {
    it('shows a future-release message in unsupported genetics sections', () => {
        render(
            <GeneticsTab
                litter={{
                    species: 'Rabbit',
                    expectedTraits: [{ trait: 'Black', probability: 100 }],
                    sire: { geneticCode: 'a/a' },
                    dam: { geneticCode: 'A/a' },
                }}
                offspring={[{ color: 'Black' }]}
            />,
        );

        const discoveriesSection = screen.getByText('Genetic Discoveries').parentElement;
        const expectedSection = screen.getByText('Expected Offspring').parentElement;
        const confirmedSection = screen.getByText('Confirmed Offspring').parentElement;
        expect(within(discoveriesSection).getByText(
            'Genetic discovery comparisons for this species are coming in a future release.',
        )).toBeTruthy();
        const futureCalculationMessage = 'Genetic calculations for this species are coming in a future release.';
        expect(within(expectedSection).getByText(futureCalculationMessage)).toBeTruthy();
        expect(within(confirmedSection).getByText(futureCalculationMessage)).toBeTruthy();
        expect(screen.queryByText('No expected traits recorded.')).toBeNull();
    });

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

    it('shows Fancy Rat phenotype discoveries and parent code recommendations', () => {
        render(
            <GeneticsTab
                litter={{
                    species: 'Fancy Rat',
                    sire: { geneticCode: 'a/a B/B' },
                    dam: { geneticCode: 'a/a B/B' },
                }}
                offspring={[{ geneticCode: 'a/a b/b' }]}
            />,
        );

        expect(screen.getAllByText('Chocolate').length).toBeGreaterThan(0);
        expect(screen.getByText('Review Sire genetic code')).toBeTruthy();
        expect(screen.getByText('Review Dam genetic code')).toBeTruthy();
    });

    it('shows Syrian Hamster discoveries and suggested parent updates', () => {
        render(
            <GeneticsTab
                litter={{
                    species: 'Syrian Hamster',
                    sire: { geneticCode: 'a/a E/E' },
                    dam: { geneticCode: 'a/a E/E' },
                }}
                offspring={[{ geneticCode: 'a/a e/e' }]}
            />,
        );

        expect(screen.getAllByText('Black Eyed Cream').length).toBeGreaterThan(0);
        expect(screen.getByText('Review Sire genetic code')).toBeTruthy();
        expect(screen.getByText('Review Dam genetic code')).toBeTruthy();
        expect(screen.getAllByText('E/e')).toHaveLength(2);
    });

    it('shows Campbell dwarf hamster discoveries and suggested parent updates', () => {
        render(
            <GeneticsTab
                litter={{
                    species: "Campbell's Dwarf Hamster",
                    sire: { geneticCode: 'a/a B/B' },
                    dam: { geneticCode: 'a/a B/B' },
                }}
                offspring={[{ geneticCode: 'a/a b/b' }]}
            />,
        );

        expect(screen.getAllByText('Chocolate').length).toBeGreaterThan(0);
        expect(screen.getByText('Review Sire genetic code')).toBeTruthy();
        expect(screen.getByText('Review Dam genetic code')).toBeTruthy();
        expect(screen.getAllByText('B/b')).toHaveLength(2);
    });

    it('shows Russian Dwarf Hamster discoveries and suggested parent updates', () => {
        render(
            <GeneticsTab
                litter={{
                    species: 'Russian Dwarf Hamster',
                    sire: { geneticCode: 'a/a D/D' },
                    dam: { geneticCode: 'a/a D/D' },
                }}
                offspring={[{ geneticCode: 'a/a d/d' }]}
            />,
        );

        expect(screen.getAllByText('Russian Blue').length).toBeGreaterThan(0);
        expect(screen.getByText('Review Sire genetic code')).toBeTruthy();
        expect(screen.getByText('Review Dam genetic code')).toBeTruthy();
        expect(screen.getAllByText('D/d')).toHaveLength(2);
    });

    it('shows Ball Python discoveries and suggested parent updates', () => {
        render(
            <GeneticsTab
                litter={{
                    species: 'Ball Python',
                    sire: { geneticCode: 'Cl/Cl' },
                    dam: { geneticCode: 'Cl/Cl' },
                }}
                offspring={[{ geneticCode: 'cl/cl' }]}
            />,
        );

        const discoveriesSection = screen.getByText('Genetic Discoveries').parentElement;
        expect(within(discoveriesSection).getByText('Clown')).toBeTruthy();
        expect(within(discoveriesSection).getByText('Review Sire genetic code')).toBeTruthy();
        expect(within(discoveriesSection).getByText('Review Dam genetic code')).toBeTruthy();
        expect(within(discoveriesSection).getAllByText('Cl/cl')).toHaveLength(2);
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
