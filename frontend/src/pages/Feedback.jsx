import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosConfig';
import { useAuth } from '../context/AuthContext';

const Feedback = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [drafts, setDrafts] = useState({});
  const [loading, setLoading] = useState(false);

  const fetchClosed = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/api/feedback', {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const data = res.data || [];
      setItems(data);
      const init = {};
      data.forEach((c) => {
        init[c._id] = {
          text: c.feedback?.text || '',
          rating: c.feedback?.rating ?? '',
        };
      });
      setDrafts(init);
    } catch {
      alert('Failed to load closed complaints.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.token) fetchClosed();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.token]);

  const handleDraftChange = (id, field, value) => {
    setDrafts((d) => ({ ...d, [id]: { ...d[id], [field]: value } }));
  };

  const isDirty = (c) => {
    const d = drafts[c._id] || {};
    const baseText = c.feedback?.text || '';
    const baseRating = c.feedback?.rating ?? '';
    return String(d.text ?? '') !== String(baseText) ||
           String(d.rating ?? '') !== String(baseRating);
  };

  const ratingValid = (val) => {
    if (val === '' || val === undefined) return false;
    const n = Number(val);
    return Number.isInteger(n) && n >= 1 && n <= 5;
  };

  const canSave = (c) => {
    const d = drafts[c._id] || {};
    const dirty = isDirty(c);
    const ratingOk = d.rating === '' || ratingValid(d.rating);
    return dirty && ratingOk;
  };

  const handleSave = async (id) => {
    const d = drafts[id] || {};
    try {
      const body = {
        text: d.text ?? '',
        rating: d.rating === '' ? undefined : Number(d.rating),
      };
      const res = await axiosInstance.put(`/api/feedback/${id}`, body, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setItems((arr) => arr.map((c) => (c._id === id ? res.data : c)));
      setDrafts((prev) => ({
        ...prev,
        [id]: {
          text: res.data.feedback?.text || '',
          rating: res.data.feedback?.rating ?? '',
        },
      }));
    } catch {
      alert('Failed to save feedback.');
    }
  };

  const handleCancel = (c) => {
    setDrafts((prev) => ({
      ...prev,
      [c._id]: {
        text: c.feedback?.text || '',
        rating: c.feedback?.rating ?? '',
      },
    }));
  };

  const handleDelete = async (id) => {
    try {
      const res = await axiosInstance.delete(`/api/feedback/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setItems((arr) => arr.map((c) => (c._id === id ? res.data : c)));
      setDrafts((d) => ({ ...d, [id]: { text: '', rating: '' } }));
    } catch {
      alert('Failed to delete feedback.');
    }
  };

  const formatDate = (value) => {
    if (!value) return '—';
    const d = new Date(value);
    return isNaN(d) ? '—' : d.toLocaleDateString();
  };

  if (loading) return <div className="max-w-3xl mx-auto mt-10">Loading…</div>;

  return (
    <div className="max-w-3xl mx-auto mt-10">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Feedback</h1>
        <button onClick={() => navigate('/complaints')} className="px-4 py-2 bg-gray-700 text-white rounded">
          Back
        </button>
      </div>

      {items.length === 0 ? (
        <div className="bg-white p-4 rounded shadow">No closed complaints yet.</div>
      ) : (
        items.map((c) => {
          const d = drafts[c._id] || { text: '', rating: '' };
          const dirty = isDirty(c);
          const saveEnabled = canSave(c);
          const cancelEnabled = dirty;
          const deleteEnabled = (drafts[c._id]?.text?.trim() || drafts[c._id]?.rating !== '');

          return (
            <div key={c._id} className="bg-white p-4 rounded shadow mb-4">
              <div className="mb-2">
                <div className="font-semibold">{c.title}</div>
                <div className="text-sm text-gray-500">Date: {formatDate(c.date)}</div>
              </div>

              <div className="mb-2">
                <label className="block text-sm font-medium mb-1">Your feedback</label>
                <textarea
                  value={d.text}
                  onChange={(e) => handleDraftChange(c._id, 'text', e.target.value)}
                  className="w-full border rounded p-2"
                  rows={3}
                  placeholder="Write your feedback here…"
                />
              </div>

              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Rating (1 = lowest, 5 = highest)</label>
                <select
                  value={d.rating}
                  onChange={(e) => handleDraftChange(c._id, 'rating', e.target.value)}
                  className="w-32 border rounded p-2"
                >
                  <option value="">Choose…</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                </select>
                {d.rating !== '' && !ratingValid(d.rating) && (
                  <span className="ml-2 text-sm text-red-600">Rating must be 1–5</span>
                )}
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => handleSave(c._id)}
                  disabled={!saveEnabled}
                  className={`px-4 py-2 rounded text-white ${
                    saveEnabled ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400 cursor-not-allowed'
                  }`}
                >
                  Save
                </button>

                <button
                  onClick={() => cancelEnabled && handleCancel(c)}
                  disabled={!cancelEnabled}
                  className={`px-4 py-2 rounded text-white ${
                    cancelEnabled ? 'bg-gray-600 hover:bg-gray-700' : 'bg-gray-400 cursor-not-allowed'
                  }`}
                >
                  Cancel
                </button>

                <button
                  onClick={() => deleteEnabled && handleDelete(c._id)}
                  disabled={!deleteEnabled}
                  className={`px-4 py-2 rounded text-white ${
                    deleteEnabled ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-400 cursor-not-allowed'
                  }`}
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default Feedback;
