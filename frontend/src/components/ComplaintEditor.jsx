// frontend/src/components/ComplaintEditor.jsx
import { useEffect, useState } from 'react';

export default function ComplaintEditor({
  value,                      // selected complaint
  onSave, onClear, onDelete,  // handlers from parent
  height = '44vh'
}) {
  const [form, setForm] = useState({
    title:'', category:'', location:'', description:'', status:'received', photos:[]
  });
  const [photosStr, setPhotosStr] = useState('');

  useEffect(() => {
    if (!value) {
      setForm({ title:'', category:'', location:'', description:'', status:'received', photos:[] });
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
      photos
    });
    setPhotosStr(photos.join(', '));
  }, [value]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotos = e => {
    const raw = e.target.value;
    setPhotosStr(raw);
    const arr = raw.split(',').map(s => s.trim()).filter(Boolean);
    setForm(prev => ({ ...prev, photos: arr }));
  };

  const askDelete = () => {
    const reason = window.prompt('Please enter a reason for deletion:');
    if (!reason) return;
    onDelete?.(reason);
  };

  return (
    <div style={{ border:'1px solid #ddd', borderRadius:8, padding:12, height, overflowY:'auto' }}>
      <h3 style={{ marginTop:0 }}>Edit Complaint Details</h3>
      {!value && <div style={{ color:'#777', marginBottom:12 }}>Select a complaint in the list above.</div>}

      <div style={{ display:'grid', gridTemplateColumns:'1fr', gap:12 }}>
        <label>Title
          <input name="title" value={form.title} onChange={handleChange} style={{ width:'100%' }} />
        </label>
        <label>Category
          <input name="category" value={form.category} onChange={handleChange} style={{ width:'100%' }} />
        </label>
        <label>Location
          <input name="location" value={form.location} onChange={handleChange} style={{ width:'100%' }} />
        </label>
        <label>Description
          <textarea name="description" rows={4} value={form.description} onChange={handleChange} style={{ width:'100%' }} />
        </label>
        <label>Upload Photo (comma-separated URLs)
          <input value={photosStr} onChange={handlePhotos} placeholder="https://... , https://..." style={{ width:'100%' }} />
        </label>
        <label>Status
          <select name="status" value={form.status} onChange={handleChange}>
            <option value="received">received</option>
            <option value="resolving">resolving</option>
            <option value="closed">closed</option>
          </select>
        </label>
      </div>

      <div style={{ marginTop:16, display:'flex', gap:8 }}>
        <button onClick={() => onSave?.(form)} disabled={!value}>Save</button>
        <button onClick={onClear}>Clear</button>
        <button onClick={askDelete} disabled={!value} style={{ color:'#b00020' }}>Delete</button>
      </div>
    </div>
  );
}
