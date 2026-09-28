export const getRoleDashboardPath = (role) => {
  switch (role) {
    case 'CITIZEN':
      return '/citizen'
    case 'ADMIN':
      return '/admin'
    case 'SUPERVISOR':
      return '/supervisor'
    case 'FIELD_TEAM':
      return '/field-team'
    default:
      return '/login'
  }
}
