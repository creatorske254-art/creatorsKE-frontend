import { IconCheck, IconX } from '@tabler/icons-react';
import { STATUS, STATUS_META } from '../constants/enquiry';
import { formatCurrency, formatDate, getInitials } from '@/lib/utils';
import { MessageThread } from '@/features/messaging';
import Skeleton from '@/components/ui/Skeleton';
import EmptyState from '@/components/shared/EmptyState';

/**
 * Enquiry detail panel - package/message summary, accept/decline (creator
 * only, only while NEW), and the enquiry's chat thread. The thread id is the
 * enquiry's own id and stays the same for the enquiry's whole lifecycle.
 * @param {'creator'|'brand'} [variant]
 */
export default function EnquiryDetail({
  enquiry,
  isLoading,
  variant = 'creator',
  onAccept,
  onDecline,
  isAccepting,
  isDeclining,
}) {
  if (isLoading) {
    return (
      <div className="card card-p-md enq-detail">
        <div className="enq-detail-head">
          <Skeleton circle width={48} height={48} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <Skeleton width="50%" height={15} style={{ marginBottom: 'var(--space-8)' }} />
            <Skeleton width="70%" height={12} />
          </div>
        </div>
        <div className="enq-pkg">
          <Skeleton width="40%" height={11} style={{ marginBottom: 'var(--space-8)' }} />
          <Skeleton width="80%" height={16} />
        </div>
        <Skeleton width="100%" height={60} style={{ marginTop: 'var(--space-16)' }} />
      </div>
    );
  }

  if (!enquiry) {
    return (
      <div className="card card-p-md enq-detail">
        <EmptyState
          icon={<i className="ti ti-mail-opened" aria-hidden="true" />}
          title="No enquiry selected"
          description="Select an enquiry to see details."
        />
      </div>
    );
  }

  const counterpart = variant === 'creator' ? enquiry.brand : enquiry.creator;
  const name = counterpart?.name ?? counterpart?.displayName ?? 'Unknown';
  const initials = counterpart?.initials ?? getInitials(name);
  const meta = STATUS_META[enquiry.status] ?? STATUS_META[STATUS.NEW];
  const canRespond = variant === 'creator' && enquiry.status === STATUS.NEW;

  return (
    <div className="card card-p-md enq-detail">
      <div className="enq-detail-head">
        <div className="avatar avatar-lg avatar-purple">{initials}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="enq-detail-name">{name}</div>
          {counterpart?.email && <div className="enq-detail-email">{counterpart.email}</div>}
        </div>
        <span className={`tag ${meta.tagClass}`}>{meta.label}</span>
      </div>

      <div className="enq-pkg">
        <div className="enq-eyebrow">Package requested</div>
        <div className="enq-pkg-row">
          <div className="enq-pkg-name">{enquiry.packageName ?? 'Package'}</div>
          {enquiry.price != null && (
            <div className="enq-pkg-price">{formatCurrency(enquiry.price)}</div>
          )}
        </div>
      </div>

      {enquiry.message && (
        <div className="enq-message-wrap">
          <div className="enq-eyebrow">Message</div>
          <div className="enq-message">{enquiry.message}</div>
        </div>
      )}

      <div className="enq-meta">
        <div className="enq-meta-row">
          <span>Received</span>
          <span className="enq-meta-val">{formatDate(enquiry.createdAt)}</span>
        </div>
      </div>

      {canRespond && (
        <div className="enq-actions">
          <button
            type="button"
            className={`btn btn-purple btn-full${isAccepting ? ' btn-loading' : ''}`}
            onClick={onAccept}
            disabled={isAccepting || isDeclining}
          >
            <IconCheck size={14} />
            Accept enquiry
          </button>
          <button
            type="button"
            className={`btn btn-danger btn-full${isDeclining ? ' btn-loading' : ''}`}
            onClick={onDecline}
            disabled={isAccepting || isDeclining}
          >
            <IconX size={14} />
            Decline
          </button>
        </div>
      )}

      <div
        style={{
          marginTop: 'var(--space-20)',
          paddingTop: 'var(--space-16)',
          borderTop: '0.5px solid var(--grey-100)',
        }}
      >
        <div className="enq-eyebrow">Messages</div>
        <MessageThread threadId={enquiry.id} />
      </div>
    </div>
  );
}
