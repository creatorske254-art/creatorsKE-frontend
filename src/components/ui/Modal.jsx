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
 *
 * Shape follows Google's Material 3 dialog composition: a 28px "extra-large"
 * corner radius, a soft 32%-scrim backdrop rather than a heavy one, no
 * divider between header and body, and a borderless icon-only close button
 * (ghost hover, not a permanently-visible filled chip). Typography still
 * uses the app's own heading roles - only the shape/chrome changed, not the
 * type system.
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
        background: 'var(--scrim-modal)',
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
          borderRadius: 'var(--radius-modal)',
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
            <button type="button" className="ui-modal-close" onClick={onClose} aria-label="Close">
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
