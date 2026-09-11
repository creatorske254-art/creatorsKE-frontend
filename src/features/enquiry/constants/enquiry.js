// enquiry statuses
export const STATUS = { NEW: 'NEW', IN_REVIEW: 'IN_REVIEW', BOOKED: 'BOOKED', COMPLETED: 'COMPLETED', EXPIRED: 'EXPIRED' };

// status -> visual treatment, shared by EnquiryCard/EnquiryDetail/EnquiryPipeline
export const STATUS_META = {
  [STATUS.NEW]:        { tagClass: 'tag-warning', label: 'New',        dot: 'var(--status-warning)' },
  [STATUS.IN_REVIEW]:  { tagClass: 'tag-purple',   label: 'In review',  dot: 'var(--purple-600)' },
  [STATUS.BOOKED]:     { tagClass: 'tag-success',  label: 'Booked',     dot: 'var(--status-success)' },
  [STATUS.COMPLETED]:  { tagClass: 'tag-default',  label: 'Completed',  dot: 'var(--grey-400)' },
  [STATUS.EXPIRED]:    { tagClass: 'tag-error',    label: 'Expired',    dot: 'var(--status-error)' },
};
