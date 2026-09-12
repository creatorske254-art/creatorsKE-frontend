/**
 * The app's one chart kit - Recharts underneath, styled once in chartTheme.js
 * and index.css (.chart-*). Pick by the data's job:
 *
 *   TrendChart  - change over time (area for one series, lines for 2-4, `emphasis` to spotlight one)
 *   BarChart    - magnitude across categories (columns), long names (horizontal), part-to-whole (stacked)
 *   DonutChart  - part-to-whole for <= 4 categories with a headline figure in the hole
 *   Sparkline   - a stat tile's trend, no axes
 *   Meter       - one ratio against a limit
 *   ChartFrame  - the card + title + legend + loading/error/empty states around any of them
 *
 * Never a dual-axis chart, never a pie for two slices, never more than four series.
 */
export { default as ChartFrame } from './ChartFrame';
export { default as ChartTooltip } from './ChartTooltip';
export { default as ChartPeriod } from './ChartPeriod';
export { default as TrendChart } from './TrendChart';
export { default as BarChart } from './BarChart';
export { default as DonutChart } from './DonutChart';
export { default as Sparkline } from './Sparkline';
export { default as Meter } from './Meter';
export * from './chartTheme';
