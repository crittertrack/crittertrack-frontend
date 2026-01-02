# Two-Factor Authentication (2FA) Implementation Guide

## Overview

This guide provides complete instructions for implementing the two-factor authentication (2FA) system for admin and moderator access to CritterTrack's admin panel. The system uses email-based one-time verification codes combined with login tracking for enhanced security.

## Architecture

### Frontend Flow

```
1. Admin/Moderator opens admin panel
2. Password prompt shown
3. Enter password → verify against backend
4. If password correct → Show TwoFactorAuth modal
5. System sends 6-digit code to email
6. User enters code in modal
7. Code verified against backend
8. If code valid → Grant access to admin panel
9. Login attempt recorded with metadata
```

### Frontend Components

**Main Component:**
- `src/components/EnhancedAdminPanel.jsx` - Main admin dashboard with authentication flow

**Authentication Components:**
- `src/components/TwoFactorAuth.jsx` - Email code verification modal (140 lines)
- `src/components/LoginTracking.jsx` - Login history display component (165 lines)

**Feature Modules:**
- `src/components/admin/UserManagement.jsx` - User CRUD operations
- `src/components/admin/AnimalManagement.jsx` - Animal records management
- `src/components/admin/ModerationTools.jsx` - Content moderation
- `src/components/admin/SystemSettings.jsx` - System configuration
- `src/components/admin/Reports.jsx` - Analytics and reporting
- `src/components/admin/Communication.jsx` - Broadcast messaging
- `src/components/admin/DataAudit.jsx` - Data integrity auditing

---

## Implementation Steps

### Step 1: Frontend Integration (COMPLETE)

**Status:** ✅ Complete

**Files Modified:**
- `src/components/EnhancedAdminPanel.jsx` - Updated with 2FA flow
- `src/components/TwoFactorAuth.jsx` - Created (140 lines)
- `src/components/LoginTracking.jsx` - Created (165 lines)

**What's Done:**
1. ✅ Password verification layer
2. ✅ 2FA modal display after password success
3. ✅ 6-digit code input with validation
4. ✅ 5-minute countdown timer
5. ✅ Code resend functionality
6. ✅ Device information capture (User-Agent, Platform, Language, Timezone, Screen Resolution)
7. ✅ Login tracking integration points
8. ✅ Login history display in dashboard

**Component Integration Points:**
```javascript
// In EnhancedAdminPanel.jsx
1. Password verification → POST /api/admin/verify-password
2. Show 2FA modal → <TwoFactorAuth {...props} />
3. Verify 2FA code → POST /api/admin/verify-2fa
4. Track login → POST /api/admin/track-login
5. Display history → <LoginTracking {...props} />
```

---

### Step 2: Backend API Endpoints (REQUIRED)

**Status:** ⏳ Pending Backend Implementation

#### 2.1 Send 2FA Code Endpoint

**Endpoint:** `POST /api/admin/send-2fa-code`

**Purpose:** Generate and send a 6-digit verification code to admin/moderator email

**Request:**
```json
{
  "email": "admin@crittertrack.com",
  "userId": "admin_user_id_123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "6-digit code sent to admin@crittertrack.com",
  "expiresIn": 300,
  "codeId": "code_session_id"
}
```

**Implementation Notes:**
- Generate 6 random digits (000000-999999)
- Hash and store in database (linked to user + session)
- Set expiry to 5 minutes (300 seconds) from generation
- Send via email service with message like: "Your CritterTrack admin verification code is: 123456. This code expires in 5 minutes."
- Rate limit: 1 code per user every 60 seconds
- Store attempt timestamp for security audit

**Code Generation Pseudo-code:**
```python
import secrets
import time
import hashlib

# Generate 6-digit code
code = str(secrets.randbelow(1000000)).zfill(6)  # e.g., "123456"

# Hash for storage
code_hash = hashlib.sha256(code.encode()).hexdigest()

# Store in database
db.insert('admin_2fa_codes', {
    'user_id': user_id,
    'code_hash': code_hash,
    'created_at': datetime.now(),
    'expires_at': datetime.now() + timedelta(minutes=5),
    'used': False,
    'attempts': 0
})

# Send email
send_email(
    to=email,
    subject='CritterTrack Admin Verification Code',
    body=f'Your verification code is: {code}\n\nThis code expires in 5 minutes.'
)
```

---

#### 2.2 Verify 2FA Code Endpoint

**Endpoint:** `POST /api/admin/verify-2fa`

**Purpose:** Verify the 6-digit code entered by user

**Request:**
```json
{
  "code": "123456"
}
```

**Response (200 OK):**
```json
{
  "authenticated": true,
  "message": "2FA verification successful",
  "sessionToken": "extended_session_token"
}
```

**Response (400 Bad Request):**
```json
{
  "error": "Invalid or expired code",
  "attemptsRemaining": 2
}
```

**Response (429 Too Many Requests):**
```json
{
  "error": "Too many failed attempts. Please request a new code."
}
```

**Implementation Notes:**
- Verify code against stored hash
- Check expiry (must be within 5 minutes)
- Increment attempt counter (max 5 attempts)
- Mark code as used immediately after successful verification
- Return extended session token for admin panel access
- Log verification attempt (success/failure)
- Clear expired codes from database (cleanup job)

**Verification Pseudo-code:**
```python
# Retrieve user's code
stored_code = db.get('admin_2fa_codes', {
    'user_id': user_id,
    'used': False,
    'expires_at': {'$gt': datetime.now()}
})

if not stored_code:
    return {"error": "Code not found or expired"}

# Verify code against hash
import hashlib
submitted_code_hash = hashlib.sha256(submitted_code.encode()).hexdigest()

if submitted_code_hash != stored_code['code_hash']:
    stored_code['attempts'] += 1
    if stored_code['attempts'] >= 5:
        db.update('admin_2fa_codes', 
                 {'id': stored_code['id']}, 
                 {'blocked': True})
        return {"error": "Too many failed attempts"}
    return {"error": "Invalid code", "attemptsRemaining": 5 - stored_code['attempts']}

# Mark as used
db.update('admin_2fa_codes', {'id': stored_code['id']}, {'used': True})

# Create new session
session_token = create_extended_session_token(user_id)

return {"authenticated": True, "sessionToken": session_token}
```

---

#### 2.3 Resend 2FA Code Endpoint

**Endpoint:** `POST /api/admin/resend-2fa-code`

**Purpose:** Allow user to request a new code (with rate limiting)

**Request:**
```json
{
  "email": "admin@crittertrack.com"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "New code sent to admin@crittertrack.com",
  "expiresIn": 300
}
```

**Response (429 Too Many Requests):**
```json
{
  "error": "Code resend not available yet. Please wait 4 minutes 59 seconds.",
  "retryAfter": 299
}
```

**Implementation Notes:**
- Only allow resend after 4 minutes 59 seconds have elapsed
- Invalidate previous code immediately
- Generate new code and send to email
- Rate limit: Max 3 resends per session
- Update database with new code

---

#### 2.4 Track Login Endpoint

**Endpoint:** `POST /api/admin/track-login`

**Purpose:** Record login attempt with device and IP information

**Request:**
```json
{
  "userId": "admin_user_id_123",
  "username": "admin_username",
  "ipAddress": "192.168.1.1",
  "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)...",
  "deviceInfo": {
    "platform": "Win32",
    "language": "en-US",
    "screenResolution": "1920x1080",
    "timezone": "America/New_York"
  },
  "status": "success_2fa_verified",
  "twoFactorPending": false,
  "timestamp": "2025-01-02T15:30:00Z"
}
```

**Response (200 OK):**
```json
{
  "logged": true,
  "logId": "login_log_id_123",
  "message": "Login attempt recorded"
}
```

**Implementation Notes:**
- Store in `audit_logs` table (see schema below)
- Capture server-side IP address (not from frontend)
- Parse User-Agent to extract browser, OS, device type
- Detect location from IP address (optional, using GeoIP service)
- Flag suspicious logins (new IP, new location, unusual time)
- All fields required for security audit trail

---

#### 2.5 Get Login History Endpoint

**Endpoint:** `GET /api/admin/login-history`

**Purpose:** Retrieve paginated login history for current user

**Query Parameters:**
- `limit` (optional): Records per page (default: 50, max: 100)
- `offset` (optional): Pagination offset (default: 0)
- `days` (optional): Filter last N days (default: 30, max: 365)
- `status` (optional): Filter by status ('success', 'failed', 'suspicious')

**Response (200 OK):**
```json
[
  {
    "id": "login_log_id_123",
    "timestamp": "2025-01-02T15:30:00Z",
    "ipAddress": "192.168.1.1",
    "location": "New York, USA",
    "deviceName": "Chrome on Windows",
    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)...",
    "platform": "Win32",
    "language": "en-US",
    "screenResolution": "1920x1080",
    "timezone": "America/New_York",
    "status": "success",
    "twoFactorVerified": true,
    "failureReason": null
  }
]
```

**Implementation Notes:**
- Return only current user's login history (unless admin viewing another user)
- Order by timestamp DESC (most recent first)
- Include pagination metadata
- Mark device names for easy identification
- Highlight suspicious logins with flag

---

### Step 3: Database Schema

**Create `admin_2fa_codes` Table:**

```sql
CREATE TABLE admin_2fa_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    code_hash VARCHAR(64) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    attempts INTEGER DEFAULT 0,
    blocked BOOLEAN DEFAULT FALSE,
    last_attempt_at TIMESTAMP,
    created_ip VARCHAR(45),
    INDEX idx_user_expiry (user_id, expires_at),
    INDEX idx_unused_codes (user_id, used, expires_at)
);
```

**Create `login_audit_logs` Table:**

```sql
CREATE TABLE login_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    username VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    location VARCHAR(255),
    user_agent TEXT,
    platform VARCHAR(50),
    language VARCHAR(10),
    screen_resolution VARCHAR(20),
    timezone VARCHAR(50),
    device_name VARCHAR(255),
    status ENUM('success', 'failed', 'suspicious') DEFAULT 'success',
    two_factor_verified BOOLEAN DEFAULT FALSE,
    failure_reason VARCHAR(255),
    is_suspicious BOOLEAN DEFAULT FALSE,
    suspicious_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    action_taken VARCHAR(50),
    INDEX idx_user_timestamp (user_id, created_at),
    INDEX idx_ip_address (ip_address),
    INDEX idx_suspicious (is_suspicious, created_at)
);
```

**Alter `users` Table (if not exists):**

```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT TRUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_ip VARCHAR(45);
```

---

### Step 4: Email Service Integration

**Email Template for 2FA Code:**

```
Subject: CritterTrack Admin Verification Code

---

Hello {ADMIN_NAME},

Your CritterTrack admin panel verification code is:

╔═══════════════╗
║    123456     ║
╚═══════════════╝

This code expires in 5 minutes.

If you did not request this code, please ignore this email and contact support immediately.

---
CritterTrack Security Team
security@crittertrack.com
```

**Implementation Example (Node.js with nodemailer):**

```javascript
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE, // e.g., 'gmail'
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

async function send2FACode(email, code) {
    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: email,
        subject: 'CritterTrack Admin Verification Code',
        html: `
            <h2>Admin Verification Code</h2>
            <p>Your CritterTrack admin verification code is:</p>
            <h1 style="text-align: center; font-size: 24px; letter-spacing: 2px;">
                ${code}
            </h1>
            <p><strong>This code expires in 5 minutes.</strong></p>
            <p style="color: #999; font-size: 12px;">
                If you did not request this code, please contact support immediately.
            </p>
        `
    };

    return transporter.sendMail(mailOptions);
}

module.exports = { send2FACode };
```

---

### Step 5: Security Considerations

#### 5.1 Rate Limiting

```javascript
// Code generation rate limit: 1 per minute per user
// Code verification rate limit: 5 attempts per code session
// Resend rate limit: After 4 minutes 59 seconds, max 3 per session
```

#### 5.2 Code Requirements

- **Format:** 6 digits (000000-999999)
- **Entropy:** 1,000,000 combinations = ~1 million possible codes
- **Expiry:** 5 minutes (300 seconds)
- **One-time use:** Code deleted after successful verification
- **Hash Storage:** SHA-256 hash for database storage

#### 5.3 IP Address Tracking

```javascript
// Get client IP from request
function getClientIP(req) {
    return (
        req.headers['x-forwarded-for']?.split(',')[0] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        '0.0.0.0'
    );
}
```

#### 5.4 Suspicious Login Detection

```javascript
// Flag as suspicious if:
// 1. Login from new IP not used before
// 2. Login from different country than last login
// 3. Multiple failed 2FA attempts
// 4. Login at unusual time (outside typical patterns)
// 5. Device profile changed significantly
```

#### 5.5 Session Management

```javascript
// After successful 2FA:
// 1. Create new session token with extended expiry
// 2. Bind session to IP address (optional)
// 3. Invalidate previous sessions if suspicious activity
// 4. Set session cookie with HttpOnly, Secure, SameSite flags
```

---

## Frontend Props & Integration

### EnhancedAdminPanel Component

```javascript
<EnhancedAdminPanel
    isOpen={true}                      // Is panel open?
    onClose={() => {}}                 // Close handler
    authToken="bearer_token_here"      // JWT from authentication
    API_BASE_URL="https://api.example.com"  // Backend URL
    userRole="admin"                   // User role (admin/moderator)
    userEmail="admin@example.com"      // User email for 2FA
    userId="user_id_123"               // User ID
    username="admin_username"          // Username for audit logs
/>
```

### TwoFactorAuth Component

```javascript
<TwoFactorAuth
    isOpen={true}                      // Show modal?
    onClose={() => {}}                 // Close handler
    onVerify={() => {}}                // Success callback
    email="admin@example.com"          // Display email
    authToken="bearer_token_here"      // JWT token
    API_BASE_URL="https://api.example.com"  // Backend URL
    isLoading={false}                  // Verification in progress?
/>
```

### LoginTracking Component

```javascript
<LoginTracking
    authToken="bearer_token_here"      // JWT token
    API_BASE_URL="https://api.example.com"  // Backend URL
/>
```

---

## Testing Checklist

### Frontend Tests

- [ ] Password prompt displays correctly
- [ ] Invalid password shows error with attempt counter
- [ ] After 3 failed attempts, prompt shows lockout message
- [ ] Correct password triggers 2FA modal
- [ ] 2FA modal displays user email
- [ ] 6-digit code input accepts only numbers
- [ ] 5-minute countdown timer displays correctly
- [ ] Timer decreases by 1 second each second
- [ ] "Resend Code" button disabled until 4:59 remaining
- [ ] Invalid code shows error message
- [ ] After max attempts, shows "request new code" message
- [ ] Correct code triggers admin panel display
- [ ] Login history displays in dashboard
- [ ] Previous logins show IP, device, timestamp, status

### Backend Tests

- [ ] `POST /api/admin/send-2fa-code` generates unique 6-digit code
- [ ] Code expires after exactly 5 minutes
- [ ] Email sent successfully with code
- [ ] `POST /api/admin/verify-2fa` validates code against hash
- [ ] Code can only be used once
- [ ] After 5 failed attempts, code is blocked
- [ ] `POST /api/admin/resend-2fa-code` only works after 4:59
- [ ] Max 3 resends per session
- [ ] `POST /api/admin/track-login` records all login attempts
- [ ] IP address captured correctly
- [ ] Device info stored accurately
- [ ] `GET /api/admin/login-history` returns paginated results
- [ ] Suspicious logins flagged correctly
- [ ] Previous logins retrievable for audit

### Security Tests

- [ ] Brute force attempts on password prompt blocked
- [ ] Brute force attempts on 2FA code blocked
- [ ] Code cannot be used from different IP (optional)
- [ ] Session expires after inactivity
- [ ] Audit log accessible only to admin users
- [ ] Login tracking data cannot be modified by users
- [ ] 2FA codes not visible in frontend code or logs

---

## Rollout Plan

### Phase 1: Backend Implementation (1-2 weeks)
- [ ] Create database tables
- [ ] Implement 5 API endpoints
- [ ] Integrate email service
- [ ] Add IP detection service
- [ ] Write unit tests
- [ ] Deploy to staging

### Phase 2: Testing (1 week)
- [ ] Test full 2FA flow
- [ ] Load test with concurrent logins
- [ ] Security audit
- [ ] Test on various devices/browsers
- [ ] Verify email delivery

### Phase 3: Deployment (1 day)
- [ ] Deploy backend changes to production
- [ ] Monitor for errors
- [ ] Verify email delivery
- [ ] Confirm login tracking active

### Phase 4: Gradual Rollout (Ongoing)
- [ ] Require 2FA for all admins/moderators
- [ ] Monitor login patterns
- [ ] Adjust suspicious login thresholds
- [ ] Collect user feedback

---

## Monitoring & Alerts

### Key Metrics to Track

1. **2FA Success Rate:** % of successful code verifications
2. **Failed 2FA Attempts:** Failed verification attempts
3. **Code Delivery Time:** Time to send email with code
4. **Suspicious Login Rate:** % of flagged logins
5. **Admin Access Frequency:** Logins per admin per day

### Alerts to Set Up

- [ ] Multiple failed 2FA attempts from same IP
- [ ] Login from new country detected
- [ ] High volume of failed password attempts
- [ ] Code delivery failure
- [ ] Admin access after business hours
- [ ] Multiple admins logged in simultaneously

---

## Troubleshooting

### Issue: Email with code not received

**Solution:**
1. Check email service configuration
2. Verify SMTP credentials
3. Check spam/junk folder
4. Verify email address in database
5. Check email service logs for delivery failures
6. Test email sending independently

### Issue: Code expiry not working correctly

**Solution:**
1. Verify database timestamp format
2. Check server timezone setting
3. Ensure database clock is synchronized
4. Review code generation timestamp capture

### Issue: 2FA modal not appearing

**Solution:**
1. Verify password was verified successfully
2. Check `show2FA` state in component
3. Verify `TwoFactorAuth` component imported
4. Check browser console for errors
5. Verify API response includes success flag

### Issue: Login tracking not recording

**Solution:**
1. Verify `track-login` endpoint is implemented
2. Check backend logs for errors
3. Verify database write permissions
4. Check request payload is sent correctly
5. Verify IP address capture working

---

## Support & Questions

For questions about implementation:
1. Review this guide first
2. Check CritterTrack documentation
3. Contact development team
4. Review backend logs for errors

---

**Document Version:** 1.0  
**Last Updated:** January 2025  
**Frontend Version:** Complete (React Components Ready)  
**Backend Version:** Pending Implementation
