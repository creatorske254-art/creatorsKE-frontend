import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from './AuthContext'

const NotificationContext = createContext(null)

const POLL_INTERVAL_MS = 30_000 // poll every 30 seconds

export function NotificationProvider({ children }) {
  const { isAuthenticated } = useAuth()
  const [unreadCount, setUnreadCount] = useState(0)
  const intervalRef = useRef(null)

  // Fetch unread count from the API
  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated) return
    try {
      // Import lazily to avoid circular deps; service is built in Phase 16
      const { notificationService } = await import(
        '@/features/notifications/services/notification.service'
      )
      const count = await notificationService.getUnreadCount()
      setUnreadCount(count ?? 0)
    } catch {
      // Silently ignore — bell badge just stays at last known value
    }
  }, [isAuthenticated])

  // Start / stop polling based on auth state
  useEffect(() => {
    if (isAuthenticated) {
      fetchUnreadCount()
      intervalRef.current = setInterval(fetchUnreadCount, POLL_INTERVAL_MS)
    } else {
      setUnreadCount(0)
      clearInterval(intervalRef.current)
    }

    return () => clearInterval(intervalRef.current)
  }, [isAuthenticated, fetchUnreadCount])

  const decrementUnread = useCallback((by = 1) => {
    setUnreadCount((prev) => Math.max(0, prev - by))
  }, [])

  const clearUnread = useCallback(() => {
    setUnreadCount(0)
  }, [])

  return (
    <NotificationContext.Provider
      value={{ unreadCount, decrementUnread, clearUnread, refetch: fetchUnreadCount }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const ctx = useContext(NotificationContext)
  if (!ctx) {
    throw new Error('useNotifications must be used inside <NotificationProvider>')
  }
  return ctx
}

export default NotificationContext
