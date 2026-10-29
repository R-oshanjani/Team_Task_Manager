import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle,
  Clock,
  Filter,
  FolderGit2,
  Plus,
  Trash2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ConfirmDialog from '../components/ConfirmDialog';
import ProjectModal from '../components/ProjectModal';
import useAuth from '../hooks/useAuth';
import useProjects from '../hooks/useProjects';

const Projects = () => {
  const { isManager, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [statusFilter, setStatusFilter] = useState('');
  const { projects, loading, error, refetch, createProject, deleteProject } = useProjects(statusFilter);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteCandidate, setDeleteCandidate] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Active':
        return 'badge-in-progress';
      case 'Completed':
        return 'badge-completed';
      case 'On Hold':
        return 'badge-blocked';
      case 'Cancelled':
        return 'badge-critical';
      default:
        return 'badge-todo';
    }
  };

  const handleSaveProject = async (data) => {
    await createProject(data);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteCandidate) return;
    try {
      setIsDeleting(true);
      await deleteProject(deleteCandidate.id);
      setDeleteCandidate(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <FolderGit2 size={28} style={{ color: 'var(--primary)' }} />
            Projects
          </h1>
          <p className="page-subtitle">
            Manage your company's development initiatives, roadmaps, and delivery milestones.
          </p>
        </div>

        {isManager && (
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={16} /> New Project
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          marginBottom: '2rem',
          overflowX: 'auto',
          paddingBottom: '0.5rem',
        }}
      >
        {['', 'Active', 'Planning', 'Completed', 'On Hold', 'Cancelled'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`btn btn-sm ${statusFilter === st ? 'btn-primary' : 'btn-secondary'}`}
            style={{ borderRadius: 'var(--radius-full)', padding: '0.45rem 1rem' }}
          >
            {st || 'All Projects'}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading projects...
        </div>
      ) : projects.length === 0 ? (
        <div className="glass-panel" style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <FolderGit2 size={42} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
          <h3>No projects found</h3>
          <p style={{ marginTop: '0.5rem' }}>
            {statusFilter
              ? `There are no projects with status "${statusFilter}".`
              : 'Start by creating your first project milestone.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.5rem' }}>
          {projects.map((proj) => (
            <div
              key={proj.id}
              className="glass-panel glass-panel-hover"
              style={{
                padding: '1.75rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                cursor: 'pointer',
              }}
              onClick={() => navigate(`/projects/${proj.id}`)}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
                  <span className={`badge ${getStatusBadge(proj.status)}`}>
                    {proj.status}
                  </span>

                  {isAdmin && (
                    <button
                      className="btn-icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteCandidate(proj);
                      }}
                      title="Delete Project (Admin)"
                      style={{ color: 'var(--danger)' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>

                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#ffffff', marginBottom: '0.5rem' }}>
                  {proj.name}
                </h3>
                <p
                  style={{
                    fontSize: '0.875rem',
                    color: 'var(--text-secondary)',
                    marginBottom: '1.5rem',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {proj.description || 'No description provided.'}
                </p>
              </div>

              <div>
                {/* Progress */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.4rem', color: 'var(--text-muted)' }}>
                    <span>Completion</span>
                    <span style={{ fontWeight: '700', color: proj.progress_percentage === 100 ? 'var(--success)' : '#ffffff' }}>
                      {proj.progress_percentage}% ({proj.completed_tasks}/{proj.total_tasks} tasks)
                    </span>
                  </div>
                  <div className="progress-container">
                    <div
                      className={`progress-bar ${proj.progress_percentage === 100 ? 'progress-bar-success' : ''}`}
                      style={{ width: `${proj.progress_percentage}%` }}
                    />
                  </div>
                </div>

                {/* Timeline & Lead */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingTop: '0.85rem',
                    borderTop: '1px solid var(--border-subtle)',
                    fontSize: '0.8rem',
                    color: 'var(--text-muted)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Calendar size={14} />
                    <span>{proj.start_date} → {proj.end_date}</span>
                  </div>
                  <span style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>
                    By {proj.created_by_detail?.full_name || proj.created_by_detail?.username || 'Team'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      <ProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveProject}
      />

      <ConfirmDialog
        isOpen={!!deleteCandidate}
        onClose={() => setDeleteCandidate(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Project"
        message={`Are you sure you want to permanently delete "${deleteCandidate?.name}"? All associated tasks will also be deleted.`}
        loading={isDeleting}
      />
    </div>
  );
};

export default Projects;
