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
    console.log('[WORKER] Original dimensions:', imageBitmap.width, 'x', imageBitmap.height);

    let { maxWidth = 1200, maxHeight = 1200, startQuality = 0.85, minQuality = 0.35, qualityStep = 0.05, minDimension = 200 } = opts;
    
    // Calculate target dimensions while preserving aspect ratio
    const aspectRatio = imageBitmap.width / imageBitmap.height;
    let targetW, targetH;
    
    if (imageBitmap.width <= maxWidth && imageBitmap.height <= maxHeight) {
      // Image already fits within bounds
      targetW = imageBitmap.width;
      targetH = imageBitmap.height;
    } else {
      // Scale down proportionally to fit within maxWidth x maxHeight
      const widthRatio = maxWidth / imageBitmap.width;
      const heightRatio = maxHeight / imageBitmap.height;
      const ratio = Math.min(widthRatio, heightRatio);
      targetW = Math.round(imageBitmap.width * ratio);
      targetH = Math.round(imageBitmap.height * ratio);
    }

    console.log('[WORKER] Initial target:', targetW, 'x', targetH);

    const outputType = (file.type === 'image/png') ? 'image/png' : 'image/jpeg';
    console.log('[WORKER] Aspect ratio:', aspectRatio.toFixed(3));

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
        console.log('[WORKER] Success with quality:', quality.toFixed(2), 'Dimensions:', targetW, 'x', targetH, 'Size:', blob.size);
        self.postMessage({ id, blob });
        return;
      }
      quality -= qualityStep;
    }

    console.log('[WORKER] Quality reduction failed, entering dimension reduction');

    // Second pass: scale down proportionally while preserving aspect ratio
    while (Math.max(targetW, targetH) > minDimension) {
      // Scale both dimensions proportionally
      const scale = 0.8;
      targetW = Math.round(targetW * scale);
      targetH = Math.round(targetH * scale);
      
      console.log('[WORKER] Scaled to:', targetW, 'x', targetH);
      
      // Ensure neither dimension goes below minDimension while preserving aspect ratio
      if (Math.max(targetW, targetH) < minDimension) {
        if (aspectRatio >= 1) {
          // Landscape: width is the larger dimension
          targetW = minDimension;
          targetH = Math.round(minDimension / aspectRatio);
        } else {
          // Portrait: height is the larger dimension
          targetH = minDimension;
          targetW = Math.round(minDimension * aspectRatio);
        }
        console.log('[WORKER] Hit minimum, adjusted to:', targetW, 'x', targetH);
      }
      
      quality = startQuality;
      while (quality >= minQuality) {
        const blob = await tryCompress(targetW, targetH, quality);
        if (blob && blob.size <= maxBytes) {
          console.log('[WORKER] Success with dimensions:', targetW, 'x', targetH, 'Quality:', quality.toFixed(2), 'Size:', blob.size);
          self.postMessage({ id, blob });
          return;
        }
        quality -= qualityStep;
      }
    }

    console.log('[WORKER] Using fallback dimensions');
    // Final attempt with aspect ratio preserved
    const finalW = aspectRatio >= 1 ? minDimension : Math.round(minDimension * aspectRatio);
    const finalH = aspectRatio <= 1 ? minDimension : Math.round(minDimension / aspectRatio);
    console.log('[WORKER] Fallback dimensions:', finalW, 'x', finalH, 'Aspect ratio:', aspectRatio.toFixed(3));
    const finalBlob = await tryCompress(finalW, finalH, minQuality);
    console.log('[WORKER] Final blob size:', finalBlob?.size);
    self.postMessage({ id, blob: finalBlob });
  } catch (err) {
    self.postMessage({ id, error: err && err.message ? err.message : String(err) });
  }
};
