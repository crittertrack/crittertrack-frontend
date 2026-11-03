import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import TransactionAttachments from './TransactionAttachments';
import apiClient from '../utils/apiClient';
import { generateReceiptPdf } from '../utils/receiptPdf';
import { openAttachment } from '../utils/openAttachment';

jest.mock('../utils/apiClient', () => ({ __esModule: true, default: { get: jest.fn(), post: jest.fn(), delete: jest.fn() } }));
jest.mock('../utils/receiptPdf', () => ({ generateReceiptPdf: jest.fn() }));
jest.mock('../utils/openAttachment', () => ({ openAttachment: jest.fn() }));

const base = { _id: 't1', type: 'sale', price: 50, animalName: 'Milo', attachments: [] };
const withFile = {
    ...base, receiptNumber: 'R-0001',
    attachments: [{ _id: 'a1', key: 'receipts/u1/a.pdf', filename: 'vet.pdf', mimeType: 'application/pdf', size: 2048, kind: 'upload' }],
};

const renderPanel = (transaction = base, onChange = jest.fn()) => {
    render(<TransactionAttachments transaction={transaction} issuerName="Me" currencySymbol="$" onChange={onChange} />);
    return onChange;
};

beforeEach(() => {
    Object.values(apiClient).forEach(fn => fn.mockReset());
    generateReceiptPdf.mockReset();
    openAttachment.mockReset();
});

describe('TransactionAttachments', () => {
    it('shows an empty hint, then the files with receipt number and size', () => {
        renderPanel();
        expect(screen.getByText(/No files yet/)).toBeTruthy();
    });

    it('lists attached files with a link, kind and size', () => {
        renderPanel(withFile);
        const list = screen.getByTestId('attachment-list');
        expect(list.textContent).toContain('vet.pdf');
        expect(list.textContent).toContain('2 KB');
        expect(list.querySelector('a')).toBeNull(); // no public link is ever rendered
        expect(screen.getByText(/R-0001/)).toBeTruthy();
    });

    it('generates a receipt: issues a number, builds the PDF, uploads it as a receipt', async () => {
        const numbered = { ...base, receiptNumber: 'R-0001' };
        const saved = { ...numbered, attachments: [{ _id: 'a2', url: 'u', filename: 'R-0001.pdf', mimeType: 'application/pdf', size: 10, kind: 'receipt' }] };
        apiClient.post.mockImplementation((url) => Promise.resolve({ data: url.endsWith('receipt-number') ? numbered : saved }));
        const blob = new Blob(['pdf'], { type: 'application/pdf' });
        generateReceiptPdf.mockResolvedValue({ blob, filename: 'R-0001.pdf' });
        const onChange = renderPanel();

        fireEvent.click(screen.getByTestId('generate-receipt'));

        await waitFor(() => expect(onChange).toHaveBeenCalledWith(saved));
        expect(apiClient.post).toHaveBeenNthCalledWith(1, '/budget/transactions/t1/receipt-number');
        expect(generateReceiptPdf).toHaveBeenCalledWith({ transaction: numbered, issuerName: 'Me', currencySymbol: '$' });
        const [url, body] = apiClient.post.mock.calls[1];
        expect(url).toBe('/budget/transactions/t1/attachments');
        expect(body.get('kind')).toBe('receipt');
    });

    it('uploads a chosen file as a normal attachment', async () => {
        apiClient.post.mockResolvedValue({ data: withFile });
        const onChange = renderPanel();
        const file = new File(['img'], 'bill.png', { type: 'image/png' });

        fireEvent.change(screen.getByTestId('attachment-input'), { target: { files: [file] } });

        await waitFor(() => expect(onChange).toHaveBeenCalledWith(withFile));
        const [, body] = apiClient.post.mock.calls[0];
        expect(body.get('kind')).toBe('upload');
        expect(body.get('file').name).toBe('bill.png');
    });

    it('rejects an oversized file before uploading', async () => {
        renderPanel();
        const big = new File(['x'], 'big.pdf', { type: 'application/pdf' });
        Object.defineProperty(big, 'size', { value: 6 * 1024 * 1024 });

        fireEvent.change(screen.getByTestId('attachment-input'), { target: { files: [big] } });

        expect((await screen.findByRole('alert')).textContent).toMatch(/5 MB/);
        expect(apiClient.post).not.toHaveBeenCalled();
    });

    it('shows the server message when an upload fails', async () => {
        apiClient.post.mockRejectedValue({ response: { data: { message: 'Could not store the file. Please try again.' } } });
        renderPanel();
        fireEvent.change(screen.getByTestId('attachment-input'), { target: { files: [new File(['i'], 'a.png', { type: 'image/png' })] } });
        expect((await screen.findByRole('alert')).textContent).toMatch(/Could not store/);
    });

    it('opens a file through the authenticated download, not a public link', async () => {
        openAttachment.mockResolvedValue();
        renderPanel(withFile);
        fireEvent.click(screen.getByTestId('open-attachment'));
        await waitFor(() => expect(openAttachment).toHaveBeenCalledWith('t1', withFile.attachments[0]));
    });

    it('tells the user when an older, non-private file cannot be opened', async () => {
        openAttachment.mockRejectedValue({ response: { status: 410 } });
        renderPanel(withFile);
        fireEvent.click(screen.getByTestId('open-attachment'));
        expect((await screen.findByRole('alert')).textContent).toMatch(/not stored privately/);
    });

    it('disables opening a legacy file that only has an old public link', () => {
        const legacy = { ...base, attachments: [{ _id: 'a9', url: 'https://x/old.pdf', filename: 'old.pdf', mimeType: 'application/pdf', size: 10, kind: 'upload' }] };
        renderPanel(legacy);
        expect(screen.getByTestId('open-attachment').disabled).toBe(true);
    });

    it('removes a file after confirmation, and keeps it when declined', async () => {
        const after = { ...withFile, attachments: [] };
        apiClient.delete.mockResolvedValue({ data: after });
        const spy = jest.spyOn(window, 'confirm');
        const onChange = renderPanel(withFile);

        spy.mockReturnValueOnce(false);
        fireEvent.click(screen.getByLabelText('Remove vet.pdf'));
        expect(apiClient.delete).not.toHaveBeenCalled();

        spy.mockReturnValueOnce(true);
        fireEvent.click(screen.getByLabelText('Remove vet.pdf'));
        await waitFor(() => expect(onChange).toHaveBeenCalledWith(after));
        expect(apiClient.delete).toHaveBeenCalledWith('/budget/transactions/t1/attachments/a1');
        spy.mockRestore();
    });
});
