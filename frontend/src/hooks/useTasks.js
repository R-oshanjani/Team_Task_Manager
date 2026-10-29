import { useCallback, useEffect, useState } from 'react';
import api from '../services/api';

export const useTasks = (initialFilters = {}) => {
  const [tasks, setTasks] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(initialFilters);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query string from non-empty filters
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          params.append(key, val);
        }
      });

      const response = await api.get(`tasks/?${params.toString()}`);
      if (response.data.results) {
        setTasks(response.data.results);
        setTotalCount(response.data.count || response.data.results.length);
      } else {
        setTasks(response.data);
        setTotalCount(response.data.length);
      }
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError(err.response?.data?.detail || 'Failed to fetch tasks.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const updateFilters = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const resetFilters = () => {
    setFilters(initialFilters);
  };

  const createTask = async (taskData) => {
    const response = await api.post('tasks/', taskData);
    await fetchTasks();
    return response.data;
  };

  const updateTask = async (id, taskData) => {
    const response = await api.patch(`tasks/${id}/`, taskData);
    await fetchTasks();
    return response.data;
  };

  const deleteTask = async (id) => {
    await api.delete(`tasks/${id}/`);
    await fetchTasks();
  };

  return {
    tasks,
    totalCount,
    loading,
    error,
    filters,
    updateFilters,
    resetFilters,
    refetch: fetchTasks,
    createTask,
    updateTask,
    deleteTask,
  };
};

export default useTasks;
