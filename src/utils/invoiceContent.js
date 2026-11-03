import { buildReceiptContent } from './receiptContent';

export const buildInvoiceContent = ({ transaction, issuerName, currencySymbol }) => {
    const base = buildReceiptContent({ transaction, issuerName, currencySymbol });
    const payments = transaction.payments || [];
    const totalPaid = (transaction.reservedDepositStatus === 'done' ? (transaction.reservedDeposit || 0) : 0)
        + payments.reduce((s, p) => s + (Number(p.amount) || 0), 0);
    const balance = Math.max(0, (Number(transaction.price) || 0) - totalPaid);
    return {
        ...base,
        title: 'Invoice',
        payments,
        totalPaid: `${currencySymbol}${totalPaid.toFixed(2)}`,
        balanceDue: `${currencySymbol}${balance.toFixed(2)}`,
        filename: `${transaction.receiptNumber || 'invoice'}.pdf`,
    };
};
