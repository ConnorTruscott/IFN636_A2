import http from './http';

// Overview table
export const adminGetComplaints = () =>
  http.get('/api/admin/complaints').then(r => r.data);

// Load one complaint for the editor
export const adminGetComplaint = (id) =>
  http.get(`/api/admin/complaints/${id}`).then(r => r.data);

// Save changes
export const adminUpdateComplaint = (id, data) =>
  http.put(`/api/admin/complaints/${id}`, data).then(r => r.data);

// Delete with reason
export const adminDeleteComplaint = (id, reason) =>
  http.delete(`/api/admin/complaints/${id}`, { data: { reason } }).then(r => r.data);

// Categories from DB + preset locations from backend
export const adminGetComplaintMeta = () =>
  http.get('/api/admin/complaints/meta').then(r => r.data);

// Categories CRUD
export const adminListCategories = () =>
  http.get('/api/admin/categories').then(r => r.data);

export const adminCreateCategory = (name) =>
  http.post('/api/admin/categories', { name }).then(r => r.data);

export const adminUpdateCategory = (id, name) =>
  http.put(`/api/admin/categories/${id}`, { name }).then(r => r.data);

export const adminDeleteCategory = (id) =>
  http.delete(`/api/admin/categories/${id}`).then(r => r.data);
