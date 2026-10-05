import { useEffect } from 'react'
import IssueStatusBadge from './IssueStatusBadge'

function formatCategory(category) {
  if (!category) return { label: 'General Civic', icon: '📌' }
  const c = String(category).toLowerCase()
  if (c.includes('road') || c.includes('pothole')) return { label: 'Roads & Pavement', icon: '🛣️' }
  if (c.includes('light') || c.includes('lamp') || c.includes('electric')) return { label: 'Street Lighting', icon: '💡' }
  if (c.includes('sanitat') || c.includes('garbage') || c.includes('waste') || c.includes('trash')) return { label: 'Sanitation', icon: '🗑️' }
  if (c.includes('water') || c.includes('drain') || c.includes('sewage') || c.includes('pipe')) return { label: 'Water & Drainage', icon: '🚰' }
  if (c.includes('traffic') || c.includes('sign') || c.includes('signal')) return { label: 'Traffic & Signage', icon: '🚦' }
  if (c.includes('park') || c.includes('tree') || c.includes('garden')) return { label: 'Parks & Greenery', icon: '🌳' }
  if (c.includes('safe') || c.includes('hazard') || c.includes('security')) return { label: 'Public Safety', icon: '🛡️' }
  return { label: category, icon: '📌' }
}

function formatDate(dateValue) {
  if (!dateValue) return 'Recently reported'
  try {
    const d = new Date(dateValue)
    if (isNaN(d.getTime())) return 'Recently reported'
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  } catch {
    return 'Recently reported'
  }
}

function getGeneralLocation(location) {
  if (!location) return 'Local Ward / Area'

  if (typeof location === 'string') {
    if (/^-?\d+\.\d+[\s,]+-?\d+\.\d+$/.test(location.trim())) {
      return 'Reported Area (GPS Verified Vicinity)'
    }
    return location
  }

  if (typeof location === 'object') {
    if (location.area) return location.area
    if (location.address) return location.address
    if (location.neighborhood) return location.neighborhood
    if (location.landmark) return location.landmark
    if (location.city) return location.city
    return 'Reported Area (GPS Verified Vicinity)'
  }

  return 'Local Ward / Area'
}

function IssueDetailModal({ issue, onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [onClose])

  if (!issue) return null

  const categoryInfo = formatCategory(issue.category)
  const dateFormatted = formatDate(issue.createdAt || issue.dateReported || issue.date)
  const locationSummary = getGeneralLocation(issue.location)
  const imageUrl = issue.imageUrl || issue.image || issue.photo || issue.thumbnail

  return (
    <div
      className="cz-modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-issue-title"
    >
      <div
        className="cz-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="cz-modal-close-btn"
          onClick={onClose}
          aria-label="Close modal"
          type="button"
        >
          ✕
        </button>

        <div className="cz-modal-header">
          <div className="cz-modal-status-row">
            <IssueStatusBadge status={issue.status} />
            <span className="cz-issue-category-tag">
              <span aria-hidden="true">{categoryInfo.icon}</span>
              {categoryInfo.label}
            </span>
          </div>
          <h2 id="modal-issue-title" className="cz-modal-title">
            Issue Report Details
          </h2>
          <p className="cz-modal-sub">
            Reported on {dateFormatted}
          </p>
        </div>

        {imageUrl && (
          <div className="cz-modal-media-wrap">
            <img
              src={imageUrl}
              alt="Reported civic issue"
              className="cz-modal-media-img"
            />
          </div>
        )}

        <div className="cz-modal-body">
          <div className="cz-modal-section">
            <h4 className="cz-modal-label">Description</h4>
            <p className="cz-modal-text">
              {issue.description || issue.title || 'No description provided.'}
            </p>
          </div>

          <div className="cz-modal-grid">
            <div className="cz-modal-field">
              <span className="cz-modal-label">General Location</span>
              <div className="cz-modal-val-location">
                <span aria-hidden="true">📍</span>
                <span>{locationSummary}</span>
              </div>
            </div>

            <div className="cz-modal-field">
              <span className="cz-modal-label">Report ID</span>
              <span className="cz-modal-val-mono">
                {issue._id || issue.id ? `#${String(issue._id || issue.id).slice(-8)}` : 'Submitted'}
              </span>
            </div>
          </div>

          {/* Civic Resolution Lifecycle Note */}
          <div className="cz-modal-lifecycle-banner">
            <span className="cz-lifecycle-icon" aria-hidden="true">ℹ️</span>
            <div>
              <strong>Resolution Lifecycle</strong>
              <p>
                Status changes are updated in real time as our field operations team inspects,
                schedules, and rectifies the reported civic condition.
              </p>
            </div>
          </div>
        </div>

        <div className="cz-modal-footer">
          <button
            type="button"
            className="cz-btn-secondary"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default IssueDetailModal
