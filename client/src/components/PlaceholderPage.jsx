function PlaceholderPage({ title, role }) {
  return (
    <main className="placeholder-page">
      <p className="placeholder-role">{role}</p>
      <h1>{title}</h1>
      <p>Placeholder page for CivicFlow Phase 1.</p>
    </main>
  )
}

export default PlaceholderPage
