// In-chat invoice escrow lifecycle.
// The backend returns these as UPPERCASE strings; always compare through normalizeStatus().
export const INVOICE_STATUS = {
  PENDING: 'PENDING',     // issued, amount editable by the creator
  HELD: 'HELD',           // paid, money held in escrow
  DELIVERED: 'DELIVERED', // creator marked the work delivered
  DISPUTED: 'DISPUTED',   // under admin review
  COMPLETED: 'COMPLETED', // paid out to the creator
  RESOLVED: 'RESOLVED',   // admin ruled, paid out
  REFUNDED: 'REFUNDED',   // admin ruled, refunded to the brand
  // Legacy, non-escrow states (read-only on the card).
  PAID: 'PAID',
  CANCELLED: 'CANCELLED',
  EXPIRED: 'EXPIRED',
};

export const STATUS_LABELS = {
  PENDING: 'Pending payment',
  HELD: 'Held in escrow',
  DELIVERED: 'Delivered',
  DISPUTED: 'Under review',
  COMPLETED: 'Completed',
  RESOLVED: 'Resolved',
  REFUNDED: 'Refunded',
  PAID: 'Paid',
  CANCELLED: 'Cancelled',
  EXPIRED: 'Expired',
};

const STATUS_TONE = {
  PENDING: 'tag-warning',
  HELD: 'tag-info',
  DELIVERED: 'tag-purple',
  DISPUTED: 'tag-error',
  COMPLETED: 'tag-success',
  RESOLVED: 'tag-success',
  REFUNDED: 'tag-grey',
  PAID: 'tag-success',
  CANCELLED: 'tag-grey',
  EXPIRED: 'tag-grey',
};

const TERMINAL = new Set(['COMPLETED', 'RESOLVED', 'REFUNDED', 'PAID', 'CANCELLED', 'EXPIRED']);
const LEGACY = new Set(['PAID', 'CANCELLED', 'EXPIRED']);

/** Statuses arrive uppercase, but compare case-insensitively just in case. */
export const normalizeStatus = (value) => String(value ?? '').trim().toUpperCase();

export const statusLabel = (status) => STATUS_LABELS[normalizeStatus(status)] ?? normalizeStatus(status);

export const statusTone = (status) => STATUS_TONE[normalizeStatus(status)] ?? 'tag-grey';

export const isTerminal = (status) => TERMINAL.has(normalizeStatus(status));

/** Legacy non-escrow states render read-only. */
export const isLegacyStatus = (status) => LEGACY.has(normalizeStatus(status));

/** Once an invoice leaves PENDING its price is locked for good. */
export const isPriceLocked = (status) => normalizeStatus(status) !== INVOICE_STATUS.PENDING;

/**
 * The creator may raise a dispute only when the backend says so - the flag is
 * `disputeEligible` (column dispute_eligible). There is no `canDispute`.
 */
export const isDisputeEligible = (invoice) => Boolean(invoice?.disputeEligible);

export const DISPUTE_REASONS = [
  { value: 'NOT_DELIVERED', label: 'Not delivered' },
  { value: 'POOR_QUALITY', label: 'Poor quality or off-brief' },
  { value: 'WRONG_DELIVERABLE', label: 'Wrong deliverable' },
  { value: 'OTHER', label: 'Something else' },
];

export const disputeReasonLabel = (value) =>
  DISPUTE_REASONS.find((reason) => reason.value === value)?.label ?? value ?? '';

/** The invoice amount may arrive as `price` (escrow contract) or `amount`. */
export const invoiceAmount = (invoice) => Number(invoice?.price ?? invoice?.amount ?? 0) || 0;

export const invoiceTitle = (invoice) =>
  invoice?.serviceTitle ?? invoice?.title ?? 'Invoice';

export const invoiceDescription = (invoice) =>
  invoice?.serviceDescription ?? invoice?.description ?? '';
