import React, { useState } from 'react';
import { Palette, Dna, Sprout, Ruler, Plus, Trash2 } from 'lucide-react';
import { InfoCard, InfoItem } from './DashboardComponents';
import { formatDate } from '../../utils/dateFormatter';
import axios from 'axios';

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

export const AppearanceTabContent = ({ animal, onUpdateAnimal, authToken, API_BASE_URL }) => {
    const [newRecord, setNewRecord] = useState({ date: new Date().toISOString().slice(0, 10), weight: '', length: '', height: '', bcs: '', notes: '' });
    
    const growthRecords = parseJsonArrayField(animal.growthRecords);
    const tags = parseJsonArrayField(animal.tags);

    const handleSaveGrowthRecord = async () => {
        if (!newRecord.date || !newRecord.weight) {
            alert('Please enter at least a date and weight.');
            return;
        }
        const updatedRecords = [...growthRecords, newRecord].sort((a, b) => new Date(b.date) - new Date(a.date));
        
        try {
            onUpdateAnimal({ ...animal, growthRecords: updatedRecords });
            setNewRecord({ date: new Date().toISOString().slice(0, 10), weight: '', length: '', height: '', bcs: '', notes: '' });
            await axios.put(`${API_BASE_URL}/animals/${animal.id_public}`, { growthRecords: updatedRecords }, { headers: { Authorization: `Bearer ${authToken}` } });
        } catch (error) {
            onUpdateAnimal({ ...animal, growthRecords }); 
            alert('Failed to save measurement. Please try again.');
        }
    };

    const handleDeleteRecord = async (index) => {
        const updatedRecords = growthRecords.filter((_, i) => i !== index);
        try {
            onUpdateAnimal({ ...animal, growthRecords: updatedRecords });
            await axios.put(`${API_BASE_URL}/animals/${animal.id_public}`, { growthRecords: updatedRecords }, { headers: { Authorization: `Bearer ${authToken}` } });
        } catch (error) {
            onUpdateAnimal({ ...animal, growthRecords });
            alert('Failed to delete measurement. Please try again.');
        }
    };

    return (
        <div className="space-y-6">
                {/* Classification */}
                {(animal.breed || animal.strain || animal.origin) && (
                    <InfoCard title="Classification" icon={<Palette size={18} />}>
                        <dl className="space-y-4">
                            {animal.breed && <InfoItem label="Breed" value={animal.breed} />}
                            {animal.strain && <InfoItem label="Strain" value={animal.strain} />}
                            {animal.origin && <InfoItem label="Origin" value={animal.origin} />}
                        </dl>
                    </InfoCard>
                )}
                {/* Tags */}
                {tags.length > 0 && (
                    <InfoCard title="Tags" icon={<Palette size={18} />}>
                        <div className="flex flex-wrap gap-2">
                            {tags.map((tag, idx) => (
                                <span key={idx} className="px-3 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">
                                    {typeof tag === 'string' ? tag : tag.name}
                                </span>
                            ))}
                        </div>
                    </InfoCard>
                )}
                <InfoCard title="Appearance" icon={<Palette size={18} />}>
                    <dl className="space-y-4">
                        {animal.color && <InfoItem label="Color" value={animal.color} />}
                        {animal.coatPattern && <InfoItem label="Pattern" value={animal.coatPattern} />}
                        {animal.coat && <InfoItem label="Coat" value={animal.coat} />}
                        {animal.markings && <InfoItem label="Markings" value={animal.markings} />}
                        {animal.eyeColor && <InfoItem label="Eye Color" value={animal.eyeColor} />}
                        {animal.nailColor && <InfoItem label="Nail Color" value={animal.nailColor} />}
                        {animal.size && <InfoItem label="Size" value={animal.size} />}
                        {animal.carrierTraits && <InfoItem label="Carries" value={animal.carrierTraits} />}
                    </dl>
                </InfoCard>
                {/* Phenotype & Morph */}
                {(animal.phenotype || animal.morph || animal.earset) && (
                    <InfoCard title="Phenotype & Genetics" icon={<Dna size={18} className="text-gray-400" />}>
                        <dl className="space-y-4">
                            {animal.phenotype && <InfoItem label="Phenotype" value={animal.phenotype} />}
                            {animal.morph && <InfoItem label="Morph" value={animal.morph} />}
                            {animal.earset && <InfoItem label="Earset" value={animal.earset} />}
                        </dl>
                    </InfoCard>
                )}
                {/* Body Measurements */}
                {(animal.bodyWeight || animal.bodyLength || animal.heightAtWithers || animal.bodyConditionScore || animal.chestGirth || animal.adultWeight) && (
                    <InfoCard title="Body Measurements" icon={<Ruler size={18} className="text-gray-400" />}>
                        <dl className="space-y-4">
                            {animal.bodyWeight && <InfoItem label="Current Weight" value={animal.bodyWeight} />}
                            {animal.bodyLength && <InfoItem label="Body Length" value={animal.bodyLength} />}
                            {animal.heightAtWithers && <InfoItem label="Height at Withers" value={animal.heightAtWithers} />}
                            {animal.bodyConditionScore && <InfoItem label="Body Condition Score" value={animal.bodyConditionScore} />}
                            {animal.chestGirth && <InfoItem label="Chest Girth" value={animal.chestGirth} />}
                            {animal.adultWeight && <InfoItem label="Expected Adult Weight" value={animal.adultWeight} />}
                        </dl>
                    </InfoCard>
                )}
                <InfoCard title="Genetic Code" icon={<Dna size={18} className="text-gray-400" />}>
                    <p className="text-gray-700 font-mono text-sm break-all">{animal.geneticCode || 'Not specified'}</p>
                </InfoCard>
                <InfoCard title="Life Stage" icon={<Sprout size={18} />}>
                    <p>{animal.lifeStage || 'Not specified'}</p>
                </InfoCard>
                <InfoCard title="Add Measurement" icon={<Plus size={18} className="text-gray-400" />}>
                    <div className="space-y-4">
                        <input type="date" value={newRecord.date} onChange={e => setNewRecord({...newRecord, date: e.target.value})} className="w-full p-2 border rounded-md" />
                        <input type="number" placeholder={`Weight (${animal.measurementUnits?.weight || 'g'})`} value={newRecord.weight} onChange={e => setNewRecord({...newRecord, weight: e.target.value})} className="w-full p-2 border rounded-md" />
                        <input type="number" placeholder={`Length (${animal.measurementUnits?.length || 'cm'})`} value={newRecord.length} onChange={e => setNewRecord({...newRecord, length: e.target.value})} className="w-full p-2 border rounded-md" />
                        <textarea placeholder="Notes..." value={newRecord.notes} onChange={e => setNewRecord({...newRecord, notes: e.target.value})} className="w-full p-2 border rounded-md h-24"></textarea>
                        <button onClick={handleSaveGrowthRecord} className="w-full bg-primary text-black font-semibold py-2 rounded-lg">Add Record</button>
                    </div>
                </InfoCard>
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
                                <button onClick={() => handleDeleteRecord(i)} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
                            </div>
                        )) : (
                            <p className="text-sm text-gray-400">No measurements recorded.</p>
                        )}
                    </div>
                </InfoCard>

                {(() => {
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
                    );
                })()}
            </div>
        </div>
    );
};