import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';

const CAMPUS_OPTIONS = ['Garden Point', 'Kelvin Grove'];

const CampusSelect = ({ value, onChange, disabled }) => {
  const [open, setOpen] = useState(false);
  const handleSelect = (v) => { onChange(v); setOpen(false); };

  return (
    <div className="relative mb-4">
      <label className="block text-gray-700 font-semibold mb-1">Campus</label>
      <button
        type="button"
        onClick={() => !disabled && setOpen((o) => !o)}
        className={`w-full h-11 px-3 border rounded bg-white text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-black text-gray-700 ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={disabled}
      >
        <span>{value || 'Select campus'}</span>
        <svg className="h-4 w-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" />
        </svg>
      </button>

      {open && !disabled && (
        <ul role="listbox" className="absolute z-50 mt-1 w-full max-h-60 overflow-auto rounded border bg-white shadow-lg">
          {CAMPUS_OPTIONS.map((opt) => (
            <li
              key={opt}
              role="option"
              aria-selected={opt === value}
              onClick={() => handleSelect(opt)}
              className={`px-3 py-2 cursor-pointer hover:bg-gray-100 text-gray-700 ${opt === value ? 'font-semibold' : ''}`}
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

  const [role, setRole] = useState('');
  const [view, setView] = useState([]);    
  const [values, setValues] = useState({}); 
  const [initial, setInitial] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const titleByRole = { admin: 'Admin Profile', student: 'Student Profile', staff: 'Staff Profile' };
  const ctaByRole   = { admin: 'Update',       student: 'Save',            staff: '' };

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get('/api/profile/me', {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setRole(res.data.role || '');
        setView(res.data.view || []);
        setValues(res.data.values || {});
        setInitial(res.data.values || {});
      } catch {
        alert('Failed to load profile.');
      } finally {
        setLoading(false);
      }
    };
    if (user?.token) fetchProfile();
  }, [user?.token]);

  const onChange = (k, v) => setValues(prev => ({ ...prev, [k]: v }));
  const onClear  = () => setValues(initial);

  const onSave = async () => {
    const payload = {};
    for (const f of view) {
      if (f.editable && values[f.key] !== initial[f.key]) {
        payload[f.key] = values[f.key];
      }
    }
    if (Object.keys(payload).length === 0) {
      alert('Nothing to update.');
      return;
    }
    setSaving(true);
    try {
      const res = await axiosInstance.patch('/api/profile/me', payload, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (res.data?.ok) {
        setInitial(values);
        alert('Profile updated successfully!');
      } else {
        alert('Update failed.');
      }
    } catch {
      alert('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center mt-20">Loading...</div>;

  return (
    <div className="max-w-md mx-auto mt-20">
      <form onSubmit={(e) => e.preventDefault()} className="bg-white p-6 shadow-md rounded">
        <h1 className="text-2xl font-bold mb-4 text-center">
          {titleByRole[role?.toLowerCase()] || 'Your Profile'}
        </h1>

        {view.map(f => {
          const k = f.key;
          const readOnly = !f.editable;

          if (k === 'campus') {
            return (
              <CampusSelect
                key={k}
                value={values[k] ?? ''}
                onChange={(v) => onChange(k, v)}
                disabled={readOnly}
              />
            );
          }

          return (
            <div key={k} className="mb-4">
              <label className="block text-gray-700 font-semibold mb-1">{f.label}</label>
              <input
                type="text"
                name={k}
                value={values[k] ?? ''}
                onChange={(e) => onChange(k, e.target.value)}
                className={`w-full p-2 border rounded text-gray-700 ${readOnly ? 'bg-gray-50' : ''}`}
                placeholder={f.label}
                disabled={readOnly}
              />
            </div>
          );
        })}

        {view.some(f => f.editable) ? (
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onSave}
              className="flex-1 bg-black text-white p-2 rounded"
              disabled={saving}
            >
              {saving ? 'Saving…' : (ctaByRole[role?.toLowerCase()] || 'Save')}
            </button>
            <button
              type="button"
              onClick={onClear}
              className="flex-1 border p-2 rounded"
              disabled={saving}
            >
              Clear
            </button>
          </div>
        ) : (
          <p className="text-sm text-gray-500 text-center mt-2">View only.</p>
        )}
      </form>
    </div>
  );
};

export default Profile;