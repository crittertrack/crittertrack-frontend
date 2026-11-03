import React from 'react';
import { FileText, Image as ImageIcon, Trash2 } from 'lucide-react';

// The list of files attached to a Budget transaction (open in a new tab, or remove).

export const formatSize = (bytes) => {
    const n = Number(bytes) || 0;
    if (n >= 1024 * 1024) return `${(n / (1024 * 1024)).toFixed(1)} MB`;
    return `${Math.max(1, Math.round(n / 1024))} KB`;
};

export default function AttachmentList({ attachments, busy, onRemove, onOpen }) {
    if (attachments.length === 0) {
        return (
            <p className="text-xs text-gray-500 dark:text-dark-text-muted">
                No files yet. Attach a photo or PDF (up to 5 MB), or generate a receipt. Files are private to your account.
            </p>
        );
    }

    return (
        <ul className="divide-y divide-gray-100 dark:divide-dark-border border border-gray-200 dark:border-dark-border rounded-lg" data-testid="attachment-list">
            {attachments.map(a => (
                <li key={a._id || a.url} className="flex items-center justify-between gap-2 px-2 py-1.5 text-sm">
                    <button
                        type="button" onClick={() => onOpen(a)} disabled={!a.key && !!a.url}
                        title={!a.key && a.url ? 'Older file that is not stored privately - please re-attach it' : 'Open'}
                        className="flex items-center gap-2 min-w-0 text-left text-blue-600 dark:text-dark-info-blue hover:underline disabled:text-gray-400 disabled:no-underline"
                        data-testid="open-attachment"
                    >
                        {a.mimeType === 'application/pdf' ? <FileText size={15} /> : <ImageIcon size={15} />}
                        <span className="truncate">{a.filename}</span>
                        <span className="text-xs text-gray-500 dark:text-dark-text-muted shrink-0">
                            {a.kind === 'receipt' ? 'Receipt · ' : ''}{formatSize(a.size)}
                        </span>
                    </button>
                    <button
                        type="button" onClick={() => onRemove(a)} disabled={busy}
                        className="text-red-500 hover:text-red-700 p-1 disabled:opacity-50" aria-label={`Remove ${a.filename}`}
                    >
                        <Trash2 size={14} />
                    </button>
                </li>
            ))}
        </ul>
    );
}
