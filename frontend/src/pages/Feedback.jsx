import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';

const Feedback = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({ text: '', rating: '' });
  const [mode, setMode] = useState(null); 

  useEffect(() => {
    const fetchClosed = async () => {
      try {
        const res = await axiosInstance.get('/api/feedback', {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setComplaints(res.data || []);
      } catch {
        alert('Failed to load closed complaints.');
      }
    };
    if (user?.token) fetchClosed();
  }, [user?.token]);

  const formatDate = (value) => {
    if (!value) return '—';
    const d = new Date(value);
    return isNaN(d) ? '—' : d.toLocaleDateString();
  };

  const handleView = (c) => {
    setEditing(c);
    setMode('view');
    setFormData({
      text: c.feedback?.text || '',
      rating: c.feedback?.rating ?? '',
    });
  };

  const handleCreate = (c) => {
    setEditing(c);
    setMode('edit');
    setFormData({
      text: c.feedback?.text || '',
      rating: c.feedback?.rating ?? '',
    });
  };

  const handleSave = async () => {
    if (!editing) return;
    try {
      const body = {
        text: formData.text,
        rating: formData.rating ? Number(formData.rating) : undefined,
      };
      const res = await axiosInstance.post(
        `/api/complaints/${editing._id}/feedback`,
        body,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setComplaints((arr) =>
        arr.map((c) => (c._id === editing._id ? res.data : c))
      );
      setEditing(null);
      setFormData({ text: '', rating: '' });
      setMode(null);
    } catch {
      alert('Failed to save feedback.');
    }
  };

  return (
    <div className="p-6">
      {/* Resolved Complaints */}
      <div className="bg-white p-6 shadow-md rounded mb-6">
        <h2 className="text-lg font-bold mb-2">Resolved Complaints</h2>
        <p className="text-sm text-gray-500 mb-4">
          View your resolved complaints and add feedback
        </p>

        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-3 text-left">Title</th>
              <th className="p-3 text-left">Category</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {complaints.map((c) => (
              <tr key={c._id} className="border-b">
                <td className="p-3">{c.title}</td>
                <td className="p-3">{c.category}</td>
                <td className="p-3">{c.status}</td>
                <td className="p-3">{formatDate(c.date)}</td>
                <td className="p-3 flex gap-2">
                  <button
                    onClick={() => handleView(c)}
                    className="px-3 py-1 bg-gray-600 text-white rounded text-sm"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleCreate(c)}
                    className="px-3 py-1 bg-indigo-600 text-white rounded text-sm"
                  >
                    Add Feedback
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Feedback Form */}
      <div className="bg-white p-6 shadow-md rounded">
        <h2 className="text-lg font-bold mb-2">
          {mode === 'view'
            ? 'View Feedback'
            : mode === 'edit'
            ? 'Create or Edit Feedback'
            : 'Select a complaint to view or create feedback'}
        </h2>
        {editing && (
          <>
           {/* subheading */}
            <p className="text-sm text-gray-500 mb-4">
              Provide feedback about your resolved complaint
            </p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Complaint Title
              </label>
              <input
                type="text"
                value={editing.title}
                disabled
                className="w-full border rounded p-2 bg-gray-100"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Rating</label>
              <select
                value={formData.rating}
                disabled={mode === 'view'}
                onChange={(e) =>
                  setFormData({ ...formData, rating: e.target.value })
                }
                className="w-32 border rounded p-2"
              >
                <option value="">Choose…</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Feedback Details
              </label>
              <textarea
                value={formData.text}
                disabled={mode === 'view'}
                onChange={(e) =>
                  setFormData({ ...formData, text: e.target.value })
                }
                className="w-full border rounded p-2"
                rows={3}
                placeholder="Enter your feedback..."
              />
            </div>

            {mode === 'edit' && (
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-green-600 text-white rounded"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setEditing(null);
                    setFormData({ text: '', rating: '' });
                    setMode(null);
                  }}
                  className="px-4 py-2 bg-gray-500 text-white rounded"
                >
                  Clear
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Feedback;