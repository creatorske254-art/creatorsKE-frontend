import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import ChartTooltip from './ChartTooltip';
import { SERIES, MUTED, SURFACE, GAP, compact } from './chartTheme';

/**
 * Part-to-whole for a handful of categories (<= 4 - more than that belongs in
 * a horizontal stacked bar or a table). The hole carries the headline figure;
 * the list beside it is the legend AND the direct labels, so identity never
 * rests on colour alone.
 *
 * @param {Array<{label, value}>} data
 * @param {ReactNode} [center]      - hero figure in the hole (default: the total)
 * @param {string}    [centerLabel] - caption under the hero figure
 * @param {(v) => string} [format]
 * @param {number}    [size]        - ring diameter, default 148
 */
export default function DonutChart({ data = [], center, centerLabel = 'Total', format = compact, size = 148 }) {
  const rows = data.slice(0, 4);
  const total = rows.reduce((s, d) => s + (Number(d.value) || 0), 0);
  const empty = total === 0;
  const plotted = empty ? [{ label: 'None', value: 1 }] : rows;

  return (
    <div className="donut">
      <div className="donut__ring" style={{ width: size, height: size }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={plotted}
              dataKey="value"
              nameKey="label"
              innerRadius="68%"
              outerRadius="100%"
              startAngle={90}
              endAngle={-270}
              stroke={SURFACE}
              strokeWidth={GAP}
              isAnimationActive={false}
            >
              {plotted.map((_, i) => (
                <Cell key={i} fill={empty ? MUTED : SERIES[i % SERIES.length]} />
              ))}
            </Pie>
            {!empty && <Tooltip content={<ChartTooltip format={(v) => `${format(v)} (${Math.round((v / total) * 100)}%)`} />} />}
          </PieChart>
        </ResponsiveContainer>
        <div className="donut__center" aria-hidden="true">
          <div className="donut__hero" style={{ fontSize: String(center ?? format(total)).length > 7 ? 15 : String(center ?? format(total)).length > 5 ? 18 : 22 }}>{center ?? format(total)}</div>
          <div className="donut__caption">{centerLabel}</div>
        </div>
      </div>
      <ul className="donut__list" aria-label="Breakdown">
        {rows.map((d, i) => (
          <li key={d.label}>
            <span className="chart-legend__swatch" style={{ background: empty ? MUTED : SERIES[i % SERIES.length] }} aria-hidden="true" />
            <span className="donut__name">{d.label}</span>
            <span className="donut__value">{format(d.value)}</span>
            <span className="donut__pct">{total ? `${Math.round((d.value / total) * 100)}%` : '0%'}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
