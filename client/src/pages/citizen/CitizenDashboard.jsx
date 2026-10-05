import { useState, useRef, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import CitizenNavbar from '../../components/citizen/CitizenNavbar'
import './CitizenDashboard.css'

// ── Mock statistics ───────────────────────────────────────────
// TODO: Replace MOCK_STATS with real API call when Issue API is ready.
// Pattern to follow:
//   const [stats, setStats] = useState(MOCK_STATS)
//   useEffect(() => { api.get('/issues/stats').then(r => setStats(r.data)) }, [])
const MOCK_STATS = { total: 0, active: 0, resolved: 0 }

const STAT_CONFIG = [
  {
    id: 'stat-total',
    label: 'Total Reports',
    key: 'total',
    icon: '📋',
    note: 'All time submissions',
    line: 'linear-gradient(90deg, #0e7c7b, #22d3ee)',
    glow: 'rgba(14, 124, 123, 0.15)',
    iconBg: 'rgba(20, 184, 166, 0.15)',
  },
  {
    id: 'stat-active',
    label: 'Active Reports',
    key: 'active',
    icon: '⚡',
    note: 'Being worked on',
    line: 'linear-gradient(90deg, #f59e0b, #fbbf24)',
    glow: 'rgba(245, 158, 11, 0.12)',
    iconBg: 'rgba(245, 158, 11, 0.15)',
  },
  {
    id: 'stat-resolved',
    label: 'Resolved',
    key: 'resolved',
    icon: '✓',
    note: 'Successfully closed',
    line: 'linear-gradient(90deg, #22c55e, #4ade80)',
    glow: 'rgba(34, 197, 94, 0.12)',
    iconBg: 'rgba(34, 197, 94, 0.15)',
  },
]

// ── How It Works steps ────────────────────────────────────────
const STEPS = [
  {
    num: '01',
    icon: '📸',
    title: 'Capture',
    desc: 'Take a photo of the civic issue — a pothole, broken streetlight, overflow drain, or anything affecting your community.',
  },
  {
    num: '02',
    icon: '📍',
    title: 'Locate',
    desc: 'Share the exact location of the problem so field teams can find and address it quickly.',
  },
  {
    num: '03',
    icon: '📡',
    title: 'Track',
    desc: 'Follow the status of your report in real time — from submitted to in-progress to resolved.',
  },
]

// ══════════════════════════════════════════════════════════════
// QuickReport — camera / upload / location / preview
// ══════════════════════════════════════════════════════════════
function QuickReport() {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const fileInputRef = useRef(null)
  const streamRef = useRef(null)

  const [cameraOpen, setCameraOpen] = useState(false)
  const [cameraError, setCameraError] = useState('')
  const [imagePreview, setImagePreview] = useState(null) // data-URL or object URL
  const [location, setLocation] = useState(null)         // { lat, lng, label }
  const [locationError, setLocationError] = useState('')
  const [locLoading, setLocLoading] = useState(false)
  const [description, setDescription] = useState('')

  // ── Camera ─────────────────────────────────────────────────
  const openCamera = useCallback(async () => {
    setCameraError('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 } },
        audio: false,
      })
      streamRef.current = stream
      setCameraOpen(true)
      // Assign stream after state update so video element is mounted
    } catch (err) {
      const msg =
        err.name === 'NotAllowedError'
          ? 'Camera access denied. Please allow camera permission in your browser settings.'
          : err.name === 'NotFoundError'
          ? 'No camera found on this device.'
          : 'Could not access camera. Please try using file upload instead.'
      setCameraError(msg)
    }
  }, [])

  // Attach stream to video element once camera is open
  useEffect(() => {
    if (cameraOpen && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current
    }
  }, [cameraOpen])

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    setCameraOpen(false)
  }, [])

  const capturePhoto = useCallback(() => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return
    canvas.width = video.videoWidth || 1280
    canvas.height = video.videoHeight || 720
    canvas.getContext('2d').drawImage(video, 0, 0)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.88)
    setImagePreview(dataUrl)
    stopCamera()
  }, [stopCamera])

  // Cleanup stream on unmount
  useEffect(() => () => { stopCamera() }, [stopCamera])

  // ── File upload ─────────────────────────────────────────────
  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setImagePreview(url)
    stopCamera()
    e.target.value = ''
  }

  const removeImage = () => {
    if (imagePreview && imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview)
    }
    setImagePreview(null)
  }

  // ── Location ────────────────────────────────────────────────
  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.')
      return
    }
    setLocLoading(true)
    setLocationError('')
    setLocation(null)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords
        setLocation({
          lat: lat.toFixed(5),
          lng: lng.toFixed(5),
          label: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
        })
        setLocLoading(false)
      },
      (err) => {
        const msg =
          err.code === 1
            ? 'Location access denied. Please allow location permission.'
            : 'Could not determine your location. Try again.'
        setLocationError(msg)
        setLocLoading(false)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  return (
    <div className="cz-report-card">
      <div className="cz-report-header">
        <h3 className="cz-report-title">Report a Civic Issue</h3>
        <p className="cz-report-sub">
          See a problem? Capture it and report it in seconds.
        </p>
      </div>

      {/* Hidden canvas for photo capture */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      {/* ── Camera error / permission denial ── */}
      {cameraError && (
        <div className="cz-permission-notice" role="alert">
          <span>⚠️</span>
          <span>{cameraError}</span>
        </div>
      )}

      {/* ── Live camera preview ── */}
      {cameraOpen && (
        <div className="cz-camera-area">
          <video
            ref={videoRef}
            className="cz-camera-video"
            autoPlay
            playsInline
            muted
          />
          <div className="cz-camera-overlay">
            <div className="cz-camera-controls">
              <button
                id="camera-cancel-btn"
                type="button"
                className="cz-camera-cancel-btn"
                onClick={stopCamera}
              >
                Cancel
              </button>
              <button
                id="camera-capture-btn"
                type="button"
                className="cz-capture-shot-btn"
                onClick={capturePhoto}
                aria-label="Take photo"
              >
                📷
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Capture action row (only when camera not open) ── */}
      {!cameraOpen && (
        <div className="cz-capture-row">
          <button
            id="open-camera-btn"
            type="button"
            className="cz-capture-btn"
            onClick={openCamera}
            disabled={!!imagePreview}
          >
            <span className="cz-capture-btn-icon">📷</span>
            Open Camera
          </button>
          <button
            id="upload-photo-btn"
            type="button"
            className="cz-capture-btn"
            onClick={() => fileInputRef.current?.click()}
            disabled={!!imagePreview}
          >
            <span className="cz-capture-btn-icon">📁</span>
            Upload Photo
          </button>
          <button
            id="use-location-btn"
            type="button"
            className="cz-capture-btn"
            onClick={requestLocation}
            disabled={locLoading}
          >
            <span className="cz-capture-btn-icon">📍</span>
            {locLoading ? 'Locating…' : 'Use My Location'}
          </button>
        </div>
      )}

      {/* ── Image preview ── */}
      {imagePreview && (
        <div className="cz-preview-area">
          <p className="cz-preview-label">Photo preview</p>
          <div className="cz-preview-wrapper">
            <img
              src={imagePreview}
              alt="Issue preview"
              className="cz-preview-img"
            />
            <button
              id="remove-photo-btn"
              type="button"
              className="cz-preview-remove"
              onClick={removeImage}
              aria-label="Remove photo"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* ── Location status ── */}
      {location && (
        <div className="cz-location-status" role="status">
          <span className="cz-location-dot" />
          Location captured — {location.label}
        </div>
      )}
      {locationError && (
        <div className="cz-location-status error" role="alert">
          <span className="cz-location-dot error" />
          {locationError}
        </div>
      )}

      {/* ── Description ── */}
      <textarea
        id="issue-description"
        className="cz-desc-field"
        placeholder="Describe the issue — type, severity, any other details…"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={3}
      />

      {/* ── Submit row ── */}
      <div className="cz-report-submit-row">
        <button
          id="submit-report-btn"
          type="button"
          className="cz-btn-primary"
          style={{ fontSize: '14px', padding: '12px 24px' }}
          onClick={() => {
            /* TODO: Wire to POST /issues when API is ready.
               Data to send: { image: imagePreview, location, description }
               For now this is a UI placeholder — do not fake a submission. */
            alert('Backend submission not implemented yet. This button will submit the report once the Issue API is connected.')
          }}
        >
          Continue to Submit
        </button>
        <span className="cz-placeholder-note">
          ⚠️ Backend not connected — submission is a placeholder
        </span>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// CitizenDashboard (main page)
// ══════════════════════════════════════════════════════════════
function CitizenDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const scrollToReport = () => {
    document.getElementById('quick-report-section')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="cd-root">
      {/* ── Navbar ──────────────────────────────────────────── */}
      <CitizenNavbar user={user} onLogout={handleLogout} />

      {/* ── Hero ────────────────────────────────────────────── */}
      <section className="cz-hero" aria-label="Hero">
        <div className="cz-hero-bg" aria-hidden="true" />

        <div className="cz-hero-content">
          <div className="cz-hero-badge">
            <span className="cz-hero-badge-dot" aria-hidden="true" />
            CivicFlow Citizen Portal
          </div>

          <h1>
            Your City.<br />
            <span className="cz-hero-highlight">Your Voice.</span>
          </h1>

          <p className="cz-hero-sub">
            Report civic problems, track their progress, and help make your
            community better — one issue at a time.
          </p>

          <div className="cz-hero-cta-row">
            <button
              id="hero-report-btn"
              type="button"
              className="cz-btn-primary"
              onClick={scrollToReport}
            >
              📷 Report an Issue
            </button>
            <button
              id="hero-issues-btn"
              type="button"
              className="cz-btn-secondary"
              onClick={() => navigate('/my-issues')}
            >
              View My Issues
            </button>
          </div>
        </div>

        {/* Curved wave transition */}
        <div className="cz-wave" aria-hidden="true">
          <svg viewBox="0 0 1440 80" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M0,40 C240,80 480,0 720,40 C960,80 1200,0 1440,40 L1440,80 L0,80 Z"
              fill="#0a1628"
            />
          </svg>
        </div>
      </section>

      {/* ── Page body ───────────────────────────────────────── */}
      <div className="cz-body">

        {/* ── Statistics ──────────────────────────────────── */}
        <section className="cz-section" aria-label="Issue statistics" id="stats-section">
          <p className="cz-section-eyebrow">Your activity</p>
          <h2 className="cz-section-title">Issue Overview</h2>
          <p className="cz-section-sub">
            A summary of your civic reports and their current status.
          </p>
          <div className="cz-stats-row">
            {STAT_CONFIG.map((s) => (
              <div
                key={s.id}
                id={s.id}
                className="cz-stat-card"
                style={{
                  '--cz-stat-line': s.line,
                  '--cz-stat-glow': s.glow,
                  '--cz-stat-icon-bg': s.iconBg,
                }}
              >
                <div className="cz-stat-label">
                  <span className="cz-stat-icon" aria-hidden="true">{s.icon}</span>
                  {s.label}
                </div>
                <div className="cz-stat-value">{MOCK_STATS[s.key]}</div>
                <div className="cz-stat-note">{s.note}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Quick Report ─────────────────────────────────── */}
        <section className="cz-section" id="quick-report-section" aria-label="Quick report">
          <p className="cz-section-eyebrow">Report now</p>
          <h2 className="cz-section-title">See a Problem?</h2>
          <p className="cz-section-sub">
            Capture it and report it in seconds. We handle the rest.
          </p>
          <QuickReport />
        </section>

        {/* ── How It Works ─────────────────────────────────── */}
        <section className="cz-section" aria-label="How reporting works" id="how-it-works">
          <p className="cz-section-eyebrow">How it works</p>
          <h2 className="cz-section-title">Report in 3 Simple Steps</h2>
          <p className="cz-section-sub">
            From spotting an issue to seeing it resolved.
          </p>
          <div className="cz-steps-grid">
            {STEPS.map((step) => (
              <div key={step.num} className="cz-step-card">
                <div className="cz-step-number">{step.num}</div>
                <div className="cz-step-icon-ring" aria-hidden="true">
                  {step.icon}
                </div>
                <h3 className="cz-step-title">{step.title}</h3>
                <p className="cz-step-desc">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Recent Reports ───────────────────────────────── */}
        <section className="cz-section" aria-label="Recent reports" id="recent-reports">
          <div className="cz-recent-header">
            <div className="cz-recent-header-left">
              <p className="cz-section-eyebrow" style={{ margin: 0 }}>Activity</p>
              <h2 className="cz-section-title" style={{ marginBottom: 0 }}>Recent Reports</h2>
            </div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                id="recent-view-my-issues-btn"
                type="button"
                className="cz-btn-secondary"
                style={{ fontSize: '13px', padding: '9px 18px' }}
                onClick={() => navigate('/my-issues')}
              >
                📋 View All My Issues
              </button>
              <button
                id="recent-new-report-btn"
                type="button"
                className="cz-btn-teal-outline"
                onClick={scrollToReport}
              >
                + New Report
              </button>
            </div>
          </div>

          {/* ── My Issues Prominent Dashboard Entry Point ──── */}
          <div className="cz-my-issues-dashboard-card" id="dashboard-my-issues-entry">
            <div className="cz-dashboard-card-info">
              <div className="cz-dashboard-card-tag">
                <span aria-hidden="true">📋</span>
                <span>Citizen Tracking</span>
              </div>
              <h3 className="cz-dashboard-card-title">Manage & Track Your Reported Issues</h3>
              <p className="cz-dashboard-card-desc">
                View all civic issues you have reported, inspect field team assignments, and follow resolution milestones in real time.
              </p>
            </div>
            <button
              id="dashboard-open-my-issues-btn"
              type="button"
              className="cz-btn-primary"
              style={{ fontSize: '14px', padding: '12px 22px' }}
              onClick={() => navigate('/my-issues')}
            >
              Open My Issues →
            </button>
          </div>

          {/* Empty state — replace this block with issue list cards once API is ready */}
          <div className="cz-empty" id="citizen-empty-state">
            <div className="cz-empty-orbit" aria-hidden="true">
              <div className="cz-empty-orbit-ring" />
              <div className="cz-empty-orbit-ring" />
              <div className="cz-empty-orbit-core">📭</div>
            </div>
            <h3>No reports yet</h3>
            <p>
              Your reported civic issues will appear here. Submit your first
              report above and start making a difference.
            </p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '8px' }}>
              <button
                id="empty-state-report-btn"
                type="button"
                className="cz-btn-primary"
                style={{ fontSize: '14px', padding: '12px 24px' }}
                onClick={scrollToReport}
              >
                Make Your First Report
              </button>
              <button
                id="empty-state-view-issues-btn"
                type="button"
                className="cz-btn-secondary"
                style={{ fontSize: '14px', padding: '12px 24px' }}
                onClick={() => navigate('/my-issues')}
              >
                Go to My Issues
              </button>
            </div>
          </div>
        </section>

      </div>
    </div>
  )
}

export default CitizenDashboard


