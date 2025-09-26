// components/StaffComplaintTable.jsx

import React from 'react';

export default function StaffComplaintTable({ complaints = [], height, onViewDetails }) {
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div style={{ border:'1px solid #ddd', height, overflowY:'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead style={{ position: 'sticky', top: 0, background: '#f8f8f8' }}>
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
            <tr key={row._id} style={styles.tr}>
              <td style={styles.td}>{row.title}</td>
              <td style={styles.td}>{row.category}</td>
              <td style={styles.td}>{row.status}</td>
              <td style={styles.td}>{formatDate(row.date)}</td>
              <td style={styles.td}>
                <button onClick={() => onViewDetails(row)}>View Details</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const styles = {
  th: { padding: 12, textAlign: 'left', borderBottom: '1px solid #ddd' },
  tr: { borderBottom: '1px solid #eee' },
  td: { padding: 12, textAlign: 'left' },
};