import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/utils';

/**
 * PackageCard
 *
 * Display card for a package in the DraggablePackageList.
 * Receives drag handle props via `dragHandleProps` from the sortable wrapper.
 *
 * Props:
 *   pkg             — { id, name, price, description, deliverables, revisions }
 *   dragHandleProps — spread onto the drag handle element
 *   isActive        — true while this card is being dragged (dnd-kit)
 *   onEdit          — () => void
 *   onDelete        — () => void
 */
export default function PackageCard({ pkg, dragHandleProps, isActive, onEdit, onDelete }) {
  const revisionLabel =
    pkg.revisions === 'unlimited'
      ? 'Unlimited revisions'
      : pkg.revisions === '0' || pkg.revisions === 0
      ? 'No revisions'
      : `${pkg.revisions} revision${pkg.revisions !== '1' ? 's' : ''}`;

  return (
    <div className={cn('pkg-card', isActive && 'pkg-card--dragging')}>
      {/* Drag handle */}
      <div className="pkg-card__drag" {...dragHandleProps} title="Drag to reorder">
        <i className="ti ti-grip-vertical" />
      </div>

      {/* Content */}
      <div className="pkg-card__body">
        <div className="pkg-card__top">
          <div>
            <div className="pkg-card__name">{pkg.name || 'Untitled package'}</div>
            {pkg.description && (
              <div className="pkg-card__desc">{pkg.description}</div>
            )}
          </div>
          <div className="pkg-card__price">
            {formatCurrency(pkg.price || 0)}
          </div>
        </div>

        {pkg.deliverables?.length > 0 && (
          <ul className="pkg-card__deliverables">
            {pkg.deliverables.filter(d => d.text).map((d, i) => (
              <li key={i} className="pkg-card__deliverable">
                <i className="ti ti-check" />
                {d.text}
              </li>
            ))}
          </ul>
        )}

        <div className="pkg-card__footer">
          <span className="tag tag-default" style={{ fontSize: 11 }}>
            <i className="ti ti-refresh" style={{ fontSize: 10 }} />
            {revisionLabel}
          </span>
          <div className="pkg-card__actions">
            <button
              type="button"
              className="btn btn-square-sm btn-icon-style"
              onClick={onEdit}
              aria-label="Edit package"
            >
              <i className="ti ti-pencil" style={{ fontSize: 13 }} />
            </button>
            <button
              type="button"
              className="btn btn-square-sm btn-icon-style"
              onClick={onDelete}
              aria-label="Delete package"
              style={{ color: 'var(--status-error-text)' }}
            >
              <i className="ti ti-trash" style={{ fontSize: 13 }} />
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .pkg-card {
          display: flex;
          align-items: stretch;
          background: var(--white);
          border: 0.5px solid var(--grey-200);
          border-radius: var(--radius-lg);
          transition: box-shadow 0.15s, transform 0.15s, border-color 0.15s;
        }
        .pkg-card:hover {
          border-color: var(--grey-300);
          box-shadow: var(--shadow-sm);
        }
        .pkg-card--dragging {
          box-shadow: var(--shadow-xl);
          transform: scale(1.01);
          border-color: var(--purple-300);
          z-index: 100;
        }
        .pkg-card__drag {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 10px;
          color: var(--grey-300);
          cursor: grab;
          font-size: 18px;
          flex-shrink: 0;
          border-right: 0.5px solid var(--grey-100);
          border-radius: var(--radius-lg) 0 0 var(--radius-lg);
          transition: color 0.15s, background 0.15s;
        }
        .pkg-card__drag:hover {
          color: var(--grey-500);
          background: var(--grey-50);
        }
        .pkg-card__drag:active {
          cursor: grabbing;
        }
        .pkg-card__body {
          flex: 1;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          min-width: 0;
        }
        .pkg-card__top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
        }
        .pkg-card__name {
          font-family: var(--font-display);
          font-size: 15px;
          font-weight: 600;
          color: var(--black);
          line-height: 1.3;
        }
        .pkg-card__desc {
          font-size: 12px;
          color: var(--grey-500);
          margin-top: 3px;
          line-height: 1.5;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .pkg-card__price {
          font-family: var(--font-display);
          font-size: 16px;
          font-weight: 600;
          color: var(--black);
          white-space: nowrap;
          flex-shrink: 0;
        }
        .pkg-card__deliverables {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .pkg-card__deliverable {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: var(--grey-600);
        }
        .pkg-card__deliverable .ti-check {
          color: var(--status-success);
          font-size: 11px;
          flex-shrink: 0;
        }
        .pkg-card__footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 10px;
          border-top: 0.5px solid var(--grey-100);
        }
        .pkg-card__actions {
          display: flex;
          gap: 4px;
        }
      `}</style>
    </div>
  );
}
