import { pct } from './chartTheme';

/**
 * A single ratio against a limit (never a two-slice pie). Track and fill are
 * the same hue, two steps apart. Pass `status` to colour the fill by state -
 * only when the ratio genuinely is a state (a limit nearly hit), not decoration.
 *
 * @param {number} value
 * @param {number} [max]     - default 100
 * @param {string} [label]
 * @param {ReactNode} [detail] - right-hand text, default "value / max"
 * @param {'success'|'warning'|'error'} [status]
 */
export default function Meter({ value = 0, max = 100, label, detail, status }) {
  const ratio = max ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  const fill = status ? `var(--status-${status})` : 'var(--chart-1)';
  return (
    <div className="meter">
      {(label || detail !== null) && (
        <div className="meter__row">
          {label && <span className="meter__label">{label}</span>}
          <span className="meter__detail">{detail ?? (max === 100 ? pct(value) : `${value} / ${max}`)}</span>
        </div>
      )}
      <div className="meter__track" role="progressbar" aria-valuenow={Math.round(ratio)} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
        <div className="meter__fill" style={{ width: `${ratio}%`, background: fill }} />
      </div>
    </div>
  );
}
