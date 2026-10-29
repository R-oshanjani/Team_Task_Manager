import React, { useState } from 'react';
import { LogOut, Menu, Search, ShieldCheck, User as UserIcon } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import NotificationDropdown from './NotificationDropdown';

const Navbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/tasks?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const initials = user
    ? `${user.first_name?.[0] || ''}${user.last_name?.[0] || user.username?.[0] || 'U'}`.toUpperCase()
    : 'U';

  const roleBadgeClass =
    user?.role === 'ADMIN'
      ? 'badge-admin'
      : user?.role === 'MANAGER'
      ? 'badge-manager'
      : 'badge-employee';

  return (
    <header
      style={{
        height: '70px',
        borderBottom: '1px solid var(--border-subtle)',
        background: 'rgba(13, 18, 33, 0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 2rem',
        gap: '1.5rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          className="btn-icon"
          onClick={onToggleSidebar}
          aria-label="Toggle navigation menu"
          style={{ display: 'inline-flex' }}
        >
          <Menu size={22} />
        </button>

        {/* Search input */}
        <form onSubmit={handleSearch} style={{ position: 'relative', width: '280px' }}>
          <Search
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
            placeholder="Search tasks, projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '0.55rem 0.75rem 0.55rem 2.25rem',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
              fontSize: '0.85rem',
              outline: 'none',
              transition: 'all var(--transition-fast)',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'var(--primary)';
              e.target.style.background = 'rgba(255, 255, 255, 0.08)';
              e.target.style.boxShadow = '0 0 0 2px rgba(99, 102, 241, 0.2)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'var(--border-subtle)';
              e.target.style.background = 'rgba(255, 255, 255, 0.05)';
              e.target.style.boxShadow = 'none';
            }}
          />
        </form>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <NotificationDropdown />

        {/* User Pill / Profile dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-subtle)',
              padding: '0.35rem 0.75rem 0.35rem 0.35rem',
              borderRadius: 'var(--radius-full)',
              cursor: 'pointer',
              color: 'var(--text-primary)',
            }}
          >
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                color: '#ffffff',
                fontWeight: '700',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px var(--primary-glow)',
              }}
            >
              {initials}
            </div>
            <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: '600', lineHeight: 1.2 }}>
                {user?.full_name || user?.username}
              </span>
              <span className={`badge ${roleBadgeClass}`} style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem', marginTop: '2px', alignSelf: 'flex-start' }}>
                {user?.role}
              </span>
            </div>
          </button>

          {showProfileMenu && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                width: '210px',
                background: 'var(--bg-card-solid)',
                border: '1px solid var(--border-strong)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-lg)',
                padding: '0.5rem',
                zIndex: 1000,
              }}
              onMouseLeave={() => setShowProfileMenu(false)}
            >
              <div style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid var(--border-subtle)' }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Signed in as</p>
                <p style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user?.email}
                </p>
              </div>

              <Link
                to="/profile"
                onClick={() => setShowProfileMenu(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  padding: '0.6rem 0.75rem',
                  fontSize: '0.85rem',
                  color: 'var(--text-secondary)',
                  borderRadius: 'var(--radius-sm)',
                  transition: 'background var(--transition-fast)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--bg-hover)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }}
              >
                <UserIcon size={16} /> My Profile
              </Link>

              {user?.role === 'ADMIN' && (
                <Link
                  to="/users"
                  onClick={() => setShowProfileMenu(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    padding: '0.6rem 0.75rem',
                    fontSize: '0.85rem',
                    color: 'var(--text-secondary)',
                    borderRadius: 'var(--radius-sm)',
                    transition: 'background var(--transition-fast)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--bg-hover)';
                    e.currentTarget.style.color = 'var(--text-primary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }}
                >
                  <ShieldCheck size={16} /> User Management
                </Link>
              )}

              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  logout();
                  navigate('/login');
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  padding: '0.6rem 0.75rem',
                  fontSize: '0.85rem',
                  color: 'var(--danger)',
                  background: 'transparent',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--danger-bg)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <LogOut size={16} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
