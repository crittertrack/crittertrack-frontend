import React, { useState } from 'react';
import { X, Search, Info, TrendingUp, Calendar, DollarSign, ChevronRight, Cat, Loader2 } from 'lucide-react';
import axios from 'axios';
import DatePicker from '../DatePicker';

/**
 * TransferOwnershipModal
 * Extracted from BudgetingTab to provide a standalone transfer workflow.
 * Bypasses the "Add Transaction" and "Manual vs Transfer" pickers.
 */
const TransferOwnershipModal = ({
    className = "",
    animal,
    onClose,
    onSubmit,
    authToken,
    API_BASE_URL,
    showModalMessage,
    // Props managed by useTransferWorkflow hook
    transferUserQuery,
    setTransferUserQuery,
    transferUserResults,
    setTransferUserResults,
    transferSelectedUser,
    setTransferSelectedUser,
    transferSearching,
    setTransferSearching,
    transferSearchPerformed,
    setTransferSearchPerformed
}) => {
    const [formData, setFormData] = useState({
        price: '',
        date: new Date().toISOString().split('T')[0],
        notes: ''
    });

    const handleSearchUsers = async () => {
        if (!transferUserQuery || transferUserQuery.trim().length < 2) {
            showModalMessage('Error', 'Please enter at least 2 characters to search');
            return;
        }
        
        setTransferSearching(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/public/profiles/search?query=${encodeURIComponent(transferUserQuery)}`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            
            // Filter for users with at least one visible name
            const filteredUsers = (response.data || []).filter(user => {
                const hasVisibleBreederName = user.breederName && user.showBreederName;
                const hasVisiblePersonalName = user.personalName && user.showPersonalName;
                return hasVisibleBreederName || hasVisiblePersonalName;
            });
            
            setTransferUserResults(filteredUsers);
            setTransferSearchPerformed(true);
        } catch (error) {
            console.error('Error searching users:', error);
            setTransferUserResults([]);
            showModalMessage('Error', 'Failed to search users');
        } finally {
            setTransferSearching(false);
        }
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        
        if (!transferSelectedUser) {
            showModalMessage('Error', 'Please select a buyer');
            return;
        }

        const priceValue = parseFloat(formData.price);
        if (formData.price && (isNaN(priceValue) || priceValue < 0)) {
            showModalMessage('Error', 'Price cannot be negative');
            return;
        }

        // Pass structured data back to the hook handler
        onSubmit({
            ...formData,
            price: formData.price === '' ? 0 : priceValue,
            selectedUser: transferSelectedUser
        });
    };

    return (
        <div className={`fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[120] ${className}`}>
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <TrendingUp className="text-green-600" />
                        Transfer Ownership
                    </h2>
                    <button 
                        type="button"
                        onClick={onClose} 
                        className="text-gray-500 hover:text-gray-700 transition"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Animal Summary Banner */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-6 flex gap-4">
                    <div className="w-16 h-16 bg-white rounded-lg border border-blue-200 overflow-hidden flex-shrink-0">
                        {animal?.imageUrl || animal?.photoUrl ? (
                            <img src={animal.imageUrl || animal.photoUrl} alt={animal.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                                <Cat size={32} />
                            </div>
                        )}
                    </div>
                    <div>
                        <p className="font-bold text-gray-800">
                            {animal?.prefix ? `${animal.prefix} ` : ''}
                            {animal?.name}
                            {animal?.suffix ? ` ${animal.suffix}` : ''}
                        </p>
                        <p className="text-sm text-gray-600">{animal?.species} • {animal?.id_public}</p>
                        <p className="text-xs text-blue-600 mt-1 font-medium flex items-center gap-1">
                            <Info size={12} />
                            Initiating transfer to another user
                        </p>
                    </div>
                </div>

                <form onSubmit={handleFormSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Date of Transfer *
                        </label>
                        <DatePicker
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            maxDate={new Date()}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Sale Price (optional)
                        </label>
                        <div className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                <DollarSign size={16} />
                            </div>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                placeholder="0.00"
                                className="w-full pl-9 p-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Search Buyer (CritterTrack User) *
                        </label>
                        
                        {transferSelectedUser ? (
                            <div className="flex items-center justify-between w-full p-3 border-2 border-green-300 rounded-lg bg-green-50 shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-green-200 flex items-center justify-center text-green-700 font-bold text-sm overflow-hidden border border-green-300">
                                        {transferSelectedUser.profileImage ? (
                                            <img src={transferSelectedUser.profileImage} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            (transferSelectedUser.breederName || transferSelectedUser.personalName || '?').charAt(0).toUpperCase()
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-800">
                                            {transferSelectedUser.breederName || transferSelectedUser.personalName}
                                        </p>
                                        <p className="text-xs text-gray-500 font-mono">{transferSelectedUser.id_public}</p>
                                    </div>
                                </div>
                                <button type="button" onClick={() => setTransferSelectedUser(null)} className="text-gray-400 hover:text-red-500">
                                    <X size={18} />
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={transferUserQuery}
                                        onChange={(e) => setTransferUserQuery(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleSearchUsers())}
                                        placeholder="Search by name or CTU ID..."
                                        className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                                    />
                                    <button type="button" onClick={handleSearchUsers} className="px-4 py-2 bg-primary text-black font-semibold rounded-lg hover:bg-primary/90 flex items-center gap-2">
                                        {transferSearching ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                                        Search
                                    </button>
                                </div>
                                {transferSearchPerformed && transferUserResults.length > 0 && (
                                    <div className="border border-gray-200 rounded-lg overflow-hidden divide-y divide-gray-100 max-h-48 overflow-y-auto bg-white">
                                        {transferUserResults.map(user => (
                                            <button key={user.id_public} type="button" onClick={() => setTransferSelectedUser(user)} className="w-full text-left px-4 py-3 hover:bg-blue-50 transition flex items-center justify-between group">
                                                <span className="text-sm font-semibold">{user.breederName || user.personalName} ({user.id_public})</span>
                                                <ChevronRight size={16} className="text-gray-300 group-hover:text-blue-400" />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button type="submit" disabled={!transferSelectedUser} className="flex-1 bg-primary hover:bg-primary/90 text-black font-bold py-2.5 px-4 rounded-lg transition disabled:opacity-50 shadow-md">
                            Complete Transfer
                        </button>
                        <button type="button" onClick={onClose} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2.5 px-4 rounded-lg transition border border-gray-300">
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TransferOwnershipModal;