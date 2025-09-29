export default function AdminComplaintTable({
  complaints,
  height = '44vh',
  onRowClick,
  onSort,
  activeSort,
  sortDir = 'asc',
}) {
  const fmt = (v) => {
    if (!v) return '';
    const d = new Date(v);
    return d.toLocaleDateString('en-AU', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const TH = ({ id, children }) => {
    const isActive = activeSort === id;
    const icon = isActive ? (sortDir === 'asc' ? '▲' : '▼') : '▼';
    const iconColor = isActive ? '#333' : '#adadadff';

    return (
      <th
        role="button"
        onClick={() => onSort?.(id)}
        title={`Sort by ${children}`}
        style={{
          textAlign: 'left',
          borderBottom: '1px solid #eee',
          padding: 8,
          userSelect: 'none',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          fontWeight: 600,
          color: '#222',
        }}
      >
        <span>{children}</span>
        <span style={{ marginLeft: 6, color: iconColor }}>{icon}</span>
      </th>
    );
  };

  const TD = ({ children }) => (
    <td
      style={{
        padding: 8,
        maxWidth: 220,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}
      title={typeof children === 'string' ? children : undefined}
    >
      {children}
    </td>
  );

  return (
    <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: 12, height, overflowY: 'auto' }}>
      <h3 style={{ margin: '0 0 8px 0' }}>All Complaints Overview</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ position: 'sticky', top: 0, background: '#fafafa' }}>
            <TH id="title">Title</TH>
            <TH id="category">Category</TH>
            <TH id="location">Location</TH>
            <TH id="student">Student</TH>
            <TH id="assignedStaff">Assigned Staff</TH>
            <TH id="status">Status</TH>
            <TH id="date">Date</TH>
            <th
              style={{
                textAlign: 'left',
                borderBottom: '1px solid #eee',
                padding: 8,
                whiteSpace: 'nowrap',
                fontWeight: 600,
                color: '#222',
              }}
            >
              Feedback
            </th>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #eee', padding: 8, whiteSpace: 'nowrap' }}>
              Action
            </th>
          </tr>
        </thead>
        <tbody>
          {complaints.map((c) => (
            <tr key={c._id} style={{ borderBottom: '1px solid #f0f0f0' }}>
              <TD>{c.title}</TD>
              <TD>{c.category}</TD>
              <TD>{c.location}</TD>
              <TD>{c.studentName || c?.userId?.fullname || c?.userId?.name || '-'}</TD>
              <TD>{c.assignedStaffName || '-'}</TD>
              <TD style={{ textTransform: 'capitalize' }}>{c.status}</TD>
              <TD>{fmt(c.date || c.createdAt)}</TD>
              <TD>
                {c.status === 'closed' ? (
                  <button
                    onClick={() => onRowClick?.(c, { mode: 'viewFeedback' })}
                    title="View Feedback"
                    style={{ border: '1px solid #ddd', borderRadius: 6, padding: '2px 8px', background: '#fff' }}
                  >
                    View
                  </button>
                ) : (
                  '-'
                )}
              </TD>
              <td style={{ padding: 8, whiteSpace: 'nowrap' }}>
                <button
                  onClick={() => onRowClick?.(c)}
                  title="Edit"
                  style={{
                    marginRight: 8,
                    border: '1px solid #ddd',
                    borderRadius: 6,
                    padding: '2px 8px',
                    background: '#fff',
                  }}
                >
                  Edit
                </button>
                <button
                  onClick={() => onRowClick?.(c, { mode: 'delete' })}
                  title="Delete"
                  style={{
                    border: '1px solid #f5c2c7',
                    color: '#b00020',
                    borderRadius: 6,
                    padding: '2px 8px',
                    background: '#fff',
                  }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {!complaints.length && (
            <tr>
              {/* 9 columns total */}
              <td colSpan="9" style={{ padding: 12, color: '#777' }}>
                No complaints found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}