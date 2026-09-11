import { STATUS_META, STATUS } from '../constants/enquiry';
import { formatCurrency, formatRelativeDate, getInitials } from '@/lib/utils';

/**
 * Pipeline list item. `variant` picks which side of the enquiry to show as
 * the counterpart name — a creator sees the brand's name, a brand sees the
 * creator's.
 * @param {'creator'|'brand'} [variant]
 */
export default function EnquiryCard({ enquiry, selected, onSelect, variant = 'creator' }) {
  const counterpart = variant === 'creator' ? enquiry.brand : enquiry.creator;
  const name = counterpart?.name ?? counterpart?.displayName ?? 'Unknown';
  const initials = counterpart?.initials ?? getInitials(name);
  const meta = STATUS_META[enquiry.status] ?? STATUS_META[STATUS.NEW];

  return (
    <div
      className={`enq-card${selected ? ' selected' : ''}`}
      onClick={onSelect}
      role="button"
      tabIndex={0}
    >
      <div className="enq-card-row">
        <div className="avatar avatar-md avatar-purple">{initials}</div>
        <div className="enq-card-body">
          <div className="enq-card-top">
            <div className="enq-card-name">{name}</div>
            <span className={`tag ${meta.tagClass}`}>{meta.label}</span>
          </div>
          <div className="enq-card-service">
            {enquiry.packageName ?? 'Package'}
            {enquiry.price != null ? ` · ${formatCurrency(enquiry.price)}` : ''}
          </div>
          <div className="enq-card-time">{formatRelativeDate(enquiry.createdAt)}</div>
        </div>
      </div>
    </div>
  );
}
