// import http from './http';
// import axiosInstance from '../axiosConfig';

// export const adminGetComplaints = (params = {}) =>
//   axiosInstance.get('/api/admin/complaints', { params }).then(r => r.data);

// export const adminGetComplaint = (id) =>
//   axiosInstance.get(`/api/admin/complaints/${id}`).then(r => r.data);

// export const adminUpdateComplaint = (id, data) =>
//   axiosInstance.put(`/api/admin/complaints/${id}`, data).then(r => r.data);

// export const adminDeleteComplaint = (id, reason) =>
//   axiosInstance.delete(`/api/admin/complaints/${id}`, { data: { reason } }).then(r => r.data);

// export const adminGetComplaintMeta = () =>
//   axiosInstance.get('/api/admin/complaints/meta').then(r => r.data);

import axiosInstance from "../axiosConfig";

export const adminGetComplaints = async (token, params = {}) => {
  const { data } = await axiosInstance.get('/api/admin/complaints', {
    params,
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const adminGetComplaint = async (id, token) => {
  const { data } = await axiosInstance.get(`/api/admin/complaints/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const adminUpdateComplaint = async (id, dataObj, token) => {
  const { data } = await axiosInstance.put(`/api/admin/complaints/${id}`, dataObj, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const adminDeleteComplaint = async (id, reason, token) => {
  const { data } = await axiosInstance.delete(`/api/admin/complaints/${id}`, {
    data: { reason },
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const adminGetComplaintMeta = async (token) => {
  const { data } = await axiosInstance.get('/api/admin/complaints/meta', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};