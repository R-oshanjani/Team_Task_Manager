import React, { useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import TaskModal from './components/TaskModal';
import { AuthProvider } from './context/AuthContext';
import useAuth from './hooks/useAuth';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import ProjectDetails from './pages/ProjectDetails';
import Projects from './pages/Projects';
import Register from './pages/Register';
import TaskDetails from './pages/TaskDetails';
import Tasks from './pages/Tasks';
import Users from './pages/Users';
import api from './services/api';

// Authenticated Layout Shell
const AppLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isGlobalTaskModalOpen, setIsGlobalTaskModalOpen] = useState(false);

  const handleGlobalCreateTask = async (data) => {
    await api.post('tasks/', data);
    // Reload active page if relevant
    window.location.reload();
  };

  return (
    <div className="app-layout">
      <Sidebar
        isOpen={isSidebarOpen}
        onOpenTaskModal={() => setIsGlobalTaskModalOpen(true)}
      />
      <div className="main-content">
        <Navbar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        <main className="content-body">{children}</main>
      </div>

      <TaskModal
        isOpen={isGlobalTaskModalOpen}
        onClose={() => setIsGlobalTaskModalOpen(false)}
        onSave={handleGlobalCreateTask}
      />
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Navigate to="/dashboard" replace />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Dashboard />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Projects />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/:id"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <ProjectDetails />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/tasks"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Tasks />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/tasks/:id"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <TaskDetails />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AppLayout>
                  <Users />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Profile />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Notifications />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
