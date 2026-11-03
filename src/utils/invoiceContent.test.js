import { buildInvoiceContent } from './invoiceContent';
import { reservationToInvoiceTransaction } from './reservationInvoice';

const base = { type: 'sale', animalId: 'CTC1', animalName: 'Milo', buyer: 'Sam', price: 15, date: '2026-03-01T00:00:00.000Z' };
const build = (tx) => buildInvoiceContent({ transaction: tx, issuerName: 'Me', currencySymbol: '$' });

describe('invoice content', () => {
    it('is unpaid with the full balance due when nothing is paid', () => {
        const c = build(base);
        expect(c.title).toBe('Invoice');
        expect(c.status).toBe('unpaid');
        expect(c.totalPaid).toBe('$0.00');
        expect(c.balanceDue).toBe('$15.00');
        expect(c.parties.fromLabel).toBe('Billed to');
    });

    it('counts a paid deposit and is partially paid', () => {
        const c = build({ ...base, reservedDeposit: 7.5, reservedDepositStatus: 'done' });
        expect(c.status).toBe('partial');
        expect(c.totalPaid).toBe('$7.50');
        expect(c.balanceDue).toBe('$7.50');
    });

    it('does not count a deposit that is not paid yet', () => {
        const c = build({ ...base, reservedDeposit: 7.5, reservedDepositStatus: 'due' });
        expect(c.totalPaid).toBe('$0.00');
        expect(c.status).toBe('unpaid');
    });

    it('is paid once payments cover the price, and never shows more paid than the price', () => {
        const c = build({ ...base, reservedDeposit: 7.5, reservedDepositStatus: 'done', payments: [{ amount: 20 }] });
        expect(c.status).toBe('paid');
        expect(c.totalPaid).toBe('$15.00');
        expect(c.balanceDue).toBe('$0.00');
    });

    it('names the file after the animal when there is no receipt number', () => {
        expect(build(base).filename).toBe('invoice-CTC1.pdf');
        expect(build({ ...base, receiptNumber: 'R-0004' }).filename).toBe('R-0004.pdf');
    });
});

describe('reservation to invoice', () => {
    const animal = { id_public: 'CTC1', prefix: 'Sir', name: 'Milo', suffix: 'Jr', reservedBuyerName: 'Sam', reservedPrice: 15, reservedDeposit: 7.5 };

    it('bills the full price with the buyer and the full animal name', () => {
        const tx = reservationToInvoiceTransaction(animal, '2026-03-02');
        expect(tx).toMatchObject({ type: 'sale', price: 15, buyer: 'Sam', animalName: 'Sir Milo Jr', date: '2026-03-02' });
        expect(build(tx).balanceDue).toBe('$15.00');
    });

    it('treats the deposit as part of the price once it is paid', () => {
        const c = build(reservationToInvoiceTransaction({ ...animal, reservedDepositStatus: 'done' }, '2026-03-02'));
        expect(c.status).toBe('partial');
        expect(c.totalPaid).toBe('$7.50');
        expect(c.balanceDue).toBe('$7.50');
    });

    it('is fully paid when the full price is marked done, even if the deposit was never ticked', () => {
        const c = build(reservationToInvoiceTransaction({ ...animal, reservedDepositStatus: 'due', reservedPaymentStatus: 'done' }, '2026-03-02'));
        expect(c.status).toBe('paid');
        expect(c.totalPaid).toBe('$15.00');
        expect(c.balanceDue).toBe('$0.00');
    });

    it('works without a deposit', () => {
        const c = build(reservationToInvoiceTransaction({ ...animal, reservedDeposit: null, reservedPaymentStatus: 'done' }, '2026-03-02'));
        expect(c.status).toBe('paid');
        expect(c.totalPaid).toBe('$15.00');
    });

    it('uses the reservation date when there is one', () => {
        expect(reservationToInvoiceTransaction({ ...animal, reservedDate: '2026-02-01' }, '2026-03-02').date).toBe('2026-02-01');
    });
});
