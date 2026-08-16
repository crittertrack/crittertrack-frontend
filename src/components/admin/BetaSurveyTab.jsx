import React, { useState, useEffect, useCallback } from 'react';
import {
    ClipboardList, RefreshCw, Loader2, AlertCircle, Users, CheckCircle,
    Clock, XCircle, Star, MessageSquare, Search, X
} from 'lucide-react';

const QUESTION_LABELS = {
    q1_overallSatisfaction: 'Overall satisfaction',
    q4_appSpeed: 'App speed/responsiveness',
    q5_easeOfNavigation: 'Ease of navigation',
    q6_visualDesign: 'Visual design',
    q11_likelihoodToRecommend: 'Likelihood to recommend',
    q12_likelyToKeepUsing: 'Likely to keep using after beta',
    q2_mostUsedFeature: 'Most-used features',
    q3_mostConfusingFeature: 'Most confusing features',
    q7_primarySpecies: 'Animal types managed',
    q8_primaryDevice: 'Primary device',
    q9_priorSolution: 'What did you use before',
    q10_howHeard: 'How did you hear about us'
};

const STAR_QUESTIONS = [
    'q1_overallSatisfaction', 'q4_appSpeed', 'q5_easeOfNavigation',
    'q6_visualDesign', 'q11_likelihoodToRecommend', 'q12_likelyToKeepUsing'
];
const CHOICE_QUESTIONS = [
    'q2_mostUsedFeature', 'q3_mostConfusingFeature', 'q7_primarySpecies',
    'q8_primaryDevice', 'q9_priorSolution', 'q10_howHeard'
];

const STATUS_CONFIG = {
    pending: { icon: Clock, color: 'yellow', label: 'Pending' },
    skipped: { icon: RefreshCw, color: 'blue', label: 'Skipped' },
    dismissed: { icon: XCircle, color: 'gray', label: 'Dismissed' },
    completed: { icon: CheckCircle, color: 'green', label: 'Completed' }
};

const StatCard = ({ label, value, color = 'gray' }) => {
    const colorClasses = {
        gray: 'text-gray-800 dark:text-dark-text',
        yellow: 'text-yellow-600 dark:text-yellow-400',
        blue: 'text-blue-600 dark:text-dark-info-blue',
        green: 'text-green-600 dark:text-green-400',
        red: 'text-red-600 dark:text-red-400'
    };
    return (
        <div className="bg-white dark:bg-dark-card-bg rounded-xl border border-gray-200 dark:border-dark-border p-4">
            <div className={`text-2xl font-bold ${colorClasses[color]}`}>{value}</div>
            <div className="text-sm text-gray-500 dark:text-dark-text-secondary mt-1">{label}</div>
        </div>
    );
};

const StatusBadge = ({ status }) => {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
    const Icon = config.icon;
    const colorClasses = {
        yellow: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
        blue: 'bg-blue-100 text-blue-700 dark:bg-dark-info-blue/20 dark:text-dark-info-blue',
        gray: 'bg-gray-100 text-gray-600 dark:bg-dark-surface dark:text-dark-text-secondary',
        green: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
    };
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${colorClasses[config.color]}`}>
            <Icon size={12} />
            {config.label}
        </span>
    );
};

const ChoiceBreakdownBar = ({ label, items }) => {
    const maxCount = Math.max(1, ...items.map(i => i.count));
    return (
        <div className="mb-4 last:mb-0">
            <h5 className="text-xs font-semibold text-gray-600 dark:text-dark-text-secondary mb-2">{label}</h5>
            <div className="space-y-1.5">
                {items.length === 0 && (
                    <p className="text-xs text-gray-400 dark:text-dark-text-muted">No answers yet</p>
                )}
                {items.map(item => (
                    <div key={item.choice} className="flex items-center gap-2 text-xs">
                        <span className="w-40 flex-shrink-0 truncate text-gray-700 dark:text-dark-text" title={item.choice}>
                            {item.choice}
                        </span>
                        <div className="flex-1 bg-gray-100 dark:bg-dark-surface rounded-full h-3 overflow-hidden">
                            <div
                                className="bg-accent dark:bg-dark-accent h-3 rounded-full"
                                style={{ width: `${(item.count / maxCount) * 100}%` }}
                            />
                        </div>
                        <span className="w-16 flex-shrink-0 text-right text-gray-500 dark:text-dark-text-secondary">
                            {item.count} ({item.percentage}%)
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const BetaSurveyTab = ({ API_BASE_URL, authToken }) => {
    const [view, setView] = useState('global'); // 'global' | 'per-user'
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedResponse, setSelectedResponse] = useState(null);
    const [responseLoading, setResponseLoading] = useState(false);

    const headers = { Authorization: `Bearer ${authToken}` };

    const fetchGlobalStats = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${API_BASE_URL}/beta-survey/admin/stats`, { headers });
            if (!res.ok) throw new Error(`Failed to fetch stats (${res.status})`);
            setStats(await res.json());
        } catch (err) {
            console.error('Error fetching beta survey stats:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [API_BASE_URL, authToken]);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${API_BASE_URL}/beta-survey/admin/users`, { headers });
            if (!res.ok) throw new Error(`Failed to fetch users (${res.status})`);
            setUsers(await res.json());
        } catch (err) {
            console.error('Error fetching beta survey users:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [API_BASE_URL, authToken]);

    useEffect(() => {
        if (!authToken) return;
        if (view === 'global') fetchGlobalStats();
        else fetchUsers();
    }, [authToken, view, fetchGlobalStats, fetchUsers]);

    const openUserResponse = async (user) => {
        setSelectedUser(user);
        setSelectedResponse(null);
        if (user.betaSurveyStatus !== 'completed') return;
        setResponseLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/beta-survey/admin/response/${user.id_public}`, { headers });
            if (!res.ok) throw new Error('Failed to fetch response');
            setSelectedResponse(await res.json());
        } catch (err) {
            console.error('Error fetching individual response:', err);
        } finally {
            setResponseLoading(false);
        }
    };

    const filteredUsers = users.filter(u => {
        const term = searchTerm.toLowerCase();
        return !term ||
            u.id_public?.toLowerCase().includes(term) ||
            u.personalName?.toLowerCase().includes(term) ||
            u.breederName?.toLowerCase().includes(term);
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                    <ClipboardList size={28} className="text-accent dark:text-dark-accent" />
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-dark-text">Beta Feedback Survey</h2>
                        <p className="text-sm text-gray-500 dark:text-dark-text-secondary">Review beta wrap-up survey results</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex bg-gray-100 dark:bg-dark-surface rounded-lg p-1">
                        <button
                            onClick={() => setView('global')}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                                view === 'global' ? 'bg-white dark:bg-dark-card-bg text-accent dark:text-dark-accent shadow' : 'text-gray-500 dark:text-dark-text-secondary'
                            }`}
                        >
                            Global
                        </button>
                        <button
                            onClick={() => setView('per-user')}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                                view === 'per-user' ? 'bg-white dark:bg-dark-card-bg text-accent dark:text-dark-accent shadow' : 'text-gray-500 dark:text-dark-text-secondary'
                            }`}
                        >
                            Per-user
                        </button>
                    </div>
                    <button
                        onClick={() => (view === 'global' ? fetchGlobalStats() : fetchUsers())}
                        disabled={loading}
                        className="p-2 rounded-lg border border-gray-200 dark:border-dark-border text-gray-500 dark:text-dark-text-secondary hover:bg-gray-50 dark:hover:bg-dark-surface-hover transition"
                        title="Refresh"
                    >
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            {error && (
                <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg p-3 text-sm">
                    <AlertCircle size={16} />
                    {error}
                </div>
            )}

            {loading && (
                <div className="flex items-center justify-center py-16 text-gray-400 dark:text-dark-text-muted">
                    <Loader2 size={28} className="animate-spin" />
                </div>
            )}

            {!loading && view === 'global' && stats && (
                <div className="space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <StatCard label="Pending" value={stats.funnel.pending} color="yellow" />
                        <StatCard label="Skipped" value={stats.funnel.skipped} color="blue" />
                        <StatCard label="Dismissed" value={stats.funnel.dismissed} color="gray" />
                        <StatCard label="Completed" value={stats.funnel.completed} color="green" />
                        <StatCard label="Total Responses" value={stats.totalResponses} />
                    </div>

                    <div className="bg-white dark:bg-dark-card-bg rounded-xl border border-gray-200 dark:border-dark-border p-6">
                        <h4 className="font-bold text-gray-800 dark:text-dark-text mb-4 flex items-center gap-2">
                            <Star size={18} className="text-yellow-400" />
                            Average Ratings
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {STAR_QUESTIONS.map(q => (
                                <div key={q} className="bg-gray-50 dark:bg-dark-surface rounded-lg p-3">
                                    <div className="text-xs text-gray-500 dark:text-dark-text-secondary mb-1">{QUESTION_LABELS[q]}</div>
                                    <div className="text-lg font-bold text-gray-800 dark:text-dark-text">
                                        {stats.starAverages[q] != null ? `${stats.starAverages[q].toFixed(1)} / 5` : '—'}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white dark:bg-dark-card-bg rounded-xl border border-gray-200 dark:border-dark-border p-6">
                        <h4 className="font-bold text-gray-800 dark:text-dark-text mb-4">Multiple Choice Breakdown</h4>
                        {CHOICE_QUESTIONS.map(q => (
                            <ChoiceBreakdownBar key={q} label={QUESTION_LABELS[q]} items={stats.choiceBreakdowns[q] || []} />
                        ))}
                    </div>

                    <div className="bg-white dark:bg-dark-card-bg rounded-xl border border-gray-200 dark:border-dark-border p-6">
                        <h4 className="font-bold text-gray-800 dark:text-dark-text mb-4 flex items-center gap-2">
                            <MessageSquare size={18} className="text-accent dark:text-dark-accent" />
                            Free-Text Answers ({stats.freeTextAnswers.length})
                        </h4>
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                            {stats.freeTextAnswers.length === 0 && (
                                <p className="text-sm text-gray-400 dark:text-dark-text-muted">No free-text answers yet</p>
                            )}
                            {stats.freeTextAnswers.map(answer => (
                                <div key={answer._id} className="border border-gray-100 dark:border-dark-border rounded-lg p-3">
                                    <div className="text-xs font-semibold text-gray-500 dark:text-dark-text-secondary mb-1">
                                        {answer.id_public} · {new Date(answer.createdAt).toLocaleDateString()}
                                    </div>
                                    {answer.q13_bugsIssues && (
                                        <p className="text-sm text-gray-700 dark:text-dark-text"><span className="font-medium">Bugs/issues:</span> {answer.q13_bugsIssues}</p>
                                    )}
                                    {answer.q14_magicWandFeature && (
                                        <p className="text-sm text-gray-700 dark:text-dark-text"><span className="font-medium">Magic wand:</span> {answer.q14_magicWandFeature}</p>
                                    )}
                                    {answer.q15_anythingElse && (
                                        <p className="text-sm text-gray-700 dark:text-dark-text"><span className="font-medium">Anything else:</span> {answer.q15_anythingElse}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {!loading && view === 'per-user' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-dark-card-bg rounded-xl border border-gray-200 dark:border-dark-border p-4">
                        <div className="flex items-center gap-2 mb-3 border border-gray-200 dark:border-dark-border rounded-lg px-3 py-2">
                            <Search size={16} className="text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by CTU ID or name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="flex-1 bg-transparent text-sm text-gray-800 dark:text-dark-text placeholder-gray-400 dark:placeholder-dark-text-muted focus:outline-none"
                            />
                        </div>
                        <div className="overflow-y-auto max-h-[32rem]">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-200 dark:border-dark-border">
                                        <th className="text-left py-2 px-2 font-medium text-gray-500 dark:text-dark-text-secondary">User</th>
                                        <th className="text-center py-2 px-2 font-medium text-gray-500 dark:text-dark-text-secondary">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.map(u => (
                                        <tr
                                            key={u.id_public}
                                            onClick={() => openUserResponse(u)}
                                            className={`border-b border-gray-100 dark:border-dark-border cursor-pointer hover:bg-gray-50 dark:hover:bg-dark-surface-hover transition ${
                                                selectedUser?.id_public === u.id_public ? 'bg-accent/5 dark:bg-dark-accent/10' : ''
                                            }`}
                                        >
                                            <td className="py-2 px-2">
                                                <div className="text-gray-800 dark:text-dark-text font-medium">{u.breederName || u.personalName}</div>
                                                <div className="text-xs text-gray-400 dark:text-dark-text-muted">{u.id_public}</div>
                                            </td>
                                            <td className="py-2 px-2 text-center">
                                                <StatusBadge status={u.betaSurveyStatus} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-dark-card-bg rounded-xl border border-gray-200 dark:border-dark-border p-4">
                        {!selectedUser && (
                            <div className="flex flex-col items-center justify-center h-full py-16 text-gray-400 dark:text-dark-text-muted">
                                <Users size={32} className="mb-2" />
                                <p className="text-sm">Select a user to view their response</p>
                            </div>
                        )}
                        {selectedUser && (
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <div className="font-bold text-gray-800 dark:text-dark-text">{selectedUser.breederName || selectedUser.personalName}</div>
                                        <div className="text-xs text-gray-400 dark:text-dark-text-muted">{selectedUser.id_public}</div>
                                    </div>
                                    <button onClick={() => setSelectedUser(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-dark-text">
                                        <X size={18} />
                                    </button>
                                </div>
                                {responseLoading && <Loader2 size={20} className="animate-spin text-gray-400" />}
                                {!responseLoading && selectedUser.betaSurveyStatus !== 'completed' && (
                                    <p className="text-sm text-gray-400 dark:text-dark-text-muted">
                                        This user hasn't completed the survey (status: {selectedUser.betaSurveyStatus}).
                                    </p>
                                )}
                                {!responseLoading && selectedResponse && (
                                    <div className="space-y-3 max-h-[28rem] overflow-y-auto">
                                        {[...STAR_QUESTIONS, ...CHOICE_QUESTIONS].map(q => (
                                            selectedResponse[q] != null && !(Array.isArray(selectedResponse[q]) && selectedResponse[q].length === 0) && (
                                                <div key={q} className="text-sm">
                                                    <span className="text-gray-500 dark:text-dark-text-secondary">{QUESTION_LABELS[q]}: </span>
                                                    <span className="text-gray-800 dark:text-dark-text font-medium">
                                                        {STAR_QUESTIONS.includes(q)
                                                            ? `${selectedResponse[q]} / 5`
                                                            : Array.isArray(selectedResponse[q])
                                                                ? selectedResponse[q].join(', ')
                                                                : selectedResponse[q]}
                                                    </span>
                                                </div>
                                            )
                                        ))}
                                        {selectedResponse.q9_priorSolutionOther && (
                                            <div className="text-sm">
                                                <span className="text-gray-500 dark:text-dark-text-secondary">Which app: </span>
                                                <span className="text-gray-800 dark:text-dark-text font-medium">{selectedResponse.q9_priorSolutionOther}</span>
                                            </div>
                                        )}
                                        {selectedResponse.q13_bugsIssues && (
                                            <div className="text-sm"><span className="text-gray-500 dark:text-dark-text-secondary block mb-1">Bugs/issues:</span> {selectedResponse.q13_bugsIssues}</div>
                                        )}
                                        {selectedResponse.q14_magicWandFeature && (
                                            <div className="text-sm"><span className="text-gray-500 dark:text-dark-text-secondary block mb-1">Magic wand:</span> {selectedResponse.q14_magicWandFeature}</div>
                                        )}
                                        {selectedResponse.q15_anythingElse && (
                                            <div className="text-sm"><span className="text-gray-500 dark:text-dark-text-secondary block mb-1">Anything else:</span> {selectedResponse.q15_anythingElse}</div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default BetaSurveyTab;
