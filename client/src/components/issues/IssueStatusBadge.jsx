function normalizeStatus(status) {
  if (!status) return { label: 'Pending', key: 'pending', icon: '⏳' }
  const s = String(status).trim().toLowerCase().replace(/[_\s-]+/g, '')
  if (s === 'resolved' || s === 'completed' || s === 'closed') {
    return { label: 'Resolved', key: 'resolved', icon: '✓' }
  }
  if (s === 'inprogress' || s === 'working' || s === 'assigned') {
    return { label: 'In Progress', key: 'in-progress', icon: '⚡' }
  }
  if (s === 'rejected' || s === 'declined' || s === 'cancelled') {
    return { label: 'Rejected', key: 'rejected', icon: '✕' }
  }
  return { label: 'Pending', key: 'pending', icon: '⏳' }
}

function IssueStatusBadge({ status, size = 'normal' }) {
  const { label, key, icon } = normalizeStatus(status)

  return (
    <span className={`cz-status-badge cz-status-${key} cz-status-${size}`}>
      <span className="cz-status-dot" aria-hidden="true" />
      <span className="cz-status-icon" aria-hidden="true">{icon}</span>
      <span className="cz-status-label">{label}</span>
    </span>
  )
}

export default IssueStatusBadge
