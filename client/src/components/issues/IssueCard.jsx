import { useState } from 'react'
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
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  } catch {
    return 'Recently reported'
  }
}

function getGeneralLocation(location) {
  if (!location) return 'Local Ward / Area'

  if (typeof location === 'string') {
    // Hide raw coordinate strings like "12.3456, 78.9012"
    if (/^-?\d+\.\d+[\s,]+-?\d+\.\d+$/.test(location.trim())) {
      return 'Reported Area (GPS Verified)'
    }
    return location
  }

  if (typeof location === 'object') {
    if (location.area) return location.area
    if (location.address) return location.address
    if (location.neighborhood) return location.neighborhood
    if (location.landmark) return location.landmark
    if (location.city) return location.city
    return 'Reported Area (GPS Verified)'
  }

  return 'Local Ward / Area'
}

function IssueCard({ issue, onSelect }) {
  const [imageError, setImageError] = useState(false)
  const categoryInfo = formatCategory(issue.category)
  const dateFormatted = formatDate(issue.createdAt || issue.dateReported || issue.date)
  const locationSummary = getGeneralLocation(issue.location)
  const imageUrl = issue.imageUrl || issue.image || issue.photo || issue.thumbnail

  const descriptionText =
    issue.description ||
    issue.title ||
    'Civic report submitted for review and field assignment.'

  return (
    <article
      className="cz-issue-card"
      onClick={() => onSelect && onSelect(issue)}
      tabIndex={0}
      role="button"
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSelect && onSelect(issue)
        }
      }}
      aria-label={`Issue: ${descriptionText.slice(0, 50)}`}
    >
      {/* Top Image / Media Area */}
      <div className="cz-issue-thumb-wrapper">
        {imageUrl && !imageError ? (
          <img
            src={imageUrl}
            alt={issue.title || 'Reported civic issue'}
            className="cz-issue-thumb"
            onError={() => setImageError(true)}
            loading="lazy"
          />
        ) : (
          <div className="cz-issue-thumb-fallback">
            <span className="cz-fallback-icon" aria-hidden="true">
              {categoryInfo.icon}
            </span>
            <span className="cz-fallback-text">{categoryInfo.label}</span>
          </div>
        )}

        <div className="cz-issue-badge-overlay">
          <IssueStatusBadge status={issue.status} size="small" />
        </div>
      </div>

      {/* Card Content */}
      <div className="cz-issue-content">
        <div className="cz-issue-meta-row">
          <span className="cz-issue-category-tag">
            <span aria-hidden="true">{categoryInfo.icon}</span>
            {categoryInfo.label}
          </span>
          <time className="cz-issue-date">{dateFormatted}</time>
        </div>

        <h3 className="cz-issue-title">
          {descriptionText}
        </h3>

        <div className="cz-issue-footer">
          <div className="cz-issue-location" title={locationSummary}>
            <span className="cz-location-pin" aria-hidden="true">📍</span>
            <span className="cz-location-text">{locationSummary}</span>
          </div>

          <span className="cz-issue-view-action">
            Details →
          </span>
        </div>
      </div>
    </article>
  )
}

export default IssueCard
