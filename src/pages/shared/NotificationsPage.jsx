import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePageMeta } from '@/lib/usePageMeta';
import { useNotifications } from '@/features/notifications/hooks/useNotifications';
import { useNotifications as useNotificationBadge } from '@/context/NotificationContext';
import { TYPES } from '@/features/notifications/constants/notifications';
import { formatRelativeDate } from '@/lib/utils';
import Skeleton from '@/components/ui/Skeleton';
import EmptyState from '@/components/shared/EmptyState';
import ErrorState from '@/components/shared/ErrorState';
import { IconBell, IconBellOff, IconCash, IconChecks, IconMail, IconMessageCircle, IconPackage } from '@tabler/icons-react';

const TYPE_ICON = {
  [TYPES.NEW_ENQUIRY]: IconMail,
  [TYPES.PAYMENT_CONFIRMED]: IconCash,
  [TYPES.DELIVERY_MARKED]: IconPackage,
  [TYPES.NEW_MESSAGE]: IconMessageCircle,
};

const isUnread = (n) => !n.read && !n.isRead;

/*
   The full notifications history, reached from the bell dropdown's "View all"
   and at /<role>/notifications. Same list the dropdown shows, without the
   8-item cap, plus an All / Unread filter. Shared by every role - the bell
   and its feed are identical across creator, brand and admin.
*/
export default function NotificationsPage() {
  usePageMeta('Notifications', 'Your enquiries, payments, deliveries and reviews on Creatorske.');
  const navigate = useNavigate();
  const { notifications, unreadCount, isLoading, isError, refetch, markRead, markAllRead } = useNotifications();
  const { refetch: refetchBadge } = useNotificationBadge();
  const [filter, setFilter] = useState('all');

  const shown = useMemo(
    () => (filter === 'unread' ? notifications.filter(isUnread) : notifications),
    [filter, notifications]
  );

  function handleMarkAllRead() {
    markAllRead();
    refetchBadge();
  }

  function handleClick(n) {
    if (isUnread(n)) {
      markRead([n.id]);
      refetchBadge();
    }
    const target = n.link || n.actionUrl || n.url;
    if (target) navigate(target);
  }

  return (
    <div className="notif-page">
      <style>{`
        .notif-page { width: 100%; }
        .notif-page__head { display: flex; align-items: flex-start; justify-content: space-between; gap: var(--space-16); flex-wrap: wrap; margin-bottom: var(--space-24); }
        .notif-page__tabs { display: flex; gap: var(--space-8); margin-bottom: var(--space-16); }
        .notif-page__tab { padding: var(--space-8) var(--space-16); border-radius: var(--radius-pill); font-size: var(--text-body-sm-size); font-weight: 500; color: var(--grey-600); background: var(--white); border: 0.5px solid var(--grey-200); cursor: pointer; transition: all var(--transition-fast); }
        .notif-page__tab:hover { color: var(--black); }
        .notif-page__tab.is-active { background: var(--purple-600); color: var(--white); border-color: var(--purple-600); }
        .notif-list { background: var(--white); border: 0.5px solid var(--grey-100); border-radius: var(--radius-lg); overflow: hidden; }
        .notif-row { display: flex; align-items: flex-start; gap: var(--space-12); padding: var(--space-16); border-bottom: 0.5px solid var(--grey-100); cursor: pointer; transition: background var(--transition-fast); }
        .notif-row:last-child { border-bottom: none; }
        .notif-row:hover { background: var(--page-bg); }
        .notif-row.is-unread { background: var(--purple-50); }
        .notif-row.is-unread:hover { background: var(--purple-100); }
        .notif-row__icon { width: 36px; height: 36px; border-radius: 50%; background: var(--purple-50); color: var(--purple-600); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .notif-row.is-unread .notif-row__icon { background: var(--white); }
        .notif-row__body { flex: 1; min-width: 0; }
        .notif-row__title { font-size: var(--text-body-sm-size); font-weight: 600; color: var(--black); margin-bottom: var(--space-2); }
        .notif-row__message { font-size: var(--text-body-sm-size); color: var(--grey-600); line-height: 1.5; }
        .notif-row__time { font-size: var(--text-caption-size); color: var(--grey-400); margin-top: var(--space-4); }
        .notif-row__dot { width: 8px; height: 8px; border-radius: 50%; background: var(--purple-500); flex-shrink: 0; margin-top: var(--space-8); }
      `}</style>

      <div className="notif-page__head">
        <div>
          <h1 className="page-title">Notifications</h1>
          <p className="page-subtitle">
            {unreadCount > 0 ? `${unreadCount} unread` : 'You are all caught up'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button type="button" className="btn btn-secondary btn-sm" onClick={handleMarkAllRead}>
            <IconChecks className="icon-sm" aria-hidden="true" />Mark all read
          </button>
        )}
      </div>

      <div className="notif-page__tabs" role="tablist" aria-label="Filter notifications">
        <button type="button" role="tab" aria-selected={filter === 'all'} className={`notif-page__tab${filter === 'all' ? ' is-active' : ''}`} onClick={() => setFilter('all')}>
          All{notifications.length ? ` (${notifications.length})` : ''}
        </button>
        <button type="button" role="tab" aria-selected={filter === 'unread'} className={`notif-page__tab${filter === 'unread' ? ' is-active' : ''}`} onClick={() => setFilter('unread')}>
          Unread{unreadCount ? ` (${unreadCount})` : ''}
        </button>
      </div>

      {isLoading ? (
        <div className="notif-list">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="notif-row" style={{ cursor: 'default' }}>
              <Skeleton circle width={36} height={36} />
              <div className="notif-row__body">
                <Skeleton width="60%" height={13} style={{ marginBottom: 'var(--space-8)' }} />
                <Skeleton width="85%" height={12} style={{ marginBottom: 'var(--space-8)' }} />
                <Skeleton width="25%" height={11} />
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <ErrorState title="Couldn't load your notifications" onRetry={refetch} />
      ) : shown.length === 0 ? (
        <EmptyState
          icon={filter === 'unread' ? <IconBell /> : <IconBellOff />}
          title={filter === 'unread' ? 'No unread notifications' : "You're all caught up"}
          description={filter === 'unread' ? 'Everything here has been read.' : 'New notifications about enquiries, payments, deliveries and reviews will show up here.'}
        />
      ) : (
        <div className="notif-list">
          {shown.map((n) => {
            const title = n.title || n.subject;
            const message = n.message || n.body || (!title ? 'Notification' : '');
            const TypeIcon = TYPE_ICON[n.type] || IconBell;
            return (
              <div key={n.id} className={`notif-row${isUnread(n) ? ' is-unread' : ''}`} onClick={() => handleClick(n)}>
                <div className="notif-row__icon"><TypeIcon className="icon-md" aria-hidden="true" /></div>
                <div className="notif-row__body">
                  {title && <div className="notif-row__title">{title}</div>}
                  {message && <div className="notif-row__message">{message}</div>}
                  <div className="notif-row__time">{formatRelativeDate(n.createdAt || n.created_at)}</div>
                </div>
                {isUnread(n) && <span className="notif-row__dot" aria-label="Unread" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
