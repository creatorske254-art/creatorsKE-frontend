import axios from 'axios'

// ─── Create axios instance ─────────────────────────────────────────────────
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 seconds
})

// ─── Request interceptor - attach JWT ─────────────────────────────────────
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('creatorske_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ─── Response interceptor - handle errors globally ────────────────────────
apiClient.interceptors.response.use(
  // Success - the real API wraps every response as
  // { success, status, message, data, ...extras, timestamp } rather than
  // returning the payload directly. Every service in this app was written
  // as api.get(...).then(r => r.data) expecting r.data to already BE the
  // payload (a list, a user, etc.) - so unwrap it here, once, rather than
  // touching every service. Sibling metadata some endpoints add alongside
  // `data` (currently just `pagination`) is preserved on the unwrapped
  // value so nothing that wants it loses access, without disturbing code
  // that treats the result as a plain array/object.
  (response) => {
    const body = response.data
    if (body && typeof body === 'object' && !Array.isArray(body) && 'success' in body && 'data' in body) {
      const payload = body.data
      if (Array.isArray(payload)) {
        response.data = body.pagination ? Object.assign(payload, { pagination: body.pagination }) : payload
      } else if (payload && typeof payload === 'object') {
        response.data = body.pagination ? { ...payload, pagination: body.pagination } : payload
      } else {
        response.data = payload
      }
    }
    return response
  },

  // Error - normalise into a consistent shape
  (error) => {
    const status = error.response?.status
    const body   = error.response?.data
    // Validation errors carry the useful detail in error.errors: [{ field, message }] -
    // the top-level message is just the generic "Validation failed".
    const fieldErrors = body?.error?.errors
    const message = (Array.isArray(fieldErrors) && fieldErrors.length
        ? fieldErrors.map((e) => e.message).join(' ')
        : null)
      || body?.message
      || body?.error?.message
      || body?.error
      || error.message
      || 'Something went wrong'

    // 401 - token expired or invalid; clear storage and redirect to login
    if (status === 401) {
      localStorage.removeItem('creatorske_token')
      localStorage.removeItem('creatorske_user')
      // Use window.location so we don't need react-router here
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }

    // Throw a normalised error object all hooks can rely on
    return Promise.reject({
      status,
      message,
      data: body ?? null,
    })
  }
)

// ─── Uploads - shared by any feature that needs to attach a file ──────────
export const uploadFile = (file) => {
  const formData = new FormData()
  formData.append('file', file)
  return apiClient
    .post('/uploads/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((r) => r.data)
}

export default apiClient
