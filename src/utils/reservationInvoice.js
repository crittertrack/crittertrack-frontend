// Builds a Budget-style "sale" transaction from an animal's reservation, so the existing invoice
// PDF can be generated before any sale is recorded in the Budget (that only happens once the
// reservation is finalized).
//
// The deposit is part of the price, not on top of it. When the full price is marked paid, the whole
// price counts as paid: the deposit is treated as paid and the balance becomes a recorded payment.
export const reservationToInvoiceTransaction = (animal, fallbackDate) => {
    const price = Number(animal.reservedPrice) || 0;
    const deposit = Number(animal.reservedDeposit) || 0;
    const paidInFull = animal.reservedPaymentStatus === 'done';
    const balance = Math.max(0, price - deposit);

    let depositStatus = null;
    if (deposit > 0) depositStatus = paidInFull || animal.reservedDepositStatus === 'done' ? 'done' : 'due';

    return {
        type: 'sale',
        animalId: animal.id_public || '',
        animalName: [animal.prefix, animal.name, animal.suffix].filter(Boolean).join(' '),
        buyer: animal.reservedBuyerName || '',
        price,
        date: animal.reservedDate || fallbackDate,
        reservedDeposit: deposit > 0 ? deposit : null,
        reservedDepositStatus: depositStatus,
        payments: paidInFull && balance > 0 ? [{ amount: balance, note: 'Balance' }] : [],
        notes: '',
    };
};
