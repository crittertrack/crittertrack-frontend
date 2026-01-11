import React, { useState, useEffect, useCallback } from 'react';
import {
    BarChart3, TrendingUp, Users, AlertTriangle, Clock,
    RefreshCw, Calendar, Activity, Shield, UserX, UserMinus,
    PieChart as PieChartIcon, Loader
} from 'lucide-react';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    AreaChart, Area
} from 'recharts';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00C49F', '#FFBB28', '#FF8042'];

const AnalyticsTab = ({ API_BASE_URL, authToken }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dateRange, setDateRange] = useState('30d');
    const [overview, setOverview] = useState(null);
    const [moderationActions, setModerationActions] = useState(null);
    const [reportsBreakdown, setReportsBreakdown] = useState(null);
    const [moderatorActivity, setModeratorActivity] = useState(null);
    const [activityHeatmap, setActivityHeatmap] = useState(null);
    const [resolutionTime, setResolutionTime] = useState(null);

    const fetchAnalytics = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const headers = { Authorization: `Bearer ${authToken}` };
            const queryParam = `?range=${dateRange}`;

            const [overviewRes, actionsRes, breakdownRes, activityRes, heatmapRes, resolutionRes] = await Promise.all([
                fetch(`${API_BASE_URL}/api/moderation/analytics/overview${queryParam}`, { headers }),
                fetch(`${API_BASE_URL}/api/moderation/analytics/moderation-actions${queryParam}`, { headers }),
                fetch(`${API_BASE_URL}/api/moderation/analytics/reports-breakdown${queryParam}`, { headers }),
                fetch(`${API_BASE_URL}/api/moderation/analytics/moderator-activity${queryParam}`, { headers }),
                fetch(`${API_BASE_URL}/api/moderation/analytics/activity-heatmap${queryParam}`, { headers }),
                fetch(`${API_BASE_URL}/api/moderation/analytics/resolution-time${queryParam}`, { headers })
            ]);

            // Check for HTTP errors
            const responses = [
                { name: 'overview', res: overviewRes },
                { name: 'actions', res: actionsRes },
                { name: 'breakdown', res: breakdownRes },
                { name: 'activity', res: activityRes },
                { name: 'heatmap', res: heatmapRes },
                { name: 'resolution', res: resolutionRes }
            ];
            for (const { name, res } of responses) {
                if (!res.ok) {
                    const errorData = await res.json().catch(() => ({}));
                    console.error(`Analytics ${name} endpoint failed:`, res.status, errorData);
                    throw new Error(errorData.error || errorData.message || `${name} endpoint failed: HTTP ${res.status}`);
                }
            }

            const [overviewData, actionsData, breakdownData, activityData, heatmapData, resolutionData] = 
                await Promise.all([
                    overviewRes.json(),
                    actionsRes.json(),
                    breakdownRes.json(),
                    activityRes.json(),
                    heatmapRes.json(),
                    resolutionRes.json()
                ]);

            setOverview(overviewData);
            setModerationActions(actionsData);
            setReportsBreakdown(breakdownData);
            setModeratorActivity(activityData);
            setActivityHeatmap(heatmapData);
            setResolutionTime(resolutionData);
        } catch (err) {
            console.error('Failed to fetch analytics:', err);
            setError(err.message || 'Failed to load analytics data');
        } finally {
            setLoading(false);
        }
    }, [API_BASE_URL, authToken, dateRange]);

    useEffect(() => {
        fetchAnalytics();
    }, [fetchAnalytics]);

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        // Handle different date formats
        if (dateStr.includes('-') && dateStr.length === 7) {
            // Month format: 2024-01
            const [year, month] = dateStr.split('-');
            return new Date(year, month - 1).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
        }
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader className="animate-spin mr-2" size={24} />
                <span className="text-gray-600">Loading analytics...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <AlertTriangle className="mx-auto text-red-500 mb-2" size={32} />
                <p className="text-red-700">{error}</p>
                <button
                    onClick={fetchAnalytics}
                    className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header with Date Range Selector */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h3 className="text-2xl font-bold text-gray-800">Analytics Dashboard</h3>
                    <p className="text-gray-500 text-sm mt-1">
                        Moderation activity and platform insights
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                        {['7d', '30d', '90d', '1y'].map((range) => (
                            <button
                                key={range}
                                onClick={() => setDateRange(range)}
                                className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                                    dateRange === range
                                        ? 'bg-white shadow text-red-600'
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : range === '90d' ? '90 Days' : '1 Year'}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={fetchAnalytics}
                        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
                        title="Refresh data"
                    >
                        <RefreshCw size={20} />
                    </button>
                </div>
            </div>

            {/* Overview Stats Cards */}
            {overview && (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                    <StatCard 
                        label="Total Users" 
                        value={overview.overview.totalUsers} 
                        icon={Users} 
                        color="blue" 
                    />
                    <StatCard 
                        label="Total Animals" 
                        value={overview.overview.totalAnimals} 
                        icon={Shield} 
                        color="green" 
                    />
                    <StatCard 
                        label="Total Reports" 
                        value={overview.overview.totalReports} 
                        icon={AlertTriangle} 
                        color="yellow" 
                    />
                    <StatCard 
                        label="Pending" 
                        value={overview.overview.pendingReports} 
                        icon={Clock} 
                        color="orange" 
                    />
                    <StatCard 
                        label="Active Warnings" 
                        value={overview.overview.activeWarnings} 
                        icon={AlertTriangle} 
                        color="amber" 
                    />
                    <StatCard 
                        label="Suspended" 
                        value={overview.overview.suspendedUsers} 
                        icon={UserMinus} 
                        color="red" 
                    />
                    <StatCard 
                        label="Banned" 
                        value={overview.overview.bannedUsers} 
                        icon={UserX} 
                        color="darkred" 
                    />
                </div>
            )}

            {/* Period Stats */}
            {overview?.rangeStats && (
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-100">
                    <h4 className="text-sm font-medium text-gray-600 mb-3 flex items-center gap-2">
                        <Calendar size={16} />
                        In the last {dateRange === '7d' ? '7 days' : dateRange === '30d' ? '30 days' : dateRange === '90d' ? '90 days' : 'year'}
                    </h4>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-blue-600">{overview.rangeStats.newUsers}</p>
                            <p className="text-xs text-gray-500">New Users</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-yellow-600">{overview.rangeStats.newReports}</p>
                            <p className="text-xs text-gray-500">New Reports</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-green-600">{overview.rangeStats.resolvedReports}</p>
                            <p className="text-xs text-gray-500">Resolved Reports</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Moderation Actions Over Time */}
                {moderationActions?.chartData && (
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <TrendingUp size={20} className="text-blue-500" />
                            Moderation Actions Over Time
                        </h4>
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={moderationActions.chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis 
                                    dataKey="date" 
                                    tickFormatter={formatDate}
                                    tick={{ fontSize: 12 }}
                                />
                                <YAxis tick={{ fontSize: 12 }} />
                                <Tooltip 
                                    labelFormatter={formatDate}
                                    contentStyle={{ fontSize: 12 }}
                                />
                                <Legend />
                                <Area 
                                    type="monotone" 
                                    dataKey="warnings" 
                                    stackId="1"
                                    stroke="#ffc658" 
                                    fill="#ffc658" 
                                    fillOpacity={0.6}
                                    name="Warnings"
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="suspensions" 
                                    stackId="1"
                                    stroke="#ff7300" 
                                    fill="#ff7300" 
                                    fillOpacity={0.6}
                                    name="Suspensions"
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="bans" 
                                    stackId="1"
                                    stroke="#dc2626" 
                                    fill="#dc2626" 
                                    fillOpacity={0.6}
                                    name="Bans"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                        {moderationActions.totals && (
                            <div className="mt-4 grid grid-cols-4 gap-2 text-center text-sm">
                                <div className="bg-yellow-50 rounded-lg p-2">
                                    <p className="font-bold text-yellow-700">{moderationActions.totals.warnings}</p>
                                    <p className="text-xs text-yellow-600">Warnings</p>
                                </div>
                                <div className="bg-orange-50 rounded-lg p-2">
                                    <p className="font-bold text-orange-700">{moderationActions.totals.suspensions}</p>
                                    <p className="text-xs text-orange-600">Suspensions</p>
                                </div>
                                <div className="bg-red-50 rounded-lg p-2">
                                    <p className="font-bold text-red-700">{moderationActions.totals.bans}</p>
                                    <p className="text-xs text-red-600">Bans</p>
                                </div>
                                <div className="bg-green-50 rounded-lg p-2">
                                    <p className="font-bold text-green-700">{moderationActions.totals.lifts}</p>
                                    <p className="text-xs text-green-600">Lifted</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Reports by Type Pie Chart */}
                {reportsBreakdown?.byType && (
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <PieChartIcon size={20} className="text-purple-500" />
                            Reports by Type
                        </h4>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={reportsBreakdown.byType}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {reportsBreakdown.byType.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <p className="text-center text-sm text-gray-500 mt-2">
                            Total: {reportsBreakdown.total} reports
                        </p>
                    </div>
                )}

                {/* Reports by Status */}
                {reportsBreakdown?.byStatus && (
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <BarChart3 size={20} className="text-green-500" />
                            Reports by Status
                        </h4>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={reportsBreakdown.byStatus} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" tick={{ fontSize: 12 }} />
                                <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={100} />
                                <Tooltip />
                                <Bar dataKey="value" fill="#82ca9d" radius={[0, 4, 4, 0]}>
                                    {reportsBreakdown.byStatus.map((entry, index) => {
                                        const colors = {
                                            'Pending': '#fbbf24',
                                            'In progress': '#3b82f6',
                                            'Reviewed': '#8b5cf6',
                                            'Resolved': '#22c55e',
                                            'Dismissed': '#6b7280'
                                        };
                                        return <Cell key={`cell-${index}`} fill={colors[entry.name] || COLORS[index % COLORS.length]} />;
                                    })}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}

                {/* Activity by Hour */}
                {activityHeatmap?.byHour && (
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Clock size={20} className="text-orange-500" />
                            Report Activity by Hour (UTC)
                        </h4>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={activityHeatmap.byHour}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis 
                                    dataKey="hour" 
                                    tick={{ fontSize: 10 }}
                                    interval={2}
                                />
                                <YAxis tick={{ fontSize: 12 }} />
                                <Tooltip />
                                <Bar dataKey="count" fill="#f97316" radius={[4, 4, 0, 0]} name="Reports" />
                            </BarChart>
                        </ResponsiveContainer>
                        {activityHeatmap.peakTimes && activityHeatmap.peakTimes.length > 0 && (
                            <div className="mt-4 bg-orange-50 rounded-lg p-3">
                                <p className="text-sm font-medium text-orange-800">Peak Times:</p>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {activityHeatmap.peakTimes.slice(0, 3).map((peak, i) => (
                                        <span key={i} className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs">
                                            {peak.day} {peak.hour} ({peak.count} reports)
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Activity by Day of Week */}
            {activityHeatmap?.byDayOfWeek && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Calendar size={20} className="text-indigo-500" />
                        Report Activity by Day of Week
                    </h4>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={activityHeatmap.byDayOfWeek}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip />
                            <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} name="Reports" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Resolution Time Stats */}
            {resolutionTime?.resolutionTimes && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Activity size={20} className="text-teal-500" />
                        Average Resolution Time (hours)
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <ResolutionCard 
                            title="Profile Reports" 
                            data={resolutionTime.resolutionTimes.profile}
                            color="purple"
                        />
                        <ResolutionCard 
                            title="Animal Reports" 
                            data={resolutionTime.resolutionTimes.animal}
                            color="green"
                        />
                        <ResolutionCard 
                            title="Message Reports" 
                            data={resolutionTime.resolutionTimes.message}
                            color="yellow"
                        />
                        <ResolutionCard 
                            title="Overall" 
                            data={resolutionTime.resolutionTimes.overall}
                            color="blue"
                            highlighted
                        />
                    </div>
                </div>
            )}

            {/* Moderator Activity Table */}
            {moderatorActivity?.moderators && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Users size={20} className="text-blue-500" />
                        Moderator Activity
                    </h4>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left py-3 px-4 font-medium text-gray-600">Moderator</th>
                                    <th className="text-center py-3 px-2 font-medium text-gray-600">Role</th>
                                    <th className="text-center py-3 px-2 font-medium text-gray-600">Total</th>
                                    <th className="text-center py-3 px-2 font-medium text-gray-600">Warnings</th>
                                    <th className="text-center py-3 px-2 font-medium text-gray-600">Suspensions</th>
                                    <th className="text-center py-3 px-2 font-medium text-gray-600">Bans</th>
                                    <th className="text-center py-3 px-2 font-medium text-gray-600">Resolved</th>
                                    <th className="text-right py-3 px-4 font-medium text-gray-600">Last Active</th>
                                </tr>
                            </thead>
                            <tbody>
                                {moderatorActivity.moderators.map((mod, index) => (
                                    <tr key={mod.moderator.id} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                                        <td className="py-3 px-4">
                                            <span className="font-medium text-gray-800">{mod.moderator.name}</span>
                                        </td>
                                        <td className="py-3 px-2 text-center">
                                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                                mod.moderator.role === 'admin' 
                                                    ? 'bg-purple-100 text-purple-700' 
                                                    : 'bg-blue-100 text-blue-700'
                                            }`}>
                                                {mod.moderator.role}
                                            </span>
                                        </td>
                                        <td className="py-3 px-2 text-center font-bold text-gray-800">
                                            {mod.actions.total}
                                        </td>
                                        <td className="py-3 px-2 text-center text-yellow-600">
                                            {mod.actions.warnings}
                                        </td>
                                        <td className="py-3 px-2 text-center text-orange-600">
                                            {mod.actions.suspensions}
                                        </td>
                                        <td className="py-3 px-2 text-center text-red-600">
                                            {mod.actions.bans}
                                        </td>
                                        <td className="py-3 px-2 text-center text-green-600">
                                            {mod.actions.resolvedReports}
                                        </td>
                                        <td className="py-3 px-4 text-right text-gray-500 text-xs">
                                            {mod.lastActive 
                                                ? new Date(mod.lastActive).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })
                                                : 'Never'
                                            }
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Report Reasons Breakdown */}
            {reportsBreakdown?.byReason && reportsBreakdown.byReason.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <AlertTriangle size={20} className="text-red-500" />
                        Common Report Reasons
                    </h4>
                    <div className="flex flex-wrap gap-3">
                        {reportsBreakdown.byReason.map((reason, index) => (
                            <div 
                                key={reason.name}
                                className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2"
                            >
                                <div 
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                />
                                <span className="text-sm font-medium text-gray-700">{reason.name}</span>
                                <span className="bg-white px-2 py-0.5 rounded-full text-xs font-bold text-gray-600">
                                    {reason.value}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// Stat Card Component
const StatCard = ({ label, value, icon: Icon, color = 'blue' }) => {
    const colorClasses = {
        blue: 'bg-blue-50 border-blue-200 text-blue-600',
        green: 'bg-green-50 border-green-200 text-green-600',
        yellow: 'bg-yellow-50 border-yellow-200 text-yellow-600',
        orange: 'bg-orange-50 border-orange-200 text-orange-600',
        amber: 'bg-amber-50 border-amber-200 text-amber-600',
        red: 'bg-red-50 border-red-200 text-red-600',
        darkred: 'bg-red-100 border-red-300 text-red-700'
    };

    return (
        <div className={`rounded-lg border p-4 ${colorClasses[color]}`}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs font-medium text-gray-500">{label}</p>
                    <p className="text-2xl font-bold mt-1">{value?.toLocaleString() || 0}</p>
                </div>
                <Icon size={24} className="opacity-30" />
            </div>
        </div>
    );
};

// Resolution Time Card Component
const ResolutionCard = ({ title, data, color = 'blue', highlighted = false }) => {
    const colorClasses = {
        purple: 'border-purple-200 bg-purple-50',
        green: 'border-green-200 bg-green-50',
        yellow: 'border-yellow-200 bg-yellow-50',
        blue: 'border-blue-200 bg-blue-50'
    };

    return (
        <div className={`rounded-lg border p-4 ${colorClasses[color]} ${highlighted ? 'ring-2 ring-blue-400' : ''}`}>
            <p className="text-sm font-medium text-gray-700 mb-2">{title}</p>
            <div className="space-y-1">
                <div className="flex justify-between">
                    <span className="text-xs text-gray-500">Average:</span>
                    <span className="text-sm font-bold">{data?.avg || 0}h</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-xs text-gray-500">Min:</span>
                    <span className="text-xs text-green-600">{data?.min || 0}h</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-xs text-gray-500">Max:</span>
                    <span className="text-xs text-red-600">{data?.max || 0}h</span>
                </div>
                <div className="flex justify-between border-t pt-1 mt-1">
                    <span className="text-xs text-gray-500">Resolved:</span>
                    <span className="text-xs font-medium">{data?.count || 0}</span>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsTab;
