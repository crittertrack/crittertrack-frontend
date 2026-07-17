import React from 'react';
import { FileCheck, Key, Ban, Tag, Home } from 'lucide-react';
import { useDetailFieldTemplate } from './utils';
import { formatDate } from '../../utils/dateFormatter';
import { Link as RouterLink } from 'react-router-dom';
import { InfoCard, InfoItem } from './DashboardComponents';

export const LegalTabContent = ({ animal, API_BASE_URL }) => {
    const { getLabel } = useDetailFieldTemplate(animal?.species, API_BASE_URL);

    const hasLicensing = animal.licenseNumber || animal.licenseJurisdiction;
    const hasLegal = animal.insurance || animal.legalStatus;
    const hasRestrictions = animal.breedingRestrictions || animal.exportRestrictions;
    const hasPurchase = animal.purchaseDate || animal.purchasePrice || animal.purchaseLocation;
    const hasSale = animal.saleDate || animal.salePriceAmount || animal.saleLocation;
    const hasOwnerHistory = (animal.ownerHistory && animal.ownerHistory.length > 0) || (animal.keeperHistory && animal.keeperHistory.length > 0);

    const hasAnyData = hasLicensing || hasLegal || hasRestrictions || hasPurchase || hasSale || hasOwnerHistory;

    if (!hasAnyData) {
        return (
            <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-lg text-gray-400">
                <FileCheck size={48} className="mb-2" />
                <p className="text-sm">No legal, ownership, or documentation records.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
                <InfoCard title="Licensing & Permits" icon={<Key size={18} className="text-gray-400" />}>
                    {hasLicensing ? (
                        <dl className="space-y-4">
                            {animal.licenseNumber && <InfoItem label={getLabel('licenseNumber', 'License Number')} value={animal.licenseNumber} />}
                            {animal.licenseJurisdiction && <InfoItem label={getLabel('licenseJurisdiction', 'License Jurisdiction')} value={animal.licenseJurisdiction} />}
                        </dl>
                    ) : <p className="text-sm text-gray-400">No licensing or permit information recorded.</p>}
                </InfoCard>
                <InfoCard title="Legal / Administrative" icon={<FileCheck size={18} className="text-gray-400" />}>
                    {hasLegal ? (
                        <dl className="space-y-4">
                            {animal.insurance && <InfoItem label={getLabel('insurance', 'Insurance')} value={animal.insurance} />}
                            {animal.legalStatus && <InfoItem label={getLabel('legalStatus', 'Legal Status')} value={animal.legalStatus} />}
                        </dl>
                    ) : <p className="text-sm text-gray-400">No legal or administrative information recorded.</p>}
                </InfoCard>
                <InfoCard title="Restrictions" icon={<Ban size={18} className="text-gray-400" />}>
                    {hasRestrictions ? (
                        <dl className="space-y-4">
                            {animal.breedingRestrictions && <InfoItem label={getLabel('breedingRestrictions', 'Breeding Restrictions')} value={animal.breedingRestrictions} />}
                            {animal.exportRestrictions && <InfoItem label={getLabel('exportRestrictions', 'Export Restrictions')} value={animal.exportRestrictions} />}
                        </dl>
                    ) : <p className="text-sm text-gray-400">No restrictions recorded.</p>}
                </InfoCard>
            </div>
             <div className="space-y-6">
                <InfoCard title="Purchase Information" icon={<Tag size={18} className="text-gray-400" />}>
                    {hasPurchase ? (
                        <dl className="space-y-4">
                            {animal.purchaseDate && <InfoItem label="Purchase Date" value={formatDate(animal.purchaseDate)} />}
                            {animal.purchasePrice && <InfoItem label="Purchase Price" value={`${animal.purchasePriceCurrency || ''} ${animal.purchasePrice}`} />}
                            {animal.purchaseLocation && <InfoItem label="Purchase Location" value={animal.purchaseLocation} />}
                        </dl>
                    ) : <p className="text-sm text-gray-400">No purchase information recorded.</p>}
                </InfoCard>
                <InfoCard title="Sale Information" icon={<Tag size={18} className="text-gray-400" />}>
                    {hasSale ? (
                        <dl className="space-y-4">
                            {animal.saleDate && <InfoItem label="Sale Date" value={formatDate(animal.saleDate)} />}
                            {animal.salePriceAmount && <InfoItem label="Sale Price" value={`${animal.salePriceCurrency || ''} ${animal.salePriceAmount}`} />}
                            {animal.saleLocation && <InfoItem label="Sale Location" value={animal.saleLocation} />}
                        </dl>
                    ) : <p className="text-sm text-gray-400">No sale information recorded.</p>}
                </InfoCard>
                <InfoCard title="Owner History" icon={<Users size={18} className="text-gray-400" />}>
                    {hasOwnerHistory ? (
                        <div className="space-y-2">
                            {(animal.ownerHistory || animal.keeperHistory || []).map((entry, idx) => (
                                <div key={idx} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg border border-gray-200">
                                    <div className="flex-1 min-w-0"> {/* Changed from creatorId_public to creatorId_public */}
                                        {entry.userId_public
                                            ? <RouterLink to={`/user/${entry.userId_public}`} className="text-sm font-semibold text-purple-600 hover:underline">{entry.name || 'Unknown'}</RouterLink>
                                            : <p className="text-sm font-semibold text-gray-800">{entry.name || 'Unknown'}</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : <p className="text-sm text-gray-400">No owner history recorded.</p>}
                </InfoCard>
            </div>
        </div>
    );
};