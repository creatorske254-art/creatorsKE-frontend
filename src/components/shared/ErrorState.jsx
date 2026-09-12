import { IconAlertTriangle } from '@tabler/icons-react';

/**
 * Standard inline "couldn't load this" block for a section or panel whose
 * data fetch failed (as opposed to EmptyState, which is for a successful
 * fetch that came back with nothing). Uses the same .empty-state/.empty-icon/
 * .empty-title/.empty-desc classes as EmptyState so the two look like one
 * family, just with a warning-colored icon and an optional retry action.
 *
 * @param {string}    [title]       - defaults to a generic "couldn't load" message
 * @param {ReactNode} [description]
 * @param {function}  [onRetry]     - if provided, renders a "Try again" button
 * @param {'md'|'sm'} [size]
 */
export default function ErrorState({
  title = "Couldn't load this",
  description = 'Something went wrong fetching this data. Please try again.',
  onRetry,
  size = 'md',
}) {
  const isSmall = size === 'sm';

  return (
    <div className={`empty-state${isSmall ? ' empty-state-sm' : ''}`}>
      <div className={`empty-icon${isSmall ? ' empty-icon-sm' : ''}`} style={{ background: 'var(--status-error-bg)', color: 'var(--status-error-text)' }}>
        <IconAlertTriangle className={isSmall ? 'icon-md' : 'icon-lg'} aria-hidden="true" />
      </div>
      <div className="empty-title">{title}</div>
      <div className="empty-desc">{description}</div>
      {onRetry && (
        <button type="button" className="btn btn-secondary btn-sm" onClick={onRetry} style={{ marginTop: 'var(--space-4)' }}>
          Try again
        </button>
      )}
    </div>
  );
}
