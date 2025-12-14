import React, { useState, useEffect } from 'react';
import { DollarSign, Plus, Edit, Trash2, Search, X, Calendar, Filter, Download, TrendingUp, TrendingDown, Info } from 'lucide-react';
import axios from 'axios';

const BudgetingTab = ({ authToken, API_BASE_URL, showModalMessage }) => {
    const [transactions, setTransactions] = useState([]);
    const [animals, setAnimals] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showModeSelection, setShowModeSelection] = useState(false); // Show modal to choose manual vs transfer
    const [animalSaleMode, setAnimalSaleMode] = useState(null); // 'manual' or 'transfer' 
    const [showTypeSelection, setShowTypeSelection] = useState(true);
    const [editingTransaction, setEditingTransaction] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all'); // all, animal-sale, animal-purchase, expense, income
    const [filterYear, setFilterYear] = useState('all');
    const [userSearchQuery, setUserSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null); // Store selected user with ID
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
        type: 'animal-sale', // animal-sale, animal-purchase, expense, income
        animalId: '',
        animalName: '',
        price: '',
        date: new Date().toISOString().split('T')[0],
        buyer: '',
        seller: '',
        category: 'food', // for expense/income: food, housing, medical, equipment, other
        description: '', // for expense/income
        notes: ''
    });
    const [selectedSpecies, setSelectedSpecies] = useState('');

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

    const searchUsers = async () => {
        if (!userSearchQuery || userSearchQuery.trim().length < 2) {
            showModalMessage('Error', 'Please enter at least 2 characters to search');
            return;
        }
        
        setIsSearching(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/public/profiles/search?query=${encodeURIComponent(userSearchQuery)}`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            
            // Filter to only show users with at least one visible name
            const filteredUsers = (response.data || []).filter(user => {
                const hasVisibleBreederName = user.breederName && user.showBreederName;
                const hasVisiblePersonalName = user.personalName && user.showPersonalName;
                return hasVisibleBreederName || hasVisiblePersonalName;
            });
            
            setSearchResults(filteredUsers);
        } catch (error) {
            console.error('Error searching users:', error);
            setSearchResults([]);
            showModalMessage('Error', 'Failed to search users');
        } finally {
            setIsSearching(false);
        }
    };

    const resetForm = () => {
        setFormData({
            type: 'animal-sale',
            animalId: '',
            animalName: '',
            price: '',
            date: new Date().toISOString().split('T')[0],
            buyer: '',
            seller: '',
            category: 'food',
            description: '',
            notes: ''
        });
        setSelectedSpecies('');
        setUserSearchQuery('');
        setSearchResults([]);
        setSelectedUser(null); // Clear selected user
        setShowTypeSelection(true);
        setShowModeSelection(false);
        setAnimalSaleMode(null);
        setEditingTransaction(null);
    };

    const handleAddTransaction = () => {
        resetForm();
        setShowAddModal(true);
    };

    const handleEditTransaction = (transaction) => {
        setFormData({
            type: transaction.type || transaction.transactionType || 'animal-sale',
            animalId: transaction.animalId || '',
            animalName: transaction.animalName || '',
            price: transaction.price.toString(),
            date: transaction.date.split('T')[0],
            buyer: transaction.buyer || '',
            seller: transaction.seller || '',
            category: transaction.category || 'food',
            description: transaction.description || '',
            notes: transaction.notes || ''
        });
        setEditingTransaction(transaction);
        setShowAddModal(true);
    };

    const handleSaveTransaction = async (e) => {
        e.preventDefault();
        
        console.log('Form submitted with data:', formData);
        console.log('Selected user:', selectedUser);
        console.log('Animal sale mode:', animalSaleMode);
        console.log('Price validation:', formData.price, parseFloat(formData.price));
        
        if (formData.price === '' || formData.price === null || formData.price === undefined) {
            console.log('Price validation failed - empty');
            showModalMessage('Error', 'Please enter a price');
            return;
        }

        const priceValue = parseFloat(formData.price);
        if (isNaN(priceValue) || priceValue < 0) {
            console.log('Price validation failed - invalid or negative');
            showModalMessage('Error', 'Please enter a valid price (0 or greater)');
            return;
        }

        console.log('Starting API call...');
        console.log('DEBUG - Before checks: selectedUser:', !!selectedUser, 'animalSaleMode:', animalSaleMode, 'type:', formData.type);
        try {
            const transactionData = {
                ...formData,
                price: parseFloat(formData.price)
            };

            // Transform transaction type for API (remove 'animal-' prefix)
            if (formData.type === 'animal-sale') {
                transactionData.type = 'sale';
            } else if (formData.type === 'animal-purchase') {
                transactionData.type = 'purchase';
            } else {
                transactionData.type = formData.type;
            }

            // Add user ID if a user was selected from search (for animal sales/purchases only)
            // Only add user IDs in transfer mode (not in manual mode)
            console.log('DEBUG - Checking condition: selectedUser=', !!selectedUser, 'animalSaleMode===transfer=', animalSaleMode === 'transfer', 'type check=', (formData.type === 'animal-sale' || formData.type === 'animal-purchase'));
            if (selectedUser && animalSaleMode === 'transfer' && (formData.type === 'animal-sale' || formData.type === 'animal-purchase')) {
                console.log('Adding user IDs for transfer mode');
                if (formData.type === 'animal-sale') {
                    transactionData.buyerUserId = selectedUser._id;
                    console.log('Set buyerUserId:', selectedUser._id);
                } else {
                    transactionData.sellerUserId = selectedUser._id;
                    console.log('Set sellerUserId:', selectedUser._id);
                }
                // Mark this as a transfer mode transaction (not just logging)
                transactionData.mode = 'transfer';
                console.log('Set mode to transfer');
            } else {
                console.log('NOT adding user IDs - selectedUser:', !!selectedUser, 'animalSaleMode:', animalSaleMode, 'type:', formData.type);
            }

            console.log('Transaction data to send:', transactionData);

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

            console.log('API call successful');
            setShowAddModal(false);
            resetForm();
            fetchTransactions();
        } catch (error) {
            console.error('Error saving transaction:', error);
            console.error('Error response:', error.response?.data);
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
            transaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            transaction.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            transaction.notes?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesType = filterType === 'all' || transaction.type === filterType;
        
        const matchesYear = filterYear === 'all' || 
            new Date(transaction.date).getFullYear().toString() === filterYear;
        
        return matchesSearch && matchesType && matchesYear;
    });

    // Calculate statistics
    const stats = filteredTransactions.reduce((acc, transaction) => {
        if (transaction.type === 'animal-sale') {
            acc.totalSales += transaction.price;
            acc.salesCount++;
        } else if (transaction.type === 'animal-purchase') {
            acc.totalPurchases += transaction.price;
            acc.purchasesCount++;
        } else if (transaction.type === 'income') {
            acc.totalIncome += transaction.price;
            acc.incomeCount++;
        } else if (transaction.type === 'expense') {
            acc.totalExpenses += transaction.price;
            acc.expenseCount++;
        }
        return acc;
    }, { totalSales: 0, totalPurchases: 0, totalIncome: 0, totalExpenses: 0, salesCount: 0, purchasesCount: 0, incomeCount: 0, expenseCount: 0 });

    const netProfit = (stats.totalSales + stats.totalIncome) - (stats.totalPurchases + stats.totalExpenses);

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
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <DollarSign size={28} className="text-green-600" />
                        Budget Tracker
                    </h1>
                    <div className="flex flex-wrap gap-2">
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
                            <option value="animal-sale">Animal Sales</option>
                            <option value="animal-purchase">Animal Purchases</option>
                            <option value="expense">Expenses</option>
                            <option value="income">Income</option>
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
                                                transaction.type === 'animal-sale' 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : transaction.type === 'animal-purchase'
                                                    ? 'bg-red-100 text-red-800'
                                                    : transaction.type === 'expense'
                                                    ? 'bg-orange-100 text-orange-800'
                                                    : 'bg-blue-100 text-blue-800'
                                            }`}>
                                                {transaction.type === 'animal-sale' 
                                                    ? 'Animal Sale' 
                                                    : transaction.type === 'animal-purchase'
                                                    ? 'Animal Purchase'
                                                    : transaction.type === 'expense'
                                                    ? 'Expense'
                                                    : 'Income'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-700">
                                            {transaction.type === 'animal-sale' || transaction.type === 'animal-purchase' ? (
                                                <>
                                                    <div className="font-medium">{transaction.animalName || 'N/A'}</div>
                                                    {transaction.animalId && (
                                                        <div className="text-xs text-gray-500">{transaction.animalId}</div>
                                                    )}
                                                </>
                                            ) : (
                                                <>
                                                    <div className="font-medium">{transaction.description || 'N/A'}</div>
                                                    {transaction.category && (
                                                        <div className="text-xs text-gray-500">{transaction.category}</div>
                                                    )}
                                                </>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                                            {getCurrencySymbol()}{transaction.price.toFixed(2)}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-700">
                                            {transaction.type === 'animal-sale' ? transaction.buyer : transaction.type === 'animal-purchase' ? transaction.seller : '-'}
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
                                {editingTransaction 
                                    ? 'Edit Transaction' 
                                    : showTypeSelection 
                                        ? 'Add Transaction'
                                        : formData.type === 'animal-sale' 
                                            ? 'Add Animal Sale' 
                                            : formData.type === 'animal-purchase'
                                            ? 'Add Animal Purchase'
                                            : formData.type === 'expense'
                                            ? 'Add Expense'
                                            : 'Add Income'
                                }
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

                        {/* Transaction Type Selection Screen */}
                        {!editingTransaction && showTypeSelection ? (
                            <div className="space-y-6">
                                <p className="text-center text-gray-600 mb-8">What type of transaction would you like to add?</p>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            console.log('[BudgetTab] Animal Sale button clicked');
                                            setFormData({ ...formData, type: 'animal-sale' });
                                            setShowTypeSelection(false);
                                            setShowModeSelection(true);
                                        }}
                                        className="flex flex-col items-center justify-center p-6 border-2 border-gray-300 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all"
                                    >
                                        <TrendingUp className="w-12 h-12 text-green-600 mb-3" />
                                        <h3 className="text-lg font-bold text-gray-800 mb-1">Animal Sale</h3>
                                        <p className="text-xs text-gray-600 text-center">Sell an animal</p>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            console.log('[BudgetTab] Animal Purchase button clicked');
                                            setFormData({ ...formData, type: 'animal-purchase' });
                                            setShowTypeSelection(false);
                                            setShowModeSelection(true);
                                        }}
                                        className="flex flex-col items-center justify-center p-6 border-2 border-gray-300 rounded-xl hover:border-red-500 hover:bg-red-50 transition-all"
                                    >
                                        <TrendingDown className="w-12 h-12 text-red-600 mb-3" />
                                        <h3 className="text-lg font-bold text-gray-800 mb-1">Animal Purchase</h3>
                                        <p className="text-xs text-gray-600 text-center">Buy an animal</p>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            console.log('[BudgetTab] Expense button clicked');
                                            setFormData({ ...formData, type: 'expense' });
                                            setShowTypeSelection(false);
                                        }}
                                        className="flex flex-col items-center justify-center p-6 border-2 border-gray-300 rounded-xl hover:border-orange-500 hover:bg-orange-50 transition-all"
                                    >
                                        <TrendingDown className="w-12 h-12 text-orange-600 mb-3" />
                                        <h3 className="text-lg font-bold text-gray-800 mb-1">Expense</h3>
                                        <p className="text-xs text-gray-600 text-center">Food, housing, medical...</p>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            console.log('[BudgetTab] Income button clicked');
                                            setFormData({ ...formData, type: 'income' });
                                            setShowTypeSelection(false);
                                        }}
                                        className="flex flex-col items-center justify-center p-6 border-2 border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all"
                                    >
                                        <TrendingUp className="w-12 h-12 text-blue-600 mb-3" />
                                        <h3 className="text-lg font-bold text-gray-800 mb-1">Income</h3>
                                        <p className="text-xs text-gray-600 text-center">Other income</p>
                                    </button>
                                </div>
                            </div>
                        ) : showModeSelection && (formData.type === 'animal-sale' || formData.type === 'animal-purchase') ? (
                            // Mode Selection Screen for Animal Transactions
                            <div className="space-y-6">
                                <p className="text-center text-gray-600 mb-8">
                                    {formData.type === 'animal-sale' 
                                        ? 'How would you like to record this animal sale?' 
                                        : 'How would you like to record this animal purchase?'}
                                </p>
                                <div className="grid grid-cols-1 gap-4">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            console.log('[BudgetTab] Manual mode selected for', formData.type);
                                            setAnimalSaleMode('manual');
                                            setShowModeSelection(false);
                                        }}
                                        className="flex flex-col items-start justify-start p-6 border-2 border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
                                    >
                                        <h3 className="text-lg font-bold text-gray-800 mb-2">Manual Entry</h3>
                                        <p className="text-sm text-gray-600">
                                            {formData.type === 'animal-sale'
                                                ? 'Simply record the sale details. Animal selection is optional.'
                                                : 'Simply record the purchase details. Animal selection is optional.'}
                                        </p>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            console.log('[BudgetTab] Transfer mode selected for', formData.type);
                                            setAnimalSaleMode('transfer');
                                            setShowModeSelection(false);
                                        }}
                                        className="flex flex-col items-start justify-start p-6 border-2 border-gray-300 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all text-left"
                                    >
                                        <h3 className="text-lg font-bold text-gray-800 mb-2">
                                            {formData.type === 'animal-sale' ? 'Transfer Ownership' : 'Notify Seller'}
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            {formData.type === 'animal-sale'
                                                ? 'Transfer ownership to a buyer and notify them.'
                                                : 'Request an animal from a seller and notify them.'}
                                        </p>
                                    </button>
                                </div>
                            </div>
                        ) : (
                        <>
                        {console.log('[BudgetTab] Rendering form - type:', formData.type, 'animalSaleMode:', animalSaleMode)}
                        <form onSubmit={handleSaveTransaction} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Date *
                                </label>
                                <input
                                    type="date"
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                                    min="1900-01-01"
                                    max={new Date().toISOString().split('T')[0]}
                                    required
                                />
                            </div>

                            {/* Animal selection - MANUAL MODE: optional, TRANSFER MODE: required */}
                            {(formData.type === 'animal-sale' || formData.type === 'animal-purchase') && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Select Animal {animalSaleMode === 'transfer' ? '*' : '(optional)'}
                                    </label>
                                    <div className="space-y-3">
                                        {/* Species filter */}
                                        <select
                                            value={selectedSpecies}
                                            onChange={(e) => {
                                                setSelectedSpecies(e.target.value);
                                                setFormData({ ...formData, animalId: '', animalName: '' });
                                            }}
                                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                                        >
                                            <option value="">-- All Species --</option>
                                            {[...new Set(animals.map(a => a.species))].sort().map(species => (
                                                <option key={species} value={species}>
                                                    {species}
                                                </option>
                                            ))}
                                        </select>
                                        
                                        {/* Animal selection */}
                                        <select
                                            value={formData.animalId}
                                            onChange={(e) => handleAnimalSelect(e.target.value)}
                                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                                            disabled={selectedSpecies && animals.filter(a => a.species === selectedSpecies).length === 0}
                                            required={animalSaleMode === 'transfer'}
                                        >
                                            <option value="">-- Select an animal --</option>
                                            {animals
                                                .filter(animal => !selectedSpecies || animal.species === selectedSpecies)
                                                .map(animal => (
                                                    <option key={animal.id_public} value={animal.id_public}>
                                                        {animal.id_public} - {animal.name}
                                                    </option>
                                                ))}
                                        </select>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {selectedSpecies 
                                            ? `Showing ${animals.filter(a => a.species === selectedSpecies).length} ${selectedSpecies}` 
                                            : 'Filter by species first for easier selection'}
                                    </p>
                                </div>
                            )}

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

                            {/* Category field for expense/income */}
                            {(formData.type === 'expense' || formData.type === 'income') && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Category *
                                    </label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                                        required
                                    >
                                        <option value="food">Food & Supplies</option>
                                        <option value="housing">Housing & Bedding</option>
                                        <option value="medical">Medical & Veterinary</option>
                                        <option value="equipment">Equipment & Setup</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                            )}

                            {/* Description field for expense/income */}
                            {(formData.type === 'expense' || formData.type === 'income') && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Description *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="e.g., Monthly food supply, Vet checkup, Cage upgrade"
                                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                                        required
                                    />
                                </div>
                            )}

                            {/* Buyer/Seller section for animal sales and purchases */}
                            {(formData.type === 'animal-sale' || formData.type === 'animal-purchase') && animalSaleMode === 'manual' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {formData.type === 'animal-sale' ? 'Buyer Name' : 'Seller Name'}
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.type === 'animal-sale' ? formData.buyer : formData.seller}
                                        onChange={(e) => setFormData({ 
                                            ...formData, 
                                            [formData.type === 'animal-sale' ? 'buyer' : 'seller']: e.target.value 
                                        })}
                                        placeholder={`Enter ${formData.type === 'animal-sale' ? 'buyer' : 'seller'} name (optional)`}
                                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                                    />
                                </div>
                            )}

                            {/* Transfer/Notify mode: Required user search */}
                            {(formData.type === 'animal-sale' || formData.type === 'animal-purchase') && animalSaleMode === 'transfer' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {formData.type === 'animal-sale' ? 'Buyer (CritterTrack User) *' : 'Seller (CritterTrack User) *'}
                                    </label>
                                    {/* Hidden input for form validation */}
                                    <input
                                        type="hidden"
                                        value={formData.type === 'animal-sale' ? formData.buyer : formData.seller}
                                        required
                                    />
                                    <div className="relative">
                                        {/* Show selected user or search input */}
                                        {(formData.type === 'animal-sale' ? formData.buyer : formData.seller) ? (
                                            <div className="flex items-center justify-between w-full p-2 border border-gray-300 rounded-lg bg-gray-50">
                                                <span className="text-gray-700">{formData.type === 'animal-sale' ? formData.buyer : formData.seller}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setFormData({ ...formData, buyer: '', seller: '' });
                                                        setSelectedUser(null);
                                                        setSearchResults([]);
                                                    }}
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
                                                        value={userSearchQuery}
                                                        onChange={(e) => setUserSearchQuery(e.target.value)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') {
                                                                e.preventDefault();
                                                                searchUsers();
                                                            }
                                                        }}
                                                        placeholder="Search by name or ID (min 2 chars)..."
                                                        className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={searchUsers}
                                                        disabled={isSearching}
                                                        className="px-4 py-2 bg-primary text-black rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                                    >
                                                        <Search className="w-4 h-4" />
                                                        {isSearching ? 'Searching...' : 'Search'}
                                                    </button>
                                                </div>
                                                {userSearchQuery.length >= 2 && searchResults.length > 0 && (
                                                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                                        {searchResults.map(user => {
                                                            const hasVisibleBreederName = user.breederName && user.showBreederName;
                                                            const hasVisiblePersonalName = user.personalName && user.showPersonalName;
                                                            
                                                            let displayName;
                                                            if (hasVisibleBreederName && hasVisiblePersonalName) {
                                                                displayName = `${user.personalName} (${user.breederName})`;
                                                            } else if (hasVisibleBreederName) {
                                                                displayName = user.breederName;
                                                            } else {
                                                                displayName = user.personalName;
                                                            }
                                                            
                                                            const value = hasVisibleBreederName ? user.breederName : user.personalName;
                                                            
                                                            return (
                                                                <button
                                                                    key={user.id_public}
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setFormData({ 
                                                                            ...formData, 
                                                                            [formData.type === 'animal-sale' ? 'buyer' : 'seller']: value 
                                                                        });
                                                                        setSelectedUser(user);
                                                                        setUserSearchQuery('');
                                                                        setSearchResults([]);
                                                                    }}
                                                                    className="w-full text-left px-4 py-2 hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
                                                                >
                                                                    <div className="font-medium">{user.id_public}</div>
                                                                    <div className="text-sm text-gray-600">{displayName}</div>
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                                {userSearchQuery.length >= 2 && searchResults.length === 0 && !isSearching && (
                                                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4 text-center text-gray-500">
                                                        No users found
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                    {formData.type === 'animal-sale' && (
                                        <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                                            <div className="flex items-start gap-2">
                                                <Info className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                                <div className="text-xs text-green-800">
                                                    <p className="font-semibold mb-1">🔄 Transfer Ownership</p>
                                                    <p>The buyer will be notified and the animal ownership will be transferred to them in the system.</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    {formData.type === 'animal-purchase' && (
                                        <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                            <div className="flex items-start gap-2">
                                                <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                                <div className="text-xs text-blue-800">
                                                    <p className="font-semibold mb-1">📢 Notify Seller</p>
                                                    <p>The seller will be notified of your purchase. This helps breeders keep track of where their animals go.</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

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
                        </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default BudgetingTab;
