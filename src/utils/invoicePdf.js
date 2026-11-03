import { buildInvoiceContent } from './invoiceContent';

export const generateInvoicePdf = async ({ transaction, issuerName, currencySymbol }) => {
    const { default: JsPdf } = await import('jspdf');
    const content = buildInvoiceContent({ transaction, issuerName, currencySymbol });

    const doc = new JsPdf({ orientation: 'portrait', unit: 'mm', format: 'a5' });
    const left = 15, right = 133;
    let y = 22;
    doc.setFont('helvetica', 'bold'); doc.setFontSize(20);
    doc.text(content.title, left, y);
    doc.setFontSize(10); doc.setFont('helvetica', 'normal');
    if (content.number) doc.text(`No. ${content.number}`, right, y, { align: 'right' });
    y += 7;
    if (content.date) doc.text(content.date, left, y);
    doc.text(content.typeLabel, right, y, { align: 'right' });
    y += 4;
    doc.setDrawColor(180); doc.line(left, y, right, y); y += 9;

    const { parties } = content;
    const partyLine = (label, value) => { if (!label) return; doc.setFont('helvetica','bold'); doc.text(`${label}:`, left, y); doc.setFont('helvetica','normal'); doc.text(value || '-', left+32, y); y += 6; };
    partyLine(parties.fromLabel, parties.from);
    partyLine(parties.toLabel, parties.to);
    y += 4;
    doc.setFont('helvetica','bold'); doc.text('Description', left, y); doc.text('Amount', right, y, { align: 'right' }); y += 2;
    doc.line(left, y, right, y); y += 6;
    doc.setFont('helvetica','normal');
    doc.text(doc.splitTextToSize(content.description, 88), left, y);
    doc.text(content.total, right, y, { align: 'right' });
    y += Math.max(1, doc.splitTextToSize(content.description, 88).length) * 5 + 3;
    doc.setFont('helvetica','bold'); doc.text('Total', left, y); doc.text(content.total, right, y, { align: 'right' }); y += 6;
    doc.text('Paid', left, y); doc.text(content.totalPaid, right, y, { align: 'right' }); y += 6;
    doc.text('Balance due', left, y); doc.text(content.balanceDue, right, y, { align: 'right' }); y += 6;
    doc.text('Status', left, y); doc.text(content.statusLabel, right, y, { align: 'right' });

    return { blob: doc.output('blob'), filename: content.filename };
};
