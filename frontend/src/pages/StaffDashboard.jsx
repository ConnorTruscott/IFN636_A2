// import { useEffect, useState } from "react";
// import axiosInstance from "../axiosConfig";
// import { useAuth } from "../context/AuthContext";

// const StaffDashboard = () => {
//   const {user} = useAuth();
//   const [complaints, setComplaints] = useState([]);
//   const [selectedComplaint, setSelectedComplaint] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');

//   const fetchComplaints = async () => {
//     setLoading(true);
//     setError('');
//     try{
//       const {data} = await axiosInstance.get('/api/staff/complaints', {
//         headers: {Authorization: `Bearer ${user.token}`},
//       });
//       setComplaints(data);
//     } catch (err){
//       console.error('Failed to fetch complaints', err);
//       setError('Failed to set complaints');
//     }finally{
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchComplaints();
//   }, []);

//   const handleUpdateComplaint = async (complaintId, status) => {
//     try {
//       await axiosInstance.put(`/api/staff/complaints/${complaintId}`,
//         {status},
//         {headers: {Authorization: `Bearer ${user.token}`}}
//       );

//       await fetchComplaints();
//       setSelectedComplaint(prev => ({...prev, status}));
//       window.alert('Complaint status ipdated successfully');
//     } catch (err) {
//       console.error('Failed to update complaint', err);
//       window.alert('Failed to update complaint status');
//     }
//   };

//   const handleSelectComplaint = (complaint) => {
//     setSelectedComplaint(complaint);
//     document.getElementById('editor-pane')?.scrollIntoView({behavior: 'smooth', block: 'start'});
//   };

//   const handleClearSelection = () => {
//     setSelectedComplaint(null);
//   };

//   return(
//     <div className="p-6">
//       <h1 className="text-2xl font-bold mb-4">Staff Dashboard</h1>

//       {loading && <div style={{ padding: '8px 0', color: '#777' }}>Loading…</div>}
//       {error && <div style={{ padding: '8px 0', color: '#b00020' }}>{error}</div>}

//       <section className='mb-6'>
//         <h2 className="text-xl font-semibold mb-2">Your Assigned Complaints</h2>
//         <ul>
//           {complaints.length > 0 ? (
//             complaints.map(c => (
//               <li key={c._id} className="p-2 border-b hover:bg-gray-100 flex justify-between items-center">
//                 <span>
//                   {c.title}-{c.status}
//                 </span>
//                 <button className="ml-2 px-2 py-1 bg-blue-500 text-white rounded"
//                 onClick={() => handleSelectComplaint(c)}>
//                   View / Edit
//                 </button>
//               </li>
//             ))
//           ) : (
//             <li className="p-2 text-gray-500">No complaints assigned</li>
//           )}
//         </ul>
//       </section>

//       {selectedComplaint && (
//         <section id='editor-pane' className="mb-6">
//           <h2 className="text-xl font-semibold mb-2">Edit Complaint</h2>
//           <p><strong>Title:</strong> {selectedComplaint.title}</p>
//           <p><strong>Description:</strong> {selectedComplaint.description}</p>
//           <p><strong>Status:</strong> {selectedComplaint.status}</p>

//           <select value={selectedComplaint.status}
//           onChange={(e) => handleUpdateComplaint(selectedComplaint._id, e.target.value)}
//           className="border p-1 rounded mr-2">
//             <option value="received">Received</option>
//             <option value="resolving">Resolving</option>
//             <option value="closed">Closed</option>
//           </select>

//           <button className='px-2 py-1 bg-gray-500 text-white rounded'
//           onClick={handleClearSelection}>Clear</button>
//         </section>
//       )}
//     </div>
//   )
// }
// export default StaffDashboard;


import { useEffect, useState, useCallback } from "react";
import axiosInstance from "../axiosConfig"; 
import { useAuth } from "../context/AuthContext";
import StaffComplaintTable from "../components/StaffComplaintTable";
import StaffComplaintEditor from "../components/StaffComplaintEditor";

// Constants for pane heights, similar to AdminDashboard
const UPPER_H = '44vh';
const LOWER_H = '44vh';

const StaffDashboard = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [sel, setSel] = useState(null); // 'sel' for selected complaint, consistent with AdminDashboard
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Renamed fetchComplaints to 'load' for consistency
  const load = useCallback(async () => {
    if (!user?.token) return; // Guard against running before user is available
    setLoading(true);
    setError('');
    try {
      const { data } = await axiosInstance.get('/api/staff/complaints', {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setComplaints(data);
    } catch (err) {
      console.error('Failed to fetch complaints', err);
      setError('Failed to load your assigned complaints.');
    } finally {
      setLoading(false);
    }
  }, [user?.token]); // Dependency on token ensures it re-runs if user logs in

  // Initial load of complaints
  useEffect(() => {
    load();
  }, [load]);

  // Handler for when a row is clicked in the table
  const handleViewDetails = (complaint) => {
    setSel(complaint);
    // Scroll the editor pane into view for a better user experience
    document.getElementById('editor-pane')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Handler for saving the status from the editor
  const handleSaveStatus = async (form) => {
    if (!sel) return;
    try {
      await axiosInstance.put(`/api/staff/complaints/${sel._id}`,
        { status: form.status }, // The editor provides the new status in the form object
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      // Refresh the table with the latest data
      await load();
      // Update the selected item in the editor instantly
      setSel(prev => ({ ...prev, status: form.status }));
      window.alert('Complaint status updated successfully!');
    } catch (err) {
      console.error('Failed to update complaint', err);
      window.alert('Failed to update complaint status. Please try again.');
    }
  };

  // Handler for the "Clear" button in the editor
  const handleClearSelection = () => {
    setSel(null);
  };

  return (
    <div style={{ padding: 16 }}>
      <h1 className="text-2xl font-bold mb-4">Staff Dashboard</h1>

      <h2 className="text-xl font-semibold mb-2">Your Assigned Complaints</h2>
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
          value={sel}
          onSave={handleSaveStatus}
          onClear={handleClearSelection}
          height={LOWER_H}
        />
      </div>
    </div>
  );
};

export default StaffDashboard;