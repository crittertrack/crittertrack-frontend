import React, { useState, useEffect } from 'react';
import './SystemSettingsTab.css';

export default function SystemSettingsTab({ API_BASE_URL, authToken }) {
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [settings, setSettings] = useState({});
    const [maintenanceMessage, setMaintenanceMessage] = useState('');

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setLoading(true);
        setError('');

        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/system-settings/all`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch settings');
            }

            setSettings(data.settings || {});
            setMaintenanceMessage(data.settings?.maintenance_message?.value || '');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const updateSetting = async (key, value, type = 'boolean') => {
        setSaving(true);
        setError('');
        setSuccess('');

        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/system-settings/${key}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({ value, type })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to update setting');
            }

            setSuccess(`Setting "${key}" updated successfully!`);
            
            // Update local state
            setSettings(prev => ({
                ...prev,
                [key]: { ...prev[key], value }
            }));

            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const toggleMaintenance = async () => {
        setSaving(true);
        setError('');
        setSuccess('');

        const currentlyEnabled = settings?.maintenance_mode?.value === true;

        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/maintenance/toggle`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({
                    enable: !currentlyEnabled,
                    message: maintenanceMessage || 'Site is under maintenance. Please check back soon.'
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to toggle maintenance mode');
            }

            setSuccess(currentlyEnabled ? 'Maintenance mode disabled!' : 'Maintenance mode enabled!');
            
            // Update local state
            setSettings(prev => ({
                ...prev,
                maintenance_mode: { ...prev.maintenance_mode, value: !currentlyEnabled },
                maintenance_message: { ...prev.maintenance_message, value: maintenanceMessage }
            }));

            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleToggle = (key) => {
        const currentValue = settings[key]?.value === true;
        updateSetting(key, !currentValue, 'boolean');
    };

    if (loading) {
        return <div className="loading-state">Loading settings...</div>;
    }

    return (
        <div className="system-settings-tab">
            <div className="tab-header">
                <h3>System Settings</h3>
                <button onClick={fetchSettings} className="btn-refresh" disabled={saving}>
                    🔄 Refresh
                </button>
            </div>

            {error && (
                <div className="error-message">
                    ⚠️ {error}
                </div>
            )}

            {success && (
                <div className="success-message">
                    ✓ {success}
                </div>
            )}

            {/* Maintenance Mode */}
            <section className="settings-section maintenance-section">
                <h4>🔧 Maintenance Mode</h4>
                <div className="maintenance-controls">
                    <div className="setting-item">
                        <div className="setting-info">
                            <strong>Enable Maintenance Mode</strong>
                            <p>When enabled, only administrators can access the site. All other users will see the maintenance message.</p>
                        </div>
                        <div className="setting-control">
                            <label className="toggle-switch">
                                <input
                                    type="checkbox"
                                    checked={settings?.maintenance_mode?.value === true}
                                    onChange={toggleMaintenance}
                                    disabled={saving}
                                />
                                <span className="toggle-slider"></span>
                            </label>
                            <span className={`status-badge ${settings?.maintenance_mode?.value ? 'active' : 'inactive'}`}>
                                {settings?.maintenance_mode?.value ? 'Enabled' : 'Disabled'}
                            </span>
                        </div>
                    </div>

                    <div className="maintenance-message-input">
                        <label>Maintenance Message (shown to users):</label>
                        <textarea
                            value={maintenanceMessage}
                            onChange={(e) => setMaintenanceMessage(e.target.value)}
                            placeholder="Site is under maintenance. Please check back soon."
                            rows="3"
                            disabled={saving}
                        />
                        <small>This message will be displayed to users when maintenance mode is enabled.</small>
                    </div>
                </div>
            </section>

            {/* Feature Toggles */}
            <section className="settings-section">
                <h4>✨ Features</h4>
                <div className="settings-grid">
                    <ToggleSetting
                        label="Litter Tracking"
                        description="Allow users to create and manage litter records"
                        settingKey="feature_litter_tracking"
                        value={settings?.feature_litter_tracking?.value}
                        onToggle={handleToggle}
                        disabled={saving}
                    />
                    <ToggleSetting
                        label="Genetic Analysis"
                        description="Enable genetic prediction and analysis features"
                        settingKey="feature_genetic_analysis"
                        value={settings?.feature_genetic_analysis?.value}
                        onToggle={handleToggle}
                        disabled={saving}
                    />
                    <ToggleSetting
                        label="User Messaging"
                        description="Allow users to send messages to each other"
                        settingKey="feature_messaging"
                        value={settings?.feature_messaging?.value}
                        onToggle={handleToggle}
                        disabled={saving}
                    />
                    <ToggleSetting
                        label="Public Profiles"
                        description="Allow users to have public profiles visible to others"
                        settingKey="feature_public_profiles"
                        value={settings?.feature_public_profiles?.value}
                        onToggle={handleToggle}
                        disabled={saving}
                    />
                </div>
            </section>

            {/* Security Settings */}
            <section className="settings-section">
                <h4>🔒 Security</h4>
                <div className="settings-grid">
                    <ToggleSetting
                        label="Require Email Verification"
                        description="Force users to verify their email before accessing features"
                        settingKey="security_require_email_verification"
                        value={settings?.security_require_email_verification?.value}
                        onToggle={handleToggle}
                        disabled={saving}
                    />
                    <ToggleSetting
                        label="Require 2FA for Moderators"
                        description="Require two-factor authentication for moderator and admin accounts"
                        settingKey="security_require_2fa_moderators"
                        value={settings?.security_require_2fa_moderators?.value}
                        onToggle={handleToggle}
                        disabled={saving}
                    />
                    <ToggleSetting
                        label="IP Logging"
                        description="Log IP addresses for security and moderation purposes"
                        settingKey="security_log_ips"
                        value={settings?.security_log_ips?.value}
                        onToggle={handleToggle}
                        disabled={saving}
                    />
                </div>
            </section>

            {/* Content Moderation */}
            <section className="settings-section">
                <h4>🛡️ Content Moderation</h4>
                <div className="settings-grid">
                    <ToggleSetting
                        label="Auto-Moderate New Accounts"
                        description="Require manual approval for content from accounts less than 7 days old"
                        settingKey="moderation_auto_moderate_new"
                        value={settings?.moderation_auto_moderate_new?.value}
                        onToggle={handleToggle}
                        disabled={saving}
                    />
                    <ToggleSetting
                        label="Auto-Hide Reported Content"
                        description="Automatically hide content after a certain number of reports"
                        settingKey="moderation_auto_hide_reported"
                        value={settings?.moderation_auto_hide_reported?.value}
                        onToggle={handleToggle}
                        disabled={saving}
                    />
                </div>
            </section>

            <div className="info-footer">
                <p>⚠️ Changes to these settings take effect immediately. Use caution when modifying security and feature settings.</p>
                <p>All changes are logged in the Audit Log for accountability.</p>
            </div>
        </div>
    );
}

function ToggleSetting({ label, description, settingKey, value, onToggle, disabled }) {
    return (
        <div className="setting-item">
            <div className="setting-info">
                <strong>{label}</strong>
                <p>{description}</p>
            </div>
            <div className="setting-control">
                <label className="toggle-switch">
                    <input
                        type="checkbox"
                        checked={value === true}
                        onChange={() => onToggle(settingKey)}
                        disabled={disabled}
                    />
                    <span className="toggle-slider"></span>
                </label>
            </div>
        </div>
    );
}
