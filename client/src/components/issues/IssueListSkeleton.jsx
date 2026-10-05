function IssueListSkeleton({ count = 6 }) {
  const items = Array.from({ length: count }, (_, i) => i)

  return (
    <div className="cz-issues-grid cz-skeleton-grid" aria-label="Loading issues...">
      {items.map((key) => (
        <div key={key} className="cz-issue-card cz-skeleton-card">
          <div className="cz-skeleton-thumb cz-shimmer" />
          <div className="cz-issue-content">
            <div className="cz-skeleton-row">
              <div className="cz-skeleton-badge cz-shimmer" />
              <div className="cz-skeleton-text-sm cz-shimmer" />
            </div>
            <div className="cz-skeleton-title cz-shimmer" />
            <div className="cz-skeleton-title-short cz-shimmer" />
            <div className="cz-skeleton-footer cz-shimmer" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default IssueListSkeleton
