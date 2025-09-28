// frontend/src/pages/AdminDashboard.jsx
import { useEffect, useState } from 'react';
import AdminComplaintTable from '../components/AdminComplaintTable';
import ComplaintEditor from '../components/ComplaintEditor';
import Feedback from '../pages/Feedback'; // ADDED: reuse as read-only viewer
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
  const [sortDir, setSortDir] = useState('desc'); // keep your existing default if any
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [paneMode, setPaneMode] = useState('edit'); // 'edit' | 'feedback'

  const orderCategories = (arr) => {
    const clean = Array.from(new Set((arr || []).map((s) => (s ?? '').toString().trim()).filter(Boolean)));
    const withoutOther = clean
      .filter((s) => s.toLowerCase() !== 'other')
      .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
    const hasOther = clean.some((s) => s.toLowerCase() === 'other');
    return hasOther ? [...withoutOther, 'Other'] : withoutOther;
  };

  const refreshMeta = async () => {
    try {
      const m = await adminGetComplaintMeta();
      const categories = orderCategories(m?.categories || []);
      const locations = (m?.locations || []).filter(Boolean);
      setMeta({ categories, locations });
    } catch {
      const derivedCats = orderCategories(Array.from(new Set(all.map((x) => x.category).filter(Boolean))));
      const derivedLocs = Array.from(new Set(all.map((x) => x.location).filter(Boolean))).sort((a, b) =>
        a.localeCompare(b),
      );
      setMeta({ categories: derivedCats, locations: derivedLocs });
      console.warn('Failed to load meta, used fallback from complaints list');
    }
  };

  const load = async (sortKey = activeSort, dir = sortDir) => {
    setLoading(true);
    setErr('');
    try {
      // your backend currently ignores sort & dir; leaving the call shape intact for future
      const data = await adminGetComplaints({ sort: sortKey, dir });
      setAll(data);
    } catch (e) {
      console.error(e);
      setErr('Failed to load complaints.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      await load('date', 'desc');
      await refreshMeta();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSort = async (key) => {
    const nextDir = activeSort === key ? (sortDir === 'asc' ? 'desc' : 'asc') : 'asc';
    setActiveSort(key);
    setSortDir(nextDir);
    await load(key, nextDir);
  };

  const onRowClick = async (row, metaAction) => {
    if (metaAction?.mode === 'delete') {
      const reason = window.prompt('Please enter a reason for deletion:');
      if (!reason) return;
      await adminDeleteComplaint(row._id, reason);
      setSel(null);
      await load();
      await refreshMeta();
      return;
    }

    if (metaAction?.mode === 'viewFeedback') {
      const fresh = await adminGetComplaint(row._id); // ensure feedback present
      setSel(fresh);
      setPaneMode('feedback');
      document.getElementById('editor-pane')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    // default: edit
    const fresh = await adminGetComplaint(row._id);
    setSel(fresh);
    setPaneMode('edit');
    document.getElementById('editor-pane')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const onSave = async (form) => {
    if (!sel) return;
    await adminUpdateComplaint(sel._id, form);
    const fresh = await adminGetComplaint(sel._id);
    setSel(fresh);
    await load();
    await refreshMeta();
    window.alert('Saved.');
  };

  const onClear = () => setSel(null);

  const onDelete = async (reason) => {
    if (!sel) return;
    await adminDeleteComplaint(sel._id, reason);
    setSel(null);
    await load();
    await refreshMeta();
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
        sortDir={sortDir} // passes through but harmless if table ignores
      />
      {loading && <div style={{ padding: '8px 0', color: '#777' }}>Loading…</div>}
      {err && <div style={{ padding: '8px 0', color: '#b00020' }}>{err}</div>}

      <div style={{ height: 16 }} />

      <div id="editor-pane">
        {paneMode === 'feedback' ? (
          <Feedback
            readOnly
            initial={{
              title: sel?.title ?? '',
              rating: sel?.feedback?.rating ?? '',
              text: sel?.feedback?.text ?? '',
            }}
            onClose={() => setPaneMode('edit')}
          />
        ) : (
          <ComplaintEditor
            value={sel}
            onSave={onSave}
            onClear={onClear}
            onDelete={onDelete}
            height={LOWER_H}
            categories={meta.categories}
            locations={meta.locations}
          />
        )}
      </div>
    </div>
  );
}
