import api from '@/lib/api';

/**
 * In-app notifications for the signed-in user (the same events may also be emailed, per
 * Settings > Notifications).
 *
 * GET    /notifications               -> [{ id, type, title, message, link, read, createdAt }]
 * GET    /notifications/unread-count  -> { count }
 * PATCH  /notifications/mark-read     { ids? }  (no ids marks everything read)
 */
export const notificationService = {
  list: (params) => api.get('/notifications', { params }).then((r) => r.data),

  markRead: (ids) => api.patch('/notifications/mark-read', { ids }).then((r) => r.data),

  // Counted by the server, so it covers every notification, not just the latest page.
  getUnreadCount: () => api.get('/notifications/unread-count').then((r) => Number(r.data?.count ?? 0)),
};
