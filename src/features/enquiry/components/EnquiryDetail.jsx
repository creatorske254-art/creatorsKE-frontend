import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  IconCheck, IconMailOpened, IconX, IconUpload, IconFileText, IconTrash,
  IconCircleCheck, IconClock, IconAlertTriangle, IconExternalLink, IconTruckDelivery,
} from '@tabler/icons-react';
import { STATUS, STATUS_META } from '../constants/enquiry';
import { useCreatorCampaign } from '../hooks/useCreatorCampaign';
import { formatCurrency, formatDate, getInitials } from '@/lib/utils';
import { uploadFile } from '@/lib/api';
import { toast } from 'sonner';
import { MessageThread } from '@/features/messaging';
import Modal from '@/components/ui/Modal';
import Skeleton from '@/components/ui/Skeleton';
import EmptyState from '@/components/shared/EmptyState';

/** Attach files then mark the campaign delivered - the creator's side of the
 * booking they just accepted. Files upload to /uploads/upload immediately on
 * selection so the submit button just sends the resulting URLs + a note. */
function MarkDeliveredModal({ open, onClose, onSubmit, isSubmitting }) {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [note, setNote] = useState('');

  async function handleFilePick(e) {
    const picked = Array.from(e.target.files ?? []);
    e.target.value = '';
    if (!picked.length) return;
    setUploading(true);
    try {
      const uploaded = await Promise.all(picked.map((f) => uploadFile(f)));
      setFiles((prev) => [...prev, ...uploaded.map((u, i) => ({ name: picked[i].name, url: u.url, size: picked[i].size }))]);
    } catch (err) {
      toast.error(err?.message || 'Could not upload one of those files.');
    } finally {
      setUploading(false);
    }
  }

  function removeFile(url) {
    setFiles((prev) => prev.filter((f) => f.url !== url));
  }

  function handleSubmit() {
    onSubmit({ files, note: note.trim() || undefined });
  }

  return (
    <Modal open={open} onClose={onClose} title="Mark this campaign as delivered" size="sm">
      <p style={{ fontSize: 13, color: 'var(--grey-600)', lineHeight: 1.6, marginBottom: 'var(--space-16)' }}>
        Attach the final files (optional) and let the brand know it's ready. They'll have 48 hours to review before payment is released.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)', marginBottom: 'var(--space-16)' }}>
        {files.map((f) => (
          <div key={f.url} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-8)', padding: 'var(--space-8) var(--space-12)', background: 'var(--page-bg)', borderRadius: 'var(--radius-md)', border: '0.5px solid var(--grey-100)' }}>
            <IconFileText className="icon-sm" style={{ color: 'var(--grey-400)', flexShrink: 0 }} aria-hidden="true" />
            <span style={{ flex: 1, fontSize: 12.5, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</span>
            <button type="button" className="btn btn-ghost btn-xs" aria-label={`Remove ${f.name}`} onClick={() => removeFile(f.url)}>
              <IconTrash className="icon-sm" aria-hidden="true" />
            </button>
          </div>
        ))}
        <label className={`btn btn-secondary btn-sm${uploading ? ' btn-loading' : ''}`} style={{ cursor: 'pointer', width: 'fit-content' }}>
          <IconUpload className="icon-xs" aria-hidden="true" />
          {uploading ? 'Uploading' : 'Attach files'}
          <input type="file" multiple hidden onChange={handleFilePick} disabled={uploading} />
        </label>
      </div>

      <label className="field-label" htmlFor="delivery-note" style={{ display: 'block', marginBottom: 'var(--space-8)' }}>Note to the brand (optional)</label>
      <textarea
        id="delivery-note"
        className="input input-md textarea"
        rows={3}
        placeholder="e.g. Posted the reel this morning, link is in the files above."
        value={note}
        onChange={(e) => setNote(e.target.value)}
        style={{ marginBottom: 'var(--space-20)' }}
      />

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-12)' }}>
        <button className="btn btn-ghost" onClick={onClose} disabled={isSubmitting}>Cancel</button>
        <button className={`btn btn-purple${isSubmitting ? ' btn-loading' : ''}`} disabled={isSubmitting || uploading} onClick={handleSubmit}>
          <IconTruckDelivery className="icon-sm" aria-hidden="true" /> Mark as delivered
        </button>
      </div>
    </Modal>
  );
}

/** The BOOKED+ delivery lifecycle, shown under the accept/decline actions
 * once there's a campaign to report on. Creator gets the full flow (scope,
 * mark-delivered, delivered/completed/disputed states); brand gets a compact
 * status line pointing at the full campaign page, which already owns
 * approve/dispute. */
function DeliverySection({ enquiry, variant }) {
  const hasCampaign = !!enquiry.campaignId && (enquiry.status === STATUS.BOOKED || enquiry.status === STATUS.COMPLETED);
  const { campaign, isLoading, deliver, isDelivering } = useCreatorCampaign(variant === 'creator' && hasCampaign ? enquiry.campaignId : null);
  const [modalOpen, setModalOpen] = useState(false);

  if (!hasCampaign) return null;

  if (variant === 'brand') {
    return (
      <div style={{ marginTop: 'var(--space-16)', paddingTop: 'var(--space-16)', borderTop: '0.5px solid var(--grey-100)' }}>
        <Link to={`/brand/campaigns/${enquiry.campaignId}`} className="btn btn-secondary btn-full">
          <IconExternalLink className="icon-sm" aria-hidden="true" />
          {enquiry.status === STATUS.COMPLETED ? 'View completed campaign' : 'View campaign progress'}
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div style={{ marginTop: 'var(--space-16)', paddingTop: 'var(--space-16)', borderTop: '0.5px solid var(--grey-100)' }}>
        <Skeleton width="100%" height={80} />
      </div>
    );
  }
  if (!campaign) return null;

  return (
    <div style={{ marginTop: 'var(--space-16)', paddingTop: 'var(--space-16)', borderTop: '0.5px solid var(--grey-100)' }}>
      <div className="enq-eyebrow">Delivery</div>

      {campaign.status === 'in_progress' && (
        <>
          {campaign.deliverables?.length > 0 && (
            <ul style={{ margin: '0 0 var(--space-12)', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {campaign.deliverables.map((d, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-8)', fontSize: 12.5, color: 'var(--grey-600)' }}>
                  <IconCheck className="icon-xs" style={{ color: 'var(--purple-500)', marginTop: 2, flexShrink: 0 }} aria-hidden="true" />
                  {d}
                </li>
              ))}
            </ul>
          )}
          <button type="button" className="btn btn-purple btn-full" onClick={() => setModalOpen(true)}>
            <IconTruckDelivery className="icon-sm" aria-hidden="true" /> Mark as delivered
          </button>
        </>
      )}

      {campaign.status === 'delivered' && (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-8)', fontSize: 12.5, color: 'var(--grey-600)' }}>
          <IconClock className="icon-sm" style={{ color: 'var(--status-warning)', flexShrink: 0, marginTop: 1 }} aria-hidden="true" />
          <span>Delivered{campaign.deliveredAt ? ` on ${formatDate(campaign.deliveredAt)}` : ''}. Waiting for {enquiry.brand ?? 'the brand'} to approve.</span>
        </div>
      )}

      {campaign.status === 'completed' && (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-8)', fontSize: 12.5, color: 'var(--grey-600)' }}>
          <IconCircleCheck className="icon-sm" style={{ color: 'var(--status-success)', flexShrink: 0, marginTop: 1 }} aria-hidden="true" />
          <span>Completed - payment has been released to your account.</span>
        </div>
      )}

      {campaign.status === 'disputed' && (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-8)', fontSize: 12.5, color: 'var(--grey-600)' }}>
          <IconAlertTriangle className="icon-sm" style={{ color: 'var(--status-error)', flexShrink: 0, marginTop: 1 }} aria-hidden="true" />
          <span>The brand raised a dispute on this delivery. An admin is reviewing it.</span>
        </div>
      )}

      <MarkDeliveredModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        isSubmitting={isDelivering}
        onSubmit={(payload) => deliver(payload, { onSuccess: () => setModalOpen(false) })}
      />
    </div>
  );
}

/**
 * Enquiry detail panel - package/message summary, accept/decline (creator
 * only, only while NEW), the delivery lifecycle once booked, and the
 * enquiry's chat thread. The thread id is the enquiry's own id and stays the
 * same for the enquiry's whole lifecycle.
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
          icon={<IconMailOpened />}
          title="No enquiry selected"
          description="Select an enquiry to see details."
        />
      </div>
    );
  }

  // enquiry.brand/creator are plain display-name strings (see enquiry.service.js),
  // not objects - reading .name/.displayName off a string is always undefined.
  const name = (variant === 'creator' ? (enquiry.brand ?? enquiry.brandName) : (enquiry.creator ?? enquiry.creatorName)) || 'Unknown';
  const initials = getInitials(name);
  // The only extra identifier the enquiry carries for either side: a
  // creator's handle, shown when a brand is viewing. Brands have no
  // equivalent handle, so a creator sees nothing extra here.
  const subtitle = variant === 'brand' ? enquiry.creatorHandle : null;
  const meta = STATUS_META[enquiry.status] ?? STATUS_META[STATUS.NEW];
  const canRespond = variant === 'creator' && enquiry.status === STATUS.NEW;

  return (
    <div className="card card-p-md enq-detail">
      <div className="enq-detail-head">
        <div className="avatar avatar-lg avatar-purple">{initials}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="enq-detail-name">{name}</div>
          {subtitle && <div className="enq-detail-email">{subtitle}</div>}
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
            <IconCheck className="icon-sm" />
            Accept enquiry
          </button>
          <button
            type="button"
            className={`btn btn-danger btn-full${isDeclining ? ' btn-loading' : ''}`}
            onClick={onDecline}
            disabled={isAccepting || isDeclining}
          >
            <IconX className="icon-sm" />
            Decline
          </button>
        </div>
      )}

      <DeliverySection enquiry={enquiry} variant={variant} />

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
