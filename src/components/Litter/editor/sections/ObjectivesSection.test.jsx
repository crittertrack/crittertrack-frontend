import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import ObjectivesSection from './ObjectivesSection';

describe('ObjectivesSection', () => {
    it('lets users edit objective notes and evaluation', () => {
        const setField = jest.fn();
        render(<ObjectivesSection form={{ breedingObjectives: [] }} setField={setField} />);

        fireEvent.change(screen.getByLabelText('Notes'), { target: { value: 'Keep an eye on coat quality.' } });
        fireEvent.change(screen.getByLabelText('Objective evaluation'), { target: { value: 'The litter met the temperament goal.' } });

        expect(setField).toHaveBeenNthCalledWith(1, 'objectivesNotes', 'Keep an eye on coat quality.');
        expect(setField).toHaveBeenNthCalledWith(2, 'objectivesEvaluation', 'The litter met the temperament goal.');
    });

    it('shows saved objective notes and evaluation in the edit form', () => {
        render(<ObjectivesSection
            form={{
                breedingObjectives: [],
                objectivesNotes: 'Review the line next season.',
                objectivesEvaluation: 'Most goals were met.',
            }}
            setField={jest.fn()}
        />);

        expect(screen.getByLabelText('Notes').value).toBe('Review the line next season.');
        expect(screen.getByLabelText('Objective evaluation').value).toBe('Most goals were met.');
    });
});
