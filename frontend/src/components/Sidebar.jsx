import React from 'react';
import {
  Bell,
  CheckSquare,
  FolderGit2,
  LayoutDashboard,
  Plus,
  Shield,
  User,
  Users,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const Sidebar = ({ isOpen, onOpenTaskModal }) => {
  const { user, isManager } = useAuth();

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Projects', path: '/projects', icon: FolderGit2 },
    { label: 'All Tasks', path: '/tasks', icon: CheckSquare },
    { label: 'My Tasks', path: '/tasks?assigned_only=true', icon: CheckSquare },
    ...(user?.role === 'ADMIN' ? [{ label: 'User Directory', path: '/users', icon: Users }] : []),
    { label: 'Notifications', path: '/notifications', icon: Bell },
    { label: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <aside
      style={{
        width: isOpen ? '260px' : '0',
        minWidth: isOpen ? '260px' : '0',
        background: 'var(--bg-sidebar)',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all var(--transition-normal)',
        overflow: 'hidden',
        zIndex: 60,
        height: '100vh',
        position: 'sticky',
        top: 0,
      }}
    >
      {/* Brand Header */}
      <div
        style={{
          height: '70px',
          display: 'flex',
          alignItems: 'center',
          gap: '0.85rem',
          padding: '0 1.5rem',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #6366f1, #a855f7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)',
          }}
        >
          <CheckSquare size={20} strokeWidth={2.5} />
        </div>
        <div>
          <h2 style={{ fontSize: '1.15rem', fontWeight: '800', letterSpacing: '-0.02em', color: '#ffffff' }}>
            Task<span style={{ color: 'var(--primary)' }}>Pulse</span>
          </h2>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '500' }}>Team Workspace</p>
        </div>
      </div>

      {/* Quick Action Button for Managers / Admins */}
      {isManager && (
        <div style={{ padding: '1.25rem 1.25rem 0.5rem 1.25rem' }}>
          <button
            onClick={onOpenTaskModal}
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.65rem' }}
          >
            <Plus size={18} /> New Task
          </button>
        </div>
      )}

      {/* Navigation Links */}
      <nav style={{ flex: 1, padding: '1rem 0.85rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        <p style={{ fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', padding: '0.5rem 0.75rem' }}>
          Navigation
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem',
                padding: '0.7rem 1rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.9rem',
                fontWeight: isActive ? '600' : '500',
                color: isActive ? '#ffffff' : 'var(--text-secondary)',
                background: isActive ? 'linear-gradient(90deg, rgba(99, 102, 241, 0.2), rgba(99, 102, 241, 0.05))' : 'transparent',
                borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent',
                transition: 'all var(--transition-fast)',
              })}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Role Pill Card */}
      <div style={{ padding: '1.25rem', borderTop: '1px solid var(--border-subtle)' }}>
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          <div
            style={{
              padding: '0.5rem',
              borderRadius: '8px',
              background: 'rgba(99, 102, 241, 0.15)',
              color: 'var(--primary)',
            }}
          >
            <Shield size={18} />
          </div>
          <div style={{ overflow: 'hidden' }}>
            <p style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-primary)', textTransform: 'capitalize' }}>
              {user?.role?.toLowerCase()} Access
            </p>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              {user?.role === 'ADMIN'
                ? 'Full Control & User Mgmt'
                : user?.role === 'MANAGER'
                ? 'Assign & Track Tasks'
                : 'Manage Assigned Tasks'}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
