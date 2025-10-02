import React from 'react';

export default function StaffComplaintTable({ complaints = [], height = '44vh', onViewDetails }) {
  const fmt = (v) => {
    if (!v) return 'N/A';
    const d = new Date(v);
    return d.toLocaleDateString('en-AU', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const styles = {
    th: {
      textAlign: 'left',
      borderBottom: '1px solid #eee',
      padding: 8,
      fontWeight: 600,
      color: '#222',
      position: 'sticky',
      top: 0,
      background: '#fafafa',
    },
    td: {
      padding: 8,
      maxWidth: 220,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
    button: {
      border: '1px solid #ddd',
      borderRadius: 6,
      padding: '2px 8px',
      background: '#fff',
      cursor: 'pointer',
    },
  };

  return (
    <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: 12, height, overflowY: 'auto' }}>
      <h3 style={{ margin: '0 0 8px 0' }}>Your Assigned Complaints</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={styles.th}>Title</th>
            <th style={styles.th}>Category</th>
            <th style={styles.th}>Status</th>
            <th style={styles.th}>Date</th>
            <th style={styles.th}>Action</th>
          </tr>
        </thead>
        <tbody>
          {complaints.map(row => (
            <tr key={row._id} style={{ borderBottom: '1px solid #f0f0f0' }}>
              <td style={styles.td} title={row.title}>{row.title}</td>
              <td style={styles.td}>{row.category}</td>
              <td style={{ ...styles.td, textTransform: 'capitalize' }}>{row.status}</td>
              <td style={styles.td}>{fmt(row.date)}</td>
              <td style={styles.td}>
                <button onClick={() => onViewDetails(row)} className='flex-1 bg-gray-700 text-white p-1 rounded'>
                  View Details
                </button>
              </td>
            </tr>
          ))}
          {!complaints.length && (
            <tr>
              <td colSpan="5" style={{ padding: 12, color: '#777' }}>
                No complaints assigned.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}