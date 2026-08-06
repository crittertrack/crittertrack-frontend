import React from 'react';
import { FileCheck, Key, Ban, Tag, Home, Users, Trophy, Medal, Target, FileText, Download } from 'lucide-react';
import { formatDate } from '../../utils/dateFormatter';
import { Link as RouterLink } from 'react-router-dom';
import { InfoCard, InfoItem } from './DashboardComponents';

const parseJsonArrayField = (data) => {
    if (!data) return [];
    if (typeof data === 'string') {
        try {
            const parsed = JSON.parse(data);
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) { return []; }
    }
    return Array.isArray(data) ? data : [];
};

export const RecordsTabContent = ({ animal }) => {

    // From LegalTabContent
    const hasLicensing = animal.licenseNumber || animal.licenseJurisdiction;
    const hasLegal = animal.insurance || animal.legalStatus;
    const hasRestrictions = animal.breedingRestrictions || animal.exportRestrictions;
    const hasPurchase = animal.purchaseDate || animal.purchasePrice || animal.purchaseLocation || animal.sellerName || animal.sellerContact;
    const hasSale = animal.saleDate || animal.salePriceAmount || animal.saleLocation || animal.buyerName || animal.buyerContact;
    const hasRights = animal.breedingRightsPurchased || animal.showRightsPurchased || animal.exportRightsPurchased || animal.studServicesAllowed || animal.resaleRestrictions || animal.breederBuybackClause;
    const hasOwnerHistory = (animal.ownerHistory && animal.ownerHistory.length > 0) || (animal.keeperHistory && animal.keeperHistory.length > 0) || (animal.ownershipHistory && animal.ownershipHistory.length > 0);
    const hasLegalDocuments = (parseJsonArrayField(animal.legalDocuments) || []).length > 0;
    const hasMilestones = (parseJsonArrayField(animal.milestones) || []).length > 0;

    // From ShowTabContent
    const hasShows = (parseJsonArrayField(animal.shows) || []).length > 0;
    const hasShowData = hasShows || animal.showTitles || animal.showRatings || animal.judgeComments;
    const hasWorkData = animal.workingTitles || animal.performanceScores;

    const hasAnyData = hasLicensing || hasLegal || hasRestrictions || hasPurchase || hasSale || hasRights || hasOwnerHistory || hasLegalDocuments || hasMilestones || hasShowData || hasWorkData;

    if (!hasAnyData) {
        return (
            <div className="flex flex-col items-center justify-center h-64 bg-gray-50 dark:bg-dark-surface rounded-lg text-gray-400 dark:text-dark-text-muted">
                <FileCheck size={48} className="mb-2" />
                <p className="text-sm">No records available for this animal.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <InfoCard title="Licensing & Permits" icon={<Key size={18} className="text-gray-400 dark:text-dark-text-muted" />}>
                {hasLicensing
                    ? <dl className="space-y-4">
                          {animal.licenseNumber && <InfoItem label="License Number" value={animal.licenseNumber} />}
                          {animal.licenseJurisdiction && <InfoItem label="License Jurisdiction" value={animal.licenseJurisdiction} />}
                      </dl>
                    : <p className="text-sm text-gray-400 dark:text-dark-text-muted">No licensing or permit information recorded.</p>}
            </InfoCard>
            <InfoCard title="Legal / Administrative" icon={<FileCheck size={18} className="text-gray-400 dark:text-dark-text-muted" />}>
                {hasLegal
                    ? <dl className="space-y-4">
                          {animal.insurance && <InfoItem label="Insurance" value={animal.insurance} />}
                          {animal.legalStatus && <InfoItem label="Legal Status" value={animal.legalStatus} />}
                      </dl>
                    : <p className="text-sm text-gray-400 dark:text-dark-text-muted">No legal or administrative information recorded.</p>}
            </InfoCard>
            {hasLegalDocuments && (
                <InfoCard title="Legal Documents" icon={<FileText size={18} className="text-gray-400 dark:text-dark-text-muted" />}>
                    <div className="space-y-2">
                        {(parseJsonArrayField(animal.legalDocuments) || []).map((doc, idx) => (
                            <a
                                key={idx}
                                href={doc.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 rounded-lg border border-blue-200 dark:border-blue-700/60 transition-colors"
                            >
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                    <FileText size={16} className="text-blue-600 dark:text-blue-400 flex-shrink-0" />
                                    <span className="text-sm font-medium text-blue-900 truncate">{doc.filename || 'Document'}</span>
                                </div>
                                <Download size={14} className="text-blue-600 dark:text-blue-400 flex-shrink-0 ml-2" />
                            </a>
                        ))}
                    </div>
                </InfoCard>
            )}
            <InfoCard title="Restrictions" icon={<Ban size={18} className="text-gray-400 dark:text-dark-text-muted" />}>
                {hasRestrictions
                    ? <dl className="space-y-4">
                          {animal.breedingRestrictions && <InfoItem label="Breeding Restrictions" value={animal.breedingRestrictions} />}
                          {animal.exportRestrictions && <InfoItem label="Export Restrictions" value={animal.exportRestrictions} />}
                      </dl>
                    : <p className="text-sm text-gray-400 dark:text-dark-text-muted">No restrictions recorded.</p>}
            </InfoCard>
            <InfoCard title="Purchase Information" icon={<Tag size={18} className="text-gray-400 dark:text-dark-text-muted" />}>
                {hasPurchase
                    ? <dl className="space-y-4">
                          {animal.purchaseDate && <InfoItem label="Purchase Date" value={formatDate(animal.purchaseDate)} />}
                          {animal.purchasePrice && <InfoItem label="Purchase Price" value={`${animal.purchasePriceCurrency || ''} ${animal.purchasePrice}`} />}
                          {animal.purchaseLocation && <InfoItem label="Purchase Location" value={animal.purchaseLocation} />}
                          {animal.sellerName && <InfoItem label="Seller/Breeder" value={animal.sellerName} />}
                          {animal.sellerContact && <InfoItem label="Seller Contact" value={animal.sellerContact} />}
                      </dl>
                    : <p className="text-sm text-gray-400 dark:text-dark-text-muted">No purchase information recorded.</p>}
            </InfoCard>
            <InfoCard title="Sale Information" icon={<Tag size={18} className="text-gray-400 dark:text-dark-text-muted" />}>
                {hasSale ? (
                    <dl className="space-y-4">
                        {animal.saleDate && <InfoItem label="Sale Date" value={formatDate(animal.saleDate)} />}
                        {animal.salePriceAmount && <InfoItem label="Sale Price" value={`${animal.salePriceCurrency || ''} ${animal.salePriceAmount}`} />}
                        {animal.saleLocation && <InfoItem label="Sale Location" value={animal.saleLocation} />}
                        {animal.buyerName && <InfoItem label="Buyer" value={animal.buyerName} />}
                        {animal.buyerContact && <InfoItem label="Buyer Contact" value={animal.buyerContact} />}
                    </dl>
                ) : <p className="text-sm text-gray-400 dark:text-dark-text-muted">No sale information recorded.</p>}
            </InfoCard>
            {hasRights && (
                <InfoCard title="Rights & Restrictions" icon={<Ban size={18} className="text-amber-600 dark:text-amber-400" />}>
                    <dl className="space-y-4">
                        {animal.breedingRightsPurchased && (
                            <InfoItem label="Breeding Rights" value={
                                animal.breedingRightsPurchased === 'yes' ? '✓ Included' :
                                animal.breedingRightsPurchased === 'conditional' ? '⚠ Conditional - Limited Terms' :
                                '✗ Not Included'
                            } />
                        )}
                        {animal.showRightsPurchased && (
                            <InfoItem label="Show Rights" value={
                                animal.showRightsPurchased === 'yes' ? '✓ Included' :
                                animal.showRightsPurchased === 'conditional' ? '⚠ Conditional - Limited Terms' :
                                '✗ Not Included'
                            } />
                        )}
                        {animal.exportRightsPurchased && (
                            <InfoItem label="Export Rights" value={
                                animal.exportRightsPurchased === 'yes' ? '✓ Included' :
                                '✗ Not Included'
                            } />
                        )}
                        {animal.studServicesAllowed && (
                            <InfoItem label="Stud Services" value={
                                animal.studServicesAllowed === 'yes' ? '✓ Allowed' :
                                animal.studServicesAllowed === 'conditional' ? '⚠ Conditional' :
                                '✗ Not Allowed'
                            } />
                        )}
                        {animal.resaleRestrictions && (
                            <div className="border-t pt-3">
                                <p className="text-xs font-semibold text-gray-600 dark:text-dark-text-secondary mb-1">Resale Restrictions</p>
                                <p className="text-sm text-gray-700 dark:text-dark-text-secondary whitespace-pre-wrap">{animal.resaleRestrictions}</p>
                            </div>
                        )}
                        {animal.breederBuybackClause && (
                            <div className="border-t pt-3">
                                <p className="text-xs font-semibold text-gray-600 dark:text-dark-text-secondary mb-1">Breeder Buyback Clause</p>
                                <p className="text-sm text-gray-700 dark:text-dark-text-secondary whitespace-pre-wrap">{animal.breederBuybackClause}</p>
                            </div>
                        )}
                    </dl>
                </InfoCard>
            )}
            <InfoCard title="Owner History" icon={<Users size={18} className="text-gray-400 dark:text-dark-text-muted" />}>
                {hasOwnerHistory ? (
                    <div className="space-y-3">
                        {/* Primary: New ownershipHistory format */}
                        {(animal.ownershipHistory && animal.ownershipHistory.length > 0) ? (
                            (parseJsonArrayField(animal.ownershipHistory) || []).map((entry, idx) => (
                                <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-dark-surface rounded-lg border border-gray-200 dark:border-dark-border">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            {entry.userId_public ? (
                                                <RouterLink to={`/user/${entry.userId_public}`} className="font-semibold text-purple-600 dark:text-purple-400 hover:underline text-sm">
                                                    {entry.ownerName || 'Unknown'}
                                                </RouterLink>
                                            ) : (
                                                <p className="font-semibold text-gray-800 dark:text-dark-text text-sm">{entry.ownerName || 'Unknown'}</p>
                                            )}
                                            {entry.ownershipType && <span className="text-xs bg-gray-200 dark:bg-dark-surface text-gray-700 dark:text-dark-text-secondary px-2 py-0.5 rounded-full">{entry.ownershipType}</span>}
                                            {entry.country && <span className="text-xs text-gray-500 dark:text-dark-text-muted font-mono">{entry.country}</span>}
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-dark-text-muted mt-1">
                                            {entry.startDate || 'Unknown start date'}
                                            {entry.endDate && ` → ${entry.endDate}`}
                                            {!entry.endDate && ' (current)'}
                                        </p>
                                        {entry.userId_public && <p className="text-xs text-gray-400 dark:text-dark-text-muted font-mono mt-0.5">{entry.userId_public}</p>}
                                    </div>
                                </div>
                            ))
                        ) : (
                            /* Fallback: Legacy ownerHistory or keeperHistory */
                            (animal.ownerHistory || animal.keeperHistory || []).map((entry, idx) => (
                                <div key={idx} className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-dark-surface rounded-lg border border-gray-200 dark:border-dark-border">
                                    <div className="flex-1 min-w-0">
                                        {entry.userId_public ? (
                                            <RouterLink to={`/user/${entry.userId_public}`} className="text-sm font-semibold text-purple-600 dark:text-purple-400 hover:underline">{entry.name || 'Unknown'}</RouterLink>
                                        ) : (
                                            <p className="text-sm font-semibold text-gray-800 dark:text-dark-text">{entry.name || 'Unknown'}</p>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                ) : <p className="text-sm text-gray-400 dark:text-dark-text-muted">No owner history recorded.</p>}
            </InfoCard>
            <InfoCard title="Show Titles & Ratings" icon={<Medal size={18} className="text-gray-400 dark:text-dark-text-muted" />}>
                {hasShowData ? (
                    <div className="space-y-4">
                        {hasShows && (
                            <div className="space-y-3 pb-3 border-b border-gray-200 dark:border-dark-border">
                                <p className="text-sm font-semibold text-gray-700 dark:text-dark-text-secondary">Show Events</p>
                                {(parseJsonArrayField(animal.shows) || []).map((show, idx) => (
                                    <div key={idx} className="p-3 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 rounded border border-amber-200 dark:border-amber-700/60">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <p className="font-semibold text-amber-900">{show.showName}</p>
                                                <p className="text-xs text-gray-700 dark:text-dark-text-secondary">{formatDate(show.date)}</p>
                                                {show.titleEarned && <p className="text-sm text-amber-800 dark:text-amber-300 font-medium">{show.titleEarned}</p>}
                                                {show.score && <p className="text-xs text-gray-700 dark:text-dark-text-secondary">Score: {show.score}</p>}
                                                {show.judgeName && <p className="text-xs text-gray-700 dark:text-dark-text-secondary">Judge: {show.judgeName}</p>}
                                                {show.judgeComments && <p className="text-xs text-gray-700 dark:text-dark-text-secondary italic mt-1">{show.judgeComments}</p>}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        {animal.showTitles && <InfoItem label="Titles (Legacy)" value={animal.showTitles} />}
                        {animal.showRatings && <InfoItem label="Ratings (Legacy)" value={animal.showRatings} />}
                        {animal.judgeComments && <InfoItem label="Judge Comments (Legacy)"><p className="whitespace-pre-wrap">{animal.judgeComments}</p></InfoItem>}
                    </div>
                ) : <p className="text-sm text-gray-400 dark:text-dark-text-muted">No show titles or ratings recorded.</p>}
            </InfoCard>
            <InfoCard title="Working & Performance" icon={<Target size={18} className="text-gray-400 dark:text-dark-text-muted" />}>
                {hasWorkData ? (
                    <dl className="space-y-4">
                        {animal.workingTitles && <InfoItem label="Working Titles" value={animal.workingTitles} />}
                        {animal.performanceScores && <InfoItem label="Performance Scores" value={animal.performanceScores} />}
                    </dl>
                ) : <p className="text-sm text-gray-400 dark:text-dark-text-muted">No working or performance records.</p>}
            </InfoCard>
            {hasMilestones && (
                <InfoCard title="Milestones" icon={<Target size={18} className="text-yellow-600 dark:text-yellow-400" />}>
                    <div className="space-y-3">
                        {(parseJsonArrayField(animal.milestones) || []).map((milestone, idx) => (
                            <div key={idx} className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-700/60">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-yellow-900">{milestone.label}</p>
                                        <p className="text-sm text-gray-700 dark:text-dark-text-secondary">{formatDate(milestone.startDate)}</p>
                                        {milestone.interval && (
                                            <p className="text-xs text-gray-600 dark:text-dark-text-secondary mt-1">
                                                Repeats every {milestone.interval} {milestone.intervalUnit}(s)
                                            </p>
                                        )}
                                        {milestone.description && (
                                            <p className="text-sm text-gray-600 dark:text-dark-text-secondary mt-2 italic">{milestone.description}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </InfoCard>
            )}
        </div>
    );
};
