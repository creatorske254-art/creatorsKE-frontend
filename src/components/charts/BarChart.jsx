import {
  ResponsiveContainer, BarChart as RBarChart, Bar, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, LabelList,
} from 'recharts';
import ChartTooltip from './ChartTooltip';
import {
  SERIES, MUTED, GRID, SURFACE, AXIS, TICK, MARGIN,
  BAR_MAX, BAR_RADIUS, GAP, compact,
} from './chartTheme';

/**
 * Compare magnitude across categories, or part-to-whole when stacked.
 *
 *  - one series, `layout="vertical"` (default) -> columns in the brand hue
 *  - `layout="horizontal"`                     -> bars, categories down the side,
 *                                                 value at the bar tip (long names)
 *  - 2-4 series, `stacked`                     -> stacked with a 2px surface gap
 *  - 2-4 series, not stacked                   -> grouped
 *  - `emphasis={(row) => bool}`                -> matching rows keep the hue, the
 *                                                 rest go muted grey (one series only)
 *
 * @param {Array<object>} data
 * @param {string}        x        - category key
 * @param {Array<{key, label}>} series
 * @param {'vertical'|'horizontal'} [layout]
 * @param {boolean}       [stacked]
 * @param {(row) => boolean} [emphasis]
 * @param {boolean}       [labels]  - direct value labels at the data end (horizontal bars)
 * @param {(v) => string} [format]
 * @param {number}        [height]
 */
export default function BarChart({
  data = [], x = 'label', series = [], layout = 'vertical', stacked = false,
  emphasis, labels = false, format = compact, height = 220,
}) {
  const horizontal = layout === 'horizontal';
  const single = series.length === 1;
  const radius = horizontal ? [0, BAR_RADIUS, BAR_RADIUS, 0] : [BAR_RADIUS, BAR_RADIUS, 0, 0];
  // Only the outermost segment of a stack gets the rounded data-end.
  const radiusFor = (i) => (!stacked || i === series.length - 1 ? radius : 0);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RBarChart
        data={data}
        layout={horizontal ? 'vertical' : 'horizontal'}
        margin={horizontal ? { ...MARGIN, right: labels ? 48 : 8 } : MARGIN}
        barCategoryGap="30%"
        barGap={GAP}
      >
        <CartesianGrid stroke={GRID} vertical={horizontal} horizontal={!horizontal} />
        {horizontal ? (
          <>
            <XAxis type="number" tick={TICK} axisLine={false} tickLine={false} tickFormatter={compact} hide={labels} allowDecimals={false} />
            <YAxis type="category" dataKey={x} tick={{ ...TICK, fill: AXIS }} axisLine={false} tickLine={false} width={Math.min(120, 8 + 6.2 * Math.max(...data.map((d) => String(d[x] ?? '').length), 4))} interval={0} />
          </>
        ) : (
          <>
            <XAxis dataKey={x} tick={TICK} axisLine={false} tickLine={false} interval={data.length <= 12 ? 0 : 'preserveStartEnd'} minTickGap={16} />
            <YAxis tick={TICK} axisLine={false} tickLine={false} width={40} tickFormatter={compact} allowDecimals={false} />
          </>
        )}
        <Tooltip cursor={{ fill: GRID, fillOpacity: 0.5 }} content={<ChartTooltip format={(v) => format(v)} />} />
        {series.map((s, i) => (
          <Bar
            key={s.key}
            dataKey={s.key}
            name={s.label}
            stackId={stacked ? 'stack' : undefined}
            fill={SERIES[i % SERIES.length]}
            stroke={stacked ? SURFACE : undefined}
            strokeWidth={stacked ? GAP : 0}
            maxBarSize={BAR_MAX}
            radius={radiusFor(i)}
            isAnimationActive={false}
          >
            {single && emphasis && data.map((row, j) => (
              <Cell key={j} fill={emphasis(row) ? SERIES[0] : MUTED} />
            ))}
            {labels && single && (
              <LabelList
                dataKey={s.key}
                position={horizontal ? 'right' : 'top'}
                formatter={(v) => format(v)}
                style={{ fill: 'var(--grey-600)', fontSize: 11, fontFamily: 'var(--font-body)' }}
              />
            )}
          </Bar>
        ))}
      </RBarChart>
    </ResponsiveContainer>
  );
}
