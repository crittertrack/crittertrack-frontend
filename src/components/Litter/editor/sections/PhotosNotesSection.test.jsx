import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import PhotosNotesSection from './PhotosNotesSection';

const props = {
    form: { notes: '' },
    setField: jest.fn(),
    isEdit: true,
    savedImages: [{ url: 'https://example.test/legacy.jpg', r2Key: 'legacy-photo' }],
    pendingImages: [],
    uploading: false,
    onUpload: jest.fn(),
    onStage: jest.fn(),
    onDeleteSaved: jest.fn(),
    onRemovePending: jest.fn(),
    onUpdatePending: jest.fn(),
    onSaveImageMetadata: jest.fn().mockResolvedValue(undefined),
    onPhotoMetadataDirtyChange: jest.fn(),
    linkedOffspring: [{ id_public: 'CTC1', name: 'Pip' }],
};

test('edits and saves optional image details while showing a legacy photo as the fallback cover', async () => {
    render(<PhotosNotesSection {...props} />);

    expect(screen.getByAltText('Litter gallery 1').getAttribute('src')).toBe('https://example.test/legacy.jpg');
    expect(screen.getByText('Cover')).toBeTruthy();

    fireEvent.change(screen.getByLabelText('Photo caption'), { target: { value: 'First outing' } });
    fireEvent.change(screen.getByLabelText('Photo capture date'), { target: { value: '2026-10-31' } });
    fireEvent.change(screen.getByLabelText('Associated offspring'), { target: { value: 'CTC1' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save photo details' }));

    await waitFor(() => expect(props.onSaveImageMetadata).toHaveBeenCalledWith('legacy-photo', {
        caption: 'First outing',
        captureDate: '2026-10-31',
        offspringId_public: 'CTC1',
        isCover: true,
    }));
});

test('renders legacy string image URLs in the gallery editor', () => {
    render(<PhotosNotesSection {...props} savedImages={['https://example.test/old-format.jpg']} />);
    expect(screen.getByAltText('Litter gallery 1').getAttribute('src')).toBe('https://example.test/old-format.jpg');
});
