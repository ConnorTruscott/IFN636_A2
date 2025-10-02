import { useEffect, useMemo, useState } from 'react';

export default function ComplaintEditor({
  value, onSave, onClear, onDelete, height = '44vh',
  categories = [], locations = []
}) {
  const [form, setForm] = useState({
    title:'', category:'', location:'', description:'', status:'received'
  });
  const disabled = !value;

  useEffect(() => {
    if (!value) {
      setForm({ title:'', category:'', location:'', description:'', status:'received' });
      return;
    }
    setForm({
      title: value.title || '',
      category: value.category || '',
      location: value.location || '',
      description: value.description || '',
      status: value.status || 'received',
    });
  }, [value]);

  const change = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const askDelete = () => {
    const reason = window.prompt('Please enter a reason for deletion:');
    if (!reason) return;
    onDelete?.(reason);
  };

  // styles (match Create Complaint / table buttons)
  const input = {
    width:'100%', padding:'8px', border:'1px solid #ddd', borderRadius:6, background:'#fff'
  };
  const label = { display:'block', fontWeight:600, marginBottom:6 };
  const group = { display:'flex', flexDirection:'column', gap:6 };
  const btn = {
    base: { border:'1px solid #ddd', borderRadius:6, padding:'6px 10px', background:'#fff', cursor:'pointer' },
    danger: { border:'1px solid #f5c2c7', color:'#b00020', borderRadius:6, padding:'6px 10px', background:'#fff', cursor:'pointer' }
  };

  const categoryOptions = useMemo(() => {
    // clean & order A→Z with “Other” last
    const clean = Array.from(new Set(
      (categories || []).map(x => (x ?? '').toString().trim()).filter(Boolean)
    ));
    const withoutOther = clean
      .filter(s => s.toLowerCase() !== 'other')
      .sort((a,b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
    const hasOther = clean.some(s => s.toLowerCase() === 'other');
    const ordered = hasOther ? [...withoutOther, 'Other'] : withoutOther;

    // ensure current shows even if meta is stale or missing
    const current = (form.category ?? '').toString().trim();
    if (current && !ordered.includes(current)) {
      return [current, ...ordered];
    }
    return ordered;
  }, [categories, form.category]);

  return (
    <div style={{ border:'1px solid #ddd', borderRadius:8, padding:12, height, overflowY:'auto' }}>
      <h3 style={{ margin:'0 0 12px 0' }}>Edit Complaint Details</h3>
      {!value && <div style={{ color:'#777', marginBottom:12 }}>Select a complaint above.</div>}

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
        <div style={{ ...group, gridColumn:'1 / span 2' }}>
          <label style={label}>Title</label>
          <input
            name="title"
            value={form.title}
            onChange={change}
            style={input}
            disabled={disabled}
            placeholder="Enter a short title"
          />
        </div>

        <div style={group}>
          <label style={label}>Category</label>
          <select
            name="category"
            value={form.category}
            onChange={change}
            style={input}
            disabled={disabled}
          >
            <option value="">Select category</option>
            {categoryOptions.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div style={group}>
          <label style={label}>Location</label>
          {/* Admin cannot change location per backend rule; keep read-only */}
          <select
            name="location"
            value={form.location}
            onChange={change}
            style={{ ...input, color:'#444', background:'#f9f9f9' }}
            disabled
            title="Location cannot be changed by admin"
          >
            <option value="">{form.location ? form.location : 'Select location'}</option>
            {locations.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>

        <div style={{ ...group, gridColumn:'1 / span 2' }}>
          <label style={label}>Description</label>
          <textarea
            name="description"
            rows={4}
            value={form.description}
            onChange={change}
            style={{ ...input, resize:'vertical' }}
            disabled={disabled}
            placeholder="Add details that help staff resolve this complaint"
          />
        </div>

        <div style={group}>
          <label style={label}>Status</label>
          <select name="status" value={form.status} onChange={change} disabled={disabled} style={input}>
            <option value="received">received</option>
            <option value="resolving">resolving</option>
            <option value="closed">closed</option>
          </select>
        </div>
      </div>

      <div style={{ marginTop:16, display:'flex', gap:8 }}>
        <button onClick={() => onSave?.(form)} disabled={disabled} className='flex-1 bg-green-600 text-white p-1 rounded'>Save</button>
        <button onClick={onClear} className='flex-1 bg-yellow-500 text-white p-1 rounded'>Clear</button>
        <button onClick={askDelete} disabled={disabled} className='flex-1 bg-red-500 text-white p-1 rounded'>Delete</button>
      </div>
    </div>
  );
}
