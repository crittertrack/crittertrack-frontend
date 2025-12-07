# Authentication & Bug Reporting System Implementation

## Summary
Implemented comprehensive authentication and bug reporting features for CritterTrack:
1. ✅ Email verification for new user registration
2. ✅ Forgot password / password reset functionality
3. ✅ General bug reporting system
4. ✅ Admin email notifications for all feedback/bugs

---

## Backend Changes

### 1. Database Models (`database/models.js`)

#### Updated User Schema
Added email verification and password reset fields:
```javascript
emailVerified: { type: Boolean, default: false }
verificationCode: { type: String, select: false }
verificationCodeExpires: { type: Date, select: false }
resetPasswordToken: { type: String, select: false }
resetPasswordExpires: { type: Date, select: false }
```

#### New BugReport Schema
```javascript
{
  userId: ObjectId (ref: User, indexed)
  userEmail: String
  userName: String
  category: Enum ['Bug', 'Feature Request', 'General Feedback']
  description: String
  page: String (optional)
  status: Enum ['pending', 'in-progress', 'resolved', 'dismissed']
  adminNotes: String (optional)
  resolvedAt: Date (optional)
  createdAt: Date
}
```

### 2. Email Service (`utils/emailService.js`)
NEW FILE - Complete email notification system using Nodemailer + Gmail SMTP

**Functions:**
- `sendVerificationEmail(email, code)` - 6-digit code, 10-minute expiry, pink theme
- `sendPasswordResetEmail(email, resetToken)` - Reset URL with token, 1-hour expiry
- `sendBugReportNotification(reportData)` - Admin email with user info, category, description
- `sendGeneticsFeedbackNotification(feedbackData)` - Admin email for genetics issues

**Configuration:**
- Service: Gmail
- Sender: crittertrackowner@gmail.com
- Recipient: crittertrackowner@gmail.com (admin)
- Auth: App password from environment variable `EMAIL_PASSWORD`

### 3. Database Service (`database/db_service.js`)

#### New Functions:
- `requestEmailVerification(email, personalName, breederName, showBreederName, password)`
  - Generates 6-digit code with 10-minute expiry
  - Creates unverified user record (no id_public yet)
  - Returns code for email sending

- `verifyEmailAndRegister(email, code)`
  - Validates verification code
  - Completes user registration (assigns id_public)
  - Creates PublicProfile
  - Returns JWT token + user profile

- `requestPasswordReset(email)`
  - Generates secure 32-byte reset token
  - Hashes token before storage
  - Sets 1-hour expiry
  - Returns unhashed token for email

- `resetPassword(email, token, newPassword)`
  - Validates token and expiry
  - Updates password with bcrypt hash
  - Clears reset token fields

### 4. Authentication Routes (`routes/authRoutes.js`)

#### New Endpoints:
- `POST /api/auth/register-request` - Request verification code
- `POST /api/auth/verify-email` - Verify code and create account
- `POST /api/auth/resend-verification` - Resend verification code
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token

#### Updated Endpoints:
- `POST /api/auth/login` - Now checks email verification status
- `POST /api/auth/register` - Kept for backward compatibility

### 5. Bug Report Routes (`routes/bugReportRoutes.js`)
NEW FILE - Complete bug reporting system

**Endpoints:**
- `POST /` - Submit bug report (requires auth)
  - Validates category and description
  - Stores user info (username, email)
  - Sends admin email notification
  - Returns report ID

- `GET /admin` - View all reports (admin only)
  - Checks admin email (crittertrackowner@gmail.com)
  - Returns all reports sorted by date

- `PATCH /:id/status` - Update report status (admin only)
  - Updates status and admin notes
  - Sets resolvedAt timestamp for resolved status

- `GET /my-reports` - User's own reports
  - Returns user's reports without sensitive fields

### 6. Genetics Feedback Routes (`routes/geneticsFeedbackRoutes.js`)
**Updated:** Added admin email notification on submission
- Sends email with phenotype, genotype, and feedback details
- Includes user info if authenticated

### 7. Main Application (`index.js`)
Added bug report routes:
```javascript
const bugReportRoutes = require('./routes/bugReportRoutes');
app.use('/api/bug-reports', authMiddleware, bugReportRoutes);
```

### 8. Dependencies (`package.json`)
Added: `"nodemailer": "^6.9.7"`

### 9. Environment Variables (`.env`)
Added:
```
EMAIL_PASSWORD=your_gmail_app_password_here
```

**Setup Instructions:**
1. Go to https://myaccount.google.com/apppasswords
2. Generate app password for Gmail
3. Replace `your_gmail_app_password_here` with the generated password

---

## Frontend Changes Needed

### 1. Registration Flow (Multi-step)
Create components for:
- **Step 1:** Email/password/name input → POST `/api/auth/register-request`
- **Step 2:** Verification code input (6 digits) → POST `/api/auth/verify-email`
- **Resend button:** → POST `/api/auth/resend-verification`

### 2. Forgot Password Flow
Create components for:
- **Request reset:** Email input → POST `/api/auth/forgot-password`
- **Reset password:** New password input with token from URL → POST `/api/auth/reset-password`

### 3. Bug Report Modal
Create modal accessible after login with:
- Category dropdown (Bug / Feature Request / General Feedback)
- Page/location input (optional)
- Description textarea
- Submit → POST `/api/bug-reports`

### 4. Login Update
Handle `needsVerification: true` response:
- Show "Email not verified" message
- Option to resend verification code

---

## API Endpoints Reference

### Authentication
```
POST /api/auth/register-request
Body: { email, password, personalName, breederName?, showBreederName? }
Response: { message, email }

POST /api/auth/verify-email
Body: { email, code }
Response: { message, token, userProfile }

POST /api/auth/resend-verification
Body: { email }
Response: { message }

POST /api/auth/forgot-password
Body: { email }
Response: { message }

POST /api/auth/reset-password
Body: { email, token, newPassword }
Response: { message }

POST /api/auth/login
Body: { email, password }
Response: { message, token, userProfile } OR { message, needsVerification: true }
```

### Bug Reporting
```
POST /api/bug-reports
Headers: { Authorization: Bearer <token> }
Body: { category, description, page? }
Response: { message, reportId }

GET /api/bug-reports/my-reports
Headers: { Authorization: Bearer <token> }
Response: [{ _id, category, description, page, status, createdAt }]

GET /api/bug-reports/admin (Admin only)
Headers: { Authorization: Bearer <token> }
Response: [{ all fields including userEmail, userName }]

PATCH /api/bug-reports/:id/status (Admin only)
Headers: { Authorization: Bearer <token> }
Body: { status, adminNotes? }
Response: { updated report }
```

### Genetics Feedback
```
POST /api/genetics-feedback
Headers: { Authorization: Bearer <token> }
Body: { phenotype, genotype, feedback }
Response: { message, feedbackId }
(Now sends admin email notification)
```

---

## Email Templates

### 1. Verification Email
- Subject: "Verify Your CritterTrack Account"
- Pink theme matching app branding
- 6-digit code prominently displayed
- 10-minute expiry warning
- Link to CritterTrack website

### 2. Password Reset Email
- Subject: "Reset Your CritterTrack Password"
- Reset button with token URL
- Fallback link
- 1-hour expiry warning
- Security note (ignore if not requested)

### 3. Bug Report Notification (Admin)
- Subject: "New Bug Report Submitted"
- Reporter: username (email)
- Category badge
- Page location
- Full description
- Timestamp

### 4. Genetics Feedback Notification (Admin)
- Subject: "New Genetics Calculator Feedback"
- Reporter: username (email)
- Phenotype result
- Genotype input
- User feedback
- Timestamp

---

## Testing Checklist

### Email Verification
- [ ] Register with new email → receives code
- [ ] Enter correct code → account created, logged in
- [ ] Enter wrong code → error message
- [ ] Code expires after 10 minutes → error
- [ ] Resend code → new code sent
- [ ] Try to login before verification → blocked with message

### Password Reset
- [ ] Request reset with valid email → email sent
- [ ] Click reset link → password form loads
- [ ] Submit new password → success, can login
- [ ] Use expired token → error
- [ ] Request reset with non-existent email → generic success message (no leak)

### Bug Reporting
- [ ] Submit bug while logged in → saved, email sent to admin
- [ ] View own reports → lists user's reports
- [ ] Admin views all reports → sees all with user info
- [ ] Admin updates status → status changed, resolvedAt set

### Genetics Feedback
- [ ] Submit feedback → saved, email sent to admin
- [ ] Admin views feedback → sees all submissions

---

## Security Features

1. **Email Verification:**
   - Prevents fake/spam accounts
   - 6-digit codes (1 million combinations)
   - 10-minute expiry window
   - Codes stored in DB, sent via email only

2. **Password Reset:**
   - Secure 32-byte random tokens (64 hex chars)
   - Tokens hashed before storage (like passwords)
   - 1-hour expiry
   - No email enumeration (same response for valid/invalid)

3. **Admin Access:**
   - Admin endpoints check email === 'crittertrackowner@gmail.com'
   - Requires valid JWT token
   - Rate limiting recommended (future enhancement)

4. **Email Security:**
   - Gmail App Password (not main password)
   - Stored in environment variables
   - Not committed to version control

---

## Deployment Notes

### Environment Variables Required:
```
MONGODB_URI=<your_mongodb_connection_string>
EMAIL_PASSWORD=<gmail_app_password>
JWT_SECRET=<your_jwt_secret>
```

### Railway/Heroku:
Add `EMAIL_PASSWORD` to environment variables in dashboard

### Vercel (if applicable):
Add to Environment Variables section in project settings

---

## Future Enhancements

1. **Rate Limiting:**
   - Limit verification code requests (prevent spam)
   - Limit password reset requests
   - Limit bug report submissions

2. **Email Templates:**
   - Use template engine (Handlebars/EJS)
   - Centralize branding/styling
   - Support for HTML/text fallback

3. **Admin Dashboard:**
   - Frontend panel for viewing/managing reports
   - Charts/analytics for bug categories
   - Quick actions for status updates

4. **Notifications:**
   - Email users when their reports are resolved
   - In-app notifications for status changes

5. **Two-Factor Authentication:**
   - Optional 2FA for enhanced security
   - TOTP codes via authenticator apps

---

## Troubleshooting

### Emails Not Sending:
1. Check `EMAIL_PASSWORD` is set in `.env` / deployment env vars
2. Verify Gmail App Password is correct (16 characters, no spaces)
3. Check Gmail account allows "Less secure app access" (if needed)
4. Review console logs for nodemailer errors

### Verification Code Not Working:
1. Check code hasn't expired (10 minutes)
2. Verify code matches exactly (6 digits)
3. Check user exists in DB with pending verification

### Password Reset Not Working:
1. Check token in URL matches DB (hashed comparison)
2. Verify token hasn't expired (1 hour)
3. Ensure email matches the reset request

---

## Files Modified/Created

### Modified:
- `database/models.js` - User schema + BugReport schema
- `database/db_service.js` - Auth functions
- `routes/authRoutes.js` - New auth endpoints
- `routes/geneticsFeedbackRoutes.js` - Email notifications
- `index.js` - Bug report routes
- `package.json` - Nodemailer dependency
- `.env` - Email password

### Created:
- `utils/emailService.js` - Email service
- `routes/bugReportRoutes.js` - Bug reporting API

---

## Contact
For questions or issues with this implementation:
- Admin Email: crittertrackowner@gmail.com
- Repository: [CritterTrack Backend]

---

**Status:** ✅ Backend implementation complete and ready for testing
**Next Steps:** Create frontend components for registration flow, password reset, and bug reporting
