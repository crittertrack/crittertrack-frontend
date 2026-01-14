import React, { useState, useEffect } from 'react';
import {
    Database, Download, Upload, Trash2, RefreshCw, Clock,
    AlertTriangle, CheckCircle, HardDrive, Archive, Calendar,
    FileJson, Shield, Loader2, ChevronDown, ChevronUp
} from 'lucide-react';
import './BackupManagementTab.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://crittertrack-pedigree-production.up.railway.app';

const BackupManagementTab = ({ authToken }) => {
    const [backups, setBackups] = useState([]);
    const [currentStats, setCurrentStats] = useState(null);
    const [lastAutoBackup, setLastAutoBackup] = useState(null);
    const [schedule, setSchedule] = useState(null);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [restoring, setRestoring] = useState(null);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newBackupDescription, setNewBackupDescription] = useState('');
    const [expandedBackup, setExpandedBackup] = useState(null);
    const [showRestoreConfirm, setShowRestoreConfirm] = useState(null);
    const [restoreCollections, setRestoreCollections] = useState([]);

    useEffect(() => {
        fetchBackups();
    }, []);

    const fetchBackups = async () => {
        try {
            setLoading(true);
            setError(null);
            
            console.log('Fetching backups from:', `${API_BASE_URL}/admin/backups`);
            
            const response = await fetch(`${API_BASE_URL}/admin/backups`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });

            console.log('Backup fetch response status:', response.status);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('Backup fetch failed:', errorData);
                
                // Provide helpful error messages based on status code
                let errorMessage = errorData.error || errorData.message || `Failed to fetch backups (${response.status})`;
                if (response.status === 403) {
                    errorMessage = 'Access denied. Admin privileges required.';
                } else if (response.status === 401) {
                    errorMessage = 'Authentication failed. Please log in again.';
                }
                
                throw new Error(errorMessage);
            }

            const data = await response.json();
            console.log('Backup data received:', data);
            setBackups(data.backups || []);
            setCurrentStats(data.currentStats);
            setLastAutoBackup(data.lastAutoBackup);
            setSchedule(data.schedule);
        } catch (err) {
            console.error('Backup fetch error:', err);
            setError(err.message || 'Failed to fetch backups');
        } finally {
            setLoading(false);
        }
    };

    const createBackup = async () => {
        try {
            setCreating(true);
            setError(null);

            const response = await fetch(`${API_BASE_URL}/admin/trigger-backup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`
                },
                body: JSON.stringify({
                    description: newBackupDescription || 'Manual backup',
                    backupType: 'manual'
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || errorData.message || `Failed to create backup (${response.status})`);
            }

            const data = await response.json();
            setSuccess(`Backup created successfully: ${data.backup?.id}`);
            setShowCreateForm(false);
            setNewBackupDescription('');
            fetchBackups();

            setTimeout(() => setSuccess(null), 5000);
        } catch (err) {
            console.error('Create backup error:', err);
            setError(err.message || 'Failed to create backup');
        } finally {
            setCreating(false);
        }
    };

    const downloadBackup = async (backupId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/backups/${backupId}/download`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || errorData.message || `Failed to download backup (${response.status})`);
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${backupId}.json`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (err) {
            console.error('Download backup error:', err);
            setError(err.message || 'Failed to download backup');
        }
    };

    const deleteBackup = async (backupId) => {
        if (!window.confirm(`Delete backup "${backupId}"? This cannot be undone.`)) return;

        try {
            const response = await fetch(`${API_BASE_URL}/admin/backups/${backupId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${authToken}` }
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || errorData.message || `Failed to delete backup (${response.status})`);
            }

            setSuccess('Backup deleted successfully');
            fetchBackups();
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            console.error('Delete backup error:', err);
            setError(err.message || 'Failed to delete backup');
        }
    };

    const restoreBackup = async (backupId) => {
        try {
            setRestoring(backupId);
            setError(null);

            const response = await fetch(`${API_BASE_URL}/admin/restore-backup/${backupId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`
                },
                body: JSON.stringify({
                    confirmRestore: true,
                    collections: restoreCollections.length > 0 ? restoreCollections : undefined
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || errorData.message || `Failed to restore backup (${response.status})`);
            }

            const data = await response.json();
            setSuccess(`Restore completed! Restored: ${data.restored?.map(r => `${r.collection} (${r.count})`).join(', ')}`);
            setShowRestoreConfirm(null);
            setRestoreCollections([]);
            fetchBackups();

            setTimeout(() => setSuccess(null), 10000);
        } catch (err) {
            console.error('Restore backup error:', err);
            setError(err.message || 'Failed to restore backup');
        } finally {
            setRestoring(null);
        }
    };

    const formatBytes = (bytes) => {
        if (!bytes) return '0 B';
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'Never';
        return new Date(dateStr).toLocaleString();
    };

    const getTimeSince = (dateStr) => {
        if (!dateStr) return 'Never';
        const diff = Date.now() - new Date(dateStr).getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(hours / 24);
        
        if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
        if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        return 'Just now';
    };

    if (loading) {
        return (
            <div className="backup-management-tab">
                <div className="loading-state">
                    <Loader2 className="animate-spin" size={32} />
                    <p>Loading backup information...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="backup-management-tab">
            <div className="backup-header">
                <div className="header-content">
                    <h2><Database size={24} /> Backup Management</h2>
                    <p>Create, manage, and restore database backups</p>
                </div>
                <div className="header-actions">
                    <button onClick={fetchBackups} className="btn-secondary" disabled={loading}>
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                        Refresh
                    </button>
                    <button onClick={() => setShowCreateForm(true)} className="btn-primary" disabled={creating}>
                        {creating ? <Loader2 size={18} className="animate-spin" /> : <Archive size={18} />}
                        Create Backup
                    </button>
                </div>
            </div>

            {/* Alerts */}
            {error && (
                <div className="alert alert-error">
                    <AlertTriangle size={18} />
                    <span>{error}</span>
                    <button onClick={() => setError(null)}>&times;</button>
                </div>
            )}
            {success && (
                <div className="alert alert-success">
                    <CheckCircle size={18} />
                    <span>{success}</span>
                    <button onClick={() => setSuccess(null)}>&times;</button>
                </div>
            )}

            {/* Stats Overview */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon"><Archive size={24} /></div>
                    <div className="stat-info">
                        <span className="stat-value">{backups.length}</span>
                        <span className="stat-label">Total Backups</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon"><Clock size={24} /></div>
                    <div className="stat-info">
                        <span className="stat-value">{getTimeSince(lastAutoBackup)}</span>
                        <span className="stat-label">Last Auto Backup</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon"><HardDrive size={24} /></div>
                    <div className="stat-info">
                        <span className="stat-value">{currentStats?.animals || 0}</span>
                        <span className="stat-label">Current Animals</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon"><Shield size={24} /></div>
                    <div className="stat-info">
                        <span className="stat-value">{currentStats?.users || 0}</span>
                        <span className="stat-label">Current Users</span>
                    </div>
                </div>
            </div>

            {/* Auto Backup Schedule Info */}
            {schedule && (
                <div className="schedule-info-section">
                    <div className="schedule-card">
                        <div className="schedule-header">
                            <Clock size={20} />
                            <h4>Automatic Backup Schedule</h4>
                        </div>
                        <div className="schedule-details">
                            <div className="schedule-item">
                                <span className="schedule-label">Storage:</span>
                                <span className={`status-badge ${schedule.r2Configured ? 'success' : 'error'}`}>
                                    {schedule.r2Configured ? '☁️ R2 Cloud Storage' : '⚠️ Not Configured'}
                                </span>
                            </div>
                            <div className="schedule-item">
                                <span className="schedule-label">Schedule:</span>
                                <span className="schedule-value">Daily at 3:00 AM UTC</span>
                            </div>
                            <div className="schedule-item">
                                <span className="schedule-label">Status:</span>
                                <span className={`status-badge ${schedule.isRunning ? 'success' : 'warning'}`}>
                                    {schedule.isRunning ? '✓ Active' : '○ Inactive'}
                                </span>
                            </div>
                            <div className="schedule-item">
                                <span className="schedule-label">Last Run:</span>
                                <span className="schedule-value">
                                    {schedule.lastAutoBackup ? formatDate(schedule.lastAutoBackup) : 'Never'}
                                </span>
                            </div>
                            <div className="schedule-item">
                                <span className="schedule-label">Saved Backups:</span>
                                <span className="schedule-value">{schedule.backupCount || 0} / 30</span>
                            </div>
                            <div className="schedule-item">
                                <span className="schedule-label">Timezone:</span>
                                <span className="schedule-value">{schedule.timezone || 'UTC'}</span>
                            </div>
                        </div>
                        {!schedule.r2Configured && (
                            <p className="schedule-note error">
                                <AlertTriangle size={14} />
                                R2 storage not configured! Backups will NOT be saved. Contact administrator.
                            </p>
                        )}
                        {schedule.r2Configured && (
                            <p className="schedule-note">
                                <CheckCircle size={14} />
                                Backups are stored in Cloudflare R2 cloud storage and persist across deployments.
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* Current Database Stats */}
            {currentStats && (
                <div className="current-stats-section">
                    <h3><Database size={18} /> Current Database</h3>
                    <div className="stats-pills">
                        {Object.entries(currentStats).map(([key, value]) => (
                            <span key={key} className="stat-pill">
                                {key.replace(/([A-Z])/g, ' $1').trim()}: <strong>{value}</strong>
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Create Backup Form */}
            {showCreateForm && (
                <div className="create-backup-modal">
                    <div className="modal-content">
                        <h3><Archive size={20} /> Create New Backup</h3>
                        <div className="form-group">
                            <label>Description (optional)</label>
                            <input
                                type="text"
                                value={newBackupDescription}
                                onChange={(e) => setNewBackupDescription(e.target.value)}
                                placeholder="e.g., Before major update, Weekly backup..."
                            />
                        </div>
                        <div className="modal-info">
                            <p><strong>This backup will include:</strong></p>
                            <ul>
                                <li>Users ({currentStats?.users || 0})</li>
                                <li>Animals ({currentStats?.animals || 0})</li>
                                <li>Public Profiles ({currentStats?.publicProfiles || 0})</li>
                                <li>Public Animals ({currentStats?.publicAnimals || 0})</li>
                            </ul>
                        </div>
                        <div className="modal-actions">
                            <button onClick={() => setShowCreateForm(false)} className="btn-secondary">
                                Cancel
                            </button>
                            <button onClick={createBackup} className="btn-primary" disabled={creating}>
                                {creating ? <Loader2 size={18} className="animate-spin" /> : <Archive size={18} />}
                                Create Backup
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Restore Confirmation Modal */}
            {showRestoreConfirm && (
                <div className="restore-confirm-modal">
                    <div className="modal-content danger">
                        <h3><AlertTriangle size={20} /> Confirm Restore</h3>
                        <div className="warning-box">
                            <strong>⚠️ WARNING: This action will overwrite existing data!</strong>
                            <p>Restoring from backup <code>{showRestoreConfirm}</code> will replace current data with backup data.</p>
                        </div>
                        <div className="form-group">
                            <label>Select collections to restore (leave empty for all):</label>
                            <div className="checkbox-group">
                                {['users', 'animals', 'publicProfiles', 'publicAnimals'].map(col => (
                                    <label key={col} className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={restoreCollections.includes(col)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setRestoreCollections([...restoreCollections, col]);
                                                } else {
                                                    setRestoreCollections(restoreCollections.filter(c => c !== col));
                                                }
                                            }}
                                        />
                                        {col}
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div className="modal-actions">
                            <button onClick={() => { setShowRestoreConfirm(null); setRestoreCollections([]); }} className="btn-secondary">
                                Cancel
                            </button>
                            <button 
                                onClick={() => restoreBackup(showRestoreConfirm)} 
                                className="btn-danger"
                                disabled={restoring}
                            >
                                {restoring ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
                                Restore Backup
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Backup List */}
            <div className="backup-list-section">
                <h3><Archive size={18} /> Available Backups</h3>
                
                {backups.length === 0 ? (
                    <div className="empty-state">
                        <Archive size={48} />
                        <p>No backups available</p>
                        <button onClick={() => setShowCreateForm(true)} className="btn-primary">
                            Create First Backup
                        </button>
                    </div>
                ) : (
                    <div className="backup-list">
                        {backups.map((backup) => (
                            <div key={backup.id} className="backup-card">
                                <div 
                                    className="backup-card-header"
                                    onClick={() => setExpandedBackup(expandedBackup === backup.id ? null : backup.id)}
                                >
                                    <div className="backup-info">
                                        <div className="backup-title">
                                            <FileJson size={18} />
                                            <span className="backup-id">{backup.id}</span>
                                            <span className={`backup-type ${backup.type}`}>{backup.type}</span>
                                        </div>
                                        <div className="backup-meta">
                                            <span><Calendar size={14} /> {formatDate(backup.createdAt)}</span>
                                            <span><HardDrive size={14} /> {formatBytes(backup.totalSizeBytes)}</span>
                                        </div>
                                    </div>
                                    <div className="backup-actions">
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); downloadBackup(backup.id); }}
                                            className="btn-icon"
                                            title="Download Backup"
                                        >
                                            <Download size={18} />
                                        </button>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); setShowRestoreConfirm(backup.id); }}
                                            className="btn-icon warning"
                                            title="Restore Backup"
                                        >
                                            <Upload size={18} />
                                        </button>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); deleteBackup(backup.id); }}
                                            className="btn-icon danger"
                                            title="Delete Backup"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                        {expandedBackup === backup.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                    </div>
                                </div>

                                {expandedBackup === backup.id && (
                                    <div className="backup-card-details">
                                        <p><strong>Description:</strong> {backup.description || 'No description'}</p>
                                        <p><strong>Created by:</strong> {backup.createdBy}</p>
                                        <p><strong>Status:</strong> <span className="status-badge success">{backup.status}</span></p>
                                        {backup.stats && (
                                            <div className="backup-stats">
                                                <strong>Backup Contents:</strong>
                                                <div className="stats-pills">
                                                    {Object.entries(backup.stats).map(([key, value]) => (
                                                        <span key={key} className="stat-pill small">
                                                            {key}: {value}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default BackupManagementTab;
