import React, { useEffect, useMemo, useState } from 'react';
import { 
    AlertCircle, RefreshCw, Search, Filter, Clock, CheckCircle, 
    Loader2, Flag, Calendar, Tag, Eye, ChevronUp, ChevronDown,
    Briefcase, Trash2
} from 'lucide-react';
import './ModOversightPanel.css';

const REPORT_TYPES = [
    { value: 'all', label: 'All Types' },
    { value: 'profile', label: 'Profiles' },
    { value: 'animal', label: 'Animals' },
    { value: 'message', label: 'Messages' },
    { value: 'rating', label: 'Ratings' },
    { value: 'bug', label: 'Bug Reports' }
];

const STATUS_FILTERS = [
    { value: 'all', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'reviewed', label: 'Reviewed' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'resolved', label: 'Resolved' },
    { value: 'dismissed', label: 'Dismissed' }
];

const DATE_PRESETS = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: '7days', label: 'Last 7 Days' },
    { value: '30days', label: 'Last 30 Days' }
];

const STATUS_BADGE_COLORS = {
    pending: '#ff6f00',
    in_progress: '#9c27b0',
    reviewed: '#1976d2',
    resolved: '#388e3c',
    dismissed: '#757575'
};

const CATEGORY_BADGE_COLORS = {
    'Inappropriate/Offensive Content': '#f44336',
    'Harassment or Bullying': '#e91e63',
    'Spam': '#ff9800',
    'Copyright/Licensing Violation': '#9c27b0',
    'Community Guidelines Violation': '#2196f3',
    Bug: '#d32f2f',
    'Feature Request': '#00897b',
    'General Feedback': '#5c6bc0',
    Other: '#757575'
};

const parseReason = (reason = '') => {
    if (!reason) {
        return {
            categoryLabel: 'Report',
            fieldLabel: '',
            description: ''
        };
    }

    const [headerPart, detailPart] = reason.split('::').map((part) => part?.trim() || '');
    const [categoryLabel = 'Report', fieldLabel = ''] = (headerPart || '').split('·').map((part) => part?.trim() || '');

    return {
        categoryLabel: categoryLabel || 'Report',
        fieldLabel,
        description: detailPart || reason
    };
};

const formatReporter = (report = {}) => {
    const reporter = report.reporterId || {};
    const name = reporter.personalName || reporter.breederName || null;
    const ctu = reporter.id_public ? `${reporter.id_public}` : null;
    const email = reporter.email || null;
    
    if (name && ctu && email) {
        return `${name} (${ctu}) · ${email}`;
    } else if (name && ctu) {
        return `${name} (${ctu})`;
    } else if (name && email) {
        return `${name} · ${email}`;
    } else {
        return ctu || email || 'Unknown';
    }
};

const getSubjectTitle = (report = {}) => {
    if (report._reportType === 'bug') {
        return `${report.category || 'Bug'} Report`;
    }

    if (report.ratingId) {
        const r = report.ratingId;
        const rater = r.raterName || r.raterId_public || 'Unknown';
        return `Rating · ★${r.score ?? '?'} by ${rater}`;
    }

    if (report.reportedAnimalId) {
        const animal = report.reportedAnimalId;
        return `Animal · ${animal.name || animal.id_public || 'Unknown'}`;
    }

    if (report.reportedUserId && !report.messageId && !report.conversationMessages?.length) {
        const user = report.reportedUserId;
        const name = user.personalName || user.breederName || user.email;
        return `Profile · ${name || user.id_public || 'Unknown'}`;
    }

    if (report.conversationMessages?.length > 0) {
        return `Conversation · ${report.conversationMessages.length} messages`;
    }

    if (report.messageId) {
        return 'Direct Message';
    }

    if (report.reportedUserId) {
        const user = report.reportedUserId;
        const name = user.personalName || user.breederName || user.email;
        return `Profile · ${name || user.id_public || 'Unknown'}`;
    }

    return 'Report';
};

const getSubjectOwner = (report = {}) => {
    if (report._reportType === 'bug') {
        return report.page ? `Page: ${report.page}` : 'App Feedback';
    }

    if (report.ratingId) {
        const targetId = report.targetId_public || report.ratingId?.targetId_public;
        return targetId ? `Breeder: ${targetId}` : 'Unknown breeder';
    }

    if (report.reportedAnimalId) {
        const owner = report.reportedAnimalId.creatorId;
        if (owner && typeof owner === 'object') {
            const name = owner.personalName || owner.breederName;
            const ctu = owner.id_public;
            if (name && ctu) return `${name} (${ctu})`;
            if (ctu) return ctu;
            if (name) return name;
            return owner.email || 'Unknown owner';
        }
        return 'Unknown owner';
    }

    if (report.reportedUserId) {
        const user = report.reportedUserId;
        const name = user.personalName || null;
        const breederName = user.breederName || null;
        const ctu = user.id_public || null;
        const email = user.email || null;
        
        if (name && ctu) {
            return `${name} (${ctu})`;
        } else if (ctu) {
            return ctu;
        } else if (name) {
            return `${name} · ${email || 'No ID'}`;
        } else {
            return email || 'Unknown owner';
        }
    }

    return 'Unknown owner';
};

const getContentOwnerDetails = (report = {}) => {
    if (report.reportedAnimalId?.creatorId && typeof report.reportedAnimalId.creatorId === 'object') {
        const owner = report.reportedAnimalId.creatorId;
        return {
            personalName: owner.personalName || null,
            breederName: owner.breederName || null,
            ctu: owner.id_public || null,
            email: owner.email || null,
            profileImage: owner.profileImage || null,
            bio: null,
            websiteUrl: null
        };
    }
    if (report.reportedUserId) {
        const user = report.reportedUserId;
        return {
            personalName: user.personalName || null,
            breederName: user.breederName || null,
            ctu: user.id_public || null,
            email: user.email || null,
            profileImage: user.profileImage || null,
            bio: user.bio || null,
            websiteUrl: user.websiteUrl || null
        };
    }
    return null;
};

const getAnimalDetails = (report = {}) => {
    if (report.reportedAnimalId) {
        const animal = report.reportedAnimalId;
        return {
            // Basic Info
            name: animal.name || null,
            id_public: animal.id_public || null,
            prefix: animal.prefix || null,
            suffix: animal.suffix || null,
            breederAssignedId: animal.breederAssignedId || null,
            species: animal.species || null,
            gender: animal.gender || null,
            status: animal.status || null,
            birthDate: animal.birthDate || null,
            
            // Image
            imageUrl: animal.imageUrl || null,
            
            // Description/Notes
            remarks: animal.remarks || null,
            geneticCode: animal.geneticCode || null,
            
            // Physical Info
            color: animal.color || null,
            coat: animal.coat || null,
            coatPattern: animal.coatPattern || null,
            earset: animal.earset || null,
            breed: animal.breed || null,
            strain: animal.strain || null,
            
            // Identification
            microchipNumber: animal.microchipNumber || null,
            pedigreeRegistrationId: animal.pedigreeRegistrationId || null,
            
            // Breeding/Fertility
            fertilityNotes: animal.fertilityNotes || null,
            damFertilityNotes: animal.damFertilityNotes || null,
            
            // Behavior
            temperament: animal.temperament || null,
            
            // End of Life
            causeOfDeath: animal.causeOfDeath || null,
            necropsyResults: animal.necropsyResults || null
        };
    }
    return null;
};

export default function ModOversightPanel({ 
    isOpen, 
    onClose, 
    API_BASE_URL, 
    authToken,
    onActionTaken,
    embedded = false,  // New prop to indicate if this is embedded in AdminPanel
    currentUserId = null  // Current user's ID for "assigned to me" filter
}) {
    const [reports, setReports] = useState([]);
    const [selectedReport, setSelectedReport] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [reportType, setReportType] = useState('all');
    const [datePreset, setDatePreset] = useState('all');
    const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
    const [adminNotes, setAdminNotes] = useState(''); // Feedback note shown to the reporting user
    const [actionLoading, setActionLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteReportLoading, setDeleteReportLoading] = useState(false);

    // Warn / Inform state
    const [userActionModal, setUserActionModal] = useState(null); // { mode: 'warn'|'inform', userId, userName }
    const [userActionText, setUserActionText] = useState('');
    const [userActionLoading, setUserActionLoading] = useState(false);
    const [userActionSuccess, setUserActionSuccess] = useState('');

    // Global stats (all report types, all statuses, unaffected by pagination/filters)
    const [globalStats, setGlobalStats] = useState(null);

    const baseUrl = useMemo(() => API_BASE_URL || '/api', [API_BASE_URL]);

    // Calculate date range from preset
    const getDateFilter = () => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        switch (datePreset) {
            case 'today':
                return today;
            case '7days':
                const week = new Date(today);
                week.setDate(week.getDate() - 7);
                return week;
            case '30days':
                const month = new Date(today);
                month.setDate(month.getDate() - 30);
                return month;
            default:
                return null;
        }
    };

    const handleSort = (key) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
        }));
    };

    const getSortIcon = (key) => {
        if (sortConfig.key !== key) return null;
        return sortConfig.direction === 'asc' ? 
            <ChevronUp size={12} className="sort-icon" /> : 
            <ChevronDown size={12} className="sort-icon" />;
    };

    // Fetch reports on load
    useEffect(() => {
        if (isOpen) {
            fetchReports();
            fetchGlobalStats();
        }
    }, [isOpen, statusFilter, reportType]);

    const fetchGlobalStats = async () => {
        if (!authToken) return;
        try {
            const res = await fetch(`${baseUrl}/moderation/reports/stats`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            if (res.ok) {
                const data = await res.json();
                setGlobalStats(data);
            }
        } catch (err) {
            console.error('[ModOversightPanel] Error fetching global stats:', err);
        }
    };

    const fetchReports = async () => {
        if (!authToken) {
            setError('Moderator authentication required');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const params = new URLSearchParams({
                limit: '100'
            });

            // If "all" types, don't send type param - fetch all types
            if (reportType !== 'all') {
                params.append('type', reportType);
            }

            if (statusFilter !== 'all') {
                params.append('status', statusFilter);
            }

            const url = `${baseUrl}/moderation/reports?${params.toString()}`;
            console.log('[ModOversightPanel] Fetching reports from:', url, 'with reportType:', reportType, 'statusFilter:', statusFilter);

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });

            const data = await response.json();

            console.log('[ModOversightPanel] Response status:', response.status, 'Data:', data);

            if (!response.ok) {
                throw new Error(data.message || data.error || 'Failed to fetch reports');
            }

            console.log('[ModOversightPanel] Successfully fetched', (data.reports || []).length, 'reports');
            setReports(data.reports || []);
            if (selectedReport) {
                const refreshedSelection = (data.reports || []).find((report) => report._id === selectedReport._id);
                if (refreshedSelection) {
                    setSelectedReport(refreshedSelection);
                    setAdminNotes(refreshedSelection.adminNotes || '');
                }
            }
        } catch (err) {
            console.error('[ModOversightPanel] Error fetching reports:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Get report type from report object
    const getReportType = (report) => {
        if (report._reportType) return report._reportType;
        if (report.ratingId) return 'rating';
        if (report.messageId || report.conversationMessages?.length > 0) return 'message';
        if (report.reportedAnimalId) return 'animal';
        return 'profile';
    };

    // Returns { userId, userName } for the content owner of a report
    const getContentOwnerUserInfo = (report) => {
        if (report.reportedAnimalId?.creatorId && typeof report.reportedAnimalId.creatorId === 'object') {
            const o = report.reportedAnimalId.creatorId;
            return { userId: o._id, userName: o.breederName || o.personalName || o.id_public || 'Unknown' };
        }
        if (report.reportedUserId && typeof report.reportedUserId === 'object') {
            const u = report.reportedUserId;
            return { userId: u._id, userName: u.breederName || u.personalName || u.id_public || 'Unknown' };
        }
        return null;
    };

    const openUserActionModal = (mode) => {
        const info = getContentOwnerUserInfo(selectedReport);
        if (!info) return;
        // Build a subject description from the report
        let subject = null;
        if (selectedReport) {
            const type = getReportType(selectedReport);
            if (type === 'animal' && selectedReport.reportedAnimalId) {
                const a = selectedReport.reportedAnimalId;
                const parts = [a.prefix, a.name, a.suffix].filter(Boolean).join(' ');
                subject = a.id_public ? `${parts} (${a.id_public})` : parts;
            } else if (type === 'profile' && selectedReport.reportedUserId) {
                const u = selectedReport.reportedUserId;
                const name = u.breederName || u.personalName || u.email || '';
                subject = u.id_public ? `${name} (${u.id_public}) — profile` : `${name} — profile`;
            } else if (type === 'rating') {
                subject = 'Your breeder rating';
            } else if (type === 'message') {
                subject = 'A message/conversation';
            }
        }
        setUserActionModal({ mode, ...info, subject });
        setUserActionText('');
        setUserActionSuccess('');
    };

    const handleUserAction = async () => {
        if (!userActionModal || !userActionText.trim()) return;
        setUserActionLoading(true);
        setUserActionSuccess('');
        setError('');
        try {
            if (userActionModal.mode === 'warn') {
                const res = await fetch(`${baseUrl}/moderation/users/${userActionModal.userId}/warn`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
                    body: JSON.stringify({ reason: userActionText, category: 'report_action', subject: userActionModal.subject || null })
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.message || 'Failed to warn user');
                setUserActionSuccess(`Warning issued. Total active warnings: ${data.warningCount}`);
            } else {
                const res = await fetch(`${baseUrl}/moderation/users/${userActionModal.userId}/inform`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
                    body: JSON.stringify({ message: userActionText, subject: userActionModal.subject || null })
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.message || data.error || 'Failed to send notice');
                setUserActionSuccess('Notice sent successfully.');
            }
            setUserActionText('');
        } catch (err) {
            setError(err.message);
        } finally {
            setUserActionLoading(false);
        }
    };

    // Calculate stats (from loaded reports — used for filtered list context)
    const stats = useMemo(() => ({
        total: globalStats?.total ?? reports.length,
        pending: globalStats?.pending ?? reports.filter(r => r.status === 'pending').length,
        inProgress: globalStats?.in_progress ?? reports.filter(r => r.status === 'in_progress').length,
        reviewed: globalStats?.reviewed ?? reports.filter(r => r.status === 'reviewed').length,
        resolved: globalStats?.resolved ?? reports.filter(r => r.status === 'resolved').length,
        dismissed: globalStats?.dismissed ?? reports.filter(r => r.status === 'dismissed').length
    }), [reports, globalStats]);

    // Filter reports by search term, date, and sort
    const filteredReports = useMemo(() => {
        let filtered = reports;
        
        // Apply date filter
        const dateFilter = getDateFilter();
        if (dateFilter) {
            filtered = filtered.filter(report => {
                const reportDate = new Date(report.createdAt);
                return reportDate >= dateFilter;
            });
        }
        
        // Apply search filter
        if (searchTerm.trim()) {
            const search = searchTerm.toLowerCase();
            filtered = filtered.filter(report => {
                const reasonMeta = parseReason(report.reason);
                const subjectTitle = getSubjectTitle(report).toLowerCase();
                const owner = getSubjectOwner(report).toLowerCase();
                const reporter = formatReporter(report).toLowerCase();
                const category = reasonMeta.categoryLabel.toLowerCase();
                const description = (reasonMeta.description || '').toLowerCase();
                
                return subjectTitle.includes(search) ||
                       owner.includes(search) ||
                       reporter.includes(search) ||
                       category.includes(search) ||
                       description.includes(search);
            });
        }
        
        // Apply sorting
        filtered = [...filtered].sort((a, b) => {
            const { key, direction } = sortConfig;
            let aVal, bVal;
            
            if (key === 'createdAt') {
                aVal = new Date(a.createdAt || 0).getTime();
                bVal = new Date(b.createdAt || 0).getTime();
            } else if (key === 'status') {
                aVal = a.status || '';
                bVal = b.status || '';
            } else if (key === 'category') {
                aVal = parseReason(a.reason).categoryLabel.toLowerCase();
                bVal = parseReason(b.reason).categoryLabel.toLowerCase();
            } else {
                aVal = a[key] || '';
                bVal = b[key] || '';
            }
            
            if (aVal < bVal) return direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return direction === 'asc' ? 1 : -1;
            return 0;
        });
        
        return filtered;
    }, [reports, searchTerm, datePreset, sortConfig, currentUserId]);

    const handleUpdateStatus = async (nextStatus) => {
        if (!selectedReport || !nextStatus) return;
        
        console.log('[ModOversightPanel] Updating status:', { 
            nextStatus, 
            type: typeof nextStatus,
            reportId: selectedReport._id,
            reportType 
        });
        
        setActionLoading(true);
        setError('');

        try {
            // Determine the actual report type from the report itself
            let actualType = reportType;
            if (reportType === 'all') {
                // Use _reportType first (reliably set by backend when fetching all types),
                // then fall back to field inspection via the shared getReportType helper.
                actualType = getReportType(selectedReport);
            }

            const requestBody = {
                status: nextStatus,
                adminNotes: adminNotes.trim() || undefined
            };
            
            console.log('[ModOversightPanel] Request details:', {
                url: `${baseUrl}/moderation/reports/${actualType}/${selectedReport._id}/status`,
                body: requestBody,
                statusValue: nextStatus,
                statusType: typeof nextStatus,
                statusLength: nextStatus?.length,
                statusCharCodes: Array.from(nextStatus || '').map(c => c.charCodeAt(0))
            });

            const response = await fetch(
                `${baseUrl}/moderation/reports/${actualType}/${selectedReport._id}/status`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authToken}`
                    },
                    body: JSON.stringify(requestBody)
                }
            );

            const data = await response.json();
            
            console.log('[ModOversightPanel] Response:', { 
                ok: response.ok, 
                status: response.status, 
                data 
            });

            if (!response.ok) {
                console.error('[ModOversightPanel] Update failed:', data);
                throw new Error(data.message || data.error || 'Failed to update report');
            }

            // Refresh the list and close the report detail view
            await fetchReports();
            fetchGlobalStats();
            setSelectedReport(null);
            setAdminNotes('');
            if (onActionTaken) onActionTaken();
        } catch (err) {
            setError(err.message);
        } finally {
            setActionLoading(false);
        }
    };

    const getCategoryBadgeColor = (label) => CATEGORY_BADGE_COLORS[label] || CATEGORY_BADGE_COLORS.Other;
    const getStatusBadgeColor = (status) => STATUS_BADGE_COLORS[status] || '#666';

    const handleSelectReport = (report) => {
        setSelectedReport(report);
        setAdminNotes(report?.adminNotes || '');
    };

    // Permanently delete an entire report
    const handleDeleteReport = async (report) => {
        if (!report) return;
        if (!window.confirm('Permanently delete this report? This cannot be undone.')) return;

        setDeleteReportLoading(true);
        setError('');
        try {
            const type = getReportType(report);
            const response = await fetch(
                `${baseUrl}/moderation/reports/${type}/${report._id}`,
                {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${authToken}`
                    }
                }
            );

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to delete report');

            if (selectedReport?._id === report._id) {
                setSelectedReport(null);
                setAdminNotes('');
            }
            await fetchReports();
            if (onActionTaken) onActionTaken();
        } catch (err) {
            setError(err.message);
        } finally {
            setDeleteReportLoading(false);
        }
    };

    const parsedSelectedReason = useMemo(
        () => (selectedReport ? parseReason(selectedReport.reason) : null),
        [selectedReport]
    );

    if (!isOpen) return null;

    const containerClass = embedded ? 'mod-panel-embedded' : 'mod-panel';

    // Status badge component
    const StatusBadge = ({ status }) => {
        const statusConfig = {
            pending: { icon: Clock, color: 'yellow', label: 'Pending' },
            in_progress: { icon: Briefcase, color: 'purple', label: 'In Progress' },
            reviewed: { icon: Eye, color: 'blue', label: 'Reviewed' },
            resolved: { icon: CheckCircle, color: 'green', label: 'Resolved' },
            dismissed: { icon: CheckCircle, color: 'gray', label: 'Dismissed' }
        };
        
        const config = statusConfig[status] || statusConfig.pending;
        const Icon = config.icon;
        
        return (
            <span className={`report-status-badge report-status-${config.color}`}>
                <Icon size={14} />
                {config.label}
            </span>
        );
    };

    return (
        <div className={containerClass}>
            {!embedded && (
                <div className="mod-panel-header">
                    <h3>Moderation Oversight</h3>
                    <button 
                        className="mod-close-button"
                        onClick={onClose}
                        title="Exit Moderation Mode"
                    >
                        ✕
                    </button>
                </div>
            )}

            <div className="mod-panel-content">
                {/* Header with title and refresh */}
                <div className="reports-header">
                    <div className="reports-title">
                        <Flag size={28} />
                        <div>
                            <h2>Reports & Bug Reports</h2>
                            <p>Review and manage user-submitted reports and bug reports</p>
                        </div>
                    </div>
                    <button 
                        className="reports-refresh-btn"
                        onClick={fetchReports}
                        disabled={loading}
                    >
                        <RefreshCw size={18} className={loading ? 'spin' : ''} />
                        Refresh
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="reports-stats-grid">
                    <div className="reports-stat-card">
                        <div className="reports-stat-value">{stats.total}</div>
                        <div className="reports-stat-label">Total</div>
                    </div>
                    <div className="reports-stat-card reports-stat-yellow">
                        <div className="reports-stat-value">{stats.pending}</div>
                        <div className="reports-stat-label">Pending</div>
                    </div>
                    <div className="reports-stat-card reports-stat-blue">
                        <div className="reports-stat-value">{stats.reviewed}</div>
                        <div className="reports-stat-label">Reviewed</div>
                    </div>
                    <div className="reports-stat-card reports-stat-purple">
                        <div className="reports-stat-value">{stats.inProgress}</div>
                        <div className="reports-stat-label">In Progress</div>
                    </div>
                    <div className="reports-stat-card reports-stat-green">
                        <div className="reports-stat-value">{stats.resolved}</div>
                        <div className="reports-stat-label">Resolved</div>
                    </div>
                    <div className="reports-stat-card reports-stat-gray">
                        <div className="reports-stat-value">{stats.dismissed}</div>
                        <div className="reports-stat-label">Dismissed</div>
                    </div>
                </div>

                {/* Filters */}
                <div className="reports-filters">
                    <div className="reports-search-box">
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="Search reports..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="reports-filter-group">
                        <Filter size={18} />
                        <select 
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            {STATUS_FILTERS.map(s => (
                                <option key={s.value} value={s.value}>{s.label}</option>
                            ))}
                        </select>
                    </div>
                    <div className="reports-filter-group">
                        <Tag size={18} />
                        <select 
                            value={reportType}
                            onChange={(e) => {
                                setReportType(e.target.value);
                                setSelectedReport(null);
                            }}
                        >
                            {REPORT_TYPES.map(t => (
                                <option key={t.value} value={t.value}>{t.label}</option>
                            ))}
                        </select>
                    </div>
                    <div className="reports-filter-group">
                        <Clock size={18} />
                        <select 
                            value={datePreset}
                            onChange={(e) => setDatePreset(e.target.value)}
                        >
                            {DATE_PRESETS.map(d => (
                                <option key={d.value} value={d.value}>{d.label}</option>
                            ))}
                        </select>
                    </div>
                    <div className="reports-count">
                        {filteredReports.length} report{filteredReports.length !== 1 ? 's' : ''}
                    </div>
                </div>

                {error && (
                    <div className="reports-error-banner">
                        <AlertCircle size={18} />
                        {error}
                    </div>
                )}

                {/* Reports list or detail view */}
                {selectedReport ? (
                    <div className="mod-detail-view">
                        <div className="mod-detail-view-topbar">
                            <button 
                                className="mod-back-button"
                                onClick={() => {
                                    setSelectedReport(null);
                                    setAdminNotes('');
                                }}
                            >
                                ← Back to Reports
                            </button>
                            <button
                                className="mod-delete-report-btn"
                                onClick={() => handleDeleteReport(selectedReport)}
                                disabled={deleteReportLoading}
                                title="Permanently delete this report"
                            >
                                {deleteReportLoading ? <Loader2 size={14} className="spin" /> : <Trash2 size={14} />}
                                Delete Report
                            </button>
                        </div>

                        <div className="mod-report-detail">
                            <h4>{getSubjectTitle(selectedReport)}</h4>

                            <div className="mod-detail-section">
                                <strong>Status:</strong>
                                <span 
                                    className="mod-badge"
                                        style={{ backgroundColor: getStatusBadgeColor(selectedReport.status) }}
                                    >
                                        {selectedReport.status.replace('_', ' ').toUpperCase()}
                                    </span>
                                </div>

                                <div className="mod-detail-section">
                                    <strong>Category:</strong>
                                    <span 
                                        className="mod-badge"
                                        style={{ backgroundColor: getCategoryBadgeColor(parsedSelectedReason?.categoryLabel) }}
                                    >
                                        {parsedSelectedReason?.categoryLabel || 'Report'}
                                    </span>
                                </div>

                                <div className="mod-detail-section">
                                    <strong>Field:</strong>
                                    <p>{parsedSelectedReason?.fieldLabel || 'General'}</p>
                                </div>

                                <div className="mod-detail-section">
                                    <strong>Reporter:</strong>
                                    <p>{formatReporter(selectedReport)}</p>
                                </div>

                                <div className="mod-detail-section">
                                    <strong>Reason:</strong>
                                    <p>{parsedSelectedReason?.description || 'No additional context provided.'}</p>
                                </div>

                                <div className="mod-detail-section">
                                    <strong>Content Owner:</strong>
                                    <p>{getSubjectOwner(selectedReport)}</p>
                                </div>

                                {getContentOwnerDetails(selectedReport) && (
                                    <div className="mod-detail-section">
                                        <strong>Content Owner Details:</strong>
                                        <div className="mod-content-details" style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
                                            {getContentOwnerDetails(selectedReport).profileImage && (
                                                <img 
                                                    src={getContentOwnerDetails(selectedReport).profileImage} 
                                                    alt="Profile" 
                                                    style={{ 
                                                        width: '80px', 
                                                        height: '80px', 
                                                        objectFit: 'cover', 
                                                        borderRadius: '8px',
                                                        flexShrink: 0,
                                                        border: '1px solid #e0e0e0'
                                                    }} 
                                                />
                                            )}
                                            <div style={{ flex: 1 }}>
                                                {getContentOwnerDetails(selectedReport).personalName && (
                                                    <div className="mod-detail-item">
                                                        <span className="mod-detail-label">Personal Name:</span>
                                                        <span>{getContentOwnerDetails(selectedReport).personalName}</span>
                                                    </div>
                                                )}
                                                {getContentOwnerDetails(selectedReport).breederName && (
                                                    <div className="mod-detail-item">
                                                        <span className="mod-detail-label">Breeder Name:</span>
                                                        <span>{getContentOwnerDetails(selectedReport).breederName}</span>
                                                    </div>
                                                )}
                                                {getContentOwnerDetails(selectedReport).ctu && (
                                                    <div className="mod-detail-item">
                                                        <span className="mod-detail-label">CTU:</span>
                                                        <span>{getContentOwnerDetails(selectedReport).ctu}</span>
                                                    </div>
                                                )}
                                                {getContentOwnerDetails(selectedReport).email && (
                                                    <div className="mod-detail-item">
                                                        <span className="mod-detail-label">Email:</span>
                                                        <span>{getContentOwnerDetails(selectedReport).email}</span>
                                                    </div>
                                                )}
                                                {getContentOwnerDetails(selectedReport).websiteUrl && (
                                                    <div className="mod-detail-item">
                                                        <span className="mod-detail-label">Website:</span>
                                                        <a href={getContentOwnerDetails(selectedReport).websiteUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#1976d2' }}>
                                                            {getContentOwnerDetails(selectedReport).websiteUrl}
                                                        </a>
                                                    </div>
                                                )}
                                                {getContentOwnerDetails(selectedReport).bio && (
                                                    <div className="mod-detail-item" style={{ marginTop: '8px' }}>
                                                        <span className="mod-detail-label">Bio:</span>
                                                        <p style={{ margin: '4px 0 0', padding: '8px', backgroundColor: '#f5f5f5', borderRadius: '4px', whiteSpace: 'pre-wrap', fontSize: '13px' }}>
                                                            {getContentOwnerDetails(selectedReport).bio}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Animal Details Section - for animal reports */}
                                {getAnimalDetails(selectedReport) && (() => {
                                    const animal = getAnimalDetails(selectedReport);
                                    return (
                                    <div className="mod-detail-section">
                                        <strong>Reported Animal:</strong>
                                        <div style={{ 
                                            backgroundColor: '#f5f5f5', 
                                            padding: '12px', 
                                            borderRadius: '8px', 
                                            marginTop: '8px',
                                            border: '1px solid #e0e0e0'
                                        }}>
                                            {/* Header with image and basic info */}
                                            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', marginBottom: '12px' }}>
                                                {animal.imageUrl && (
                                                    <img 
                                                        src={animal.imageUrl} 
                                                        alt={animal.name || 'Animal'} 
                                                        style={{ 
                                                            width: '80px', 
                                                            height: '80px', 
                                                            objectFit: 'cover', 
                                                            borderRadius: '8px',
                                                            flexShrink: 0
                                                        }} 
                                                    />
                                                )}
                                                <div style={{ flex: 1 }}>
                                                    <p style={{ margin: 0, fontWeight: 'bold', fontSize: '16px' }}>
                                                        {animal.prefix && <span style={{ color: '#666' }}>{animal.prefix} </span>}
                                                        {animal.name || 'Unnamed'}
                                                        {animal.suffix && <span style={{ color: '#666' }}> {animal.suffix}</span>}
                                                    </p>
                                                    <p style={{ margin: '4px 0', fontSize: '13px', color: '#666' }}>
                                                        ID: <span style={{ fontFamily: 'monospace' }}>{animal.id_public || 'N/A'}</span>
                                                        {animal.breederAssignedId && <span> · Breedery: {animal.breederAssignedId}</span>}
                                                    </p>
                                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
                                                        {animal.species && (
                                                            <span style={{ fontSize: '12px', padding: '2px 8px', backgroundColor: '#e3f2fd', borderRadius: '4px' }}>
                                                                {animal.species}
                                                            </span>
                                                        )}
                                                        {animal.gender && (
                                                            <span style={{ fontSize: '12px', padding: '2px 8px', backgroundColor: animal.gender === 'Male' ? '#e3f2fd' : '#fce4ec', borderRadius: '4px' }}>
                                                                {animal.gender}
                                                            </span>
                                                        )}
                                                        {animal.status && (
                                                            <span style={{ fontSize: '12px', padding: '2px 8px', backgroundColor: '#fff3e0', borderRadius: '4px' }}>
                                                                {animal.status}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Detailed fields in a grid */}
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', fontSize: '13px' }}>
                                                {animal.birthDate && (
                                                    <div><strong>Birth Date:</strong> {new Date(animal.birthDate).toLocaleDateString()}</div>
                                                )}
                                                {animal.breed && (
                                                    <div><strong>Breed:</strong> {animal.breed}</div>
                                                )}
                                                {animal.strain && (
                                                    <div><strong>Strain:</strong> {animal.strain}</div>
                                                )}
                                                {animal.color && (
                                                    <div><strong>Color:</strong> {animal.color}</div>
                                                )}
                                                {animal.coat && (
                                                    <div><strong>Coat:</strong> {animal.coat}</div>
                                                )}
                                                {animal.coatPattern && (
                                                    <div><strong>Coat Pattern:</strong> {animal.coatPattern}</div>
                                                )}
                                                {animal.earset && (
                                                    <div><strong>Earset:</strong> {animal.earset}</div>
                                                )}
                                                {animal.microchipNumber && (
                                                    <div><strong>Microchip:</strong> {animal.microchipNumber}</div>
                                                )}
                                                {animal.pedigreeRegistrationId && (
                                                    <div><strong>Pedigree ID:</strong> {animal.pedigreeRegistrationId}</div>
                                                )}
                                                {animal.temperament && (
                                                    <div><strong>Temperament:</strong> {animal.temperament}</div>
                                                )}
                                            </div>

                                            {/* Long text fields */}
                                            {animal.geneticCode && (
                                                <div style={{ marginTop: '8px', fontSize: '13px' }}>
                                                    <strong>Genetic Code:</strong>
                                                    <div style={{ backgroundColor: '#fff', padding: '8px', borderRadius: '4px', marginTop: '4px', fontFamily: 'monospace', fontSize: '12px' }}>
                                                        {animal.geneticCode}
                                                    </div>
                                                </div>
                                            )}
                                            {animal.remarks && (
                                                <div style={{ marginTop: '8px', fontSize: '13px' }}>
                                                    <strong>Remarks:</strong>
                                                    <div style={{ backgroundColor: '#fff', padding: '8px', borderRadius: '4px', marginTop: '4px', whiteSpace: 'pre-wrap' }}>
                                                        {animal.remarks}
                                                    </div>
                                                </div>
                                            )}
                                            {animal.fertilityNotes && (
                                                <div style={{ marginTop: '8px', fontSize: '13px' }}>
                                                    <strong>Fertility Notes:</strong>
                                                    <div style={{ backgroundColor: '#fff', padding: '8px', borderRadius: '4px', marginTop: '4px' }}>
                                                        {animal.fertilityNotes}
                                                    </div>
                                                </div>
                                            )}
                                            {animal.damFertilityNotes && (
                                                <div style={{ marginTop: '8px', fontSize: '13px' }}>
                                                    <strong>Dam Fertility Notes:</strong>
                                                    <div style={{ backgroundColor: '#fff', padding: '8px', borderRadius: '4px', marginTop: '4px' }}>
                                                        {animal.damFertilityNotes}
                                                    </div>
                                                </div>
                                            )}
                                            {animal.causeOfDeath && (
                                                <div style={{ marginTop: '8px', fontSize: '13px' }}>
                                                    <strong>Cause of Death:</strong>
                                                    <div style={{ backgroundColor: '#fff', padding: '8px', borderRadius: '4px', marginTop: '4px' }}>
                                                        {animal.causeOfDeath}
                                                    </div>
                                                </div>
                                            )}
                                            {animal.necropsyResults && (
                                                <div style={{ marginTop: '8px', fontSize: '13px' }}>
                                                    <strong>Necropsy Results:</strong>
                                                    <div style={{ backgroundColor: '#fff', padding: '8px', borderRadius: '4px', marginTop: '4px' }}>
                                                        {animal.necropsyResults}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    );
                                })()}

                                {/* Bug Report Details Section - for bug/feedback reports */}
                                {getReportType(selectedReport) === 'bug' && (
                                    <div className="mod-detail-section">
                                        <strong>Feedback Details:</strong>
                                        <div style={{
                                            backgroundColor: '#f5f5f5',
                                            padding: '12px',
                                            borderRadius: '8px',
                                            marginTop: '8px',
                                            border: '1px solid #e0e0e0'
                                        }}>
                                            {selectedReport.page && (
                                                <p style={{ margin: '0 0 8px', fontSize: '13px' }}><strong>Page:</strong> {selectedReport.page}</p>
                                            )}
                                            {selectedReport.referenceId && (
                                                <p style={{ margin: '0 0 8px', fontSize: '13px' }}><strong>Reference ID:</strong> {selectedReport.referenceId} <span style={{ color: '#888' }}>(user marked this as a follow-up)</span></p>
                                            )}
                                            {selectedReport.stepsToReproduce && (
                                                <div style={{ marginBottom: '8px', fontSize: '13px' }}>
                                                    <strong>Steps to Reproduce:</strong>
                                                    <div style={{ backgroundColor: '#fff', padding: '8px', borderRadius: '4px', marginTop: '4px', whiteSpace: 'pre-wrap' }}>
                                                        {selectedReport.stepsToReproduce}
                                                    </div>
                                                </div>
                                            )}
                                            {Array.isArray(selectedReport.images) && selectedReport.images.length > 0 && (
                                                <div style={{ marginBottom: '8px' }}>
                                                    <strong style={{ fontSize: '13px' }}>Images:</strong>
                                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '4px' }}>
                                                        {selectedReport.images.map((url, idx) => (
                                                            <a key={idx} href={url} target="_blank" rel="noopener noreferrer">
                                                                <img
                                                                    src={url}
                                                                    alt={`Attachment ${idx + 1}`}
                                                                    style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #e0e0e0' }}
                                                                />
                                                            </a>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                            {selectedReport.browserInfo && (
                                                <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>
                                                    {[selectedReport.browserInfo.platform, selectedReport.browserInfo.language, selectedReport.browserInfo.screenResolution].filter(Boolean).join(' · ')}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Message Content Section - for message reports */}
                                {getReportType(selectedReport) === 'message' && selectedReport.messageId && (
                                    <div className="mod-detail-section">
                                        <strong>Reported Message:</strong>
                                        <div className="mod-message-content" style={{ 
                                            backgroundColor: '#f5f5f5', 
                                            padding: '12px', 
                                            borderRadius: '8px', 
                                            marginTop: '8px',
                                            border: '1px solid #e0e0e0'
                                        }}>
                                            <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                                                {selectedReport.messageId?.message || 'Message content unavailable'}
                                            </p>
                                            <p style={{ margin: '8px 0 0', fontSize: '12px', color: '#666' }}>
                                                Sent: {selectedReport.messageId?.createdAt ? new Date(selectedReport.messageId.createdAt).toLocaleString() : 'Unknown'}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Conversation Messages Section - for conversation reports */}
                                {getReportType(selectedReport) === 'message' && selectedReport.conversationMessages?.length > 0 && (
                                    <div className="mod-detail-section">
                                        <strong>Conversation Messages (Last 24 Hours):</strong>
                                        <div style={{ marginTop: '8px', maxHeight: '300px', overflowY: 'auto' }}>
                                            {selectedReport.conversationMessages.map((msg, index) => (
                                                <div key={index} className="mod-message-content" style={{ 
                                                    backgroundColor: msg.senderId?.toString() === selectedReport.reportedUserId?._id?.toString() ? '#ffebee' : '#e3f2fd', 
                                                    padding: '10px', 
                                                    borderRadius: '8px', 
                                                    marginBottom: '8px',
                                                    border: '1px solid #e0e0e0'
                                                }}>
                                                    <p style={{ margin: 0, fontSize: '11px', color: '#666', fontWeight: 'bold' }}>
                                                        {msg.senderId?.toString() === selectedReport.reportedUserId?._id?.toString() ? '⚠️ Reported User' : 'Reporter'}
                                                    </p>
                                                    <p style={{ margin: '4px 0', whiteSpace: 'pre-wrap' }}>
                                                        {msg.message}
                                                    </p>
                                                    <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#888' }}>
                                                        {msg.createdAt ? new Date(msg.createdAt).toLocaleString() : 'Unknown time'}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Rating Content Section - for rating reports */}
                                {getReportType(selectedReport) === 'rating' && selectedReport.ratingId && (() => {
                                    const r = selectedReport.ratingId;
                                    return (
                                        <div className="mod-detail-section">
                                            <strong>Reported Rating:</strong>
                                            <div style={{
                                                backgroundColor: '#f5f5f5',
                                                padding: '12px',
                                                borderRadius: '8px',
                                                marginTop: '8px',
                                                border: '1px solid #e0e0e0'
                                            }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                                    <div style={{ display: 'flex', gap: '2px' }}>
                                                        {[1,2,3,4,5].map(n => (
                                                            <span key={n} style={{ color: n <= r.score ? '#f59e0b' : '#d1d5db', fontSize: '18px' }}>★</span>
                                                        ))}
                                                    </div>
                                                    <span style={{ fontWeight: 'bold', fontSize: '14px' }}>{r.score}/5</span>
                                                </div>
                                                <div style={{ fontSize: '13px', color: '#555', marginBottom: '4px' }}>
                                                    <strong>Rated by:</strong> {r.raterName || r.raterId_public || 'Unknown'}
                                                </div>
                                                <div style={{ fontSize: '13px', color: '#555', marginBottom: '8px' }}>
                                                    <strong>Target breeder:</strong> {selectedReport.targetId_public || r.targetId_public || 'Unknown'}
                                                </div>
                                                {r.comment?.trim() && (
                                                    <div style={{ backgroundColor: '#fff', padding: '8px', borderRadius: '4px', fontSize: '13px', whiteSpace: 'pre-wrap', border: '1px solid #e0e0e0' }}>
                                                        {r.comment}
                                                    </div>
                                                )}
                                            </div>
                                            <div style={{ marginTop: '12px' }}>
                                                <button
                                                    style={{
                                                        padding: '6px 14px',
                                                        backgroundColor: '#fee2e2',
                                                        color: '#dc2626',
                                                        border: '1px solid #fca5a5',
                                                        borderRadius: '6px',
                                                        cursor: 'pointer',
                                                        fontSize: '13px',
                                                        fontWeight: '600'
                                                    }}
                                                    onClick={async () => {
                                                        if (!window.confirm('Remove this rating from the platform? This cannot be undone.')) return;
                                                        try {
                                                            const resp = await fetch(`${baseUrl}/moderation/ratings/${r._id}`, {
                                                                method: 'DELETE',
                                                                headers: { Authorization: `Bearer ${authToken}` }
                                                            });
                                                            if (!resp.ok) throw new Error('Failed to remove rating');
                                                            await fetchReports();
                                                            setSelectedReport(null);
                                                            if (onActionTaken) onActionTaken();
                                                        } catch (err) {
                                                            setError(err.message);
                                                        }
                                                    }}
                                                >
                                                    Remove Rating
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })()}

                                {/* Warn / Inform Actions */}
                                {getContentOwnerUserInfo(selectedReport) && (
                                    <div className="mod-actions">
                                        <h5>User Actions</h5>
                                        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                                            <button
                                                className="mod-action-btn"
                                                style={{ backgroundColor: '#e3f2fd', borderColor: '#1976d2', color: '#0d47a1' }}
                                                onClick={() => openUserActionModal('inform')}
                                                disabled={actionLoading}
                                            >
                                                💬 Inform User
                                            </button>
                                            <button
                                                className="mod-action-btn"
                                                style={{ backgroundColor: '#fff3e0', borderColor: '#f57c00', color: '#e65100' }}
                                                onClick={() => openUserActionModal('warn')}
                                                disabled={actionLoading}
                                            >
                                                ⚠️ Warn User
                                            </button>
                                        </div>
                                        <p style={{ fontSize: '12px', color: '#888', margin: 0 }}>
                                            Targeting: <strong>{getContentOwnerUserInfo(selectedReport)?.userName}</strong>
                                        </p>
                                    </div>
                                )}

                                {/* Warn/Inform Modal */}
                                {userActionModal && (
                                    <div style={{ margin: '12px 0', padding: '14px', backgroundColor: userActionModal.mode === 'warn' ? '#fff8e1' : '#e3f2fd', border: `1px solid ${userActionModal.mode === 'warn' ? '#f57c00' : '#1976d2'}`, borderRadius: '8px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                            <strong style={{ fontSize: '14px' }}>
                                                {userActionModal.mode === 'warn' ? '⚠️ Issue Warning' : '💬 Inform User'} — {userActionModal.userName}
                                            </strong>
                                            <button onClick={() => setUserActionModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: '#666' }}>✕</button>
                                        </div>
                                        <textarea
                                            value={userActionText}
                                            onChange={(e) => setUserActionText(e.target.value)}
                                            placeholder={userActionModal.mode === 'warn' ? 'Reason for warning...' : 'Message to send to the user...'}
                                            rows={4}
                                            maxLength={1000}
                                            style={{ width: '100%', boxSizing: 'border-box', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '13px', resize: 'vertical' }}
                                        />
                                        {userActionSuccess && <p style={{ color: '#388e3c', fontSize: '13px', margin: '6px 0 0' }}>{userActionSuccess}</p>}
                                        <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                                            <button
                                                onClick={handleUserAction}
                                                disabled={userActionLoading || !userActionText.trim()}
                                                style={{ padding: '6px 16px', backgroundColor: userActionModal.mode === 'warn' ? '#f57c00' : '#1976d2', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', opacity: (!userActionText.trim() || userActionLoading) ? 0.6 : 1 }}
                                            >
                                                {userActionLoading ? 'Sending...' : (userActionModal.mode === 'warn' ? 'Issue Warning' : 'Send Message')}
                                            </button>
                                            <button onClick={() => setUserActionModal(null)} style={{ padding: '6px 14px', background: 'none', border: '1px solid #ccc', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>Cancel</button>
                                        </div>
                                    </div>
                                )}

                                <div className="mod-actions">
                                    <h5>Feedback to User</h5>
                                    <p className="feedback-notes-hint">
                                        Shown to the reporting user on their "My Reports" page.
                                    </p>
                                    <textarea
                                        className="feedback-notes-textarea"
                                        value={adminNotes}
                                        onChange={(e) => setAdminNotes(e.target.value)}
                                        placeholder="Let the user know what happened with their report..."
                                        rows={3}
                                        maxLength={2000}
                                    />
                                    <button
                                        type="button"
                                        className="mod-action-btn"
                                        onClick={() => handleUpdateStatus(selectedReport.status)}
                                        disabled={actionLoading || !adminNotes.trim()}
                                        style={{ marginTop: '8px' }}
                                    >
                                        {actionLoading ? 'Sending...' : 'Send Feedback'}
                                    </button>
                                </div>

                                <div className="mod-actions">
                                    <h5>Update Status</h5>
                                    <div className="mod-action-grid">
                                        {STATUS_FILTERS.filter((status) => status.value !== 'all').map((status) => {
                                            const isActive = selectedReport.status === status.value;
                                            const statusColors = {
                                                pending: { bg: '#fff3e0', border: '#ff6f00', text: '#e65100' },
                                                in_progress: { bg: '#f3e5f5', border: '#9c27b0', text: '#6a1b9a' },
                                                reviewed: { bg: '#e3f2fd', border: '#1976d2', text: '#0d47a1' },
                                                resolved: { bg: '#e8f5e9', border: '#388e3c', text: '#1b5e20' },
                                                dismissed: { bg: '#f5f5f5', border: '#757575', text: '#424242' }
                                            };
                                            const colors = statusColors[status.value] || statusColors.pending;
                                            
                                            return (
                                                <button
                                                    key={status.value}
                                                    type="button"
                                                    className="mod-action-btn"
                                                    style={isActive ? {
                                                        backgroundColor: colors.bg,
                                                        borderColor: colors.border,
                                                        color: colors.text,
                                                        fontWeight: 'bold',
                                                        boxShadow: `0 0 0 2px ${colors.border}`
                                                    } : {}}
                                                    onClick={() => handleUpdateStatus(status.value)}
                                                    disabled={actionLoading}
                                                >
                                                    {isActive && '● '}{status.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    {actionLoading && <div className="mod-loading">Applying update...</div>}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="reports-list">
                            {loading ? (
                                <div className="reports-loading">
                                    <Loader2 className="spin" size={32} />
                                    <p>Loading reports...</p>
                                </div>
                            ) : filteredReports.length === 0 ? (
                                <div className="reports-empty-state">
                                    <Flag size={48} />
                                    <h3>No reports found</h3>
                                    <p>
                                        {searchTerm || statusFilter !== 'all' || reportType !== 'all'
                                            ? 'Try adjusting your filters'
                                            : 'No reports or bug reports have been submitted yet'}
                                    </p>
                                </div>
                            ) : (
                                filteredReports.map((report) => {
                                    const reasonMeta = parseReason(report.reason);
                                    return (
                                        <div 
                                            key={report._id}
                                            className="report-card"
                                            onClick={() => handleSelectReport(report)}
                                        >
                                            <div className="report-card-header">
                                                <div className="report-card-meta">
                                                    <span className="report-category-tag"
                                                        style={{ backgroundColor: getCategoryBadgeColor(reasonMeta.categoryLabel), color: '#fff' }}
                                                    >
                                                        {reasonMeta.categoryLabel}
                                                    </span>
                                                    <StatusBadge status={report.status} />
                                                </div>
                                                <span className="report-card-date">
                                                    <Calendar size={14} />
                                                    {new Date(report.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <div className="report-card-body">
                                                <h4 className="report-card-title">{getSubjectTitle(report)}</h4>
                                                <p className="report-card-description">
                                                    {reasonMeta.description || 'No additional context provided.'}
                                                </p>
                                            </div>
                                            <div className="report-card-footer">
                                                <div className="report-card-info">
                                                    <span className="report-owner">
                                                        <strong>Reported:</strong> {getSubjectOwner(report)}
                                                    </span>
                                                </div>
                                                <div className="report-card-info">
                                                    <span className="report-reporter">
                                                        <strong>By:</strong> {formatReporter(report)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    )}
                </div>
        </div>
    );
}
