// frontend/src/components/AdminComplaintTable.jsx
export default function AdminComplaintTable({ complaints, height = '44vh', onRowClick }) {
  const fmt = v => (v ? new Date(v).toLocaleString() : '');

  return (
    <div style={{ border:'1px solid #ddd', borderRadius:8, padding:12, height, overflowY:'auto' }}>
      <h3 style={{ marginTop:0 }}>All Complaints Overview</h3>
      <table style={{ width:'100%', borderCollapse:'collapse' }}>
        <thead>
          <tr style={{ position:'sticky', top:0, background:'#fafafa' }}>
            {['Title','Category','Location','Student','Assigned Staff','Status','Date'].map(h=>(
              <th key={h} style={{ textAlign:'left', borderBottom:'1px solid #eee', padding:8 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {complaints.map(c=>(
            <tr
              key={c._id}
              onClick={() => onRowClick?.(c)}
              style={{ borderBottom:'1px solid #f0f0f0', cursor: onRowClick ? 'pointer' : 'default' }}
            >
              <td style={{ padding:8 }}>{c.title}</td>
              <td style={{ padding:8 }}>{c.category}</td>
              <td style={{ padding:8 }}>{c.location}</td>
              <td style={{ padding:8 }}>{c.userId?.fullname || '-'}</td>
              <td style={{ padding:8 }}>{c.assignedStaff?.fullname || '-'}</td>
              <td style={{ padding:8, textTransform:'capitalize' }}>{c.status}</td>
              <td style={{ padding:8 }}>{fmt(c.date || c.createdAt)}</td>
            </tr>
          ))}
          {!complaints.length && (
            <tr><td colSpan="7" style={{ padding:12, color:'#777' }}>No complaints found.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
