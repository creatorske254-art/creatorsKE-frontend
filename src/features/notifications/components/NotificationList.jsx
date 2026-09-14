import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useNotifications as useNotificationsList } from '../hooks/useNotifications';
import { useNotifications as useNotificationBadge } from '@/context/NotificationContext';
import { formatRelativeDate } from '@/lib/utils';
import { TYPES } from '../constants/notifications';
import Skeleton from '@/components/ui/Skeleton';
import EmptyState from '@/components/shared/EmptyState';
import { IconBell, IconBellOff, IconCash, IconMail, IconMessageCircle, IconPackage, IconArrowRight } from '@tabler/icons-react';

const TYPE_ICON = {
  [TYPES.NEW_ENQUIRY]: IconMail,
  [TYPES.PAYMENT_CONFIRMED]: IconCash,
  [TYPES.DELIVERY_MARKED]: IconPackage,
  [TYPES.NEW_MESSAGE]: IconMessageCircle,
};

// Dropdown list of recent notifications, opened from the bell button in
// CreatorLayout / BrandLayout / AdminLayout. Each layout owns its own open/
// close state and positioning (same duplication-per-layout convention those
// files already use for the mobile drawer) - this component is just the
// shared panel content.
//
// The API doc doesn't document a notification's exact fields beyond
// read/isRead, so title/message/link are all read defensively with fallbacks
// rather than assumed, same caution CLAUDE.md calls for elsewhere.
export default function NotificationList({ onClose }) {
  const navigate = useNavigate();
  const { role } = useAuth();
  const notificationsHref = `/${role || 'creator'}/notifications`;
  const { notifications, unreadCount, isLoading, markRead, markAllRead } = useNotificationsList();
  const { refetch: refetchBadge } = useNotificationBadge();

  function handleMarkAllRead() {
    markAllRead();
    refetchBadge();
  }

  function handleClickNotification(n) {
    const isUnread = !n.read && !n.isRead;
    if (isUnread) {
      markRead([n.id]);
      refetchBadge();
    }
    const target = n.link || n.actionUrl || n.url;
    if (target) {
      navigate(target);
      onClose?.();
    }
  }

  return (
    <div className="notif-panel">
      <style>{`
        .notif-panel { width: 340px; max-width: calc(100vw - 24px); background: var(--white); border-radius: var(--radius-lg); overflow: hidden; }
        .notif-panel__header { display: flex; align-items: center; justify-content: space-between; padding: var(--space-12) var(--space-16); border-bottom: 0.5px solid var(--grey-100); }
        .notif-panel__title { font-family: var(--font-display); font-size: var(--text-h4-size); font-weight: 600; color: var(--black); }
        .notif-panel__body { max-height: 380px; overflow-y: auto; }
        .notif-item { display: flex; align-items: flex-start; gap: var(--space-12); padding: var(--space-12) var(--space-16); border-bottom: 0.5px solid var(--grey-100); cursor: pointer; transition: background var(--transition-fast); }
        .notif-item:last-child { border-bottom: none; }
        .notif-item:hover { background: var(--page-bg); }
        .notif-item__icon { width: 32px; height: 32px; border-radius: 50%; background: var(--purple-50); color: var(--purple-600); display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 15px; }
        .notif-item__body { flex: 1; min-width: 0; }
        .notif-item__title { font-size: var(--text-body-sm-size); font-weight: 600; color: var(--black); margin-bottom: var(--space-2); }
        .notif-item__message { font-size: var(--text-body-sm-size); color: var(--grey-600); line-height: 1.5; }
        .notif-item__time { font-size: var(--text-caption-size); color: var(--grey-400); margin-top: var(--space-4); }
        .notif-item__dot { width: 7px; height: 7px; border-radius: 50%; background: var(--purple-500); flex-shrink: 0; margin-top: var(--space-8); }
        .notif-panel__footer { border-top: 0.5px solid var(--grey-100); }
        .notif-panel__viewall { display: flex; align-items: center; justify-content: center; gap: var(--space-4); width: 100%; padding: var(--space-12); font-size: var(--text-body-sm-size); font-weight: 500; color: var(--purple-600); background: none; border: none; cursor: pointer; transition: background var(--transition-fast); }
        .notif-panel__viewall:hover { background: var(--page-bg); }
      `}</style>

      <div className="notif-panel__header">
        <span className="notif-panel__title">Notifications</span>
        {unreadCount > 0 && (
          <button type="button" className="btn btn-ghost btn-xs" onClick={handleMarkAllRead}>
            Mark all read
          </button>
        )}
      </div>

      <div className="notif-panel__body">
        {isLoading ? (
          <div>
            {[0, 1, 2].map((i) => (
              <div key={i} className="notif-item" style={{ cursor: 'default' }}>
                <Skeleton circle width={32} height={32} />
                <div className="notif-item__body">
                  <Skeleton width="70%" height={13} style={{ marginBottom: 'var(--space-8)' }} />
                  <Skeleton width="40%" height={11} />
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <EmptyState
            size="sm"
            icon={<IconBellOff />}
            title="You're all caught up"
            description="New notifications about enquiries, payments, and deliveries will show up here."
          />
        ) : (
          notifications.slice(0, 8).map((n) => {
            const isUnread = !n.read && !n.isRead;
            const title = n.title || n.subject;
            const message = n.message || n.body || (!title ? 'Notification' : '');
            const TypeIcon = TYPE_ICON[n.type] || IconBell;
            return (
              <div key={n.id} className="notif-item" onClick={() => handleClickNotification(n)}>
                <div className="notif-item__icon">
                  <TypeIcon className="icon-md" aria-hidden="true" />
                </div>
                <div className="notif-item__body">
                  {title && <div className="notif-item__title">{title}</div>}
                  {message && <div className="notif-item__message">{message}</div>}
                  <div className="notif-item__time">{formatRelativeDate(n.createdAt || n.created_at)}</div>
                </div>
                {isUnread && <span className="notif-item__dot" />}
              </div>
            );
          })
        )}
      </div>

      <div className="notif-panel__footer">
        <button
          type="button"
          className="notif-panel__viewall"
          onClick={() => { navigate(notificationsHref); onClose?.(); }}
        >
          View all notifications
          <IconArrowRight className="icon-sm" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
