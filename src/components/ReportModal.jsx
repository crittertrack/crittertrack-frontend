import React, { useMemo, useState } from 'react';
import './ReportModal.css';

const CATEGORY_OPTIONS = [
    { value: 'inappropriate_content', label: 'Inappropriate/Offensive Content' },
    { value: 'harassment_bullying', label: 'Harassment or Bullying' },
    { value: 'spam', label: 'Spam' },
    { value: 'copyright_violation', label: 'Copyright/Licensing Violation' },
    { value: 'community_guidelines_violation', label: 'Community Guidelines Violation' },
    { value: 'other', label: 'Other' }
];

const FIELD_OPTIONS = {
    profile: [
        { value: 'profile_name', label: 'Personal Name' },
        { value: 'profile_breeder_name', label: 'Breeder Name' },
        { value: 'profile_image', label: 'Profile Image' },
        { value: 'profile_description', label: 'Description/Bio' },
        { value: 'profile_website', label: 'Website or Links' },
        { value: 'other', label: 'Other' }
    ],
    animal: [
        { value: 'animal_name', label: 'Animal Name' },
        { value: 'animal_color', label: 'Color/Genetics' },
        { value: 'animal_image', label: 'Image' },
        { value: 'animal_remarks', label: 'Remarks' },
        { value: 'other', label: 'Other' }
    ],
    message: [
        { value: 'message_body', label: 'Message Content' },
        { value: 'message_attachment', label: 'Attachment/Media' },
        { value: 'other', label: 'Other' }
    ]
};

const getFieldOptions = (type) => FIELD_OPTIONS[type] || FIELD_OPTIONS.profile;

export default function ReportModal({
    isOpen,
    contentType,
    contentId,
    contentOwnerId,
    authToken,
    API_BASE_URL,
    onClose,
    onSubmit
}) {
    const [category, setCategory] = useState('');
    const [reportedField, setReportedField] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const fields = useMemo(() => getFieldOptions(contentType), [contentType]);
    const categories = CATEGORY_OPTIONS;

    const getCategoryLabel = (value) => categories.find((cat) => cat.value === value)?.label || value;
    const getFieldLabel = (value) => fields.find((field) => field.value === value)?.label || value;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (!category) {
            setError('Please select a report category');
            setLoading(false);
            return;
        }

        if (!reportedField) {
            setError('Please select what part was reported');
            setLoading(false);
            return;
        }

        if (!description.trim()) {
            setError('Please provide a description');
            setLoading(false);
            return;
        }

        if (description.length > 2000) {
            setError('Description is too long (max 2000 characters)');
            setLoading(false);
            return;
        }

        try {
            const token = authToken || localStorage.getItem('authToken');
            if (!token) {
                setError('You must be logged in to submit a report');
                setLoading(false);
                return;
            }

            const base = API_BASE_URL ? `${API_BASE_URL}/reports` : '/api/reports';
            const endpoint = contentType === 'animal' ? `${base}/animal` 
                : contentType === 'message' ? `${base}/message`
                : `${base}/profile`;

            const reasonLabel = getCategoryLabel(category);
            const fieldLabel = getFieldLabel(reportedField);
            const composedReason = `${reasonLabel}${fieldLabel ? ` · ${fieldLabel}` : ''} :: ${description.trim()}`;

            const payload = { reason: composedReason };

            if (contentType === 'profile') {
                if (contentOwnerId) {
                    payload.reportedUserId = contentOwnerId;
                }
                if (contentId && !payload.reportedUserId) {
                    payload.reportedUserPublicId = contentId;
                }
            } else if (contentType === 'animal') {
                if (contentId && contentId.length === 24) {
                    payload.reportedAnimalId = contentId;
                }
                if (contentId && !payload.reportedAnimalId) {
                    payload.reportedAnimalPublicId = contentId;
                }
            } else if (contentType === 'message') {
                payload.messageId = contentId;
            }

            if (!payload.reportedUserId && !payload.reportedUserPublicId && contentType === 'profile') {
                throw new Error('Unable to determine which profile you are reporting.');
            }

            if (!payload.reportedAnimalId && !payload.reportedAnimalPublicId && contentType === 'animal') {
                throw new Error('Unable to identify the animal you are reporting.');
            }

            if (contentType === 'message' && !payload.messageId) {
                throw new Error('Unable to identify the message you are reporting.');
            }

            console.log('[ReportModal] Submitting report to:', endpoint, 'with payload:', payload);

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            console.log('[ReportModal] Response status:', response.status, 'data:', data);

            if (!response.ok) {
                throw new Error(data.error || 'Failed to submit report');
            }

            console.log('[ReportModal] Report submitted successfully!');
            setSuccess(true);
            setCategory('');
            setReportedField('');
            setDescription('');

            if (onSubmit) {
                onSubmit(data);
            }

            // Close modal after 2 seconds
            setTimeout(() => {
                handleClose();
            }, 2000);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setCategory('');
        setReportedField('');
        setDescription('');
        setError('');
        setSuccess(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="report-modal-overlay" onClick={handleClose}>
            <div className="report-modal" onClick={(e) => e.stopPropagation()}>
                <div className="report-modal-header">
                    <h2>Report Content</h2>
                    <button className="report-modal-close" onClick={handleClose}>×</button>
                </div>

                <div className="report-modal-content">
                    {success ? (
                        <div className="report-success-message">
                            <div className="success-icon">✓</div>
                            <p>Thank you for your report!</p>
                            <p className="success-detail">Our moderation team will review this shortly.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label htmlFor="category">Why are you reporting this? *</label>
                                <select
                                    id="category"
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    disabled={loading}
                                >
                                    <option value="">Select a reason...</option>
                                    {categories.map(cat => (
                                        <option key={cat.value} value={cat.value}>
                                            {cat.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="field">What specifically is problematic? *</label>
                                <select
                                    id="field"
                                    value={reportedField}
                                    onChange={(e) => setReportedField(e.target.value)}
                                    disabled={loading}
                                >
                                    <option value="">Select the part that's problematic...</option>
                                    {fields.map((f) => (
                                        <option key={f.value} value={f.value}>
                                            {f.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="description">
                                    Additional details ({description.length}/2000) *
                                </label>
                                <textarea
                                    id="description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Please explain why you're reporting this content..."
                                    rows="5"
                                    disabled={loading}
                                    maxLength="2000"
                                />
                            </div>

                            {error && <div className="report-error">{error}</div>}

                            <div className="report-modal-actions">
                                <button
                                    type="button"
                                    className="btn-cancel"
                                    onClick={handleClose}
                                    disabled={loading}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn-submit"
                                    disabled={loading}
                                >
                                    {loading ? 'Submitting...' : 'Submit Report'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
