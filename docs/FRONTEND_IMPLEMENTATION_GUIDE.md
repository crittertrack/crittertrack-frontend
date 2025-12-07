# Frontend Implementation Guide - Authentication & Bug Reporting

## Quick Start for Frontend Developer

This guide shows exactly what frontend components need to be created to integrate with the new backend authentication and bug reporting system.

---

## 1. Registration Flow (Email Verification)

### Replace Current Registration with 2-Step Process

#### Step 1: Request Verification Code Component
```jsx
// components/RegistrationStep1.jsx
import { useState } from 'react';

function RegistrationStep1({ onCodeSent }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    personalName: '',
    breederName: '',
    showBreederName: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('https://your-backend-url/api/auth/register-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send verification code');
      }

      // Move to step 2 with email
      onCodeSent(formData.email);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Create Account</h2>
      
      <input
        type="email"
        placeholder="Email"
        value={formData.email}
        onChange={(e) => setFormData({...formData, email: e.target.value})}
        required
      />
      
      <input
        type="password"
        placeholder="Password (min 6 characters)"
        value={formData.password}
        onChange={(e) => setFormData({...formData, password: e.target.value})}
        minLength={6}
        required
      />
      
      <input
        type="text"
        placeholder="Your Name"
        value={formData.personalName}
        onChange={(e) => setFormData({...formData, personalName: e.target.value})}
        required
      />
      
      <input
        type="text"
        placeholder="Breeder Name (optional)"
        value={formData.breederName}
        onChange={(e) => setFormData({...formData, breederName: e.target.value})}
      />
      
      <label>
        <input
          type="checkbox"
          checked={formData.showBreederName}
          onChange={(e) => setFormData({...formData, showBreederName: e.target.checked})}
        />
        Show breeder name publicly
      </label>

      {error && <p className="error">{error}</p>}
      
      <button type="submit" disabled={loading}>
        {loading ? 'Sending...' : 'Send Verification Code'}
      </button>
    </form>
  );
}

export default RegistrationStep1;
```

#### Step 2: Verify Code Component
```jsx
// components/RegistrationStep2.jsx
import { useState } from 'react';

function RegistrationStep2({ email, onSuccess }) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resending, setResending] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('https://your-backend-url/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Invalid verification code');
      }

      // Store token and redirect
      localStorage.setItem('token', data.token);
      localStorage.setItem('userProfile', JSON.stringify(data.userProfile));
      onSuccess(data.userProfile);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError('');

    try {
      const response = await fetch('https://your-backend-url/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to resend code');
      }

      alert('New verification code sent! Check your email.');
    } catch (err) {
      setError(err.message);
    } finally {
      setResending(false);
    }
  };

  return (
    <div>
      <h2>Verify Your Email</h2>
      <p>We sent a 6-digit code to <strong>{email}</strong></p>
      <p className="note">The code expires in 10 minutes.</p>

      <form onSubmit={handleVerify}>
        <input
          type="text"
          placeholder="Enter 6-digit code"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          maxLength={6}
          pattern="\d{6}"
          required
          autoFocus
          style={{ fontSize: '24px', letterSpacing: '8px', textAlign: 'center' }}
        />

        {error && <p className="error">{error}</p>}

        <button type="submit" disabled={loading || code.length !== 6}>
          {loading ? 'Verifying...' : 'Verify & Create Account'}
        </button>
      </form>

      <button 
        onClick={handleResend} 
        disabled={resending}
        style={{ marginTop: '10px', background: 'transparent', textDecoration: 'underline' }}
      >
        {resending ? 'Resending...' : "Didn't receive code? Resend"}
      </button>
    </div>
  );
}

export default RegistrationStep2;
```

#### Parent Registration Component
```jsx
// components/Registration.jsx
import { useState } from 'react';
import RegistrationStep1 from './RegistrationStep1';
import RegistrationStep2 from './RegistrationStep2';
import { useNavigate } from 'react-router-dom';

function Registration() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const handleCodeSent = (userEmail) => {
    setEmail(userEmail);
    setStep(2);
  };

  const handleSuccess = (userProfile) => {
    // Redirect to dashboard or home
    navigate('/dashboard');
  };

  return (
    <div className="registration-container">
      {step === 1 && <RegistrationStep1 onCodeSent={handleCodeSent} />}
      {step === 2 && <RegistrationStep2 email={email} onSuccess={handleSuccess} />}
    </div>
  );
}

export default Registration;
```

---

## 2. Login Update

### Update Login Component to Handle Unverified Users

```jsx
// components/Login.jsx
const handleLogin = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError('');

  try {
    const response = await fetch('https://your-backend-url/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      // Check if user needs verification
      if (data.needsVerification) {
        setError('Email not verified. Please check your inbox for the verification code.');
        // Optional: Show button to resend verification
        setShowResendButton(true);
        return;
      }
      throw new Error(data.message || 'Login failed');
    }

    // Store token and redirect
    localStorage.setItem('token', data.token);
    localStorage.setItem('userProfile', JSON.stringify(data.userProfile));
    navigate('/dashboard');
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
```

---

## 3. Forgot Password Flow

### Forgot Password Request Component
```jsx
// components/ForgotPassword.jsx
import { useState } from 'react';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('https://your-backend-url/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send reset email');
      }

      setSubmitted(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div>
        <h2>Check Your Email</h2>
        <p>If an account exists for <strong>{email}</strong>, you will receive password reset instructions.</p>
        <p>The reset link expires in 1 hour.</p>
        <a href="/login">Back to Login</a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Forgot Password</h2>
      <p>Enter your email to receive a password reset link.</p>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      {error && <p className="error">{error}</p>}

      <button type="submit" disabled={loading}>
        {loading ? 'Sending...' : 'Send Reset Link'}
      </button>

      <a href="/login" style={{ display: 'block', marginTop: '10px' }}>
        Back to Login
      </a>
    </form>
  );
}

export default ForgotPassword;
```

### Reset Password Component
```jsx
// components/ResetPassword.jsx
import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('https://your-backend-url/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token, newPassword })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to reset password');
      }

      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!token || !email) {
    return (
      <div>
        <h2>Invalid Reset Link</h2>
        <p>This password reset link is invalid or has expired.</p>
        <a href="/forgot-password">Request a new reset link</a>
      </div>
    );
  }

  if (success) {
    return (
      <div>
        <h2>Password Reset Successful!</h2>
        <p>Your password has been reset. Redirecting to login...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Reset Password</h2>
      <p>Enter your new password for <strong>{email}</strong></p>

      <input
        type="password"
        placeholder="New Password (min 6 characters)"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        minLength={6}
        required
      />

      <input
        type="password"
        placeholder="Confirm New Password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        minLength={6}
        required
      />

      {error && <p className="error">{error}</p>}

      <button type="submit" disabled={loading}>
        {loading ? 'Resetting...' : 'Reset Password'}
      </button>
    </form>
  );
}

export default ResetPassword;
```

---

## 4. Bug Report Modal

### Bug Report Component
```jsx
// components/BugReportModal.jsx
import { useState } from 'react';

function BugReportModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    category: 'Bug',
    description: '',
    page: window.location.pathname
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');

      const response = await fetch('https://your-backend-url/api/bug-reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit report');
      }

      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setFormData({ category: 'Bug', description: '', page: window.location.pathname });
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  if (success) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <h2>✅ Report Submitted!</h2>
          <p>Thank you for your feedback. The admin has been notified.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="close-button">×</button>
        
        <h2>Report an Issue</h2>
        
        <form onSubmit={handleSubmit}>
          <label>
            Category *
            <select
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              required
            >
              <option value="Bug">Bug</option>
              <option value="Feature Request">Feature Request</option>
              <option value="General Feedback">General Feedback</option>
            </select>
          </label>

          <label>
            Page/Location
            <input
              type="text"
              value={formData.page}
              onChange={(e) => setFormData({...formData, page: e.target.value})}
              placeholder="Where did you encounter this?"
            />
          </label>

          <label>
            Description *
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Please describe the issue or suggestion in detail..."
              rows={6}
              required
            />
          </label>

          {error && <p className="error">{error}</p>}

          <button type="submit" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Report'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default BugReportModal;
```

### Add to Navigation/Header
```jsx
// In your Header/Navbar component
import { useState } from 'react';
import BugReportModal from './BugReportModal';

function Header() {
  const [showBugModal, setShowBugModal] = useState(false);
  const isLoggedIn = localStorage.getItem('token');

  return (
    <header>
      {/* ... other nav items ... */}
      
      {isLoggedIn && (
        <button onClick={() => setShowBugModal(true)} className="bug-report-button">
          Report Issue
        </button>
      )}

      <BugReportModal isOpen={showBugModal} onClose={() => setShowBugModal(false)} />
    </header>
  );
}
```

---

## 5. Routing Setup

### Add Routes to React Router
```jsx
// App.jsx or Routes.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Registration from './components/Registration';
import Login from './components/Login';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/register" element={<Registration />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        {/* ... other routes ... */}
      </Routes>
    </BrowserRouter>
  );
}
```

---

## 6. Update Backend URL

**Find and replace** `https://your-backend-url` with your actual backend URL:
- Development: `http://localhost:5000` or whatever port your backend uses
- Production: Your Railway/Heroku URL (e.g., `https://crittertrack-backend.railway.app`)

---

## 7. CSS Styling Examples

### Modal Styles
```css
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 30px;
  border-radius: 12px;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
}

.close-button {
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 28px;
  cursor: pointer;
  color: #666;
}

.close-button:hover {
  color: #000;
}

.error {
  color: #d32f2f;
  background: #ffebee;
  padding: 10px;
  border-radius: 4px;
  margin: 10px 0;
}

.note {
  font-size: 14px;
  color: #666;
  margin: 10px 0;
}
```

---

## 8. Email Setup (Important!)

### Generate Gmail App Password

1. Go to: https://myaccount.google.com/apppasswords
2. Sign in with `crittertrackowner@gmail.com`
3. Create new app password named "CritterTrack Backend"
4. Copy the 16-character password
5. Add to backend `.env` file:
   ```
   EMAIL_PASSWORD=your_16_char_password_here
   ```
6. Redeploy backend if hosted (Railway/Heroku)

---

## 9. Testing Checklist

### Registration Flow
- [ ] Enter email/password/name → "Verification code sent" message
- [ ] Check email inbox for 6-digit code
- [ ] Enter code → Account created, logged in automatically
- [ ] Try wrong code → Error message shown
- [ ] Wait 10+ minutes → Code expires, shows error
- [ ] Click "Resend" → New code received
- [ ] Try to register same email again → Error message

### Login
- [ ] Try to login with unverified account → Shows "Email not verified" error
- [ ] Login with verified account → Success

### Password Reset
- [ ] Click "Forgot Password" on login page
- [ ] Enter email → "Check your email" message
- [ ] Check email inbox for reset link
- [ ] Click link → Opens reset password form
- [ ] Enter new password → Success message
- [ ] Login with new password → Success
- [ ] Try reset link again → "Expired/invalid" error

### Bug Reporting
- [ ] Click "Report Issue" button (logged in only)
- [ ] Select category, enter description
- [ ] Submit → "Report submitted" success message
- [ ] Check admin email for notification

---

## 10. Common Issues & Solutions

### "Failed to send verification code"
- Check backend is running
- Verify EMAIL_PASSWORD is set in .env
- Check Gmail app password is correct

### "Invalid verification code"
- Code may have expired (10 min limit)
- Try resending code
- Check for typos (6 digits only)

### Reset link not working
- Token may have expired (1 hour limit)
- Request new reset link
- Check email/token in URL params

### "Unauthorized" on bug report
- Check token is stored in localStorage
- Token may have expired, re-login
- Verify Authorization header is sent

---

## Quick Reference: API Endpoints

```
Registration:
POST /api/auth/register-request
POST /api/auth/verify-email
POST /api/auth/resend-verification

Password Reset:
POST /api/auth/forgot-password
POST /api/auth/reset-password

Bug Reports:
POST /api/bug-reports (requires auth)
GET /api/bug-reports/my-reports (requires auth)

Genetics Feedback:
POST /api/genetics-feedback (requires auth)
```

---

**All backend code is complete!** Just build these frontend components and you're done. 🎉
