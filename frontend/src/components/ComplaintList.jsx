import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';

const ComplaintList = ({ complaints, setComplaints, setEditingComplaint }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(`/api/complaints/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setComplaints(complaints.filter(c => c._id !== id));
    } catch {
      alert('Failed to delete complaint.');
    }
  };

  const BASE = axiosInstance.defaults.baseURL;

  const handleUpload = async (complaint, files) => {
    const allowed = ['image/jpeg', 'image/png'];
    const safe = Array.from(files).filter(f => allowed.includes(f.type));
    if (safe.length !== files.length) {
      alert('Only JPG/PNG files are allowed.');
      return;
    }
    const count = (complaint.photos || []).length;
    if (count + safe.length > 5) {
      alert('Max 5 photos per complaint.');
      return;
    }
    const form = new FormData();
    safe.forEach(f => form.append('photos', f));
    try {
      const res = await axiosInstance.post(`/api/complaints/${complaint._id}/photos`, form, {
        headers: { Authorization: `Bearer ${user.token}`, 'Content-Type': 'multipart/form-data' },
      });
      setComplaints(complaints.map(c => (c._id === complaint._id ? res.data : c)));
    } catch (e) {
      alert(e?.response?.data?.message || 'Upload failed.');
    }
  };

  const handleRemovePhoto = async (complaint, filename) => {
    try {
      const res = await axiosInstance.delete(`/api/complaints/${complaint._id}/photos/${filename}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setComplaints(complaints.map(c => (c._id === complaint._id ? res.data : c)));
    } catch {
      alert('Failed to remove photo.');
    }
  };

  const formatDate = (value) => {
    if (!value) return '—';
    const d = new Date(value);
    return isNaN(d) ? '—' : d.toLocaleDateString();
  };

  return (
    <div>
      {complaints.map((complaint) => (
        <div key={complaint._id} className="bg-gray-100 p-4 mb-4 rounded shadow">
          <h2 className="font-bold">{complaint.title}</h2>
          <p>{complaint.description}</p>
          <p className="text-sm text-gray-500">Date: {formatDate(complaint.date)}</p>
          <p className="text-sm text-gray-700">Status: {complaint.status || 'received'}</p>

          {complaint.photos?.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {complaint.photos.map((name) => (
                <div key={name} className="relative">
                  <img
                    src={`${BASE}/uploads/${name}`}
                    alt="evidence"
                    className="h-20 w-28 object-cover rounded border"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemovePhoto(complaint, name)}
                    className="absolute -top-2 -right-2 bg-black/70 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                    title="Remove photo"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="mt-3">
            <label className="block text-sm font-medium mb-1">Add photos (JPG/PNG, max 5)</label>
            <input
              type="file"
              accept=".jpg,.jpeg,.png"
              multiple
              onChange={(e) => {
                if (e.target.files?.length) {
                  handleUpload(complaint, e.target.files);
                  e.target.value = '';
                }
              }}
              className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4
                         file:rounded file:border-0 file:text-sm file:font-semibold
                         file:bg-gray-200 hover:file:bg-gray-300"
            />
            <p className="text-xs text-gray-500 mt-1">
              {5 - (complaint.photos?.length || 0)} slots left
            </p>
          </div>

          <div className="mt-2 flex gap-2">
            <button
              onClick={() => setEditingComplaint(complaint)}
              className="bg-yellow-500 text-white px-4 py-2 rounded w-24 text-center"
            >
              Edit
            </button>
            <button
              onClick={() => handleDelete(complaint._id)}
              className="bg-red-500 text-white px-4 py-2 rounded w-24 text-center"
            >
              Delete
            </button>
            {complaint.status === 'closed' && (
              <button
                onClick={() => navigate('/feedback')}
                className="bg-indigo-600 text-white px-4 py-2 rounded w-24 text-center"
              >
                Feedback
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ComplaintList;
