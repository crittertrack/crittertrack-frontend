import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, AlertTriangle, Eye, MessageSquare, UserX, Ban, Flag } from 'lucide-react';
import './ModActionModals.css';

// Flag Content Modal
export const FlagContentModal = ({ isOpen, onClose, onSubmit, context }) => {
    const [reason, setReason] = useState('');
    const [category, setCategory] = useState('inappropriate');

    if (!isOpen) return null;

    const handleSubmit = () => {
        onSubmit({
            action: 'flag',
            reason,
            category,
            context
        });
        setReason('');
        setCategory('inappropriate');
        onClose();
    };

    return (
        <div className="mod-modal-overlay">
            <div className="mod-modal">
                <div className="mod-modal-header">
                    <Flag size={24} className="text-yellow-600" />
                    <h2>Flag Content for Review</h2>
                    <button onClick={onClose} className="mod-modal-close">
                        <X size={20} />
                    </button>
                </div>
                <div className="mod-modal-body">
                    <p className="text-gray-600 mb-4">
                        This will create a report for moderator review. The content will remain visible until action is taken.
                    </p>
                    
                    {context && (
                        <div className="mod-context-info">
                            <strong>Flagging:</strong> {context.type} - {context.name || context.id}
                        </div>
                    )}

                    <div className="form-group">
                        <label>Category</label>
                        <select value={category} onChange={(e) => setCategory(e.target.value)}>
                            <option value="inappropriate">Inappropriate Content</option>
                            <option value="spam">Spam</option>
                            <option value="harassment">Harassment</option>
                            <option value="misinformation">Misinformation</option>
                            <option value="other">Other</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Reason (required)</label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Explain why this content should be reviewed..."
                            rows={4}
                            required
                        />
                    </div>
                </div>
                <div className="mod-modal-footer">
                    <button onClick={onClose} className="btn-cancel">Cancel</button>
                    <button onClick={handleSubmit} disabled={!reason.trim()} className="btn-submit">
                        Submit Flag
                    </button>
                </div>
            </div>
        </div>
    );
};

// Edit/Redact Content Modal
export const EditContentModal = ({ isOpen, onClose, onSubmit, context }) => {
    const [reason, setReason] = useState('');
    const [fieldEdits, setFieldEdits] = useState({});
    const [selectedField, setSelectedField] = useState('');
    const [newValue, setNewValue] = useState('');

    if (!isOpen) return null;

    // Define editable fields based on content type
    const getEditableFields = () => {
        if (context?.type === 'profile') {
            return [
                { value: 'personalName', label: 'Personal Name' },
                { value: 'breederName', label: 'Breeder Name' },
                { value: 'profileBio', label: 'Profile Bio' },
                { value: 'location', label: 'Location' },
                { value: 'websiteUrl', label: 'Website URL' }
            ];
        }
        if (context?.type === 'animal') {
            return [
                { value: 'name', label: 'Animal Name' },
                { value: 'description', label: 'Description' },
                { value: 'notes', label: 'Notes' },
                { value: 'marking_description', label: 'Marking Description' }
            ];
        }
        return [];
    };

    const addFieldEdit = () => {
        if (selectedField) {
            setFieldEdits({ ...fieldEdits, [selectedField]: newValue });
            setSelectedField('');
            setNewValue('');
        }
    };

    const removeFieldEdit = (field) => {
        const updated = { ...fieldEdits };
        delete updated[field];
        setFieldEdits(updated);
    };

    const handleSubmit = () => {
        onSubmit({
            action: 'edit',
            reason,
            fieldEdits,
            context
        });
        setReason('');
        setFieldEdits({});
        setSelectedField('');
        setNewValue('');
        onClose();
    };

    return (
        <div className="mod-modal-overlay">
            <div className="mod-modal">
                <div className="mod-modal-header">
                    <Eye size={24} className="text-orange-600" />
                    <h2>Edit/Redact Content</h2>
                    <button onClick={onClose} className="mod-modal-close">
                        <X size={20} />
                    </button>
                </div>
                <div className="mod-modal-body">
                    <p className="text-gray-600 mb-4">
                        Replace or clear specific fields that violate policies. Leave new value empty to clear the field.
                    </p>
                    
                    {context && (
                        <div className="mod-context-info">
                            <strong>Editing:</strong> {context.type} - {context.name || context.id}
                        </div>
                    )}

                    <div className="form-group">
                        <label>Select Field to Edit</label>
                        <select value={selectedField} onChange={(e) => setSelectedField(e.target.value)}>
                            <option value="">-- Choose a field --</option>
                            {getEditableFields().map(field => (
                                <option key={field.value} value={field.value}>{field.label}</option>
                            ))}
                        </select>
                    </div>

                    {selectedField && (
                        <div className="form-group">
                            <label>New Value (leave empty to clear field)</label>
                            <input
                                type="text"
                                value={newValue}
                                onChange={(e) => setNewValue(e.target.value)}
                                placeholder="Enter new value or leave empty to clear"
                            />
                            <button onClick={addFieldEdit} className="btn-add-field">
                                Add Field Edit
                            </button>
                        </div>
                    )}

                    {Object.keys(fieldEdits).length > 0 && (
                        <div className="field-edits-list">
                            <strong>Fields to be modified:</strong>
                            {Object.entries(fieldEdits).map(([field, value]) => (
                                <div key={field} className="field-edit-item">
                                    <span><strong>{getEditableFields().find(f => f.value === field)?.label}:</strong> {value || '(cleared)'}</span>
                                    <button onClick={() => removeFieldEdit(field)} className="btn-remove">×</button>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="form-group">
                        <label>Reason (required)</label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Explain why these fields are being modified..."
                            rows={4}
                            required
                        />
                    </div>
                </div>
                <div className="mod-modal-footer">
                    <button onClick={onClose} className="btn-cancel">Cancel</button>
                    <button 
                        onClick={handleSubmit} 
                        disabled={!reason.trim() || Object.keys(fieldEdits).length === 0} 
                        className="btn-submit btn-hide"
                    >
                        Apply Edits
                    </button>
                </div>
            </div>
        </div>
    );
};

// Warn User Modal
export const WarnUserModal = ({ isOpen, onClose, onSubmit, context, currentWarnings = 0, API_BASE_URL, authToken }) => {
    const [reason, setReason] = useState('');
    const [category, setCategory] = useState('policy_violation');
    const [liveWarningCount, setLiveWarningCount] = useState(currentWarnings);

    // Fetch fresh warning count when modal opens
    useEffect(() => {
        if (isOpen && context?.userId && authToken && API_BASE_URL) {
            const fetchUserWarnings = async () => {
                try {
                    const response = await axios.get(`${API_BASE_URL}/users/profile/${context.userId}`, {
                        headers: { Authorization: `Bearer ${authToken}` }
                    });
                    setLiveWarningCount(response.data?.warningCount || 0);
                } catch (error) {
                    console.error('Failed to fetch user warning count:', error);
                    setLiveWarningCount(currentWarnings);
                }
            };
            fetchUserWarnings();
        } else {
            setLiveWarningCount(currentWarnings);
        }
    }, [isOpen, context?.userId, authToken, API_BASE_URL, currentWarnings]);

    if (!isOpen) return null;

    const handleSubmit = () => {
        onSubmit({
            action: 'warn',
            reason,
            category,
            context
        });
        setReason('');
        setCategory('policy_violation');
        onClose();
    };

    return (
        <div className="mod-modal-overlay">
            <div className="mod-modal">
                <div className="mod-modal-header">
                    <MessageSquare size={24} className="text-blue-600" />
                    <h2>Warn User</h2>
                    <button onClick={onClose} className="mod-modal-close">
                        <X size={20} />
                    </button>
                </div>
                <div className="mod-modal-body">
                    <div className="warning-count-banner">
                        <AlertTriangle size={18} />
                        <span>User currently has <strong>{liveWarningCount}</strong> warning(s)</span>
                        {liveWarningCount >= 2 && (
                            <span className="text-red-600 ml-2">(Next warning will trigger auto-suspension)</span>
                        )}
                    </div>
                    
                    {context && (
                        <div className="mod-context-info">
                            <strong>Warning User:</strong> {context.ownerName || context.name}
                        </div>
                    )}

                    <div className="form-group">
                        <label>Warning Category</label>
                        <select value={category} onChange={(e) => setCategory(e.target.value)}>
                            <option value="policy_violation">Policy Violation</option>
                            <option value="inappropriate_content">Inappropriate Content</option>
                            <option value="harassment">Harassment</option>
                            <option value="spam">Spam/Advertising</option>
                            <option value="misinformation">Misinformation</option>
                            <option value="other">Other</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Warning Message (required - user will see this)</label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Explain the violation and expected behavior..."
                            rows={5}
                            required
                        />
                    </div>

                    <div className="warning-info">
                        <p><strong>Note:</strong> This warning will be logged in the user's moderation history and counted towards automatic escalation (3 warnings = auto-suspension).</p>
                    </div>
                </div>
                <div className="mod-modal-footer">
                    <button onClick={onClose} className="btn-cancel">Cancel</button>
                    <button onClick={handleSubmit} disabled={!reason.trim()} className="btn-submit btn-warn">
                        Send Warning
                    </button>
                </div>
            </div>
        </div>
    );
};

// Suspend User Modal
export const SuspendUserModal = ({ isOpen, onClose, onSubmit, context }) => {
    const [reason, setReason] = useState('');
    const [duration, setDuration] = useState('7');
    const [customDuration, setCustomDuration] = useState('');

    if (!isOpen) return null;

    const handleSubmit = () => {
        const finalDuration = duration === 'custom' ? parseInt(customDuration, 10) : parseInt(duration, 10);
        onSubmit({
            action: 'suspend',
            reason,
            durationDays: finalDuration,
            context
        });
        setReason('');
        setDuration('7');
        setCustomDuration('');
        onClose();
    };

    return (
        <div className="mod-modal-overlay">
            <div className="mod-modal">
                <div className="mod-modal-header">
                    <UserX size={24} className="text-red-600" />
                    <h2>Suspend User Account</h2>
                    <button onClick={onClose} className="mod-modal-close">
                        <X size={20} />
                    </button>
                </div>
                <div className="mod-modal-body">
                    <p className="text-gray-600 mb-4">
                        Suspended users cannot log in until the suspension expires. Login will be disabled during the suspension period.
                    </p>
                    
                    {context && (
                        <div className="mod-context-info">
                            <strong>Suspending:</strong> {context.ownerName || context.name}
                        </div>
                    )}

                    <div className="form-group">
                        <label>Suspension Duration</label>
                        <select value={duration} onChange={(e) => setDuration(e.target.value)}>
                            <option value="1">1 Day</option>
                            <option value="3">3 Days</option>
                            <option value="7">7 Days</option>
                            <option value="14">14 Days</option>
                            <option value="30">30 Days</option>
                            <option value="custom">Custom</option>
                        </select>
                    </div>

                    {duration === 'custom' && (
                        <div className="form-group">
                            <label>Custom Duration (days)</label>
                            <input
                                type="number"
                                min="1"
                                max="365"
                                value={customDuration}
                                onChange={(e) => setCustomDuration(e.target.value)}
                                placeholder="Enter number of days"
                            />
                        </div>
                    )}

                    <div className="form-group">
                        <label>Reason (required)</label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Explain why this user is being suspended..."
                            rows={4}
                            required
                        />
                    </div>
                </div>
                <div className="mod-modal-footer">
                    <button onClick={onClose} className="btn-cancel">Cancel</button>
                    <button 
                        onClick={handleSubmit} 
                        disabled={!reason.trim() || (duration === 'custom' && !customDuration)} 
                        className="btn-submit btn-suspend"
                    >
                        Suspend User
                    </button>
                </div>
            </div>
        </div>
    );
};

// Ban User Modal
export const BanUserModal = ({ isOpen, onClose, onSubmit, context }) => {
    const [reason, setReason] = useState('');
    const [ipBan, setIpBan] = useState(true);

    if (!isOpen) return null;

    const handleSubmit = () => {
        onSubmit({
            action: 'ban',
            reason,
            ipBan,
            context
        });
        setReason('');
        setIpBan(true);
        onClose();
    };

    return (
        <div className="mod-modal-overlay">
            <div className="mod-modal">
                <div className="mod-modal-header">
                    <Ban size={24} className="text-red-700" />
                    <h2>Ban User Account</h2>
                    <button onClick={onClose} className="mod-modal-close">
                        <X size={20} />
                    </button>
                </div>
                <div className="mod-modal-body">
                    <div className="ban-warning">
                        <AlertTriangle size={24} className="text-red-600" />
                        <div>
                            <strong>PERMANENT ACTION</strong>
                            <p>This user will be permanently banned and cannot log in or register again.</p>
                        </div>
                    </div>
                    
                    {context && (
                        <div className="mod-context-info">
                            <strong>Banning:</strong> {context.ownerName || context.name}
                        </div>
                    )}

                    <div className="form-group">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={ipBan}
                                onChange={(e) => setIpBan(e.target.checked)}
                            />
                            <span>IP Ban (prevents registration from same IP address)</span>
                        </label>
                    </div>

                    <div className="form-group">
                        <label>Reason (required)</label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Explain why this user is being permanently banned..."
                            rows={4}
                            required
                        />
                    </div>

                    <div className="ban-info">
                        <p><strong>Note:</strong> This action cannot be easily undone. Consider suspension first for less severe violations.</p>
                    </div>
                </div>
                <div className="mod-modal-footer">
                    <button onClick={onClose} className="btn-cancel">Cancel</button>
                    <button onClick={handleSubmit} disabled={!reason.trim()} className="btn-submit btn-ban">
                        Permanently Ban User
                    </button>
                </div>
            </div>
        </div>
    );
};

// Lift Warning Modal
export const LiftWarningModal = ({ isOpen, onClose, onSubmit, context, currentWarnings = 0 }) => {
    const [reason, setReason] = useState('');

    if (!isOpen) return null;

    const handleSubmit = () => {
        onSubmit({
            action: 'lift-warning',
            reason,
            context
        });
        setReason('');
        onClose();
    };

    return (
        <div className="mod-modal-overlay">
            <div className="mod-modal">
                <div className="mod-modal-header">
                    <AlertTriangle size={24} className="text-green-600" />
                    <h2>Lift Warning</h2>
                    <button onClick={onClose} className="mod-modal-close">
                        <X size={20} />
                    </button>
                </div>
                <div className="mod-modal-body">
                    <div className="warning-count-banner">
                        <AlertTriangle size={18} />
                        <span>User currently has <strong>{currentWarnings}</strong> warning(s)</span>
                    </div>
                    
                    {context && (
                        <div className="mod-context-info">
                            <strong>Lifting Warning For:</strong> {context.ownerName || context.name}
                        </div>
                    )}

                    <div className="form-group">
                        <label>Reason for Lifting Warning (required)</label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Explain why this warning is being lifted (e.g., user appeal granted, warning was in error, etc.)..."
                            rows={4}
                            required
                        />
                    </div>
                </div>
                <div className="mod-modal-footer">
                    <button onClick={onClose} className="btn-cancel">Cancel</button>
                    <button onClick={handleSubmit} disabled={!reason.trim()} className="btn-submit" style={{backgroundColor: '#10b981'}}>
                        Lift Warning (Remove 1)
                    </button>
                </div>
            </div>
        </div>
    );
};
