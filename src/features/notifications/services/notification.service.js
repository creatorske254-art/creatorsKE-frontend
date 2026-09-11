import api from '@/lib/api';

export const notificationService = {
  list: (params) => api.get('/notifications', { params }).then((r) => r.data),

  markRead: (ids) => api.patch('/notifications/mark-read', { ids }).then((r) => r.data),

  // No dedicated unread-count endpoint is documented — derive it from the list.
  getUnreadCount: () =>
    api.get('/notifications').then((r) => {
      const list = Array.isArray(r.data) ? r.data : r.data?.notifications ?? [];
      return list.filter((n) => !n.read && !n.isRead).length;
    }),
};
