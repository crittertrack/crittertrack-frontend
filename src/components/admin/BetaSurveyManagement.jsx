import React, { useState, useEffect } from 'react';
import { Loader2, RefreshCw, Download, Search, ChevronDown, ChevronUp, Eye } from 'lucide-react';
import axios from 'axios';

const BetaSurveyManagement = ({ authToken, API_BASE_URL }) => {
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState(null);
    const [allResponses, setAllResponses] = useState([]);
    const [showResponses, setShowResponses] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedResponse, setExpandedResponse] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchSurveyData();
    }, []);

    const fetchSurveyData = async () => {
        try {
            setLoading(true);
            setError('');

            // Fetch stats and responses in parallel
            const [statsRes, responsesRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/api/surveys/beta-survey/stats`, {
                    headers: { Authorization: `Bearer ${authToken}` }
                }),
                axios.get(`${API_BASE_URL}/api/surveys/beta-survey/all`, {
                    headers: { Authorization: `Bearer ${authToken}` }
                })
            ]);

            setStats(statsRes.data);
            setAllResponses(responsesRes.data);
        } catch (err) {
    console.error('FULL SURVEY ERROR:', err);
    console.error('Response:', err.response);
    console.error('Data:', err.response?.data);

    setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Failed to load survey data'
    );
}

    const downloadAsCSV = () => {
        if (!allResponses.length) return;

        const headers = [
            'Username', 'CTUID', 'Email', 'Date Submitted',
            'Q1: Overall Satisfaction', 'Q2: Visual Design',
            'Q3: Primary Use', 'Q4: Features Used',
            'Q5: Find Animals', 'Q6: Litter & Family Tree',
            'Q7: Genetics Tools', 'Q8: Animal Profile Clarity',
            'Q9: Litter Tracking', 'Q10: Ownership Management',
            'Q11: Profile Settings', 'Q12: Breeder Directory',
            'Q13: Visibility Comfort', 'Q14: Marketplace Utility',
            'Q15: Improvements'
        ];

        const rows = allResponses.map(response => [
            response.userName,
            response.userIdPublic,
            response.userEmail,
            new Date(response.createdAt).toLocaleDateString(),
            response.q1_overall_satisfaction,
            response.q2_visual_design,
            Array.isArray(response.q3_primary_use) ? response.q3_primary_use.join('; ') : '',
            Array.isArray(response.q4_features_used) ? response.q4_features_used.join('; ') : '',
            response.q5_find_animals,
            response.q6_litter_family_tree,
            response.q7_genetics_tools,
            response.q8_animal_profile_clarity,
            response.q9_litter_tracking,
            response.q10_ownership_management,
            response.q11_profile_settings,
            response.q12_breeder_directory,
            response.q13_visibility_comfort,
            response.q14_marketplace_utility,
            response.q15_improvements || ''
        ]);

        const csv = [
            headers.join(','),
            ...rows.map(row => row.map(cell => {
                const str = String(cell || '');
                return `"${str.replace(/"/g, '""')}"`;
            }).join(','))
        ].join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `beta-survey-responses-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    };

    const SCALE_LABELS = {
        'q1': ['Very Dissatisfied', 'Dissatisfied', 'Neutral', 'Satisfied', 'Very Satisfied'],
        'q2': ['Very Dissatisfied', 'Dissatisfied', 'Neutral', 'Satisfied', 'Very Satisfied'],
        'q5': ['Very Difficult', 'Difficult', 'Neutral', 'Easy', 'Very Easy'],
        'q6': ['Very Difficult', 'Difficult', 'Neutral', 'Easy', 'Very Easy'],
        'q7': ['Not Useful', 'Slightly Useful', 'Moderately Useful', 'Useful', 'Very Useful'],
        'q8': ['Very Unclear', 'Unclear', 'Neutral', 'Clear', 'Very Clear'],
        'q9': ['Not Well', 'Somewhat', 'Neutral', 'Well', 'Very Well'],
        'q10': ['Not Well', 'Somewhat', 'Neutral', 'Well', 'Very Well'],
        'q11': ['Very Hard', 'Hard', 'Neutral', 'Easy', 'Very Easy'],
        'q12': ['Not Helpful', 'Slightly Helpful', 'Moderately Helpful', 'Helpful', 'Very Helpful'],
        'q13': ['Very Uncomfortable', 'Uncomfortable', 'Neutral', 'Comfortable', 'Very Comfortable'],
        'q14': ['Not Useful', 'Slightly Useful', 'Moderately Useful', 'Useful', 'Very Useful']
    };

    const getScaleLabel = (questionNum, value) => {
        const key = `q${questionNum}`;
        const labels = SCALE_LABELS[key] || [];
        return labels[value - 1] || `${value}/5`;
    };

    const filteredResponses = allResponses.filter(response =>
        response.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        response.userIdPublic.toLowerCase().includes(searchTerm.toLowerCase()) ||
        response.userEmail.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading && !stats) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 size={32} className="animate-spin text-purple-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Beta Survey Management</h2>
                    <p className="text-sm text-gray-600 mt-1">Track and analyze user feedback from the beta survey</p>
                </div>
                <button
                    onClick={fetchSurveyData}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
                >
                    <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                    Refresh
                </button>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                </div>
            )}

            {stats && (
                <>
                    {/* Overall Statistics */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Overall Statistics</h3>
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                                <p className="text-sm text-gray-600">Total Responses</p>
                                <p className="text-3xl font-bold text-purple-600">{stats.totalResponses}</p>
                            </div>
                            {stats.stats?.scaleAverages && (
                                <>
                                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                        <p className="text-sm text-gray-600">Avg Overall Satisfaction</p>
                                        <p className="text-3xl font-bold text-blue-600">
                                            {stats.stats.scaleAverages.avg_q1?.toFixed(2) || 'N/A'}
                                        </p>
                                    </div>
                                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                                        <p className="text-sm text-gray-600">Avg Visual Design</p>
                                        <p className="text-3xl font-bold text-green-600">
                                            {stats.stats.scaleAverages.avg_q2?.toFixed(2) || 'N/A'}
                                        </p>
                                    </div>
                                    <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                                        <p className="text-sm text-gray-600">Avg Animal Access</p>
                                        <p className="text-3xl font-bold text-indigo-600">
                                            {stats.stats.scaleAverages.avg_q5?.toFixed(2) || 'N/A'}
                                        </p>
                                    </div>
                                    <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                                        <p className="text-sm text-gray-600">Avg Litter Tracking</p>
                                        <p className="text-3xl font-bold text-orange-600">
                                            {stats.stats.scaleAverages.avg_q9?.toFixed(2) || 'N/A'}
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Scale Question Distributions */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Scale Question Distributions</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[1, 2, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map(questionNum => {
                                const distKey = `q${questionNum}_distribution`;
                                const distribution = stats.stats?.[distKey] || [];
                                const questionTitles = {
                                    1: 'Overall Satisfaction',
                                    2: 'Visual Design',
                                    5: 'Find Animals',
                                    6: 'Litter & Family Tree',
                                    7: 'Genetics Tools',
                                    8: 'Animal Profile Clarity',
                                    9: 'Litter Tracking',
                                    10: 'Ownership Management',
                                    11: 'Profile Settings',
                                    12: 'Breeder Directory',
                                    13: 'Visibility Comfort',
                                    14: 'Marketplace Utility'
                                };

                                return (
                                    <div key={questionNum} className="border border-gray-200 rounded-lg p-4">
                                        <h4 className="font-medium text-gray-800 mb-3 text-sm">Q{questionNum}: {questionTitles[questionNum]}</h4>
                                        <div className="space-y-2">
                                            {distribution.map((item, idx) => (
                                                <div key={idx} className="flex items-center gap-2">
                                                    <div className="w-20 text-xs text-gray-600 font-medium">
                                                        {getScaleLabel(questionNum, item.value)}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
                                                            <div
                                                                className="bg-purple-600 h-full flex items-center justify-end pr-2 text-white text-xs font-semibold transition-all duration-300"
                                                                style={{ width: `${item.percentage}%` }}
                                                            >
                                                                {item.percentage > 5 && `${item.percentage}%`}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="w-16 text-right text-xs text-gray-600">
                                                        {item.count} ({item.percentage}%)
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Multiple Choice Distributions */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Primary Use & Features Used</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Q3 */}
                            <div className="border border-gray-200 rounded-lg p-4">
                                <h4 className="font-medium text-gray-800 mb-3 text-sm">Q3: What do you use the website most for?</h4>
                                <div className="space-y-2">
                                    {stats.stats?.q3_choices?.map((choice, idx) => (
                                        <div key={idx} className="flex items-center justify-between text-sm">
                                            <span className="text-gray-700">{choice.choice}</span>
                                            <div className="flex items-center gap-2">
                                                <div className="w-24 bg-gray-200 rounded-full h-4 overflow-hidden">
                                                    <div
                                                        className="bg-blue-600 h-full transition-all duration-300"
                                                        style={{ width: `${choice.percentage}%` }}
                                                    />
                                                </div>
                                                <span className="text-gray-600 w-20 text-right">{choice.count} ({choice.percentage}%)</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Q4 */}
                            <div className="border border-gray-200 rounded-lg p-4">
                                <h4 className="font-medium text-gray-800 mb-3 text-sm">Q4: Which features do you use most often?</h4>
                                <div className="space-y-2 max-h-60 overflow-y-auto">
                                    {stats.stats?.q4_choices?.map((choice, idx) => (
                                        <div key={idx} className="flex items-center justify-between text-sm">
                                            <span className="text-gray-700 flex-1">{choice.choice}</span>
                                            <div className="flex items-center gap-2">
                                                <div className="w-24 bg-gray-200 rounded-full h-4 overflow-hidden">
                                                    <div
                                                        className="bg-green-600 h-full transition-all duration-300"
                                                        style={{ width: `${choice.percentage}%` }}
                                                    />
                                                </div>
                                                <span className="text-gray-600 w-20 text-right">{choice.count} ({choice.percentage}%)</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Individual Responses */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-800">Individual Responses</h3>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setShowResponses(!showResponses)}
                                    className={`px-4 py-2 rounded-lg transition ${
                                        showResponses
                                            ? 'bg-purple-600 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    {showResponses ? 'Hide' : 'Show'} Responses
                                </button>
                                <button
                                    onClick={downloadAsCSV}
                                    disabled={!filteredResponses.length}
                                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                                >
                                    <Download size={16} />
                                    Download CSV
                                </button>
                            </div>
                        </div>

                        {showResponses && (
                            <>
                                <div className="mb-4">
                                    <input
                                        type="text"
                                        placeholder="Search by name, CTUID, or email..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    />
                                </div>

                                <div className="space-y-2 max-h-96 overflow-y-auto">
                                    {filteredResponses.map((response, idx) => (
                                        <div key={response._id} className="border border-gray-200 rounded-lg">
                                            <button
                                                onClick={() => setExpandedResponse(expandedResponse === response._id ? null : response._id)}
                                                className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition"
                                            >
                                                <div className="flex items-center gap-3 flex-1 text-left">
                                                    <div className="min-w-fit">
                                                        <p className="font-medium text-gray-800">{response.userName}</p>
                                                        <p className="text-xs text-gray-600">{response.userIdPublic} · {response.userEmail}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-gray-600">
                                                        {new Date(response.createdAt).toLocaleDateString()}
                                                    </span>
                                                    {expandedResponse === response._id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                                </div>
                                            </button>

                                            {expandedResponse === response._id && (
                                                <div className="bg-gray-50 px-3 py-3 border-t border-gray-200 space-y-2 text-sm">
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <div>
                                                            <p className="text-xs font-semibold text-gray-600">Overall Satisfaction</p>
                                                            <p className="text-gray-800">{getScaleLabel(1, response.q1_overall_satisfaction)}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-semibold text-gray-600">Visual Design</p>
                                                            <p className="text-gray-800">{getScaleLabel(2, response.q2_visual_design)}</p>
                                                        </div>
                                                        {[5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map(q => {
                                                            const key = `q${q}_litter_family_tree`;
                                                            const value = response[`q${q}_${key.split('_').slice(1).join('_')}`];
                                                            return null;
                                                        })}
                                                    </div>
                                                    {response.q15_improvements && (
                                                        <div>
                                                            <p className="text-xs font-semibold text-gray-600 mb-1">Improvements Suggestion</p>
                                                            <p className="text-gray-800 bg-white p-2 rounded border border-gray-200 max-h-32 overflow-y-auto">
                                                                {response.q15_improvements}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {!filteredResponses.length && (
                                    <div className="text-center py-8 text-gray-500">
                                        No responses match your search
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default BetaSurveyManagement;}
