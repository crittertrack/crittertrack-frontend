import { compressImageToMaxSize } from './imageCompression';

describe('compressImageToMaxSize', () => {
    const originalCreateImageBitmap = global.createImageBitmap;

    afterEach(() => {
        if (originalCreateImageBitmap === undefined) {
            delete global.createImageBitmap;
        } else {
            global.createImageBitmap = originalCreateImageBitmap;
        }
        jest.restoreAllMocks();
    });

    it('scales within both bounds without distorting the image', async () => {
        const image = { width: 4000, height: 2000, close: jest.fn() };
        global.createImageBitmap = jest.fn().mockResolvedValue(image);

        const drawImage = jest.fn();
        const context = {
            fillStyle: '',
            fillRect: jest.fn(),
            drawImage,
        };
        const blob = new Blob(['jpeg'], { type: 'image/jpeg' });
        const canvas = {
            getContext: jest.fn().mockReturnValue(context),
            toBlob: jest.fn(callback => callback(blob)),
        };
        const createElement = document.createElement.bind(document);
        jest.spyOn(document, 'createElement').mockImplementation(type => (
            type === 'canvas' ? canvas : createElement(type)
        ));

        const result = await compressImageToMaxSize(
            new Blob(['source'], { type: 'image/jpeg' }),
            1024,
            { maxWidth: 1000, maxHeight: 400 }
        );

        expect(result).toBe(blob);
        expect(drawImage).toHaveBeenCalledWith(image, 0, 0, 800, 400);
        expect(image.close).toHaveBeenCalledTimes(1);
    });
});
