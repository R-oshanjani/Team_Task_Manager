import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

const ProjectModal = ({ isOpen, onClose, project, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    status: 'Planning',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      if (project) {
        setFormData({
          name: project.name || '',
          description: project.description || '',
          start_date: project.start_date || '',
          end_date: project.end_date || '',
          status: project.status || 'Planning',
        });
      } else {
        setFormData({
          name: '',
          description: '',
          start_date: new Date().toISOString().split('T')[0],
          end_date: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
          status: 'Planning',
        });
      }
      setError(null);
    }
  }, [isOpen, project]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Project name is required.');
      return;
    }
    if (formData.start_date && formData.end_date && formData.end_date < formData.start_date) {
      setError('End date cannot be earlier than start date.');
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
        setError(detail || 'Failed to save project.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{project ? 'Edit Project' : 'Create New Project'}</h3>
          <button className="btn-icon" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="form-error" style={{ marginBottom: '1rem', padding: '0.6rem', background: 'var(--danger-bg)', borderRadius: 'var(--radius-sm)' }}>{error}</div>}

            <div className="form-group">
              <label className="form-label">Project Name *</label>
              <input
                type="text"
                name="name"
                className="form-input"
                placeholder="e.g. NextGen Mobile Banking"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                name="description"
                rows={3}
                className="form-textarea"
                placeholder="Goals, target deliverables, architecture overview..."
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Start Date *</label>
                <input
                  type="date"
                  name="start_date"
                  className="form-input"
                  value={formData.start_date}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">End Date *</label>
                <input
                  type="date"
                  name="end_date"
                  className="form-input"
                  value={formData.end_date}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                name="status"
                className="form-select"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="Planning">Planning</option>
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
                <option value="On Hold">On Hold</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : project ? 'Update Project' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectModal;
