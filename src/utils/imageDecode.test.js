import { decodeImageFile } from './imageDecode';

describe('decodeImageFile', () => {
    const originalCreateImageBitmap = global.createImageBitmap;

    afterEach(() => {
        if (originalCreateImageBitmap === undefined) {
            delete global.createImageBitmap;
        } else {
            global.createImageBitmap = originalCreateImageBitmap;
        }
    });

    it('preserves portrait aspect ratio while retrying oversized mobile photos', async () => {
        const firstBitmap = { width: 2048, height: 2731, close: jest.fn() };
        const portraitBitmap = { width: 1536, height: 2048, close: jest.fn() };
        global.createImageBitmap = jest.fn()
            .mockRejectedValueOnce(new Error('full-size decode failed'))
            .mockResolvedValueOnce(firstBitmap)
            .mockResolvedValueOnce(portraitBitmap);

        const decoded = await decodeImageFile(new Blob(['jpeg'], { type: 'image/jpeg' }));

        expect(decoded).toBe(portraitBitmap);
        expect(decoded.width / decoded.height).toBeCloseTo(0.75);
        expect(firstBitmap.close).toHaveBeenCalledTimes(1);
        expect(global.createImageBitmap.mock.calls[1][1]).toEqual({
            resizeWidth: 2048,
            resizeQuality: 'high',
        });
        expect(global.createImageBitmap.mock.calls[2][1]).toEqual({
            resizeHeight: 2048,
            resizeQuality: 'high',
        });
    });
});
