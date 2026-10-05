import api from './api'

/**
 * Issue Service Boundary for CivicFlow.
 * Handles fetching citizen-reported civic issues.
 *
 * Current Backend Status:
 * The endpoint `GET /api/issues/my` is pending server-side implementation.
 * When the server is ready, this service will seamlessly fetch live data.
 * If the endpoint returns 404/501 or is unreachable, an error with
 * `isBackendPending = true` is thrown so the UI renders the pending integration state cleanly.
 */

/**
 * Fetches all civic issues reported by the currently authenticated citizen.
 * @returns {Promise<{ issues: Array }>}
 */
export const getMyIssues = async () => {
  try {
    const response = await api.get('/issues/my')

    // Support flexible backend response structures
    const data = response.data
    const issues = Array.isArray(data)
      ? data
      : Array.isArray(data?.issues)
      ? data.issues
      : Array.isArray(data?.data)
      ? data.data
      : []

    return { issues }
  } catch (error) {
    // If backend route doesn't exist yet (404), or is explicitly not implemented (501),
    // or if the backend server is not connected / network unreachable
    const status = error.response?.status
    const isPending =
      status === 404 ||
      status === 501 ||
      error.code === 'ERR_NETWORK' ||
      !error.response

    if (isPending) {
      const pendingError = new Error(
        'Backend integration pending: GET /api/issues/my is not yet implemented on the server.'
      )
      pendingError.isBackendPending = true
      pendingError.status = status || 501
      throw pendingError
    }

    throw error
  }
}

/**
 * Fetches a single issue by its ID.
 * @param {string|number} issueId
 * @returns {Promise<{ issue: Object }>}
 */
export const getIssueById = async (issueId) => {
  try {
    const response = await api.get(`/issues/${issueId}`)
    const issue = response.data?.issue || response.data?.data || response.data
    return { issue }
  } catch (error) {
    const status = error.response?.status
    const isPending =
      status === 404 ||
      status === 501 ||
      error.code === 'ERR_NETWORK' ||
      !error.response

    if (isPending) {
      const pendingError = new Error(
        `Backend integration pending: GET /api/issues/${issueId} is not yet implemented.`
      )
      pendingError.isBackendPending = true
      throw pendingError
    }

    throw error
  }
}

export default {
  getMyIssues,
  getIssueById,
}
