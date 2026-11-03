import React from 'react';
import { render, screen } from '@testing-library/react';
import GalleryTab from './GalleryTab';

test('shows photo details and places a selected cover image first', () => {
    render(
        <GalleryTab images={[
            { url: 'https://example.test/one.jpg', r2Key: 'one', caption: 'First photo' },
            { url: 'https://example.test/two.jpg', r2Key: 'two', caption: 'Cover photo', captureDate: '2026-10-30', isCover: true, offspringId_public: 'CTC1' },
        ]} />
    );

    expect(screen.getAllByRole('link')[0]).toBe(screen.getByRole('link', { name: 'Cover photo' }));
    expect(screen.getByText('Cover image')).toBeTruthy();
    expect(screen.getByText('Captured 2026-10-30')).toBeTruthy();
    expect(screen.getByText('Offspring: CTC1')).toBeTruthy();
});

test('continues displaying legacy string image URLs', () => {
    render(<GalleryTab images={['https://example.test/legacy.jpg']} />);
    expect(screen.getByAltText('Litter gallery 1')).toBeTruthy();
});
