import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import QRCodeLabelModal from './QRCodeLabelModal';
import { downloadBlob } from '../../utils/nativeDownload';

jest.mock('../../utils/nativeDownload', () => ({
    downloadBlob: jest.fn()
}));

beforeEach(() => {
    downloadBlob.mockReset();
    downloadBlob.mockResolvedValue(undefined);
});

it('downloads a QR code as an SVG file', async () => {
    render(
        <QRCodeLabelModal
            value="https://crittertrack.net/animal/CTC123"
            title="Mochi"
            subtitle="CTC123"
            onClose={jest.fn()}
        />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Download QR' }));
    await waitFor(() => expect(downloadBlob).toHaveBeenCalledTimes(1));
    expect(downloadBlob.mock.calls[0][0]).toBeInstanceOf(Blob);
    expect(downloadBlob.mock.calls[0][0].type).toContain('image/svg+xml');
    expect(downloadBlob.mock.calls[0][1]).toBe('Mochi-qr.svg');
});

it('opens a printable label with the record name and QR code', () => {
    const printWindow = {
        document: { write: jest.fn(), close: jest.fn() },
        opener: window
    };
    const openSpy = jest.spyOn(window, 'open').mockReturnValue(printWindow);
    render(
        <QRCodeLabelModal
            value="https://crittertrack.net/enclosures?open=enc123"
            title="Nursery Tank"
            subtitle="Aquarium"
            details={['ID: enc123']}
            onClose={jest.fn()}
        />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Print Label' }));
    const html = printWindow.document.write.mock.calls[0][0];
    expect(html).toContain('Nursery Tank');
    expect(html).toContain('ID: enc123');
    expect(html).toContain('<svg');
    expect(printWindow.document.close).toHaveBeenCalled();
    openSpy.mockRestore();
});
