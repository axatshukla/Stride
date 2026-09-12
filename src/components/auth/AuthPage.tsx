import { useState, type FormEvent } from 'react';
import { useApp } from '../../context/AppContext';
import Button from '../ui/Button';
import './AuthPage.css';

export default function AuthPage() {
  const { login, addToast } = useApp();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('akshat@taskflow.dev');
  const [password, setPassword] = useState('password123');
  const [name, setName] = useState('Akshat Shukla');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      addToast('error', 'Please fill in all fields');
      return;
    }
    login(email, password);
    addToast('success', `Welcome back, ${name || 'User'}!`);
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <img src="/logo.png" alt="Stride" className="auth-brand-img" />
          <h1 className="auth-title">{isSignUp ? 'Create your Stride account' : 'Sign in to Stride'}</h1>
          <p className="auth-subtitle">
            {isSignUp ? 'Make progress, everyday — start tracking your sprints' : 'Make progress, everyday'}
          </p>
        </div>

        <div className="demo-credentials-box">
          <strong>Demo Credentials:</strong><br />
          Email: <code>akshat@taskflow.dev</code><br />
          Password: <code>password123</code>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {isSignUp && (
            <div className="form-group">
              <label className="form-label" htmlFor="auth-name">Full Name</label>
              <input
                id="auth-name"
                className="form-input"
                type="text"
                placeholder="e.g. Alex Morgan"
                value={name}
                onChange={e => setName(e.target.value)}
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
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="auth-pass">Password</label>
            <input
              id="auth-pass"
              className="form-input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          <Button type="submit" variant="primary" style={{ width: '100%', marginTop: 'var(--space-2)' }}>
            {isSignUp ? 'Create Account' : 'Sign In'}
          </Button>
        </form>

        <div className="auth-toggle">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}
          <button
            className="auth-toggle-btn"
            onClick={() => setIsSignUp(!isSignUp)}
          >
            {isSignUp ? 'Sign in' : 'Sign up'}
          </button>
        </div>
      </div>
    </div>
  );
}
