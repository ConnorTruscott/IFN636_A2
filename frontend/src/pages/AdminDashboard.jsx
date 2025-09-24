// frontend/src/pages/AdminDashboard.jsx
import { useEffect, useMemo, useState } from 'react';
import AdminComplaintTable from '../components/AdminComplaintTable';
import ComplaintEditor from '../components/ComplaintEditor';
import {
  adminGetComplaints, adminGetComplaint, adminUpdateComplaint, adminDeleteComplaint
} from '../services/adminApi';
import {
  SortContext, DateSort
} from '../design_patterns/sortStrategy';

// Vertical layout constants (tweak if your navbar is taller)
const UPPER_H = '44vh';
const LOWER_H = '44vh';

export default function AdminDashboard() {
  const [all, setAll] = useState([]);
  const [sel, setSel] = useState(null);
  const sortCtx = useMemo(() => new SortContext(new DateSort()), []);

  const load = async () => {
    const data = await adminGetComplaints();
    setAll(sortCtx.execute(data));
  };

  useEffect(() => { load(); }, []); // load once

  const onRowClick = async (row) => {
    const fresh = await adminGetComplaint(row._id);
    setSel(fresh);
    // Optionally scroll to lower pane on select:
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

      {/* UPPER PANE: Overview */}
      <AdminComplaintTable complaints={all} height={UPPER_H} onRowClick={onRowClick} />

      {/* Spacer */}
      <div style={{ height: 16 }} />

      {/* LOWER PANE: Editor */}
      <div id="editor-pane">
        <ComplaintEditor value={sel} onSave={onSave} onClear={onClear} onDelete={onDelete} height={LOWER_H} />
      </div>
    </div>
  );
}
