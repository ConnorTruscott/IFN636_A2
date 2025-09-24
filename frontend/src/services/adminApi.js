// frontend/src/services/adminApi.js
import http from './http';

export const adminGetComplaints = () =>
  http.get('/api/admin/complaints').then(r => r.data);

export const adminGetComplaint = (id) =>
  http.get(`/api/admin/complaints/${id}`).then(r => r.data);

export const adminUpdateComplaint = (id, data) =>
  http.put(`/api/admin/complaints/${id}`, data).then(r => r.data);

export const adminDeleteComplaint = (id, reason) =>
  http.delete(`/api/admin/complaints/${id}`, { data: { reason } }).then(r => r.data);
