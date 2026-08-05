import React, { useState } from 'react';
import { Shield, AlertTriangle, Eye, MessageSquare, UserX, Edit3, TrendingDown, Check, Loader2 } from 'lucide-react';
import './ModeratorActionSidebar.css';
import { 
    FlagContentModal, 
    EditContentModal, 
    WarnUserModal, 
    SuspendUserModal, 
    BanUserModal,
    LiftWarningModal,
    LiftSuspensionModal,
    LiftBanModal
} from './ModActionModals';

export default function ModeratorActionSidebar({ 
    isActive,
    onOpenReportQueue,
    onQuickFlag,
    onExitModeration,
    currentPage,
    currentContext,
    API_BASE_URL,
    authToken
}) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [notes, setNotes] = useState('');
    const [activeModal, setActiveModal] = useState(null);
    const [targetUserContext, setTargetUserContext] = useState(null); // Normalized user context for modals
    const [loadingUserContext, setLoadingUserContext] = useState(false);

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

    // Effect to normalize currentContext into targetUserContext for modals
    React.useEffect(() => {
        const resolveUserContext = async () => {
            if (!currentContext) {
                setTargetUserContext(null);
                return;
            }

            setLoadingUserContext(true);
            let userId = null;
            let userName = null;

            if (currentContext.type === 'profile') {
                userId = currentContext.userId;
                userName = currentContext.name || currentContext.ownerName;
            } else if (currentContext.type === 'animal') {
                userId = currentContext.creatorId;
                // Fetch user's name from creatorId
                if (userId) {
                    try {
                        const response = await axios.get(`${API_BASE_URL}/public/profiles/search?query=${userId}&limit=1`);
                        if (response.data && response.data.length > 0) {
                            const user = response.data[0];
                            userName = user.personalName || user.breederName || user.id_public;
                        } else {
                            userName = `User ${userId}`;
                        }
                    } catch (err) {
                        console.error('Error fetching user name for animal creator:', err);
                        userName = `User ${userId}`;
                    }
                }
            }
            setTargetUserContext({ userId, userName, originalContext: currentContext });
            setLoadingUserContext(false);
        };
        resolveUserContext();
    }, [currentContext, API_BASE_URL, authToken]);

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
                    {loadingUserContext ? (
                        <div className="mod-context-display">
                            <Loader2 size={16} className="animate-spin" /> Loading context...
                        </div>
                    ) : targetUserContext?.userName && (
                        <div className="mod-context-display">
                            <div className="mod-context-label">Current Context:</div>
                            <div className="mod-context-value">{targetUserContext.userName}</div>
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

                        <button 
                            className="mod-quick-btn lift-warning"
                            onClick={() => setActiveModal('lift-warning')}
                            title="Remove one warning from user"
                        >
                            <TrendingDown size={16} />
                            <span>Lift Warning</span>
                        </button>

                        <button 
                            className="mod-quick-btn lift-suspension"
                            onClick={() => setActiveModal('lift-suspension')}
                            title="Remove suspension from user account"
                        >
                            <TrendingDown size={16} />
                            <span>Lift Suspension</span>
                        </button>

                        <button 
                            className="mod-quick-btn lift-ban"
                            onClick={() => setActiveModal('lift-ban')}
                            title="Remove ban from user account"
                        >
                            <Check size={16} />
                            <span>Lift Ban</span>
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
                API_BASE_URL={API_BASE_URL}
                authToken={authToken}
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
            <LiftWarningModal
                isOpen={activeModal === 'lift-warning'}
                onClose={() => setActiveModal(null)}
                onSubmit={handleModalSubmit}
                context={currentContext}
                currentWarnings={currentContext?.warningCount || 0}
                warnings={currentContext?.warnings || []}
                API_BASE_URL={API_BASE_URL}
                authToken={authToken}
            />
            <LiftSuspensionModal
                isOpen={activeModal === 'lift-suspension'}
                onClose={() => setActiveModal(null)}
                onSubmit={handleModalSubmit}
                context={currentContext}
            />
            <LiftBanModal
                isOpen={activeModal === 'lift-ban'}
                onClose={() => setActiveModal(null)}
                onSubmit={handleModalSubmit}
                context={currentContext}
            />
        </div>
    );
}
