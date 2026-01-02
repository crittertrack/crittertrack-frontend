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
        console.log('ReportButton: authToken prop:', authToken ? 'provided' : 'not provided');
        console.log('ReportButton: token from storage:', token ? 'found' : 'not found');
        console.log('ReportButton: contentOwnerId prop:', contentOwnerId);
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                console.log('ReportButton: JWT payload:', payload);
                const userId = payload.user?.id || payload.id;
                console.log('ReportButton: current user ID:', userId);
                console.log('ReportButton: content owner ID:', contentOwnerId);
                setCurrentUserId(userId);
                // Hide report button if user owns the content
                const ownerCheck = String(userId) === String(contentOwnerId);
                console.log('ReportButton: isOwner:', ownerCheck);
                setIsOwner(ownerCheck);
            } catch (err) {
                console.error('Failed to parse token:', err);
                setCurrentUserId(null);
                setIsOwner(false);
            }
        } else {
            console.log('ReportButton: No token available');
            setCurrentUserId(null);
            setIsOwner(false);
        }
    }, [contentOwnerId, authToken]);

    const handleOpenReport = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsModalOpen(true);
    };

    // Don't show report button if no authToken (unauthenticated) or user owns the content
    if (!authToken) {
        return null;
    }

    if (isOwner) {
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
