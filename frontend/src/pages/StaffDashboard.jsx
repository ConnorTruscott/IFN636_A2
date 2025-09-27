// // pages/StaffDashboard.jsx

// import { useEffect, useState } from 'react';
// import StaffComplaintTable from '../components/StaffComplaintTable';
// import StaffComplaintEditor from '../components/StaffComplaintEditor.jsx';
// // You'll need to create these API service functions
// import { staffGetComplaints, staffUpdateComplaint } from '../services/staffApi';

// const UPPER_H = '44vh';
// const LOWER_H = '44vh';

// export default function StaffDashboard() {
//   const [complaints, setComplaints] = useState([]);
//   const [selectedComplaint, setSelectedComplaint] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');

//   const loadComplaints = async () => {
//     setLoading(true);
//     setError('');
//     try {
//       const data = await staffGetComplaints();
//       setComplaints(data);
//     } catch (e) {
//       console.error(e);
//       setError('Failed to load your assigned complaints.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadComplaints();
//   }, []);

//   const handleViewDetails = (complaint) => {
//     setSelectedComplaint(complaint);
//     document.getElementById('editor-pane')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
//   };

//   const handleSave = async (form) => {
//     if (!selectedComplaint) return;
//     try {
//       await staffUpdateComplaint(selectedComplaint._id, { status: form.status });
//       // Refresh the list to show the new status
//       await loadComplaints();
//       window.alert('Status updated successfully.');
//       // Update the selected complaint view with the new status
//       setSelectedComplaint(prev => ({ ...prev, status: form.status }));
//     } catch (e) {
//       console.error(e);
//       window.alert('Failed to update status.');
//     }
//   };

//   const handleClear = () => {
//     setSelectedComplaint(null);
//   };

//   return (
//     <div style={{ padding: 16 }}>
//       <h2>Your Assigned Complaints</h2>

//       <StaffComplaintTable
//         complaints={complaints}
//         height={UPPER_H}
//         onViewDetails={handleViewDetails}
//       />
//       {loading && <div style={{ padding: '8px 0', color: '#777' }}>Loading…</div>}
//       {error && <div style={{ padding: '8px 0', color: '#b00020' }}>{error}</div>}

//       <div style={{ height: 16 }} />

//       <div id="editor-pane">
//         <StaffComplaintEditor
//           value={selectedComplaint}
//           onSave={handleSave}
//           onClear={handleClear}
//           height={LOWER_H}
//         />
//       </div>
//     </div>
//   );
// }

import { useEffect, useState } from "react";
import axiosInstance from "../axiosConfig";
import { useAuth } from "../context/AuthContext";

const StaffDashboard = () => {
  const {user} = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchComplaints = async () => {
    setLoading(true);
    setError('');
    try{
      const {data} = await axiosInstance.get('/api/staff/complaints', {
        headers: {Authorization: `Bearer ${user.token}`},
      });
      setComplaints(data);
    } catch (err){
      console.error('Failed to fetch complaints', err);
      setError('Failed to set complaints');
    }finally{
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleUpdateComplaint = async (complaintId, status) => {
    try {
      await axiosInstance.put(`/api/staff/complaints/${complaintId}`,
        {status},
        {headers: {Authorization: `Bearer ${user.token}`}}
      );

      await fetchComplaints();
      setSelectedComplaint(prev => ({...prev, status}));
      window.alert('Complaint status ipdated successfully');
    } catch (err) {
      console.error('Failed to update complaint', err);
      window.alert('Failed to update complaint status');
    }
  };

  const handleSelectComplaint = (complaint) => {
    setSelectedComplaint(complaint);
    document.getElementById('editor-pane')?.scrollIntoView({behavior: 'smooth', block: 'start'});
  };

  const handleClearSelection = () => {
    setSelectedComplaint(null);
  };

  return(
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Staff Dashboard</h1>

      {loading && <div style={{ padding: '8px 0', color: '#777' }}>Loading…</div>}
      {error && <div style={{ padding: '8px 0', color: '#b00020' }}>{error}</div>}

      <section className='mb-6'>
        <h2 className="text-xl font-semibold mb-2">Your Assigned Complaints</h2>
        <ul>
          {complaints.length > 0 ? (
            complaints.map(c => (
              <li key={c._id} className="p-2 border-b hover:bg-gray-100 flex justify-between items-center">
                <span>
                  {c.title}-{c.status}
                </span>
                <button className="ml-2 px-2 py-1 bg-blue-500 text-white rounded"
                onClick={() => handleSelectComplaint(c)}>
                  View / Edit
                </button>
              </li>
            ))
          ) : (
            <li className="p-2 text-gray-500">No complaints assigned</li>
          )}
        </ul>
      </section>

      {selectedComplaint && (
        <section id='editor-pane' className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Edit Complaint</h2>
          <p><strong>Title:</strong> {selectedComplaint.title}</p>
          <p><strong>Description:</strong> {selectedComplaint.description}</p>
          <p><strong>Status:</strong> {selectedComplaint.status}</p>

          <select value={selectedComplaint.status}
          onChange={(e) => handleUpdateComplaint(selectedComplaint._id, e.target.value)}
          className="border p-1 rounded mr-2">
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>

          <button className='px-2 py-1 bg-gray-500 text-white rounded'
          onClick={handleClearSelection}>Clear</button>
        </section>
      )}
    </div>
  )
}
export default StaffDashboard;