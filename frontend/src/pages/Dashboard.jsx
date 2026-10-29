import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  FolderGit2,
  ListTodo,
  Plus,
  TrendingUp,
  UserCheck,
  Users,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import MetricCard from '../components/MetricCard';
import ProjectModal from '../components/ProjectModal';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import useAuth from '../hooks/useAuth';
import api from '../services/api';

const Dashboard = () => {
  const { user, isManager, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, tasksRes] = await Promise.all([
        api.get('tasks/dashboard-stats/'),
        api.get('tasks/?page_size=6'),
      ]);
      setStats(statsRes.data);
      setRecentTasks(tasksRes.data.results || tasksRes.data);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
      setError('Failed to fetch dashboard data. Make sure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleCreateTask = async (taskData) => {
    await api.post('tasks/', taskData);
    await fetchDashboardData();
  };

  const handleCreateProject = async (projectData) => {
    await api.post('projects/', projectData);
    await fetchDashboardData();
  };

  if (loading && !stats) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        <p>Loading analytics and task telemetry...</p>
      </div>
    );
  }

  const completionRate = stats?.total_tasks > 0
    ? Math.round((stats.completed_tasks / stats.total_tasks) * 100)
    : 0;

  return (
    <div>
      {/* Header with Welcome & Quick Actions */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            Dashboard
            <span style={{ fontSize: '1rem', fontWeight: '500', color: 'var(--text-muted)' }}>
              • {user?.full_name || user?.username}
            </span>
          </h1>
          <p className="page-subtitle">
            Welcome back! Here is an overview of active deliverables, assignments, and team health.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {isManager && (
            <>
              <button
                className="btn btn-secondary"
                onClick={() => setIsProjectModalOpen(true)}
              >
                <FolderGit2 size={16} /> New Project
              </button>
              <button
                className="btn btn-primary"
                onClick={() => setIsTaskModalOpen(true)}
              >
                <Plus size={16} /> Create Task
              </button>
            </>
          )}
        </div>
      </div>

      {error && (
        <div style={{ background: 'var(--danger-bg)', color: 'var(--danger)', padding: '0.85rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid-cols-4" style={{ marginBottom: '2rem' }}>
        <MetricCard
          title="Total Tasks"
          value={stats?.total_tasks || 0}
          icon={ListTodo}
          accentColor="#6366f1"
          subtitle={`${stats?.completed_tasks || 0} completed`}
        />
        <MetricCard
          title="In Progress"
          value={stats?.in_progress_tasks || 0}
          icon={TrendingUp}
          accentColor="#0ea5e9"
          subtitle="Actively being developed"
        />
        <MetricCard
          title="Completed"
          value={stats?.completed_tasks || 0}
          icon={CheckCircle2}
          accentColor="#10b981"
          subtitle={`${completionRate}% overall velocity`}
        />
        <MetricCard
          title="High / Critical"
          value={stats?.high_priority_tasks || 0}
          icon={AlertTriangle}
          accentColor="#f59e0b"
          subtitle="Needs immediate focus"
        />
      </div>

      {/* Secondary Metrics: Assigned to Me & Overdue Tasks */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ padding: '0.85rem', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary)' }}>
              <UserCheck size={24} />
            </div>
            <div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Tasks Assigned to You</p>
              <h4 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#ffffff' }}>
                {stats?.my_tasks_count || 0}
              </h4>
            </div>
          </div>
          <Link to="/tasks?assigned_only=true" className="btn btn-secondary btn-sm">
            View My Tasks <ArrowRight size={14} />
          </Link>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ padding: '0.85rem', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.15)', color: 'var(--danger)' }}>
              <Clock size={24} />
            </div>
            <div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Overdue Tasks</p>
              <h4 style={{ fontSize: '1.75rem', fontWeight: '800', color: stats?.overdue_tasks > 0 ? 'var(--danger)' : 'var(--text-primary)' }}>
                {stats?.overdue_tasks || 0}
              </h4>
            </div>
          </div>
          <Link to="/tasks?is_overdue=true" className="btn btn-secondary btn-sm">
            Inspect Delays <ArrowRight size={14} />
          </Link>
        </div>

        {/* Manager/Admin Team & Project Telemetry */}
        {isManager && (
          <>
            <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ padding: '0.85rem', borderRadius: '12px', background: 'rgba(168, 85, 247, 0.15)', color: 'var(--purple)' }}>
                  <Users size={24} />
                </div>
                <div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Team Members</p>
                  <h4 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#ffffff' }}>
                    {stats?.total_team_members || 0}
                  </h4>
                </div>
              </div>
              {isAdmin && (
                <Link to="/users" className="btn btn-secondary btn-sm">
                  Manage <ArrowRight size={14} />
                </Link>
              )}
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ padding: '0.85rem', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--success)' }}>
                  <FolderGit2 size={24} />
                </div>
                <div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Active Projects</p>
                  <h4 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#ffffff' }}>
                    {stats?.active_projects || stats?.total_projects || 0}
                  </h4>
                </div>
              </div>
              <Link to="/projects" className="btn btn-secondary btn-sm">
                Projects <ArrowRight size={14} />
              </Link>
            </div>
          </>
        )}
      </div>

      {/* Status & Priority Visual Distribution for Managers & Admins */}
      {isManager && stats?.status_breakdown && (
        <div className="grid-cols-2" style={{ marginBottom: '2.5rem' }}>
          {/* Status Breakdown */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1.25rem', color: 'var(--text-primary)' }}>
              Task Distribution by Status
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              {Object.entries(stats.status_breakdown).map(([statusName, count]) => {
                const pct = stats.total_tasks > 0 ? Math.round((count / stats.total_tasks) * 100) : 0;
                return (
                  <div key={statusName}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                      <span style={{ fontWeight: '600', color: 'var(--text-secondary)' }}>{statusName}</span>
                      <span style={{ color: 'var(--text-primary)', fontWeight: '700' }}>{count} ({pct}%)</span>
                    </div>
                    <div className="progress-container">
                      <div
                        className="progress-bar"
                        style={{
                          width: `${pct}%`,
                          background:
                            statusName === 'Completed'
                              ? 'var(--success)'
                              : statusName === 'In Progress'
                              ? 'var(--info)'
                              : statusName === 'Review'
                              ? 'var(--purple)'
                              : statusName === 'Blocked'
                              ? 'var(--danger)'
                              : 'rgba(255, 255, 255, 0.25)',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Priority Breakdown */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1.25rem', color: 'var(--text-primary)' }}>
              Task Distribution by Priority
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              {Object.entries(stats.priority_breakdown).map(([priorityName, count]) => {
                const pct = stats.total_tasks > 0 ? Math.round((count / stats.total_tasks) * 100) : 0;
                return (
                  <div key={priorityName}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                      <span style={{ fontWeight: '600', color: 'var(--text-secondary)' }}>{priorityName} Priority</span>
                      <span style={{ color: 'var(--text-primary)', fontWeight: '700' }}>{count} ({pct}%)</span>
                    </div>
                    <div className="progress-container">
                      <div
                        className="progress-bar"
                        style={{
                          width: `${pct}%`,
                          background:
                            priorityName === 'Critical'
                              ? 'var(--danger)'
                              : priorityName === 'High'
                              ? 'var(--warning)'
                              : priorityName === 'Medium'
                              ? 'var(--info)'
                              : 'rgba(255, 255, 255, 0.25)',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Recent Tasks Section */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-primary)' }}>
              Recent Tasks
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Latest activity across all active projects
            </p>
          </div>
          <Link to="/tasks" className="btn btn-secondary btn-sm">
            View All Tasks <ArrowRight size={14} />
          </Link>
        </div>

        {recentTasks.length === 0 ? (
          <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No tasks found. Create a new task to get started!
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {recentTasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleCreateTask}
      />

      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        onSave={handleCreateProject}
      />
    </div>
  );
};

export default Dashboard;
