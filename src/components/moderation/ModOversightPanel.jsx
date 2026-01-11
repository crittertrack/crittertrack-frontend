import React, { useEffect, useMemo, useState } from 'react';
import { 
    AlertCircle, RefreshCw, Search, Filter, Clock, CheckCircle, 
    Loader2, Flag, Calendar, Tag, Eye, ChevronUp, ChevronDown,
    UserCheck, Users, Briefcase, Edit2, Trash2, Send, MessageSquare
} from 'lucide-react';
import './ModOversightPanel.css';

const REPORT_TYPES = [
    { value: 'all', label: 'All Types' },
    { value: 'profile', label: 'Profiles' },
    { value: 'animal', label: 'Animals' },
    { value: 'message', label: 'Messages' }
];

const STATUS_FILTERS = [
    { value: 'all', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'reviewed', label: 'Reviewed' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'resolved', label: 'Resolved' },
    { value: 'dismissed', label: 'Dismissed' }
];

const ASSIGNMENT_FILTERS = [
    { value: 'all', label: 'All Assignments' },
    { value: 'unassigned', label: 'Unassigned' },
    { value: 'assigned_to_me', label: 'Assigned to Me' },
    { value: 'assigned_to_others', label: 'Assigned to Others' }
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
    if (report.reportedAnimalId) {
        const owner = report.reportedAnimalId.ownerId;
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
    if (report.reportedAnimalId?.ownerId && typeof report.reportedAnimalId.ownerId === 'object') {
        const owner = report.reportedAnimalId.ownerId;
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
            breederyId: animal.breederyId || null,
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
    const [assignmentFilter, setAssignmentFilter] = useState('all');
    const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
    const [adminNotes, setAdminNotes] = useState(''); // Legacy single note
    const [newNoteText, setNewNoteText] = useState(''); // For new discussion note
    const [editingNoteId, setEditingNoteId] = useState(null);
    const [editNoteText, setEditNoteText] = useState('');
    const [noteLoading, setNoteLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Assignment state
    const [moderators, setModerators] = useState([]);
    const [workloadStats, setWorkloadStats] = useState(null);
    const [showWorkload, setShowWorkload] = useState(false);
    const [assigningReport, setAssigningReport] = useState(false);

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
            fetchWorkloadStats();
        }
    }, [isOpen, statusFilter, reportType]);

    const fetchWorkloadStats = async () => {
        if (!authToken) return;
        
        try {
            const response = await fetch(`${baseUrl}/moderation/moderators/workload`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                setModerators(data.moderators || []);
                setWorkloadStats(data);
            }
        } catch (err) {
            console.error('[ModOversightPanel] Error fetching workload:', err);
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
        if (report.reportedAnimalId) return 'animal';
        if (report.messageId || report.conversationMessages?.length > 0) return 'message';
        return 'profile';
    };

    // Claim a report for yourself
    const handleClaimReport = async (report) => {
        if (!report) return;
        setAssigningReport(true);
        setError('');

        try {
            const type = getReportType(report);
            const response = await fetch(
                `${baseUrl}/moderation/reports/${type}/${report._id}/claim`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authToken}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to claim report');
            }

            await fetchReports();
            await fetchWorkloadStats();
            if (selectedReport?._id === report._id) {
                setSelectedReport(data.report);
            }
            if (onActionTaken) onActionTaken();
        } catch (err) {
            setError(err.message);
        } finally {
            setAssigningReport(false);
        }
    };

    // Assign a report to a specific moderator
    const handleAssignReport = async (report, moderatorId) => {
        if (!report) return;
        setAssigningReport(true);
        setError('');

        try {
            const type = getReportType(report);
            const response = await fetch(
                `${baseUrl}/moderation/reports/${type}/${report._id}/assign`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authToken}`
                    },
                    body: JSON.stringify({ moderatorId })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to assign report');
            }

            await fetchReports();
            await fetchWorkloadStats();
            if (selectedReport?._id === report._id) {
                setSelectedReport(data.report);
            }
            if (onActionTaken) onActionTaken();
        } catch (err) {
            setError(err.message);
        } finally {
            setAssigningReport(false);
        }
    };

    // Calculate stats
    const stats = useMemo(() => ({
        total: reports.length,
        pending: reports.filter(r => r.status === 'pending').length,
        inProgress: reports.filter(r => r.status === 'in_progress').length,
        reviewed: reports.filter(r => r.status === 'reviewed').length,
        resolved: reports.filter(r => r.status === 'resolved').length,
        dismissed: reports.filter(r => r.status === 'dismissed').length
    }), [reports]);

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
        
        // Apply assignment filter
        if (assignmentFilter !== 'all' && currentUserId) {
            filtered = filtered.filter(report => {
                const assignedToId = report.assignedTo?._id || report.assignedTo;
                switch (assignmentFilter) {
                    case 'unassigned':
                        return !assignedToId;
                    case 'assigned_to_me':
                        return assignedToId === currentUserId;
                    case 'assigned_to_others':
                        return assignedToId && assignedToId !== currentUserId;
                    default:
                        return true;
                }
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
                const assigneeName = (report.assignedTo?.breederName || report.assignedTo?.personalName || '').toLowerCase();
                
                return subjectTitle.includes(search) ||
                       owner.includes(search) ||
                       reporter.includes(search) ||
                       category.includes(search) ||
                       description.includes(search) ||
                       assigneeName.includes(search);
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
    }, [reports, searchTerm, datePreset, sortConfig, assignmentFilter, currentUserId]);

    const handleUpdateStatus = async (nextStatus) => {
        if (!selectedReport || !nextStatus) return;
        setActionLoading(true);
        setError('');

        try {
            // Determine the actual report type from the report itself
            let actualType = reportType;
            if (reportType === 'all') {
                // Infer type from the report content
                if (selectedReport.reportedAnimalId) {
                    actualType = 'animal';
                } else if (selectedReport.messageId || selectedReport.conversationMessages?.length > 0) {
                    actualType = 'message';
                } else {
                    actualType = 'profile';
                }
            }

            const response = await fetch(
                `${baseUrl}/moderation/reports/${actualType}/${selectedReport._id}/status`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authToken}`
                    },
                    body: JSON.stringify({
                        status: nextStatus,
                        adminNotes: adminNotes.trim() || undefined
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || data.error || 'Failed to update report');
            }

            // Refresh the list and close the report detail view
            await fetchReports();
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
        setNewNoteText('');
        setEditingNoteId(null);
    };

    // Discussion note functions
    const handleAddNote = async () => {
        if (!newNoteText.trim() || !selectedReport) return;
        
        setNoteLoading(true);
        try {
            const reportType = selectedReport.messageId || selectedReport.conversationMessages ? 'message' :
                              selectedReport.reportedAnimalId ? 'animal' : 'profile';
            
            const response = await fetch(
                `${baseUrl}/moderation/reports/${reportType}/${selectedReport._id}/notes`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authToken}`
                    },
                    body: JSON.stringify({ text: newNoteText.trim() })
                }
            );

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to add note');

            // Update the selected report with new notes
            setSelectedReport(prev => ({
                ...prev,
                discussionNotes: data.discussionNotes
            }));
            setNewNoteText('');
            
            // Also refresh the main list
            await fetchReports();
        } catch (err) {
            setError(err.message);
        } finally {
            setNoteLoading(false);
        }
    };

    const handleEditNote = async (noteId) => {
        if (!editNoteText.trim() || !selectedReport) return;
        
        setNoteLoading(true);
        try {
            const reportType = selectedReport.messageId || selectedReport.conversationMessages ? 'message' :
                              selectedReport.reportedAnimalId ? 'animal' : 'profile';
            
            const response = await fetch(
                `${baseUrl}/moderation/reports/${reportType}/${selectedReport._id}/notes/${noteId}`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authToken}`
                    },
                    body: JSON.stringify({ text: editNoteText.trim() })
                }
            );

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to edit note');

            setSelectedReport(prev => ({
                ...prev,
                discussionNotes: data.discussionNotes
            }));
            setEditingNoteId(null);
            setEditNoteText('');
        } catch (err) {
            setError(err.message);
        } finally {
            setNoteLoading(false);
        }
    };

    const handleDeleteNote = async (noteId) => {
        if (!window.confirm('Delete this note?')) return;
        
        setNoteLoading(true);
        try {
            const reportType = selectedReport.messageId || selectedReport.conversationMessages ? 'message' :
                              selectedReport.reportedAnimalId ? 'animal' : 'profile';
            
            const response = await fetch(
                `${baseUrl}/moderation/reports/${reportType}/${selectedReport._id}/notes/${noteId}`,
                {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${authToken}`
                    }
                }
            );

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to delete note');

            setSelectedReport(prev => ({
                ...prev,
                discussionNotes: data.discussionNotes
            }));
        } catch (err) {
            setError(err.message);
        } finally {
            setNoteLoading(false);
        }
    };

    const startEditNote = (note) => {
        setEditingNoteId(note._id);
        setEditNoteText(note.text);
    };

    const cancelEditNote = () => {
        setEditingNoteId(null);
        setEditNoteText('');
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

    // Assignment badge component
    const AssignmentBadge = ({ report }) => {
        if (!report.assignedTo) return null;
        const assignee = report.assignedTo;
        const name = assignee.breederName || assignee.personalName || assignee.email || 'Unknown';
        const isMe = currentUserId && (assignee._id === currentUserId || assignee === currentUserId);
        
        return (
            <span className={`report-assignment-badge ${isMe ? 'assigned-to-me' : ''}`}>
                <UserCheck size={12} />
                {isMe ? 'You' : name}
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
                            <h2>User Reports</h2>
                            <p>Review and manage user-submitted reports</p>
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

                {/* Workload Stats Toggle */}
                {workloadStats && (
                    <div className="workload-section">
                        <button 
                            className="workload-toggle-btn"
                            onClick={() => setShowWorkload(!showWorkload)}
                        >
                            <Users size={16} />
                            {showWorkload ? 'Hide' : 'Show'} Moderator Workload
                            {workloadStats.unassigned?.total > 0 && (
                                <span className="unassigned-badge">{workloadStats.unassigned.total} unassigned</span>
                            )}
                        </button>
                        
                        {showWorkload && (
                            <div className="workload-grid">
                                {moderators.map(({ moderator, assignedReports }) => (
                                    <div key={moderator._id} className="workload-card">
                                        <div className="workload-mod-name">{moderator.name}</div>
                                        <div className="workload-mod-role">{moderator.role}</div>
                                        <div className="workload-counts">
                                            <span title="Profile Reports">👤 {assignedReports.profile}</span>
                                            <span title="Animal Reports">🐾 {assignedReports.animal}</span>
                                            <span title="Message Reports">💬 {assignedReports.message}</span>
                                            <strong>Total: {assignedReports.total}</strong>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

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
                        <UserCheck size={18} />
                        <select 
                            value={assignmentFilter}
                            onChange={(e) => setAssignmentFilter(e.target.value)}
                        >
                            {ASSIGNMENT_FILTERS.map(a => (
                                <option key={a.value} value={a.value}>{a.label}</option>
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
                        <button 
                            className="mod-back-button"
                            onClick={() => {
                                setSelectedReport(null);
                                setAdminNotes('');
                            }}
                        >
                            ← Back to Reports
                        </button>

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

                                {/* Assignment Section */}
                                <div className="mod-detail-section mod-assignment-section">
                                    <strong>Assignment:</strong>
                                    <div className="assignment-controls">
                                        {selectedReport.assignedTo ? (
                                            <div className="current-assignment">
                                                <span className="assigned-to-text">
                                                    <UserCheck size={16} />
                                                    Assigned to: {selectedReport.assignedTo.breederName || selectedReport.assignedTo.personalName || selectedReport.assignedTo.email}
                                                    {selectedReport.assignedTo._id === currentUserId && <span className="you-badge">(You)</span>}
                                                </span>
                                                <button
                                                    className="unassign-btn"
                                                    onClick={() => handleAssignReport(selectedReport, null)}
                                                    disabled={assigningReport}
                                                >
                                                    Unassign
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="no-assignment">
                                                <span className="unassigned-text">Unassigned</span>
                                                <button
                                                    className="claim-btn"
                                                    onClick={() => handleClaimReport(selectedReport)}
                                                    disabled={assigningReport}
                                                >
                                                    <UserCheck size={14} />
                                                    Claim Report
                                                </button>
                                            </div>
                                        )}
                                        
                                        <div className="assign-dropdown">
                                            <select
                                                value={selectedReport.assignedTo?._id || ''}
                                                onChange={(e) => handleAssignReport(selectedReport, e.target.value || null)}
                                                disabled={assigningReport}
                                            >
                                                <option value="">Assign to...</option>
                                                {moderators.map(({ moderator }) => (
                                                    <option key={moderator._id} value={moderator._id}>
                                                        {moderator.name} ({moderator.role})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        
                                        {assigningReport && <Loader2 size={16} className="spin" />}
                                    </div>
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
                                {reportType === 'animal' && getAnimalDetails(selectedReport) && (() => {
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
                                                        {animal.breederyId && <span> · Breedery: {animal.breederyId}</span>}
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

                                {/* Message Content Section - for message reports */}
                                {reportType === 'message' && selectedReport.messageId && (
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
                                {reportType === 'message' && selectedReport.conversationMessages?.length > 0 && (
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

                                {/* Discussion Thread */}
                                <div className="mod-detail-section discussion-section">
                                    <div className="discussion-header">
                                        <MessageSquare size={18} />
                                        <strong>Moderator Discussion</strong>
                                        <span className="note-count">
                                            {selectedReport.discussionNotes?.length || 0} note{(selectedReport.discussionNotes?.length || 0) !== 1 ? 's' : ''}
                                        </span>
                                    </div>

                                    {/* Legacy adminNotes migration notice */}
                                    {selectedReport.adminNotes && !selectedReport.discussionNotes?.length && (
                                        <div className="legacy-note">
                                            <p className="legacy-note-label">Legacy Note:</p>
                                            <p className="legacy-note-text">{selectedReport.adminNotes}</p>
                                        </div>
                                    )}

                                    {/* Discussion Notes Thread */}
                                    <div className="discussion-thread">
                                        {selectedReport.discussionNotes?.length > 0 ? (
                                            selectedReport.discussionNotes.map((note) => (
                                                <div key={note._id} className={`discussion-note ${note.authorId === currentUserId ? 'own-note' : ''}`}>
                                                    <div className="note-header">
                                                        <span className="note-author">{note.authorName}</span>
                                                        <span className="note-date">
                                                            {new Date(note.createdAt).toLocaleString()}
                                                            {note.editedAt && <span className="edited-badge"> (edited)</span>}
                                                        </span>
                                                    </div>
                                                    
                                                    {editingNoteId === note._id ? (
                                                        <div className="note-edit-form">
                                                            <textarea
                                                                value={editNoteText}
                                                                onChange={(e) => setEditNoteText(e.target.value)}
                                                                rows={3}
                                                                maxLength={2000}
                                                            />
                                                            <div className="note-edit-actions">
                                                                <button 
                                                                    className="note-btn save-btn"
                                                                    onClick={() => handleEditNote(note._id)}
                                                                    disabled={noteLoading || !editNoteText.trim()}
                                                                >
                                                                    Save
                                                                </button>
                                                                <button 
                                                                    className="note-btn cancel-btn"
                                                                    onClick={cancelEditNote}
                                                                    disabled={noteLoading}
                                                                >
                                                                    Cancel
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <p className="note-text">{note.text}</p>
                                                            {note.authorId === currentUserId && (
                                                                <div className="note-actions">
                                                                    <button 
                                                                        className="note-action-btn"
                                                                        onClick={() => startEditNote(note)}
                                                                        title="Edit note"
                                                                    >
                                                                        <Edit2 size={14} />
                                                                    </button>
                                                                    <button 
                                                                        className="note-action-btn delete-btn"
                                                                        onClick={() => handleDeleteNote(note._id)}
                                                                        title="Delete note"
                                                                    >
                                                                        <Trash2 size={14} />
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            ))
                                        ) : !selectedReport.adminNotes && (
                                            <p className="no-notes">No discussion notes yet. Add one below.</p>
                                        )}
                                    </div>

                                    {/* Add New Note */}
                                    <div className="add-note-form">
                                        <textarea
                                            value={newNoteText}
                                            onChange={(e) => setNewNoteText(e.target.value)}
                                            placeholder="Add a note for your fellow moderators..."
                                            rows={3}
                                            maxLength={2000}
                                        />
                                        <button 
                                            className="add-note-btn"
                                            onClick={handleAddNote}
                                            disabled={noteLoading || !newNoteText.trim()}
                                        >
                                            <Send size={16} />
                                            {noteLoading ? 'Posting...' : 'Post Note'}
                                        </button>
                                    </div>
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
                                            : 'No user reports have been submitted yet'}
                                    </p>
                                </div>
                            ) : (
                                filteredReports.map((report) => {
                                    const reasonMeta = parseReason(report.reason);
                                    return (
                                        <div 
                                            key={report._id}
                                            className={`report-card ${report.assignedTo ? 'has-assignment' : ''}`}
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
                                                    <AssignmentBadge report={report} />
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
