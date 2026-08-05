import React from 'react';
import { Home, Thermometer, Droplets, Sun, Sparkles, Package } from 'lucide-react';
import { InfoItem } from './DashboardComponents';

const formatDimensions = (dims) => {
    if (dims && (dims.length || dims.width || dims.height)) {
        return `${dims.length || '?'} x ${dims.width || '?'} x ${dims.height || '?'} ${dims.unit || 'in'}`;
    }
    return null;
};

export const EnclosureCard = ({ enclosureInfo }) => {
    if (!enclosureInfo) {
        return null; // Don't render anything if no info
    }

    const dimensions = formatDimensions(enclosureInfo.dimensions);

    return (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-3">
                {/* Image */}
                <div className="md:col-span-1 bg-gray-100 flex items-center justify-center aspect-video md:aspect-auto">
                    {enclosureInfo.imageUrl ? (
                        <img src={enclosureInfo.imageUrl} alt={enclosureInfo.name} className="w-full h-full object-cover" />
                    ) : (
                        <Home size={48} className="text-gray-300" />
                    )}
                </div>

                {/* Details */}
                <div className="md:col-span-2 p-4">
                    <h3 className="text-lg font-bold text-gray-800">{enclosureInfo.name}</h3>
                    <p className="text-sm text-gray-500 mb-3">{enclosureInfo.enclosureType}{dimensions ? ` • ${dimensions}` : ''}</p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        <InfoItem label="Purpose">
                            <p className="text-xs font-medium text-gray-900 capitalize">{enclosureInfo.purpose || 'General'}</p>
                            {enclosureInfo.purposeDescription && <p className="text-xs text-gray-500 mt-0.5">{enclosureInfo.purposeDescription}</p>}
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
                                {enclosureInfo.lightsOnTime && <div className="text-xs text-gray-500">Schedule: {enclosureInfo.lightsOnTime} - {enclosureInfo.lightsOffTime}</div>}
                            </div>
                        </InfoItem>

                        <InfoItem label="Substrate & Enrichment">
                             <div className="space-y-1">
                                {enclosureInfo.bedding && <div className="flex items-center gap-1.5"><Package size={12} /> {enclosureInfo.bedding}</div>}
                                {enclosureInfo.enrichment && <div className="flex items-center gap-1.5"><Sparkles size={12} /> {enclosureInfo.enrichment}</div>}
                            </div>
                        </InfoItem>
                    </div>
                </div>
            </div>
        </div>
    );
};