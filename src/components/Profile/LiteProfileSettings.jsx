import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, User, Camera, Check, KeyRound, Eye, EyeOff, ArrowLeft, ExternalLink, MessageSquare, LogOut, Sun, Moon, Monitor } from 'lucide-react';
import apiClient from '../../utils/apiClient';
import { useTheme } from '../../contexts/ThemeContext';

// Lite mode's own trimmed settings page (avatar-click destination there instead of the full
// 7-tab ProfileEditForm/Settings) — mirrors native crittertrack-lite's Profile.jsx scope:
// basic info, privacy toggles, profile image, change password. No bio/social links/directory/
// ratings/breeding-lines/data-portability tabs.
const LiteProfileSettings = ({ userProfile, authToken, showModalMessage, onProfileUpdated, handleLogout }) => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const { theme, setTheme } = useTheme();
    const [personalName, setPersonalName] = useState(userProfile?.personalName || '');
    const [breederName, setBreederName] = useState(userProfile?.breederName || '');
    const [showPersonalName, setShowPersonalName] = useState(userProfile?.showPersonalName ?? true);
    const [showBreederName, setShowBreederName] = useState(userProfile?.showBreederName ?? false);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(userProfile?.profileImage || userProfile?.profileImageUrl || null);
    const [saving, setSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');
    const [saveError, setSaveError] = useState('');

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [passwordSaving, setPasswordSaving] = useState(false);
    const [passwordMessage, setPasswordMessage] = useState('');
    const [passwordError, setPasswordError] = useState('');

    const handleImagePick = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setSaveMessage('');
        setSaveError('');
        setSaving(true);
        try {
            const payload = { personalName, breederName: breederName || null, showPersonalName, showBreederName };
            if (imageFile) {
                const fd = new FormData();
                fd.append('file', imageFile);
                fd.append('type', 'profile');
                const uploadRes = await apiClient.post('/upload', fd);
                const url = uploadRes.data?.url || uploadRes.data?.path;
                if (url) {
                    payload.profileImage = url;
                    payload.profileImageUrl = url;
                }
            }
            const resp = await apiClient.put('/users/profile', payload);
            const updatedUser = resp?.data?.user || resp?.data || null;
            setImageFile(null);
            setSaveMessage('Profile updated successfully.');
            onProfileUpdated?.(updatedUser);
        } catch (err) {
            setSaveError(err.response?.data?.message || 'Failed to update profile.');
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setPasswordMessage('');
        setPasswordError('');
        if (!currentPassword || !newPassword || !confirmNewPassword) {
            setPasswordError('All password fields are required.');
            return;
        }
        if (newPassword !== confirmNewPassword) {
            setPasswordError('New password and confirmation do not match.');
            return;
        }
        setPasswordSaving(true);
        try {
            await apiClient.put('/auth/change-password', { currentPassword, newPassword });
            setPasswordMessage('Password changed successfully.');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmNewPassword('');
        } catch (err) {
            setPasswordError(err.response?.data?.message || 'Failed to change password. Check your current password.');
        } finally {
            setPasswordSaving(false);
        }
    };

    const handleReportIssue = () => {
        navigate('/report');
    };

    return (
        <div className="min-h-screen bg-page-bg dark:bg-dark-bg p-4">
            <div className="max-w-md mx-auto space-y-4">
                <div className="flex items-center justify-between">
                    <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-gray-600 dark:text-dark-text-muted hover:text-gray-800 dark:hover:text-dark-text transition text-sm font-medium">
                        <ArrowLeft size={18} /> Back
                    </button>
                    <h1 className="text-lg font-bold text-gray-800 dark:text-dark-text">Profile Settings</h1>
                </div>

                {userProfile?.id_public && (
                    <button
                        onClick={() => navigate(`/user/${userProfile.id_public}`)}
                        className="w-full flex items-center justify-center gap-2 bg-white dark:bg-dark-card-bg border border-gray-200 dark:border-dark-border rounded-xl shadow-sm py-2.5 text-sm font-semibold text-gray-700 dark:text-dark-text hover:bg-gray-50 dark:hover:bg-dark-surface-hover transition"
                    >
                        <ExternalLink size={16} /> Go to Profile
                    </button>
                )}

                <form onSubmit={handleSaveProfile} className="bg-white dark:bg-dark-card-bg rounded-2xl shadow-sm p-4 space-y-4">
                    <div className="flex flex-col items-center gap-2">
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-100 dark:bg-dark-surface flex items-center justify-center border-2 border-gray-200 dark:border-dark-border"
                        >
                            {imagePreview ? (
                                <img src={imagePreview} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <User size={36} className="text-gray-400 dark:text-dark-text-muted" />
                            )}
                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition">
                                <Camera size={20} className="text-white" />
                            </div>
                        </button>
                        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImagePick} />
                        <p className="text-xs text-gray-400 dark:text-dark-text-muted">Click to change photo</p>
                    </div>

                    {saveMessage && <div className="text-sm text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700/60 rounded-lg px-3 py-2">{saveMessage}</div>}
                    {saveError && <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/60 rounded-lg px-3 py-2">{saveError}</div>}

                    <div>
                        <label className="text-xs font-semibold text-gray-500 dark:text-dark-text-muted uppercase tracking-wide">Personal Name</label>
                        <input
                            type="text"
                            required
                            value={personalName}
                            onChange={(e) => setPersonalName(e.target.value)}
                            className="mt-1 w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card-bg text-gray-900 dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm"
                        />
                        <label className="mt-2 flex items-center gap-2 text-xs text-gray-600 dark:text-dark-text-secondary">
                            <input type="checkbox" checked={showPersonalName} onChange={(e) => setShowPersonalName(e.target.checked)} className="accent-primary" />
                            Show personal name on public profile
                        </label>
                    </div>

                    <div>
                        <label className="text-xs font-semibold text-gray-500 dark:text-dark-text-muted uppercase tracking-wide">Breeder Name</label>
                        <input
                            type="text"
                            value={breederName}
                            onChange={(e) => setBreederName(e.target.value)}
                            className="mt-1 w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card-bg text-gray-900 dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm"
                            placeholder="Jane's Rattery"
                        />
                        <label className="mt-2 flex items-center gap-2 text-xs text-gray-600 dark:text-dark-text-secondary">
                            <input type="checkbox" checked={showBreederName} onChange={(e) => setShowBreederName(e.target.checked)} className="accent-primary" />
                            Show breeder name on public profile
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full flex items-center justify-center gap-2 bg-primary dark:bg-dark-primary hover:bg-primary/90 dark:hover:bg-dark-primary/90 text-black font-semibold py-2.5 rounded-lg transition disabled:opacity-60"
                    >
                        {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                        {saving ? 'Saving…' : 'Save Changes'}
                    </button>
                </form>

                <div className="bg-white dark:bg-dark-card-bg rounded-2xl shadow-sm p-4 space-y-2">
                    <h2 className="text-sm font-bold text-gray-800 dark:text-dark-text">Appearance</h2>
                    <div className="grid grid-cols-3 gap-2">
                        {[
                            { value: 'light', label: 'Light', icon: Sun },
                            { value: 'dark', label: 'Dark', icon: Moon },
                            { value: 'auto', label: 'Auto', icon: Monitor },
                        ].map(({ value, label, icon: Icon }) => (
                            <button
                                key={value}
                                type="button"
                                onClick={() => setTheme(value)}
                                className={`flex flex-col items-center gap-1 py-2.5 rounded-lg border text-xs font-medium transition ${
                                    theme === value
                                        ? 'border-primary bg-primary/10 text-primary'
                                        : 'border-gray-200 dark:border-dark-border text-gray-500 dark:text-dark-text-muted'
                                }`}
                            >
                                <Icon size={18} />
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                <form onSubmit={handleChangePassword} className="bg-white dark:bg-dark-card-bg rounded-2xl shadow-sm p-4 space-y-4">
                    <h2 className="text-sm font-bold text-gray-800 dark:text-dark-text flex items-center gap-1.5"><KeyRound size={16} /> Change Password</h2>
                    {passwordMessage && <div className="text-sm text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700/60 rounded-lg px-3 py-2">{passwordMessage}</div>}
                    {passwordError && <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/60 rounded-lg px-3 py-2">{passwordError}</div>}
                    <div>
                        <label className="text-xs font-semibold text-gray-500 dark:text-dark-text-muted uppercase tracking-wide">Current Password</label>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="mt-1 w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card-bg text-gray-900 dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-gray-500 dark:text-dark-text-muted uppercase tracking-wide">New Password</label>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            minLength={8}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="mt-1 w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card-bg text-gray-900 dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-gray-500 dark:text-dark-text-muted uppercase tracking-wide">Confirm New Password</label>
                        <div className="mt-1 relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                minLength={8}
                                value={confirmNewPassword}
                                onChange={(e) => setConfirmNewPassword(e.target.value)}
                                className="w-full pl-3 pr-9 py-2.5 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card-bg text-gray-900 dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm"
                            />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-dark-text-muted">
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={passwordSaving}
                        className="w-full flex items-center justify-center gap-2 bg-gray-100 dark:bg-dark-surface text-gray-700 dark:text-dark-text border border-gray-300 dark:border-dark-border font-semibold py-2.5 rounded-lg transition disabled:opacity-60"
                    >
                        {passwordSaving ? <Loader2 size={16} className="animate-spin" /> : <KeyRound size={16} />}
                        {passwordSaving ? 'Changing…' : 'Change Password'}
                    </button>
                </form>

                <button
                    onClick={handleReportIssue}
                    className="w-full flex items-center justify-center gap-2 bg-white dark:bg-dark-card-bg border border-gray-200 dark:border-dark-border rounded-2xl shadow-sm py-2.5 text-sm font-semibold text-gray-700 dark:text-dark-text hover:bg-gray-50 dark:hover:bg-dark-surface-hover transition"
                >
                    <MessageSquare size={16} /> Report an Issue
                </button>

                <button
                    onClick={() => handleLogout?.(false)}
                    className="w-full flex items-center justify-center gap-2 bg-white dark:bg-dark-card-bg border border-red-200 dark:border-red-700/60 rounded-2xl shadow-sm py-2.5 text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                >
                    <LogOut size={16} /> Log Out
                </button>
            </div>
        </div>
    );
};

export default LiteProfileSettings;
