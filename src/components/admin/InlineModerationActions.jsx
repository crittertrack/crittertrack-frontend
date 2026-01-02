import React, { useState } from 'react';
import { Shield, Flag, Eye, EyeOff, Trash2, AlertTriangle } from 'lucide-react';
import './InlineModerationActions.css';

/**
 * Inline Moderation Actions Component
 * 
 * Displays moderation actions inline on content (animals, profiles, etc.)
 * Only visible to moderators/admins
 * 
 * Props:
 * - contentType: 'animal' | 'profile' | 'litter' | 'post'
 * - contentId: ID of the content (MongoDB _id or id_public)
 * - contentName: Display name of the content
 * - ownerId: ID of the content owner
 * - currentlyHidden: Boolean - is content currently hidden?
 * - authToken: JWT token
 * - API_BASE_URL: Base API URL
 * - userRole: 'user' | 'moderator' | 'admin'
 * - onActionComplete: Callback after action completes
 */
export default function InlineModerationActions({
    contentType,
    contentId,
    contentName,
    ownerId,
    currentlyHidden = false,
    authToken,
    API_BASE_URL,
    userRole = 'user',
    onActionComplete
}) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [loading, setLoading] = useState(false);
    const [reason, setReason] = useState('');
    const [showReasonInput, setShowReasonInput] = useState(null); // 'hide' | 'delete'

    // Only show to moderators and admins
    if (!['moderator', 'admin'].includes(userRole)) {
        return null;
    }

    const handleHideContent = async () => {
        if (!reason.trim()) {
            alert('Please provide a reason for hiding this content');
            return;
        }

        setLoading(true);

        try {
            let endpoint = '';
            if (contentType === 'animal') {
                endpoint = `/api/admin/animals/${contentId}/hide`;
            } else if (contentType === 'profile') {
                endpoint = `/api/admin/profiles/${ownerId}/hide`;
            }

            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({ reason })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to hide content');
            }

            alert(`${contentType} hidden successfully`);
            setReason('');
            setShowReasonInput(null);
            setIsExpanded(false);

            if (onActionComplete) {
                onActionComplete('hide', data);
            }
        } catch (err) {
            alert(`Error: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteContent = async () => {
        if (!reason.trim()) {
            alert('Please provide a reason for deleting this content');
            return;
        }

        if (!confirm(`Are you sure you want to PERMANENTLY DELETE this ${contentType}?\n\nThis action cannot be undone!`)) {
            return;
        }

        setLoading(true);

        try {
            let endpoint = '';
            if (contentType === 'animal') {
                endpoint = `/api/admin/animals/${contentId}`;
            }

            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({ reason })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to delete content');
            }

            alert(`${contentType} deleted successfully`);
            setReason('');
            setShowReasonInput(null);
            setIsExpanded(false);

            if (onActionComplete) {
                onActionComplete('delete', data);
            }
        } catch (err) {
            alert(`Error: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleReport = () => {
        // Navigate to moderation panel with this content pre-selected
        alert('Opening moderation panel... (not yet implemented)');
    };

    return (
        <div className="inline-moderation-container">
            {/* Toggle Button */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="mod-toggle-btn"
                title="Moderation Actions"
            >
                <Shield size={16} />
                <span>Moderate</span>
            </button>

            {/* Expanded Actions */}
            {isExpanded && (
                <div className="mod-actions-panel">
                    <div className="mod-panel-header">
                        <h4>Moderation Actions</h4>
                        <button onClick={() => setIsExpanded(false)} className="close-btn">×</button>
                    </div>

                    <div className="mod-content-info">
                        <p><strong>Content:</strong> {contentType} - {contentName}</p>
                        <p><strong>Owner ID:</strong> {ownerId}</p>
                        <p><strong>Status:</strong> {currentlyHidden ? 'Hidden' : 'Visible'}</p>
                    </div>

                    <div className="mod-actions">
                        {/* Report */}
                        <button
                            onClick={handleReport}
                            className="mod-action-btn report"
                            disabled={loading}
                        >
                            <Flag size={16} />
                            <span>Create Report</span>
                        </button>

                        {/* Hide/Unhide */}
                        {!currentlyHidden && (
                            <button
                                onClick={() => setShowReasonInput(showReasonInput === 'hide' ? null : 'hide')}
                                className="mod-action-btn hide"
                                disabled={loading}
                            >
                                <EyeOff size={16} />
                                <span>Hide Content</span>
                            </button>
                        )}

                        {currentlyHidden && (
                            <button
                                onClick={() => alert('Unhide feature not yet implemented')}
                                className="mod-action-btn unhide"
                                disabled={loading}
                            >
                                <Eye size={16} />
                                <span>Unhide Content</span>
                            </button>
                        )}

                        {/* Delete (Admin Only) */}
                        {userRole === 'admin' && (
                            <button
                                onClick={() => setShowReasonInput(showReasonInput === 'delete' ? null : 'delete')}
                                className="mod-action-btn delete"
                                disabled={loading}
                            >
                                <Trash2 size={16} />
                                <span>Delete Content</span>
                            </button>
                        )}
                    </div>

                    {/* Reason Input */}
                    {showReasonInput && (
                        <div className="mod-reason-input">
                            <label>
                                <AlertTriangle size={14} />
                                Reason for {showReasonInput === 'hide' ? 'hiding' : 'deleting'}:
                            </label>
                            <textarea
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="Explain why you're taking this action..."
                                rows="3"
                                disabled={loading}
                            />
                            <div className="reason-actions">
                                <button
                                    onClick={showReasonInput === 'hide' ? handleHideContent : handleDeleteContent}
                                    className="btn-confirm"
                                    disabled={loading || !reason.trim()}
                                >
                                    {loading ? 'Processing...' : `Confirm ${showReasonInput === 'hide' ? 'Hide' : 'Delete'}`}
                                </button>
                                <button
                                    onClick={() => {
                                        setShowReasonInput(null);
                                        setReason('');
                                    }}
                                    className="btn-cancel"
                                    disabled={loading}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="mod-panel-footer">
                        <small>⚠️ All actions are logged in the audit trail</small>
                    </div>
                </div>
            )}
        </div>
    );
}
