import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import './ModOversightPanel.css';

const REPORT_TYPES = [
    { value: 'profile', label: 'Profiles' },
    { value: 'animal', label: 'Animals' },
    { value: 'message', label: 'Messages' }
];

const STATUS_FILTERS = [
    { value: 'pending', label: 'Pending' },
    { value: 'reviewed', label: 'In Review' },
    { value: 'resolved', label: 'Resolved' },
    { value: 'dismissed', label: 'Dismissed' },
    { value: 'all', label: 'All' }
];

const STATUS_BADGE_COLORS = {
    pending: '#ff6f00',
    reviewed: '#1976d2',
    resolved: '#388e3c',
    dismissed: '#666'
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
    embedded = false  // New prop to indicate if this is embedded in AdminPanel
}) {
    const [reports, setReports] = useState([]);
    const [selectedReport, setSelectedReport] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [statusFilter, setStatusFilter] = useState('pending');
    const [reportType, setReportType] = useState('profile');
    const [adminNotes, setAdminNotes] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    const baseUrl = useMemo(() => API_BASE_URL || '/api', [API_BASE_URL]);

    // Fetch reports on load
    useEffect(() => {
        if (isOpen) {
            fetchReports();
        }
    }, [isOpen, statusFilter, reportType]);

    const fetchReports = async () => {
        if (!authToken) {
            setError('Moderator authentication required');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const params = new URLSearchParams({
                type: reportType,
                limit: '50'
            });

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

    const handleUpdateStatus = async (nextStatus) => {
        if (!selectedReport || !nextStatus) return;
        setActionLoading(true);
        setError('');

        try {
            const response = await fetch(
                `${baseUrl}/moderation/reports/${reportType}/${selectedReport._id}/status`,
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
    };

    const parsedSelectedReason = useMemo(
        () => (selectedReport ? parseReason(selectedReport.reason) : null),
        [selectedReport]
    );

    if (!isOpen) return null;

    const containerClass = embedded ? 'mod-panel-embedded' : 'mod-panel';

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
                    {/* Filter tabs */}
                    <div className="mod-filter-tabs">
                        {REPORT_TYPES.map((type) => (
                            <button
                                key={type.value}
                                className={`mod-filter-tab ${reportType === type.value ? 'active' : ''}`}
                                onClick={() => {
                                    setReportType(type.value);
                                    setSelectedReport(null);
                                }}
                            >
                                {type.label}
                            </button>
                        ))}
                    </div>
                    <div className="mod-filter-tabs secondary">
                        {STATUS_FILTERS.map((status) => (
                            <button
                                key={status.value}
                                className={`mod-filter-tab ${statusFilter === status.value ? 'active' : ''}`}
                                onClick={() => setStatusFilter(status.value)}
                            >
                                {status.label}
                            </button>
                        ))}
                    </div>

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

                                <div className="mod-detail-section">
                                    <strong>Moderator Notes:</strong>
                                    <textarea
                                        className="mod-notes-textarea"
                                        value={adminNotes}
                                        onChange={(e) => setAdminNotes(e.target.value)}
                                        placeholder="Add context for your fellow moderators..."
                                        rows={4}
                                    />
                                </div>

                                <div className="mod-actions">
                                    <h5>Update Status</h5>
                                    <div className="mod-action-grid">
                                        {STATUS_FILTERS.filter((status) => status.value !== 'all').map((status) => {
                                            const isActive = selectedReport.status === status.value;
                                            const statusColors = {
                                                pending: { bg: '#fff3e0', border: '#ff6f00', text: '#e65100' },
                                                reviewed: { bg: '#e3f2fd', border: '#1976d2', text: '#0d47a1' },
                                                resolved: { bg: '#e8f5e9', border: '#388e3c', text: '#1b5e20' },
                                                dismissed: { bg: '#f5f5f5', border: '#666', text: '#333' }
                                            };
                                            const colors = statusColors[status.value] || statusColors.dismissed;
                                            
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
                        <div className="mod-list-view">
                            {error && (
                                <div className="mod-error">
                                    <AlertCircle size={16} />
                                    {error}
                                </div>
                            )}

                            {loading ? (
                                <div className="mod-loading">Loading reports...</div>
                            ) : reports.length === 0 ? (
                                <div className="mod-empty">No reports found</div>
                            ) : (
                                <div className="mod-reports-list">
                                    {reports.map((report) => {
                                        const reasonMeta = parseReason(report.reason);
                                        return (
                                            <div 
                                                key={report._id}
                                                className="mod-report-item"
                                                onClick={() => handleSelectReport(report)}
                                            >
                                                <div className="mod-report-header">
                                                    <span className="mod-report-title">
                                                        {getSubjectTitle(report)}
                                                    </span>
                                                    <span 
                                                        className="mod-status-badge"
                                                        style={{ backgroundColor: getStatusBadgeColor(report.status) }}
                                                    >
                                                        {report.status.replace('_', ' ').toUpperCase()}
                                                    </span>
                                                </div>
                                                <div className="mod-report-meta">
                                                    <span className="mod-report-category">
                                                        {reasonMeta.categoryLabel}
                                                    </span>
                                                    <span className="mod-report-field">
                                                        {reasonMeta.fieldLabel || 'General'}
                                                    </span>
                                                </div>
                                                <p className="mod-report-snippet">
                                                    {reasonMeta.description || 'No additional context provided.'}
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Footer */}
                    <div className="mod-panel-footer">
                        <button 
                            className="mod-signout-btn"
                            onClick={onClose}
                        >
                            Sign Out of Moderation
                        </button>
                    </div>
                </div>
        </div>
    );
}
