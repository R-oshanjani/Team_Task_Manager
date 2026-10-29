import React, { useState } from 'react';
import { CheckCircle2, Shield, User } from 'lucide-react';
import useAuth from '../hooks/useAuth';
import api from '../services/api';

const Profile = () => {
  const { user, updateUser } = useAuth();

  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
  });

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setErrorMsg(null);
      setSuccessMsg(null);
      const res = await api.put(`users/${user.id}/`, formData);
      updateUser(res.data);
      setSuccessMsg('Profile updated successfully.');
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.email?.[0] || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const initials = `${user?.first_name?.[0] || ''}${user?.last_name?.[0] || user?.username?.[0] || 'U'}`.toUpperCase();

  return (
    <div style={{ maxWidth: '800px' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <User size={28} style={{ color: 'var(--primary)' }} />
            My Profile
          </h1>
          <p className="page-subtitle">
            Manage your personal account settings, credentials, and profile details.
          </p>
        </div>
      </div>

      {successMsg && (
        <div style={{ background: 'var(--success-bg)', color: 'var(--success)', padding: '0.85rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle2 size={16} /> {successMsg}
        </div>
      )}

      {errorMsg && (
        <div style={{ background: 'var(--danger-bg)', color: 'var(--danger)', padding: '0.85rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
          {errorMsg}
        </div>
      )}

      {/* Profile Overview Banner */}
      <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
        <div
          style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
            color: '#ffffff',
            fontWeight: '800',
            fontSize: '1.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 24px var(--primary-glow)',
          }}
        >
          {initials}
        </div>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#ffffff' }}>
            {user?.full_name || user?.username}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            @{user?.username} • {user?.email}
          </p>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.6rem' }}>
            <span className={`badge ${user?.role === 'ADMIN' ? 'badge-admin' : user?.role === 'MANAGER' ? 'badge-manager' : 'badge-employee'}`}>
              <Shield size={12} /> {user?.role} Role
            </span>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '1.5rem', color: '#ffffff' }}>
          Update Details
        </h3>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">First Name</label>
              <input
                type="text"
                name="first_name"
                className="form-input"
                value={formData.first_name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Last Name</label>
              <input
                type="text"
                name="last_name"
                className="form-input"
                value={formData.last_name}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              name="email"
              className="form-input"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Username (Read-Only)</label>
            <input
              type="text"
              className="form-input"
              value={user?.username || ''}
              disabled
              style={{ opacity: 0.6, cursor: 'not-allowed' }}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ marginTop: '0.5rem' }}
          >
            {loading ? 'Saving Changes...' : 'Save Profile Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
