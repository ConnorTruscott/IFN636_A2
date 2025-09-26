// pages/StaffDashboard.jsx

import { useEffect, useState } from 'react';
import StaffComplaintTable from '../components/StaffComplaintTable';
import StaffComplaintEditor from '../components/StaffComplaintEditor.jsx';
// You'll need to create these API service functions
import { staffGetComplaints, staffUpdateComplaint } from '../services/staffApi';

const UPPER_H = '44vh';
const LOWER_H = '44vh';

export default function StaffDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadComplaints = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await staffGetComplaints();
      setComplaints(data);
    } catch (e) {
      console.error(e);
      setError('Failed to load your assigned complaints.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComplaints();
  }, []);

  const handleViewDetails = (complaint) => {
    setSelectedComplaint(complaint);
    document.getElementById('editor-pane')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleSave = async (form) => {
    if (!selectedComplaint) return;
    try {
      await staffUpdateComplaint(selectedComplaint._id, { status: form.status });
      // Refresh the list to show the new status
      await loadComplaints();
      window.alert('Status updated successfully.');
      // Update the selected complaint view with the new status
      setSelectedComplaint(prev => ({ ...prev, status: form.status }));
    } catch (e) {
      console.error(e);
      window.alert('Failed to update status.');
    }
  };

  const handleClear = () => {
    setSelectedComplaint(null);
  };

  return (
    <div style={{ padding: 16 }}>
      <h2>Your Assigned Complaints</h2>

      <StaffComplaintTable
        complaints={complaints}
        height={UPPER_H}
        onViewDetails={handleViewDetails}
      />
      {loading && <div style={{ padding: '8px 0', color: '#777' }}>Loading…</div>}
      {error && <div style={{ padding: '8px 0', color: '#b00020' }}>{error}</div>}

      <div style={{ height: 16 }} />

      <div id="editor-pane">
        <StaffComplaintEditor
          value={selectedComplaint}
          onSave={handleSave}
          onClear={handleClear}
          height={LOWER_H}
        />
      </div>
    </div>
  );
}