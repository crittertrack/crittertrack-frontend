import React, { useState, useEffect } from 'react';
import { HardDrive, RotateCcw, Lock, Eye, Loader2, Download, Upload, AlertTriangle } from 'lucide-react';

const DataAudit = ({ authToken, API_BASE_URL }) => {
    const [auditLogs, setAuditLogs] = useState([]);
    const [backups, setBackups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showRestoreDialog, setShowRestoreDialog] = useState(false);
    const [selectedBackup, setSelectedBackup] = useState(null);
    const [validationRules, setValidationRules] = useState([]);
    const [showRuleForm, setShowRuleForm] = useState(false);
    const [newRule, setNewRule] = useState({
        field: '',
        type: 'required', // 'required', 'format', 'length', 'enum'
        value: ''
    });

    useEffect(() => {
        fetchAuditData();
    }, []);

    const fetchAuditData = async () => {
        try {
            setLoading(true);
            const [logsRes, backupsRes, rulesRes] = await Promise.all([
                fetch(`${API_BASE_URL}/admin/audit-logs`, {
                    headers: { 'Authorization': `Bearer ${authToken}` }
                }),
                fetch(`${API_BASE_URL}/admin/backups`, {
                    headers: { 'Authorization': `Bearer ${authToken}` }
                }),
                fetch(`${API_BASE_URL}/admin/validation-rules`, {
                    headers: { 'Authorization': `Bearer ${authToken}` }
                })
            ]);

            if (logsRes.ok) {
                const data = await logsRes.json();
                setAuditLogs(data);
            }

            if (backupsRes.ok) {
                const data = await backupsRes.json();
                setBackups(data);
            }

            if (rulesRes.ok) {
                const data = await rulesRes.json();
                setValidationRules(data);
            }
        } catch (error) {
            console.error('Error fetching audit data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleTriggerBackup = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/trigger-backup`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${authToken}` }
            });

            if (response.ok) {
                alert('Backup started. This may take a few minutes.');
                fetchAuditData();
            }
        } catch (error) {
            console.error('Error triggering backup:', error);
        }
    };

    const handleRestoreBackup = async () => {
        if (!selectedBackup) {
            alert('Please select a backup');
            return;
        }

        if (!confirm('This will restore the database to the selected backup. Continue?')) {
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/admin/restore-backup/${selectedBackup.id}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${authToken}` }
            });

            if (response.ok) {
                alert('Database restored successfully');
                setShowRestoreDialog(false);
                fetchAuditData();
            }
        } catch (error) {
            console.error('Error restoring backup:', error);
        }
    };

    const handleDownloadBackup = async (backupId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/backups/${backupId}/download`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `backup_${backupId}.sql`;
                a.click();
            }
        } catch (error) {
            console.error('Error downloading backup:', error);
        }
    };

    const handleSaveValidationRule = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/validation-rules`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify(newRule)
            });

            if (response.ok) {
                fetchAuditData();
                setNewRule({ field: '', type: 'required', value: '' });
                setShowRuleForm(false);
            }
        } catch (error) {
            console.error('Error saving validation rule:', error);
        }
    };

    return (
        <div className="p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-8">Data Integrity & Auditing</h3>

            {loading ? (
                <div className="flex justify-center py-8">
                    <Loader2 className="animate-spin" size={32} />
                </div>
            ) : (
                <div className="space-y-8">
                    {/* Backups Section */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="font-bold text-gray-800 flex items-center gap-2">
                                <HardDrive size={20} />
                                Database Backups
                            </h4>
                            <button
                                onClick={handleTriggerBackup}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                            >
                                Create Backup Now
                            </button>
                        </div>

                        <div className="space-y-2">
                            {backups.length === 0 ? (
                                <p className="text-gray-600">No backups available</p>
                            ) : (
                                backups.map(backup => (
                                    <div key={backup.id} className="p-4 bg-gray-50 rounded-lg flex items-center justify-between">
                                        <div>
                                            <p className="font-medium text-gray-800">{backup.name}</p>
                                            <p className="text-xs text-gray-600">
                                                Size: {(backup.sizeBytes / 1024 / 1024).toFixed(2)} MB • {new Date(backup.createdAt).toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => {
                                                    setSelectedBackup(backup);
                                                    setShowRestoreDialog(true);
                                                }}
                                                className="px-3 py-1 bg-orange-600 text-white rounded text-sm hover:bg-orange-700"
                                            >
                                                Restore
                                            </button>
                                            <button
                                                onClick={() => handleDownloadBackup(backup.id)}
                                                className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 flex items-center gap-1"
                                            >
                                                <Download size={14} />
                                                Download
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Audit Logs Section */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Eye size={20} />
                            Recent Audit Logs
                        </h4>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-4 py-2 text-left font-semibold text-gray-700">Timestamp</th>
                                        <th className="px-4 py-2 text-left font-semibold text-gray-700">User</th>
                                        <th className="px-4 py-2 text-left font-semibold text-gray-700">Action</th>
                                        <th className="px-4 py-2 text-left font-semibold text-gray-700">Resource</th>
                                        <th className="px-4 py-2 text-left font-semibold text-gray-700">Details</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {auditLogs.slice(0, 10).map((log, index) => (
                                        <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                            <td className="px-4 py-2 text-gray-800">{new Date(log.timestamp).toLocaleString()}</td>
                                            <td className="px-4 py-2 text-gray-800">{log.userId}</td>
                                            <td className="px-4 py-2">
                                                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                                    log.action === 'CREATE' ? 'bg-green-100 text-green-800' :
                                                    log.action === 'UPDATE' ? 'bg-blue-100 text-blue-800' :
                                                    log.action === 'DELETE' ? 'bg-red-100 text-red-800' :
                                                    'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {log.action}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2 text-gray-800">{log.resourceType}</td>
                                            <td className="px-4 py-2 text-gray-600 truncate max-w-xs">{log.details}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Validation Rules Section */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="font-bold text-gray-800 flex items-center gap-2">
                                <Lock size={20} />
                                Field Validation Rules
                            </h4>
                            <button
                                onClick={() => setShowRuleForm(!showRuleForm)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                            >
                                Add Rule
                            </button>
                        </div>

                        {showRuleForm && (
                            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                                <div className="grid grid-cols-3 gap-4 mb-4">
                                    <input
                                        type="text"
                                        value={newRule.field}
                                        onChange={(e) => setNewRule({ ...newRule, field: e.target.value })}
                                        placeholder="Field Name"
                                        className="px-4 py-2 border border-gray-300 rounded-lg"
                                    />
                                    <select
                                        value={newRule.type}
                                        onChange={(e) => setNewRule({ ...newRule, type: e.target.value })}
                                        className="px-4 py-2 border border-gray-300 rounded-lg"
                                    >
                                        <option value="required">Required</option>
                                        <option value="format">Format</option>
                                        <option value="length">Length</option>
                                        <option value="enum">Enum</option>
                                    </select>
                                    <input
                                        type="text"
                                        value={newRule.value}
                                        onChange={(e) => setNewRule({ ...newRule, value: e.target.value })}
                                        placeholder="Validation Value"
                                        className="px-4 py-2 border border-gray-300 rounded-lg"
                                    />
                                </div>
                                <button
                                    onClick={handleSaveValidationRule}
                                    className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                >
                                    Save Rule
                                </button>
                            </div>
                        )}

                        <div className="space-y-2">
                            {validationRules.length === 0 ? (
                                <p className="text-gray-600">No validation rules defined</p>
                            ) : (
                                validationRules.map((rule, index) => (
                                    <div key={index} className="p-3 bg-gray-50 rounded-lg flex items-center justify-between">
                                        <div>
                                            <p className="font-medium text-gray-800">{rule.field}</p>
                                            <p className="text-xs text-gray-600">{rule.type}: {rule.value}</p>
                                        </div>
                                        <button className="text-red-600 hover:bg-red-50 p-2 rounded">Delete</button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Restore Confirmation Dialog */}
            {showRestoreDialog && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                        <div className="flex items-center gap-3 mb-4 text-red-600">
                            <AlertTriangle size={24} />
                            <h3 className="text-xl font-bold">Confirm Restore</h3>
                        </div>
                        <p className="text-gray-700 mb-6">
                            This will restore the database to backup from {selectedBackup && new Date(selectedBackup.createdAt).toLocaleString()}. 
                            <strong> All changes made after this date will be lost.</strong>
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowRestoreDialog(false)}
                                className="flex-1 px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleRestoreBackup}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                            >
                                Restore
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DataAudit;
