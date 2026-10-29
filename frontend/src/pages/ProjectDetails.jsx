import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Edit3,
  FolderGit2,
  Plus,
  Trash2,
  User,
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import ConfirmDialog from '../components/ConfirmDialog';
import ProjectModal from '../components/ProjectModal';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import useAuth from '../hooks/useAuth';
import api from '../services/api';

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isManager, isAdmin } = useAuth();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isEditProjectOpen, setIsEditProjectOpen] = useState(false);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchProjectDetails = async () => {
    try {
      setLoading(true);
      const [projRes, tasksRes] = await Promise.all([
        api.get(`projects/${id}/`),
        api.get(`projects/${id}/tasks/`),
      ]);
      setProject(projRes.data);
      setTasks(tasksRes.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load project details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectDetails();
  }, [id]);

  const handleUpdateProject = async (data) => {
    await api.patch(`projects/${id}/`, data);
    await fetchProjectDetails();
  };

  const handleDeleteProject = async () => {
    try {
      setIsDeleting(true);
      await api.delete(`projects/${id}/`);
      navigate('/projects');
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCreateTask = async (data) => {
    await api.post('tasks/', { ...data, project: id });
    await fetchProjectDetails();
  };

  if (loading && !project) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading project workspace...
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--danger)', marginBottom: '1rem' }}>{error || 'Project not found'}</p>
        <button className="btn btn-secondary" onClick={() => navigate('/projects')}>
          <ArrowLeft size={16} /> Back to Projects
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Back button */}
      <button
        onClick={() => navigate('/projects')}
        className="btn btn-secondary btn-sm"
        style={{ marginBottom: '1.5rem' }}
      >
        <ArrowLeft size={16} /> Back to Projects
      </button>

      {/* Project Overview Card */}
      <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <span className="badge badge-in-progress" style={{ fontSize: '0.8rem' }}>
                {project.status}
              </span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Created on {new Date(project.created_at).toLocaleDateString()}
              </span>
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#ffffff', letterSpacing: '-0.02em' }}>
              {project.name}
            </h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', maxWidth: '800px', lineHeight: 1.6 }}>
              {project.description || 'No description added for this project yet.'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {isManager && (
              <button className="btn btn-secondary" onClick={() => setIsEditProjectOpen(true)}>
                <Edit3 size={16} /> Edit
              </button>
            )}
            {isAdmin && (
              <button className="btn btn-danger" onClick={() => setDeleteConfirmOpen(true)}>
                <Trash2 size={16} /> Delete
              </button>
            )}
          </div>
        </div>

        {/* Project Meta Bar */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.5rem',
            marginTop: '2rem',
            paddingTop: '1.5rem',
            borderTop: '1px solid var(--border-subtle)',
          }}
        >
          <div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>Project Lead</p>
            <p style={{ fontSize: '0.95rem', fontWeight: '600', color: '#ffffff', marginTop: '0.2rem' }}>
              {project.created_by_detail?.full_name || project.created_by_detail?.username}
            </p>
          </div>

          <div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>Timeline</p>
            <p style={{ fontSize: '0.95rem', fontWeight: '600', color: '#ffffff', marginTop: '0.2rem' }}>
              {project.start_date} → {project.end_date}
            </p>
          </div>

          <div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>Completion</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.35rem' }}>
              <div className="progress-container" style={{ flex: 1, height: '10px' }}>
                <div
                  className={`progress-bar ${project.progress_percentage === 100 ? 'progress-bar-success' : ''}`}
                  style={{ width: `${project.progress_percentage}%` }}
                />
              </div>
              <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--primary)' }}>
                {project.progress_percentage}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Project Tasks Section */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: '700', color: '#ffffff' }}>
              Project Tasks ({tasks.length})
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Deliverables and assignments specifically tied to {project.name}
            </p>
          </div>

          {isManager && (
            <button className="btn btn-primary" onClick={() => setIsCreateTaskOpen(true)}>
              <Plus size={16} /> Add Task to Project
            </button>
          )}
        </div>

        {tasks.length === 0 ? (
          <div className="glass-panel" style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <p>No tasks created in this project yet.</p>
            {isManager && (
              <button
                className="btn btn-primary btn-sm"
                style={{ marginTop: '1rem' }}
                onClick={() => setIsCreateTaskOpen(true)}
              >
                <Plus size={14} /> Create First Task
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {tasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        )}
      </div>

      {/* Edit Project Modal */}
      <ProjectModal
        isOpen={isEditProjectOpen}
        onClose={() => setIsEditProjectOpen(false)}
        project={project}
        onSave={handleUpdateProject}
      />

      {/* Create Task in Project Modal */}
      <TaskModal
        isOpen={isCreateTaskOpen}
        onClose={() => setIsCreateTaskOpen(false)}
        onSave={handleCreateTask}
      />

      {/* Delete Project Confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDeleteProject}
        title="Delete Project"
        message={`Are you sure you want to delete "${project.name}" and all its tasks?`}
        loading={isDeleting}
      />
    </div>
  );
};

export default ProjectDetails;
