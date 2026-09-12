import { IconTrendingUp, IconTrendingDown } from '@tabler/icons-react';

/**
 * StatCard - generic metric tile
 * @param {string}  label      - uppercase label above the value
 * @param {string}  value      - the big number / metric
 * @param {string}  [delta]    - e.g. "+12% this month"
 * @param {'up'|'down'} [trend] - controls delta color
 * @param {boolean} [purple]   - purple variant (dark bg)
 */
export default function StatCard({ label, value, delta, trend, purple = false }) {
  const base = {
    borderRadius: 'var(--radius-lg)',
    padding: 'var(--space-20)',
    border: purple ? 'none' : '0.5px solid var(--grey-100)',
    background: purple ? 'var(--purple-500)' : 'var(--white)',
  };

  const labelColor = purple ? 'rgba(255,255,255,0.65)' : 'var(--grey-400)';
  const valueColor = purple ? 'var(--white)' : 'var(--black)';
  const deltaColor =
    purple
      ? 'rgba(255,255,255,0.7)'
      : trend === 'up'
      ? 'var(--status-success-text)'
      : 'var(--status-error-text)';

  return (
    <div style={base}>
      <div
        style={{
          fontSize: '11px',
          fontWeight: 500,
          letterSpacing: '0.07em',
          textTransform: 'uppercase',
          color: labelColor,
          marginBottom: 'var(--space-8)',
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '32px',
          fontWeight: 600,
          color: valueColor,
          lineHeight: 1,
          marginBottom: 'var(--space-8)',
        }}
      >
        {value}
      </div>

      {delta && (
        <div
          style={{
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-4)',
            color: deltaColor,
          }}
        >
          {!purple && trend === 'up' && <IconTrendingUp className="icon-sm" />}
          {!purple && trend === 'down' && <IconTrendingDown className="icon-sm" />}
          {delta}
        </div>
      )}
    </div>
  );
}