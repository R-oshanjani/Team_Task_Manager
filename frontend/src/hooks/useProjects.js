import { useCallback, useEffect, useState } from 'react';
import api from '../services/api';

export const useProjects = (statusFilter = '') => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const url = statusFilter ? `projects/?status=${statusFilter}` : 'projects/';
      const response = await api.get(url);
      const data = response.data.results || response.data;
      setProjects(data);
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError(err.response?.data?.detail || 'Failed to fetch projects.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const createProject = async (projectData) => {
    const response = await api.post('projects/', projectData);
    await fetchProjects();
    return response.data;
  };

  const updateProject = async (id, projectData) => {
    const response = await api.patch(`projects/${id}/`, projectData);
    await fetchProjects();
    return response.data;
  };

  const deleteProject = async (id) => {
    await api.delete(`projects/${id}/`);
    await fetchProjects();
  };

  return {
    projects,
    loading,
    error,
    refetch: fetchProjects,
    createProject,
    updateProject,
    deleteProject,
  };
};

export default useProjects;
