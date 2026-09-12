import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import Skeleton from '@/components/ui/Skeleton';
import EmptyState from '@/components/shared/EmptyState';
import { IconChartAreaLine } from '@tabler/icons-react';

const PERIOD_LABELS = { '7d': '7 days', '30d': '30 days', '90d': '90 days' };

/**
 * Formats a 'YYYY-MM-DD' date string into a short label.
 * '2024-07-04' → 'Jul 4'
 */
function formatDateLabel(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-KE', { month: 'short', day: 'numeric' });
}

/**
 * Formats KES amount for tooltip.
 */
function formatKES(value) {
  return `KES ${value.toLocaleString('en-KE')}`;
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="earnings-chart__tooltip">
      <p className="earnings-chart__tooltip-date">{label}</p>
      <p className="earnings-chart__tooltip-value">{formatKES(payload[0].value)}</p>
    </div>
  );
}

/**
 * EarningsChart
 *
 * Props:
 *   data: [{ date: 'YYYY-MM-DD', amount: number }]
 *   period: '7d' | '30d' | '90d'
 *   onPeriodChange: (period) => void
 *   loading: bool
 *   error: string | null
 *   periods: string[]
 */
export default function EarningsChart({
  data = [],
  period,
  onPeriodChange,
  loading,
  error,
  periods = ['7d', '30d', '90d'],
}) {
  const chartData = data.map((d) => ({
    date: formatDateLabel(d.date),
    amount: d.amount,
  }));

  const totalEarned = data.reduce((sum, d) => sum + d.amount, 0);

  return (
    <div className="earnings-chart">
      <div className="earnings-chart__header">
        <div>
          <h3 className="earnings-chart__title">Earnings</h3>
          {!loading && !error && (
            <p className="earnings-chart__total">
              {formatKES(totalEarned)}{' '}
              <span className="earnings-chart__period-label">
                last {PERIOD_LABELS[period]}
              </span>
            </p>
          )}
        </div>

        <div className="earnings-chart__period-toggle" role="group" aria-label="Select period">
          {periods.map((p) => (
            <button
              key={p}
              className={`earnings-chart__period-btn${period === p ? ' earnings-chart__period-btn--active' : ''}`}
              onClick={() => onPeriodChange(p)}
              aria-pressed={period === p}
            >
              {PERIOD_LABELS[p]}
            </button>
          ))}
        </div>
      </div>

      <div className="earnings-chart__body">
        {loading ? (
          <Skeleton width="100%" height={220} />
        ) : error ? (
          <p className="earnings-chart__error">{error}</p>
        ) : data.length === 0 ? (
          <EmptyState
            icon={<IconChartAreaLine />}
            title="No earnings yet"
            description={`No earnings recorded for the last ${PERIOD_LABELS[period]}.`}
          />
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
              <defs>
                <linearGradient id="earningsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-accent)" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="var(--color-accent)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--color-border)"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={36}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--color-accent)', strokeWidth: 1 }} />
              <Area
                type="monotone"
                dataKey="amount"
                stroke="var(--color-accent)"
                strokeWidth={2}
                fill="url(#earningsGradient)"
                dot={false}
                activeDot={{ r: 4, fill: 'var(--color-accent)', stroke: 'var(--color-bg)', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}