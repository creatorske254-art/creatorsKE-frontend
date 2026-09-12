import { useMemo, useState } from 'react';
import { usePageMeta } from '@/lib/usePageMeta';
import { useEscrowCases } from '@/features/admin/hooks/useOperations';
import { useDemoFallback } from '@/lib/useDemoFallback';
import { DEMO_ESCROW_CASES } from '@/lib/demoData';
import { formatCurrency, formatDate, getInitials } from '@/lib/utils';
import Skeleton from '@/components/ui/Skeleton';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import EmptyState from '@/components/shared/EmptyState';
import ErrorState from '@/components/shared/ErrorState';
import DemoTag from '@/components/shared/DemoTag';
import { ChartFrame, BarChart, DonutChart, kes } from '@/components/charts';
import { IconLockDollar, IconLockOpen, IconClock, IconSearch, IconAlertTriangle } from '@tabler/icons-react';

/*
   Escrow cases (admin). Every booking whose money is being held: how long it
   has sat there, whether it's waiting on the brand, and the two levers an
   admin has - release to the creator (delivery is verified, brand is silent)
   or extend the hold (dispute in flight). Backed by GET /admin/escrow and
   POST /admin/escrow/:id/{release|extend} (BACKEND_API_SPEC.md).
*/

const STATUS_META = {
  held:               { cls: 'tag-info',    label: 'Held' },
  awaiting_approval:  { cls: 'tag-warning', label: 'Awaiting brand approval' },
  disputed:           { cls: 'tag-error',   label: 'Disputed' },
  released:           { cls: 'tag-success', label: 'Released' },
};
const FILTERS = [{ id: 'all', label: 'All open' }, { id: 'awaiting_approval', label: 'Awaiting approval' }, { id: 'disputed', label: 'Disputed' }, { id: 'overdue', label: 'Over 14 days' }];
const AUTO_RELEASE_DAYS = 14;

function daysHeld(iso) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? 0 : Math.max(0, Math.floor((Date.now() - d.getTime()) / 86400000));
}
function ageBucket(days) {
  if (days <= 7) return '0-7 days';
  if (days <= 14) return '8-14 days';
  if (days <= 30) return '15-30 days';
  return '30+ days';
}

export default function EscrowPage() {
  usePageMeta('Escrow cases', 'Bookings whose payment is held in escrow, with release and hold controls.');
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [confirm, setConfirm] = useState(null); // { action: 'release'|'extend', row }

  const { query: escrowQuery, rows: rawRows, act, isActing, actingId } = useEscrowCases();
  const escrow = useDemoFallback(escrowQuery, DEMO_ESCROW_CASES);
  const rows = useMemo(() => {
    const list = Array.isArray(escrow.data) ? escrow.data : escrow.data?.cases ?? rawRows ?? [];
    return list.map((c) => ({ ...c, days: daysHeld(c.heldSince ?? c.createdAt) }));
  }, [escrow.data, rawRows]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows
      .filter((c) => c.status !== 'released')
      .filter((c) => filter === 'all' || (filter === 'overdue' ? c.days > AUTO_RELEASE_DAYS : c.status === filter))
      .filter((c) => !q || `${c.campaign} ${c.brand} ${c.creator} ${c.id}`.toLowerCase().includes(q))
      .sort((a, b) => b.days - a.days);
  }, [rows, filter, query]);

  const selected = rows.find((c) => c.id === selectedId) ?? filtered[0] ?? null;

  const totals = useMemo(() => {
    const open = rows.filter((c) => c.status !== 'released');
    return {
      amount: open.reduce((s, c) => s + Number(c.amount ?? 0), 0),
      count: open.length,
      overdue: open.filter((c) => c.days > AUTO_RELEASE_DAYS).length,
      disputed: open.filter((c) => c.status === 'disputed').length,
    };
  }, [rows]);

  const agingRows = useMemo(() => {
    const buckets = ['0-7 days', '8-14 days', '15-30 days', '30+ days'].map((label) => ({ label, value: 0 }));
    for (const c of rows) if (c.status !== 'released') buckets.find((b) => b.label === ageBucket(c.days)).value += 1;
    return buckets;
  }, [rows]);
  const statusRows = useMemo(() => ['held', 'awaiting_approval', 'disputed'].map((s) => ({
    label: STATUS_META[s].label, value: rows.filter((c) => c.status === s).reduce((sum, c) => sum + Number(c.amount ?? 0), 0),
  })), [rows]);

  function run() {
    if (!confirm) return;
    act({ id: confirm.row.id, action: confirm.action, note: confirm.action === 'release' ? 'Released by admin after delivery verification' : 'Hold extended pending dispute' });
    setConfirm(null);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-24)' }}>
      <div>
        <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-8)' }}>Escrow cases{escrow.isDemo && <DemoTag />}</h1>
        <p className="page-subtitle">Payments held between booking and approval. Funds auto-release {AUTO_RELEASE_DAYS} days after delivery unless a dispute is open.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4" style={{ gap: 'var(--space-16)' }}>
        <div className="stat-card"><div className="stat-card-label">Held in escrow</div><div className="stat-card-value" style={{ fontSize: 22 }}>{escrow.isLoading ? <Skeleton width={90} height={24} /> : formatCurrency(totals.amount)}</div><div className="stat-card-delta" style={{ color: 'var(--grey-500)' }}>{totals.count} open bookings</div></div>
        <div className="stat-card"><div className="stat-card-label">Past auto-release</div><div className="stat-card-value" style={{ fontSize: 22, color: totals.overdue ? 'var(--status-warning-text)' : undefined }}>{escrow.isLoading ? <Skeleton width={40} height={24} /> : totals.overdue}</div><div className="stat-card-delta" style={{ color: 'var(--grey-500)' }}>held over {AUTO_RELEASE_DAYS} days</div></div>
        <div className="stat-card"><div className="stat-card-label">Disputed</div><div className="stat-card-value" style={{ fontSize: 22, color: totals.disputed ? 'var(--status-error-text)' : undefined }}>{escrow.isLoading ? <Skeleton width={40} height={24} /> : totals.disputed}</div><div className="stat-card-delta" style={{ color: 'var(--grey-500)' }}>frozen until decided</div></div>
        <div className="stat-card"><div className="stat-card-label">Median hold</div><div className="stat-card-value" style={{ fontSize: 22 }}>{escrow.isLoading ? <Skeleton width={40} height={24} /> : `${[...rows].sort((a, b) => a.days - b.days)[Math.floor(rows.length / 2)]?.days ?? 0}d`}</div><div className="stat-card-delta" style={{ color: 'var(--grey-500)' }}>booking to release</div></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: 'var(--space-16)' }}>
        <ChartFrame title="Escrow aging" subtitle="Open bookings by days held; 30+ needs a decision" loading={escrow.isLoading} empty={!totals.count} emptyTitle="Nothing in escrow" demo={escrow.isDemo} height={180}>
          <BarChart data={agingRows} series={[{ key: 'value', label: 'Bookings' }]} emphasis={(r) => r.label === '30+ days'} height={180} />
        </ChartFrame>
        <ChartFrame title="Held amount by status" loading={escrow.isLoading} empty={statusRows.every((r) => !r.value)} emptyTitle="Nothing in escrow" demo={escrow.isDemo} height={180}>
          <DonutChart data={statusRows} format={kes} centerLabel="Held" center={formatCurrency(totals.amount).replace('KES ', '')} size={132} />
        </ChartFrame>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3" style={{ gap: 'var(--space-16)', alignItems: 'start' }}>
        <section className="table-wrap xl:col-span-2">
          <div style={{ padding: 'var(--space-16) var(--space-20)', borderBottom: '0.5px solid var(--grey-100)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-12)', flexWrap: 'wrap' }}>
            <div className="tabs" role="tablist" aria-label="Filter cases">
              {FILTERS.map((f) => <button key={f.id} role="tab" aria-selected={filter === f.id} className={`tab${filter === f.id ? ' active' : ''}`} onClick={() => setFilter(f.id)}>{f.label}</button>)}
            </div>
            <div className="input-wrapper" style={{ width: 220 }}>
              <IconSearch className="icon-sm input-icon left" aria-hidden="true" />
              <input className="input input-sm input-icon-left" placeholder="Campaign, brand or creator" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search escrow cases" />
            </div>
          </div>
          {escrow.isLoading ? (
            <div style={{ padding: 'var(--space-20)', display: 'flex', flexDirection: 'column', gap: 'var(--space-12)' }}>{[0, 1, 2, 3].map((i) => <Skeleton key={i} width="100%" height={44} />)}</div>
          ) : escrowQuery.isError && !escrow.isDemo ? (
            <ErrorState title="Couldn't load escrow cases" description="This queue needs the admin/escrow endpoint to be live." onRetry={escrowQuery.refetch} />
          ) : filtered.length === 0 ? (
            <EmptyState icon={<IconLockDollar />} title={rows.length ? 'No cases match' : 'Nothing in escrow'} description={rows.length ? 'Try another filter.' : 'Funded bookings will appear here until they are released.'} />
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table" style={{ minWidth: 640 }}>
                <thead><tr><th>Campaign</th><th>Parties</th><th style={{ textAlign: 'right' }}>Amount</th><th>Held</th><th>Status</th></tr></thead>
                <tbody>
                  {filtered.map((c) => (
                    <tr key={c.id} onClick={() => setSelectedId(c.id)} style={{ cursor: 'pointer', background: selected?.id === c.id ? 'var(--purple-50)' : undefined }}>
                      <td><div style={{ fontWeight: 500, color: 'var(--black)' }}>{c.campaign}</div><div style={{ fontSize: 11.5, color: 'var(--grey-400)' }}>{c.id}</div></td>
                      <td><div>{c.brand}</div><div style={{ fontSize: 11.5, color: 'var(--grey-400)' }}>to {c.creator}</div></td>
                      <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums', fontWeight: 500, color: 'var(--black)' }}>{formatCurrency(c.amount)}</td>
                      <td style={{ whiteSpace: 'nowrap', color: c.days > AUTO_RELEASE_DAYS ? 'var(--status-warning-text)' : undefined }}>{c.days}d{c.days > AUTO_RELEASE_DAYS && <IconAlertTriangle className="icon-xs" style={{ marginLeft: 'var(--space-4)', verticalAlign: '-2px' }} aria-hidden="true" />}</td>
                      <td><span className={`tag ${(STATUS_META[c.status] ?? STATUS_META.held).cls}`}>{(STATUS_META[c.status] ?? STATUS_META.held).label}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <aside className="card card-p-md">
          <h2 className="section-title" style={{ marginBottom: 'var(--space-12)' }}>Case detail</h2>
          {!selected ? (
            <EmptyState size="sm" icon={<IconLockDollar />} title="Select a case" description="Pick a booking to see its timeline and act on it." />
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-12)', marginBottom: 'var(--space-16)' }}>
                <div className="avatar avatar-md avatar-purple">{getInitials(selected.creator)}</div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 500, color: 'var(--black)' }}>{selected.campaign}</div>
                  <div style={{ fontSize: 12, color: 'var(--grey-500)' }}>{selected.brand} → {selected.creator}</div>
                </div>
              </div>
              {[
                ['Amount held', formatCurrency(selected.amount)],
                ['Held since', `${formatDate(selected.heldSince ?? selected.createdAt)} (${selected.days} days)`],
                ['Auto-release', selected.status === 'disputed' ? 'Paused - dispute open' : selected.days >= AUTO_RELEASE_DAYS ? `Past due by ${selected.days - AUTO_RELEASE_DAYS} days` : `${AUTO_RELEASE_DAYS - selected.days} days left`],
                ['Status', (STATUS_META[selected.status] ?? STATUS_META.held).label],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--space-12)', padding: 'var(--space-8) 0', borderBottom: '0.5px solid var(--grey-100)', fontSize: 12.5 }}>
                  <span style={{ color: 'var(--grey-500)' }}>{k}</span><span style={{ color: 'var(--black)', fontWeight: 500, textAlign: 'right' }}>{v}</span>
                </div>
              ))}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)', marginTop: 'var(--space-16)' }}>
                <button className={`btn btn-purple btn-sm btn-full${isActing && actingId === selected.id ? ' btn-loading' : ''}`} style={{ justifyContent: 'center' }} disabled={selected.status === 'disputed'} onClick={() => setConfirm({ action: 'release', row: selected })}>
                  <IconLockOpen className="icon-sm" aria-hidden="true" />Release to creator
                </button>
                <button className="btn btn-secondary btn-sm btn-full" style={{ justifyContent: 'center' }} onClick={() => setConfirm({ action: 'extend', row: selected })}>
                  <IconClock className="icon-sm" aria-hidden="true" />Extend hold 7 days
                </button>
                {selected.status === 'disputed' && <p className="text-hint" style={{ margin: 0 }}>Release is locked while a dispute is open. Decide it under Disputes first.</p>}
              </div>
            </>
          )}
        </aside>
      </div>

      <ConfirmDialog
        open={!!confirm}
        title={confirm?.action === 'release' ? 'Release funds to the creator?' : 'Extend the escrow hold?'}
        message={confirm?.action === 'release'
          ? `${formatCurrency(confirm?.row.amount)} will be paid out to ${confirm?.row.creator} for "${confirm?.row.campaign}". This cannot be undone.`
          : `The auto-release for "${confirm?.row.campaign}" will move out by 7 days. Both parties are notified.`}
        confirmLabel={confirm?.action === 'release' ? 'Release funds' : 'Extend hold'}
        variant={confirm?.action === 'release' ? 'danger' : 'default'}
        onConfirm={run}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
}
