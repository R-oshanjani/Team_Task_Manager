import React from 'react';
import { AlertCircle, Calendar, CheckCircle2, MessageSquare, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TaskCard = ({ task, onEdit, onDelete, canDelete, onStatusChange }) => {
  const navigate = useNavigate();

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'Critical':
        return 'badge-critical';
      case 'High':
        return 'badge-high';
      case 'Medium':
        return 'badge-medium';
      default:
        return 'badge-low';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Completed':
        return 'badge-completed';
      case 'In Progress':
        return 'badge-in-progress';
      case 'Review':
        return 'badge-review';
      case 'Blocked':
        return 'badge-blocked';
      default:
        return 'badge-todo';
    }
  };

  const isOverdue =
    task.status !== 'Completed' && new Date(task.due_date) < new Date(new Date().setHours(0, 0, 0, 0));

  const handleCardClick = () => {
    navigate(`/tasks/${task.id}`);
  };

  return (
    <div
      className="glass-panel glass-panel-hover"
      onClick={handleCardClick}
      style={{
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.85rem',
        cursor: 'pointer',
        position: 'relative',
        transition: 'all var(--transition-fast)',
      }}
    >
      {/* Header Badges */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
        <span
          style={{
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}
        >
          {task.project_detail?.name || 'Project'}
        </span>

        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
          <span className={`badge ${getPriorityBadge(task.priority)}`}>
            {task.priority}
          </span>
          <span className={`badge ${getStatusBadge(task.status)}`}>
            {task.status}
          </span>
        </div>
      </div>

      {/* Title & Description */}
      <div>
        <h4
          style={{
            fontSize: '1rem',
            fontWeight: '700',
            color: 'var(--text-primary)',
            lineHeight: 1.35,
          }}
        >
          {task.title}
        </h4>
        {task.description && (
          <p
            style={{
              fontSize: '0.825rem',
              color: 'var(--text-secondary)',
              marginTop: '0.35rem',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {task.description}
          </p>
        )}
      </div>

      {/* Progress Bar */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.3rem', color: 'var(--text-muted)' }}>
          <span>Progress</span>
          <span style={{ fontWeight: '600', color: task.progress === 100 ? 'var(--success)' : 'var(--text-primary)' }}>
            {task.progress}%
          </span>
        </div>
        <div className="progress-container">
          <div
            className={`progress-bar ${task.progress === 100 ? 'progress-bar-success' : ''}`}
            style={{ width: `${task.progress}%` }}
          />
        </div>
      </div>

      {/* Footer Meta */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: '0.65rem',
          borderTop: '1px solid var(--border-subtle)',
          marginTop: '0.2rem',
          fontSize: '0.8rem',
          color: 'var(--text-secondary)',
        }}
      >
        {/* Assignee */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <div
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: 'rgba(99, 102, 241, 0.2)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.7rem',
              fontWeight: '700',
            }}
          >
            {task.assigned_to_detail
              ? (task.assigned_to_detail.first_name?.[0] || task.assigned_to_detail.username?.[0]).toUpperCase()
              : '?'}
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-primary)', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {task.assigned_to_detail ? task.assigned_to_detail.full_name || task.assigned_to_detail.username : 'Unassigned'}
          </span>
        </div>

        {/* Due date & Comments */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              color: isOverdue ? 'var(--danger)' : 'var(--text-muted)',
              fontWeight: isOverdue ? '700' : '500',
            }}
            title={isOverdue ? 'Task is overdue!' : 'Due date'}
          >
            {isOverdue ? <AlertCircle size={14} /> : <Calendar size={14} />}
            <span>{task.due_date}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-muted)' }}>
            <MessageSquare size={14} />
            <span>{task.comments_count || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
