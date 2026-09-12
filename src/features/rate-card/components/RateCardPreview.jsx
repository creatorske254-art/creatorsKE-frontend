import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils';

const previewOnly = () =>
  toast.info('This is a preview. Brands will use this button on your published rate card.');

/**
 * RateCardPreview
 *
 * Renders a pixel-accurate preview of the public rate card page.
 * Fed live from the builder via react-hook-form's watch().
 *
 * Props:
 *   data - { title, tagline, handle, availability, packages: [...] }
 *   creatorName - string (from auth context or profile)
 */
export default function RateCardPreview({ data = {}, creatorName = '' }) {
  const { title, tagline, handle, availability, packages = [] } = data;

  const availabilityConfig = {
    OPEN: { label: 'Open to work', color: 'var(--status-success)', bg: 'var(--status-success-bg)', textColor: 'var(--status-success-text)' },
    LIMITED: { label: 'Limited availability', color: 'var(--status-warning)', bg: 'var(--status-warning-bg)', textColor: 'var(--status-warning-text)' },
    FULLY_BOOKED: { label: 'Fully booked', color: 'var(--status-error)', bg: 'var(--status-error-bg)', textColor: 'var(--status-error-text)' },
  };

  const avail = availabilityConfig[availability] || availabilityConfig.OPEN;
  const visiblePackages = packages.filter((p) => p.name || p.price);
  const displayName = title || creatorName || 'Your Name';
  const displayHandle = handle ? `@${handle.replace('@', '')}` : '@yourhandle';

  return (
    <div className="rc-preview">
      {/* ── Preview label ──────────────────────────────────────────────── */}
      <div className="rc-preview__badge">
        <i className="ti ti-eye" style={{ fontSize: 11 }} />
        Preview: public view
      </div>

      {/* ── Header ────────────────────────────────────────────────────── */}
      <div className="rc-preview__header">
        <div className="rc-preview__avatar">
          {displayName.charAt(0).toUpperCase()}
        </div>
        <div className="rc-preview__identity">
          <div className="rc-preview__name">{displayName}</div>
          <div className="rc-preview__handle">{displayHandle}</div>
        </div>
        <div
          className="rc-preview__avail"
          style={{ background: avail.bg, color: avail.textColor }}
        >
          <span
            className="sdot"
            style={{ background: avail.color, width: 6, height: 6 }}
          />
          {avail.label}
        </div>
      </div>

      {/* ── Tagline ───────────────────────────────────────────────────── */}
      {tagline && (
        <p className="rc-preview__tagline">{tagline}</p>
      )}
      {!tagline && (
        <p className="rc-preview__tagline rc-preview__tagline--empty">
          Your tagline will appear here…
        </p>
      )}

      {/* ── Packages ──────────────────────────────────────────────────── */}
      <div className="rc-preview__packages-label">Packages</div>

      {visiblePackages.length === 0 ? (
        <div className="rc-preview__empty">
          <i className="ti ti-package" style={{ fontSize: 28, color: 'var(--grey-200)' }} />
          <p>Add your first package<br />to see it appear here</p>
        </div>
      ) : (
        <div className="rc-preview__packages">
          {visiblePackages.map((pkg, i) => (
            <div key={pkg.id ?? i} className="rc-preview__pkg">
              <div className="rc-preview__pkg-top">
                <div className="rc-preview__pkg-name">
                  {pkg.name || 'Untitled package'}
                </div>
                <div className="rc-preview__pkg-price">
                  {formatCurrency(pkg.price || 0)}
                </div>
              </div>
              {pkg.description && (
                <p className="rc-preview__pkg-desc">{pkg.description}</p>
              )}
              {pkg.deliverables?.filter((d) => d.text).length > 0 && (
                <ul className="rc-preview__deliverables">
                  {pkg.deliverables.filter((d) => d.text).map((d, di) => (
                    <li key={di}>
                      <i className="ti ti-check" style={{ color: 'var(--status-success)', fontSize: 11 }} />
                      {d.text}
                    </li>
                  ))}
                </ul>
              )}
              <div className="rc-preview__pkg-footer">
                {pkg.revisions && pkg.revisions !== '0' && (
                  <span className="tag tag-default" style={{ fontSize: 10 }}>
                    {pkg.revisions === 'unlimited' ? 'Unlimited' : pkg.revisions} revision{pkg.revisions !== '1' && pkg.revisions !== 'unlimited' ? 's' : ''}
                  </span>
                )}
                <button type="button" className="btn btn-primary btn-sm" style={{ marginLeft: 'auto' }} onClick={previewOnly}>
                  Book now
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .rc-preview {
          background: var(--page-bg);
          border-radius: var(--radius-xl);
          padding: var(--space-20);
          display: flex;
          flex-direction: column;
          gap: var(--space-16);
          border: 0.5px solid var(--grey-200);
          min-height: 400px;
        }
        .rc-preview__badge {
          display: inline-flex;
          align-items: center;
          gap: var(--space-4);
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--grey-400);
          background: var(--white);
          border: 0.5px solid var(--grey-200);
          padding: var(--space-4) var(--space-12);
          border-radius: var(--radius-pill);
          align-self: flex-start;
        }
        .rc-preview__header {
          display: flex;
          align-items: center;
          gap: var(--space-12);
          padding: var(--space-16);
          background: var(--white);
          border-radius: var(--radius-lg);
          border: 0.5px solid var(--grey-100);
        }
        .rc-preview__avatar {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: var(--purple-100);
          color: var(--purple-600);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-display);
          font-size: 18px;
          font-weight: 600;
          flex-shrink: 0;
        }
        .rc-preview__identity { flex: 1; min-width: 0; }
        .rc-preview__name {
          font-family: var(--font-display);
          font-size: 16px;
          font-weight: 600;
          color: var(--black);
        }
        .rc-preview__handle {
          font-size: 12px;
          color: var(--grey-400);
          margin-top: var(--space-2);
        }
        .rc-preview__avail {
          display: flex;
          align-items: center;
          gap: var(--space-4);
          font-size: 11px;
          font-weight: 500;
          padding: var(--space-4) var(--space-12);
          border-radius: var(--radius-pill);
          flex-shrink: 0;
        }
        .rc-preview__tagline {
          font-size: 13px;
          color: var(--grey-600);
          line-height: 1.6;
          padding: var(--space-12) var(--space-16);
          background: var(--white);
          border-radius: var(--radius-lg);
          border: 0.5px solid var(--grey-100);
        }
        .rc-preview__tagline--empty {
          color: var(--grey-300);
          font-style: italic;
        }
        .rc-preview__packages-label {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--grey-400);
        }
        .rc-preview__packages {
          display: flex;
          flex-direction: column;
          gap: var(--space-12);
        }
        .rc-preview__pkg {
          background: var(--white);
          border: 0.5px solid var(--grey-100);
          border-radius: var(--radius-lg);
          padding: var(--space-16);
          display: flex;
          flex-direction: column;
          gap: var(--space-12);
          transition: box-shadow 0.15s;
        }
        .rc-preview__pkg:hover {
          box-shadow: var(--shadow-sm);
        }
        .rc-preview__pkg-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: var(--space-8);
        }
        .rc-preview__pkg-name {
          font-family: var(--font-display);
          font-size: 15px;
          font-weight: 600;
          color: var(--black);
        }
        .rc-preview__pkg-price {
          font-family: var(--font-display);
          font-size: 16px;
          font-weight: 600;
          color: var(--black);
          white-space: nowrap;
        }
        .rc-preview__pkg-desc {
          font-size: 12px;
          color: var(--grey-500);
          line-height: 1.55;
        }
        .rc-preview__deliverables {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }
        .rc-preview__deliverables li {
          display: flex;
          align-items: center;
          gap: var(--space-8);
          font-size: 12px;
          color: var(--grey-600);
        }
        .rc-preview__pkg-footer {
          display: flex;
          align-items: center;
          gap: var(--space-8);
          padding-top: var(--space-12);
          border-top: 0.5px solid var(--grey-100);
        }
        .rc-preview__empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: var(--space-12);
          padding: var(--space-40) var(--space-20);
          background: var(--white);
          border-radius: var(--radius-lg);
          border: 0.5px solid var(--grey-100);
          text-align: center;
        }
        .rc-preview__empty p {
          font-size: 13px;
          color: var(--grey-400);
          line-height: 1.6;
        }
      `}</style>
    </div>
  );
}
