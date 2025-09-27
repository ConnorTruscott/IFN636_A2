import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';

const ComplaintForm = ({ complaints, setComplaints, editingComplaint, setEditingComplaint }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({ title: '', category: '', description: '', location: '', date: '' });
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const {data} = await axiosInstance.get('/api/departments', {
          headers: {Authorization: `Bearer ${user.token}`},
        });
        setDepartments(data);
      } catch (err) {
        console.error('Failed to fetch departments', err);
      }
    };
    fetchDepartments();
  }, [user]);

  const categories = [
    "Facilities & Maintenance",
    "Academic Issues",
    "Campus Services",
    "Safety & Security",
    "Other"
  ];

  useEffect(() => {
    if (editingComplaint) {
      setFormData({
        title: editingComplaint.title,
        category: editingComplaint.category || '',
        location: editingComplaint.location || '',
        description: editingComplaint.description,
        date: editingComplaint.date,
      });
    } else {
      setFormData({ title: '', category: '', description: '', location: '', date: '' });
    }
  }, [editingComplaint]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitting formData:", formData);
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
      setFormData({ title: '', category: '', description: '', location: '', date: '' });
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
      <label className="block text-gray-700 font-semibold mb-1">Category</label>
      <select
        value={formData.category}
        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
        required
        className="w-full mb-4 p-2 border rounded"
      >
        <option value="">Select category</option>
        {departments.map((dept) => (
          <option key={dept._id} value={dept.name}>
            {dept.name}
          </option>
        ))}
      </select>
      <label className="block text-gray-700 font-semibold mb-1">Description</label>
      <input
        type="text"
        placeholder="Description"
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        className="w-full mb-4 p-2 border rounded"
      />
      <label className="block text-gray-700 font-semibold mb-1">Location</label>
      <select
        value={formData.location}
        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
        required
        className="w-full mb-4 p-2 border rounded"
      >
        <option value="">Select location</option>
        <option value="Gardens Point">Gardens Point</option>
        <option value="Kelvin Grove">Kelvin Grove</option>
      </select>
      <label className="block text-gray-700 font-semibold mb-1">Date the Issue Happened</label>
      <input
        type="date"
        value={formData.date}
        required
        max={new Date().toISOString().split("T")[0]}
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
