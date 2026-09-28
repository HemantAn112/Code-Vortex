import { useParams } from 'react-router-dom'
import PlaceholderPage from '../../components/PlaceholderPage'

function AdminIssueDetailPage() {
  const { id } = useParams()
  return <PlaceholderPage role="Admin" title={`Issue ${id}`} />
}

export default AdminIssueDetailPage
