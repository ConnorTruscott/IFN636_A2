import { useEffect, useState } from 'react';
import AdminComplaintTable from '../components/AdminComplaintTable';
import ComplaintEditor from '../components/ComplaintEditor';
import Feedback from '../pages/Feedback';
import {
  adminGetComplaints,
  adminGetComplaint,
  adminUpdateComplaint,
  adminDeleteComplaint,
  adminGetComplaintMeta,
} from '../services/adminApi';
import { useAuth } from '../context/AuthContext';


const UPPER_H = '44vh';
const LOWER_H = '44vh';

export default function AdminDashboard() {
  const [all, setAll] = useState([]);
  const [sel, setSel] = useState(null);
  const [meta, setMeta] = useState({ categories: [], locations: [] });
  const [activeSort, setActiveSort] = useState('date');
  const [sortDir, setSortDir] = useState('desc');
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [paneMode, setPaneMode] = useState('edit');
  const {user} = useAuth();

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
      const m = await adminGetComplaintMeta(user.token);
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
      const data = await adminGetComplaints(user.token, { sort: sortKey, dir });
      setAll(data || []);
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
  }, []);

  const onSort = async (key) => {
    const nextDir = activeSort === key ? (sortDir === 'asc' ? 'desc' : 'asc') : (key === 'date' ? 'desc' : 'asc');
    setActiveSort(key);
    setSortDir(nextDir);
    await load(key, nextDir);
  };

  const onRowClick = async (row, metaAction) => {
    if (metaAction?.mode === 'delete') {
      const reason = window.prompt('Please enter a reason for deletion:');
      if (!reason) return;
      await adminDeleteComplaint(user.token, row._id, reason);
      setSel(null);
      await load(activeSort, sortDir);
      await refreshMeta();
      return;
    }

    if (metaAction?.mode === 'viewFeedback') {
      const fresh = await adminGetComplaint(user.token, row._id);
      setSel(fresh);
      setPaneMode('feedback');
      document.getElementById('editor-pane')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    const fresh = await adminGetComplaint(user.token, row._id);
    setSel(fresh);
    setPaneMode('edit');
    document.getElementById('editor-pane')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const onSave = async (form) => {
    if (!sel) return;
    await adminUpdateComplaint(user.token, sel._id, form);
    const fresh = await adminGetComplaint(user.token, sel._id);
    setSel(fresh);
    await load(activeSort, sortDir);
    await refreshMeta();
    window.alert('Saved.');
  };

  const onClear = () => setSel(null);

  const onDelete = async (reason) => {
    if (!sel) return;
    await adminDeleteComplaint(user.token, sel._id, reason);
    setSel(null);
    await load(activeSort, sortDir);
    await refreshMeta();
  };

  return (
    <div style={{ padding: 16 }}>
      <AdminComplaintTable
        complaints={all}
        height={UPPER_H}
        onRowClick={onRowClick}
        onSort={onSort}
        activeSort={activeSort}
        sortDir={sortDir}
      />
      {loading && <div style={{ padding: '8px 0', color: '#777' }}>Loading…</div>}
      {err && <div style={{ padding: '8px 0', color: '#b00020' }}>{err}</div>}

      <div style={{ height: 16 }} />

      <div id="editor-pane">
        {sel ? (
          paneMode === 'feedback' ? (
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
          )
        ) : (
          <div
            style={{
              height: LOWER_H,
              border: '1px dashed #ddd',
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#626262ff',
              fontWeight: 700,
              fontSize: 18,
              textAlign: 'center',
              padding: '0 16px',
            }}
          >
            Select a complaint to edit or feedback to view from the list above.
          </div>
        )}
      </div>
    </div>
  );
}