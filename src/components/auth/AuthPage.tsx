// ============================================================
// AuthPage Component — Real-World Production Login & Signup
// ============================================================

import { useState, type FormEvent } from 'react';
import { useApp } from '../../context/AppContext';
import Button from '../ui/Button';
import './AuthPage.css';

const eyeOpenIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const eyeClosedIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

export default function AuthPage() {
  const { login, signup, addToast, pendingInviteToken } = useApp();
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleInputChange = (setter: (val: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setter(e.target.value);
    if (errorMsg) setErrorMsg(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanEmail = email.trim();
    const cleanPass = password.trim();

    if (!cleanEmail) {
      setErrorMsg('Please enter your email address.');
      return;
    }

    if (!cleanPass) {
      setErrorMsg('Please enter your password.');
      return;
    }

    if (isSignUp) {
      const cleanName = name.trim();
      if (!cleanName) {
        setErrorMsg('Please enter your full name.');
        return;
      }
      if (cleanPass.length < 6) {
        setErrorMsg('Password must be at least 6 characters long.');
        return;
      }

      setIsSubmitting(true);
      try {
        const result = await signup(cleanName, cleanEmail, cleanPass);
        if (result.success) {
          addToast('success', `Welcome to Stride, ${cleanName}!`);
        } else {
          setErrorMsg(result.error || 'Failed to create account. Please try again.');
        }
      } catch (err: any) {
        setErrorMsg(err.message || 'An unexpected error occurred during signup.');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setIsSubmitting(true);
      try {
        const result = await login(cleanEmail, cleanPass);
        if (result.success) {
          addToast('success', 'Welcome back!');
        } else {
          setErrorMsg(result.error || 'Incorrect email or password. Please try again.');
        }
      } catch (err: any) {
        setErrorMsg(err.message || 'Invalid login credentials. Please check your email and password.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const toggleMode = (signUp: boolean) => {
    setIsSignUp(signUp);
    setErrorMsg(null);
    setShowPassword(false);
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <img src="/logo.png" alt="Stride" className="auth-brand-img" />
          <h1 className="auth-title">{isSignUp ? 'Create your account' : 'Sign in to Stride'}</h1>
          <p className="auth-subtitle">
            {isSignUp
              ? 'Start tracking sprints and tasks with clarity'
              : 'Make progress, everyday.'}
          </p>
        </div>

        {/* Tab switchers */}
        <div className="auth-tabs" role="tablist">
          <button
            type="button"
            className={`auth-tab-btn ${!isSignUp ? 'active' : ''}`}
            onClick={() => toggleMode(false)}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`auth-tab-btn ${isSignUp ? 'active' : ''}`}
            onClick={() => toggleMode(true)}
          >
            Create Account
          </button>
        </div>

        {pendingInviteToken && (
          <div className="auth-invite-banner" role="status">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16, flexShrink: 0 }}>
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            <span>You have been invited to a team workspace! Sign in or register to join immediately.</span>
          </div>
        )}

        {errorMsg && (
          <div className="auth-error-banner" role="alert">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16, flexShrink: 0 }}>
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{errorMsg}</span>
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {isSignUp && (
            <div className="form-group">
              <label className="form-label" htmlFor="auth-name">Full Name</label>
              <input
                id="auth-name"
                className={`form-input ${errorMsg && !name.trim() ? 'has-error' : ''}`}
                type="text"
                placeholder="e.g. Sarah Connor"
                value={name}
                onChange={handleInputChange(setName)}
                autoComplete="name"
                required
                disabled={isSubmitting}
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="auth-email">Email Address</label>
            <input
              id="auth-email"
              className={`form-input ${errorMsg && (!email.trim() || errorMsg.toLowerCase().includes('email')) ? 'has-error' : ''}`}
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={handleInputChange(setEmail)}
              autoComplete="email"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="form-group">
            <div className="form-label-row">
              <label className="form-label" htmlFor="auth-pass">Password</label>
              {isSignUp && <span className="auth-pass-hint">Min 6 chars</span>}
            </div>
            <div className="auth-password-wrapper">
              <input
                id="auth-pass"
                className={`form-input auth-password-input ${errorMsg && (!password.trim() || errorMsg.toLowerCase().includes('password')) ? 'has-error' : ''}`}
                type={showPassword ? 'text' : 'password'}
                placeholder={isSignUp ? 'Create a secure password' : 'Enter your password'}
                value={password}
                onChange={handleInputChange(setPassword)}
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
                required
                disabled={isSubmitting}
              />
              <button
                type="button"
                className="auth-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                title={showPassword ? 'Hide password' : 'Show password'}
                tabIndex={-1}
              >
                {showPassword ? eyeClosedIcon : eyeOpenIcon}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting}
            style={{ width: '100%', marginTop: 'var(--space-2)' }}
          >
            {isSubmitting ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <span className="auth-btn-spinner" />
                {isSignUp ? 'Creating Account...' : 'Signing In...'}
              </span>
            ) : (
              isSignUp ? 'Create Account' : 'Sign In to Workspace'
            )}
          </Button>
        </form>

        <div className="auth-footer-privacy">
          By continuing, you agree to Stride's Terms of Service and Privacy Policy.
        </div>
      </div>
    </div>
  );
}
