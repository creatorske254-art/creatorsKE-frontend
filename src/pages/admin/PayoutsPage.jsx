import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { usePageMeta } from '@/lib/usePageMeta';
import { usePayoutQueue } from '@/features/admin/hooks/useOperations';
import { formatCurrency, formatDate, getInitials } from '@/lib/utils';
import Skeleton from '@/components/ui/Skeleton';
import Modal from '@/components/ui/Modal';
import EmptyState from '@/components/shared/EmptyState';
import ErrorState from '@/components/shared/ErrorState';
import { IconCash, IconCopy, IconCheck, IconX } from '@tabler/icons-react';

/*
   Payouts (admin). Creators' withdrawal requests, paid by hand until M-Pesa B2C is set up:
   send the money from the business M-Pesa or bank account, then record the transaction
   reference here. Rejecting needs a reason; the creator is told and the amount returns to their
   balance. Backed by GET /admin/payouts?status= and POST /admin/payouts/:id/{sent|reject}.
   Finance and super admins can act; everyone else can read.
*/

const FILTERS = [{ id: 'pending', label: 'To pay' }, { id: 'sent', label: 'Sent' }, { id: 'rejected', label: 'Rejected' }, { id: 'all', label: 'All' }];
const STATUS_META = {
  pending: { cls: 'tag-warning', label: 'To pay' },
  sent: { cls: 'tag-success', label: 'Sent' },
  rejected: { cls: 'tag-default', label: 'Rejected' },
};
const METHOD_LABEL = { mpesa: 'M-Pesa', airtel: 'Airtel Money', bank: 'Bank transfer' };

function copy(text) {
  navigator.clipboard?.writeText(text).then(() => toast.success('Copied.'), () => toast.error('Could not copy. Select the text instead.'));
}

export default function PayoutsPage() {
  usePageMeta('Payouts', "Creators' withdrawal requests, paid by hand and recorded with the transaction reference.");
  const [filter, setFilter] = useState('pending');
  const { query, rows, act, isActing, actingId } = usePayoutQueue(filter);
  const [dialog, setDialog] = useState(null); // { row, kind: 'sent' | 'reject' }
  const [value, setValue] = useState('');

  const totals = useMemo(() => ({
    count: rows.filter((r) => r.status === 'pending').length,
    amount: rows.filter((r) => r.status === 'pending').reduce((s, r) => s + r.amount, 0),
  }), [rows]);

  function open(row, kind) { setDialog({ row, kind }); setValue(''); }
  function submit() {
    const body = dialog.kind === 'sent' ? { reference: value.trim() } : { reason: value.trim() };
    act({ id: dialog.row.id, action: dialog.kind, body }, { onSuccess: () => setDialog(null) });
  }
  const canSubmit = dialog?.kind === 'sent' ? value.trim().length >= 6 : value.trim().length >= 5;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-24)' }}>
      <div>
        <h1 className="page-title">Payouts</h1>
        <p className="page-subtitle">Send each withdrawal from the business M-Pesa or bank account, then record its transaction reference. The creator is notified either way.</p>
      </div>

      {filter === 'pending' && (
        <div className="grid grid-cols-2" style={{ gap: 'var(--space-16)', maxWidth: 560 }}>
          <div className="stat-card"><div className="stat-card-label">Waiting to be paid</div><div className="stat-card-value" style={{ fontSize: 22 }}>{query.isLoading ? <Skeleton width={40} height={24} /> : totals.count}</div></div>
          <div className="stat-card"><div className="stat-card-label">Total to send</div><div className="stat-card-value" style={{ fontSize: 22 }}>{query.isLoading ? <Skeleton width={90} height={24} /> : formatCurrency(totals.amount)}</div></div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 'var(--space-8)', flexWrap: 'wrap' }} role="tablist" aria-label="Payout status">
        {FILTERS.map((f) => (
          <button key={f.id} role="tab" aria-selected={filter === f.id} className={`btn btn-sm ${filter === f.id ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setFilter(f.id)}>{f.label}</button>
        ))}
      </div>

      <section className="table-wrap">
        {query.isLoading ? (
          <div style={{ padding: 'var(--space-20)', display: 'flex', flexDirection: 'column', gap: 'var(--space-12)' }}>{[0, 1, 2].map((i) => <Skeleton key={i} width="100%" height={48} />)}</div>
        ) : query.isError ? (
          <ErrorState title="Could not load payouts" description={query.error?.message} onRetry={() => query.refetch()} />
        ) : rows.length === 0 ? (
          <EmptyState icon={<IconCash />} title={filter === 'pending' ? 'Nothing to pay' : 'No payouts here'} description={filter === 'pending' ? 'Withdrawal requests from creators appear here.' : 'Try another filter.'} />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table" style={{ minWidth: 760 }}>
              <thead><tr><th>Creator</th><th>Send to</th><th>Requested</th><th style={{ textAlign: 'right' }}>Amount</th><th>Status</th><th aria-label="Actions" /></tr></thead>
              <tbody>
                {rows.map((r) => {
                  const meta = STATUS_META[r.status] ?? STATUS_META.pending;
                  const busy = isActing && actingId === r.id;
                  return (
                    <tr key={r.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-8)' }}>
                          <div className="avatar avatar-sm avatar-purple">{getInitials(r.creator.name)}</div>
                          <div><div style={{ fontWeight: 500 }}>{r.creator.name}</div><div className="text-hint" style={{ margin: 0 }}>{r.creator.email}</div></div>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 500 }}>{METHOD_LABEL[r.method.type] ?? r.method.label ?? 'Payout method'}</div>
                        {r.method.destination ? (
                          <button type="button" className="btn btn-ghost btn-xs" style={{ paddingLeft: 0 }} onClick={() => copy(r.method.destination)} aria-label={`Copy ${r.method.destination}`}>
                            <span style={{ fontVariantNumeric: 'tabular-nums' }}>{r.method.destination}</span><IconCopy className="icon-xs" aria-hidden="true" />
                          </button>
                        ) : <div className="text-hint" style={{ margin: 0 }}>No destination on file</div>}
                      </td>
                      <td style={{ whiteSpace: 'nowrap' }}>{formatDate(r.requestedAt)}</td>
                      <td style={{ textAlign: 'right', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{formatCurrency(r.amount)}</td>
                      <td>
                        <span className={`tag ${meta.cls}`}>{meta.label}</span>
                        {r.reference && <div className="text-hint" style={{ margin: 'var(--space-4) 0 0' }}>Ref {r.reference}</div>}
                        {r.reason && <div className="text-hint" style={{ margin: 'var(--space-4) 0 0', maxWidth: 220 }}>{r.reason}</div>}
                      </td>
                      <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                        {r.status === 'pending' && (
                          <div style={{ display: 'inline-flex', gap: 'var(--space-8)' }}>
                            <button className={`btn btn-purple btn-sm${busy ? ' btn-loading' : ''}`} disabled={busy} onClick={() => open(r, 'sent')}><IconCheck className="icon-sm" aria-hidden="true" />Mark as sent</button>
                            <button className="btn btn-ghost btn-sm" disabled={busy} onClick={() => open(r, 'reject')}><IconX className="icon-sm" aria-hidden="true" />Reject</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <Modal open={!!dialog} onClose={() => setDialog(null)} title={dialog?.kind === 'sent' ? 'Record the payment' : 'Reject this withdrawal'} size="sm">
        {dialog && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-16)' }}>
            <p className="modal-body-text" style={{ margin: 0 }}>
              {dialog.kind === 'sent'
                ? <>Send <strong>{formatCurrency(dialog.row.amount)}</strong> to {dialog.row.creator.name} ({dialog.row.method.destination}), then enter the transaction reference from the M-Pesa or bank confirmation.</>
                : <>{dialog.row.creator.name} is told your reason and {formatCurrency(dialog.row.amount)} goes back to their balance.</>}
            </p>
            <div className="field">
              <label className="field-label field-required" htmlFor="payout-input">{dialog.kind === 'sent' ? 'Transaction reference' : 'Reason'}</label>
              {dialog.kind === 'sent'
                ? <input id="payout-input" className="input input-md" value={value} onChange={(e) => setValue(e.target.value)} placeholder="e.g. SJK7ABC123" autoFocus style={{ textTransform: 'uppercase' }} />
                : <textarea id="payout-input" className="input input-md" rows={3} value={value} onChange={(e) => setValue(e.target.value)} placeholder="e.g. The number is not registered for M-Pesa. Add another payout method and request again." autoFocus />}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-8)' }}>
              <button className="btn btn-secondary btn-sm" onClick={() => setDialog(null)}>Cancel</button>
              <button className={`btn btn-sm ${dialog.kind === 'sent' ? 'btn-purple' : 'btn-danger'}${isActing ? ' btn-loading' : ''}`} disabled={!canSubmit || isActing} onClick={submit}>
                {dialog.kind === 'sent' ? 'Mark as sent' : 'Reject withdrawal'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
