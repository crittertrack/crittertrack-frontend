import React from 'react';

// One user suggestion (species + gestation / weaning days). Read-only: values are added in code.
const days = (n) => (n != null ? `${n} days` : '-');

const SpeciesSuggestionCard = ({ item }) => (
    <li className="rounded-xl border border-gray-200 bg-white p-4">
        <p className="text-base font-bold text-gray-900">{item.species}</p>
        <dl className="mt-2 grid grid-cols-2 gap-3 text-sm sm:max-w-md">
            <div><dt className="text-xs uppercase tracking-wide text-gray-500">Gestation</dt><dd className="font-semibold text-gray-800">{days(item.gestationDays)}</dd></div>
            <div><dt className="text-xs uppercase tracking-wide text-gray-500">Weaning</dt><dd className="font-semibold text-gray-800">{days(item.weaningDays)}</dd></div>
        </dl>
        <p className="mt-2 text-xs text-gray-500">{item.userName} ({item.userIdPublic}) &middot; {new Date(item.createdAt).toLocaleDateString()}</p>
    </li>
);

export default SpeciesSuggestionCard;
