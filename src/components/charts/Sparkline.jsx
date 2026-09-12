import { ResponsiveContainer, AreaChart, Area } from 'recharts';
import { SERIES, MUTED, AREA_OPACITY, LINE_WIDTH } from './chartTheme';

/**
 * A stat tile's trend: no axes, no grid, no tooltip - the number beside it is
 * the value, this only says "which way". Colour follows the tile's delta
 * (up -> brand hue, down -> muted) so it never competes with the figure.
 *
 * @param {number[]} data
 * @param {'up'|'down'|'flat'} [trend]
 */
export default function Sparkline({ data = [], trend = 'up', height = 36 }) {
  if (!data.length) return null;
  const color = trend === 'down' ? MUTED : SERIES[0];
  const rows = data.map((v, i) => ({ i, v }));
  return (
    <div className="sparkline" aria-hidden="true" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={rows} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
          <Area type="monotone" dataKey="v" stroke={color} strokeWidth={LINE_WIDTH} fill={color} fillOpacity={AREA_OPACITY} dot={false} isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
