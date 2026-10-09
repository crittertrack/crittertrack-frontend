// Robust image decoding for in-browser compression.
//
// Why this exists: every upload path used to decode with the same
// `new Image()` + object-URL pattern, whose `onerror` produces the unhelpful
// "Failed to load image for compression". That fires on modern phone photos for two reasons:
//
//  1. SIZE. A Samsung S24 Ultra shoots up to 200 MP (8000x6000). Decoded as RGBA that's a
//     ~190 MB bitmap, which can exceed the Android WebView's bitmap limits; the browser
//     gives up and fires onerror. Laptop images are far smaller and decode fine, which is why
//     this looked like a phone-only bug.
//  2. FORMAT. Some Android cameras default to HEIF/HEIC, which WebView may not decode.
//
// createImageBitmap is tried first because Chromium backs it with the same image pipeline as
// the decoder used for <img>, decodes off the main thread, and handles very large sources far
// more gracefully. The classic <img> path stays as a fallback. If neither can decode the file
// we throw an actionable error instead of the generic one.

/**
 * Decode an image File into something drawable on a 2D canvas.
 * @param {File|Blob} file
 * @returns {Promise<ImageBitmap|HTMLImageElement>} drawable with .width/.height
 * @throws {Error} with a user-facing message when the browser can't decode the file
 */
export async function decodeImageFile(file) {
    let bestBitmap = null;

    // 1) Preferred path: createImageBitmap. Also try an explicitly downscaled decode, which
    //    on very large photos can succeed where a full-resolution decode cannot.
    if (typeof createImageBitmap === 'function') {
        try {
            return await createImageBitmap(file);
        } catch (e) {
            // Fall through to the <img> path below.
        }

        // Resize one axis at a time so the browser preserves the source aspect ratio.
        for (const dim of [2048, 1600]) {
            for (const resizeDimension of ['resizeWidth', 'resizeHeight']) {
                let bitmap;
                try {
                    bitmap = await createImageBitmap(file, { [resizeDimension]: dim, resizeQuality: 'high' });
                } catch (e) {
                    continue;
                }

                const longestSide = Math.max(bitmap.width, bitmap.height);
                const bestLongestSide = bestBitmap ? Math.max(bestBitmap.width, bestBitmap.height) : Infinity;
                if (longestSide < bestLongestSide) {
                    releaseDecodedImage(bestBitmap);
                    bestBitmap = bitmap;
                } else {
                    releaseDecodedImage(bitmap);
                }

                if (longestSide <= dim) {
                    return bestBitmap;
                }
            }
        }
    }

    if (bestBitmap) return bestBitmap;

    // 2) Fallback: the classic object-URL + <img> decode.
    const url = URL.createObjectURL(file);
    try {
        return await new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error('DECODE_FAILED'));
            img.src = url;
        });
    } catch (e) {
        throw new Error('DECODE_FAILED');
    } finally {
        URL.revokeObjectURL(url);
    }
}

// Release an ImageBitmap once we're done drawing it. Safe to call with an HTMLImageElement.
export function releaseDecodedImage(img) {
    if (img && typeof img.close === 'function') {
        try { img.close(); } catch (e) { /* ignore */ }
    }
}

// User-facing text for a decode failure. Mentions the concrete things a phone user can do,
// since the raw codec error means nothing to them.
export function decodeErrorMessage(err) {
    const isDecode = err && (err.message === 'DECODE_FAILED' || /Failed to load image for compression/i.test(err.message || ''));
    if (!isDecode) return (err && err.message) || 'Failed to read image';
    return "Your phone couldn't read that image. This usually means the photo is extremely high resolution or saved in HEIF/HEIC format. Try turning off your camera's \"High efficiency pictures\" setting (Samsung: Camera > Settings > High efficiency pictures = Off) and take the photo again, or pick a different image.";
}

export default decodeImageFile;