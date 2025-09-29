import { useEffect, useState } from 'react';

export default function StaffComplaintEditor({ value, onSave, onClear, height = '44vh' }) {
  const [form, setForm] = useState({ status: 'received' });
  const [photosStr, setPhotosStr] = useState('');
  const [isLocked, setIsLocked] = useState(false);
  const disabled = !value;

  useEffect(() => {
    if (!value) {
      setForm({ status: 'received' });
      setPhotosStr('');
      setIsLocked(false);
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
    setIsLocked(value.status === 'closed');
  }, [value]);

  const handleStatusChange = e => setForm(p => ({ ...p, status: e.target.value }));

  const styles = {
    input: {
      width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: 6, background: '#fff'
    },
    readOnlyInput: {
      width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: 6, background: '#f9f9f9', color: '#444'
    },
    label: { display: 'block', fontWeight: 600, marginBottom: 6 },
    group: { display: 'flex', flexDirection: 'column', gap: 6 },
    btn: {
      base: { border: '1px solid #ddd', borderRadius: 6, padding: '6px 10px', background: '#fff', cursor: 'pointer' },
    }
  };

  return (
    <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: 12, height, overflowY: 'auto' }}>
      <h3 style={{ margin: '0 0 12px 0' }}>Complaint Details</h3>
      
      {isLocked && <div style={{ color:'#b00020', background:'#f8d7da', padding:8, borderRadius:4, marginBottom:12 }}>This complaint is closed and cannot be modified.</div>}
      {!value && <div style={{ color: '#777', marginBottom: 12 }}>Select a complaint above to view details.</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div style={{ ...styles.group, gridColumn: '1 / span 2' }}>
          <label style={styles.label}>Title</label>
          <input value={form.title || ''} style={styles.readOnlyInput} readOnly disabled={disabled} />
        </div>

        <div style={styles.group}>
          <label style={styles.label}>Category</label>
          <input value={form.category || ''} style={styles.readOnlyInput} readOnly disabled={disabled} />
        </div>

        <div style={styles.group}>
          <label style={styles.label}>Location</label>
          <input value={form.location || ''} style={styles.readOnlyInput} readOnly disabled={disabled} />
        </div>

        <div style={{ ...styles.group, gridColumn: '1 / span 2' }}>
          <label style={styles.label}>Description</label>
          <textarea rows={4} value={form.description || ''} style={styles.readOnlyInput} readOnly disabled={disabled} />
        </div>

        <div style={{ ...styles.group, gridColumn: '1 / span 2' }}>
          <label style={styles.label}>Photos (URLs)</label>
          <input value={photosStr} placeholder="No photos uploaded" style={styles.readOnlyInput} readOnly disabled={disabled} />
        </div>

        <div style={styles.group}>
          <label style={styles.label}>Status (Editable)</label>
          <select name="status" value={form.status} onChange={handleStatusChange} disabled={disabled || isLocked} style={styles.input}>
            <option value="received">received</option>
            <option value="resolving">resolving</option>
            <option value="closed">closed</option>
          </select>
        </div>
      </div>

      <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
        <button onClick={() => onSave?.(form)} disabled={disabled || isLocked} style={styles.btn.base}>Save Status</button>
        <button onClick={onClear} style={styles.btn.base}>Clear Selection</button>
      </div>
    </div>
  );
}