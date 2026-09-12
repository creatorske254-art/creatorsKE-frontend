import Skeleton from '@/components/ui/Skeleton';
import EmptyState from '@/components/shared/EmptyState';
import DemoTag from '@/components/shared/DemoTag';
import { IconChartAreaLine } from '@tabler/icons-react';

/**
 * The card every chart sits in: title row, optional controls, legend for
 * multi-series charts, and the three non-data states (loading / error / empty)
 * so no chart component has to handle them itself.
 *
 * @param {string}    title
 * @param {ReactNode} [subtitle]   - the headline figure or period, under the title
 * @param {ReactNode} [right]      - controls (period pills, a "View all" link)
 * @param {Array<{label, color}>} [legend] - rendered when there are >= 2 series
 * @param {boolean}   [loading]
 * @param {string|boolean} [error] - a message, or true for the generic one
 * @param {boolean}   [empty]      - data came back but there is nothing to plot
 * @param {string}    [emptyTitle]
 * @param {string}    [emptyDescription]
 * @param {boolean}   [demo]       - sample data is being shown (dev only); tags the title
 * @param {number}    [height]     - plot height, default 220
 * @param {boolean}   [bare]       - no .card chrome (when embedding in another card)
 */
export default function ChartFrame({
  title, subtitle, right, legend, loading, error, empty,
  emptyTitle = 'Nothing to show yet', emptyDescription,
  demo, height = 220, bare = false, className = '', children,
}) {
  const showLegend = legend && legend.length >= 2;
  return (
    <section className={`${bare ? '' : 'card card-p-md '}chart-frame ${className}`.trim()}>
      <div className="chart-frame__head">
        <div style={{ minWidth: 0 }}>
          <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-8)' }}>
            {title}{demo && <DemoTag />}
          </h2>
          {subtitle && <div className="chart-frame__subtitle">{subtitle}</div>}
        </div>
        {right && <div className="chart-frame__right">{right}</div>}
      </div>

      {showLegend && !loading && !error && !empty && (
        <ul className="chart-legend" aria-label="Series">
          {legend.map((l) => (
            <li key={l.label}>
              <span className="chart-legend__swatch" style={{ background: l.color }} aria-hidden="true" />
              {l.label}
            </li>
          ))}
        </ul>
      )}

      <div className="chart-frame__body" style={{ minHeight: height }}>
        {loading ? (
          <Skeleton width="100%" height={height} />
        ) : error ? (
          <EmptyState
            size="sm"
            icon={<IconChartAreaLine />}
            title="Couldn't load this chart"
            description={typeof error === 'string' ? error : 'Something went wrong fetching this data.'}
          />
        ) : empty ? (
          <EmptyState size="sm" icon={<IconChartAreaLine />} title={emptyTitle} description={emptyDescription} />
        ) : (
          children
        )}
      </div>
    </section>
  );
}
