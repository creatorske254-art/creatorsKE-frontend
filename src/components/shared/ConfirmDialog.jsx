import { useEffect } from 'react';
import { IconX, IconAlertTriangle } from '@tabler/icons-react';

/**
 * ConfirmDialog
 * @param {boolean}  open         - controlled visibility
 * @param {string}   title        - dialog heading
 * @param {string}   message      - body text
 * @param {string}   [confirmLabel] - confirm button text (default "Confirm")
 * @param {string}   [cancelLabel]  - cancel button text (default "Cancel")
 * @param {'danger'|'default'} [variant] - danger shows red confirm button
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

  const confirmBtnStyle =
    variant === 'danger'
      ? {
          background: 'var(--status-error-bg)',
          color: 'var(--status-error-text)',
          border: '0.5px solid rgba(255,75,75,0.3)',
        }
      : {
          background: 'var(--black)',
          color: 'var(--white)',
          border: 'none',
        };

  return (
    <div
      onClick={onCancel}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(13,13,13,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: 'var(--space-24)',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--white)',
          borderRadius: 'var(--radius-2xl)',
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
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--status-error-bg)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <IconAlertTriangle size={18} style={{ color: 'var(--status-error)' }} />
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
          <button
            onClick={onCancel}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              background: 'var(--grey-100)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--grey-600)',
              flexShrink: 0,
            }}
          >
            <IconX size={15} />
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

        {/* Footer */}
        <div
          style={{
            padding: 'var(--space-16) var(--space-24)',
            background: 'var(--grey-50)',
            borderTop: '0.5px solid var(--grey-100)',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 'var(--space-12)',
          }}
        >
          <button
            onClick={onCancel}
            style={{
              padding: 'var(--space-8) var(--space-20)',
              fontSize: '13px',
              fontFamily: 'var(--font-body)',
              fontWeight: 500,
              background: 'var(--white)',
              color: 'var(--black)',
              border: '0.5px solid var(--grey-300)',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
            }}
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: 'var(--space-8) var(--space-20)',
              fontSize: '13px',
              fontFamily: 'var(--font-body)',
              fontWeight: 500,
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              ...confirmBtnStyle,
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}