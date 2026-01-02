import React, { useState } from 'react';
import './ReportModal.css';

export default function ReportModal({ isOpen, contentType, contentId, contentOwnerId, authToken, onClose, onSubmit }) {
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const categories = [
        { value: 'inappropriate_content', label: 'Inappropriate/Offensive Content' },
        { value: 'harassment_bullying', label: 'Harassment or Bullying' },
        { value: 'spam', label: 'Spam' },
        { value: 'copyright_violation', label: 'Copyright/Licensing Violation' },
        { value: 'community_guidelines_violation', label: 'Community Guidelines Violation' },
        { value: 'other', label: 'Other' }
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (!category) {
            setError('Please select a report category');
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
            const token = authToken || localStorage.getItem('token');
            if (!token) {
                setError('You must be logged in to submit a report');
                setLoading(false);
                return;
            }

            const response = await fetch('/api/reports/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    contentType,
                    contentId,
                    contentOwnerId,
                    category,
                    description
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to submit report');
            }

            setSuccess(true);
            setCategory('');
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
