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

const stubPngRendering = () => {
    const originalImage = global.Image;
    const originalCreateObjectURL = URL.createObjectURL;
    const originalRevokeObjectURL = URL.revokeObjectURL;
    const originalCreateElement = document.createElement.bind(document);
    global.Image = class { set src(_) { setTimeout(() => this.onload && this.onload(), 0); } };
    URL.createObjectURL = jest.fn(() => 'blob:qr');
    URL.revokeObjectURL = jest.fn();
    jest.spyOn(document, 'createElement').mockImplementation((tag, ...args) => {
        const element = originalCreateElement(tag, ...args);
        if (tag === 'canvas') {
            element.getContext = () => ({ fillRect: jest.fn(), drawImage: jest.fn(), fillText: jest.fn() });
            element.toBlob = (callback) => callback(new Blob(['png'], { type: 'image/png' }));
        }
        return element;
    });
    return () => {
        global.Image = originalImage;
        URL.createObjectURL = originalCreateObjectURL;
        URL.revokeObjectURL = originalRevokeObjectURL;
        document.createElement.mockRestore();
    };
};

it('downloads a QR code as a PNG image', async () => {
    const restore = stubPngRendering();
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
    expect(downloadBlob.mock.calls[0][0].type).toBe('image/png');
    expect(downloadBlob.mock.calls[0][1]).toBe('Mochi-qr.png');
    restore();
});

it('falls back to an SVG file if PNG conversion fails', async () => {
    const originalImage = global.Image;
    const originalCreateObjectURL = URL.createObjectURL;
    const originalRevokeObjectURL = URL.revokeObjectURL;
    global.Image = class { set src(_) { setTimeout(() => this.onerror && this.onerror(new Error('bad')), 0); } };
    URL.createObjectURL = jest.fn(() => 'blob:qr');
    URL.revokeObjectURL = jest.fn();
    render(<QRCodeLabelModal value="https://crittertrack.net/animal/CTC123" title="Mochi" onClose={jest.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: 'Download QR' }));
    await waitFor(() => expect(downloadBlob).toHaveBeenCalledTimes(1));
    expect(downloadBlob.mock.calls[0][0].type).toContain('image/svg+xml');
    expect(downloadBlob.mock.calls[0][1]).toBe('Mochi-qr.svg');
    global.Image = originalImage;
    URL.createObjectURL = originalCreateObjectURL;
    URL.revokeObjectURL = originalRevokeObjectURL;
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
