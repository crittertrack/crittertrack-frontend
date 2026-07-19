import React from 'react';
import { Palette, Dna, Sprout, Ruler } from 'lucide-react';
import { InfoCard, InfoItem } from './DashboardComponents';
import { formatDate } from '../../utils/dateFormatter';

const parseJsonArrayField = (data) => {
    if (!data) return [];
    if (typeof data === 'string') {
        try {
            const parsed = JSON.parse(data);
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            return [];
        }
    }
    return Array.isArray(data) ? data : [];
};

export const AppearanceTabContent = ({ animal }) => {
    return (
        <div className="space-y-6">
                <InfoCard title="Appearance" icon={<Palette size={18} />}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {animal.color && <InfoItem label="Color" value={animal.color} />}
                        {animal.coatPattern && <InfoItem label="Pattern" value={animal.coatPattern} />}
                        {animal.coat && <InfoItem label="Coat" value={animal.coat} />}
                        {animal.earset && <InfoItem label="Earset" value={animal.earset} />}
                        {animal.phenotype && <InfoItem label="Phenotype" value={animal.phenotype} />}
                        {animal.morph && <InfoItem label="Morph" value={animal.morph} />}
                        {animal.markings && <InfoItem label="Markings" value={animal.markings} />}
                        {animal.eyeColor && <InfoItem label="Eye Color" value={animal.eyeColor} />}
                        {animal.nailColor && <InfoItem label="Nail Color" value={animal.nailColor} />}
                        {animal.size && <InfoItem label="Size" value={animal.size} />}
                        {animal.carrierTraits && <InfoItem label="Carries" value={animal.carrierTraits} />}
                    </div>
                </InfoCard>
                <InfoCard title="Genetic Code" icon={<Dna size={18} className="text-gray-400" />}>
                    <p className="text-gray-700 font-mono text-sm break-all">{animal.geneticCode || 'Not specified'}</p>
                </InfoCard>
                <InfoCard title="Life Stage" icon={<Sprout size={18} />}>
                    <p>{animal.lifeStage || 'Not specified'}</p>
                </InfoCard>
                {(() => {
                    const growthRecords = parseJsonArrayField(animal.growthRecords);
                    const sorted = [...growthRecords].sort((a, b) => new Date(a.date) - new Date(b.date));
                    const weights = sorted.map(r => parseFloat(r.weight) || 0).filter(w => w > 0);
                    if (weights.length < 1) return null;

                    const width = 500;
                    const height = 250;
                    const margin = { top: 20, right: 30, bottom: 50, left: 70 };
                    const graphWidth = width - margin.left - margin.right;
                    const graphHeight = height - margin.top - margin.bottom;

                    const minWeight = Math.min(...weights);
                    const maxWeight = Math.max(...weights);
                    const weightPadding = (maxWeight - minWeight) * 0.1 || 5;
                    const weightChartMin = Math.max(0, minWeight - weightPadding);
                    const weightChartMax = maxWeight + weightPadding;
                    const weightRange = weightChartMax - weightChartMin;

                    const weightPoints = sorted.map((record, idx) => ({
                        x: margin.left + (idx / Math.max(1, sorted.length - 1)) * graphWidth,
                        y: margin.top + graphHeight - ((parseFloat(record.weight) - weightChartMin) / weightRange) * graphHeight,
                        ...record
                    }));

                    const weightPathData = weightPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

                    return (
                        <>
                            <InfoCard title="Measurement History" icon={<Ruler size={18} className="text-gray-400" />}>
                                <div className="space-y-2 max-h-64 overflow-y-auto">
                                    {growthRecords.length > 0 ? growthRecords.map((rec, i) => (
                                        <div key={i} className="flex justify-between items-center p-2 bg-gray-50 rounded-md">
                                            <div>
                                                <p className="font-semibold">{formatDate(rec.date)}</p>
                                                <p className="text-sm text-gray-600">
                                                    {rec.weight && `${rec.weight}${animal.measurementUnits?.weight || 'g'}`}
                                                    {rec.length && `, ${rec.length}${animal.measurementUnits?.length || 'cm'}`}
                                                </p>
                                            </div>
                                        </div>
                                    )) : (
                                        <p className="text-sm text-gray-400">No measurements recorded.</p>
                                    )}
                                </div>
                            </InfoCard>
                            <InfoCard title="Weight Growth Curve" icon={<Ruler size={18} className="text-gray-400" />}>
                                <svg width="100%" height="300" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet">
                                    {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                                        const y = margin.top + graphHeight * (1 - ratio);
                                        const axisLabel = (weightChartMin + weightRange * ratio).toFixed(1);
                                        return (
                                            <g key={`grid-${i}`}>
                                                <line x1={margin.left} y1={y} x2={width - margin.right} y2={y} stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4" />
                                                <text x={margin.left - 12} y={y} textAnchor="end" dy="0.3em" fontSize="11" fill="#666">{axisLabel}</text>
                                            </g>
                                        );
                                    })}
                                    <line x1={margin.left} y1={height - margin.bottom} x2={width - margin.right} y2={height - margin.bottom} stroke="#333" strokeWidth="2" />
                                    <text x={margin.left + graphWidth / 2} y={height - 8} textAnchor="middle" fontSize="12" fill="#333" fontWeight="600">Date</text>
                                    {weightPoints.map((p, i) => (
                                        i % Math.max(1, Math.floor(weightPoints.length / 5)) === 0 && (
                                            <text key={`date-${i}`} x={p.x} y={height - margin.bottom + 25} textAnchor="middle" fontSize="10" fill="#666">
                                                {formatDate(p.date)}
                                            </text>
                                        )
                                    ))}
                                    <path d={weightPathData} fill="none" stroke="#3b82f6" strokeWidth="2" />
                                    {weightPoints.map((p, i) => (
                                        <circle key={`point-${i}`} cx={p.x} cy={p.y} r="5" fill="#3b82f6" stroke="#fff" strokeWidth="2">
                                            <title>{`Date: ${formatDate(p.date)}\nWeight: ${p.weight} ${animal.measurementUnits?.weight || 'g'}`}</title>
                                        </circle>
                                    ))}
                                </svg>
                            </InfoCard>
                        </>
                    );
                })()}
            </div>
    );
};