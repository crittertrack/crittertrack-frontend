// Compress an image File in the browser by resizing it to fit within max dimensions
// and re-encoding to JPEG (or PNG for original PNG files). GIFs are rejected.
// Returns a Promise that resolves to a Blob.
import { decodeImageFile, releaseDecodedImage } from './imageDecode';

function validateImageOptions({ maxWidth, maxHeight, quality }) {
    if (![maxWidth, maxHeight].every(value => Number.isFinite(value) && value > 0)) {
        throw new RangeError('Image dimensions must be positive numbers');
    }
    if (!Number.isFinite(quality) || quality < 0 || quality > 1) {
        throw new RangeError('Image quality must be between 0 and 1');
    }
}

function getScaledDimensions(width, height, maxWidth, maxHeight) {
    const scale = Math.min(1, maxWidth / width, maxHeight / height);
    return {
        width: Math.max(1, Math.round(width * scale)),
        height: Math.max(1, Math.round(height * scale)),
    };
}

async function encodeImage(image, width, height, type, quality) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('IMAGE_CANVAS_UNAVAILABLE');

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(image, 0, 0, width, height);

    return new Promise((resolve, reject) => {
        try {
            canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('IMAGE_ENCODE_FAILED')), type, quality);
        } catch (error) {
            reject(error);
        }
    });
}

export async function compressImageFile(file, { maxWidth = 1200, maxHeight = 1200, quality = 0.8 } = {}) {
    if (!file || !file.type || !file.type.startsWith('image/')) throw new Error('Not an image file');
    // Reject GIFs (animations not allowed) – the server accepts PNG/JPEG only
    if (file.type === 'image/gif') throw new Error('GIF_NOT_ALLOWED');

    validateImageOptions({ maxWidth, maxHeight, quality });
    const img = await decodeImageFile(file);
    try {
        const { width, height } = getScaledDimensions(img.width, img.height, maxWidth, maxHeight);
        return await encodeImage(img, width, height, 'image/jpeg', quality);
    } finally {
        releaseDecodedImage(img);
    }
}

// Compress an image File to be under `maxBytes` if possible.
// Tries decreasing quality first, then scales down dimensions and retries.
// Returns a Blob (best-effort). Throws if input isn't an image.
export async function compressImageToMaxSize(file, maxBytes = 200 * 1024, opts = {}) {
    if (!file || !file.type || !file.type.startsWith('image/')) throw new Error('Not an image file');
    // Reject GIFs (animations not allowed) – the server accepts PNG/JPEG only
    if (file.type === 'image/gif') throw new Error('GIF_NOT_ALLOWED');

    const {
        maxWidth = 1200,
        maxHeight = 1200,
        startQuality = 0.85,
        minQuality = 0.35,
        qualityStep = 0.05,
        minDimension = 200,
        forceJpeg = false,
    } = opts;
    validateImageOptions({ maxWidth, maxHeight, quality: startQuality });
    if (!Number.isFinite(minQuality) || minQuality < 0 || minQuality > startQuality) {
        throw new RangeError('Minimum image quality must be between 0 and the starting quality');
    }
    if (!Number.isFinite(qualityStep) || qualityStep <= 0) {
        throw new RangeError('Image quality step must be a positive number');
    }
    if (!Number.isFinite(minDimension) || minDimension < 1) {
        throw new RangeError('Minimum image dimension must be a positive number');
    }
    if (!Number.isFinite(maxBytes) || maxBytes <= 0) {
        throw new RangeError('Maximum image size must be a positive number');
    }

    const image = await decodeImageFile(file);
    try {
        const dimensions = getScaledDimensions(image.width, image.height, maxWidth, maxHeight);
        let { width: targetW, height: targetH } = dimensions;
        const outputType = file.type === 'image/png' && !forceJpeg ? 'image/png' : 'image/jpeg';
        let smallestBlob;

        while (true) {
            for (let quality = startQuality; quality >= minQuality; quality -= qualityStep) {
                const blob = await encodeImage(image, targetW, targetH, outputType, quality);
                smallestBlob = blob;
                if (blob.size <= maxBytes) return blob;
            }

            const longestSide = Math.max(targetW, targetH);
            if (longestSide <= minDimension) return smallestBlob;

            const scale = Math.max(0.8, minDimension / longestSide);
            targetW = Math.max(1, Math.round(targetW * scale));
            targetH = Math.max(1, Math.round(targetH * scale));
        }
    } finally {
        releaseDecodedImage(image);
    }
}

// Attempt to compress an image in a Web Worker (public/imageWorker.js).
// Returns a Blob on success, or null if worker not available or reports an error.
export const compressImageWithWorker = (file, maxBytes = 200 * 1024, opts = {}) => {
    return new Promise((resolve, reject) => {
        // Try to create a worker pointing to the public folder path
        let worker;
        try {
            worker = new Worker('/imageWorker.js');
        } catch (e) {
            resolve(null); // Worker couldn't be created (e.g., bundler/public path issue)
            return;
        }

        const id = Math.random().toString(36).slice(2);

        const onMessage = (ev) => {
            if (!ev.data || ev.data.id !== id) return;
            if (ev.data.error) {
                worker.removeEventListener('message', onMessage);
                worker.terminate();
                resolve(null);
                return;
            }
            // Received blob
            const blob = ev.data.blob;
            worker.removeEventListener('message', onMessage);
            worker.terminate();
            resolve(blob);
        };

        worker.addEventListener('message', onMessage);

        // Post file (structured clone) to worker
        try {
            worker.postMessage({ id, file, maxBytes, opts });
        } catch (e) {
            worker.removeEventListener('message', onMessage);
            worker.terminate();
            resolve(null);
        }
    });
};
