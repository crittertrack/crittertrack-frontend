import React, { useState } from 'react';
import { Shield, AlertTriangle, Eye, MessageSquare, Ban, UserX, Edit3 } from 'lucide-react';
import './ModeratorActionSidebar.css';
import { 
    FlagContentModal, 
    EditContentModal, 
    WarnUserModal, 
    SuspendUserModal, 
    BanUserModal 
} from './ModActionModals';

export default function ModeratorActionSidebar({ 
    isActive,
    onOpenReportQueue,
    onQuickFlag,
    onExitModeration,
    currentPage,
    currentContext
}) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [notes, setNotes] = useState('');
    const [activeModal, setActiveModal] = useState(null);

    const handleQuickFlag = (action) => {
        setActiveModal(action);
    };

    const handleModalSubmit = (actionData) => {
        if (onQuickFlag) {
            onQuickFlag({
                ...actionData,
                notes: notes.trim()
            });
        }
        setNotes('');
        setActiveModal(null);
    };

    if (!isActive) return null;

    return (
        <div className={`mod-action-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
            <div className="mod-action-header">
                <Shield size={18} className="mod-shield-icon" />
                {!isCollapsed && <span>Mod Tools</span>}
                <button 
                    className="mod-action-toggle"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    title={isCollapsed ? 'Expand' : 'Collapse'}
                >
                    {isCollapsed ? '→' : '←'}
                </button>
            </div>

            {!isCollapsed && (
                <div className="mod-action-content">
                    {/* Quick context info */}
                    {currentContext && (
                        <div className="mod-context-display">
                            <div className="mod-context-label">Current Context:</div>
                            <div className="mod-context-value">
                                {currentContext.type === 'profile' && `Profile: ${currentContext.name || currentContext.id}`}
                                {currentContext.type === 'animal' && `Animal: ${currentContext.name || currentContext.id}`}
                                {currentContext.type === 'message' && 'Message Thread'}
                            </div>
                        </div>
                    )}

                    {/* Quick notes */}
                    <div className="mod-quick-notes">
                        <label>Quick Notes:</label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Add context about the issue..."
                            rows={3}
                        />
                    </div>

                    {/* Quick action buttons */}
                    <div className="mod-quick-actions">
                        <button 
                            className="mod-quick-btn flag"
                            onClick={() => handleQuickFlag('flag')}
                            title="Flag for review"
                        >
                            <AlertTriangle size={16} />
                            <span>Flag Content</span>
                        </button>

                        <button 
                            className="mod-quick-btn hide"
                            onClick={() => handleQuickFlag('edit')}
                            title="Edit or clear specific fields"
                        >
                            <Edit3 size={16} />
                            <span>Edit Content</span>
                        </button>

                        <button 
                            className="mod-quick-btn warn"
                            onClick={() => handleQuickFlag('warn')}
                            title="Send warning to user"
                        >
                            <MessageSquare size={16} />
                            <span>Warn User</span>
                        </button>

                        <button 
                            className="mod-quick-btn suspend"
                            onClick={() => handleQuickFlag('suspend')}
                            title="Suspend user account"
                        >
                            <UserX size={16} />
                            <span>Suspend User</span>
                        </button>

                        <button 
                            className="mod-quick-btn ban"
                            onClick={() => handleQuickFlag('ban')}
                            title="Ban user account"
                        >
                            <Ban size={16} />
                            <span>Ban User</span>
                        </button>
                    </div>

                    {/* Link to full report queue */}
                    <div className="mod-action-footer">
                        <button 
                            className="mod-open-queue-btn"
                            onClick={onOpenReportQueue}
                        >
                            Open Report Queue
                        </button>
                        <button 
                            className="mod-exit-btn"
                            onClick={onExitModeration}
                        >
                            Exit Moderation Mode
                        </button>
                    </div>
                </div>
            )}

            {/* Modals */}
            <FlagContentModal
                isOpen={activeModal === 'flag'}
                onClose={() => setActiveModal(null)}
                onSubmit={handleModalSubmit}
                context={currentContext}
            />
            <EditContentModal
                isOpen={activeModal === 'edit'}
                onClose={() => setActiveModal(null)}
                onSubmit={handleModalSubmit}
                context={currentContext}
            />
            <WarnUserModal
                isOpen={activeModal === 'warn'}
                onClose={() => setActiveModal(null)}
                onSubmit={handleModalSubmit}
                context={currentContext}
                currentWarnings={currentContext?.warningCount || 0}
            />
            <SuspendUserModal
                isOpen={activeModal === 'suspend'}
                onClose={() => setActiveModal(null)}
                onSubmit={handleModalSubmit}
                context={currentContext}
            />
            <BanUserModal
                isOpen={activeModal === 'ban'}
                onClose={() => setActiveModal(null)}
                onSubmit={handleModalSubmit}
                context={currentContext}
            />
        </div>
    );
}
