import React, { useRef, useState } from 'react';
import { Paperclip, Receipt } from 'lucide-react';
import apiClient from '../utils/apiClient';
import { generateReceiptPdf } from '../utils/receiptPdf';
import { generateInvoicePdf } from '../utils/invoicePdf';
import { openAttachment } from '../utils/openAttachment';
import AttachmentList from './AttachmentList';

// Receipts & attachments for one saved Budget transaction: generate a receipt PDF and attach it,
// upload a photo/PDF of a paper receipt, open or remove files.

const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPT = 'image/png,image/jpeg,image/webp,application/pdf';
const buttonCls = 'inline-flex items-center gap-1 px-2 py-1 text-xs rounded-lg border border-gray-300 dark:border-dark-text-muted text-gray-700 dark:text-dark-text-secondary hover:bg-gray-50 dark:hover:bg-dark-surface-hover disabled:opacity-50';

export default function TransactionAttachments({ transaction, issuerName, currencySymbol, onChange }) {
    const fileInput = useRef(null);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');

    const upload = async (blob, filename, kind) => {
        const body = new FormData();
        body.append('file', blob, filename);
        body.append('kind', kind);
        const res = await apiClient.post(`/budget/transactions/${transaction._id}/attachments`, body, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return res.data;
    };

    const run = async (task) => {
        setBusy(true);
        setError('');
        try {
            const updated = await task();
            if (updated && onChange) onChange(updated);
        } catch (err) {
            setError(err?.response?.data?.message || 'Something went wrong. Please try again.');
        } finally {
            setBusy(false);
        }
    };

    const handleGenerate = () => run(async () => {
        // The receipt number is issued once per transaction, so regenerating keeps the same number.
        const numbered = (await apiClient.post(`/budget/transactions/${transaction._id}/receipt-number`)).data;
        const { blob, filename } = await generateReceiptPdf({ transaction: numbered, issuerName, currencySymbol });
        return upload(blob, filename, 'receipt');
    });

     const handleInvoice = () => run(async () => {
         const { blob, filename } = await generateInvoicePdf({ transaction, issuerName, currencySymbol });
         return upload(blob, filename, 'invoice');
     });


    const handleFile = (event) => {
        const file = event.target.files && event.target.files[0];
        event.target.value = '';
        if (!file) return;
        if (file.size > MAX_BYTES) { setError('Files must be 5 MB or smaller.'); return; }
        run(() => upload(file, file.name, 'upload'));
    };

    const handleRemove = (attachment) => {
        if (!window.confirm(`Remove "${attachment.filename}"?`)) return;
        run(async () => (await apiClient.delete(`/budget/transactions/${transaction._id}/attachments/${attachment._id}`)).data);
    };

    const handleOpen = async (attachment) => {
        setError('');
        try {
            await openAttachment(transaction._id, attachment);
        } catch (err) {
            const status = err?.response?.status;
            setError(status === 410
                ? 'This older file is not stored privately. Please remove it and attach it again.'
                : 'Could not open this file. Please try again.');
        }
    };

    return (
        <div className="space-y-2" data-testid="transaction-attachments">
            <div className="flex items-center justify-between gap-2">
                <span className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary">
                    Receipts &amp; attachments{transaction.receiptNumber ? ` · ${transaction.receiptNumber}` : ''}
                </span>
                <div className="flex gap-2">
                    <button type="button" onClick={handleGenerate} disabled={busy} className={buttonCls} data-testid="generate-receipt">
                        <Receipt size={13} /> Generate receipt
                    </button>
                     <button type="button" onClick={handleInvoice} disabled={busy} className={buttonCls} data-testid="generate-invoice">
                         <Receipt size={13} /> Generate invoice
                     </button>

                    <button type="button" onClick={() => fileInput.current && fileInput.current.click()} disabled={busy} className={buttonCls} data-testid="attach-file">
                        <Paperclip size={13} /> Attach file
                    </button>
                    <input ref={fileInput} type="file" accept={ACCEPT} className="hidden" onChange={handleFile} data-testid="attachment-input" />
                </div>
            </div>
            <AttachmentList attachments={transaction.attachments || []} busy={busy} onRemove={handleRemove} onOpen={handleOpen} />
            {busy && <p className="text-xs text-gray-500 dark:text-dark-text-muted">Working...</p>}
            {error && <p className="text-xs text-red-600 dark:text-red-400" role="alert">{error}</p>}
        </div>
    );
}
