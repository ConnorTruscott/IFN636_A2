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