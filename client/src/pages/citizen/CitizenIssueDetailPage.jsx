import { useParams } from 'react-router-dom'
import PlaceholderPage from '../../components/PlaceholderPage'

function CitizenIssueDetailPage() {
  const { id } = useParams()
  return <PlaceholderPage role="Citizen" title={`Issue ${id}`} />
}

export default CitizenIssueDetailPage
