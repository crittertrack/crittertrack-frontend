import { buildReceiptContent } from './receiptContent';

const STATUS_LABELS = { paid: 'Paid', partial: 'Partially paid', unpaid: 'Unpaid' };

// Same rules as the server (utils/paymentStatus.js): a deposit only counts once it is marked done,
// recorded payments are added to it, and the total is never more than the price.
export const buildInvoiceContent = ({ transaction, issuerName, currencySymbol }) => {
    const base = buildReceiptContent({ transaction, issuerName, currencySymbol });
    const payments = transaction.payments || [];
    const price = Number(transaction.price) || 0;
    const rawPaid = (transaction.reservedDepositStatus === 'done' ? (Number(transaction.reservedDeposit) || 0) : 0)
        + payments.reduce((s, p) => s + (Number(p.amount) || 0), 0);
    const totalPaid = Math.min(price, rawPaid);
    const balance = Math.max(0, price - totalPaid);
    let status = 'partial';
    if (price <= 0 || totalPaid >= price) status = 'paid';
    else if (totalPaid <= 0) status = 'unpaid';

    // An invoice asks the buyer to pay, so it says "Billed to" rather than "Received from".
    const parties = transaction.type === 'sale' ? { ...base.parties, fromLabel: 'Billed to' } : base.parties;
    const fallbackName = transaction.animalId ? `invoice-${transaction.animalId}` : 'invoice';
    return {
        ...base,
        title: 'Invoice',
        parties,
        payments,
        totalPaid: `${currencySymbol}${totalPaid.toFixed(2)}`,
        balanceDue: `${currencySymbol}${balance.toFixed(2)}`,
        status,
        statusLabel: STATUS_LABELS[status],
        filename: `${transaction.receiptNumber || fallbackName}.pdf`,
    };
};
