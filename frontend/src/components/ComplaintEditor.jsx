import { useEffect, useMemo, useState } from 'react';

export default function ComplaintEditor({
  value, onSave, onClear, onDelete, height = '44vh',
  categories = [], locations = []
}) {
  const [form, setForm] = useState({
    title:'', category:'', location:'', description:'', status:'received', photos:[]
  });
  const [photosStr, setPhotosStr] = useState('');
  const disabled = !value;

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

  const categoryOptions = useMemo(() => {
    const s = new Set((categories || []).filter(Boolean));
    if (form.category) s.add(form.category);
    return Array.from(s).sort((a,b)=>a.localeCompare(b));
  }, [categories, form.category]);

  // Build location options = presets + the current value (so it shows even if not preset)
  const locationOptions = useMemo(() => {
    const s = new Set((locations || []).filter(Boolean));
    if (form.location) s.add(form.location);
    return Array.from(s).sort((a,b)=>a.localeCompare(b));
  }, [locations, form.location]);

  const change = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));
  const changePhotos = e => {
    const raw = e.target.value;
    setPhotosStr(raw);
    const arr = raw.split(',').map(s => s.trim()).filter(Boolean);
    setForm(p => ({ ...p, photos: arr }));
  };
  const askDelete = () => {
    const reason = window.prompt('Please enter a reason for deletion:');
    if (!reason) return;
    onDelete?.(reason);
  };

  return (
    <div style={{ border:'1px solid #ddd', borderRadius:8, padding:12, height, overflowY:'auto' }}>
      <h3 style={{ margin:'0 0 8px 0' }}>Edit Complaint Details</h3>
      {!value && <div style={{ color:'#777', marginBottom:12 }}>Select a complaint above.</div>}

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
        <label style={{ gridColumn:'1 / span 2' }}>Title
          <input name="title" value={form.title} onChange={change} style={{ width:'100%' }} disabled={disabled}/>
        </label>

        <label>Category
          <select
            name="category"
            value={form.category}
            onChange={change}
            disabled={disabled}
            style={{ width:'100%' }}
          >
            <option value="">Select category</option>
            {categoryOptions.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </label>

        <label>Location
          <select
            name="location"
            value={form.location}
            disabled
            style={{ width:'100%', background:'#f8f8f8' }}
          >
            <option value="">Select location</option>
            {locationOptions.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </label>

        <label style={{ gridColumn:'1 / span 2' }}>Description
          <textarea name="description" rows={4} value={form.description} onChange={change} style={{ width:'100%' }} disabled={disabled}/>
        </label>

        <label style={{ gridColumn:'1 / span 2' }}>Upload Photo (comma-separated URLs)
          <input value={photosStr} onChange={changePhotos} placeholder="https://... , https://..." style={{ width:'100%' }} disabled={disabled}/>
        </label>

        <label>Status
          <select name="status" value={form.status} onChange={change} disabled={disabled}>
            <option value="received">received</option>
            <option value="resolving">resolving</option>
            <option value="closed">closed</option>
          </select>
        </label>
      </div>

      <div style={{ marginTop:16, display:'flex', gap:8 }}>
        <button onClick={() => onSave?.(form)} disabled={disabled}>Save</button>
        <button onClick={onClear}>Clear</button>
        <button onClick={askDelete} disabled={disabled} style={{ color:'#b00020' }}>Delete</button>
      </div>
    </div>
  );
}
