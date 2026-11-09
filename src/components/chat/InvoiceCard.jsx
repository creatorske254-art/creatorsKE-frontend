import { useEffect, useState } from 'react';
import { IconCheck, IconClock, IconShieldCheck } from '@tabler/icons-react';
import CountdownTimer from '@/components/chat/CountdownTimer';

const STATUS_LABELS = {
  PENDING: 'Price pending',
  HELD: 'Paid · money safe',
  DELIVERED: 'Delivered',
  COMPLETED: 'Done · paid to creator',
  DISPUTED: 'Under review',
};

function formatKsh(value) {
  return `KSh ${Number(value || 0).toLocaleString('en-KE')}`;
}

function normalizeStatus(status) {
  return status === 'PAID - HELD' ? 'HELD' : status;
}

export default function InvoiceCard({
  invoice,
  role = 'brand',
  onPay,
  onApprove,
  onRaiseDispute,
  onMarkDelivered,
  onUpdatePrice,
  deliveryNote,
  onDeliveryNoteChange,
  deadlineMs,
  disputeAvailable = false,
  isBusy = false,
  onCountdownComplete,
  invoiceId,
  isClient,
}) {
  const [editingPrice, setEditingPrice] = useState(false);
  const [priceDraft, setPriceDraft] = useState(String(invoice?.price ?? ''));
  const [priceError, setPriceError] = useState('');
  const status = normalizeStatus(invoice?.status || 'PENDING');
  const isBrand = role === 'brand';
  const isCreator = role === 'creator';



  useEffect(() => {
    setPriceDraft(String(invoice?.price ?? ''));
  }, [invoice?.price]);

  if (typeof isClient === 'boolean' || invoiceId != null) {
    return (
      <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[#008F45]">Invoice</p>
            <p className="mt-1 truncate text-sm font-semibold text-slate-900">{invoice?.title || invoice?.service || 'Invoice'}</p>
          </div>
          <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-600">
            {STATUS_LABELS[status] || status}
          </span>
        </div>
        <p className="mt-2 text-sm text-slate-600">{invoice?.description || invoice?.service}</p>
        <p className="mt-2 text-lg font-bold text-slate-900">{formatKsh(invoice?.amount ?? invoice?.price)}</p>
      </div>
    );
  }

  async function savePrice(sendUpdatedPrice) {
    const price = Number(priceDraft);
    if (!Number.isInteger(price) || price < 1) {
      setPriceError('Enter a valid price in KSh.');
      return;
    }
    setPriceError('');
    const saved = await onUpdatePrice?.(price, sendUpdatedPrice);
    if (saved) setEditingPrice(false);
  }

  return (
    <article className="w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg shadow-slate-900/5">
      <header className="flex items-center justify-between gap-3 border-b border-[#E6F3EA] bg-[#F0FAF4] px-4 py-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[#008F45]">Service payment</p>
          <p className="mt-0.5 text-sm font-semibold text-slate-900">{invoice?.service || 'Creator service'}</p>
        </div>
        <span className="shrink-0 rounded-full bg-white px-3 py-1 text-[10px] font-semibold text-slate-600">
          {STATUS_LABELS[status] || status}
        </span>
      </header>

      <div className="space-y-4 p-4">
        <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-4 py-3">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] text-slate-500">Price</p>
            {editingPrice ? (
              <div className="mt-1 flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-500">KSh</span>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={priceDraft}
                  onChange={(event) => setPriceDraft(event.target.value)}
                  aria-label="Updated service price"
                  className="w-32 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-lg font-bold text-slate-900 outline-none focus:border-[#00A651] focus:ring-2 focus:ring-[#00A651]/20"
                  autoFocus
                />
              </div>
            ) : isCreator && status === 'PENDING' ? (
              <button
                type="button"
                className="mt-0.5 text-left text-xl font-bold text-slate-900 underline decoration-dotted underline-offset-4"
                onClick={() => setEditingPrice(true)}
                aria-label={`Edit price, ${formatKsh(invoice?.price)}`}
              >
                {formatKsh(invoice?.price)}
              </button>
            ) : (
              <p className="mt-0.5 text-xl font-bold text-slate-900">{formatKsh(invoice?.price)}</p>
            )}
          </div>
          {status === 'HELD' && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-[#008F45]">
              <IconShieldCheck className="icon-sm" aria-hidden="true" /> Safe with Creators KE
            </span>
          )}
        </div>

        {editingPrice && (
          <div>
            <div className="flex flex-wrap gap-2">
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => { setEditingPrice(false); setPriceError(''); }} disabled={isBusy}>
                Cancel
              </button>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => savePrice(false)} disabled={isBusy}>
                Save
              </button>
              <button type="button" className="btn btn-sm bg-[#00A651] text-white hover:bg-[#008F45]" onClick={() => savePrice(true)} disabled={isBusy}>
                Send updated price
              </button>
            </div>
            {priceError && <p className="mt-2 text-xs text-rose-600" role="alert">{priceError}</p>}
          </div>
        )}

        {status === 'PENDING' && isBrand && Number(invoice?.price) > 0 && (
          <button type="button" onClick={onPay} disabled={isBusy} className="w-full rounded-xl bg-[#00A651] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#008F45] disabled:opacity-60">
            {isBusy ? 'Starting payment…' : `Pay ${formatKsh(invoice?.price)} via M-Pesa`}
          </button>
        )}

        {status === 'PENDING' && isBrand && Number(invoice?.price) <= 0 && (
          <p className="rounded-xl bg-slate-50 px-3 py-3 text-center text-sm text-slate-600">
            Waiting for the creator to set a price
          </p>
        )}

        {status === 'PENDING' && isCreator && (
          <p className="rounded-xl bg-slate-50 px-3 py-3 text-center text-sm text-slate-600">
            Waiting for the brand to pay
          </p>
        )}

        {status === 'HELD' && isCreator && (
          <div className="space-y-2">
            <label htmlFor="delivery-link" className="block text-xs font-medium text-slate-600">Content link</label>
            <input
              id="delivery-link"
              type="url"
              value={deliveryNote}
              onChange={(event) => onDeliveryNoteChange?.(event.target.value)}
              placeholder="Paste the link to your work"
              className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-[#00A651] focus:ring-2 focus:ring-[#00A651]/20"
            />
            <button type="button" onClick={onMarkDelivered} disabled={isBusy} className="w-full rounded-xl bg-[#00A651] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#008F45] disabled:opacity-60">
              {isBusy ? 'Sending…' : 'Mark as delivered'}
            </button>
          </div>
        )}

        {status === 'DELIVERED' && invoice?.deliveredLink && (
          <a
            href={invoice.deliveredLink}
            target="_blank"
            rel="noreferrer"
            className="block break-all rounded-xl border border-[#DDEDE3] bg-[#F5FBF7] px-3 py-3 text-sm text-[#008F45] underline"
          >
            View delivered content
          </a>
        )}

        {status === 'DELIVERED' && deadlineMs && (
          <div className="flex items-center justify-center gap-2 rounded-xl bg-[#F5FBF7] px-3 py-2 text-xs text-slate-600">
            <IconClock className="icon-sm text-[#008F45]" aria-hidden="true" />
            <span>{isCreator ? 'Brand has' : 'Time left to review:'}</span>
            <CountdownTimer
              deadlineMs={deadlineMs}
              className="font-semibold text-[#008F45]"
              onComplete={onCountdownComplete}
            />
            {isCreator && <span>left</span>}
          </div>
        )}

        {status === 'DELIVERED' && isBrand && (
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={onApprove} disabled={isBusy} className="rounded-xl bg-[#00A651] px-3 py-3 text-sm font-semibold text-white transition hover:bg-[#008F45] disabled:opacity-60">
              {isBusy ? 'Working…' : 'Approve & release'}
            </button>
            <button type="button" onClick={onRaiseDispute} disabled={isBusy} className="rounded-xl border border-rose-200 bg-white px-3 py-3 text-sm font-semibold text-rose-700 disabled:opacity-60">
              Problem?
            </button>
          </div>
        )}

        {status === 'DELIVERED' && isCreator && (
          <div className="space-y-2 text-center">
            <p className="text-sm text-slate-600">Waiting for the brand to approve</p>
            {disputeAvailable && (
              <button type="button" onClick={onRaiseDispute} disabled={isBusy} className="w-full rounded-xl border border-rose-200 bg-white px-4 py-3 text-sm font-semibold text-rose-700 disabled:opacity-60">
                Raise a dispute
              </button>
            )}
          </div>
        )}

        {status === 'COMPLETED' && (
          <p className="flex items-center justify-center gap-2 rounded-xl bg-[#EAF7EE] px-3 py-3 text-sm font-semibold text-[#008F45]">
            <IconCheck className="icon-sm" aria-hidden="true" /> Done — paid to creator
          </p>
        )}

        {status === 'DISPUTED' && (
          <div className="rounded-xl bg-amber-50 px-3 py-3 text-center text-sm font-medium text-amber-800">
            Under review by Creators KE. Actions are paused.
          </div>
        )}
      </div>
    </article>
  );
}
