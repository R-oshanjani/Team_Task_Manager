import React, { useEffect, useState } from 'react';
import { Bell, CheckCheck, Clock, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Notifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get('notifications/?page_size=50');
      setNotifications(res.data.results || res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch notifications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await api.patch(`notifications/${id}/read/`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.post('notifications/read-all/');
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div style={{ maxWidth: '900px' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Bell size={28} style={{ color: 'var(--primary)' }} />
            Notifications
          </h1>
          <p className="page-subtitle">
            Stay informed with task assignments, deadlines, updates, and reviews.
          </p>
        </div>

        {unreadCount > 0 && (
          <button className="btn btn-secondary" onClick={handleMarkAllRead}>
            <CheckCheck size={16} /> Mark All as Read
          </button>
        )}
      </div>

      {error && (
        <div style={{ background: 'var(--danger-bg)', color: 'var(--danger)', padding: '0.85rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading your notifications...
        </div>
      ) : notifications.length === 0 ? (
        <div className="glass-panel" style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Bell size={42} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
          <h3>No notifications yet</h3>
          <p style={{ marginTop: '0.5rem' }}>
            When tasks are assigned, updated, or completed, you will receive activity updates here.
          </p>
        </div>
      ) : (
        <div className="glass-panel" style={{ overflow: 'hidden' }}>
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => {
                if (!n.is_read) handleMarkAsRead(n.id);
                if (n.task) navigate(`/tasks/${n.task}`);
              }}
              style={{
                padding: '1.25rem 1.5rem',
                borderBottom: '1px solid var(--border-subtle)',
                background: n.is_read ? 'transparent' : 'rgba(99, 102, 241, 0.08)',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '1rem',
                transition: 'background var(--transition-fast)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-hover)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = n.is_read ? 'transparent' : 'rgba(99, 102, 241, 0.08)'; }}
            >
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <span
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: n.is_read ? 'transparent' : 'var(--primary)',
                    marginTop: '6px',
                    flexShrink: 0,
                  }}
                />
                <div>
                  <p style={{ fontSize: '0.95rem', fontWeight: n.is_read ? '400' : '600', color: '#ffffff', lineHeight: 1.4 }}>
                    {n.message}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.35rem' }}>
                    <Clock size={13} />
                    <span>{new Date(n.created_at).toLocaleDateString()} at {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                {n.task && (
                  <span style={{ fontSize: '0.8rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    View Task <ExternalLink size={13} />
                  </span>
                )}
                {!n.is_read && (
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMarkAsRead(n.id);
                    }}
                    style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
                  >
                    Mark read
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
