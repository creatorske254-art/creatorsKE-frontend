import axios from 'axios'

// ─── Create axios instance ─────────────────────────────────────────────────
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 seconds
})

// ─── Request interceptor — attach JWT ─────────────────────────────────────
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

// ─── Response interceptor — handle errors globally ────────────────────────
apiClient.interceptors.response.use(
  // Success — just pass through
  (response) => response,

  // Error — normalise into a consistent shape
  (error) => {
    const status  = error.response?.status
    const message = error.response?.data?.message
      || error.response?.data?.error
      || error.message
      || 'Something went wrong'

    // 401 — token expired or invalid; clear storage and redirect to login
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
      data: error.response?.data ?? null,
    })
  }
)

// ─── Uploads — shared by any feature that needs to attach a file ──────────
export const uploadFile = (file) => {
  const formData = new FormData()
  formData.append('file', file)
  return apiClient
    .post('/uploads/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((r) => r.data)
}

export const getUpload = (id) => apiClient.get(`/uploads/${id}`).then((r) => r.data)
export const deleteUpload = (id) => apiClient.delete(`/uploads/${id}`).then((r) => r.data)

// ─── System health check ───────────────────────────────────────────────────
export const getHealth = () => apiClient.get('/health').then((r) => r.data)

export default apiClient
