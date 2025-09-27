import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';
import ComplaintForm from '../components/ComplaintForm';
import { useNavigate } from 'react-router-dom';

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate(); 
  const [complaints, setComplaints] = useState([]);
  const [editingComplaint, setEditingComplaint] = useState(null);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const res = await axiosInstance.get('/api/complaints', {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setComplaints(res.data);
      } catch (err) {
        console.error('Failed to load complaints', err);
      }
    };
    fetchComplaints();
  }, [user]);

  const formatDate = (value) => {
    if (!value) return '—';
    const d = new Date(value);
    return isNaN(d) ? '—' : d.toLocaleDateString();
  };

  return (
    <div className="p-6">
      {/* Complaint Form on Top */}
      <ComplaintForm
        complaints={complaints}
        setComplaints={setComplaints}
        editingComplaint={editingComplaint}
        setEditingComplaint={setEditingComplaint}
      />

      {/* My Complaints Table */}
      <div className="bg-white p-6 shadow-md rounded mb-6">
        <h2 className="text-lg font-bold mb-2">My Complaints</h2>
        <p className="text-sm text-gray-500 mb-4">
          View and manage your submitted complaints
        </p>

        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-3 text-left">Title</th>
              <th className="p-3 text-left">Category</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {complaints.map((c) => (
              <tr key={c._id} className="border-b">
                <td className="p-3">{c.title}</td>
                <td className="p-3">{c.category}</td>
                <td className="p-3">{c.status || 'received'}</td>
                <td className="p-3">{formatDate(c.date)}</td>
                <td className="p-3 flex gap-2">
                  <button
                    onClick={() => setEditingComplaint(c)}
                    className="px-3 py-1 bg-yellow-500 text-white rounded text-sm"
                  >
                    Edit
                  </button>
                  {c.status === 'closed' && (
                    <button
                      onClick={() => navigate('/feedback')} 
                      className="px-3 py-1 bg-indigo-600 text-white rounded text-sm"
                    >
                      Feedback
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
