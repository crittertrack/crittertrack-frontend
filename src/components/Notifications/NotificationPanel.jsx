import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import {
    AlertCircle, AlertTriangle, Baby, Bell, Check, CheckCircle, ChevronDown, ChevronUp,
    Loader2, PawPrint, Shield, Sparkles, Trash2, X, XCircle
} from 'lucide-react';
import { formatDate } from '../../utils/dateFormatter';

const API_BASE_URL = '/api';

const NotificationPanel = ({ authToken, API_BASE_URL, onClose, showModalMessage, onNotificationChange, onViewAnimal }) => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(null);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            console.log('[Notifications] Fetching from:', `${API_BASE_URL}/notifications`);
            const response = await axios.get(`${API_BASE_URL}/notifications`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            console.log('[Notifications] Received:', response.data);
            
            // Fetch missing animal images for notifications that don't have them
            const notificationsWithImages = await Promise.all(
                (response.data || []).map(async (notification) => {
                    // If animalImageUrl is missing, try to fetch the animal details
                    if (!notification.animalImageUrl && notification.animalId_public) {
                        try {
                            const animalRes = await axios.get(`${API_BASE_URL}/public/global/animals?id_public=${notification.animalId_public}`, {
                                headers: { Authorization: `Bearer ${authToken}` }
                            });
                            if (animalRes.data?.length > 0) {
                                notification.animalImageUrl = animalRes.data[0].imageUrl || '';
                            }
                        } catch (err) {
                            console.warn('Failed to fetch image for animal:', notification.animalId_public, err);
                        }
                    }
                    return notification;
                })
            );
            
            setNotifications(notificationsWithImages || []);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleReject = async (notificationId) => {
        setProcessing(notificationId);
        try {
            await axios.post(`${API_BASE_URL}/notifications/${notificationId}/reject`, {}, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            showModalMessage('Rejected', 'Request rejected and link removed');
            fetchNotifications();
            if (onNotificationChange) onNotificationChange();
        } catch (error) {
            console.error('Error rejecting notification:', error);
            showModalMessage('Error', 'Failed to reject request');
        } finally {
            setProcessing(null);
        }
    };

    const handleAcceptTransfer = async (transferId) => {
        setProcessing(transferId);
        try {
            await axios.post(`${API_BASE_URL}/transfers/${transferId}/accept`, {}, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            showModalMessage('Success', 'Transfer accepted! Animal has been added to your account.');
            fetchNotifications();
            if (onNotificationChange) onNotificationChange();
        } catch (error) {
            console.error('Error accepting transfer:', error);
            showModalMessage('Error', error.response?.data?.message || 'Failed to accept transfer');
        } finally {
            setProcessing(null);
        }
    };

    const handleDeclineTransfer = async (transferId) => {
        setProcessing(transferId);
        try {
            await axios.post(`${API_BASE_URL}/transfers/${transferId}/decline`, {}, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            showModalMessage('Declined', 'Transfer declined');
            fetchNotifications();
            if (onNotificationChange) onNotificationChange();
        } catch (error) {
            console.error('Error declining transfer:', error);
            showModalMessage('Error', 'Failed to decline transfer');
        } finally {
            setProcessing(null);
        }
    };

    const handleAcceptViewOnly = async (transferId) => {
        setProcessing(transferId);
        try {
            await axios.post(`${API_BASE_URL}/transfers/${transferId}/accept-view-only`, {}, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            showModalMessage('Success', 'View-only access accepted');
            fetchNotifications();
            if (onNotificationChange) onNotificationChange();
        } catch (error) {
            console.error('Error accepting view-only:', error);
            showModalMessage('Error', 'Failed to accept view-only access');
        } finally {
            setProcessing(null);
        }
    };

    const handleDelete = async (notificationId) => {
        try {
            console.log('[handleDelete] Deleting notification:', notificationId);
            await axios.delete(`${API_BASE_URL}/notifications/${notificationId}`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            
            // Wait for the backend to process before refreshing
            await fetchNotifications();
            
            if (onNotificationChange) {
                console.log('[handleDelete] Calling onNotificationChange');
                // Small delay to ensure backend count is updated
                setTimeout(() => onNotificationChange(), 100);
            }
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    const handleApprove = async (notificationId) => {
        setProcessing(notificationId);
        try {
            await axios.post(`${API_BASE_URL}/notifications/${notificationId}/approve`, {}, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            fetchNotifications();
            if (onNotificationChange) onNotificationChange();
        } catch (error) {
            console.error('Error acknowledging notification:', error);
        } finally {
            setProcessing(null);
        }
    };

    const pendingNotifications = notifications.filter(n => 
        n.status === 'pending' && 
        n.type !== 'broadcast' && 
        n.type !== 'announcement' &&
        n.type !== 'moderator_message'
    );
    const otherNotifications = notifications.filter(n => 
        n.status !== 'pending' && 
        n.type !== 'broadcast' && 
        n.type !== 'announcement'
    );

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center border-b p-4">
                    <h3 className="text-xl font-bold text-gray-800">Notifications</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-grow overflow-y-auto p-4 space-y-4">
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="animate-spin" size={32} />
                        </div>
                    ) : notifications.length === 0 ? (
                        <p className="text-center text-gray-500 py-8">No notifications</p>
                    ) : (
                        <>
                            {pendingNotifications.length > 0 && (
                                <div>
                                    <h4 className="font-bold text-gray-700 mb-2">Pending Requests</h4>
                                    {pendingNotifications.map(notification => (
                                        <div key={notification._id} className={`border rounded-lg p-4 mb-2 ${
                                            notification.type === 'content_edited' 
                                                ? 'bg-orange-100 border-orange-400' 
                                                : notification.type === 'litter_assignment'
                                                ? 'bg-green-50 border-green-300'
                                                : notification.type === 'mating_reminder'
                                                ? 'bg-indigo-50 border-indigo-300'
                                                : !notification.read ? 'bg-primary/20 border-primary' : 'bg-white'
                                        }`}>
                                            {/* Moderation Notice Header */}
                                            {notification.type === 'content_edited' && (
                                                <div className="flex items-center text-orange-700 font-semibold mb-2">
                                                    <AlertTriangle size={16} className="mr-2 flex-shrink-0" />
                                                    <span>Moderation Notice</span>
                                                </div>
                                            )}
                                            {/* Litter Assignment Header */}
                                            {notification.type === 'litter_assignment' && (
                                                <div className="flex items-center text-green-700 font-semibold mb-2 text-sm">
                                                    <Baby size={16} className="mr-2 flex-shrink-0" />
                                                    <span>Litter Assignment ? {notification.parentType === 'sire' ? 'Sire' : 'Dam'}</span>
                                                </div>
                                            )}
                                            {/* Mating Reminder Header */}
                                            {notification.type === 'mating_reminder' && (
                                                <div className="flex items-center text-indigo-700 font-semibold mb-2 text-sm">
                                                    <PawPrint size={16} className="mr-2 flex-shrink-0" />
                                                    <span>Planned Mating ? Today!</span>
                                                </div>
                                            )}
                                            <div className="flex items-start space-x-3 mb-2">
                                                {/* Moderation Icon for content_edited */}
                                                {notification.type === 'content_edited' && (
                                                    <div className="flex-shrink-0 w-16 h-16 bg-orange-200 rounded-md overflow-hidden flex items-center justify-center">
                                                        <Shield size={32} className="text-orange-600" />
                                                    </div>
                                                )}
                                                {/* Animal Thumbnail - hide for content_edited */}
                                                {notification.type !== 'content_edited' && (
                                                <div 
                                                    className={`flex-shrink-0 w-16 h-16 bg-gray-200 rounded-md overflow-hidden transition-opacity ${notification.type === 'litter_assignment' ? '' : 'cursor-pointer hover:opacity-80'}`}
                                                    onClick={() => {
                                                        if (notification.type !== 'litter_assignment' && notification.animalId_public && onViewAnimal) {
                                                            onViewAnimal(notification.animalId_public, true);
                                                        }
                                                    }}
                                                    title={notification.type === 'litter_assignment' ? undefined : 'Click to view animal'}
                                                >
                                                    {notification.animalImageUrl ? (
                                                        <img 
                                                            src={notification.animalImageUrl} 
                                                            alt={notification.animalName}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-500">
                                                            {notification.type === 'litter_assignment' ? <Baby size={28} className="text-green-500" /> : notification.type === 'mating_reminder' ? <PawPrint size={28} className="text-indigo-500" /> : <AlertCircle size={28} />}
                                                        </div>
                                                    )}
                                                </div>
                                                )}
                                                {/* Notification Message */}
                                                <div className="flex-1">
                                                    <p className="text-sm text-gray-700">{notification.message}</p>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {new Date(notification.createdAt).toLocaleString('en-GB')}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex space-x-2">
                                                {/* Transfer Request */}
                                                {notification.type === 'transfer_request' && notification.transferId && (
                                                    <>
                                                        <button
                                                            onClick={() => handleAcceptTransfer(notification.transferId)}
                                                            disabled={processing === notification.transferId}
                                                            className="flex items-center space-x-1 bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
                                                        >
                                                            <CheckCircle size={14} />
                                                            <span>Accept</span>
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeclineTransfer(notification.transferId)}
                                                            disabled={processing === notification.transferId}
                                                            className="flex items-center space-x-1 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
                                                        >
                                                            <XCircle size={14} />
                                                            <span>Decline</span>
                                                        </button>
                                                    </>
                                                )}
                                                {/* View-Only Offer */}
                                                {notification.type === 'view_only_offer' && notification.transferId && (
                                                    <>
                                                        <button
                                                            onClick={() => handleAcceptViewOnly(notification.transferId)}
                                                            disabled={processing === notification.transferId}
                                                            className="flex items-center space-x-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
                                                        >
                                                            <CheckCircle size={14} />
                                                            <span>Accept</span>
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeclineTransfer(notification.transferId)}
                                                            disabled={processing === notification.transferId}
                                                            className="flex items-center space-x-1 bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
                                                        >
                                                            <XCircle size={14} />
                                                            <span>Decline</span>
                                                        </button>
                                                    </>
                                                )}
                                                {/* Link Request (old functionality) */}
                                                {notification.type === 'link_request' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleReject(notification._id)}
                                                            disabled={processing === notification._id}
                                                            className="flex items-center space-x-1 bg-primary border-2 border-black text-black hover:bg-primary/90 px-3 py-1 rounded text-sm disabled:opacity-50"
                                                        >
                                                            <XCircle size={14} />
                                                            <span>Reject</span>
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(notification._id)}
                                                            className="flex items-center space-x-1 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                                                        >
                                                            <Trash2 size={14} />
                                                            <span>Delete</span>
                                                        </button>
                                                    </>
                                                )}
                                                {/* Breeder and Parent Requests */}
                                                {(notification.type === 'breeder_request' || notification.type === 'parent_request') && (
                                                    <>
                                                        <button
                                                            onClick={() => handleReject(notification._id)}
                                                            disabled={processing === notification._id}
                                                            className="flex items-center space-x-1 bg-accent hover:bg-accent/80 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
                                                        >
                                                            <XCircle size={14} />
                                                            <span>Reject</span>
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(notification._id)}
                                                            className="flex items-center space-x-1 bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm"
                                                        >
                                                            <Trash2 size={14} />
                                                            <span>Delete</span>
                                                        </button>
                                                    </>
                                                )}
                                                {/* Content Edited - Acknowledge button */}
                                                {notification.type === 'content_edited' && (
                                                    <button
                                                        onClick={() => handleApprove(notification._id)}
                                                        disabled={processing === notification._id}
                                                        className="flex items-center space-x-1 bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
                                                    >
                                                        <CheckCircle size={14} />
                                                        <span>Acknowledge</span>
                                                    </button>
                                                )}
                                                {/* Delete button for other notifications */}
                                                {notification.type !== 'link_request' && 
                                                 notification.type !== 'breeder_request' &&
                                                 notification.type !== 'parent_request' &&
                                                 notification.type !== 'transfer_request' && 
                                                 notification.type !== 'view_only_offer' &&
                                                 notification.type !== 'content_edited' && (
                                                    <button
                                                        onClick={() => handleDelete(notification._id)}
                                                        className="flex items-center space-x-1 bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm"
                                                    >
                                                        <Trash2 size={14} />
                                                        <span>Delete</span>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {otherNotifications.length > 0 && (
                                <div>
                                    <h4 className="font-bold text-gray-700 mb-2">History</h4>
                                    {otherNotifications.map(notification => (
                                        <div key={notification._id} className="border rounded-lg p-4 mb-2 bg-gray-50">
                                            <div className="flex justify-between items-start">
                                                <div className="flex-grow">
                                                    <p className="text-sm text-gray-700 mb-1">{notification.message}</p>
                                                    <p className="text-xs text-gray-500">
                                                        {new Date(notification.createdAt).toLocaleString('en-GB')} ? 
                                                        <span className={`ml-1 ${notification.status === 'approved' ? 'text-green-600' : 'text-red-600'}`}>
                                                            {notification.status}
                                                        </span>
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => handleDelete(notification._id)}
                                                    className="text-gray-400 hover:text-red-600 ml-2"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

// ParentCard component — used in animal detail view

export default NotificationPanel;
