import React, { useState } from 'react';
import { ArrowRight, CheckSquare, KeyRound, Lock, Shield, User } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError('Please provide both username/email and password.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await login(username.trim(), password);
      navigate(from, { replace: true });
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.non_field_errors?.[0] ||
        err.response?.data?.detail ||
        'Invalid credentials. Please verify your login details.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoUsername, demoPassword) => {
    setUsername(demoUsername);
    setPassword(demoPassword);
    try {
      setLoading(true);
      setError(null);
      await login(demoUsername, demoPassword);
      navigate(from, { replace: true });
    } catch (err) {
      setError('Demo login failed. Please ensure the backend server is running and seeded.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        background: 'radial-gradient(ellipse at top, #1e1b4b 0%, #0a0f1d 70%)',
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '460px',
          padding: '2.5rem',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 20px 45px rgba(0, 0, 0, 0.6), 0 0 35px rgba(99, 102, 241, 0.15)',
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              margin: '0 auto 1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(99, 102, 241, 0.4)',
              color: '#ffffff',
            }}
          >
            <CheckSquare size={28} strokeWidth={2.5} />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', letterSpacing: '-0.025em', color: '#ffffff' }}>
            Welcome to Task<span style={{ color: 'var(--primary)' }}>Pulse</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.35rem' }}>
            Production-grade team task & project management
          </p>
        </div>

        {error && (
          <div
            style={{
              background: 'var(--danger-bg)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: 'var(--danger)',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              marginBottom: '1.5rem',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email or Username</label>
            <div style={{ position: 'relative' }}>
              <User
                size={16}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                }}
              />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '2.4rem' }}
                placeholder="admin or user@teamtask.com"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '1.75rem' }}>
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock
                size={16}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                }}
              />
              <input
                type="password"
                className="form-input"
                style={{ paddingLeft: '2.4rem' }}
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.8rem', fontSize: '0.95rem' }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign In to Workspace'} <ArrowRight size={16} />
          </button>
        </form>

        {/* Demo Accounts Quick Fill */}
        <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-subtle)' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '0.75rem', textAlign: 'center' }}>
            Quick Demo Login (1-Click)
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => handleDemoLogin('admin', 'AdminPassword123!')}
              style={{ fontSize: '0.75rem', padding: '0.45rem' }}
            >
              👑 Admin
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => handleDemoLogin('manager_sarah', 'ManagerPassword123!')}
              style={{ fontSize: '0.75rem', padding: '0.45rem' }}
            >
              💼 Manager
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => handleDemoLogin('john_dev', 'EmployeePassword123!')}
              style={{ fontSize: '0.75rem', padding: '0.45rem' }}
            >
              💻 Employee
            </button>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--primary)', fontWeight: '600' }}>
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
