import { Link } from 'react-router-dom';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';

/**
 * RateCardTile
 *
 * Shown on the creator dashboard - one tile per rate card.
 *
 * Props:
 *   rateCard  - { id, title, isPublished, packages, views, clicks }
 *   onPublish  - () => void
 *   onUnpublish - () => void
 *   onDelete  - () => void
 */
export default function RateCardTile({ rateCard, onPublish, onUnpublish, onDelete }) {
  const { id, title, isPublished, packages = [], views = 0, clicks = 0 } = rateCard;

  const lowestPrice = packages.length
    ? Math.min(...packages.map((p) => p.price || 0))
    : null;

  const ctr = views > 0 ? ((clicks / views) * 100).toFixed(1) : '-';

  return (
    <div className={cn('rc-tile', isPublished && 'rc-tile--published')}>
      {/* Status dot + label */}
      <div className="rc-tile__status">
        <span
          className="sdot"
          style={{
            background: isPublished ? 'var(--status-success)' : 'var(--grey-300)',
          }}
        />
        <span className="rc-tile__status-label">
          {isPublished ? 'Published' : 'Draft'}
        </span>
      </div>

      {/* Title */}
      <div className="rc-tile__title">{title || 'Untitled rate card'}</div>

      {/* Meta row */}
      <div className="rc-tile__meta">
        <span>{packages.length} package{packages.length !== 1 ? 's' : ''}</span>
        {lowestPrice !== null && (
          <span>From {formatCurrency(lowestPrice)}</span>
        )}
      </div>

      {/* Analytics (published only) */}
      {isPublished && (
        <div className="rc-tile__analytics">
          <div className="rc-tile__stat">
            <span className="rc-tile__stat-val">{views.toLocaleString()}</span>
            <span className="rc-tile__stat-label">Views</span>
          </div>
          <div className="rc-tile__stat">
            <span className="rc-tile__stat-val">{clicks.toLocaleString()}</span>
            <span className="rc-tile__stat-label">Clicks</span>
          </div>
          <div className="rc-tile__stat">
            <span className="rc-tile__stat-val">{ctr}%</span>
            <span className="rc-tile__stat-label">CTR</span>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="rc-tile__actions">
        <Link
          to={`/creator/rate-card/${id}/edit`}
          className="btn btn-secondary btn-sm"
        >
          <i className="ti ti-pencil" style={{ fontSize: 13 }} />
          Edit
        </Link>
        {isPublished ? (
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={onUnpublish}
          >
            Unpublish
          </button>
        ) : (
          <button
            type="button"
            className="btn btn-purple btn-sm"
            onClick={onPublish}
          >
            Publish
          </button>
        )}
        <button
          type="button"
          className="btn btn-square-sm btn-icon-style"
          onClick={onDelete}
          aria-label="Delete rate card"
          style={{ marginLeft: 'auto', color: 'var(--status-error-text)' }}
        >
          <i className="ti ti-trash" style={{ fontSize: 13 }} />
        </button>
      </div>

      <style>{`
        .rc-tile {
          background: var(--white);
          border: 0.5px solid var(--grey-100);
          border-radius: var(--radius-lg);
          padding: 18px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          transition: box-shadow 0.15s, border-color 0.15s;
        }
        .rc-tile:hover {
          box-shadow: var(--shadow-md);
          border-color: var(--grey-200);
        }
        .rc-tile--published {
          border-color: rgba(0, 185, 107, 0.2);
        }
        .rc-tile__status {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .rc-tile__status-label {
          font-size: 11px;
          font-weight: 500;
          color: var(--grey-500);
        }
        .rc-tile__title {
          font-family: var(--font-display);
          font-size: 16px;
          font-weight: 600;
          color: var(--black);
          line-height: 1.3;
        }
        .rc-tile__meta {
          display: flex;
          gap: 12px;
          font-size: 12px;
          color: var(--grey-400);
        }
        .rc-tile__analytics {
          display: flex;
          gap: 16px;
          padding: 10px 12px;
          background: var(--grey-50);
          border-radius: var(--radius-md);
        }
        .rc-tile__stat {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .rc-tile__stat-val {
          font-family: var(--font-display);
          font-size: 16px;
          font-weight: 600;
          color: var(--black);
          line-height: 1;
        }
        .rc-tile__stat-label {
          font-size: 10px;
          color: var(--grey-400);
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }
        .rc-tile__actions {
          display: flex;
          gap: 6px;
          align-items: center;
          padding-top: 6px;
          border-top: 0.5px solid var(--grey-100);
          margin-top: 2px;
        }
      `}</style>
    </div>
  );
}
