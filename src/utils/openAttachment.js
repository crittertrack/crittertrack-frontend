import axios from 'axios';
import { Capacitor } from '@capacitor/core';
import { API_BASE_URL } from './apiConfig';
import { downloadBlob } from './nativeDownload';

// Opens a private Budget attachment. The file is fetched with the signed-in user's token (the
// server checks they own the transaction) and shown from a temporary in-memory link.
//
// This deliberately uses plain axios, NOT apiClient: apiClient copies every GET response into the
// on-device offline cache, and financial documents must not be stored there.

export const attachmentFileUrl = (transactionId, attachmentId) =>
    `${API_BASE_URL}/budget/transactions/${encodeURIComponent(transactionId)}/attachments/${encodeURIComponent(attachmentId)}/file`;

export const openAttachment = async (transactionId, attachment) => {
    // Open the tab straight away (inside the click) so pop-up blockers allow it.
    const native = Capacitor.isNativePlatform();
    const tab = native ? null : window.open('', '_blank');
    try {
        const res = await axios.get(attachmentFileUrl(transactionId, attachment._id), {
            responseType: 'blob',
            headers: { Authorization: `Bearer ${localStorage.getItem('authToken') || ''}` },
        });
        const blob = new Blob([res.data], { type: attachment.mimeType || res.data.type || 'application/octet-stream' });

        if (native) {
            await downloadBlob(blob, attachment.filename || 'attachment');
            return;
        }
        const url = URL.createObjectURL(blob);
        if (tab) tab.location.href = url;
        else window.location.href = url;
        // Free the temporary link once the browser has had time to load it.
        setTimeout(() => URL.revokeObjectURL(url), 5 * 60 * 1000);
    } catch (err) {
        if (tab) tab.close();
        throw err;
    }
};
