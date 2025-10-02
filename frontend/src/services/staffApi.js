
import axiosInstance from '../axiosConfig';

export const staffGetComplaints = async () => {
  const { data } = await axiosInstance.get('/api/staff/complaints');
  return data;
};


export const staffUpdateComplaint = async (id, updateData) => {
  const { data } = await axiosInstance.put(`/api/staff/complaints/${id}`, updateData);
  return data;
};