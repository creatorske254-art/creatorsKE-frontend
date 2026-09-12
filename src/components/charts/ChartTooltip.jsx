/**
 * Shared Recharts tooltip content. Values wear text tokens; the series colour
 * is carried by the swatch beside each row, never by the text.
 *
 * @param {(value, name, entry) => string} [format]  - per-row value formatter
 * @param {(label) => string}              [labelFormat]
 */
export default function ChartTooltip({ active, payload, label, format, labelFormat }) {
  if (!active || !payload?.length) return null;
  const rows = payload.filter((p) => p.value !== undefined && p.value !== null);
  if (!rows.length) return null;
  return (
    <div className="chart-tooltip" role="status">
      {label !== undefined && label !== '' && (
        <div className="chart-tooltip__label">{labelFormat ? labelFormat(label) : label}</div>
      )}
      {rows.map((p) => (
        <div key={p.dataKey ?? p.name} className="chart-tooltip__row">
          <span className="chart-legend__swatch" style={{ background: p.color || p.payload?.fill || p.fill }} aria-hidden="true" />
          <span className="chart-tooltip__name">{p.name}</span>
          <span className="chart-tooltip__value">{format ? format(p.value, p.name, p) : p.value}</span>
        </div>
      ))}
    </div>
  );
}
