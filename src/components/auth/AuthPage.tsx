// ============================================================
// AuthPage Component — Real-World Production Login & Signup
// ============================================================

import { useState, type FormEvent } from 'react';
import { useApp } from '../../context/AppContext';
import Button from '../ui/Button';
import './AuthPage.css';

export default function AuthPage() {
  const { login, signup, addToast } = useApp();
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanEmail = email.trim();
    const cleanPass = password.trim();

    if (!cleanEmail || !cleanPass) {
      setErrorMsg('Please provide both email and password.');
      return;
    }

    if (isSignUp) {
      const cleanName = name.trim();
      if (!cleanName) {
        setErrorMsg('Please enter your full name.');
        return;
      }
      if (cleanPass.length < 6) {
        setErrorMsg('Password must be at least 6 characters.');
        return;
      }

      setIsSubmitting(true);
      try {
        const success = await signup(cleanName, cleanEmail, cleanPass);
        if (success) {
          addToast('success', `Welcome to Stride, ${cleanName}!`);
        }
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setIsSubmitting(true);
      try {
        const success = await login(cleanEmail, cleanPass);
        if (success) {
          addToast('success', 'Welcome back!');
        }
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const toggleMode = (signUp: boolean) => {
    setIsSignUp(signUp);
    setErrorMsg(null);
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <img src="/logo.png" alt="Stride" className="auth-brand-img" />
          <h1 className="auth-title">{isSignUp ? 'Create your account' : 'Sign in to Stride'}</h1>
          <p className="auth-subtitle">
            {isSignUp
              ? 'Start tracking sprints and tasks with high clarity'
              : 'Make progress, everyday'}
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
                className="form-input"
                type="text"
                placeholder="e.g. Sarah Connor"
                value={name}
                onChange={e => setName(e.target.value)}
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
              className="form-input"
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="auth-pass">Password</label>
            <input
              id="auth-pass"
              className="form-input"
              type="password"
              placeholder={isSignUp ? 'Min 6 characters' : 'Enter your password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete={isSignUp ? 'new-password' : 'current-password'}
              required
              disabled={isSubmitting}
            />
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
              isSignUp ? 'Create Free Account' : 'Sign In to Workspace'
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
