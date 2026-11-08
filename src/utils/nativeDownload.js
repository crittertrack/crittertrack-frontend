import { Capacitor, registerPlugin } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

const MediaSave = registerPlugin('MediaSave');

const blobToBase64 = (blob) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(String(reader.result).split(',')[1] || '');
    reader.onerror = reject;
    reader.readAsDataURL(blob);
});

// Clicking an <a download> link with a blob: URL is silently a no-op in the Android
// WebView used by Capacitor (no download manager is attached to it), so exports/backups/
// image downloads never actually save anything there. On native Android, write the file
// to cache and then use the MediaSave plugin to copy it into public Downloads via MediaStore.
// Web keeps the exact original anchor-click download behavior. iOS uses the OS share sheet.
const BRIDGE_CHUNK_SIZE = 8_000_000; // base64 chars per bridge call (multiple of 4)

export const downloadBlob = async (blob, filename) => {
    if (!Capacitor.isNativePlatform()) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        return;
    }

    const base64Data = await blobToBase64(blob);

    // The JS<->native bridge JSON-serializes the whole call payload in one shot, and
    // large certificates/PDFs produce multi-MB base64 strings that OOM-crash the WebView
    // during that serialization. Writing in bounded chunks keeps each bridge call small.
    if (base64Data.length <= BRIDGE_CHUNK_SIZE) {
        await Filesystem.writeFile({
            path: filename,
            data: base64Data,
            directory: Directory.Cache,
        });
    } else {
        await Filesystem.writeFile({
            path: filename,
            data: base64Data.slice(0, BRIDGE_CHUNK_SIZE),
            directory: Directory.Cache,
        });
        for (let offset = BRIDGE_CHUNK_SIZE; offset < base64Data.length; offset += BRIDGE_CHUNK_SIZE) {
            await Filesystem.appendFile({
                path: filename,
                data: base64Data.slice(offset, offset + BRIDGE_CHUNK_SIZE),
                directory: Directory.Cache,
            });
        }
    }

    const { uri } = await Filesystem.getUri({ path: filename, directory: Directory.Cache });

    if (Capacitor.getPlatform() === 'android') {
        try {
            const mimeType = blob.type || (filename.endsWith('.pdf') ? 'application/pdf' : filename.endsWith('.png') ? 'image/png' : 'application/octet-stream');
            await MediaSave.saveToDownloads({
                filePath: uri,
                filename,
                mimeType,
            });
            // Clean up cache file after saving to Downloads
            try {
                await Filesystem.deleteFile({ path: filename, directory: Directory.Cache });
            } catch (ignored) {}
            return;
        } catch (err) {
            console.warn('[downloadBlob] Native MediaSave to Downloads failed, falling back to Share sheet:', err);
        }
    }

    await Share.share({ url: uri });
};
