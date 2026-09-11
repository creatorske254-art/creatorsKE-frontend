import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '../services/notification.service';

const NOTIFICATIONS_KEY = ['notifications'];

// Full notification list + mark-read, for NotificationList.jsx.
// For the navbar bell's live unread count, see NotificationContext instead —
// that one polls notificationService.getUnreadCount() independently of this
// list query so the badge updates even on pages that don't mount this hook.
export function useNotifications() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: NOTIFICATIONS_KEY,
    queryFn: () => notificationService.list(),
  });

  const notifications = query.data?.notifications ?? query.data ?? [];
  const unreadCount = notifications.filter((n) => !n.read && !n.isRead).length;

  const markReadMutation = useMutation({
    mutationFn: (ids) => notificationService.markRead(ids),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY }),
  });

  const markAllRead = () => {
    const ids = notifications.filter((n) => !n.read && !n.isRead).map((n) => n.id);
    if (ids.length) markReadMutation.mutate(ids);
  };

  return {
    notifications,
    unreadCount,
    isLoading: query.isLoading,
    markRead: markReadMutation.mutate,
    markAllRead,
  };
}
