import { useEffect, useMemo, useState } from 'react';
import AdminComplaintTable from '../components/AdminComplaintTable';
import ComplaintEditor from '../components/ComplaintEditor';
import {
  adminGetComplaints,
  adminGetComplaint,
  adminUpdateComplaint,
  adminDeleteComplaint,
  adminGetComplaintMeta,
} from '../services/adminApi';
import {
  SortContext, DateSort, TitleSort, CategorySort, LocationSort,
  StudentSort, StaffSort, StatusSort
} from '../design_patterns/sortStrategy';

const UPPER_H = '44vh';
const LOWER_H = '44vh';

export default function AdminDashboard() {
  const [all, setAll] = useState([]);
  const [sel, setSel] = useState(null);
  const [meta, setMeta] = useState({ categories: [], locations: [] });
  const [activeSort, setActiveSort] = useState('date');
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const sortCtx = useMemo(() => new SortContext(new DateSort()), []);

  const load = async () => {
    setLoading(true);
    setErr('');
    try {
      const data = await adminGetComplaints();
      setAll(applySort(data, activeSort, sortCtx));
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
    return Array.from(s).sort((a,b)=>a.localeCompare(b));
  };

  useEffect(() => {
    (async () => {
      await load();
      try {
        const m = await adminGetComplaintMeta();
        const categories = (m?.categories ?? []).filter(Boolean);
        const locations  = (m?.locations  ?? []).filter(Boolean);

        // Fallback: if backend returns empty, derive from current list
        const fallbackCategories = categories.length ? categories : uniqueFromList(all, 'category');
        const fallbackLocations  = locations.length  ? locations  : uniqueFromList(all, 'location');

        setMeta({ categories: fallbackCategories, locations: fallbackLocations });
      } catch (e) {
        console.warn('Failed to load meta, deriving from list');
        setMeta({
          categories: uniqueFromList(all, 'category'),
          locations:  uniqueFromList(all, 'location'),
        });
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSort = (key) => {
    setActiveSort(key);
    setAll(prev => applySort(prev, key, sortCtx));
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

function applySort(list, key, ctx) {
  switch (key) {
    case 'title':         ctx.setStrategy(new TitleSort()); break;
    case 'category':      ctx.setStrategy(new CategorySort()); break;
    case 'location':      ctx.setStrategy(new LocationSort()); break;
    case 'student':       ctx.setStrategy(new StudentSort()); break;
    case 'assignedStaff': ctx.setStrategy(new StaffSort()); break;
    case 'status':        ctx.setStrategy(new StatusSort()); break;
    case 'date':
    default:              ctx.setStrategy(new DateSort()); break;
  }
  return ctx.execute(list);
}
