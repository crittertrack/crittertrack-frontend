# CritterTrack Admin Panel - Complete API Endpoint Documentation

## Overview
This document outlines all backend API endpoints required to support the comprehensive admin panel system implemented in the frontend.

**Frontend Components:**
- `src/components/EnhancedAdminPanel.jsx` - Main admin dashboard
- `src/components/admin/UserManagement.jsx` - User account management
- `src/components/admin/AnimalManagement.jsx` - Animal records management
- `src/components/admin/ModerationTools.jsx` - Content moderation
- `src/components/admin/SystemSettings.jsx` - System configuration
- `src/components/admin/Reports.jsx` - Analytics and reporting
- `src/components/admin/Communication.jsx` - Broadcast messaging
- `src/components/admin/DataAudit.jsx` - Data integrity and auditing

---

## 1. ADMIN AUTHENTICATION

### POST `/api/admin/verify-password`
Verify admin password before granting access to admin panel.

**Request:**
```json
{
  "password": "admin_password_here"
}
```

**Response (200 OK):**
```json
{
  "authenticated": true
}
```

**Response (401 Unauthorized):**
```json
{
  "error": "Invalid password"
}
```

---

## 2. DASHBOARD & ANALYTICS

### GET `/api/admin/dashboard-stats`
Fetch overall system statistics for dashboard.

**Headers:** `Authorization: Bearer {authToken}`

**Response (200 OK):**
```json
{
  "totalUsers": 150,
  "activeUsers": 45,
  "totalAnimals": 2340,
  "pendingReports": 8,
  "systemHealth": "good",
  "lastBackup": "2025-01-02T15:30:00Z"
}
```

---

## 3. USER MANAGEMENT

### GET `/api/admin/users`
Retrieve list of all users with pagination and filtering.

**Query Parameters:**
- `limit` (optional): Number of users per page (default: 50)
- `offset` (optional): Pagination offset (default: 0)
- `status` (optional): Filter by status ('active', 'suspended', 'banned')
- `role` (optional): Filter by role ('admin', 'moderator', 'user')
- `search` (optional): Search by email or username

**Response (200 OK):**
```json
[
  {
    "id": "user_id_123",
    "email": "user@example.com",
    "username": "username123",
    "id_public": "CTU1",
    "role": "admin",
    "status": "active",
    "twoFactorEnabled": true,
    "createdAt": "2024-01-01T00:00:00Z",
    "lastLogin": "2025-01-02T14:30:00Z"
  }
]
```

### GET `/api/admin/users/{userId}/login-history`
Get login history for a specific user.

**Response (200 OK):**
```json
[
  {
    "timestamp": "2025-01-02T14:30:00Z",
    "ipAddress": "192.168.1.1",
    "status": "success"
  },
  {
    "timestamp": "2025-01-02T10:15:00Z",
    "ipAddress": "192.168.1.2",
    "status": "failed"
  }
]
```

### PATCH `/api/admin/users/{userId}/status`
Change user status (suspend/activate/ban).

**Request:**
```json
{
  "status": "suspended"
}
```

**Response (200 OK):**
```json
{
  "id": "user_id_123",
  "status": "suspended"
}
```

### POST `/api/admin/users/{userId}/reset-password`
Send password reset email to user.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Password reset email sent"
}
```

### POST `/api/admin/users`
Create new user account.

**Request:**
```json
{
  "email": "newuser@example.com",
  "username": "newusername",
  "password": "temporary_password",
  "role": "user"
}
```

**Response (201 Created):**
```json
{
  "id": "new_user_id",
  "email": "newuser@example.com",
  "username": "newusername",
  "role": "user",
  "status": "active"
}
```

### PATCH `/api/admin/users/{userId}`
Update user details.

**Request:**
```json
{
  "role": "moderator",
  "twoFactorEnabled": true
}
```

**Response (200 OK):**
```json
{
  "id": "user_id_123",
  "role": "moderator",
  "twoFactorEnabled": true
}
```

### DELETE `/api/admin/users/{userId}`
Delete user account.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "User deleted"
}
```

---

## 4. ANIMAL RECORDS MANAGEMENT

### GET `/api/admin/animals`
Retrieve all animal records with optional filtering.

**Query Parameters:**
- `limit` (optional): Results per page (default: 50)
- `offset` (optional): Pagination offset (default: 0)
- `status` (optional): Filter by status
- `species` (optional): Filter by species
- `owner` (optional): Filter by owner ID

**Response (200 OK):**
```json
[
  {
    "id": "animal_id_123",
    "id_public": "FM001",
    "name": "Whiskers",
    "species": "Fancy Mouse",
    "gender": "Female",
    "status": "available",
    "ownerUsername": "breeder123",
    "ownerId": "user_456",
    "createdAt": "2024-06-15T00:00:00Z",
    "updatedAt": "2025-01-02T00:00:00Z"
  }
]
```

### POST `/api/admin/animals/bulk-update`
Perform bulk updates on multiple animals.

**Request:**
```json
{
  "animalIds": ["animal_123", "animal_456", "animal_789"],
  "updates": {
    "status": "sold",
    "visibility": "archived"
  }
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "updated": 3,
  "failed": 0
}
```

### POST `/api/admin/animals/import`
Import animals from CSV/XLSX/JSON file.

**Content-Type:** multipart/form-data

**Form Data:**
- `file`: Binary file data

**Response (200 OK):**
```json
{
  "success": 45,
  "failed": 2,
  "errors": [
    {
      "row": 3,
      "error": "Invalid species value"
    }
  ]
}
```

### GET `/api/admin/animals/export/csv`
Export all animal records as CSV.

**Response:** 200 OK with CSV file (attachment)

### GET `/api/admin/animals/export/json`
Export all animal records as JSON.

**Response:** 200 OK with JSON file (attachment)

### POST `/api/admin/animals/{animalId}/merge`
Merge duplicate animal records.

**Request:**
```json
{
  "mergeWithId": "animal_456",
  "keepData": "primary"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "mergedRecord": { /* merged animal data */ }
}
```

### GET `/api/admin/animals/{animalId}/history`
Get version history for an animal record.

**Response (200 OK):**
```json
[
  {
    "version": 1,
    "timestamp": "2024-06-15T00:00:00Z",
    "changedBy": "user_123",
    "changes": {
      "status": { "from": "breeder", "to": "available" }
    }
  }
]
```

---

## 5. MODERATION & CONTENT REVIEW

### GET `/api/admin/reports`
Fetch content reports and user edit approvals.

**Query Parameters:**
- `status`: Filter by status ('open', 'in-review', 'resolved', 'dismissed')
- `type` (optional): Filter by type ('inappropriate-content', 'incorrect-data', 'edit-approval')

**Response (200 OK):**
```json
[
  {
    "id": "report_123",
    "type": "inappropriate-content",
    "title": "Offensive comment",
    "description": "User posted offensive language in animal description",
    "reportedUserId": "user_789",
    "reporterUsername": "user_456",
    "reporterUserId": "user_456",
    "status": "open",
    "createdAt": "2025-01-02T10:00:00Z"
  }
]
```

### POST `/api/admin/reports/{reportId}/approve`
Approve a pending edit.

**Request:**
```json
{
  "note": "Edit looks good, changes approved"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "approved": true
}
```

### POST `/api/admin/reports/{reportId}/reject`
Reject a pending edit.

**Request:**
```json
{
  "note": "Genetic data does not match records"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "rejected": true
}
```

### POST `/api/admin/reports/{reportId}/resolve`
Resolve a report.

**Request:**
```json
{
  "note": "User suspended for 7 days"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "status": "resolved"
}
```

### POST `/api/admin/reports/{reportId}/dismiss`
Dismiss a report without action.

**Request:**
```json
{
  "note": "Report lacks sufficient evidence"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "status": "dismissed"
}
```

### POST `/api/admin/send-moderator-message`
Send moderator message to user about a report.

**Request:**
```json
{
  "userId": "user_789",
  "reportId": "report_123",
  "message": "Your data entry had inconsistencies. Please review and correct."
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "messageSent": true
}
```

---

## 6. SYSTEM SETTINGS & CONFIGURATION

### GET `/api/admin/system-settings`
Retrieve current system settings.

**Response (200 OK):**
```json
{
  "litterTrackingEnabled": true,
  "geneticAnalysisEnabled": true,
  "communityMessagingEnabled": true,
  "defaultPrivacyLevel": "private",
  "requireModerationForEdits": false,
  "sessionTimeoutMinutes": 60,
  "backupFrequency": "daily",
  "enableTwoFactorAuth": true
}
```

### POST `/api/admin/system-settings`
Update system settings.

**Request:**
```json
{
  "litterTrackingEnabled": true,
  "geneticAnalysisEnabled": true,
  "defaultPrivacyLevel": "friends-only",
  "requireModerationForEdits": true,
  "sessionTimeoutMinutes": 90
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "updatedFields": ["defaultPrivacyLevel", "sessionTimeoutMinutes"]
}
```

### GET `/api/admin/api-keys`
List all generated API keys.

**Response (200 OK):**
```json
[
  {
    "id": "key_123",
    "name": "Mobile App",
    "key": "sk_live_51234567890abcdef",
    "createdAt": "2024-12-01T00:00:00Z",
    "lastUsed": "2025-01-02T14:00:00Z",
    "isActive": true
  }
]
```

### POST `/api/admin/api-keys`
Generate new API key.

**Request:**
```json
{
  "name": "Third Party Integration"
}
```

**Response (201 Created):**
```json
{
  "id": "key_456",
  "name": "Third Party Integration",
  "key": "sk_live_9876543210fedcba",
  "createdAt": "2025-01-02T15:00:00Z"
}
```

### DELETE `/api/admin/api-keys/{keyId}`
Revoke an API key.

**Response (200 OK):**
```json
{
  "success": true,
  "revoked": true
}
```

---

## 7. REPORTS & ANALYTICS

### GET `/api/admin/reports/analytics`
Get analytics and statistics.

**Query Parameters:**
- `range`: Time range ('week', 'month', 'year')

**Response (200 OK):**
```json
{
  "totalAnimals": 2340,
  "totalLitters": 145,
  "activeUsers": 45,
  "totalUsers": 150,
  "recentSignups": 5,
  "averageAnimalsPerUser": 15.6,
  "topSpecies": [
    { "name": "Fancy Mouse", "count": 1200 },
    { "name": "Fancy Rat", "count": 800 },
    { "name": "Hamster", "count": 340 }
  ]
}
```

### GET `/api/admin/reports/export`
Export report data.

**Query Parameters:**
- `format`: Export format ('pdf', 'csv', 'json')
- `range` (optional): Time range

**Response:** 200 OK with file attachment

---

## 8. COMMUNICATION & MESSAGING

### POST `/api/admin/send-broadcast`
Send broadcast message to all/selected users.

**Request:**
```json
{
  "message": "System maintenance scheduled for tonight",
  "recipientType": "all",
  "type": "announcement"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "sentTo": 150
}
```

### GET `/api/admin/email-templates`
Get all email templates.

**Response (200 OK):**
```json
[
  {
    "id": "template_123",
    "name": "Welcome Email",
    "content": "Welcome to CritterTrack...",
    "createdAt": "2024-01-01T00:00:00Z"
  }
]
```

### POST `/api/admin/email-templates`
Create new email template.

**Request:**
```json
{
  "name": "Password Reset",
  "content": "Click here to reset your password: {{resetLink}}"
}
```

**Response (201 Created):**
```json
{
  "id": "template_456",
  "name": "Password Reset",
  "content": "Click here to reset your password: {{resetLink}}"
}
```

### DELETE `/api/admin/email-templates/{templateId}`
Delete email template.

**Response (200 OK):**
```json
{
  "success": true
}
```

### GET `/api/admin/moderator-chat`
Get moderator chat messages.

**Response (200 OK):**
```json
[
  {
    "id": "msg_123",
    "author": "Moderator Name",
    "content": "I need help reviewing report 456",
    "timestamp": "2025-01-02T14:00:00Z"
  }
]
```

### POST `/api/admin/moderator-chat`
Post message to moderator chat.

**Request:**
```json
{
  "content": "This user needs immediate attention"
}
```

**Response (201 Created):**
```json
{
  "id": "msg_124",
  "author": "Current User",
  "content": "This user needs immediate attention",
  "timestamp": "2025-01-02T14:05:00Z"
}
```

---

## 9. DATA INTEGRITY & AUDITING

### GET `/api/admin/audit-logs`
Get system audit logs.

**Query Parameters:**
- `limit` (optional): Results per page (default: 50)
- `offset` (optional): Pagination offset
- `action` (optional): Filter by action type ('CREATE', 'UPDATE', 'DELETE')
- `resourceType` (optional): Filter by resource type

**Response (200 OK):**
```json
[
  {
    "id": "log_123",
    "timestamp": "2025-01-02T14:00:00Z",
    "userId": "user_123",
    "action": "UPDATE",
    "resourceType": "animal",
    "resourceId": "animal_456",
    "details": "Status changed from 'breeder' to 'available'"
  }
]
```

### GET `/api/admin/backups`
Get list of database backups.

**Response (200 OK):**
```json
[
  {
    "id": "backup_123",
    "name": "2025-01-02_backup",
    "sizeBytes": 52428800,
    "createdAt": "2025-01-02T03:00:00Z",
    "duration": 450
  }
]
```

### POST `/api/admin/trigger-backup`
Trigger immediate database backup.

**Response (200 OK):**
```json
{
  "success": true,
  "backupId": "backup_124",
  "message": "Backup started"
}
```

### POST `/api/admin/restore-backup/{backupId}`
Restore database from backup.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Database restored successfully"
}
```

**WARNING:** This will overwrite current data.

### GET `/api/admin/backups/{backupId}/download`
Download backup file.

**Response:** 200 OK with SQL file

### GET `/api/admin/validation-rules`
Get field validation rules.

**Response (200 OK):**
```json
[
  {
    "id": "rule_123",
    "field": "name",
    "type": "required",
    "value": null
  },
  {
    "id": "rule_124",
    "field": "species",
    "type": "enum",
    "value": "Fancy Mouse,Fancy Rat,Hamster,Guinea Pig"
  }
]
```

### POST `/api/admin/validation-rules`
Create new field validation rule.

**Request:**
```json
{
  "field": "geneticCode",
  "type": "format",
  "value": "^[A-Za-z0-9-]+$"
}
```

**Response (201 Created):**
```json
{
  "id": "rule_125",
  "field": "geneticCode",
  "type": "format",
  "value": "^[A-Za-z0-9-]+$"
}
```

### DELETE `/api/admin/validation-rules/{ruleId}`
Delete validation rule.

**Response (200 OK):**
```json
{
  "success": true
}
```

---

## 10. MAINTENANCE MODE

### GET `/api/admin/maintenance-status`
Check maintenance mode status.

**Response (200 OK):**
```json
{
  "active": false,
  "message": "System is operating normally",
  "activatedAt": null,
  "expectedEndTime": null
}
```

### POST `/api/admin/toggle-maintenance-mode`
Activate/deactivate maintenance mode.

**Request:**
```json
{
  "active": true,
  "message": "Database migration in progress. Estimated time: 2 hours"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "active": true,
  "message": "Maintenance mode activated",
  "usersNotified": 45
}
```

---

## 11. URGENT NOTIFICATIONS

### POST `/api/admin/send-urgent-notification`
Send urgent on-screen alert to active users.

**Request:**
```json
{
  "title": "SECURITY INCIDENT",
  "content": "Suspicious activity detected. Please change your password immediately."
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "usersNotified": 42
}
```

### GET `/api/admin/urgent-notifications-stream`
EventSource endpoint for real-time urgent notifications.

**Implementation:** Server-sent events
**Event name:** `urgent-alert`
**Event data format:**
```json
{
  "title": "URGENT",
  "content": "Alert message"
}
```

---

## ERROR RESPONSES

All endpoints should return appropriate error responses:

### 400 Bad Request
```json
{
  "error": "Invalid request parameters",
  "details": "Field 'email' is required"
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Invalid or expired authentication token"
}
```

### 403 Forbidden
```json
{
  "error": "Forbidden",
  "message": "User does not have permission to perform this action"
}
```

### 404 Not Found
```json
{
  "error": "Not Found",
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal Server Error",
  "message": "An unexpected error occurred"
}
```

---

## AUTHENTICATION

All endpoints require Bearer token authentication in header:
```
Authorization: Bearer {authToken}
```

Endpoints also require the user to have admin role (`user.role === 'admin'`), except:
- Moderation endpoints can be accessed by moderators
- Some read-only endpoints can be accessed by higher-privilege users

---

## RATE LIMITING

Recommended rate limits:
- Authentication endpoints: 5 requests per minute per IP
- Write endpoints: 100 requests per minute per user
- Read endpoints: 1000 requests per minute per user

---

## NOTES FOR BACKEND IMPLEMENTATION

1. **Password Security**: Admin passwords should be hashed using bcrypt with salt factor ≥ 10
2. **Audit Logging**: All admin actions should be logged with timestamp, user ID, action type, and affected resources
3. **Transaction Safety**: Bulk operations and restores should use database transactions
4. **Email Delivery**: Broadcast messages should be queued asynchronously
5. **Real-time**: Urgent notifications should use WebSocket or Server-Sent Events
6. **Backup Strategy**: Automate backups according to `backupFrequency` setting
7. **Data Retention**: Implement retention policies for audit logs and reports
8. **Performance**: Consider indexing on frequently filtered fields (user status, animal species, report status)

---

## INTEGRATION CHECKLIST

- [ ] Create all endpoint routes
- [ ] Implement authentication middleware
- [ ] Add authorization checks (admin/moderator roles)
- [ ] Set up database migrations for audit logs table
- [ ] Implement backup/restore functionality
- [ ] Set up email template system
- [ ] Configure real-time notification delivery
- [ ] Add rate limiting
- [ ] Implement request validation
- [ ] Set up error handling and logging
- [ ] Create admin user setup process
- [ ] Test all endpoints with admin panel UI
- [ ] Document API for external integrations
