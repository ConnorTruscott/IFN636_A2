import { useEffect, useState } from 'react';
import AdminComplaintTable from '../components/AdminComplaintTable';
import ComplaintEditor from '../components/ComplaintEditor';
import {
  adminGetComplaints,
  adminGetComplaint,
  adminUpdateComplaint,
  adminDeleteComplaint,
  adminGetComplaintMeta,
} from '../services/adminApi';

const UPPER_H = '44vh';
const LOWER_H = '44vh';

export default function AdminDashboard() {
  const [all, setAll] = useState([]);
  const [sel, setSel] = useState(null);
  const [meta, setMeta] = useState({ categories: [], locations: [] });
  const [activeSort, setActiveSort] = useState('date');
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  const load = async (sortKey = activeSort) => {
    setLoading(true);
    setErr('');
    try {
      const data = await adminGetComplaints({ sort: sortKey });
      setAll(data);
    } catch (e) {
      console.error(e);
      setErr('Failed to load complaints.');
    } finally {
      setLoading(false);
    }
  };

  // Make a simple unique extractor
  const uniqueFromList = (items, key) => {
    const s = new Set(
      items
        .map(x => (x?.[key] ?? '').toString().trim())
        .filter(Boolean)
    );
    return Array.from(s).sort((a, b) => a.localeCompare(b));
  };

  useEffect(() => {
    (async () => {
      await load('date');
      try {
        const m = await adminGetComplaintMeta();
        const categories = (m?.categories ?? []).filter(Boolean);
        const locations = (m?.locations ?? []).filter(Boolean);

        const fallbackCategories = categories.length ? categories : uniqueFromList(all, 'category');
        const fallbackLocations = locations.length ? locations : uniqueFromList(all, 'location');

        setMeta({ categories: fallbackCategories, locations: fallbackLocations });
      } catch (e) {
        console.warn('Failed to load meta, deriving from list');
        setMeta({
          categories: uniqueFromList(all, 'category'),
          locations: uniqueFromList(all, 'location'),
        });
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSort = async (key) => {
    setActiveSort(key);
    await load(key);
  };

  const onRowClick = async (row, metaAction) => {
    if (metaAction?.mode === 'delete') {
      const reason = window.prompt('Please enter a reason for deletion:');
      if (!reason) return;
      await adminDeleteComplaint(row._id, reason);
      setSel(null);
      await load();
      return;
    }
    const fresh = await adminGetComplaint(row._id);
    setSel(fresh);
    document.getElementById('editor-pane')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const onSave = async (form) => {
    if (!sel) return;
    await adminUpdateComplaint(sel._id, form);
    const fresh = await adminGetComplaint(sel._id);
    setSel(fresh);
    await load();
    window.alert('Saved.');
  };

  const onClear = () => setSel(null);

  const onDelete = async (reason) => {
    if (!sel) return;
    await adminDeleteComplaint(sel._id, reason);
    setSel(null);
    await load();
  };

  return (
    <div style={{ padding: 16 }}>
      <h2>Dashboard</h2>

      <AdminComplaintTable
        complaints={all}
        height={UPPER_H}
        onRowClick={onRowClick}
        onSort={onSort}
        activeSort={activeSort}
      />
      {loading && <div style={{ padding: '8px 0', color: '#777' }}>Loading…</div>}
      {err && <div style={{ padding: '8px 0', color: '#b00020' }}>{err}</div>}

      <div style={{ height: 16 }} />

      <div id="editor-pane">
        <ComplaintEditor
          value={sel}
          onSave={onSave}
          onClear={onClear}
          onDelete={onDelete}
          height={LOWER_H}
          categories={meta.categories}
          locations={meta.locations}
        />
      </div>
    </div>
  );
}
