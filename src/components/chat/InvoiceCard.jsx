import { useMemo } from 'react';
import { IconCheck, IconClock, IconFileInvoice, IconShieldCheck, IconWallet } from '@tabler/icons-react';
import { formatCurrency } from '@/lib/utils';

const STATUS_STYLES = {
  PENDING: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  'PAID - HELD': 'bg-sky-50 text-sky-700 ring-1 ring-sky-200',
  DELIVERED: 'bg-violet-50 text-violet-700 ring-1 ring-violet-200',
  COMPLETED: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  DISPUTED: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200',
};

function getStatusMeta(status) {
  switch (status) {
    case 'PENDING':
      return { label: 'PENDING', icon: IconClock };
    case 'PAID - HELD':
      return { label: 'PAID - HELD', icon: IconShieldCheck };
    case 'DELIVERED':
      return { label: 'DELIVERED', icon: IconFileInvoice };
    case 'COMPLETED':
      return { label: 'COMPLETED', icon: IconCheck };
    case 'DISPUTED':
      return { label: 'DISPUTED', icon: IconClock };
    default:
      return { label: String(status || 'PENDING').toUpperCase(), icon: IconClock };
  }
}

export default function InvoiceCard({
  invoice,
  role = 'brand',
  onAcceptAndPay,
  onApprove,
  onRaiseDispute,
  onMarkDelivered,
  onDeliveryNoteChange,
  deliveryNote,
}) {
  const status = invoice?.status || 'PENDING';
  const normalizedStatus = status === 'HELD' ? 'PAID - HELD' : status;
  const statusMeta = useMemo(() => getStatusMeta(normalizedStatus), [normalizedStatus]);
  const StatusIcon = statusMeta.icon;

  const isBrand = role === 'brand';
  const isCreator = role === 'creator';
  const isPaidHeld = normalizedStatus === 'PAID - HELD';
  const isDelivered = normalizedStatus === 'DELIVERED';
  const isPending = normalizedStatus === 'PENDING';
  const isCompleted = normalizedStatus === 'COMPLETED';
  const isDisputed = normalizedStatus === 'DISPUTED';

  return (
    <div className="w-full max-w-xl overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
      <div className="flex items-center justify-between gap-4 border-b border-slate-200 bg-[#F5FFF8] px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#00A651] text-white">
            <IconWallet size={18} />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#00A651]">Invoice</p>
            <p className="text-sm font-semibold text-slate-900">{invoice?.title || 'Invoice from Creator'}</p>
          </div>
        </div>

        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${STATUS_STYLES[normalizedStatus] || STATUS_STYLES.PENDING}`}>
          <StatusIcon size={12} />
          {statusMeta.label}
        </span>
      </div>

      <div className="space-y-4 p-5">
        <div className="flex flex-col gap-2">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Service</p>
          <p className="text-base font-medium text-slate-800">{invoice?.service || 'Creative service package'}</p>
        </div>

        <div className="flex items-end justify-between gap-3 rounded-2xl bg-slate-50 p-4">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Price</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{formatCurrency(invoice?.price || 0)}</p>
          </div>
          <p className="text-xs font-medium text-slate-500">{invoice?.id || 'INV-000'}</p>
        </div>

        {invoice?.deliveredLink && (
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-3 text-sm text-slate-700">
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#00A651]">Delivered content</p>
            <a href={invoice.deliveredLink} className="text-[#00A651] underline" target="_blank" rel="noreferrer">
              {invoice.deliveredLink}
            </a>
          </div>
        )}

        <div className="space-y-3">
          {isBrand && isPending && (
            <button type="button" onClick={onAcceptAndPay} className="w-full rounded-2xl bg-[#00A651] px-4 py-3 text-sm font-semibold text-white shadow-sm">
              Accept & Pay
            </button>
          )}

          {isCreator && isDelivered && (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
              Waiting for approval
            </div>
          )}

          {isBrand && isDelivered && (
            <div className="flex gap-2">
              <button type="button" onClick={onApprove} className="flex-1 rounded-2xl bg-[#00A651] px-4 py-3 text-sm font-semibold text-white shadow-sm">
                Approve
              </button>
              <button type="button" onClick={onRaiseDispute} className="flex-1 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                Dispute
              </button>
            </div>
          )}

          {isCreator && isPaidHeld && (
            <div className="space-y-3">
              <input
                value={deliveryNote}
                onChange={(event) => onDeliveryNoteChange?.(event.target.value)}
                placeholder="Content link or file URL"
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-[#00A651] focus:ring-2 focus:ring-[#00A651]/20"
              />
              <button type="button" onClick={onMarkDelivered} className="w-full rounded-2xl bg-[#00A651] px-4 py-3 text-sm font-semibold text-white shadow-sm">
                Mark as Delivered
              </button>
            </div>
          )}

          {isCreator && isDisputed && (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-600">
              Under Moderator Review
            </div>
          )}

          {isCompleted && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
              Paid out to creator
            </div>
          )}

          {isDisputed && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
              Under Review
            </div>
          )}

          {isCreator && isDelivered && invoice?.reason && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Brand has {invoice.reason ? 'not responded' : 'not approved'} yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
