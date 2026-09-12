/**
 * EmptyState
 * Standard icon + title + description block for "nothing here yet" states
 * (empty lists, empty tables, empty search results). Uses the canonical
 * .empty-state/.empty-icon/.empty-title/.empty-desc classes from index.css -
 * wrap in .card or .card-dashed yourself where a bordered box is wanted,
 * this component is just the content.
 *
 * @param {ReactNode} icon        - a @tabler/icons-react element; sized here (xl, or lg when size='sm'),
 *                                  so callers pass it bare: icon={<IconInbox />}
 * @param {string}    title       - short heading, e.g. "No campaigns yet"
 * @param {ReactNode} [description] - one or two lines of supporting text
 * @param {ReactNode} [action]    - optional button/link rendered below the description
 * @param {'md'|'sm'} [size]      - 'sm' for compact contexts (dropdowns, side panels)
 */
import { cloneElement, isValidElement } from 'react';

export default function EmptyState({ icon, title, description, action, size = 'md' }) {
  const isSmall = size === 'sm';
  const sizedIcon = isValidElement(icon) ? cloneElement(icon, { className: isSmall ? 'icon-lg' : 'icon-xl', 'aria-hidden': 'true' }) : icon;

  return (
    <div className={`empty-state${isSmall ? ' empty-state-sm' : ''}`}>
      {icon && <div className={`empty-icon${isSmall ? ' empty-icon-sm' : ''}`}>{sizedIcon}</div>}
      {title && <div className="empty-title">{title}</div>}
      {description && <div className="empty-desc">{description}</div>}
      {action}
    </div>
  );
}
