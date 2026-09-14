import { useMemo, useState } from 'react';
import { usePageMeta } from '@/lib/usePageMeta';
import { useDeletionRequests } from '@/features/admin/hooks/useOperations';
import { formatDate, getInitials } from '@/lib/utils';
import Skeleton from '@/components/ui/Skeleton';
import Modal from '@/components/ui/Modal';
import EmptyState from '@/components/shared/EmptyState';
import ErrorState from '@/components/shared/ErrorState';
import { ChartFrame, BarChart, Meter } from '@/components/charts';
import { IconUserMinus, IconCheck, IconX, IconAlertTriangle, IconSearch } from '@tabler/icons-react';

/*
   Deletion requests (admin). A user asked for their account to be erased.
   There is a grace period (they can cancel), and a request can't be approved
   while the account still has open bookings, unresolved disputes or funds
   in escrow (`openItems`). Approve = schedule the erasure; reject needs a
   written reason that is sent to the user. Backed by GET /admin/deletion-
   requests and POST /admin/deletion-requests/:id/{approve|reject}.
*/

const STATUS_META = {
  pending:  { cls: 'tag-warning', label: 'Pending review' },
  approved: { cls: 'tag-success', label: 'Approved' },
  rejected: { cls: 'tag-default', label: 'Rejected' },
  cancelled:{ cls: 'tag-default', label: 'Cancelled by user' },
};
const FILTERS = [{ id: 'pending', label: 'Pending' }, { id: 'approved', label: 'Approved' }, { id: 'rejected', label: 'Rejected' }, { id: 'all', label: 'All' }];

function daysUntil(iso) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : Math.ceil((d.getTime() - Date.now()) / 86400000);
}

export default function DeletionRequestsPage() {
  usePageMeta('Deletion requests', 'Account erasure requests awaiting an admin decision.');
  const [filter, setFilter] = useState('pending');
  const [query, setQuery] = useState('');
  const [decision, setDecision] = useState(null); // { kind: 'approve'|'reject', row }
  const [reason, setReason] = useState('');
  const [typed, setTyped] = useState('');

  const { query: reqQuery, rows: rawRows, resolve, isResolving, resolvingId } = useDeletionRequests();
  const requests = { data: reqQuery.data, isLoading: reqQuery.isLoading };
  const rows = useMemo(() => (Array.isArray(requests.data) ? requests.data : requests.data?.requests ?? rawRows ?? []), [requests.data, rawRows]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => (filter === 'all' || r.status === filter) && (!q || `${r.user?.name} ${r.user?.email}`.toLowerCase().includes(q)));
  }, [rows, filter, query]);

  const counts = useMemo(() => ({
    pending: rows.filter((r) => r.status === 'pending').length,
    blocked: rows.filter((r) => r.status === 'pending' && (r.openItems ?? 0) > 0).length,
    expiring: rows.filter((r) => r.status === 'pending' && (daysUntil(r.graceEndsAt) ?? 99) <= 3).length,
    resolved30: rows.filter((r) => r.status !== 'pending').length,
  }), [rows]);

  const reasonRows = useMemo(() => {
    const buckets = new Map();
    for (const r of rows) {
      const key = /break|pause/i.test(r.reason) ? 'Taking a break'
        : /clos|shut/i.test(r.reason) ? 'Business closing'
        : /platform|moving/i.test(r.reason) ? 'Moving platforms'
        : /duplicate/i.test(r.reason) ? 'Duplicate account'
        : /mistake/i.test(r.reason) ? 'Requested by mistake' : 'Other';
      buckets.set(key, (buckets.get(key) ?? 0) + 1);
    }
    return [...buckets].map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);
  }, [rows]);

  function open(kind, row) { setDecision({ kind, row }); setReason(''); setTyped(''); }
  function submit() {
    if (!decision) return;
    resolve({ id: decision.row.id, decision: decision.kind, reason: decision.kind === 'reject' ? reason.trim() : undefined });
    setDecision(null);
  }
  const canSubmit = decision?.kind === 'approve' ? typed.trim().toUpperCase() === 'DELETE' : reason.trim().length >= 10;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-24)' }}>
      <div>
        <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-8)' }}>Deletion requests</h1>
        <p className="page-subtitle">Users who asked to erase their account. Approve once nothing is open on it; every rejection sends the user your reason.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4" style={{ gap: 'var(--space-16)' }}>
        <div className="stat-card"><div className="stat-card-label">Pending</div><div className="stat-card-value" style={{ fontSize: 22 }}>{requests.isLoading ? <Skeleton width={40} height={24} /> : counts.pending}</div><div className="stat-card-delta" style={{ color: 'var(--grey-500)' }}>need a decision</div></div>
        <div className="stat-card"><div className="stat-card-label">Blocked</div><div className="stat-card-value" style={{ fontSize: 22, color: counts.blocked ? 'var(--status-warning-text)' : undefined }}>{requests.isLoading ? <Skeleton width={40} height={24} /> : counts.blocked}</div><div className="stat-card-delta" style={{ color: 'var(--grey-500)' }}>have open bookings or funds</div></div>
        <div className="stat-card"><div className="stat-card-label">Grace ending</div><div className="stat-card-value" style={{ fontSize: 22, color: counts.expiring ? 'var(--status-error-text)' : undefined }}>{requests.isLoading ? <Skeleton width={40} height={24} /> : counts.expiring}</div><div className="stat-card-delta" style={{ color: 'var(--grey-500)' }}>within 3 days</div></div>
        <div className="stat-card"><div className="stat-card-label">Resolved</div><div className="stat-card-value" style={{ fontSize: 22 }}>{requests.isLoading ? <Skeleton width={40} height={24} /> : counts.resolved30}</div><div className="stat-card-delta" style={{ color: 'var(--grey-500)' }}>approved or rejected</div></div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3" style={{ gap: 'var(--space-16)', alignItems: 'start' }}>
        <section className="table-wrap xl:col-span-2">
          <div style={{ padding: 'var(--space-16) var(--space-20)', borderBottom: '0.5px solid var(--grey-100)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-12)', flexWrap: 'wrap' }}>
            <div className="tabs" role="tablist" aria-label="Filter requests">
              {FILTERS.map((f) => <button key={f.id} role="tab" aria-selected={filter === f.id} className={`tab${filter === f.id ? ' active' : ''}`} onClick={() => setFilter(f.id)}>{f.label}</button>)}
            </div>
            <div className="input-wrapper" style={{ width: 220 }}>
              <IconSearch className="icon-sm input-icon left" aria-hidden="true" />
              <input className="input input-sm input-icon-left" placeholder="Name or email" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search requests" />
            </div>
          </div>

          {requests.isLoading ? (
            <div style={{ padding: 'var(--space-20)', display: 'flex', flexDirection: 'column', gap: 'var(--space-12)' }}>{[0, 1, 2].map((i) => <Skeleton key={i} width="100%" height={64} />)}</div>
          ) : reqQuery.isError ? (
            <ErrorState title="Couldn't load requests" description="This queue needs the admin/deletion-requests endpoint to be live." onRetry={reqQuery.refetch} />
          ) : filtered.length === 0 ? (
            <EmptyState icon={<IconUserMinus />} title={rows.length ? 'No requests match' : 'No deletion requests'} description={rows.length ? 'Try another filter.' : 'Requests from Settings > Delete account land here.'} />
          ) : (
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {filtered.map((r) => {
                const meta = STATUS_META[r.status] ?? STATUS_META.pending;
                const left = daysUntil(r.graceEndsAt);
                const blocked = (r.openItems ?? 0) > 0;
                const busy = isResolving && resolvingId === r.id;
                return (
                  <li key={r.id} style={{ padding: 'var(--space-16) var(--space-20)', borderBottom: '0.5px solid var(--grey-100)', display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 'var(--space-16)', alignItems: 'start' }}>
                    <div className={`avatar avatar-md ${r.user?.role === 'brand' ? 'avatar-tint-blue' : 'avatar-purple'}`}>{getInitials(r.user?.name ?? '?')}</div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-8)', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 500, color: 'var(--black)' }}>{r.user?.name}</span>
                        <span className="tag tag-default" style={{ textTransform: 'capitalize' }}>{r.user?.role}</span>
                        <span className={`tag ${meta.cls}`}>{meta.label}</span>
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--grey-500)', marginTop: 'var(--space-2)' }}>{r.user?.email} · requested {formatDate(r.requestedAt)}</div>
                      <div style={{ fontSize: 13, color: 'var(--grey-700)', marginTop: 'var(--space-8)' }}>"{r.reason}"</div>
                      {r.status === 'pending' && (
                        <div style={{ display: 'flex', gap: 'var(--space-16)', marginTop: 'var(--space-8)', fontSize: 12, flexWrap: 'wrap' }}>
                          <span style={{ color: left !== null && left <= 3 ? 'var(--status-error-text)' : 'var(--grey-500)' }}>Grace period {left === null ? '-' : left <= 0 ? 'ended' : `ends in ${left} day${left === 1 ? '' : 's'}`}</span>
                          {blocked && <span style={{ color: 'var(--status-warning-text)', display: 'inline-flex', alignItems: 'center', gap: 'var(--space-4)' }}><IconAlertTriangle className="icon-xs" aria-hidden="true" />{r.openItems} open {r.openItems === 1 ? 'item' : 'items'} on the account</span>}
                        </div>
                      )}
                    </div>
                    {r.status === 'pending' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
                        <button className={`btn btn-danger btn-xs${busy ? ' btn-loading' : ''}`} disabled={blocked} title={blocked ? 'Resolve the open items first' : undefined} onClick={() => open('approve', r)}><IconCheck className="icon-xs" aria-hidden="true" />Approve</button>
                        <button className="btn btn-secondary btn-xs" onClick={() => open('reject', r)}><IconX className="icon-xs" aria-hidden="true" />Reject</button>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-16)' }}>
          <ChartFrame title="Why people leave" subtitle="Stated reasons, all requests" loading={requests.isLoading} empty={!reasonRows.length} emptyTitle="No reasons yet" height={170}>
            <BarChart data={reasonRows} series={[{ key: 'value', label: 'Requests' }]} layout="horizontal" labels height={170} />
          </ChartFrame>
          <section className="card card-p-md">
            <h2 className="section-title" style={{ marginBottom: 'var(--space-12)' }}>Queue health</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-12)' }}>
              <Meter label="Decided within grace period" value={rows.length ? Math.round(((rows.length - counts.expiring) / rows.length) * 100) : 0} max={100} status={counts.expiring ? 'warning' : undefined} />
              <Meter label="Pending that are unblocked" value={counts.pending - counts.blocked} max={Math.max(1, counts.pending)} detail={`${counts.pending - counts.blocked} / ${counts.pending}`} />
            </div>
            <p className="text-hint" style={{ marginTop: 'var(--space-12) ', marginBottom: 0 }}>Approved accounts are erased 24h after approval; personal data in completed bookings is pseudonymised, not removed, for the legally required retention period.</p>
          </section>
        </div>
      </div>

      <Modal open={!!decision} onClose={() => setDecision(null)} title={decision?.kind === 'approve' ? 'Approve account deletion' : 'Reject deletion request'} size="sm">
        {decision && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-16)' }}>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--grey-600)' }}>
              {decision.kind === 'approve'
                ? <>This schedules <strong style={{ color: 'var(--black)' }}>{decision.row.user?.name}</strong>'s account ({decision.row.user?.email}) for erasure in 24 hours. Rate cards, portfolio and messages are removed. Type <strong style={{ color: 'var(--black)' }}>DELETE</strong> to confirm.</>
                : <>Tell <strong style={{ color: 'var(--black)' }}>{decision.row.user?.name}</strong> why the request can't be honoured yet. They receive this by email.</>}
            </p>
            {decision.kind === 'approve' ? (
              <div>
                <label className="field-label" htmlFor="del-confirm">Confirmation</label>
                <input id="del-confirm" className="input input-md" placeholder="Type DELETE" value={typed} onChange={(e) => setTyped(e.target.value)} autoComplete="off" />
              </div>
            ) : (
              <div>
                <label className="field-label" htmlFor="del-reason">Reason sent to the user<span className="field-required">*</span></label>
                <textarea id="del-reason" className="input input-md" rows={4} placeholder="e.g. Two bookings are still in escrow. Complete or cancel them, then request again." value={reason} onChange={(e) => setReason(e.target.value)} />
                <span className="field-hint">At least 10 characters.</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-8)' }}>
              <button className="btn btn-secondary btn-sm" onClick={() => setDecision(null)}>Cancel</button>
              <button className={`btn btn-sm ${decision.kind === 'approve' ? 'btn-danger' : 'btn-purple'}`} disabled={!canSubmit} onClick={submit}>
                {decision.kind === 'approve' ? 'Approve deletion' : 'Send rejection'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
