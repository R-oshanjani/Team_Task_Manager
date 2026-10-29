import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Edit2,
  Edit3,
  FolderGit2,
  MessageSquare,
  Send,
  Trash2,
  User,
} from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import ConfirmDialog from '../components/ConfirmDialog';
import TaskModal from '../components/TaskModal';
import useAuth from '../hooks/useAuth';
import api from '../services/api';

const TaskDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isManager, isAdmin } = useAuth();

  const [task, setTask] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Quick status / progress update
  const [currentStatus, setCurrentStatus] = useState('');
  const [currentProgress, setCurrentProgress] = useState(0);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Comment input state
  const [newComment, setNewComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentText, setEditingCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // Modals state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchTaskAndComments = async () => {
    try {
      setLoading(true);
      const [taskRes, commentsRes] = await Promise.all([
        api.get(`tasks/${id}/`),
        api.get(`tasks/${id}/comments/`),
      ]);
      setTask(taskRes.data);
      setCurrentStatus(taskRes.data.status);
      setCurrentProgress(taskRes.data.progress);
      setComments(commentsRes.data.results || commentsRes.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch task details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTaskAndComments();
  }, [id]);

  const handleQuickStatusSave = async () => {
    try {
      setIsUpdatingStatus(true);
      const payload = {
        status: currentStatus,
        progress: currentStatus === 'Completed' ? 100 : currentProgress,
      };
      const response = await api.patch(`tasks/${id}/`, payload);
      setTask(response.data);
      setCurrentStatus(response.data.status);
      setCurrentProgress(response.data.progress);
    } catch (err) {
      console.error(err);
      alert('Failed to update status.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleCreateComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setIsSubmittingComment(true);
      await api.post(`tasks/${id}/comments/`, { comment: newComment.trim() });
      setNewComment('');
      const commentsRes = await api.get(`tasks/${id}/comments/`);
      setComments(commentsRes.data.results || commentsRes.data);
    } catch (err) {
      console.error(err);
      alert('Failed to post comment.');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleUpdateComment = async (commentId) => {
    if (!editingCommentText.trim()) return;
    try {
      await api.put(`comments/${commentId}/`, { comment: editingCommentText.trim() });
      setEditingCommentId(null);
      setEditingCommentText('');
      const commentsRes = await api.get(`tasks/${id}/comments/`);
      setComments(commentsRes.data.results || commentsRes.data);
    } catch (err) {
      console.error(err);
      alert('Failed to update comment.');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await api.delete(`comments/${commentId}/`);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (err) {
      console.error(err);
      alert('Failed to delete comment.');
    }
  };

  const handleDeleteTask = async () => {
    try {
      setIsDeleting(true);
      await api.delete(`tasks/${id}/`);
      navigate('/tasks');
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSaveModal = async (data) => {
    await api.patch(`tasks/${id}/`, data);
    await fetchTaskAndComments();
  };

  if (loading && !task) {
    return (
      <div style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading task workspace...
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="glass-panel" style={{ padding: '3.5rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--danger)', marginBottom: '1rem' }}>{error || 'Task not found'}</p>
        <button className="btn btn-secondary" onClick={() => navigate('/tasks')}>
          <ArrowLeft size={16} /> Back to Tasks
        </button>
      </div>
    );
  }

  const isAssignedToCurrentUser = task.assigned_to === user?.id || task.assigned_to_detail?.id === user?.id;
  const canUpdateStatus = isManager || isAssignedToCurrentUser;

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

  const isOverdue =
    task.status !== 'Completed' && new Date(task.due_date) < new Date(new Date().setHours(0, 0, 0, 0));

  return (
    <div>
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="btn btn-secondary btn-sm"
        style={{ marginBottom: '1.5rem' }}
      >
        <ArrowLeft size={16} /> Back
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(300px, 1fr)', gap: '1.75rem', alignItems: 'flex-start' }}>
        {/* Main Details & Comment Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          {/* Task Card */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            {/* Header info */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Link
                  to={`/projects/${task.project}`}
                  className="badge badge-in-progress"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', textDecoration: 'none' }}
                >
                  <FolderGit2 size={13} /> {task.project_detail?.name || 'Project'}
                </Link>
                <span className={`badge ${getPriorityBadge(task.priority)}`}>
                  {task.priority} Priority
                </span>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {isManager && (
                  <button className="btn btn-secondary btn-sm" onClick={() => setIsEditModalOpen(true)}>
                    <Edit3 size={15} /> Edit Task
                  </button>
                )}
                {isAdmin && (
                  <button className="btn btn-danger btn-sm" onClick={() => setDeleteConfirmOpen(true)}>
                    <Trash2 size={15} /> Delete
                  </button>
                )}
              </div>
            </div>

            <h1 style={{ fontSize: '1.85rem', fontWeight: '800', color: '#ffffff', letterSpacing: '-0.02em', lineHeight: 1.3 }}>
              {task.title}
            </h1>

            <div style={{ marginTop: '1.25rem', color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
              {task.description || 'No detailed description provided for this task.'}
            </div>

            {/* Progress visual */}
            <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.45rem' }}>
                <span style={{ fontWeight: '600', color: 'var(--text-secondary)' }}>Execution Progress</span>
                <span style={{ fontWeight: '700', color: task.progress === 100 ? 'var(--success)' : 'var(--primary)' }}>
                  {task.progress}%
                </span>
              </div>
              <div className="progress-container" style={{ height: '10px' }}>
                <div
                  className={`progress-bar ${task.progress === 100 ? 'progress-bar-success' : ''}`}
                  style={{ width: `${task.progress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Comments System */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#ffffff', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MessageSquare size={20} style={{ color: 'var(--primary)' }} />
              Comments & Discussion ({comments.length})
            </h3>

            {/* Comment Post Form */}
            <form onSubmit={handleCreateComment} style={{ marginBottom: '2rem' }}>
              <div style={{ position: 'relative' }}>
                <textarea
                  rows={3}
                  className="form-textarea"
                  placeholder="Leave an update, PR link, or blocker description..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  style={{ paddingRight: '4rem' }}
                />
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={isSubmittingComment || !newComment.trim()}
                  style={{
                    position: 'absolute',
                    bottom: '12px',
                    right: '12px',
                    padding: '0.4rem 0.85rem',
                  }}
                >
                  <Send size={14} /> Post
                </button>
              </div>
            </form>

            {/* Comments List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {comments.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '1.5rem 0', fontSize: '0.85rem' }}>
                  No comments yet. Start the conversation!
                </p>
              ) : (
                comments.map((c) => {
                  const isAuthor = c.user === user?.id || c.user_detail?.id === user?.id;
                  const canEdit = isAuthor;
                  const canDelete = isAuthor || isAdmin;

                  return (
                    <div
                      key={c.id}
                      style={{
                        padding: '1.15rem',
                        background: 'rgba(255, 255, 255, 0.03)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-subtle)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <div
                            style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: '50%',
                              background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                              color: '#ffffff',
                              fontSize: '0.75rem',
                              fontWeight: '700',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            {(c.user_detail?.first_name?.[0] || c.user_detail?.username?.[0] || 'U').toUpperCase()}
                          </div>
                          <div>
                            <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#ffffff' }}>
                              {c.user_detail?.full_name || c.user_detail?.username}
                            </span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
                              {new Date(c.created_at).toLocaleDateString()} {new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '0.35rem' }}>
                          {canEdit && editingCommentId !== c.id && (
                            <button
                              className="btn-icon"
                              style={{ padding: '0.3rem' }}
                              onClick={() => {
                                setEditingCommentId(c.id);
                                setEditingCommentText(c.comment);
                              }}
                              title="Edit comment"
                            >
                              <Edit2 size={13} />
                            </button>
                          )}
                          {canDelete && (
                            <button
                              className="btn-icon"
                              style={{ padding: '0.3rem', color: 'var(--danger)' }}
                              onClick={() => handleDeleteComment(c.id)}
                              title="Delete comment"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </div>

                      {editingCommentId === c.id ? (
                        <div style={{ marginTop: '0.5rem' }}>
                          <textarea
                            rows={2}
                            className="form-textarea"
                            value={editingCommentText}
                            onChange={(e) => setEditingCommentText(e.target.value)}
                          />
                          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => setEditingCommentId(null)}
                            >
                              Cancel
                            </button>
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => handleUpdateComment(c.id)}
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                          {c.comment}
                        </p>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Meta & Quick Action Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Quick Status & Progress Updater */}
          {canUpdateStatus && (
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: '700', color: '#ffffff', marginBottom: '1rem' }}>
                Update Progress & Status
              </h4>

              <div className="form-group">
                <label className="form-label">Task Status</label>
                <select
                  className="form-select"
                  value={currentStatus}
                  onChange={(e) => {
                    const st = e.target.value;
                    setCurrentStatus(st);
                    if (st === 'Completed') setCurrentProgress(100);
                  }}
                >
                  <option value="To Do">To Do</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Review">Review</option>
                  <option value="Completed">Completed</option>
                  <option value="Blocked">Blocked</option>
                </select>
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                  <label className="form-label" style={{ margin: 0 }}>Progress Slider</label>
                  <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--primary)' }}>
                    {currentProgress}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={currentProgress}
                  onChange={(e) => setCurrentProgress(parseInt(e.target.value, 10))}
                  style={{ width: '100%', accentColor: 'var(--primary)', cursor: 'pointer' }}
                />
              </div>

              <button
                className="btn btn-primary btn-sm"
                style={{ width: '100%', marginTop: '0.5rem' }}
                onClick={handleQuickStatusSave}
                disabled={isUpdatingStatus}
              >
                {isUpdatingStatus ? 'Saving...' : 'Update Status'}
              </button>
            </div>
          )}

          {/* Properties Meta Card */}
          <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: '700', color: '#ffffff', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
              Task Information
            </h4>

            {/* Assigned to */}
            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>Assigned To</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '0.35rem' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'rgba(99, 102, 241, 0.2)',
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '700',
                    fontSize: '0.8rem',
                  }}
                >
                  {task.assigned_to_detail
                    ? (task.assigned_to_detail.first_name?.[0] || task.assigned_to_detail.username?.[0]).toUpperCase()
                    : '?'}
                </div>
                <div>
                  <p style={{ fontSize: '0.85rem', fontWeight: '600', color: '#ffffff' }}>
                    {task.assigned_to_detail ? task.assigned_to_detail.full_name || task.assigned_to_detail.username : 'Unassigned'}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {task.assigned_to_detail?.role || 'Team Member'}
                  </p>
                </div>
              </div>
            </div>

            {/* Created by */}
            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>Created By</p>
              <p style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                {task.created_by_detail?.full_name || task.created_by_detail?.username} ({task.created_by_detail?.role})
              </p>
            </div>

            {/* Due Date */}
            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>Due Date</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem', color: isOverdue ? 'var(--danger)' : '#ffffff', fontWeight: isOverdue ? '700' : '600', fontSize: '0.85rem' }}>
                {isOverdue ? <AlertCircle size={15} /> : <Calendar size={15} />}
                <span>{task.due_date}</span>
                {isOverdue && <span className="badge badge-critical" style={{ fontSize: '0.65rem' }}>Overdue</span>}
              </div>
            </div>

            {/* Timestamps */}
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem' }}>
              <p>Created: {new Date(task.created_at).toLocaleString()}</p>
              <p style={{ marginTop: '0.25rem' }}>Last updated: {new Date(task.updated_at).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <TaskModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        task={task}
        onSave={handleSaveModal}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDeleteTask}
        title="Delete Task"
        message={`Are you sure you want to permanently delete "${task.title}"?`}
        loading={isDeleting}
      />
    </div>
  );
};

export default TaskDetails;
