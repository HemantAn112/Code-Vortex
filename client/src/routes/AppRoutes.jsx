import { Navigate, Route, Routes } from 'react-router-dom'
import AuthLayout from '../layouts/AuthLayout'
import AppLayout from '../layouts/AppLayout'
import ProtectedRoute from './ProtectedRoute'
import RoleRoute from './RoleRoute'
import LoginPage from '../pages/auth/LoginPage'
import RegisterPage from '../pages/auth/RegisterPage'
import CitizenDashboard from '../pages/citizen/CitizenDashboard'
import ReportIssuePage from '../pages/citizen/ReportIssuePage'
import CitizenIssuesPage from '../pages/citizen/CitizenIssuesPage'
import CitizenIssueDetailPage from '../pages/citizen/CitizenIssueDetailPage'
import AdminDashboard from '../pages/admin/AdminDashboard'
import AdminIssuesPage from '../pages/admin/AdminIssuesPage'
import AdminIssueDetailPage from '../pages/admin/AdminIssueDetailPage'
import AdminAnalyticsPage from '../pages/admin/AdminAnalyticsPage'
import SupervisorDashboard from '../pages/supervisor/SupervisorDashboard'
import SupervisorIssuesPage from '../pages/supervisor/SupervisorIssuesPage'
import SupervisorTeamsPage from '../pages/supervisor/SupervisorTeamsPage'
import FieldTeamDashboard from '../pages/fieldTeam/FieldTeamDashboard'
import FieldTeamTasksPage from '../pages/fieldTeam/FieldTeamTasksPage'
import FieldTeamTaskDetailPage from '../pages/fieldTeam/FieldTeamTaskDetailPage'

function AppRoutes() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<RoleRoute allowedRoles={['CITIZEN']} />}>
          <Route element={<AppLayout role="Citizen" />}>
            <Route path="/citizen" element={<CitizenDashboard />} />
            <Route path="/citizen/report" element={<ReportIssuePage />} />
            <Route path="/citizen/issues" element={<CitizenIssuesPage />} />
            <Route path="/citizen/issues/:id" element={<CitizenIssueDetailPage />} />
          </Route>
        </Route>

        <Route element={<RoleRoute allowedRoles={['ADMIN']} />}>
          <Route element={<AppLayout role="Admin" />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/issues" element={<AdminIssuesPage />} />
            <Route path="/admin/issues/:id" element={<AdminIssueDetailPage />} />
            <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
          </Route>
        </Route>

        <Route element={<RoleRoute allowedRoles={['SUPERVISOR']} />}>
          <Route element={<AppLayout role="Supervisor" />}>
            <Route path="/supervisor" element={<SupervisorDashboard />} />
            <Route path="/supervisor/issues" element={<SupervisorIssuesPage />} />
            <Route path="/supervisor/teams" element={<SupervisorTeamsPage />} />
          </Route>
        </Route>

        <Route element={<RoleRoute allowedRoles={['FIELD_TEAM']} />}>
          <Route element={<AppLayout role="Field Team" />}>
            <Route path="/field-team" element={<FieldTeamDashboard />} />
            <Route path="/field-team/tasks" element={<FieldTeamTasksPage />} />
            <Route path="/field-team/tasks/:id" element={<FieldTeamTaskDetailPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default AppRoutes
