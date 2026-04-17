// Compress an image File in the browser by resizing it to fit within max dimensions
// and re-encoding to JPEG (or PNG for original PNG files). GIFs are returned as-is.
// Returns a Promise that resolves to a Blob.
export async function compressImageFile(file, { maxWidth = 1200, maxHeight = 1200, quality = 0.8 } = {}) {
    if (!file || !file.type || !file.type.startsWith('image/')) throw new Error('Not an image file');
    // Reject GIFs (animations not allowed) – the server accepts PNG/JPEG only
    if (file.type === 'image/gif') throw new Error('GIF_NOT_ALLOWED');

    const img = await new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const image = new Image();
        image.onload = () => { URL.revokeObjectURL(url); resolve(image); };
        image.onerror = (e) => { URL.revokeObjectURL(url); reject(new Error('Failed to load image for compression')); };
        image.src = url;
    });

    const origWidth = img.width;
    const origHeight = img.height;
    let targetWidth = origWidth;
    let targetHeight = origHeight;

    // Calculate target size preserving aspect ratio
    if (origWidth > maxWidth || origHeight > maxHeight) {
        const widthRatio = maxWidth / origWidth;
        const heightRatio = maxHeight / origHeight;
        const ratio = Math.min(widthRatio, heightRatio);
        targetWidth = Math.round(origWidth * ratio);
        targetHeight = Math.round(origHeight * ratio);
    }

    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d');
    // Fill background white for JPEG to avoid black background on transparent PNGs
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, targetWidth, targetHeight);
    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

    // Always output JPEG for better compatibility (especially with mobile browsers)
    const outputType = 'image/jpeg';
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, outputType, quality));
    return blob || file;
}

// Compress an image File to be under `maxBytes` if possible.
// Tries decreasing quality first, then scales down dimensions and retries.
// Returns a Blob (best-effort). Throws if input isn't an image.
export async function compressImageToMaxSize(file, maxBytes = 200 * 1024, opts = {}) {
    if (!file || !file.type || !file.type.startsWith('image/')) throw new Error('Not an image file');
    // Reject GIFs (animations not allowed) – the server accepts PNG/JPEG only
    if (file.type === 'image/gif') throw new Error('GIF_NOT_ALLOWED');

    console.log('[COMPRESSION DEBUG] Starting compression:', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        targetMaxBytes: maxBytes
    });

    // Start with original dimensions limits from opts or defaults
    let { maxWidth = 1200, maxHeight = 1200, startQuality = 0.85, minQuality = 0.35, qualityStep = 0.05, minDimension = 200 } = opts;

    // Load original image to get dimensions
    const image = await new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
        img.onerror = (e) => { URL.revokeObjectURL(url); reject(new Error('Failed to load image for compression')); };
        img.src = url;
    });

    console.log('[COMPRESSION DEBUG] Original image dimensions:', {
        width: image.width,
        height: image.height,
        aspectRatio: (image.width / image.height).toFixed(3)
    });

    let targetW = Math.min(image.width, maxWidth);
    let targetH = Math.min(image.height, maxHeight);

    // Helper to run compression with given dims and quality
    const tryCompress = async (w, h, quality) => {
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, w, h);
        ctx.drawImage(image, 0, 0, w, h);
        const outputType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        const blob = await new Promise((resolve) => canvas.toBlob(resolve, outputType, quality));
        return blob;
    };

    // First pass: try with decreasing quality at initial dimensions
    let quality = startQuality;
    while (quality >= minQuality) {
        const blob = await tryCompress(targetW, targetH, quality);
        if (!blob) break;
        console.log('[COMPRESSION DEBUG] Quality pass:', { quality: quality.toFixed(2), blobSize: blob.size, targetW, targetH });
        if (blob.size <= maxBytes) {
            console.log('[COMPRESSION DEBUG] ✓ Success with quality reduction. Final:', { width: targetW, height: targetH, size: blob.size, quality: quality.toFixed(2) });
            return blob;
        }
        quality -= qualityStep;
    }

    // Second pass: gradually reduce dimensions while preserving aspect ratio
    const aspectRatio = image.width / image.height;
    console.log('[COMPRESSION DEBUG] Entering dimension reduction loop. AspectRatio:', aspectRatio.toFixed(3));
    while (Math.max(targetW, targetH) > minDimension) {
        // Reduce dimensions proportionally to maintain aspect ratio
        const scale = 0.8;
        targetW = Math.round(targetW * scale);
        targetH = Math.round(targetH * scale);
        
        console.log('[COMPRESSION DEBUG] Scaled down to:', { targetW, targetH });
        
        // Ensure neither dimension goes below minDimension while preserving aspect ratio
        if (Math.max(targetW, targetH) < minDimension) {
            if (aspectRatio >= 1) {
                targetW = minDimension;
                targetH = Math.round(minDimension / aspectRatio);
            } else {
                targetH = minDimension;
                targetW = Math.round(minDimension * aspectRatio);
            }
            console.log('[COMPRESSION DEBUG] Hit minimum, adjusted to:', { targetW, targetH });
        }
        
        quality = startQuality;
        while (quality >= minQuality) {
            const blob = await tryCompress(targetW, targetH, quality);
            if (!blob) break;
            if (blob.size <= maxBytes) {
                console.log('[COMPRESSION DEBUG] ✓ Success with dimension reduction. Final:', { width: targetW, height: targetH, size: blob.size, quality: quality.toFixed(2) });
                return blob;
            }
            quality -= qualityStep;
        }
    }

    // As a last resort, return the smallest we could create (use minQuality and minimum dimensions while preserving aspect ratio)
    const finalW = aspectRatio >= 1 ? minDimension : Math.round(minDimension * aspectRatio);
    const finalH = aspectRatio <= 1 ? minDimension : Math.round(minDimension / aspectRatio);
    console.log('[COMPRESSION DEBUG] ✓ Using fallback dimensions:', { finalW, finalH, aspectRatio: aspectRatio.toFixed(3) });
    const finalBlob = await tryCompress(finalW, finalH, minQuality);
    console.log('[COMPRESSION DEBUG] Final result:', { width: finalW, height: finalH, size: finalBlob?.size });
    return finalBlob || file;
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
