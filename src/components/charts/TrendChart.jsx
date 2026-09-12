import {
  ResponsiveContainer, AreaChart, Area, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts';
import ChartTooltip from './ChartTooltip';
import { SERIES, MUTED, GRID, SURFACE, TICK, MARGIN, LINE_WIDTH, DOT_R, AREA_OPACITY, compact } from './chartTheme';

/**
 * Change over time.
 *  - one series  -> area (a 10% wash under a 2px line)
 *  - 2-4 series  -> lines, fixed colour order, legend supplied by ChartFrame
 *  - `emphasis`  -> the named series in the brand hue, everything else muted grey
 *
 * @param {Array<object>} data       - rows, one per x tick
 * @param {string}        x          - key of the x value (already formatted for display)
 * @param {Array<{key, label}>} series
 * @param {string}        [emphasis] - series key to highlight; others go grey
 * @param {(v) => string} [format]   - tooltip/axis value formatter (default compact)
 * @param {number}        [height]   - default 220
 */
export default function TrendChart({ data = [], x = 'label', series = [], emphasis, format = compact, height = 220, yTicks = true }) {
  const single = series.length === 1;
  const colorFor = (i, key) => (emphasis ? (key === emphasis ? SERIES[0] : MUTED) : SERIES[i % SERIES.length]);
  const axes = (
    <>
      <CartesianGrid stroke={GRID} vertical={false} />
      <XAxis dataKey={x} tick={TICK} axisLine={false} tickLine={false} interval="preserveStartEnd" minTickGap={24} />
      {yTicks && <YAxis tick={TICK} axisLine={false} tickLine={false} width={40} tickFormatter={compact} allowDecimals={false} />}
      <Tooltip
        cursor={{ stroke: GRID, strokeWidth: 1 }}
        content={<ChartTooltip format={(v) => format(v)} />}
      />
    </>
  );

  return (
    <ResponsiveContainer width="100%" height={height}>
      {single ? (
        <AreaChart data={data} margin={MARGIN}>
          {axes}
          <Area
            type="monotone"
            dataKey={series[0].key}
            name={series[0].label}
            stroke={SERIES[0]}
            strokeWidth={LINE_WIDTH}
            fill={SERIES[0]}
            fillOpacity={AREA_OPACITY}
            dot={false}
            activeDot={{ r: DOT_R, stroke: SURFACE, strokeWidth: 2, fill: SERIES[0] }}
            isAnimationActive={false}
          />
        </AreaChart>
      ) : (
        <LineChart data={data} margin={MARGIN}>
          {axes}
          {series.map((s, i) => {
            const c = colorFor(i, s.key);
            return (
              <Line
                key={s.key}
                type="monotone"
                dataKey={s.key}
                name={s.label}
                stroke={c}
                strokeWidth={LINE_WIDTH}
                strokeLinecap="round"
                strokeLinejoin="round"
                dot={false}
                activeDot={{ r: DOT_R, stroke: SURFACE, strokeWidth: 2, fill: c }}
                isAnimationActive={false}
              />
            );
          })}
        </LineChart>
      )}
    </ResponsiveContainer>
  );
}
