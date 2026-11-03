// Pure builder for the content of a Budget receipt (no PDF or network code, so it can be
// unit-tested). receiptPdf.js draws the result.

const TYPE_LABELS = {
    sale: 'Animal sale',
    purchase: 'Animal purchase',
    expense: 'Expense',
    income: 'Income',
    gift: 'Gift',
};

const CATEGORY_LABELS = {
    food: 'Food & supplies',
    housing: 'Housing & bedding',
    medical: 'Medical & veterinary',
    equipment: 'Equipment & setup',
    other: 'Other',
};

export const formatReceiptAmount = (value, symbol = '$') => {
    const n = Number(value);
    return `${symbol}${(Number.isFinite(n) ? n : 0).toFixed(2)}`;
};

const formatReceiptDate = (value) => {
    if (!value) return '';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
};

// Who the money went from and to, from the point of view of the user issuing the receipt.
export const getReceiptParties = (transaction, issuerName) => {
    const me = issuerName || 'Seller';
    switch (transaction.type) {
        case 'sale':
            return { fromLabel: 'Received from', from: transaction.buyer || '', toLabel: 'Issued by', to: me };
        case 'purchase':
            return { fromLabel: 'Paid to', from: transaction.seller || '', toLabel: 'Paid by', to: me };
        case 'income':
            return { fromLabel: 'Received by', from: me, toLabel: '', to: '' };
        default:
            return { fromLabel: 'Paid by', from: me, toLabel: '', to: '' };
    }
};

export const buildReceiptContent = ({ transaction, issuerName = '', currencySymbol = '$' }) => {
    const isAnimal = transaction.type === 'sale' || transaction.type === 'purchase';
    const description = isAnimal
        ? [transaction.animalName, transaction.animalId ? `(${transaction.animalId})` : ''].filter(Boolean).join(' ') || 'Animal'
        : (transaction.description || TYPE_LABELS[transaction.type] || 'Item');

    const details = [];
    if (!isAnimal && transaction.category) details.push(['Category', CATEGORY_LABELS[transaction.category] || transaction.category]);
    if (transaction.litterId) details.push(['Litter', transaction.litterId]);
    if (transaction.notes) details.push(['Notes', transaction.notes]);

    return {
        title: transaction.type === 'sale' || transaction.type === 'income' ? 'Receipt' : 'Payment record',
        number: transaction.receiptNumber || '',
        date: formatReceiptDate(transaction.date),
        typeLabel: TYPE_LABELS[transaction.type] || 'Transaction',
        description,
        parties: getReceiptParties(transaction, issuerName),
        details,
        total: formatReceiptAmount(transaction.price, currencySymbol),
        filename: `${transaction.receiptNumber || 'receipt'}.pdf`,
    };
};
