import axios from 'axios';
import apiClient from './apiClient';
import { attachmentFileUrl, openAttachment } from './openAttachment';

jest.mock('axios', () => ({ __esModule: true, default: { get: jest.fn(), create: jest.fn(() => ({ interceptors: { request: { use: jest.fn() }, response: { use: jest.fn() } }, get: jest.fn() })) } }));
jest.mock('./apiClient', () => ({ __esModule: true, default: { get: jest.fn() } }));
jest.mock('@capacitor/core', () => ({ Capacitor: { isNativePlatform: () => false } }));
jest.mock('./nativeDownload', () => ({ downloadBlob: jest.fn() }));

const attachment = { _id: 'a1', filename: 'vet.pdf', mimeType: 'application/pdf' };

beforeEach(() => {
    axios.get.mockReset();
    apiClient.get.mockReset();
    localStorage.setItem('authToken', 'tok123');
    global.URL.createObjectURL = jest.fn(() => 'blob:temp');
    global.URL.revokeObjectURL = jest.fn();
});

describe('openAttachment', () => {
    it('builds the download address for the signed-in route', () => {
        expect(attachmentFileUrl('t 1', 'a/1')).toBe('/api/budget/transactions/t%201/attachments/a%2F1/file');
    });

    it('downloads with the user token, shows the file in a new tab, and never uses the cached client', async () => {
        const tab = { location: { href: '' }, close: jest.fn() };
        jest.spyOn(window, 'open').mockReturnValue(tab);
        axios.get.mockResolvedValue({ data: new Blob(['%PDF'], { type: 'application/pdf' }) });

        await openAttachment('t1', attachment);

        expect(axios.get).toHaveBeenCalledWith(
            '/api/budget/transactions/t1/attachments/a1/file',
            expect.objectContaining({ responseType: 'blob', headers: { Authorization: 'Bearer tok123' } }),
        );
        expect(apiClient.get).not.toHaveBeenCalled();
        expect(tab.location.href).toBe('blob:temp');
        window.open.mockRestore();
    });

    it('closes the blank tab and passes the error on when the download fails', async () => {
        const tab = { location: { href: '' }, close: jest.fn() };
        jest.spyOn(window, 'open').mockReturnValue(tab);
        axios.get.mockRejectedValue({ response: { status: 404 } });

        await expect(openAttachment('t1', attachment)).rejects.toEqual({ response: { status: 404 } });
        expect(tab.close).toHaveBeenCalled();
        window.open.mockRestore();
    });
});
