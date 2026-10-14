// Eagerly copy files handed back by <input type="file"> into memory.
//
// Why this exists: on Android (the Capacitor WebView), the file picker does NOT give a
// normal file — it gives a lazy File backed by a content:// stream. Pickers like the
// Google Photo Picker hand out one-shot URIs: the stream can only be opened while the
// picker's permission grant is live, and Chromium re-opens it on every later read. So if
// the raw handle is kept and read later (object-URL preview, createImageBitmap, canvas,
// FormData upload), the re-open fails and the app sees an "unreadable/corrupt" file no
// matter how small or valid it really is — e.g. a 69KB 444x539 .jpg failing with
// "Couldn't load a preview for this photo...". Desktop browsers return disk-backed Files
// that are always re-readable, which is why this bug only ever shows up on phones.
//
// Reading the bytes inside the change handler — while the grant is still valid — and
// rebuilding plain in-memory Files makes every later read reliable.

/**
 * Copy an array of picked files fully into memory.
 * @param {File[]} fileList
 * @returns {Promise<File[]>} in-memory copies (falls back to the original handle for any
 *   file that can't be read eagerly, so nothing is lost — it just may fail later as before)
 */
export async function readFilesIntoMemory(fileList) {
    const files = [];
    for (const file of fileList) {
        try {
            const buffer = await file.arrayBuffer();
            files.push(new File([buffer], file.name, { type: file.type, lastModified: file.lastModified }));
        } catch (err) {
            console.warn(`[pickedFiles] Could not eagerly read "${file.name}"; keeping original file handle`, err);
            files.push(file);
        }
    }
    return files;
}

export default readFilesIntoMemory;