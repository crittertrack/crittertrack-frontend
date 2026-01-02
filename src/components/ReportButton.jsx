import React, { useState, useEffect } from 'react';
import ReportModal from './ReportModal';
import './ReportButton.css';

export default function ReportButton({ contentType, contentId, contentOwnerId, authToken, tooltipText = 'Report this content' }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [isOwner, setIsOwner] = useState(false);

    useEffect(() => {
        // Get current user ID from token
        const token = authToken || localStorage.getItem('authToken');
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                const userId = payload.user?.id || payload.id;
                setCurrentUserId(userId);
                // Hide report button if user owns the content
                const ownerCheck = String(userId) === String(contentOwnerId);
                setIsOwner(ownerCheck);
            } catch (err) {
                console.error('Failed to parse token:', err);
                setCurrentUserId(null);
                setIsOwner(false);
            }
        } else {
            setCurrentUserId(null);
            setIsOwner(false);
        }
    }, [contentOwnerId, authToken]);

    const handleOpenReport = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsModalOpen(true);
    };

    // Don't show report button if no token available (unauthenticated) or user owns the content
    const token = authToken || localStorage.getItem('authToken');
    if (!token || isOwner) {
        return null;
    }

    return (
        <>
            <button
                className="report-button"
                onClick={handleOpenReport}
                title={tooltipText}
                aria-label="Report this content"
            >
                <span className="report-button-icon">⚠</span>
                <span className="report-button-text">Report</span>
            </button>

            <ReportModal
                isOpen={isModalOpen}
                contentType={contentType}
                contentId={contentId}
                contentOwnerId={contentOwnerId}
                authToken={authToken}
                onClose={() => setIsModalOpen(false)}
                onSubmit={() => {
                    // Could trigger a toast notification here if needed
                }}
            />
        </>
    );
}
