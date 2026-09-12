import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { IconX } from '@tabler/icons-react';

const MAX_WIDTH = {
  sm: '420px',
  md: '520px',
  lg: '680px',
};

/**
 * Generic portal-based modal. Escape and backdrop-click both close it.
 * @param {boolean} open
 * @param {() => void} onClose
 * @param {string} [title]
 * @param {'sm'|'md'|'lg'} [size]
 */
export default function Modal({ open, onClose, title, size = 'md', children }) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="ui-modal-backdrop"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-24)',
        zIndex: 300,
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
          borderRadius: 'var(--radius-2xl)',
          width: '100%',
          maxWidth: MAX_WIDTH[size] ?? MAX_WIDTH.md,
          maxHeight: 'min(680px, 86vh)',
          boxShadow: 'var(--shadow-xl)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {title && (
          <div
            className="ui-modal-header"
            style={{
              padding: 'var(--space-24) var(--space-24) 0',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              flexShrink: 0,
            }}
          >
            <div
              className="ui-modal-title"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--text-h4-size)',
                fontWeight: 'var(--text-h4-weight)',
                color: 'var(--black)',
                letterSpacing: 'var(--text-h4-tracking)',
              }}
            >
              {title}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
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
              <IconX className="icon-md" />
            </button>
          </div>
        )}

        <div
          className="ui-modal-body"
          style={{ padding: title ? 'var(--space-16) var(--space-24) var(--space-24)' : 'var(--space-24)', overflowY: 'auto' }}
        >
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}
