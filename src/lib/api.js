import axios from 'axios'

// ─── Create axios instance ─────────────────────────────────────────────────
// The API address is fixed at build time (.env.development / .env.production). Only the dev
// server falls back to the local mock; a production build without it fails loudly.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? 'http://localhost:5000/api' : '')
if (!API_BASE_URL) console.error('VITE_API_BASE_URL is not set; API requests will fail.') // eslint-disable-line no-console

const apiClient = axios.create({
  baseURL: API_BASE_URL,
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

// ─── Authenticated files ──────────────────────────────────────────────────
// Invoices and data exports need the bearer token, which must never go in a URL (it would end
// up in browser history and server logs). These fetch the file with the header and hand the
// browser a temporary blob URL instead.

// Error bodies arrive as a Blob when responseType is 'blob'; read the server's message out of it.
const blobError = async (err) => {
  if (err?.data instanceof Blob) {
    try { const body = JSON.parse(await err.data.text()); return { ...err, message: body?.message || err.message } } catch { /* not JSON */ }
  }
  return err
}

/** Opens an authenticated document (an invoice) in a new tab. Call it from a click handler. */
export const openAuthenticated = async (path) => {
  const tab = window.open('', '_blank') // opened during the click so popup blockers allow it
  try {
    const res = await apiClient.get(path, { responseType: 'blob' })
    const url = URL.createObjectURL(res.data)
    if (tab) { tab.opener = null; tab.location.href = url } else window.location.assign(url)
    setTimeout(() => URL.revokeObjectURL(url), 60_000)
  } catch (err) {
    tab?.close()
    throw await blobError(err)
  }
}

/** Downloads an authenticated file (a data export) under the given name. */
export const downloadAuthenticated = async (path, filename) => {
  try {
    const res = await apiClient.get(path, { responseType: 'blob' })
    const url = URL.createObjectURL(res.data)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    setTimeout(() => URL.revokeObjectURL(url), 60_000)
  } catch (err) {
    throw await blobError(err)
  }
}

export default apiClient
