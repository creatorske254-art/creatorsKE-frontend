import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { usePageMeta } from '@/lib/usePageMeta';
import { useBrandTransactions } from '@/features/brand-dashboard/hooks/useBrandBilling';
import { formatCurrency, formatDate } from '@/lib/utils';
import Skeleton from '@/components/ui/Skeleton';
import EmptyState from '@/components/shared/EmptyState';
import ErrorState from '@/components/shared/ErrorState';
import { ChartFrame, ChartPeriod, BarChart, DonutChart, SERIES, kes } from '@/components/charts';
import { IconArrowUp, IconDownload, IconReceipt2, IconRotateClockwise, IconSearch, IconLockDollar } from '@tabler/icons-react';

/*
   Transaction history (brand): every movement of money through escrow.
   deposit  - brand funds a booking (money goes into escrow)
   release  - brand approves delivery (money goes to the creator)
   refund   - dispute decided for the brand / cancelled booking
   fee      - plan or platform charge
   Backed by GET /brands/transactions (BACKEND_API_SPEC.md).
*/

const TYPE_META = {
  deposit: { label: 'Deposit to escrow', icon: IconLockDollar, sign: -1 },
  release: { label: 'Released to creator', icon: IconArrowUp, sign: 0 },
  refund:  { label: 'Refund', icon: IconRotateClockwise, sign: 1 },
  fee:     { label: 'Platform fee', icon: IconReceipt2, sign: -1 },
};
const STATUS_TAG = {
  completed: { cls: 'tag-success', label: 'Completed' },
  held:      { cls: 'tag-info',    label: 'In escrow' },
  pending:   { cls: 'tag-warning', label: 'Pending' },
  failed:    { cls: 'tag-error',   label: 'Failed' },
};
const TYPE_FILTERS = [{ id: 'all', label: 'All' }, { id: 'deposit', label: 'Deposits' }, { id: 'release', label: 'Releases' }, { id: 'refund', label: 'Refunds' }, { id: 'fee', label: 'Fees' }];
const RANGES = [{ value: '30d', label: '30D' }, { value: '90d', label: '90D' }, { value: '1y', label: '1Y' }];

function withinRange(iso, range) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return true;
  const days = range === '30d' ? 30 : range === '90d' ? 90 : 365;
  return Date.now() - d.getTime() <= days * 86400000;
}

function toCsv(rows) {
  const head = ['Date', 'Type', 'Campaign', 'Creator', 'Amount (KES)', 'Status', 'Reference'];
  const body = rows.map((t) => [t.date, t.type, t.campaign ?? '', t.creator ?? '', t.amount, t.status, t.id].map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','));
  return [head.join(','), ...body].join('\n');
}

export default function TransactionsPage() {
  usePageMeta('Transaction history', 'Every escrow deposit, release, refund and fee on your Creatorske account.');
  const navigate = useNavigate();
  const [type, setType] = useState('all');
  const [range, setRange] = useState('90d');
  const [query, setQuery] = useState('');

  const { query: txQuery, rows: rawRows } = useBrandTransactions({ range });
  const tx = { data: txQuery.data, isLoading: txQuery.isLoading };
  const rows = useMemo(() => (Array.isArray(tx.data) ? tx.data : tx.data?.transactions ?? rawRows ?? []), [tx.data, rawRows]);

  const inRange = useMemo(() => rows.filter((t) => withinRange(t.date ?? t.createdAt, range)), [rows, range]);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return inRange.filter((t) => (type === 'all' || t.type === type) && (!q || `${t.campaign} ${t.creator} ${t.id}`.toLowerCase().includes(q)));
  }, [inRange, type, query]);

  const totals = useMemo(() => {
    const sum = (pred) => inRange.filter(pred).reduce((s, t) => s + Number(t.amount ?? 0), 0);
    return {
      held: sum((t) => t.type === 'deposit' && t.status === 'held'),
      released: sum((t) => t.type === 'release'),
      refunded: sum((t) => t.type === 'refund'),
      fees: sum((t) => t.type === 'fee'),
    };
  }, [inRange]);

  // Escrow flow by month: deposits in vs releases out.
  const flowRows = useMemo(() => {
    const months = new Map();
    const now = new Date();
    const n = range === '30d' ? 2 : range === '90d' ? 4 : 12;
    for (let i = n - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.set(`${d.getFullYear()}-${d.getMonth()}`, { label: d.toLocaleDateString('en-KE', { month: 'short' }), deposits: 0, releases: 0, refunds: 0 });
    }
    for (const t of inRange) {
      const d = new Date(t.date ?? t.createdAt);
      const row = Number.isNaN(d.getTime()) ? null : months.get(`${d.getFullYear()}-${d.getMonth()}`);
      if (!row) continue;
      if (t.type === 'deposit') row.deposits += Number(t.amount ?? 0);
      else if (t.type === 'release') row.releases += Number(t.amount ?? 0);
      else if (t.type === 'refund') row.refunds += Number(t.amount ?? 0);
    }
    return [...months.values()];
  }, [inRange, range]);

  const mixRows = [
    { label: 'Released', value: totals.released },
    { label: 'In escrow', value: totals.held },
    { label: 'Refunded', value: totals.refunded },
    { label: 'Fees', value: totals.fees },
  ];

  function exportCsv() {
    if (!filtered.length) { toast.info('Nothing to export for this filter.'); return; }
    const blob = new Blob([toCsv(filtered)], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement('a'), { href: url, download: `creatorske-transactions-${range}.csv` });
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${filtered.length} transactions.`);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-24)' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--space-16)', flexWrap: 'wrap' }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-8)' }}>Transaction history</h1>
          <p className="page-subtitle">Every deposit, release, refund and fee, with where the money sits right now.</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-8)', alignItems: 'center' }}>
          <ChartPeriod options={RANGES} value={range} onChange={setRange} label="Date range" />
          <button className="btn btn-secondary btn-sm" onClick={exportCsv}><IconDownload className="icon-sm" aria-hidden="true" />Export CSV</button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4" style={{ gap: 'var(--space-16)' }}>
        {[
          ['In escrow', totals.held, 'awaiting your approval'],
          ['Released', totals.released, 'paid out to creators'],
          ['Refunded', totals.refunded, 'returned to you'],
          ['Fees', totals.fees, 'plan & platform'],
        ].map(([label, value, sub]) => (
          <div className="stat-card" key={label}>
            <div className="stat-card-label">{label}</div>
            <div className="stat-card-value" style={{ fontSize: 22 }}>{tx.isLoading ? <Skeleton width={80} height={24} /> : formatCurrency(value)}</div>
            <div className="stat-card-delta" style={{ color: 'var(--grey-500)' }}>{sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3" style={{ gap: 'var(--space-16)', alignItems: 'start' }}>
        <ChartFrame
          className="lg:col-span-2"
          title="Escrow flow"
          subtitle="Deposits in, releases and refunds out, by month"
          legend={[{ label: 'Deposits', color: SERIES[0] }, { label: 'Releases', color: SERIES[1] }, { label: 'Refunds', color: SERIES[2] }]}
          loading={tx.isLoading}
          error={txQuery.isError}
          empty={flowRows.every((r) => !r.deposits && !r.releases && !r.refunds)}
          emptyTitle="No movement in this range"
          height={220}
        >
          <BarChart data={flowRows} series={[{ key: 'deposits', label: 'Deposits' }, { key: 'releases', label: 'Releases' }, { key: 'refunds', label: 'Refunds' }]} format={kes} height={220} />
        </ChartFrame>
        <ChartFrame
          title="Where the money is"
          subtitle="This range"
          loading={tx.isLoading}
          empty={mixRows.every((r) => !r.value)}
          emptyTitle="Nothing yet"
          height={220}
        >
          <DonutChart data={mixRows} format={kes} centerLabel="Total" center={formatCurrency(mixRows.reduce((s, r) => s + r.value, 0)).replace('KES ', '')} size={132} />
        </ChartFrame>
      </div>

      <section className="table-wrap">
        <div style={{ padding: 'var(--space-16) var(--space-20)', borderBottom: '0.5px solid var(--grey-100)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-12)', flexWrap: 'wrap' }}>
          <div className="tabs" role="tablist" aria-label="Transaction type">
            {TYPE_FILTERS.map((f) => (
              <button key={f.id} role="tab" aria-selected={type === f.id} className={`tab${type === f.id ? ' active' : ''}`} onClick={() => setType(f.id)}>{f.label}</button>
            ))}
          </div>
          <div className="input-wrapper" style={{ width: 240 }}>
            <IconSearch className="icon-sm input-icon left" aria-hidden="true" />
            <input className="input input-sm input-icon-left" placeholder="Campaign, creator or reference" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search transactions" />
          </div>
        </div>

        {tx.isLoading ? (
          <div style={{ padding: 'var(--space-20)', display: 'flex', flexDirection: 'column', gap: 'var(--space-12)' }}>
            {[0, 1, 2, 3, 4].map((i) => <Skeleton key={i} width="100%" height={40} />)}
          </div>
        ) : txQuery.isError ? (
          <ErrorState title="Couldn't load transactions" description="Transaction history needs the brands/transactions endpoint to be live." onRetry={txQuery.refetch} />
        ) : filtered.length === 0 ? (
          <EmptyState icon={<IconReceipt2 />} title={rows.length ? 'No transactions match' : 'No transactions yet'} description={rows.length ? 'Try another type, range or search.' : 'Fund your first booking and it will appear here.'} action={!rows.length && <button className="btn btn-purple btn-sm" onClick={() => navigate('/directory')}>Find creators</button>} />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table" style={{ minWidth: 720 }}>
              <thead>
                <tr><th>Date</th><th>Type</th><th>Campaign</th><th>Creator</th><th style={{ textAlign: 'right' }}>Amount</th><th>Status</th></tr>
              </thead>
              <tbody>
                {filtered.map((t) => {
                  const meta = TYPE_META[t.type] ?? TYPE_META.fee;
                  const tag = STATUS_TAG[t.status] ?? STATUS_TAG.pending;
                  const Icon = meta.icon;
                  return (
                    <tr key={t.id}>
                      <td style={{ whiteSpace: 'nowrap' }}>{formatDate(t.date ?? t.createdAt)}</td>
                      <td>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-8)', color: 'var(--black)', fontWeight: 500 }}>
                          <Icon className="icon-sm" style={{ color: 'var(--grey-500)' }} aria-hidden="true" />{meta.label}
                        </span>
                      </td>
                      <td>{t.campaign ?? '-'}</td>
                      <td>{t.creator ?? '-'}</td>
                      <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums', fontWeight: 500, color: meta.sign > 0 ? 'var(--status-success-text)' : 'var(--black)' }}>
                        {meta.sign > 0 ? '+' : meta.sign < 0 ? '-' : ''}{formatCurrency(t.amount)}
                      </td>
                      <td><span className={`tag ${tag.cls}`}>{tag.label}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
