import React, { useState } from 'react';
import { Toggle, Loader2, Save, RefreshCw, Eye, Mail } from 'lucide-react';

const SystemSettings = ({ authToken, API_BASE_URL }) => {
    const [settings, setSettings] = useState({
        litterTrackingEnabled: true,
        geneticAnalysisEnabled: true,
        communityMessagingEnabled: true,
        defaultPrivacyLevel: 'private',
        requireModerationForEdits: false,
        sessionTimeoutMinutes: 60,
        backupFrequency: 'daily',
        enableTwoFactorAuth: true
    });
    const [saving, setSaving] = useState(false);
    const [apiKeys, setApiKeys] = useState([]);
    const [showApiKeyForm, setShowApiKeyForm] = useState(false);
    const [newApiKeyName, setNewApiKeyName] = useState('');

    const handleSettingChange = (key, value) => {
        setSettings(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handleSaveSettings = async () => {
        setSaving(true);
        try {
            const response = await fetch(`${API_BASE_URL}/admin/system-settings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify(settings)
            });
            if (response.ok) {
                alert('Settings saved successfully');
            }
        } catch (error) {
            console.error('Error saving settings:', error);
            alert('Error saving settings');
        } finally {
            setSaving(false);
        }
    };

    const handleGenerateApiKey = async () => {
        if (!newApiKeyName) {
            alert('Please enter a name for the API key');
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/admin/api-keys`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({ name: newApiKeyName })
            });
            if (response.ok) {
                const data = await response.json();
                setApiKeys([...apiKeys, data]);
                setNewApiKeyName('');
                setShowApiKeyForm(false);
            }
        } catch (error) {
            console.error('Error generating API key:', error);
        }
    };

    return (
        <div className="p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-8">System Settings</h3>

            {/* Feature Toggles */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
                <h4 className="font-bold text-gray-800 mb-4">Feature Toggles</h4>
                <div className="space-y-4">
                    {[
                        { key: 'litterTrackingEnabled', label: 'Litter Tracking' },
                        { key: 'geneticAnalysisEnabled', label: 'Genetic Analysis' },
                        { key: 'communityMessagingEnabled', label: 'Community Messaging' },
                        { key: 'enableTwoFactorAuth', label: 'Two-Factor Authentication' },
                        { key: 'requireModerationForEdits', label: 'Require Moderation for Edits' }
                    ].map(feature => (
                        <div key={feature.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <label className="font-medium text-gray-700">{feature.label}</label>
                            <button
                                onClick={() => handleSettingChange(feature.key, !settings[feature.key])}
                                className={`relative inline-flex h-6 w-11 rounded-full transition ${
                                    settings[feature.key] ? 'bg-green-600' : 'bg-gray-300'
                                }`}
                            >
                                <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
                                    settings[feature.key] ? 'translate-x-5' : 'translate-x-1'
                                } my-auto`} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Configuration Settings */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
                <h4 className="font-bold text-gray-800 mb-4">Configuration</h4>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Default Privacy Level
                        </label>
                        <select
                            value={settings.defaultPrivacyLevel}
                            onChange={(e) => handleSettingChange('defaultPrivacyLevel', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600"
                        >
                            <option value="public">Public</option>
                            <option value="private">Private</option>
                            <option value="friends-only">Friends Only</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Session Timeout (minutes)
                        </label>
                        <input
                            type="number"
                            value={settings.sessionTimeoutMinutes}
                            onChange={(e) => handleSettingChange('sessionTimeoutMinutes', parseInt(e.target.value))}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Backup Frequency
                        </label>
                        <select
                            value={settings.backupFrequency}
                            onChange={(e) => handleSettingChange('backupFrequency', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600"
                        >
                            <option value="hourly">Hourly</option>
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                        </select>
                    </div>
                </div>

                <button
                    onClick={handleSaveSettings}
                    disabled={saving}
                    className="mt-6 w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    {saving ? (
                        <>
                            <Loader2 className="animate-spin" size={20} />
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save size={20} />
                            Save Settings
                        </>
                    )}
                </button>
            </div>

            {/* API Keys Management */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-gray-800">API Keys</h4>
                    <button
                        onClick={() => setShowApiKeyForm(!showApiKeyForm)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        Generate New Key
                    </button>
                </div>

                {showApiKeyForm && (
                    <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                        <input
                            type="text"
                            value={newApiKeyName}
                            onChange={(e) => setNewApiKeyName(e.target.value)}
                            placeholder="API Key Name"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-3"
                        />
                        <button
                            onClick={handleGenerateApiKey}
                            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                        >
                            Generate
                        </button>
                    </div>
                )}

                <div className="space-y-2">
                    {apiKeys.length === 0 ? (
                        <p className="text-gray-600">No API keys generated yet</p>
                    ) : (
                        apiKeys.map(key => (
                            <div key={key.id} className="p-3 bg-gray-50 rounded-lg flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-gray-800">{key.name}</p>
                                    <p className="text-xs text-gray-600 font-mono">{key.key}</p>
                                </div>
                                <button className="text-red-600 hover:bg-red-50 p-2 rounded">
                                    Revoke
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default SystemSettings;
