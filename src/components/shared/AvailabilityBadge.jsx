const STATUS_MAP = {
  open: {
    label: 'Open',
    dot: 'var(--status-success)',
    style: {
      background: 'var(--status-success-bg)',
      color: 'var(--status-success-text)',
      border: '0.5px solid rgba(0,185,107,0.2)',
    },
  },
  limited: {
    label: 'Limited',
    dot: 'var(--status-warning)',
    style: {
      background: 'var(--status-warning-bg)',
      color: 'var(--status-warning-text)',
      border: '0.5px solid rgba(245,166,35,0.25)',
    },
  },
  fully_booked: {
    label: 'Fully Booked',
    dot: 'var(--status-error)',
    style: {
      background: 'var(--status-error-bg)',
      color: 'var(--status-error-text)',
      border: '0.5px solid rgba(255,75,75,0.2)',
    },
  },
};

/**
 * AvailabilityBadge
 * @param {'open'|'limited'|'fully_booked'} status
 * @param {'sm'|'md'} [size]
 */
export default function AvailabilityBadge({ status = 'open', size = 'md' }) {
  const config = STATUS_MAP[status] ?? STATUS_MAP.open;
  const padding = size === 'sm' ? '3px 8px' : '4px 10px';
  const fontSize = size === 'sm' ? '10px' : '12px';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--space-8)',
        fontFamily: 'var(--font-body)',
        fontSize,
        fontWeight: 500,
        padding,
        borderRadius: 'var(--radius-pill)',
        lineHeight: 1,
        ...config.style,
      }}
    >
      <span
        style={{
          width: '7px',
          height: '7px',
          borderRadius: '50%',
          background: config.dot,
          flexShrink: 0,
        }}
      />
      {config.label}
    </span>
  );
}