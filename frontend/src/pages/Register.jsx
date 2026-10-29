import React, { useState } from 'react';
import { ArrowRight, CheckSquare, Lock, Mail, Shield, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    username: '',
    password: '',
    confirm_password: '',
    role: 'EMPLOYEE',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirm_password) {
      setError('Passwords do not match.');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await register(formData);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      const detail = err.response?.data;
      if (typeof detail === 'object') {
        const firstKey = Object.keys(detail)[0];
        const msg = Array.isArray(detail[firstKey]) ? detail[firstKey][0] : detail[firstKey];
        setError(`${firstKey}: ${msg}`);
      } else {
        setError(detail || 'Registration failed. Please check your information.');
      }
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
        padding: '2rem 1.5rem',
        background: 'radial-gradient(ellipse at top, #1e1b4b 0%, #0a0f1d 70%)',
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '520px',
          padding: '2.5rem',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 20px 45px rgba(0, 0, 0, 0.6), 0 0 35px rgba(99, 102, 241, 0.15)',
        }}
      >
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
            Create an Account
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.35rem' }}>
            Join your organization workspace on TaskPulse
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
          {/* First Name & Last Name */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">First Name *</label>
              <input
                type="text"
                name="first_name"
                className="form-input"
                placeholder="John"
                value={formData.first_name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Last Name *</label>
              <input
                type="text"
                name="last_name"
                className="form-input"
                placeholder="Doe"
                value={formData.last_name}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Email & Username */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input
                type="email"
                name="email"
                className="form-input"
                placeholder="john@teamtask.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Username *</label>
              <input
                type="text"
                name="username"
                className="form-input"
                placeholder="john_dev"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Role selection */}
          <div className="form-group">
            <label className="form-label">Organizational Role *</label>
            <select
              name="role"
              className="form-select"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="EMPLOYEE">Employee (Task Execution & Progress Updates)</option>
              <option value="MANAGER">Manager (Task Assignment & Project Oversight)</option>
              <option value="ADMIN">Admin (Full Workspace Management)</option>
            </select>
          </div>

          {/* Password & Confirm */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div className="form-group">
              <label className="form-label">Password *</label>
              <input
                type="password"
                name="password"
                className="form-input"
                placeholder="Min 6 characters"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password *</label>
              <input
                type="password"
                name="confirm_password"
                className="form-input"
                placeholder="Re-enter password"
                value={formData.confirm_password}
                onChange={handleChange}
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
            {loading ? 'Creating Account...' : 'Complete Registration'} <ArrowRight size={16} />
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '600' }}>
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
