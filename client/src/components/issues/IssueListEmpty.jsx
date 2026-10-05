import { useNavigate } from 'react-router-dom'

function IssueListEmpty({ onReportClick }) {
  const navigate = useNavigate()

  const handleReport = () => {
    if (onReportClick) {
      onReportClick()
    } else {
      navigate('/citizen/report')
    }
  }

  return (
    <div className="cz-issues-empty" id="my-issues-empty-state">
      <div className="cz-empty-orbit" aria-hidden="true">
        <div className="cz-empty-orbit-ring" />
        <div className="cz-empty-orbit-ring" />
        <div className="cz-empty-orbit-core">📭</div>
      </div>

      <h3 className="cz-empty-heading">You haven't reported any issues yet</h3>
      <p className="cz-empty-desc">
        When you submit a civic problem like potholes, broken streetlights, or waste management issues,
        you'll be able to track every update from dispatch to full resolution right here.
      </p>

      <div className="cz-empty-actions">
        <button
          id="empty-report-issue-btn"
          type="button"
          className="cz-btn-primary"
          onClick={handleReport}
        >
          📷 Report Your First Issue
        </button>
        <button
          id="empty-back-dashboard-btn"
          type="button"
          className="cz-btn-secondary"
          onClick={() => navigate('/citizen')}
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  )
}

export default IssueListEmpty
