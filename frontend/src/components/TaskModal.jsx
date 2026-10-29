import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import useAuth from '../hooks/useAuth';
import api from '../services/api';

const TaskModal = ({ isOpen, onClose, task, onSave }) => {
  const { user, isManager } = useAuth();
  const [projects, setProjects] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    project: '',
    assigned_to: '',
    priority: 'Medium',
    status: 'To Do',
    due_date: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    progress: 0,
  });

  const isEmployee = user?.role === 'EMPLOYEE' && !user?.is_superuser;

  useEffect(() => {
    if (isOpen) {
      loadFormData();
      if (task) {
        setFormData({
          title: task.title || '',
          description: task.description || '',
          project: task.project || task.project_detail?.id || '',
          assigned_to: task.assigned_to || task.assigned_to_detail?.id || '',
          priority: task.priority || 'Medium',
          status: task.status || 'To Do',
          due_date: task.due_date || '',
          progress: task.progress !== undefined ? task.progress : 0,
        });
      } else {
        setFormData({
          title: '',
          description: '',
          project: '',
          assigned_to: '',
          priority: 'Medium',
          status: 'To Do',
          due_date: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
          progress: 0,
        });
      }
      setError(null);
    }
  }, [isOpen, task]);

  const loadFormData = async () => {
    try {
      const [projRes, usersRes] = await Promise.all([
        api.get('projects/'),
        api.get('users/team_members/'),
      ]);
      const projectList = projRes.data.results || projRes.data;
      setProjects(projectList);
      setTeamMembers(usersRes.data);

      if (!task && projectList.length > 0) {
        setFormData((prev) => ({ ...prev, project: prev.project || projectList[0].id }));
      }
    } catch (err) {
      console.warn('Error loading options:', err);
    }
  };

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    let updated = { ...formData, [name]: value };

    // Auto-update progress when status changes to Completed
    if (name === 'status' && value === 'Completed') {
      updated.progress = 100;
    }
    // Auto-update status when progress reaches 100
    if (name === 'progress' && parseInt(value, 10) === 100 && updated.status === 'To Do') {
      updated.status = 'Completed';
    }

    setFormData(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('Task title is required.');
      return;
    }
    if (!formData.project) {
      setError('Please select a project.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await onSave(formData);
      onClose();
    } catch (err) {
      console.error(err);
      const detail = err.response?.data;
      if (typeof detail === 'object') {
        const firstKey = Object.keys(detail)[0];
        setError(`${firstKey}: ${Array.isArray(detail[firstKey]) ? detail[firstKey][0] : detail[firstKey]}`);
      } else {
        setError(detail || 'Failed to save task.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{task ? 'Edit Task' : 'Create New Task'}</h3>
          <button className="btn-icon" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="form-error" style={{ marginBottom: '1rem', padding: '0.6rem', background: 'var(--danger-bg)', borderRadius: 'var(--radius-sm)' }}>{error}</div>}

            {/* Task Title */}
            <div className="form-group">
              <label className="form-label">Task Title *</label>
              <input
                type="text"
                name="title"
                className="form-input"
                placeholder="e.g. Implement Payment API"
                value={formData.title}
                onChange={handleChange}
                disabled={isEmployee && !!task}
                required
              />
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                name="description"
                rows={3}
                className="form-textarea"
                placeholder="Detailed objectives, acceptance criteria, or links..."
                value={formData.description}
                onChange={handleChange}
                disabled={isEmployee && !!task}
              />
            </div>

            {/* Project & Assignee row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Project *</label>
                <select
                  name="project"
                  className="form-select"
                  value={formData.project}
                  onChange={handleChange}
                  disabled={isEmployee && !!task}
                  required
                >
                  <option value="">Select Project</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Assigned User</label>
                <select
                  name="assigned_to"
                  className="form-select"
                  value={formData.assigned_to}
                  onChange={handleChange}
                  disabled={isEmployee && !!task}
                >
                  <option value="">Unassigned</option>
                  {teamMembers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.full_name} ({m.role})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Priority & Status row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Priority</label>
                <select
                  name="priority"
                  className="form-select"
                  value={formData.priority}
                  onChange={handleChange}
                  disabled={isEmployee && !!task}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Status</label>
                <select
                  name="status"
                  className="form-select"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="To Do">To Do</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Review">Review</option>
                  <option value="Completed">Completed</option>
                  <option value="Blocked">Blocked</option>
                </select>
              </div>
            </div>

            {/* Due Date & Progress Slider */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', alignItems: 'center' }}>
              <div className="form-group">
                <label className="form-label">Due Date *</label>
                <input
                  type="date"
                  name="due_date"
                  className="form-input"
                  value={formData.due_date}
                  onChange={handleChange}
                  disabled={isEmployee && !!task}
                  required
                />
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                  <label className="form-label" style={{ margin: 0 }}>Progress</label>
                  <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--primary)' }}>
                    {formData.progress}%
                  </span>
                </div>
                <input
                  type="range"
                  name="progress"
                  min="0"
                  max="100"
                  value={formData.progress}
                  onChange={handleChange}
                  style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--primary)' }}
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : task ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
