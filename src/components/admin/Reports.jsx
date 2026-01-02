import React, { useState, useEffect } from 'react';
import { BarChart3, Loader2, Download, Calendar, TrendingUp, Users, Activity } from 'lucide-react';

const Reports = ({ authToken, API_BASE_URL }) => {
    const [reportData, setReportData] = useState({
        totalAnimals: 0,
        totalLitters: 0,
        activeUsers: 0,
        totalUsers: 0,
        recentSignups: 0,
        averageAnimalsPerUser: 0,
        topSpecies: []
    });
    const [dateRange, setDateRange] = useState('month'); // 'week', 'month', 'year'
    const [loading, setLoading] = useState(true);
    const [customFilter, setCustomFilter] = useState({
        startDate: '',
        endDate: '',
        species: ''
    });

    useEffect(() => {
        fetchReportData();
    }, [dateRange]);

    const fetchReportData = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE_URL}/admin/reports/analytics?range=${dateRange}`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            if (response.ok) {
                const data = await response.json();
                setReportData(data);
            }
        } catch (error) {
            console.error('Error fetching report data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleExportReport = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/reports/export?format=pdf&range=${dateRange}`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `crittertrack_report_${new Date().toISOString().split('T')[0]}.pdf`;
                a.click();
            }
        } catch (error) {
            console.error('Error exporting report:', error);
        }
    };

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-800">Reports & Analytics</h3>
                <button
                    onClick={handleExportReport}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
                >
                    <Download size={20} />
                    Export PDF
                </button>
            </div>

            {/* Date Range Selector */}
            <div className="mb-6 flex gap-2">
                {['week', 'month', 'year'].map(range => (
                    <button
                        key={range}
                        onClick={() => setDateRange(range)}
                        className={`px-4 py-2 rounded-lg transition ${
                            dateRange === range
                                ? 'bg-red-600 text-white'
                                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                        }`}
                    >
                        {range.charAt(0).toUpperCase() + range.slice(1)}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex justify-center py-8">
                    <Loader2 className="animate-spin" size={32} />
                </div>
            ) : (
                <>
                    {/* Key Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <MetricCard
                            label="Total Animals"
                            value={reportData.totalAnimals}
                            icon={Activity}
                            color="blue"
                        />
                        <MetricCard
                            label="Total Litters"
                            value={reportData.totalLitters}
                            icon={Activity}
                            color="green"
                        />
                        <MetricCard
                            label="Active Users"
                            value={reportData.activeUsers}
                            icon={Users}
                            color="purple"
                        />
                        <MetricCard
                            label="Total Users"
                            value={reportData.totalUsers}
                            icon={Users}
                            color="orange"
                        />
                    </div>

                    {/* Engagement Metrics */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <h4 className="font-bold text-gray-800 mb-4">User Engagement</h4>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Recent Signups</span>
                                    <span className="text-2xl font-bold text-gray-800">{reportData.recentSignups}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Avg Animals per User</span>
                                    <span className="text-2xl font-bold text-gray-800">{reportData.averageAnimalsPerUser.toFixed(1)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <h4 className="font-bold text-gray-800 mb-4">Top Species</h4>
                            <div className="space-y-2">
                                {reportData.topSpecies.map((species, index) => (
                                    <div key={species.name} className="flex justify-between items-center">
                                        <span className="text-gray-600">{index + 1}. {species.name}</span>
                                        <div className="flex items-center gap-2">
                                            <div className="h-2 bg-gray-200 rounded" style={{ width: '100px' }}>
                                                <div
                                                    className="h-full bg-red-600 rounded"
                                                    style={{
                                                        width: `${(species.count / (reportData.topSpecies[0]?.count || 1)) * 100}%`
                                                    }}
                                                ></div>
                                            </div>
                                            <span className="text-sm font-semibold text-gray-800">{species.count}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Custom Report Builder */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h4 className="font-bold text-gray-800 mb-4">Custom Report Builder</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Start Date</label>
                                <input
                                    type="date"
                                    value={customFilter.startDate}
                                    onChange={(e) => setCustomFilter({ ...customFilter, startDate: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">End Date</label>
                                <input
                                    type="date"
                                    value={customFilter.endDate}
                                    onChange={(e) => setCustomFilter({ ...customFilter, endDate: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Species (Optional)</label>
                                <select
                                    value={customFilter.species}
                                    onChange={(e) => setCustomFilter({ ...customFilter, species: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600"
                                >
                                    <option value="">All Species</option>
                                    <option value="fancy-mouse">Fancy Mouse</option>
                                    <option value="fancy-rat">Fancy Rat</option>
                                    <option value="hamster">Hamster</option>
                                    <option value="guinea-pig">Guinea Pig</option>
                                </select>
                            </div>
                        </div>
                        <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                            Generate Custom Report
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

const MetricCard = ({ label, value, icon: Icon, color }) => {
    const colorClasses = {
        blue: 'bg-blue-50 text-blue-600',
        green: 'bg-green-50 text-green-600',
        purple: 'bg-purple-50 text-purple-600',
        orange: 'bg-orange-50 text-orange-600'
    };

    return (
        <div className={`rounded-lg border p-6 ${colorClasses[color]} border-gray-200`}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-600">{label}</p>
                    <p className="text-3xl font-bold mt-2">{value}</p>
                </div>
                <Icon size={32} className="opacity-20" />
            </div>
        </div>
    );
};

export default Reports;
