import axiosInstance from "../axiosConfig";

export const adminGetComplaints = async (token, id) => {
  const { data } = await axiosInstance.get('/api/admin/complaints', {
    id,
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const adminGetComplaint = async (token, id) => {
  const { data } = await axiosInstance.get(`/api/admin/complaints/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const adminUpdateComplaint = async (token, id, dataObj) => {
  const { data } = await axiosInstance.put(`/api/admin/complaints/${id}`, dataObj, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const adminDeleteComplaint = async (token, id, reason) => {
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