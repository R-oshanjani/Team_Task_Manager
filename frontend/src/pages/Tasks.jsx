import React, { useEffect, useState } from 'react';
import {
  CheckSquare,
  Filter,
  Kanban,
  LayoutGrid,
  List,
  Plus,
  RotateCcw,
  Search,
  X,
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import ConfirmDialog from '../components/ConfirmDialog';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import useAuth from '../hooks/useAuth';
import useTasks from '../hooks/useTasks';
import api from '../services/api';

const Tasks = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, isManager, isAdmin } = useAuth();

  // View state: 'grid' or 'board'
  const [viewMode, setViewMode] = useState('grid');

  // Filter state initialized from URL search params
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const [priorityFilter, setPriorityFilter] = useState(searchParams.get('priority') || '');
  const [projectFilter, setProjectFilter] = useState(searchParams.get('project') || '');
  const [assigneeFilter, setAssigneeFilter] = useState(searchParams.get('assigned_to') || '');
  const [assignedOnly, setAssignedOnly] = useState(searchParams.get('assigned_only') === 'true');
  const [isOverdueOnly, setIsOverdueOnly] = useState(searchParams.get('is_overdue') === 'true');

  // Dropdown options
  const [projects, setProjects] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);

  // Task modal & actions
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [deleteCandidate, setDeleteCandidate] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { tasks, loading, error, updateFilters, resetFilters, refetch, createTask, updateTask, deleteTask } =
    useTasks({
      search: searchParams.get('search') || '',
      status: searchParams.get('status') || '',
      priority: searchParams.get('priority') || '',
      project: searchParams.get('project') || '',
      assigned_to: searchParams.get('assigned_to') || '',
      assigned_only: searchParams.get('assigned_only') === 'true' ? 'true' : '',
      is_overdue: searchParams.get('is_overdue') === 'true' ? 'true' : '',
    });

  // Load dropdown options
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [projRes, usersRes] = await Promise.all([
          api.get('projects/'),
          api.get('users/team_members/'),
        ]);
        setProjects(projRes.data.results || projRes.data);
        setTeamMembers(usersRes.data);
      } catch (err) {
        console.warn('Error loading filter options:', err);
      }
    };
    fetchOptions();
  }, []);

  // Sync state with search params changes
  useEffect(() => {
    const filtersObj = {};
    if (searchInput.trim()) filtersObj.search = searchInput.trim();
    if (statusFilter) filtersObj.status = statusFilter;
    if (priorityFilter) filtersObj.priority = priorityFilter;
    if (projectFilter) filtersObj.project = projectFilter;
    if (assigneeFilter) filtersObj.assigned_to = assigneeFilter;
    if (assignedOnly) filtersObj.assigned_only = 'true';
    if (isOverdueOnly) filtersObj.is_overdue = 'true';

    updateFilters(filtersObj);
  }, [searchInput, statusFilter, priorityFilter, projectFilter, assigneeFilter, assignedOnly, isOverdueOnly]);

  const handleResetFilters = () => {
    setSearchInput('');
    setStatusFilter('');
    setPriorityFilter('');
    setProjectFilter('');
    setAssigneeFilter('');
    setAssignedOnly(false);
    setIsOverdueOnly(false);
    resetFilters();
  };

  const handleSaveTask = async (data) => {
    if (editingTask) {
      await updateTask(editingTask.id, data);
      setEditingTask(null);
    } else {
      await createTask(data);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteCandidate) return;
    try {
      setIsDeleting(true);
      await deleteTask(deleteCandidate.id);
      setDeleteCandidate(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  // Group tasks by status for Kanban Board
  const kanbanColumns = [
    { id: 'To Do', label: 'To Do', badgeClass: 'badge-todo' },
    { id: 'In Progress', label: 'In Progress', badgeClass: 'badge-in-progress' },
    { id: 'Review', label: 'Review', badgeClass: 'badge-review' },
    { id: 'Completed', label: 'Completed', badgeClass: 'badge-completed' },
    { id: 'Blocked', label: 'Blocked', badgeClass: 'badge-blocked' },
  ];

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <CheckSquare size={28} style={{ color: 'var(--primary)' }} />
            Tasks
          </h1>
          <p className="page-subtitle">
            Search, filter, assign, and manage execution progress across team members.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {/* View Mode Toggle */}
          <div
            style={{
              display: 'flex',
              background: 'rgba(255, 255, 255, 0.05)',
              padding: '3px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <button
              onClick={() => setViewMode('grid')}
              className="btn-icon"
              style={{
                padding: '0.45rem',
                background: viewMode === 'grid' ? 'var(--primary)' : 'transparent',
                color: viewMode === 'grid' ? '#ffffff' : 'var(--text-secondary)',
              }}
              title="Grid View"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setViewMode('board')}
              className="btn-icon"
              style={{
                padding: '0.45rem',
                background: viewMode === 'board' ? 'var(--primary)' : 'transparent',
                color: viewMode === 'board' ? '#ffffff' : 'var(--text-secondary)',
              }}
              title="Kanban Board View"
            >
              <Kanban size={16} />
            </button>
          </div>

          {isManager && (
            <button
              className="btn btn-primary"
              onClick={() => {
                setEditingTask(null);
                setIsTaskModalOpen(true);
              }}
            >
              <Plus size={16} /> New Task
            </button>
          )}
        </div>
      </div>

      {/* Comprehensive Filter Bar */}
      <div
        className="glass-panel"
        style={{
          padding: '1.25rem 1.5rem',
          marginBottom: '2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          {/* Search Input */}
          <div style={{ position: 'relative', flex: '1 1 300px' }}>
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
              placeholder="Search by title, description, project, assignee..."
              className="form-input"
              style={{ paddingLeft: '2.4rem' }}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>

          {/* Quick Toggles */}
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.85rem',
                color: assignedOnly ? 'var(--primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontWeight: '600',
              }}
            >
              <input
                type="checkbox"
                checked={assignedOnly}
                onChange={(e) => setAssignedOnly(e.target.checked)}
                style={{ accentColor: 'var(--primary)' }}
              />
              Assigned to Me
            </label>

            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.85rem',
                color: isOverdueOnly ? 'var(--danger)' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontWeight: '600',
              }}
            >
              <input
                type="checkbox"
                checked={isOverdueOnly}
                onChange={(e) => setIsOverdueOnly(e.target.checked)}
                style={{ accentColor: 'var(--danger)' }}
              />
              Overdue Only
            </label>

            {(searchInput || statusFilter || priorityFilter || projectFilter || assigneeFilter || assignedOnly || isOverdueOnly) && (
              <button
                className="btn btn-secondary btn-sm"
                onClick={handleResetFilters}
                style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}
              >
                <RotateCcw size={13} /> Reset
              </button>
            )}
          </div>
        </div>

        {/* Dropdown Filters Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
          {/* Status Filter */}
          <div>
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
            >
              <option value="">All Statuses</option>
              <option value="To Do">To Do</option>
              <option value="In Progress">In Progress</option>
              <option value="Review">Review</option>
              <option value="Completed">Completed</option>
              <option value="Blocked">Blocked</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <select
              className="form-select"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
            >
              <option value="">All Priorities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>

          {/* Project Filter */}
          <div>
            <select
              className="form-select"
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
            >
              <option value="">All Projects</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Assignee Filter */}
          <div>
            <select
              className="form-select"
              value={assigneeFilter}
              onChange={(e) => setAssigneeFilter(e.target.value)}
              style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
            >
              <option value="">All Team Members</option>
              {teamMembers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.full_name} ({m.username})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Content Rendering: Grid vs Kanban */}
      {loading ? (
        <div style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading tasks...
        </div>
      ) : tasks.length === 0 ? (
        <div className="glass-panel" style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <CheckSquare size={42} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
          <h3>No tasks found</h3>
          <p style={{ marginTop: '0.5rem' }}>
            No tasks match the active filters or search criteria.
          </p>
          <button className="btn btn-secondary btn-sm" style={{ marginTop: '1rem' }} onClick={handleResetFilters}>
            Reset Filters
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid View */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              canDelete={isAdmin}
              onEdit={() => {
                setEditingTask(task);
                setIsTaskModalOpen(true);
              }}
              onDelete={() => setDeleteCandidate(task)}
            />
          ))}
        </div>
      ) : (
        /* Kanban Board View */
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, minmax(280px, 1fr))',
            gap: '1.25rem',
            overflowX: 'auto',
            paddingBottom: '1rem',
          }}
        >
          {kanbanColumns.map((col) => {
            const columnTasks = tasks.filter((t) => t.status === col.id);
            return (
              <div
                key={col.id}
                style={{
                  background: 'rgba(15, 23, 42, 0.45)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.85rem',
                  minHeight: '500px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className={`badge ${col.badgeClass}`}>{col.label}</span>
                  </div>
                  <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)' }}>
                    {columnTasks.length}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
                  {columnTasks.length === 0 ? (
                    <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      No tasks
                    </div>
                  ) : (
                    columnTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        canDelete={isAdmin}
                        onEdit={() => {
                          setEditingTask(task);
                          setIsTaskModalOpen(true);
                        }}
                        onDelete={() => setDeleteCandidate(task)}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Task Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setEditingTask(null);
        }}
        task={editingTask}
        onSave={handleSaveTask}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteCandidate}
        onClose={() => setDeleteCandidate(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Task"
        message={`Are you sure you want to permanently delete "${deleteCandidate?.title}"?`}
        loading={isDeleting}
      />
    </div>
  );
};

export default Tasks;
