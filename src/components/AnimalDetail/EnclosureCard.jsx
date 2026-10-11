import React, { useState } from 'react';
import { Home, Thermometer, Droplets, Sun, Sparkles, Package, X, ClipboardList } from 'lucide-react';
import { InfoItem } from './DashboardComponents';
import { formatDate } from '../../utils/dateFormatter';
import { getEnclosurePurposeLabel } from '../../utils/enclosurePurpose';

const formatDimensions = (dims) => {
    if (dims && (dims.length || dims.width || dims.height)) {
        return `${dims.length || '?'} x ${dims.width || '?'} x ${dims.height || '?'} ${dims.unit || 'in'}`;
    }
    return null;
};

const Detail = ({ label, children }) => (
    <InfoItem label={label}>
        <p className="text-sm text-gray-800 dark:text-dark-text">{children}</p>
    </InfoItem>
);

const EnclosureDetailsModal = ({ enclosureInfo, onClose }) => {
    const dimensions = formatDimensions(enclosureInfo.dimensions);
    const tasks = enclosureInfo.cleaningTasks || [];

    return (
        <div className="fixed inset-0 z-[400] flex items-center justify-center bg-black/60 p-3 sm:p-6" onClick={onClose}>
            <section
                role="dialog"
                aria-modal="true"
                aria-labelledby="animal-enclosure-title"
                className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl dark:bg-dark-card-bg"
                onClick={event => event.stopPropagation()}
            >
                <header className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-dark-border">
                    <div>
                        <h2 id="animal-enclosure-title" className="text-lg font-bold text-gray-900 dark:text-dark-text">{enclosureInfo.name}</h2>
                        <p className="text-sm text-gray-500 dark:text-dark-text-muted">{enclosureInfo.enclosureType || 'Enclosure'}</p>
                    </div>
                    <button type="button" onClick={onClose} aria-label="Close enclosure details" className="rounded-full p-2 text-gray-500 hover:bg-gray-100 dark:text-dark-text-muted dark:hover:bg-dark-surface-hover">
                        <X size={20} />
                    </button>
                </header>

                <div className="overflow-y-auto p-4 sm:p-6">
                    {enclosureInfo.imageUrl && <img src={enclosureInfo.imageUrl} alt={enclosureInfo.name} className="mb-5 max-h-72 w-full rounded-lg bg-gray-100 object-contain dark:bg-dark-surface" />}

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {enclosureInfo.enclosureType && <Detail label="Enclosure Type">{enclosureInfo.enclosureType}</Detail>}
                        <Detail label="Purpose">{getEnclosurePurposeLabel(enclosureInfo.purpose)}</Detail>
                        {enclosureInfo.purposeDescription && <Detail label="Purpose Description">{enclosureInfo.purposeDescription}</Detail>}
                        {dimensions && <Detail label="Dimensions">{dimensions}</Detail>}
                        {enclosureInfo.capacity != null && <Detail label="Capacity">{enclosureInfo.capacity}</Detail>}
                        {(enclosureInfo.tempMin != null || enclosureInfo.tempMax != null) && (
                            <Detail label="Temperature">{`${enclosureInfo.tempMin ?? '?'}°–${enclosureInfo.tempMax ?? '?'}°${enclosureInfo.temperatureUnit || 'C'}`}</Detail>
                        )}
                        {(enclosureInfo.humidityMin != null || enclosureInfo.humidityMax != null) && (
                            <Detail label="Humidity">{`${enclosureInfo.humidityMin ?? '?'}%–${enclosureInfo.humidityMax ?? '?'}%`}</Detail>
                        )}
                        {enclosureInfo.lightingType && <Detail label="Lighting Type">{enclosureInfo.lightingType}</Detail>}
                        {(enclosureInfo.lightsOnTime || enclosureInfo.lightsOffTime) && <Detail label="Lighting Schedule">{`${enclosureInfo.lightsOnTime || '—'} – ${enclosureInfo.lightsOffTime || '—'}`}</Detail>}
                        {enclosureInfo.bedding && <Detail label="Bedding / Substrate">{enclosureInfo.bedding}</Detail>}
                        {enclosureInfo.enrichment && <Detail label="Enrichment">{enclosureInfo.enrichment}</Detail>}
                        {enclosureInfo.notes && <Detail label="Notes">{enclosureInfo.notes}</Detail>}
                        {enclosureInfo.buildingName && <Detail label="Building">{enclosureInfo.buildingName}</Detail>}
                        {enclosureInfo.roomName && <Detail label="Room">{enclosureInfo.roomName}</Detail>}
                        {enclosureInfo.tags?.length > 0 && <Detail label="Tags">{enclosureInfo.tags.join(', ')}</Detail>}
                        {enclosureInfo.speciesLabels?.length > 0 && <Detail label="Suitable Species">{enclosureInfo.speciesLabels.join(', ')}</Detail>}
                    </div>

                    <section className="mt-6">
                        <h3 className="mb-3 flex items-center gap-2 text-base font-semibold text-gray-800 dark:text-dark-text">
                            <ClipboardList size={18} /> Enclosure Tasks ({tasks.length})
                        </h3>
                        {tasks.length === 0 ? (
                            <p className="rounded-lg bg-gray-50 p-3 text-sm text-gray-500 dark:bg-dark-surface dark:text-dark-text-muted">No tasks added.</p>
                        ) : (
                            <div className="space-y-3">
                                {tasks.map((task, index) => (
                                    <article key={task._id || `${task.taskName}-${index}`} className="rounded-lg border border-gray-200 p-3 dark:border-dark-border">
                                        <div className="flex flex-wrap items-start justify-between gap-2">
                                            <div>
                                                <h4 className="font-semibold text-gray-800 dark:text-dark-text">{task.taskName}</h4>
                                                <p className="text-xs text-gray-500 dark:text-dark-text-muted">Type: {task.type || 'Other'}</p>
                                            </div>
                                            {(task.frequencyDays || task.frequency) && (
                                                <span className="text-xs text-gray-600 dark:text-dark-text-secondary">
                                                    Every {task.frequencyDays || task.frequency} {task.frequencyDays ? 'days' : task.frequencyUnit || 'days'}
                                                </span>
                                            )}
                                        </div>
                                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-dark-text-muted">
                                            <span>Last done: {task.lastDoneDate ? formatDate(task.lastDoneDate) : 'Never'}</span>
                                            {task.assignedSupplies?.length > 0 && (
                                                <span className="inline-flex items-center gap-1">
                                                    <Package size={12} />
                                                    {task.assignedSupplies.map(supply => `${supply.quantity || 1}${supply.unit ? ` ${supply.unit}` : ''} × ${supply.supplyName || 'Supply'}`).join(', ')}
                                                </span>
                                            )}
                                        </div>
                                        {task.notes && <p className="mt-2 whitespace-pre-wrap text-sm text-gray-600 dark:text-dark-text-secondary">{task.notes}</p>}
                                    </article>
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            </section>
        </div>
    );
};

export const EnclosureCard = ({ enclosureInfo }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    if (!enclosureInfo) return null;

    const dimensions = formatDimensions(enclosureInfo.dimensions);
    const detailsShared = enclosureInfo.detailsShared !== false;
    const CardContainer = detailsShared ? 'button' : 'div';

    return (
        <>
            <CardContainer
                {...(detailsShared ? {
                    type: 'button',
                    onClick: () => setIsModalOpen(true),
                    'aria-label': `View all details for ${enclosureInfo.name}`,
                } : {})}
                className={`block w-full overflow-hidden rounded-lg border border-gray-200 bg-white text-left shadow-sm dark:border-dark-border dark:bg-dark-card-bg${detailsShared ? ' transition hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary' : ''}`}
            >
                <div className="grid grid-cols-1 md:grid-cols-3">
                    <div className="flex aspect-video items-center justify-center bg-gray-100 dark:bg-dark-surface md:col-span-1 md:aspect-auto">
                        {enclosureInfo.imageUrl ? (
                            <img src={enclosureInfo.imageUrl} alt={enclosureInfo.name} className="h-full w-full object-cover" />
                        ) : (
                            <Home size={48} className="text-gray-300 dark:text-dark-border" />
                        )}
                    </div>

                    <div className="p-4 md:col-span-2">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-dark-text">{enclosureInfo.name}</h3>
                        <p className="mb-3 text-sm text-gray-500 dark:text-dark-text-muted">{enclosureInfo.enclosureType}{dimensions ? ` • ${dimensions}` : ''}</p>
                        <div className="grid grid-cols-1 gap-4 text-xs sm:grid-cols-2">
                            <InfoItem label="Purpose">
                                <p className="text-xs font-medium text-gray-900 dark:text-dark-text">{getEnclosurePurposeLabel(enclosureInfo.purpose)}</p>
                                {enclosureInfo.purposeDescription && <p className="mt-0.5 text-xs text-gray-500 dark:text-dark-text-muted">{enclosureInfo.purposeDescription}</p>}
                            </InfoItem>
                            <InfoItem label="Environment">
                                <div className="space-y-1">
                                    {(enclosureInfo.tempMin != null || enclosureInfo.tempMax != null) && <div className="flex items-center gap-1.5"><Thermometer size={12} /> {`${enclosureInfo.tempMin ?? '?'}° - ${enclosureInfo.tempMax ?? '?'}°${enclosureInfo.temperatureUnit || 'C'}`}</div>}
                                    {(enclosureInfo.humidityMin != null || enclosureInfo.humidityMax != null) && <div className="flex items-center gap-1.5"><Droplets size={12} /> {`${enclosureInfo.humidityMin ?? '?'}% - ${enclosureInfo.humidityMax ?? '?'}%`}</div>}
                                </div>
                            </InfoItem>
                            <InfoItem label="Lighting">
                                <div className="space-y-1">
                                    {enclosureInfo.lightingType && <div className="flex items-center gap-1.5"><Sun size={12} /> {enclosureInfo.lightingType}</div>}
                                    {enclosureInfo.lightsOnTime && <div className="text-xs text-gray-500 dark:text-dark-text-muted">Schedule: {enclosureInfo.lightsOnTime} - {enclosureInfo.lightsOffTime}</div>}
                                </div>
                            </InfoItem>
                            <InfoItem label="Substrate & Enrichment">
                                <div className="space-y-1">
                                    {enclosureInfo.bedding && <div className="flex items-center gap-1.5"><Package size={12} /> {enclosureInfo.bedding}</div>}
                                    {enclosureInfo.enrichment && <div className="flex items-center gap-1.5"><Sparkles size={12} /> {enclosureInfo.enrichment}</div>}
                                </div>
                            </InfoItem>
                        </div>
                        {detailsShared
                            ? <p className="mt-3 text-xs font-medium text-primary">Click to view all details and tasks</p>
                            : <p className="mt-3 text-xs text-gray-400 dark:text-dark-text-muted">Additional enclosure details and tasks are not shared publicly.</p>}
                    </div>
                </div>
            </CardContainer>
            {detailsShared && isModalOpen && <EnclosureDetailsModal enclosureInfo={enclosureInfo} onClose={() => setIsModalOpen(false)} />}
        </>
    );
};
