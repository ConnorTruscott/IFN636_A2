// components/StaffComplaintEditor.jsx

import { useEffect, useState } from 'react';

export default function StaffComplaintEditor({ value, onSave, onClear, height = '44vh' }) {
  const [form, setForm] = useState({ status: 'received' });
  const [photosStr, setPhotosStr] = useState('');
  const disabled = !value;

  useEffect(() => {
    if (!value) {
      setForm({ status: 'received' });
      setPhotosStr('');
      return;
    }
    const photos = Array.isArray(value.photos) ? value.photos : [];
    setForm({
      title: value.title || '',
      category: value.category || '',
      location: value.location || '',
      description: value.description || '',
      status: value.status || 'received',
    });
    setPhotosStr(photos.join(', '));
  }, [value]);

  const handleStatusChange = e => setForm(p => ({ ...p, status: e.target.value }));

  return (
    <div style={{ border:'1px solid #ddd', borderRadius:8, padding:12, height, overflowY:'auto' }}>
      <h3 style={{ margin:'0 0 8px 0' }}>Complaint Details</h3>
      {!value && <div style={{ color:'#777', marginBottom:12 }}>Select a complaint above to view details.</div>}

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
        <label style={{ gridColumn:'1 / span 2' }}>Title
          <input value={form.title || ''} style={{ width:'100%' }} readOnly disabled={disabled} />
        </label>

        <label>Category
          <input value={form.category || ''} style={{ width:'100%' }} readOnly disabled={disabled} />
        </label>

        <label>Location
          <input value={form.location || ''} style={{ width:'100%' }} readOnly disabled={disabled} />
        </label>

        <label style={{ gridColumn:'1 / span 2' }}>Description
          <textarea rows={4} value={form.description || ''} style={{ width:'100%' }} readOnly disabled={disabled} />
        </label>

        <label style={{ gridColumn:'1 / span 2' }}>Photos (URLs)
          <input value={photosStr} placeholder="No photos uploaded" style={{ width:'100%' }} readOnly disabled={disabled} />
        </label>

        <label>
          <strong>Status (Editable)</strong>
          <select name="status" value={form.status} onChange={handleStatusChange} disabled={disabled}>
            <option value="received">received</option>
            <option value="resolving">resolving</option>
            <option value="closed">closed</option>
          </select>
        </label>
      </div>

      <div style={{ marginTop:16, display:'flex', gap:8 }}>
        <button onClick={() => onSave?.(form)} disabled={disabled}>Save Status</button>
        <button onClick={onClear}>Clear</button>
      </div>
    </div>
  );
}