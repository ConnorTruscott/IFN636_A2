// frontend/src/services/staffApi.js

import axiosInstance from '../axiosConfig'; // Make sure you have this config file

/**
 * @desc    Fetches all complaints assigned to the logged-in staff member.
 */
export const staffGetComplaints = async () => {
  const { data } = await axiosInstance.get('/api/staff/complaints'); // Use the instance
  return data;
};

/**
 * @desc    Updates the status of a specific complaint.
 * @param {string} id - The ID of the complaint to update.
 * @param {object} updateData - An object containing the new status, e.g., { status: 'resolving' }.
 */
export const staffUpdateComplaint = async (id, updateData) => {
  const { data } = await axiosInstance.put(`/api/staff/complaints/${id}`, updateData);
  return data;
};