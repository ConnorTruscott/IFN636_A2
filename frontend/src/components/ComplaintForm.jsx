import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';

const ComplaintForm = ({ complaints, setComplaints, editingComplaint, setEditingComplaint }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({ title: '', description: '', date: '' });

  useEffect(() => {
    if (editingComplaint) {
      setFormData({
        title: editingComplaint.title,
        description: editingComplaint.description,
        date: editingComplaint.date,
      });
    } else {
      setFormData({ title: '', description: '', date: '' });
    }
  }, [editingComplaint]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingComplaint) {
        const response = await axiosInstance.put(`/api/complaints/${editingComplaint._id}`, formData, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setComplaints(complaints.map((complaint) => (complaint._id === response.data._id ? response.data : complaint)));
      } else {
        const response = await axiosInstance.post('/api/complaints', formData, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setComplaints([...complaints, response.data]);
      }
      setEditingComplaint(null);
      setFormData({ title: '', description: '', date: '' });
    } catch (error) {
      alert('Failed to save complaint.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 shadow-md rounded mb-6">
      <h1 className="text-2xl font-bold mb-4">{editingComplaint ? 'Edit Complaint' : 'Create New Complaint'}</h1>
      <label className="block text-gray-700 font-semibold mb-1">Title</label>
      <input
        type="text"
        placeholder="Title"
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        className="w-full mb-4 p-2 border rounded"
      />
      <label className="block text-gray-700 font-semibold mb-1">Description</label>
      <input
        type="text"
        placeholder="Description"
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        className="w-full mb-4 p-2 border rounded"
      />
      <label className="block text-gray-700 font-semibold mb-1">Date the Issue Happened</label>
      <input
        type="date"
        value={formData.date}
        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
        className="w-full mb-4 p-2 border rounded"
      />
      <button type="submit" className="w-full bg-black text-white p-2 rounded">
        {editingComplaint ? 'Update' : 'Create'}
      </button>
    </form>
  );
};

export default ComplaintForm;
