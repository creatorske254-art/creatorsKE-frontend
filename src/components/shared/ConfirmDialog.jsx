import { useEffect } from 'react';
import { IconX, IconAlertTriangle } from '@tabler/icons-react';

/**
 * ConfirmDialog
 *
 * Shape follows Google's Material 3 dialog composition: a 28px "extra-large"
 * corner radius, a soft scrim, no divider or tinted band under the actions -
 * they sit right-aligned on the same surface as the body - and pill-shaped
 * buttons (a borderless text button for Cancel, a filled pill for Confirm).
 *
 * @param {boolean}  open         - controlled visibility
 * @param {string}   title        - dialog heading
 * @param {string}   message      - body text
 * @param {string}   [confirmLabel] - confirm button text (default "Confirm")
 * @param {string}   [cancelLabel]  - cancel button text (default "Cancel")
 * @param {'danger'|'default'} [variant] - danger shows a filled red confirm button
 * @param {function} onConfirm    - called on confirm
 * @param {function} onCancel     - called on cancel / backdrop click
 */
export default function ConfirmDialog({
  open,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  onConfirm,
  onCancel,
}) {
  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === 'Escape') onCancel?.(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="ui-modal-backdrop"
      onClick={onCancel}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'var(--scrim-modal)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: 'var(--space-24)',
      }}
    >
      <div
        className="ui-modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--white)',
          borderRadius: 'var(--radius-modal)',
          width: '100%',
          maxWidth: '420px',
          boxShadow: 'var(--shadow-xl)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: 'var(--space-24) var(--space-24) 0',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-12)' }}>
            {variant === 'danger' && (
              <div className="ui-confirm-icon" style={{ background: 'var(--status-error-bg)' }}>
                <IconAlertTriangle className="icon-md" style={{ color: 'var(--status-error)' }} />
              </div>
            )}
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '18px',
                fontWeight: 600,
                color: 'var(--black)',
                letterSpacing: '-0.01em',
              }}
            >
              {title}
            </div>
          </div>
          <button type="button" className="ui-modal-close" onClick={onCancel} aria-label="Close">
            <IconX className="icon-sm" />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: 'var(--space-12) var(--space-24) var(--space-24)' }}>
          <p
            style={{
              fontSize: '14px',
              color: 'var(--grey-600)',
              lineHeight: 1.65,
            }}
          >
            {message}
          </p>
        </div>

        {/* Actions - same surface as the body, no divider or tinted band */}
        <div className="ui-confirm-actions">
          <button type="button" className="ui-confirm-btn ui-confirm-btn--text" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`ui-confirm-btn ${variant === 'danger' ? 'ui-confirm-btn--danger' : 'ui-confirm-btn--filled'}`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
