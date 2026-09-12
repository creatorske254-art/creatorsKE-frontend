import { useId, useState } from 'react';
import { IconChevronDown } from '@tabler/icons-react';

/**
 * A card whose body folds away behind its title. Collapsed by default so a
 * long settings tab reads as a scannable list of sections; the whole header
 * row toggles it (click or Enter/Space), and anything passed to `right`
 * (a status tag, a hint, an action) sits in the header without triggering
 * the toggle.
 *
 * @param {ReactNode} title        - rendered with the .card-title role
 * @param {ReactNode} [right]      - trailing header content
 * @param {boolean}   [defaultOpen]
 * @param {string}    [className]  - card classes, default "card card-p-lg"
 */
export default function CollapsibleCard({ title, right, defaultOpen = false, className = 'card card-p-lg', children }) {
  const [open, setOpen] = useState(defaultOpen);
  const bodyId = useId();
  const toggle = () => setOpen((o) => !o);

  return (
    <section className={className} data-collapsed={!open || undefined}>
      <div
        role="button"
        tabIndex={0}
        aria-expanded={open}
        aria-controls={bodyId}
        onClick={toggle}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } }}
        style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', userSelect: 'none' }}
      >
        <span className="card-title" style={{ marginBottom: 0, flex: 1, minWidth: 0 }}>{title}</span>
        {right && (
          <div onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()} style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
            {right}
          </div>
        )}
        <IconChevronDown
          size={16}
          aria-hidden="true"
          style={{ color: 'var(--grey-400)', flexShrink: 0, transition: 'transform .18s ease', transform: open ? 'rotate(180deg)' : 'none' }}
        />
      </div>
      {open && <div id={bodyId} className="collapsible-card__body">{children}</div>}
    </section>
  );
}
