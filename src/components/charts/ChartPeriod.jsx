/**
 * The one date-range control for charts - a row of pills, one pressed.
 * Changing it must never repaint series (colour follows the entity).
 *
 * @param {Array<{value, label}>|string[]} options
 * @param {string} value
 * @param {(value) => void} onChange
 */
export default function ChartPeriod({ options = [], value, onChange, label = 'Period' }) {
  const opts = options.map((o) => (typeof o === 'string' ? { value: o, label: o.toUpperCase() } : o));
  return (
    <div className="chart-period" role="group" aria-label={label}>
      {opts.map((o) => (
        <button key={o.value} type="button" aria-pressed={value === o.value} onClick={() => onChange(o.value)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}
