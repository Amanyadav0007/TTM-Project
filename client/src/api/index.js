// ---------------------------------------------------------------------------
// API module — all backend calls live here, grouped by domain.
// Pages and context import from this file; never call axios directly.
// ---------------------------------------------------------------------------

import api from './axiosInstance';

// ── Auth ────────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (username, email, password) =>
    api.post('/auth/register', { username, email, password }),

  login: (email, password) =>
    api.post('/auth/login', { email, password }),

  refresh: (refreshToken) =>
    api.post('/auth/refresh', { refreshToken }),

  logout: () =>
    api.post('/auth/logout'),

  getMembers: () =>
    api.get('/auth/members'),

  createMember: (username, email, password) =>
    api.post('/auth/members', { username, email, password }),

  deleteMember: (id) =>
    api.delete(`/auth/members/${id}`),
};

// ── Projects ────────────────────────────────────────────────────────────────
export const projectsAPI = {
  getAll: () =>
    api.get('/projects'),

  getById: (id) =>
    api.get(`/projects/${id}`),

  create: (name, description) =>
    api.post('/projects', { name, description }),

  updateMembers: (id, members) =>
    api.put(`/projects/${id}/members`, { members }),
};

// ── Tasks ───────────────────────────────────────────────────────────────────
export const tasksAPI = {
  getAll: (projectId) =>
    api.get('/tasks', { params: projectId ? { projectId } : {} }),

  create: (taskData) =>
    api.post('/tasks', taskData),

  update: (id, taskData) =>
    api.put(`/tasks/${id}`, taskData),

  delete: (id) =>
    api.delete(`/tasks/${id}`),
};
