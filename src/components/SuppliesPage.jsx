import React, { useState, useEffect, useCallback } from 'react';
import { Package, Plus, Edit, Trash2, Search, X, Calendar, Filter, Download, TrendingUp, TrendingDown, Info, Loader2, Save, ShoppingBag, RefreshCw, AlertTriangle, Check, ChevronDown, ChevronUp } from 'lucide-react';
import axios from 'axios';
import DatePicker from './DatePicker';

const SuppliesPage = ({ authToken, API_BASE_URL, showModalMessage }) => {
    const [supplies, setSupplies] = useState([]);
    const [suppliesLoading, setSuppliesLoading] = useState(true);
    const [supplyForm, setSupplyForm] = useState({ name: '', category: 'Other', currentStock: '', unit: '', reorderThreshold: '', notes: '', isFeederAnimal: false, feederType: '', feederSize: '', costPerUnit: '', nextOrderDate: '', orderFrequency: '', orderFrequencyUnit: 'months' });
    const [supplyFormVisible, setSupplyFormVisible] = useState(false);
    const [editingSupplyId, setEditingSupplyId] = useState(null);
    const [supplySaving, setSupplySaving] = useState(false);
    const [supplyCategoryFilter, setSupplyCategoryFilter] = useState('All');
    const [restockingSupplyId, setRestockingSupplyId] = useState(null);
    const [restockForm, setRestockForm] = useState({ qty: '', cost: '', date: new Date().toISOString().slice(0, 10), notes: '' });
    const [restockSaving, setRestockSaving] = useState(false);

    const fetchSupplies = useCallback(async () => {
        if (!authToken) return;
        setSuppliesLoading(true);
        try {
            const res = await axios.get(`${API_BASE_URL}/supplies`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            setSupplies(res.data || []);
        } catch (err) { console.error('[fetchSupplies]', err); }
        setSuppliesLoading(false);
    }, [authToken, API_BASE_URL]);

    useEffect(() => { fetchSupplies(); }, [fetchSupplies]);

    const CATEGORIES = ['Food', 'Bedding', 'Medication', 'Other'];
    const CATEGORY_COLORS = {
        Food: 'bg-green-100 text-green-700',
        Bedding: 'bg-yellow-100 text-yellow-700',
        Medication: 'bg-red-100 text-red-700',
        Other: 'bg-gray-100 text-gray-600',
    };
    const BUDGET_CATEGORY_MAP = { Food: 'food', Bedding: 'housing', Medication: 'medical', Other: 'other' };
    const isLow = (item) => item.reorderThreshold != null && item.currentStock <= item.reorderThreshold;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const isOverdue = (item) => item.nextOrderDate && new Date(item.nextOrderDate) < today;
    const isDueSoon = (item) => { if (!item.nextOrderDate) return false; const d = new Date(item.nextOrderDate); const diff = (d - today) / (1000 * 60 * 60 * 24); return diff >= 0 && diff <= 14; };
    const needsAttention = (item) => isLow(item) || isOverdue(item);
    const filtered = supplyCategoryFilter === 'All' ? supplies : supplies.filter(s => s.category === supplyCategoryFilter);
    const lowStockItems = supplies.filter(isLow);
    const overdueItems = supplies.filter(isOverdue);
    const attentionItems = supplies.filter(needsAttention);

    const handleSupplySubmit = async () => {
        if (!supplyForm.name.trim()) return;
        setSupplySaving(true);
        try {
            if (editingSupplyId) {
                const res = await axios.patch(`${API_BASE_URL}/supplies/${editingSupplyId}`, supplyForm, { headers: { Authorization: `Bearer ${authToken}` } });
                setSupplies(prev => prev.map(s => s._id === editingSupplyId ? res.data : s));
            } else {
                const res = await axios.post(`${API_BASE_URL}/supplies`, supplyForm, { headers: { Authorization: `Bearer ${authToken}` } });
                setSupplies(prev => [...prev, res.data]);
            }
            setSupplyForm({ name: '', category: 'Other', currentStock: '', unit: '', reorderThreshold: '', notes: '', isFeederAnimal: false, feederType: '', feederSize: '', costPerUnit: '', nextOrderDate: '', orderFrequency: '', orderFrequencyUnit: 'months' });
            setSupplyFormVisible(false);
            setEditingSupplyId(null);
        } catch (err) { console.error(err); }
        setSupplySaving(false);
    };

    const handleSupplyDelete = async (id) => {
        if (!window.confirm('Delete this supply item?')) return;
        try {
            await axios.delete(`${API_BASE_URL}/supplies/${id}`, { headers: { Authorization: `Bearer ${authToken}` } });
            setSupplies(prev => prev.filter(s => s._id !== id));
        } catch (err) { console.error(err); }
    };

    const handleSupplyEdit = (item) => {
        setSupplyForm({
            name: item.name,
            category: item.category,
            currentStock: item.currentStock ?? '',
            unit: item.unit || '',
            reorderThreshold: item.reorderThreshold ?? '',
            notes: item.notes || '',
            isFeederAnimal: item.isFeederAnimal || false,
            feederType: item.feederType || '',
            feederSize: item.feederSize || '',
            costPerUnit: item.costPerUnit ?? '',
            nextOrderDate: item.nextOrderDate ? new Date(item.nextOrderDate).toISOString().split('T')[0] : '',
            orderFrequency: item.orderFrequency ?? '',
            orderFrequencyUnit: item.orderFrequencyUnit || 'months',
        });
        setEditingSupplyId(item._id);
        setSupplyFormVisible(true);
    };

    const openRestock = (item) => {
        setRestockingSupplyId(item._id);
        const suggestCost = item.isFeederAnimal && item.costPerUnit ? '' : '';
        setRestockForm({ qty: '', cost: suggestCost, date: new Date().toISOString().slice(0, 10), notes: '' });
        setSupplyFormVisible(false);
        setEditingSupplyId(null);
    };

    const handleRestockSubmit = async (item) => {
        const qty = parseFloat(restockForm.qty);
        const cost = parseFloat(restockForm.cost);
        if (!qty || qty <= 0 || !restockForm.cost || cost < 0) return;
        setRestockSaving(true);
        try {
            const newStock = (item.currentStock || 0) + qty;
            const stockPatch = { currentStock: newStock };
            if (item.orderFrequency && item.orderFrequencyUnit) {
                const base = new Date();
                if (item.orderFrequencyUnit === 'days') base.setDate(base.getDate() + Number(item.orderFrequency));
                else if (item.orderFrequencyUnit === 'weeks') base.setDate(base.getDate() + Number(item.orderFrequency) * 7);
                else if (item.orderFrequencyUnit === 'months') base.setMonth(base.getMonth() + Number(item.orderFrequency));
                stockPatch.nextOrderDate = base.toISOString().split('T')[0];
            }
            const supplyRes = await axios.patch(
                `${API_BASE_URL}/supplies/${item._id}`,
                stockPatch,
                { headers: { Authorization: `Bearer ${authToken}` } }
            );
            setSupplies(prev => prev.map(s => s._id === item._id ? supplyRes.data : s));

            const feederLabel = item.isFeederAnimal && (item.feederType || item.feederSize)
                ? ` · ${[item.feederType, item.feederSize].filter(Boolean).join(' ')}`
                : '';
            await axios.post(
                `${API_BASE_URL}/budget/transactions`,
                {
                    type: 'expense',
                    price: cost,
                    date: restockForm.date || new Date().toISOString().slice(0, 10),
                    category: BUDGET_CATEGORY_MAP[item.category] || 'other',
                    description: `Supplies restock: ${item.name}${feederLabel} (${qty}${item.unit ? ' ' + item.unit : ''})`,
                    notes: restockForm.notes || null,
                },
                { headers: { Authorization: `Bearer ${authToken}` } }
            );
            setRestockingSupplyId(null);
        } catch (err) { console.error(err); }
        setRestockSaving(false);
    };

    return (
        <div className="w-full max-w-7xl mx-auto p-2 sm:p-4">
            <div className="mt-4 space-y-4">
                <div className="flex items-center justify-end">
                    <button onClick={fetchSupplies} disabled={suppliesLoading}
                        className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition disabled:opacity-50">
                        <RefreshCw size={12} /> Refresh
                    </button>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Package size={18} className="text-emerald-600" />
                        <h3 className="text-lg font-semibold text-gray-800">Supplies &amp; Inventory</h3>
                        <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">{supplies.length} item{supplies.length !== 1 ? 's' : ''}</span>
                    </div>
                    <button
                        onClick={() => { setSupplyForm({ name: '', category: 'Other', currentStock: '', unit: '', reorderThreshold: '', notes: '', isFeederAnimal: false, feederType: '', feederSize: '', costPerUnit: '', nextOrderDate: '', orderFrequency: '', orderFrequencyUnit: 'months' }); setEditingSupplyId(null); setSupplyFormVisible(v => !v); }}
                        className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm rounded-lg font-medium transition"
                    >
                        <Plus size={14} /> Add Item
                    </button>
                </div>

                {attentionItems.length > 0 && (
                    <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3">
                        <AlertTriangle size={16} className="text-amber-500 mt-0.5 shrink-0" />
                        <div className="text-sm text-amber-700 space-y-0.5">
                            {lowStockItems.length > 0 && <div><span className="font-semibold">Low stock:</span> {lowStockItems.map(i => i.name).join(', ')}</div>}
                            {overdueItems.length > 0 && <div><span className="font-semibold">Order overdue:</span> {overdueItems.map(i => i.name).join(', ')}</div>}
                        </div>
                    </div>
                )}

                {supplyFormVisible && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-3">
                        <h4 className="text-sm font-semibold text-emerald-800">{editingSupplyId ? 'Edit Item' : 'New Supply Item'}</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs font-medium text-gray-600 mb-1 block">Name *</label>
                                <input type="text" value={supplyForm.name} onChange={e => setSupplyForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Rat blocks" className="w-full text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-400 focus:border-emerald-400" />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-600 mb-1 block">Category</label>
                                <select value={supplyForm.category} onChange={e => setSupplyForm(f => ({ ...f, category: e.target.value, isFeederAnimal: e.target.value === 'Food' ? f.isFeederAnimal : false }))} className="w-full text-sm border border-gray-300 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-400 focus:border-emerald-400">
                                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-600 mb-1 block">Current Stock</label>
                                <input type="number" min="0" value={supplyForm.currentStock} onChange={e => setSupplyForm(f => ({ ...f, currentStock: e.target.value }))} placeholder="0" className="w-full text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-400 focus:border-emerald-400" />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-600 mb-1 block">Unit (e.g. bags, kg, boxes)</label>
                                <input type="text" value={supplyForm.unit} onChange={e => setSupplyForm(f => ({ ...f, unit: e.target.value }))} placeholder="bags" className="w-full text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-400 focus:border-emerald-400" />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-600 mb-1 block">Cost per unit</label>
                                <input type="number" min="0" step="0.01" value={supplyForm.costPerUnit} onChange={e => setSupplyForm(f => ({ ...f, costPerUnit: e.target.value }))} placeholder="0.00" className="w-full text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-400 focus:border-emerald-400" />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-600 mb-1 block">Reorder when stock reaches</label>
                                <input type="number" min="0" value={supplyForm.reorderThreshold} onChange={e => setSupplyForm(f => ({ ...f, reorderThreshold: e.target.value }))} placeholder="e.g. 2" className="w-full text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-400 focus:border-emerald-400" />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-600 mb-1 block">Notes</label>
                                    <input type="text" value={supplyForm.notes} onChange={e => setSupplyForm(f => ({ ...f, notes: e.target.value }))} placeholder="Notes" className="w-full text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-400 focus:border-emerald-400" />
                            </div>
                        </div>
                        <div className="border-t border-emerald-200 pt-3 space-y-2">
                            <p className="text-xs font-semibold text-gray-600">Reorder Schedule <span className="font-normal text-gray-400">(optional ? for bulk or timed items)</span></p>
                            <p className="text-[11px] text-gray-400">Set a date &amp; repeat frequency for items ordered on a schedule, regardless of stock count ? e.g. a 650 L bedding pallet every 3 months.</p>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div>
                                    <label className="text-xs font-medium text-gray-600 mb-1 block">Next order date</label>
                                    <input type="date" value={supplyForm.nextOrderDate} onChange={e => setSupplyForm(f => ({ ...f, nextOrderDate: e.target.value }))} className="w-full text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-400" />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-600 mb-1 block">Repeat every</label>
                                    <input type="number" min="1" value={supplyForm.orderFrequency} onChange={e => setSupplyForm(f => ({ ...f, orderFrequency: e.target.value }))} placeholder="e.g. 3" className="w-full text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-400" />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-600 mb-1 block">Frequency unit</label>
                                    <select value={supplyForm.orderFrequencyUnit} onChange={e => setSupplyForm(f => ({ ...f, orderFrequencyUnit: e.target.value }))} className="w-full text-sm border border-gray-300 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-400">
                                        <option value="days">Days</option>
                                        <option value="weeks">Weeks</option>
                                        <option value="months">Months</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        {supplyForm.category === 'Food' && (
                            <div className="col-span-2">
                                <label className="flex items-center gap-2 cursor-pointer select-none">
                                    <input type="checkbox" checked={supplyForm.isFeederAnimal} onChange={e => setSupplyForm(f => ({ ...f, isFeederAnimal: e.target.checked }))} className="w-4 h-4 accent-emerald-600" />
                                    <span className="text-sm font-medium text-gray-700">This is a feeder animal (mice, rats, crickets, etc.)</span>
                                </label>
                            </div>
                        )}
                        {supplyForm.category === 'Food' && supplyForm.isFeederAnimal && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-green-50 border border-green-200 rounded-lg p-3">
                                <div>
                                    <label className="text-xs font-medium text-gray-600 mb-1 block">Feeder Type</label>
                                    <input type="text" value={supplyForm.feederType} onChange={e => setSupplyForm(f => ({ ...f, feederType: e.target.value }))} list="feeder-type-list" placeholder="e.g. Mice, Rats" className="w-full text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-400" />
                                    <datalist id="feeder-type-list"><option value="Mice" /><option value="Rats" /><option value="Gerbils" /><option value="Crickets" /><option value="Dubia Roaches" /><option value="Mealworms" /><option value="Superworms" /><option value="Waxworms" /><option value="Hornworms" /><option value="Fish" /></datalist>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-600 mb-1 block">Size</label>
                                    <input type="text" value={supplyForm.feederSize} onChange={e => setSupplyForm(f => ({ ...f, feederSize: e.target.value }))} list="feeder-size-list" placeholder="e.g. Pinky, Adult" className="w-full text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-400" />
                                    <datalist id="feeder-size-list"><option value="Pinky" /><option value="Fuzzy" /><option value="Hopper" /><option value="Weaned" /><option value="Adult" /><option value="Small" /><option value="Medium" /><option value="Large" /><option value="XL" /></datalist>
                                </div>
                            </div>
                        )}
                        <div className="flex gap-2 justify-end pt-1">
                            <button onClick={() => { setSupplyFormVisible(false); setEditingSupplyId(null); }} className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition">Cancel</button>
                            <button onClick={handleSupplySubmit} disabled={supplySaving || !supplyForm.name.trim()} className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm rounded-lg font-medium transition disabled:opacity-50 flex items-center gap-1.5">
                                {supplySaving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                                {editingSupplyId ? 'Save Changes' : 'Add Item'}
                            </button>
                        </div>
                    </div>
                )}

                <div className="flex gap-1.5 flex-wrap">
                    {['All', ...CATEGORIES].map(cat => (
                        <button key={cat} onClick={() => setSupplyCategoryFilter(cat)}
                            className={`px-3 py-1 text-xs rounded-full font-medium transition ${supplyCategoryFilter === cat ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        >{cat}</button>
                    ))}
                </div>

                {suppliesLoading ? (
                    <div className="flex items-center justify-center py-12 text-gray-400 gap-2"><Loader2 size={20} className="animate-spin" /> Loading...</div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-12 text-gray-400 text-sm">
                        {supplies.length === 0 ? 'No supplies added yet. Click "Add Item" to get started.' : `No ${supplyCategoryFilter} items.`}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {filtered.map(item => (
                            <div key={item._id} className={`border rounded-xl p-3 bg-white flex flex-col gap-1.5 shadow-sm ${isLow(item) ? 'border-amber-300' : 'border-gray-200'}`}>
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                                        <span className="font-semibold text-sm text-gray-800 truncate">{item.name}</span>
                                        {isLow(item) && <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-medium shrink-0">Low Stock</span>}
                                        {isOverdue(item) && <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full font-medium shrink-0">Order Due</span>}
                                        {!isOverdue(item) && isDueSoon(item) && <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-medium shrink-0">Order Soon</span>}
                                    </div>
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${CATEGORY_COLORS[item.category] || CATEGORY_COLORS.Other}`}>{item.category}</span>
                                </div>
                                <div className="flex items-baseline gap-2">
                                    <span className={`text-lg font-bold ${isLow(item) ? 'text-amber-600' : 'text-gray-800'}`}>{item.currentStock}</span>
                                    {item.unit && <span className="text-gray-500 text-xs">{item.unit}</span>}
                                    {item.reorderThreshold != null && <span className="text-gray-400 text-xs ml-auto">Reorder at {item.reorderThreshold}</span>}
                                </div>
                                {item.notes && <p className="text-xs text-gray-400 truncate">{item.notes}</p>}
                                {(item.isFeederAnimal || item.costPerUnit != null) && (
                                    <div className="flex flex-wrap gap-1.5 mt-0.5">
                                        {item.isFeederAnimal && item.feederType && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{item.feederType}</span>}
                                        {item.isFeederAnimal && item.feederSize && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{item.feederSize}</span>}
                                        {item.costPerUnit != null && <span className="text-xs text-gray-400">${Number(item.costPerUnit).toFixed(2)} / {item.unit || 'unit'}</span>}
                                    </div>
                                )}
                                {item.nextOrderDate && (
                                    <div className={`flex items-center gap-1.5 text-xs rounded-lg px-2 py-1.5 mt-0.5 ${isOverdue(item) ? 'bg-red-50 text-red-600' : isDueSoon(item) ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-500'}`}>
                                        <Calendar size={11} className="shrink-0" />
                                        <span>Next order: {new Date(item.nextOrderDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                        {item.orderFrequency && <span className="opacity-60"> <RefreshCw size={12} className="inline-block align-middle mr-0.5" /> every {item.orderFrequency} {item.orderFrequencyUnit}</span>}
                                    </div>
                                )}

                                {restockingSupplyId === item._id && (
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-2.5 mt-1 space-y-2">
                                        <p className="text-xs font-semibold text-blue-700">Restock · logs an expense in Budget{item.isFeederAnimal ? ` · ${[item.feederType, item.feederSize].filter(Boolean).join(' ')}` : ''}</p>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <label className="text-[10px] font-medium text-gray-500 block mb-0.5">Qty received *</label>
                                                <input type="number" min="0.01" step="any" value={restockForm.qty} onChange={e => {
                                                    const q = e.target.value;
                                                    const autoCost = item.costPerUnit && q ? (parseFloat(q) * item.costPerUnit).toFixed(2) : restockForm.cost;
                                                    setRestockForm(f => ({ ...f, qty: q, cost: autoCost }));
                                                }} placeholder="e.g. 5" className="w-full text-sm border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400" />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-medium text-gray-500 block mb-0.5">Cost paid *</label>
                                                <input type="number" min="0" step="0.01" value={restockForm.cost} onChange={e => setRestockForm(f => ({ ...f, cost: e.target.value }))} placeholder="0.00" className="w-full text-sm border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400" />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-medium text-gray-500 block mb-0.5">Date</label>
                                                <input type="date" value={restockForm.date} onChange={e => setRestockForm(f => ({ ...f, date: e.target.value }))} className="w-full text-sm border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400" />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-medium text-gray-500 block mb-0.5">Notes</label>
                                                <input type="text" value={restockForm.notes} onChange={e => setRestockForm(f => ({ ...f, notes: e.target.value }))} placeholder="Notes" className="w-full text-sm border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400" />
                                            </div>
                                        </div>
                                        <div className="flex gap-2 justify-end">
                                            <button onClick={() => setRestockingSupplyId(null)} className="px-2.5 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded-lg transition">Cancel</button>
                                            <button
                                                onClick={() => handleRestockSubmit(item)}
                                                disabled={restockSaving || !restockForm.qty || !restockForm.cost}
                                                className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg font-medium transition disabled:opacity-50 flex items-center gap-1"
                                            >
                                                {restockSaving ? <Loader2 size={11} className="animate-spin" /> : <ShoppingBag size={11} />}
                                                Log Restock
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <div className="flex gap-2 justify-end mt-0.5">
                                    <button onClick={() => openRestock(item)} className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2 py-1 rounded-lg transition font-medium"><ShoppingBag size={11} /> Restock</button>
                                    <button onClick={() => handleSupplyEdit(item)} className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 px-2 py-1 rounded-lg transition"><Edit size={11} /> Edit</button>
                                    <button onClick={() => handleSupplyDelete(item._id)} className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded-lg transition"><Trash2 size={11} /> Delete</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SuppliesPage;