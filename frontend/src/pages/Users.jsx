import React, { useEffect, useState } from 'react';
import { ShieldCheck, UserCheck, Users as UsersIcon } from 'lucide-react';
import useAuth from '../hooks/useAuth';
import api from '../services/api';

const Users = () => {
  const { user: currentUser, isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingUserId, setUpdatingUserId] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('users/');
      setUsers(res.data.results || res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch user directory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      setUpdatingUserId(userId);
      await api.put(`users/${userId}/`, { role: newRole });
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.detail || 'Failed to update user role.');
    } finally {
      setUpdatingUserId(null);
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'ADMIN':
        return 'badge-admin';
      case 'MANAGER':
        return 'badge-manager';
      default:
        return 'badge-employee';
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <UsersIcon size={28} style={{ color: 'var(--primary)' }} />
            Team Directory & Roles
          </h1>
          <p className="page-subtitle">
            Overview of team members and access control privileges across the workspace.
          </p>
        </div>
      </div>

      {error && (
        <div style={{ background: 'var(--danger-bg)', color: 'var(--danger)', padding: '0.85rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading user records...
        </div>
      ) : (
        <div className="glass-panel" style={{ overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', background: 'rgba(0, 0, 0, 0.2)' }}>
                  <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.8rem', textTransform: 'uppercase' }}>Member</th>
                  <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.8rem', textTransform: 'uppercase' }}>Email</th>
                  <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.8rem', textTransform: 'uppercase' }}>Current Role</th>
                  <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.8rem', textTransform: 'uppercase' }}>Status</th>
                  <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.8rem', textTransform: 'uppercase' }}>Joined</th>
                  {isAdmin && <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.8rem', textTransform: 'uppercase' }}>Admin Action</th>}
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const initials = `${u.first_name?.[0] || ''}${u.last_name?.[0] || u.username?.[0] || 'U'}`.toUpperCase();
                  const isCurrent = u.id === currentUser?.id;

                  return (
                    <tr
                      key={u.id}
                      style={{
                        borderBottom: '1px solid var(--border-subtle)',
                        transition: 'background var(--transition-fast)',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-hover)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      <td style={{ padding: '1.25rem 1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div
                            style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '50%',
                              background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                              color: '#ffffff',
                              fontWeight: '700',
                              fontSize: '0.85rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            {initials}
                          </div>
                          <div>
                            <div style={{ fontWeight: '600', color: '#ffffff' }}>
                              {u.full_name || u.username} {isCurrent && <span style={{ color: 'var(--primary)', fontSize: '0.75rem' }}>(You)</span>}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                              @{u.username}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: '1.25rem 1.5rem', color: 'var(--text-secondary)' }}>
                        {u.email}
                      </td>

                      <td style={{ padding: '1.25rem 1.5rem' }}>
                        <span className={`badge ${getRoleBadge(u.role)}`}>
                          {u.role}
                        </span>
                      </td>

                      <td style={{ padding: '1.25rem 1.5rem' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: u.is_active ? 'var(--success)' : 'var(--danger)', fontSize: '0.85rem', fontWeight: '600' }}>
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: u.is_active ? 'var(--success)' : 'var(--danger)' }} />
                          {u.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>

                      <td style={{ padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>

                      {isAdmin && (
                        <td style={{ padding: '1.25rem 1.5rem' }}>
                          <select
                            className="form-select"
                            value={u.role}
                            onChange={(e) => handleRoleChange(u.id, e.target.value)}
                            disabled={updatingUserId === u.id || (isCurrent && u.role === 'ADMIN')}
                            style={{ padding: '0.35rem 0.6rem', fontSize: '0.8rem', width: 'auto' }}
                          >
                            <option value="EMPLOYEE">Employee</option>
                            <option value="MANAGER">Manager</option>
                            <option value="ADMIN">Admin</option>
                          </select>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
