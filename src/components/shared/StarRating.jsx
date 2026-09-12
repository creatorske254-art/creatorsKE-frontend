import { useState } from 'react';
import { IconStar, IconStarFilled } from '@tabler/icons-react';

/**
 * StarRating
 * @param {number}   value       - current rating (1–5)
 * @param {function} [onChange]  - if provided, renders interactive mode
 * @param {string}   [size]      - icon size tier: xs | sm | md | lg | xl (default md)
 * @param {boolean}  [showCount] - shows "(n)" after stars in display mode
 * @param {number}   [count]     - review count to display
 */
export default function StarRating({
  value = 0,
  onChange,
  size = 'md',
  showCount = false,
  count,
}) {
  const [hovered, setHovered] = useState(null);
  const interactive = typeof onChange === 'function';
  const display = hovered ?? value;

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-4)' }}>
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= display;
        return (
          <button
            key={star}
            type="button"
            onClick={interactive ? () => onChange(star) : undefined}
            onMouseEnter={interactive ? () => setHovered(star) : undefined}
            onMouseLeave={interactive ? () => setHovered(null) : undefined}
            style={{
              background: 'none',
              border: 'none',
              padding: 'var(--space-2)',
              cursor: interactive ? 'pointer' : 'default',
              display: 'flex',
              alignItems: 'center',
              color: filled ? '#F5A623' : 'var(--grey-200)',
              transition: 'color 0.1s',
            }}
            aria-label={interactive ? `Rate ${star} star${star !== 1 ? 's' : ''}` : undefined}
          >
            {filled ? (
              <IconStarFilled className={`icon-${size}`} aria-hidden="true" />
            ) : (
              <IconStar className={`icon-${size}`} aria-hidden="true" />
            )}
          </button>
        );
      })}

      {showCount && count !== undefined && (
        <span
          style={{
            fontSize: '12px',
            color: 'var(--grey-400)',
            marginLeft: 'var(--space-4)',
            fontFamily: 'var(--font-body)',
          }}
        >
          ({count})
        </span>
      )}
    </div>
  );
}