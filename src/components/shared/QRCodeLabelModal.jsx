import React, { useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Check, Download, Link, Printer, X } from 'lucide-react';
import { downloadBlob } from '../../utils/nativeDownload';

const escapeHtml = (value) => String(value || '').replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
})[character]);

const QRCodeLabelModal = ({ value, title, subtitle, details = [], onClose }) => {
    const qrContainerRef = useRef(null);
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState('');

    const handleDownload = async () => {
        try {
            const svg = qrContainerRef.current?.querySelector('svg');
            if (!svg) throw new Error('QR code is not ready to download.');
            const svgMarkup = new XMLSerializer().serializeToString(svg);
            const blob = new Blob([svgMarkup], { type: 'image/svg+xml;charset=utf-8' });
            const safeName = (title || 'label').replace(/[^a-z0-9-_]+/gi, '-').replace(/^-|-$/g, '') || 'label';
            await downloadBlob(blob, `${safeName}-qr.svg`);
            setError('');
        } catch (downloadError) {
            console.error('Failed to download QR code:', downloadError);
            setError('Could not download the QR code. Please try again.');
        }
    };

    const handlePrint = () => {
        const svg = qrContainerRef.current?.querySelector('svg');
        if (!svg) {
            setError('QR code is not ready to print.');
            return;
        }
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            setError('Allow pop-ups to print this label.');
            return;
        }
        printWindow.opener = null;

        const detailMarkup = details.filter(Boolean).map(detail => `<p>${escapeHtml(detail)}</p>`).join('');
        printWindow.document.write(`
            <!doctype html>
            <html>
                <head>
                    <title>${escapeHtml(title)} - CritterTrack label</title>
                    <style>
                        @page { size: 90mm 60mm; margin: 4mm; }
                        * { box-sizing: border-box; }
                        body { margin: 0; font-family: Arial, sans-serif; color: #111827; }
                        .label { width: 82mm; height: 52mm; display: flex; align-items: center; gap: 5mm; overflow: hidden; }
                        .qr { width: 42mm; height: 42mm; flex: 0 0 42mm; }
                        .qr svg { display: block; width: 100%; height: 100%; }
                        .info { min-width: 0; }
                        h1 { font-size: 15pt; line-height: 1.15; margin: 0 0 2mm; overflow-wrap: anywhere; }
                        .subtitle { font-weight: 700; font-size: 9pt; margin: 0 0 2mm; }
                        .details p { font-size: 8pt; margin: 1mm 0; overflow-wrap: anywhere; }
                        .brand { position: fixed; bottom: 0; right: 0; font-size: 6pt; color: #6b7280; }
                    </style>
                </head>
                <body>
                    <main class="label">
                        <div class="qr">${new XMLSerializer().serializeToString(svg)}</div>
                        <div class="info">
                            <h1>${escapeHtml(title)}</h1>
                            ${subtitle ? `<p class="subtitle">${escapeHtml(subtitle)}</p>` : ''}
                            <div class="details">${detailMarkup}</div>
                        </div>
                    </main>
                    <div class="brand">CritterTrack</div>
                    <script>window.onload = () => { window.focus(); window.print(); };</script>
                </body>
            </html>
        `);
        printWindow.document.close();
        setError('');
    };

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(value);
            setCopied(true);
            setError('');
            setTimeout(() => setCopied(false), 2000);
        } catch (copyError) {
            console.error('Failed to copy share link:', copyError);
            setError('Could not copy the link. You can select and copy it below.');
        }
    };

    return (
        <div className="fixed inset-0 z-[600] flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-dark-card-bg rounded-2xl shadow-2xl p-5 flex flex-col items-center gap-3 w-full max-w-sm" onClick={event => event.stopPropagation()}>
                <div className="flex items-center justify-between w-full">
                    <h3 className="font-semibold text-gray-800 dark:text-dark-text text-sm truncate pr-2">{title || 'QR Code'}</h3>
                    <button type="button" onClick={onClose} aria-label="Close QR code dialog" className="text-gray-400 dark:text-dark-text-muted hover:text-gray-600 dark:hover:text-dark-text-secondary">
                        <X size={18} />
                    </button>
                </div>
                <div ref={qrContainerRef} className="p-3 bg-white border border-gray-200 rounded-xl">
                    <QRCodeSVG value={value} size={196} bgColor="#ffffff" fgColor="#111827" level="M" />
                </div>
                {subtitle && <p className="text-sm font-semibold text-gray-700 dark:text-dark-text-secondary">{subtitle}</p>}
                {details.length > 0 && (
                    <div className="w-full text-center text-xs text-gray-500 dark:text-dark-text-muted">
                        {details.filter(Boolean).map((detail, index) => <p key={`${detail}-${index}`}>{detail}</p>)}
                    </div>
                )}
                <p className="w-full text-xs text-gray-400 dark:text-dark-text-muted break-all text-center leading-relaxed">{value}</p>
                {error && <p role="alert" className="text-xs text-red-600 dark:text-red-400 text-center">{error}</p>}
                <div className="grid grid-cols-2 gap-2 w-full">
                    <button type="button" onClick={handleDownload} className="flex items-center justify-center gap-2 px-3 py-2 bg-primary dark:bg-dark-primary hover:bg-primary/90 text-black font-semibold rounded-lg text-sm transition">
                        <Download size={15} /> Download QR
                    </button>
                    <button type="button" onClick={handlePrint} className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 dark:bg-dark-surface hover:bg-gray-200 dark:hover:bg-dark-surface-hover text-gray-800 dark:text-dark-text font-semibold rounded-lg text-sm transition">
                        <Printer size={15} /> Print Label
                    </button>
                </div>
                <button type="button" onClick={handleCopyLink} className="w-full flex items-center justify-center gap-2 px-3 py-2 border border-gray-200 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-surface-hover text-gray-700 dark:text-dark-text-secondary font-semibold rounded-lg text-sm transition">
                    {copied ? <Check size={14} /> : <Link size={14} />}
                    {copied ? 'Copied!' : 'Copy Link'}
                </button>
            </div>
        </div>
    );
};

export default QRCodeLabelModal;
