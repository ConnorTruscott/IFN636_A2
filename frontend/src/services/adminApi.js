import http from './http';

// Overview table
export const adminGetComplaints = (params = {}) =>
  http.get('/api/admin/complaints', { params }).then(r => r.data);

// Load one complaint
export const adminGetComplaint = (id) =>
  http.get(`/api/admin/complaints/${id}`).then(r => r.data);

// Save changes
export const adminUpdateComplaint = (id, data) =>
  http.put(`/api/admin/complaints/${id}`, data).then(r => r.data);

// Delete with reason
export const adminDeleteComplaint = (id, reason) =>
  http.delete(`/api/admin/complaints/${id}`, { data: { reason } }).then(r => r.data);

// Meta (categories + locations)
export const adminGetComplaintMeta = () =>
  http.get('/api/admin/complaints/meta').then(r => r.data);
