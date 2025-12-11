import React, { useState, useEffect } from 'react';
import { DollarSign, Plus, Edit, Trash2, Search, X, Calendar, Filter, Download, TrendingUp, TrendingDown } from 'lucide-react';
import axios from 'axios';

const BudgetingTab = ({ authToken, API_BASE_URL, showModalMessage }) => {
    const [transactions, setTransactions] = useState([]);
    const [animals, setAnimals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all'); // all, sale, purchase
    const [filterYear, setFilterYear] = useState('all');
    const [currency, setCurrency] = useState(() => {
        return localStorage.getItem('budgetCurrency') || 'USD';
    });

    // Currency options with symbols
    const currencyOptions = [
        { code: 'USD', symbol: '$', name: 'US Dollar' },
        { code: 'EUR', symbol: '€', name: 'Euro' },
        { code: 'GBP', symbol: '£', name: 'British Pound' },
        { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
        { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
        { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
        { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
        { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
        { code: 'SEK', symbol: 'kr', name: 'Swedish Krona' },
        { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar' },
        { code: 'MXN', symbol: 'Mex$', name: 'Mexican Peso' },
        { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
        { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar' },
        { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone' },
        { code: 'KRW', symbol: '₩', name: 'South Korean Won' },
        { code: 'TRY', symbol: '₺', name: 'Turkish Lira' },
        { code: 'RUB', symbol: '₽', name: 'Russian Ruble' },
        { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
        { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
        { code: 'ZAR', symbol: 'R', name: 'South African Rand' }
    ];

    const getCurrencySymbol = () => {
        return currencyOptions.find(c => c.code === currency)?.symbol || '$';
    };

    const handleCurrencyChange = (newCurrency) => {
        setCurrency(newCurrency);
        localStorage.setItem('budgetCurrency', newCurrency);
    };
    
    // Form state
    const [formData, setFormData] = useState({
        type: 'sale', // sale or purchase
        animalId: '',
        animalName: '',
        price: '',
        date: new Date().toISOString().split('T')[0],
        buyer: '',
        seller: '',
        notes: ''
    });

    useEffect(() => {
        fetchTransactions();
        fetchAnimals();
    }, []);

    const fetchTransactions = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/budget/transactions`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            setTransactions(response.data || []);
        } catch (error) {
            console.error('Error fetching transactions:', error);
            // If endpoint doesn't exist yet, use empty array
            if (error.response?.status !== 404) {
                showModalMessage('Error', 'Failed to load transactions');
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchAnimals = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/animals`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            setAnimals(response.data || []);
        } catch (error) {
            console.error('Error fetching animals:', error);
        }
    };

    const resetForm = () => {
        setFormData({
            type: 'sale',
            animalId: '',
            animalName: '',
            price: '',
            date: new Date().toISOString().split('T')[0],
            buyer: '',
            seller: '',
            notes: ''
        });
        setEditingTransaction(null);
    };

    const handleAddTransaction = () => {
        resetForm();
        setShowAddModal(true);
    };

    const handleEditTransaction = (transaction) => {
        setFormData({
            type: transaction.type,
            animalId: transaction.animalId || '',
            animalName: transaction.animalName || '',
            price: transaction.price.toString(),
            date: transaction.date.split('T')[0],
            buyer: transaction.buyer || '',
            seller: transaction.seller || '',
            notes: transaction.notes || ''
        });
        setEditingTransaction(transaction);
        setShowAddModal(true);
    };

    const handleSaveTransaction = async (e) => {
        e.preventDefault();
        
        if (!formData.price || parseFloat(formData.price) <= 0) {
            showModalMessage('Error', 'Please enter a valid price');
            return;
        }

        try {
            const transactionData = {
                ...formData,
                price: parseFloat(formData.price)
            };

            if (editingTransaction) {
                await axios.put(
                    `${API_BASE_URL}/budget/transactions/${editingTransaction._id}`,
                    transactionData,
                    { headers: { Authorization: `Bearer ${authToken}` } }
                );
                showModalMessage('Success', 'Transaction updated successfully');
            } else {
                await axios.post(
                    `${API_BASE_URL}/budget/transactions`,
                    transactionData,
                    { headers: { Authorization: `Bearer ${authToken}` } }
                );
                showModalMessage('Success', 'Transaction added successfully');
            }

            setShowAddModal(false);
            resetForm();
            fetchTransactions();
        } catch (error) {
            console.error('Error saving transaction:', error);
            showModalMessage('Error', error.response?.data?.message || 'Failed to save transaction');
        }
    };

    const handleDeleteTransaction = async (id) => {
        if (!window.confirm('Are you sure you want to delete this transaction?')) {
            return;
        }

        try {
            await axios.delete(`${API_BASE_URL}/budget/transactions/${id}`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            showModalMessage('Success', 'Transaction deleted successfully');
            fetchTransactions();
        } catch (error) {
            console.error('Error deleting transaction:', error);
            showModalMessage('Error', 'Failed to delete transaction');
        }
    };

    const handleAnimalSelect = (animalId) => {
        const animal = animals.find(a => a.id_public === animalId);
        if (animal) {
            setFormData({
                ...formData,
                animalId: animal.id_public,
                animalName: animal.name
            });
        }
    };

    // Filter transactions
    const filteredTransactions = transactions.filter(transaction => {
        const matchesSearch = 
            transaction.animalName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            transaction.animalId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            transaction.buyer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            transaction.seller?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            transaction.notes?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesType = filterType === 'all' || transaction.type === filterType;
        
        const matchesYear = filterYear === 'all' || 
            new Date(transaction.date).getFullYear().toString() === filterYear;
        
        return matchesSearch && matchesType && matchesYear;
    });

    // Calculate statistics
    const stats = filteredTransactions.reduce((acc, transaction) => {
        if (transaction.type === 'sale') {
            acc.totalSales += transaction.price;
            acc.salesCount++;
        } else {
            acc.totalPurchases += transaction.price;
            acc.purchasesCount++;
        }
        return acc;
    }, { totalSales: 0, totalPurchases: 0, salesCount: 0, purchasesCount: 0 });

    const netProfit = stats.totalSales - stats.totalPurchases;

    // Get unique years from transactions
    const availableYears = [...new Set(transactions.map(t => 
        new Date(t.date).getFullYear().toString()
    ))].sort().reverse();

    // Export to CSV
    const exportToCSV = () => {
        const headers = ['Date', 'Type', 'Animal ID', 'Animal Name', 'Price', 'Buyer', 'Seller', 'Notes'];
        const rows = filteredTransactions.map(t => [
            new Date(t.date).toLocaleDateString(),
            t.type === 'sale' ? 'Sale' : 'Purchase',
            t.animalId || '',
            t.animalName || '',
            t.price.toFixed(2),
            t.buyer || '',
            t.seller || '',
            t.notes || ''
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="text-gray-600">Loading transactions...</div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-6xl mx-auto p-4">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <DollarSign size={28} className="text-green-600" />
                        Budget Tracker
                    </h1>
                    <div className="flex gap-2">
                        <button
                            onClick={exportToCSV}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition"
                            disabled={filteredTransactions.length === 0}
                        >
                            <Download size={18} />
                            Export
                        </button>
                        <button
                            onClick={handleAddTransaction}
                            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-black font-semibold rounded-lg transition"
                        >
                            <Plus size={18} />
                            Add Transaction
                        </button>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4">
                        <div className="text-green-600 text-sm font-medium mb-1 flex items-center gap-1">
                            <TrendingUp size={16} />
                            Total Sales
                        </div>
                        <div className="text-2xl font-bold text-green-700">
                            {getCurrencySymbol()}{stats.totalSales.toFixed(2)}
                        </div>
                        <div className="text-xs text-green-600 mt-1">
                            {stats.salesCount} transaction{stats.salesCount !== 1 ? 's' : ''}
                        </div>
                    </div>

                    <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4">
                        <div className="text-red-600 text-sm font-medium mb-1 flex items-center gap-1">
                            <TrendingDown size={16} />
                            Total Purchases
                        </div>
                        <div className="text-2xl font-bold text-red-700">
                            {getCurrencySymbol()}{stats.totalPurchases.toFixed(2)}
                        </div>
                        <div className="text-xs text-red-600 mt-1">
                            {stats.purchasesCount} transaction{stats.purchasesCount !== 1 ? 's' : ''}
                        </div>
                    </div>

                    <div className={`${netProfit >= 0 ? 'bg-blue-50 border-blue-300' : 'bg-orange-50 border-orange-300'} border-2 rounded-lg p-4`}>
                        <div className={`${netProfit >= 0 ? 'text-blue-600' : 'text-orange-600'} text-sm font-medium mb-1`}>
                            Net Profit/Loss
                        </div>
                        <div className={`text-2xl font-bold ${netProfit >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
                            {netProfit >= 0 ? '+' : ''}{getCurrencySymbol()}{Math.abs(netProfit).toFixed(2)}
                        </div>
                        <div className={`text-xs ${netProfit >= 0 ? 'text-blue-600' : 'text-orange-600'} mt-1`}>
                            {filteredTransactions.length} total transaction{filteredTransactions.length !== 1 ? 's' : ''}
                        </div>
                    </div>

                    <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-4">
                        <div className="text-purple-600 text-sm font-medium mb-1">
                            Average Sale
                        </div>
                        <div className="text-2xl font-bold text-purple-700">
                            {getCurrencySymbol()}{stats.salesCount > 0 ? (stats.totalSales / stats.salesCount).toFixed(2) : '0.00'}
                        </div>
                        <div className="text-xs text-purple-600 mt-1">
                            Per animal sold
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search transactions..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                        />
                    </div>

                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                        >
                            <option value="all">All Types</option>
                            <option value="sale">Sales Only</option>
                            <option value="purchase">Purchases Only</option>
                        </select>
                    </div>

                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <select
                            value={filterYear}
                            onChange={(e) => setFilterYear(e.target.value)}
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                        >
                            <option value="all">All Years</option>
                            {availableYears.map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                    </div>

                    <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <select
                            value={currency}
                            onChange={(e) => handleCurrencyChange(e.target.value)}
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                            title="Select Currency"
                        >
                            {currencyOptions.map(curr => (
                                <option key={curr.code} value={curr.code}>
                                    {curr.symbol} {curr.code} - {curr.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Transactions List */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                {filteredTransactions.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        <DollarSign size={48} className="mx-auto mb-4 text-gray-300" />
                        <p className="text-lg font-medium">No transactions yet</p>
                        <p className="text-sm mt-2">Start tracking your animal sales and purchases</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Animal</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Notes</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredTransactions.map((transaction) => (
                                    <tr key={transaction._id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 text-sm text-gray-700">
                                            {new Date(transaction.date).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                transaction.type === 'sale' 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {transaction.type === 'sale' ? 'Sale' : 'Purchase'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-700">
                                            <div className="font-medium">{transaction.animalName || 'N/A'}</div>
                                            {transaction.animalId && (
                                                <div className="text-xs text-gray-500">{transaction.animalId}</div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                                            {getCurrencySymbol()}{transaction.price.toFixed(2)}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-700">
                                            {transaction.type === 'sale' ? transaction.buyer : transaction.seller}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-500 max-w-xs truncate">
                                            {transaction.notes || '-'}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-right">
                                            <button
                                                onClick={() => handleEditTransaction(transaction)}
                                                className="text-blue-600 hover:text-blue-800 mr-3"
                                                title="Edit"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteTransaction(transaction._id)}
                                                className="text-red-600 hover:text-red-800"
                                                title="Delete"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Add/Edit Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-800">
                                {editingTransaction ? 'Edit Transaction' : 'Add Transaction'}
                            </h2>
                            <button
                                onClick={() => {
                                    setShowAddModal(false);
                                    resetForm();
                                }}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSaveTransaction} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Transaction Type *
                                    </label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                                        required
                                    >
                                        <option value="sale">Sale</option>
                                        <option value="purchase">Purchase</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Date *
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Select Animal (optional)
                                </label>
                                <select
                                    value={formData.animalId}
                                    onChange={(e) => handleAnimalSelect(e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                                >
                                    <option value="">-- Select an animal --</option>
                                    {animals.map(animal => (
                                        <option key={animal.id_public} value={animal.id_public}>
                                            {animal.id_public} - {animal.name} ({animal.species})
                                        </option>
                                    ))}
                                </select>
                                <p className="text-xs text-gray-500 mt-1">
                                    Animal name will be automatically linked from your animals list
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Price * ({getCurrencySymbol()})
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    placeholder="0.00"
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {formData.type === 'sale' ? 'Buyer' : 'Seller'}
                                </label>
                                <input
                                    type="text"
                                    value={formData.type === 'sale' ? formData.buyer : formData.seller}
                                    onChange={(e) => setFormData({ 
                                        ...formData, 
                                        [formData.type === 'sale' ? 'buyer' : 'seller']: e.target.value 
                                    })}
                                    placeholder={`Enter ${formData.type === 'sale' ? 'buyer' : 'seller'} name`}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Notes
                                </label>
                                <textarea
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    placeholder="Add any additional notes..."
                                    rows={3}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    className="flex-1 bg-primary hover:bg-primary/90 text-black font-semibold py-2 px-4 rounded-lg transition"
                                >
                                    {editingTransaction ? 'Update Transaction' : 'Add Transaction'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAddModal(false);
                                        resetForm();
                                    }}
                                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg transition"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BudgetingTab;
