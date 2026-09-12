/**
 * The one place chart styling is decided. Every chart in src/components/charts
 * reads from here, so a dashboard built from three different chart types still
 * reads as one system.
 *
 * Colour slots come from the --chart-* tokens in index.css (validated for
 * light and dark). Series are assigned in FIXED order: series[0] is always the
 * primary, and a filter that hides a series never repaints the survivors.
 */
export const SERIES = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)'];
export const MUTED = 'var(--chart-muted)';
export const GRID = 'var(--chart-grid)';
export const AXIS = 'var(--chart-axis)';
export const SURFACE = 'var(--chart-surface)';

/* Sequential "more is darker" steps on the brand hue, for heat-style magnitude. */
export const SEQUENTIAL = ['var(--purple-100)', 'var(--purple-300)', 'var(--purple-500)', 'var(--purple-700)'];

/* Mark specs - fixed across every chart (thin, rounded data-end, square baseline). */
export const BAR_MAX = 24;          // px - a bar never fills its slot
export const BAR_RADIUS = 4;        // px - on the data end only
export const LINE_WIDTH = 2;
export const DOT_R = 4;             // >= 8px marker
export const AREA_OPACITY = 0.1;    // a wash, never a block
export const GAP = 2;               // px surface gap between touching marks

export const TICK = { fill: AXIS, fontSize: 11, fontFamily: 'var(--font-body)' };
export const MARGIN = { top: 8, right: 8, left: 0, bottom: 0 };

/* Clean axis ticks: 0 / 5K / 10K rather than 0 / 4,312 / 8,624. */
export function compact(n) {
  if (n === null || n === undefined || Number.isNaN(n)) return '';
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `${(n / 1_000_000).toFixed(abs % 1_000_000 === 0 ? 0 : 1)}M`;
  if (abs >= 1_000) return `${(n / 1_000).toFixed(abs % 1_000 === 0 ? 0 : 1)}K`;
  return String(Math.round(n));
}

export function kes(n) {
  if (n === null || n === undefined) return '-';
  return `KES ${Number(n).toLocaleString('en-KE')}`;
}

export function pct(n) {
  if (n === null || n === undefined) return '-';
  return `${Math.round(n)}%`;
}
