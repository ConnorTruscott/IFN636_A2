import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';

const CAMPUS_OPTIONS = ['Garden Point', 'Kelvin Grove'];

const CampusSelect = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);

  const handleSelect = (v) => {
    onChange(v);
    setOpen(false);
  };

  return (
    <div className="relative mb-4">
      <label className="block text-gray-700 font-semibold mb-1">Campus</label>

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full h-11 px-3 border rounded bg-white text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-black text-gray-700"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span>{value || 'Select campus'}</span>
        <svg className="h-4 w-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" />
        </svg>
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute z-50 mt-1 w-full max-h-60 overflow-auto rounded border bg-white shadow-lg"
        >
          {CAMPUS_OPTIONS.map((opt) => (
            <li
              key={opt}
              role="option"
              aria-selected={opt === value}
              onClick={() => handleSelect(opt)}
              className={`px-3 py-2 cursor-pointer hover:bg-gray-100 text-gray-700 ${
                opt === value ? 'font-semibold' : ''
              }`}
            >
              {opt}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const Profile = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    campus: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get('/api/auth/profile', {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setFormData({
          name: response.data.name || '',
          email: response.data.email || '',
          phone: response.data.phone || '',
          campus: response.data.campus || '',
        });
      } catch {
        alert('Failed to fetch profile. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchProfile();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axiosInstance.put('/api/auth/profile', formData, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      alert('Profile updated successfully!');
    } catch {
      alert('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center mt-20">Loading...</div>;
  }

  return (
    <div className="max-w-md mx-auto mt-20">
      <form onSubmit={handleSubmit} className="bg-white p-6 shadow-md rounded">
        <h1 className="text-2xl font-bold mb-4 text-center">Your Profile</h1>

        <label className="block text-gray-700 font-semibold mb-1">Name</label>
        <input
          type="text"
          placeholder="Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full mb-4 p-2 border rounded text-gray-700"
        />

        <label className="block text-gray-700 font-semibold mb-1">Email</label>
        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full mb-4 p-2 border rounded text-gray-700"
        />

        <label className="block text-gray-700 font-semibold mb-1">Phone Number</label>
        <input
          type="text"
          placeholder="Phone Number"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          className="w-full mb-4 p-2 border rounded text-gray-700"
        />

        {/* Custom campus dropdown (same as Register) */}
        <CampusSelect
          value={formData.campus}
          onChange={(v) => setFormData((prev) => ({ ...prev, campus: v }))}
        />

        <button type="submit" className="w-full bg-black text-white p-2 rounded">
          {loading ? 'Updating...' : 'Update Profile'}
        </button>
      </form>
    </div>
  );
};

export default Profile;
