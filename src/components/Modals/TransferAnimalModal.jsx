import React from 'react';
import { X, Search, Loader2, Info, ArrowLeftRight } from 'lucide-react';

const TransferAnimalModal = ({
    animal,
    onClose,
    userQuery,
    setUserQuery,
    userResults,
    onSearchUsers,
    searching,
    searchPerformed,
    selectedUser,
    onSelectUser,
    price,
    setPrice,
    notes,
    setNotes,
    onSubmit,
    showModalMessage,
    // API_BASE_URL, // Not directly used in this component, can be removed if not needed elsewhere
    // authToken // Not directly used in this component, can be removed if not needed elsewhere
}) => {
    const handleUserSelect = (user) => {
        onSelectUser(user);
        setUserQuery(user.breederName || user.personalName || user.id_public); // Display selected user's name
    };

    const getDisplayName = (user) => {
        const parts = [];
        if (user.breederName) parts.push(user.breederName); // Always show breederName if present, regardless of showBreederName flag for internal selection
        if (user.personalName && user.showPersonalName) parts.push(user.personalName);
        return parts.join(' / ') || String(user.id_public || '') || 'Unknown User';
    };

    if (!animal) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[150] p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <ArrowLeftRight size={20} /> Transfer Ownership
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X size={24} />
                    </button>
                </div>

                {/* Animal Info */}
                <div className="p-4 bg-gray-50 border-b">
                    <div className="flex items-center gap-3">
                        {(animal.imageUrl || animal.photoUrl) ? (
                            <img
                                src={animal.imageUrl || animal.photoUrl}
                                alt={animal.name}
                                className="w-16 h-16 rounded-lg object-cover" // animal.name is used here, but alt={undefined} is safe.
                            />
                        ) : (
                            <div className="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center">
                                <ArrowLeftRight className="text-gray-400" size={24} />
                            </div>
                        )}
                        <div>
                            <h3 className="font-semibold text-gray-800">{String(animal.name || '')}</h3>
                            <p className="text-sm text-gray-600">{String(animal.species || '')} • {String(animal.id_public || '')}</p>
                        </div>
                    </div>
                </div>

                {/* Form Content */}
                <div className="p-4 space-y-4">
                    {/* User Search */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Recipient (CritterTrack User) *
                        </label>
                        <div className="relative">
                            {selectedUser ? (
                                <div className="flex items-center justify-between w-full p-2 border border-gray-300 rounded-lg bg-gray-50">
                                    <span className="text-gray-700">{getDisplayName(selectedUser)}</span>
                                    <button
                                        type="button"
                                        onClick={() => onSelectUser(null)}
                                        className="text-gray-500 hover:text-red-500"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={userQuery}
                                            onChange={(e) => setUserQuery(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    onSearchUsers();
                                                }
                                            }}
                                            placeholder="Search by name or ID (min 2 chars)..."
                                            className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                                        />
                                        <button
                                            type="button"
                                             onClick={onSearchUsers} // The error occurs here if userQuery is undefined
                                            disabled={searching || (userQuery || '').trim().length < 2}
                                            className="px-4 py-2 bg-primary text-black rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                        >
                                            <Search className="w-4 h-4" />
                                            {searching ? 'Searching...' : 'Search'}
                                        </button>
                                    </div>
                                    {userQuery.length >= 2 && userResults.length > 0 && (
                                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                            {userResults.map(user => (
                                                <button
                                                    key={user.id_public}
                                                    type="button"
                                                    onClick={() => handleUserSelect(user)}
                                                    className="w-full text-left px-4 py-2 hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
                                                >
                                                    <div className="font-medium">{user.id_public}</div>
                                                    <div className="text-sm text-gray-600">{String(getDisplayName(user))}</div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                    {userQuery.length >= 2 && userResults.length === 0 && searchPerformed && !searching && (
                                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4 text-center text-gray-500">
                                            No users found
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                    {/* Price */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Sale Price (optional)
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            placeholder="0.00"
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                        />
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Notes (optional)
                        </label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Add any notes for the recipient..."
                            rows={3}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                        />
                    </div>

                    {/* Info message */}
                    <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-start gap-2">
                            <Info className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <div className="text-xs text-green-800">
                                <p className="font-semibold mb-1">🔄 Transfer Ownership</p>
                                <p>
                                    The recipient will receive a transfer request. Ownership will remain unchanged until they accept the request. Once accepted, you will retain view-only access and they will become the owner.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Buttons */}
                <div className="p-4 border-t flex gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg transition"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            if (animal && selectedUser) {
                                const transferType = parseFloat(price) > 0 ? 'sale' : 'gift';
                                onSubmit({
                                    animal: animal,
                                    recipient: selectedUser,
                                    price: price,
                                    notes: notes,
                                    transferType: transferType,
                                });
                            }
                        }}
                        disabled={!selectedUser}
                        className="flex-1 bg-primary hover:bg-primary/90 text-black font-semibold py-2 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Send Transfer Request
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TransferAnimalModal;