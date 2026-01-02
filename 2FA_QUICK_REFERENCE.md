# 2FA Implementation - Quick Reference Card

## For Frontend Developer

### Using the Components

```javascript
// Import
import EnhancedAdminPanel from './components/EnhancedAdminPanel';
import TwoFactorAuth from './components/TwoFactorAuth';
import LoginTracking from './components/LoginTracking';

// Usage in App
<EnhancedAdminPanel
    isOpen={isAdminPanelOpen}
    onClose={() => setIsAdminPanelOpen(false)}
    authToken={jwtToken}
    API_BASE_URL={process.env.REACT_APP_API_URL}
    userRole="admin"
    userEmail={user.email}
    userId={user.id}
    username={user.username}
/>
```

### Component Hierarchy

```
EnhancedAdminPanel
├── Password Verification
│   └── POST /api/admin/verify-password
├── TwoFactorAuth Modal
│   ├── POST /api/admin/send-2fa-code
│   ├── POST /api/admin/verify-2fa
│   └── POST /api/admin/resend-2fa-code
├── Admin Dashboard
│   ├── Dashboard Stats
│   ├── LoginTracking Component
│   │   └── GET /api/admin/login-history
│   └── Feature Modules (7 total)
```

---

## For Backend Developer

### Implementation Priority

**Must Implement First (Blocking):**
1. `POST /api/admin/verify-2fa` - Verify code
2. `POST /api/admin/send-2fa-code` - Send code
3. `POST /api/admin/track-login` - Track attempt

**Then Implement:**
4. `POST /api/admin/resend-2fa-code` - Resend
5. `GET /api/admin/login-history` - Get history
6. Other endpoints

### Quick Database Schema

```sql
-- Create these tables
CREATE TABLE admin_2fa_codes (
    id UUID PRIMARY KEY,
    user_id UUID,
    code_hash VARCHAR(64),           -- SHA-256
    expires_at TIMESTAMP,             -- +5 min
    used BOOLEAN DEFAULT FALSE,
    attempts INT DEFAULT 0,
    blocked BOOLEAN DEFAULT FALSE
);

CREATE TABLE login_audit_logs (
    id UUID PRIMARY KEY,
    user_id UUID,
    username VARCHAR(255),
    ip_address VARCHAR(45),
    user_agent TEXT,
    status ENUM('success','failed','suspicious'),
    two_factor_verified BOOLEAN,
    created_at TIMESTAMP
);
```

### Code Generation Example (Python)

```python
import secrets
import hashlib

# Generate code
code = str(secrets.randbelow(1000000)).zfill(6)
code_hash = hashlib.sha256(code.encode()).hexdigest()

# Store hash (not code!)
# Send code via email
```

### API Endpoint Skeleton (Node.js/Express)

```javascript
// 1. Send 2FA Code
app.post('/api/admin/send-2fa-code', async (req, res) => {
    const { email, userId } = req.body;
    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    // Hash it
    const hash = crypto.createHash('sha256').update(code).digest('hex');
    // Store hash with 5-min expiry
    // Send code via email
    res.json({ success: true, expiresIn: 300 });
});

// 2. Verify 2FA Code
app.post('/api/admin/verify-2fa', async (req, res) => {
    const { code } = req.body;
    const userId = req.user.id;
    
    // Get stored hash
    // Compare: hash(code) === stored_hash
    // Check not expired
    // Check not used
    // Mark as used
    // Return success
    res.json({ authenticated: true });
});

// 3. Track Login
app.post('/api/admin/track-login', async (req, res) => {
    const { userId, username, ipAddress, userAgent, status } = req.body;
    
    // Parse User-Agent to get device info
    // Store in login_audit_logs
    // Check if suspicious (new IP, etc.)
    
    res.json({ logged: true, logId: 'xxx' });
});

// 4. Get Login History
app.get('/api/admin/login-history', async (req, res) => {
    const userId = req.user.id;
    const { limit = 50, offset = 0 } = req.query;
    
    // Query login_audit_logs
    // Filter by user_id
    // Order by timestamp DESC
    // Return paginated results
    
    res.json([...]);
});
```

---

## Critical Security Points

### ⚠️ Must Do

1. **Never store plain code** - Always hash before storing
2. **Always verify expiry** - Code valid for exactly 5 minutes
3. **One-time use only** - Mark used, never use twice
4. **Rate limit** - Max 5 failed attempts per code
5. **Delete old codes** - Cleanup expired codes
6. **IP tracking** - Store IP for audit trail
7. **Email verification** - Log who received code
8. **Session binding** - Tie session to IP (optional but recommended)

### ⚠️ Must NOT Do

- ❌ Don't send code in response (email only)
- ❌ Don't show code on frontend
- ❌ Don't log code in plaintext
- ❌ Don't allow code reuse
- ❌ Don't extend code expiry
- ❌ Don't store without hashing
- ❌ Don't trust frontend IP (use server IP)

---

## Testing Commands

### Frontend Tests
```bash
# Build project
npm run build

# Check no errors
npm run build 2>&1 | grep -i error

# Run on local server
npm start
```

### Backend Tests (Example curl)
```bash
# 1. Send code
curl -X POST http://localhost:3000/api/admin/send-2fa-code \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"email":"admin@example.com","userId":"123"}'

# 2. Verify code
curl -X POST http://localhost:3000/api/admin/verify-2fa \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"code":"123456"}'

# 3. Track login
curl -X POST http://localhost:3000/api/admin/track-login \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"userId":"123","username":"admin","ipAddress":"192.168.1.1","userAgent":"Mozilla...","status":"success"}'

# 4. Get login history
curl -X GET "http://localhost:3000/api/admin/login-history?limit=50&offset=0" \
  -H "Authorization: Bearer TOKEN"
```

---

## Response Status Codes

| Code | Meaning | When |
|------|---------|------|
| 200 | Success | Code valid, login tracked, history returned |
| 400 | Bad Request | Invalid code, expired code, missing fields |
| 401 | Unauthorized | Not authenticated, invalid token |
| 429 | Too Many Requests | Rate limit exceeded (code or resend) |
| 500 | Server Error | Database error, email service error |

---

## Database Query Examples

### Check if code is valid
```sql
SELECT * FROM admin_2fa_codes 
WHERE user_id = 'USER_ID'
  AND used = FALSE
  AND blocked = FALSE
  AND expires_at > NOW()
LIMIT 1;
```

### Record login attempt
```sql
INSERT INTO login_audit_logs 
(user_id, username, ip_address, user_agent, status, two_factor_verified, created_at)
VALUES ('USER_ID', 'username', '192.168.1.1', 'Mozilla...', 'success', true, NOW());
```

### Get recent logins
```sql
SELECT * FROM login_audit_logs
WHERE user_id = 'USER_ID'
ORDER BY created_at DESC
LIMIT 50;
```

---

## Environment Variables Needed

### Backend
```env
# Email
EMAIL_SERVICE=gmail          # or sendgrid, mailgun, etc.
EMAIL_USER=admin@example.com
EMAIL_PASSWORD=your_password
EMAIL_FROM=noreply@crittertrack.com

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=crittertrack
DB_USER=postgres
DB_PASSWORD=password

# Security
JWT_SECRET=your_secret_key
SESSION_SECRET=your_secret_key

# Optional
GEOIP_API_KEY=your_geoip_key   # For location detection
```

### Frontend
```env
REACT_APP_API_URL=https://api.crittertrack.com
REACT_APP_ENV=production
```

---

## Deployment Checklist

- [ ] Database tables created
- [ ] Indexes created on user_id, expires_at, created_at
- [ ] Email service configured
- [ ] Environment variables set
- [ ] Rate limiting configured
- [ ] Monitoring alerts set up
- [ ] Backup plan documented
- [ ] Rollback plan documented
- [ ] Load testing passed
- [ ] Security audit passed
- [ ] Documentation updated
- [ ] On-call rotation scheduled

---

## Monitoring & Alerts

### Metrics to Track
- 2FA success rate (target: >95%)
- Failed 2FA attempts (alert if >10 in 5 min)
- Code delivery time (target: <5 sec)
- Email bounce rate (alert if >1%)
- Suspicious login rate (alert if spike)

### Alerts to Set
```
IF failed_2fa_attempts > 10 IN 5 MINUTES THEN alert HIGH
IF code_delivery_failures > 5 IN 1 MINUTE THEN alert CRITICAL
IF logins_from_new_ip > 5 IN 1 HOUR THEN alert MEDIUM
IF admin_login_outside_hours THEN alert LOW (just info)
```

---

## Common Issues & Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| Code not received | Email service down | Check email service logs |
| Code expired too fast | Wrong timeout value | Verify expiry = 300 seconds |
| Code reusable | Not marking as used | Check `used` flag logic |
| Rate limiting not working | No Redis/cache | Implement request counter |
| Login history empty | Not tracking | Verify POST /track-login called |
| IP always same | Not capturing real IP | Use X-Forwarded-For header |

---

## File Locations Reference

| File | Purpose | Lines |
|------|---------|-------|
| src/components/TwoFactorAuth.jsx | 2FA modal | 140 |
| src/components/LoginTracking.jsx | History display | 165 |
| src/components/EnhancedAdminPanel.jsx | Main dashboard | 720 |
| ADMIN_PANEL_API_ENDPOINTS.md | API specs | 1,200+ |
| 2FA_IMPLEMENTATION_GUIDE.md | Backend guide | 450+ |
| 2FA_IMPLEMENTATION_STATUS.md | Status tracking | 300+ |
| COMPLETE_2FA_SUMMARY.md | Overall summary | 400+ |

---

## Quick Links

- **API Documentation:** See sections 2-3 in `ADMIN_PANEL_API_ENDPOINTS.md`
- **Database Schema:** See `2FA_IMPLEMENTATION_GUIDE.md` Step 3
- **Code Examples:** See `2FA_IMPLEMENTATION_GUIDE.md` Step 2
- **Component Props:** See `2FA_IMPLEMENTATION_STATUS.md` Frontend Details
- **Testing:** See `2FA_IMPLEMENTATION_GUIDE.md` Testing Checklist
- **Troubleshooting:** See `2FA_IMPLEMENTATION_GUIDE.md` Troubleshooting

---

**Version:** 1.0  
**Status:** ✅ READY FOR IMPLEMENTATION  
**Frontend:** ✅ COMPLETE  
**Backend:** ⏳ TODO  

**Print this card and keep handy during implementation!**
