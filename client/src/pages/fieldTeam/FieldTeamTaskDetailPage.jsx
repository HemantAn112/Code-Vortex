import { useParams } from 'react-router-dom'
import PlaceholderPage from '../../components/PlaceholderPage'

function FieldTeamTaskDetailPage() {
  const { id } = useParams()
  return <PlaceholderPage role="Field Team" title={`Task ${id}`} />
}

export default FieldTeamTaskDetailPage
