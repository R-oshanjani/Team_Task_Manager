import React, { useEffect, useRef, useState } from 'react';
import { Bell, CheckCheck, Clock, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const [listRes, countRes] = await Promise.all([
        api.get('notifications/?page_size=5'),
        api.get('notifications/unread-count/'),
      ]);
      setNotifications(listRes.data.results || listRes.data);
      setUnreadCount(countRes.data.unread_count || 0);
    } catch (err) {
      console.warn('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 45000); // refresh every 45s
    return () => clearInterval(interval);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id, e) => {
    e.stopPropagation();
    try {
      await api.patch(`notifications/${id}/read/`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.post('notifications/read-all/');
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotificationClick = (n) => {
    if (!n.is_read) {
      api.patch(`notifications/${n.id}/read/`).catch(() => {});
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
    setIsOpen(false);
    if (n.task) {
      navigate(`/tasks/${n.task}`);
    } else {
      navigate('/notifications');
    }
  };

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      <button
        type="button"
        className="btn-icon"
        onClick={() => setIsOpen(!isOpen)}
        style={{ position: 'relative' }}
        title="Notifications"
        aria-label="View notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '4px',
              right: '4px',
              width: '18px',
              height: '18px',
              background: 'var(--danger)',
              color: '#ffffff',
              fontSize: '0.65rem',
              fontWeight: '700',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid var(--bg-app)',
            }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 10px)',
            right: 0,
            width: '360px',
            maxWidth: '90vw',
            background: 'var(--bg-card-solid)',
            border: '1px solid var(--border-strong)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-lg), 0 0 25px rgba(0,0,0,0.5)',
            zIndex: 1000,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '0.85rem 1rem',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontWeight: '700', fontSize: '0.95rem' }}>Notifications</span>
              {unreadCount > 0 && (
                <span className="badge badge-critical" style={{ fontSize: '0.7rem' }}>
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--primary)',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                }}
              >
                <CheckCheck size={14} /> Mark all read
              </button>
            )}
          </div>

          <div style={{ maxHeight: '340px', overflowY: 'auto' }}>
            {loading && notifications.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                Loading updates...
              </div>
            ) : notifications.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                No notifications yet.
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  style={{
                    padding: '0.85rem 1rem',
                    borderBottom: '1px solid var(--border-subtle)',
                    background: n.is_read ? 'transparent' : 'rgba(99, 102, 241, 0.08)',
                    cursor: 'pointer',
                    transition: 'background var(--transition-fast)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.3rem',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--bg-hover)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = n.is_read ? 'transparent' : 'rgba(99, 102, 241, 0.08)';
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <p style={{ fontSize: '0.85rem', color: n.is_read ? 'var(--text-secondary)' : 'var(--text-primary)', fontWeight: n.is_read ? '400' : '600' }}>
                      {n.message}
                    </p>
                    {!n.is_read && (
                      <span
                        onClick={(e) => handleMarkAsRead(n.id, e)}
                        title="Mark as read"
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: 'var(--primary)',
                          display: 'inline-block',
                          flexShrink: 0,
                          marginTop: '4px',
                        }}
                      />
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                    <Clock size={12} />
                    <span>{new Date(n.created_at).toLocaleDateString()} {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div
            style={{
              padding: '0.65rem 1rem',
              borderTop: '1px solid var(--border-subtle)',
              textAlign: 'center',
              background: 'rgba(0,0,0,0.2)',
            }}
          >
            <button
              onClick={() => {
                setIsOpen(false);
                navigate('/notifications');
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--primary)',
                fontSize: '0.8rem',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
              }}
            >
              View all notifications <ExternalLink size={12} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
