import { buildReceiptContent, getReceiptParties, formatReceiptAmount } from './receiptContent';

const sale = {
    type: 'sale', animalName: 'Milo', animalId: 'CTC1001', price: 75, buyer: 'Sam',
    date: '2026-03-05T00:00:00.000Z', receiptNumber: 'R-0007', notes: 'Paid in cash',
};

describe('receipt content', () => {
    it('describes an animal sale with buyer, issuer, amount and receipt number', () => {
        const c = buildReceiptContent({ transaction: sale, issuerName: 'Happy Rattery', currencySymbol: '$' });
        expect(c.title).toBe('Receipt');
        expect(c.number).toBe('R-0007');
        expect(c.description).toBe('Milo (CTC1001)');
        expect(c.total).toBe('$75.00');
        expect(c.date).toContain('2026');
        expect(c.parties).toEqual({ fromLabel: 'Received from', from: 'Sam', toLabel: 'Issued by', to: 'Happy Rattery' });
        expect(c.details).toEqual([['Notes', 'Paid in cash']]);
        expect(c.filename).toBe('R-0007.pdf');
    });

    it('uses the description, category and litter for an expense', () => {
        const c = buildReceiptContent({
            transaction: { type: 'expense', description: 'Vet check', category: 'medical', litterId: 'CTL1', price: 40, date: '2026-01-01' },
            issuerName: 'Me', currencySymbol: '€',
        });
        expect(c.title).toBe('Payment record');
        expect(c.description).toBe('Vet check');
        expect(c.total).toBe('€40.00');
        expect(c.details).toEqual([['Category', 'Medical & veterinary'], ['Litter', 'CTL1']]);
        expect(c.filename).toBe('receipt.pdf');
    });

    it('works out who paid whom for each transaction type', () => {
        expect(getReceiptParties({ type: 'purchase', seller: 'Ann' }, 'Me')).toEqual({ fromLabel: 'Paid to', from: 'Ann', toLabel: 'Paid by', to: 'Me' });
        expect(getReceiptParties({ type: 'income' }, 'Me').fromLabel).toBe('Received by');
        expect(getReceiptParties({ type: 'expense' }, '').from).toBe('Seller');
    });

    it('formats amounts safely', () => {
        expect(formatReceiptAmount(5)).toBe('$5.00');
        expect(formatReceiptAmount('abc')).toBe('$0.00');
        expect(formatReceiptAmount(1.005, 'kr')).toMatch(/^kr1\.0[01]$/);
    });

    it('copes with a missing date or animal name', () => {
        const c = buildReceiptContent({ transaction: { type: 'sale', price: 1 } });
        expect(c.date).toBe('');
        expect(c.description).toBe('Animal');
    });
});
