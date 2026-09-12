import EmptyState from '@/components/shared/EmptyState';
import ErrorState from '@/components/shared/ErrorState';
import Skeleton from '@/components/ui/Skeleton';
import { formatCurrency, formatDate } from '@/lib/utils';

// GET /payments/transactions' response schema is undocumented - field names
// below are best-effort guesses with graceful fallbacks (see CLAUDE.md).
function normalizeTransaction(t) {
  const amount = Number(t.amount ?? 0);
  return {
    id: t.id,
    name: t.counterpartyName ?? t.description ?? t.name ?? 'Transaction',
    sub: t.note ?? t.method ?? t.sub ?? '',
    date: formatDate(t.date ?? t.createdAt),
    amount,
    positive: amount >= 0,
  };
}

/**
 * TransactionHistory - list of a creator's payments/payouts, backed by
 * usePayments(). `variant="table"` matches the compact dashboard-table look
 * (Description/Date/Amount columns); `variant="list"` matches a modal-style
 * full history list. Pass raw transactions from usePayments().transactions.
 */
export default function TransactionHistory({
  transactions = [],
  isLoading = false,
  isError = false,
  onRetry,
  variant = 'table',
  limit,
}) {
  if (isError) return <ErrorState size="sm" onRetry={onRetry} />;

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: variant === 'table' ? 16 : 0 }}>
        {[0, 1, 2].map((i) => <Skeleton key={i} width="100%" height={36} />)}
      </div>
    );
  }

  const rows = (limit ? transactions.slice(0, limit) : transactions).map(normalizeTransaction);

  if (rows.length === 0) {
    return (
      <EmptyState
        size="sm"
        icon={<i className="ti ti-receipt-2" style={{ fontSize: 20 }} aria-hidden="true" />}
        title="No transactions yet"
        description="Payments and payouts will show up here."
      />
    );
  }

  if (variant === 'list') {
    return (
      <div>
        {rows.map((t) => (
          <div key={t.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '12px 0', borderBottom: '0.5px solid var(--grey-100)' }}>
            <div>
              <div style={{ fontWeight: 500, fontSize: 13 }}>{t.name}</div>
              <div style={{ fontSize: 11.5, color: 'var(--grey-400)', marginTop: 1 }}>{t.sub}{t.sub ? ' · ' : ''}{t.date}</div>
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: t.positive ? 'var(--status-success-text)' : 'var(--status-error-text)', flexShrink: 0 }}>
              {t.positive ? '+' : '−'}{formatCurrency(Math.abs(t.amount))}
            </span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <table className="data-table">
      <thead>
        <tr>
          <th>Description</th>
          <th>Date</th>
          <th style={{ textAlign: 'right' }}>Amount</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((t) => (
          <tr key={t.id}>
            <td>
              <div style={{ fontWeight: 500 }}>{t.name}</div>
              <div style={{ fontSize: 11.5, color: 'var(--grey-400)', marginTop: 1 }}>{t.sub}</div>
            </td>
            <td style={{ fontSize: 12, color: 'var(--grey-400)' }}>{t.date}</td>
            <td style={{ textAlign: 'right' }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: t.positive ? 'var(--status-success-text)' : 'var(--status-error-text)' }}>
                {t.positive ? '+' : '−'}{formatCurrency(Math.abs(t.amount))}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
