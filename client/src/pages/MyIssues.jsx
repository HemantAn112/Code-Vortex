import { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import CitizenNavbar from '../components/citizen/CitizenNavbar'
import IssueCard from '../components/issues/IssueCard'
import IssueListEmpty from '../components/issues/IssueListEmpty'
import IssueListSkeleton from '../components/issues/IssueListSkeleton'
import IssueDetailModal from '../components/issues/IssueDetailModal'
import { getMyIssues } from '../services/issueService'
import './citizen/MyIssues.css'

function MyIssues() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  // State management
  const [issues, setIssues] = useState([])
  const [pageState, setPageState] = useState('loading') // 'loading' | 'backend_pending' | 'empty' | 'error' | 'success'
  const [errorMessage, setErrorMessage] = useState('')
  const [selectedIssue, setSelectedIssue] = useState(null)

  // Filters & sorting
  const [activeTab, setActiveTab] = useState('ALL') // 'ALL' | 'PENDING' | 'IN_PROGRESS' | 'RESOLVED'
  const [searchQuery, setSearchQuery] = useState('')
  const [sortOrder, setSortOrder] = useState('newest') // 'newest' | 'oldest'

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const fetchIssues = useCallback(async () => {
    setPageState('loading')
    setErrorMessage('')

    try {
      const result = await getMyIssues()
      const data = result?.issues || []

      if (!Array.isArray(data) || data.length === 0) {
        setIssues([])
        setPageState('empty')
      } else {
        setIssues(data)
        setPageState('success')
      }
    } catch (err) {
      if (err.isBackendPending) {
        setPageState('backend_pending')
        setErrorMessage(err.message)
      } else {
        setPageState('error')
        setErrorMessage(
          err.response?.data?.message ||
          err.message ||
          'Failed to load your reported issues. Please check your connection and try again.'
        )
      }
    }
  }, [])

  useEffect(() => {
    fetchIssues()
  }, [fetchIssues])

  // Count by status
  const counts = useMemo(() => {
    const res = { all: issues.length, pending: 0, inProgress: 0, resolved: 0 }
    issues.forEach((item) => {
      const s = String(item.status || '').toLowerCase().replace(/[_\s-]+/g, '')
      if (s === 'resolved' || s === 'completed' || s === 'closed') {
        res.resolved += 1
      } else if (s === 'inprogress' || s === 'working' || s === 'assigned') {
        res.inProgress += 1
      } else {
        res.pending += 1
      }
    })
    return res
  }, [issues])

  // Filtered and sorted list
  const visibleIssues = useMemo(() => {
    let list = [...issues]

    // Tab filter
    if (activeTab !== 'ALL') {
      list = list.filter((item) => {
        const s = String(item.status || '').toLowerCase().replace(/[_\s-]+/g, '')
        if (activeTab === 'RESOLVED') {
          return s === 'resolved' || s === 'completed' || s === 'closed'
        }
        if (activeTab === 'IN_PROGRESS') {
          return s === 'inprogress' || s === 'working' || s === 'assigned'
        }
        if (activeTab === 'PENDING') {
          return s !== 'resolved' && s !== 'completed' && s !== 'closed' && s !== 'inprogress' && s !== 'working' && s !== 'assigned'
        }
        return true
      })
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      list = list.filter((item) => {
        const desc = (item.description || item.title || '').toLowerCase()
        const cat = (item.category || '').toLowerCase()
        const loc = typeof item.location === 'string'
          ? item.location.toLowerCase()
          : (item.location?.area || item.location?.address || '').toLowerCase()
        return desc.includes(q) || cat.includes(q) || loc.includes(q)
      })
    }

    // Sort: newest first or oldest first
    list.sort((a, b) => {
      const dateA = new Date(a.createdAt || a.dateReported || a.date || 0).getTime()
      const dateB = new Date(b.createdAt || b.dateReported || b.date || 0).getTime()
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB
    })

    return list
  }, [issues, activeTab, searchQuery, sortOrder])

  return (
    <div className="cz-my-issues-page">
      {/* ── Top Navigation Bar ──────────────────────────────── */}
      <CitizenNavbar user={user} onLogout={handleLogout} />

      <main className="cz-issues-container">
        {/* ── Topbar (Back + Report CTA) ────────────────────── */}
        <div className="cz-issues-topbar">
          <button
            id="back-to-dashboard-btn"
            type="button"
            className="cz-back-btn"
            onClick={() => navigate('/citizen')}
          >
            ← Back to Dashboard
          </button>

          <div className="cz-issues-topbar-actions">
            <button
              id="report-new-issue-btn"
              type="button"
              className="cz-btn-primary"
              onClick={() => navigate('/citizen/report')}
            >
              📷 Report New Issue
            </button>
          </div>
        </div>

        {/* ── Header ─────────────────────────────────────────── */}
        <header className="cz-issues-header">
          <div className="cz-issues-eyebrow">
            <span aria-hidden="true">📋</span>
            <span>Citizen Portal</span>
          </div>
          <h1 className="cz-issues-title">My Issues</h1>
          <p className="cz-issues-sub">
            All civic issues you have reported. Track resolution progress and field assignments.
          </p>
        </header>

        {/* ── Main Content by State ───────────────────────────── */}

        {/* 1. LOADING STATE */}
        {pageState === 'loading' && <IssueListSkeleton count={6} />}

        {/* 2. BACKEND PENDING STATE */}
        {pageState === 'backend_pending' && (
          <div className="cz-backend-pending-card" role="region" aria-label="Backend Integration Status">
            <div className="cz-pending-icon-wrap" aria-hidden="true">
              🔌
            </div>

            <div className="cz-pending-badge">
              <span aria-hidden="true">⚡</span>
              Backend Integration Pending
            </div>

            <h2 className="cz-pending-title">Issue Tracking Service Connected</h2>
            <p className="cz-pending-desc">
              The citizen-side service boundary is configured and ready. The server endpoint
              is pending backend deployment. As soon as the backend route is published, your
              reported issues will automatically render here.
            </p>

            <div className="cz-pending-endpoint-box">
              <span className="cz-endpoint-label">Configured Service Endpoint</span>
              <code className="cz-endpoint-code">GET /api/issues/my</code>
            </div>

            <div className="cz-pending-actions">
              <button
                id="pending-retry-btn"
                type="button"
                className="cz-btn-secondary"
                onClick={fetchIssues}
              >
                🔄 Check Connection Again
              </button>
              <button
                id="pending-report-btn"
                type="button"
                className="cz-btn-primary"
                onClick={() => navigate('/citizen/report')}
              >
                📷 Report New Issue
              </button>
              <button
                id="pending-back-btn"
                type="button"
                className="cz-btn-secondary"
                onClick={() => navigate('/citizen')}
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        )}

        {/* 3. ERROR STATE */}
        {pageState === 'error' && (
          <div className="cz-error-card" role="alert">
            <div className="cz-error-icon" aria-hidden="true">⚠️</div>
            <h2 className="cz-error-title">Unable to Load Issues</h2>
            <p className="cz-error-desc">{errorMessage}</p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                id="error-retry-btn"
                type="button"
                className="cz-btn-primary"
                onClick={fetchIssues}
              >
                Try Again
              </button>
              <button
                id="error-back-btn"
                type="button"
                className="cz-btn-secondary"
                onClick={() => navigate('/citizen')}
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        )}

        {/* 4. EMPTY STATE */}
        {pageState === 'empty' && (
          <IssueListEmpty onReportClick={() => navigate('/citizen/report')} />
        )}

        {/* 5. SUCCESS STATE */}
        {pageState === 'success' && (
          <>
            {/* Filter Tabs & Search Row */}
            <div className="cz-issues-controls-row">
              <div className="cz-filter-tabs" role="tablist" aria-label="Issue status filters">
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'ALL'}
                  className={`cz-filter-tab${activeTab === 'ALL' ? ' active' : ''}`}
                  onClick={() => setActiveTab('ALL')}
                >
                  All
                  <span className="cz-filter-count">{counts.all}</span>
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'PENDING'}
                  className={`cz-filter-tab${activeTab === 'PENDING' ? ' active' : ''}`}
                  onClick={() => setActiveTab('PENDING')}
                >
                  Pending
                  <span className="cz-filter-count">{counts.pending}</span>
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'IN_PROGRESS'}
                  className={`cz-filter-tab${activeTab === 'IN_PROGRESS' ? ' active' : ''}`}
                  onClick={() => setActiveTab('IN_PROGRESS')}
                >
                  In Progress
                  <span className="cz-filter-count">{counts.inProgress}</span>
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'RESOLVED'}
                  className={`cz-filter-tab${activeTab === 'RESOLVED' ? ' active' : ''}`}
                  onClick={() => setActiveTab('RESOLVED')}
                >
                  Resolved
                  <span className="cz-filter-count">{counts.resolved}</span>
                </button>
              </div>

              <div className="cz-controls-right">
                <div className="cz-search-input-wrap">
                  <span className="cz-search-icon" aria-hidden="true">🔍</span>
                  <input
                    id="search-issues-input"
                    type="text"
                    className="cz-search-input"
                    placeholder="Search by description or category…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <select
                  id="sort-issues-select"
                  className="cz-sort-select"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  aria-label="Sort issues order"
                >
                  <option value="newest">Newest first</option>
                  <option value="oldest">Oldest first</option>
                </select>
              </div>
            </div>

            {/* If tab/search returned 0 items */}
            {visibleIssues.length === 0 ? (
              <div className="cz-issues-empty" style={{ margin: '40px auto' }}>
                <div className="cz-empty-orbit" aria-hidden="true">
                  <div className="cz-empty-orbit-core">🔍</div>
                </div>
                <h3 className="cz-empty-heading">No matching issues found</h3>
                <p className="cz-empty-desc">
                  No reported issues matched your current search or status filter. Try selecting "All" or clearing the search text.
                </p>
                <button
                  type="button"
                  className="cz-btn-secondary"
                  onClick={() => {
                    setActiveTab('ALL')
                    setSearchQuery('')
                  }}
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="cz-issues-grid" id="my-issues-grid">
                {visibleIssues.map((issue) => (
                  <IssueCard
                    key={issue._id || issue.id || issue.createdAt}
                    issue={issue}
                    onSelect={(selected) => setSelectedIssue(selected)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* ── Issue Detail Modal ───────────────────────────────── */}
      {selectedIssue && (
        <IssueDetailModal
          issue={selectedIssue}
          onClose={() => setSelectedIssue(null)}
        />
      )}
    </div>
  )
}

export default MyIssues
