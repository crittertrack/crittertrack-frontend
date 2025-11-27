// imageWorker.js
// Offloads image compression to a worker using OffscreenCanvas and createImageBitmap.
// Posts back { id, blob } on success or { id, error } on failure.

self.onmessage = async (e) => {
  const { id, file, maxBytes = 200 * 1024, opts = {} } = e.data;
  try {
    if (typeof createImageBitmap !== 'function' || typeof OffscreenCanvas === 'undefined') {
      throw new Error('Worker does not support createImageBitmap or OffscreenCanvas');
    }

    const imageBitmap = await createImageBitmap(file);

    let { maxWidth = 1200, maxHeight = 1200, startQuality = 0.85, minQuality = 0.35, qualityStep = 0.05, minDimension = 200 } = opts;
    let targetW = Math.min(imageBitmap.width, maxWidth);
    let targetH = Math.min(imageBitmap.height, maxHeight);

    const outputType = (file.type === 'image/png') ? 'image/png' : 'image/jpeg';

    const tryCompress = async (w, h, quality) => {
      const off = new OffscreenCanvas(w, h);
      const ctx = off.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, w, h);
      ctx.drawImage(imageBitmap, 0, 0, w, h);
      const blob = await off.convertToBlob({ type: outputType, quality });
      return blob;
    };

    // First pass: quality sweep
    let quality = startQuality;
    while (quality >= minQuality) {
      const blob = await tryCompress(targetW, targetH, quality);
      if (blob && blob.size <= maxBytes) {
        self.postMessage({ id, blob });
        return;
      }
      quality -= qualityStep;
    }

    // Second pass: scale down and retry
    while (Math.max(targetW, targetH) > minDimension) {
      targetW = Math.max(Math.round(targetW * 0.8), minDimension);
      targetH = Math.max(Math.round(targetH * 0.8), minDimension);
      quality = startQuality;
      while (quality >= minQuality) {
        const blob = await tryCompress(targetW, targetH, quality);
        if (blob && blob.size <= maxBytes) {
          self.postMessage({ id, blob });
          return;
        }
        quality -= qualityStep;
      }
    }

    // Final small attempt
    const finalBlob = await tryCompress(minDimension, minDimension, minQuality);
    self.postMessage({ id, blob: finalBlob });
  } catch (err) {
    self.postMessage({ id, error: err && err.message ? err.message : String(err) });
  }
};
