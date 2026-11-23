
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useChatInvoice } from '@/features/invoices/hooks/useChatInvoice';
import {
  INVOICE_STATUS,
  disputeReasonLabel,
  invoiceAmount,
  invoiceDescription,
  invoiceTitle,
  isDisputeEligible,
  isLegacyStatus,
  normalizeStatus,
  statusLabel,
  statusTone,
} from '@/features/invoices/constants/invoice';
import { formatCurrency } from '@/lib/utils';
import {
  IconAlertTriangle,
  IconCheck,
  IconClockHour4,
  IconHourglassEmpty,
  IconLock,
  IconPencil,
  IconPhone,
  IconUpload,
} from '@tabler/icons-react';
import DisputeModal from './DisputeModal';

const CARD_CSS = `
  .inv-cimport { useEffect, useState } from 'react';ard {
    background: var(--white);
    border: 0.5px solid var(--grey-100);
    border-radius: var(--radius-xl);
    box-shadow: var(--shadow-md);
    padding: var(--card-pad-md);
    display: flex;
    flex-direction: column;
    gap: var(--space-12);
    min-width: 280px;
    max-width: 420px;
  }
  .inv-card__top { display: flex; align-items: flex-start; justify-content: space-between; gap: var(--space-8); }
  .inv-card__title { margin: 0; font-size: var(--text-body-size); font-weight: 600; color: var(--black); }
  .inv-card__desc { margin: 0; font-size: var(--text-body-sm-size); line-height: 1.6; color: var(--grey-600); white-space: pre-wrap; }
  .inv-card__amount-row {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: var(--space-8);
    padding-top: var(--space-12);
    border-top: 0.5px solid var(--grey-100);
  }
  .inv-card__amount-label { font-size: var(--text-caption-size); color: var(--grey-500); text-transform: uppercase; letter-spacing: 0.06em; }
  .inv-card__amount { font-size: 22px; font-weight: 700; color: var(--black); font-variant-numeric: tabular-nums; }
  .inv-card__edit { display: flex; flex-direction: column; gap: var(--space-8); }
  .inv-card__edit-grid { display: flex; gap: var(--space-8); }
  .inv-card__input, .inv-card__textarea {
    width: 100%;
    padding: var(--space-8) var(--space-12);
    border: 0.5px solid var(--grey-200);
    border-radius: var(--radius-md);
    font: inherit;
    font-size: var(--text-body-sm-size);
    color: var(--black);
    background: var(--white);
    outline: none;
  }
  .inv-card__input:focus, .inv-card__textarea:focus { border-color: var(--purple-400); }
  .inv-card__textarea { resize: vertical; min-height: 60px; }
  .inv-card__actions { display: flex; flex-direction: column; gap: var(--space-8); }
  .inv-card__row { display: flex; gap: var(--space-8); }
  .inv-card__btn {
    display: inline-flex; align-items: center; justify-content: center; gap: var(--space-8);
    width: 100%; padding: var(--space-12) var(--space-16);
    border: none; border-radius: var(--radius-md);
    font-family: var(--font-body); font-size: var(--text-body-sm-size); font-weight: 600;
    cursor: pointer; transition: all var(--transition-fast); line-height: 1;
  }
  .inv-card__btn:disabled { opacity: 0.45; cursor: not-allowed; }
  .inv-card__btn--primary { background: var(--black); color: var(--white); }
  .inv-card__btn--purple { background: var(--purple-600); color: var(--purple-foreground); }
  .inv-card__btn--success { background: var(--status-success); color: var(--white); }
  .inv-card__btn--ghost { background: transparent; color: var(--black); border: 0.5px solid var(--grey-200); }
  .inv-card__btn--danger { background: transparent; color: var(--status-error-text); border: 0.5px solid var(--status-error); }
  .inv-card__badge {
    display: inline-flex; align-items: center; gap: var(--space-4);
    padding: var(--space-4) var(--space-12);
    border-radius: var(--radius-pill);
    font-size: 11px; font-weight: 600;
    background: var(--status-info-bg); color: var(--status-info-text);
  }
  .inv-card__badge--success { background: var(--status-success-bg); color: var(--status-success-text); }
  .inv-card__badge--error { background: var(--status-error-bg); color: var(--status-error-text); }
  .inv-card__hint { font-size: 11.5px; color: var(--grey-500); text-align: center; line-height: 1.5; }
  .inv-card__error {
    display: flex; align-items: flex-start; gap: var(--space-8);
    padding: var(--space-8) var(--space-12);
    border-radius: var(--radius-md);
    background: var(--status-error-bg); color: var(--status-error-text);
    font-size: 11.5px; line-height: 1.5;
  }
  .inv-card__link { display: block; font-size: var(--text-body-sm-size); color: var(--purple-600); word-break: break-all; }
  .inv-card__link:hover { text-decoration: underline; }
`;

// How long the card waits for the M-Pesa callback before offering a retry.
const PAYMENT_WAIT_MS = 120_000;

function reasonFor({ isCreator, isBrand, status, invoice, awaitingPayment, editing }) {
  if (editing) return 'Save or cancel the change first.';
  if (status === INVOICE_STATUS.PENDING) {
    if (isCreator) return '';
    if (!isBrand) return 'Only the brand can pay this invoice.';
    if (awaitingPayment) return 'Waiting for the M-Pesa prompt to be confirmed.';
    return '';
  }
  if (status === INVOICE_STATUS.HELD) {
    if (isCreator) return '';
    return isBrand ? 'The creator has to mark the work delivered first.' : 'Only the creator can deliver.';
  }
  if (status === INVOICE_STATUS.DELIVERED) {
    if (isBrand) return '';
    if (isCreator) {
      return isDisputeEligible(invoice)
        ? ''
        : 'You can raise a dispute for 24 hours after delivery, and only while that window is open.';
    }
    return 'Only the brand can approve the delivery.';
  }
  return '';
}

export default function InvoiceCard({ invoice, threadId, isCreator, isBrand }) {
  const { user } = useAuth();
  // A teammate acts for the brand account, so the role check also covers brandId.
  const viewerIsBrand = isBrand ?? user?.role === 'brand';
  const viewerIsCreator = isCreator ?? (Boolean(user) && !viewerIsBrand);

  const status = normalizeStatus(invoice?.status);
  const amount = invoiceAmount(invoice);
  const title = invoiceTitle(invoice);
  const description = invoiceDescription(invoice);

  const {
    updateInvoice,
    isUpdating,
    acceptPay,
    isPaying,
    deliver,
    isDelivering,
    approve,
    isApproving,
    dispute,
    isDisputing,
  } = useChatInvoice(threadId);

  const [editing, setEditing] = useState(false);
  const [draftPrice, setDraftPrice] = useState(String(amount));
  const [draftDescription, setDraftDescription] = useState(description);
  const [contentLink, setContentLink] = useState('');
  const [awaitingPayment, setAwaitingPayment] = useState(false);
  const [paymentFailed, setPaymentFailed] = useState(false);
  const [disputeOpen, setDisputeOpen] = useState(false);
  const [error, setError] = useState('');

  // The amount/description always come from the invoice (socket-patched), never local state.
  useEffect(() => {
    if (editing) return;
    setDraftPrice(String(amount));
    setDraftDescription(description);
  }, [amount, description, editing]);

  // Leaving PENDING means the payment landed (or the invoice moved on) - stop waiting.
  useEffect(() => {
    if (status === INVOICE_STATUS.PENDING) return;
    setAwaitingPayment(false);
    setPaymentFailed(false);
    setError('');
  }, [status]);

  useEffect(() => {
    if (!awaitingPayment) return undefined;
    const timer = setTimeout(() => {
      setAwaitingPayment(false);
      setPaymentFailed(true);
      setError('No M-Pesa confirmation yet. You can retry the payment.');
    }, PAYMENT_WAIT_MS);
    return () => clearTimeout(timer);
  }, [awaitingPayment]);

  const run = async (action, fallback) => {
    setError('');
    try {
      await action();
      return true;
    } catch (err) {
      setError(err?.message || fallback);
      return false;
    }
  };

  const handleSavePrice = () => {
    const nextPrice = Number(String(draftPrice).replace(/[^\d.]/g, ''));
    if (!nextPrice || nextPrice <= 0) {
      setError('Enter a price greater than zero.');
      return;
    }
    run(
      async () => {
        await updateInvoice({
          invoiceId: invoice.id,
          price: nextPrice,
          serviceDescription: draftDescription.trim() || undefined,
        });
        setEditing(false);
      },
      'Could not update the invoice.',
    );
  };

  const handlePay = () => {
    setPaymentFailed(false);
    // The status never flips here - the M-Pesa result arrives on `invoiceUpdated`.
    run(async () => {
      setAwaitingPayment(true);
      try {
        await acceptPay(invoice.id);
      } catch (err) {
        // A failed push leaves nothing outstanding, so the retry is available immediately.
        setAwaitingPayment(false);
        throw err;
      }
    }, 'Could not start the M-Pesa payment.');
  };

  const handleDeliver = () =>
    run(async () => {
      await deliver({ invoiceId: invoice.id, contentLink: contentLink.trim() });
      setContentLink('');
    }, 'Could not mark the work as delivered.');

  const handleApprove = () => run(() => approve(invoice.id), 'Could not approve the delivery.');

  const handleDispute = ({ reason, details }) =>
    run(async () => {
      await dispute({ invoiceId: invoice.id, reason, details });
      setDisputeOpen(false);
    }, 'Could not raise the dispute.');

  const canEdit = viewerIsCreator && status === INVOICE_STATUS.PENDING;
  const canDeliver = viewerIsCreator && status === INVOICE_STATUS.HELD;
  const canApprove = viewerIsBrand && status === INVOICE_STATUS.DELIVERED;
  // The brand may dispute at any point while the money is held or the work is delivered.
  const brandCanDispute =
    viewerIsBrand && (status === INVOICE_STATUS.HELD || status === INVOICE_STATUS.DELIVERED);
  // The creator only gets the flag the backend sets (24h window after delivery).
  const canDispute = status === INVOICE_STATUS.DELIVERED && isDisputeEligible(invoice);
  const disputeAllowed = brandCanDispute || (viewerIsCreator && canDispute);
  const disabledReason = reasonFor({
    isCreator: viewerIsCreator,
    isBrand: viewerIsBrand,
    status,
    invoice,
    awaitingPayment,
    editing,
  });

  const deliveredLink = invoice?.contentLink ?? invoice?.deliveredContentLink ?? null;
  const payDisabled = !viewerIsBrand || awaitingPayment || isPaying || isUpdating;

  return (
    <div className="inv-card">
      <style>{CARD_CSS}</style>

      <div className="inv-card__top">
        <h4 className="inv-card__title">{title}</h4>
        <span className={`tag ${statusTone(status)}`}>{statusLabel(status)}</span>
      </div>

      {description && !editing && <p className="inv-card__desc">{description}</p>}

      <div className="inv-card__amount-row">
        <span className="inv-card__amount-label">Amount</span>
        <span className="inv-card__amount">{formatCurrency(amount)}</span>
      </div>

      {editing ? (
        <div className="inv-card__edit">
          <label className="field-label" htmlFor={`price-${invoice.id}`}>
            New price (KES)
          </label>
          <div className="inv-card__edit-grid">
            <input
              id={`price-${invoice.id}`}
              type="number"
              inputMode="numeric"
              min="1"
              className="inv-card__input"
              value={draftPrice}
              onChange={(event) => setDraftPrice(event.target.value)}
            />
          </div>
          <label className="field-label" htmlFor={`desc-${invoice.id}`}>
            Description
          </label>
          <textarea
            id={`desc-${invoice.id}`}
            className="inv-card__textarea"
            value={draftDescription}
            onChange={(event) => setDraftDescription(event.target.value)}
          />
          <div className="inv-card__row">
            <button
              type="button"
              className="inv-card__btn inv-card__btn--purple"
              onClick={handleSavePrice}
              disabled={isUpdating}
            >
              <IconCheck className="icon-sm" aria-hidden="true" />
              {isUpdating ? 'Saving…' : 'Save changes'}
            </button>
            <button
              type="button"
              className="inv-card__btn inv-card__btn--ghost"
              onClick={() => {
                setEditing(false);
                setDraftPrice(String(amount));
                setDraftDescription(description);
                setError('');
              }}
              disabled={isUpdating}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      {error && (
        <div className="inv-card__error" role="alert">
          <IconAlertTriangle className="icon-sm" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      <div className="inv-card__actions">
        {status === INVOICE_STATUS.PENDING && (
          <>
            {canEdit && (
              <button
                type="button"
                className="inv-card__btn inv-card__btn--ghost"
                onClick={() => setEditing(true)}
                disabled={editing || isUpdating}
                title={disabledReason || 'Edit the price while the invoice is unpaid'}
              >
                <IconPencil className="icon-sm" aria-hidden="true" />
                Edit price
              </button>
            )}
            <button
              type="button"
              className="inv-card__btn inv-card__btn--success"
              onClick={handlePay}
              disabled={payDisabled}
              title={
                payDisabled
                  ? disabledReason || 'Waiting for the M-Pesa result'
                  : 'Pay with M-Pesa - funds are held in escrow'
              }
            >
              {awaitingPayment ? (
                <>
                  <IconHourglassEmpty className="icon-sm" aria-hidden="true" />
                  Waiting for M-Pesa…
                </>
              ) : (
                <>
                  <IconPhone className="icon-sm" aria-hidden="true" />
                  Pay {formatCurrency(amount)}
                </>
              )}
            </button>
            {viewerIsCreator && (
              <p className="inv-card__hint">Price stays editable until the brand pays.</p>
            )}
            {viewerIsBrand && (awaitingPayment || paymentFailed) && (
              <p className="inv-card__hint">
                {paymentFailed
                  ? 'No confirmation received. Retry the payment or check your M-Pesa messages.'
                  : 'Enter your M-Pesa PIN on your phone to complete the payment.'}
              </p>
            )}
            {!viewerIsBrand && !viewerIsCreator && (
              <p className="inv-card__hint">Sign in as the brand to pay this invoice.</p>
            )}
          </>
        )}

        {status === INVOICE_STATUS.HELD && (
          <>
            <div className="inv-card__badge">
              <IconLock className="icon-sm" aria-hidden="true" />
              Held in escrow
            </div>
            {canDeliver ? (
              <>
                <input
                  type="url"
                  className="inv-card__input"
                  placeholder="https://… link to the delivered work"
                  aria-label="Delivered content link"
                  value={contentLink}
                  onChange={(event) => setContentLink(event.target.value)}
                />
                <button
                  type="button"
                  className="inv-card__btn inv-card__btn--purple"
                  onClick={handleDeliver}
                  disabled={!contentLink.trim() || isDelivering}
                  title={!contentLink.trim() ? 'Add a link to the delivered work first' : 'Mark as delivered'}
                >
                  <IconUpload className="icon-sm" aria-hidden="true" />
                  {isDelivering ? 'Saving…' : 'Mark delivered'}
                </button>
              </>
            ) : viewerIsBrand ? (
              <button
                type="button"
                className="inv-card__btn inv-card__btn--danger"
                onClick={() => setDisputeOpen(true)}
                disabled={!brandCanDispute || isDisputing}
                title={brandCanDispute ? 'Raise a dispute while the funds are held' : disabledReason}
              >
                <IconAlertTriangle className="icon-sm" aria-hidden="true" />
                Raise dispute
              </button>
            ) : (
              <p className="inv-card__hint">{disabledReason || 'Waiting for the creator to deliver.'}</p>
            )}
            {viewerIsBrand && (
              <p className="inv-card__hint">
                Funds unlock when you approve the delivery, or when an admin rules on a dispute.
              </p>
            )}
          </>
        )}

        {status === INVOICE_STATUS.DELIVERED && (
          <>
            {deliveredLink ? (
              <a
                className="inv-card__link"
                href={deliveredLink}
                target="_blank"
                rel="noreferrer"
              >
                {deliveredLink}
              </a>
            ) : (
              <p className="inv-card__hint">Delivered - awaiting approval.</p>
            )}
            {canApprove && (
              <div className="inv-card__row">
                <button
                  type="button"
                  className="inv-card__btn inv-card__btn--success"
                  onClick={handleApprove}
                  disabled={isApproving}
                >
                  <IconCheck className="icon-sm" aria-hidden="true" />
                  {isApproving ? 'Releasing…' : 'Approve & release'}
                </button>
                <button
                  type="button"
                  className="inv-card__btn inv-card__btn--danger"
                  onClick={() => setDisputeOpen(true)}
                  disabled={!brandCanDispute || isDisputing}
                >
                  <IconAlertTriangle className="icon-sm" aria-hidden="true" />
                  Dispute
                </button>
              </div>
            )}
            {viewerIsCreator && (
              <button
                type="button"
                className="inv-card__btn inv-card__btn--ghost"
                onClick={() => setDisputeOpen(true)}
                disabled={!canDispute || isDisputing}
                title={canDispute ? 'Raise a dispute' : disabledReason}
              >
                <IconAlertTriangle className="icon-sm" aria-hidden="true" />
                {canDispute ? 'Raise dispute' : 'Dispute window closed'}
              </button>
            )}
            {!canApprove && !viewerIsCreator && (
              <p className="inv-card__hint">{disabledReason || 'Waiting for a response.'}</p>
            )}
          </>
        )}

        {status === INVOICE_STATUS.DISPUTED && (
          <>
            <div className="inv-card__badge inv-card__badge--error">
              <IconClockHour4 className="icon-sm" aria-hidden="true" />
              Under admin review
            </div>
            {invoice?.disputeReason && (
              <p className="inv-card__hint">
                Reason: {disputeReasonLabel(invoice.disputeReason)}
                {invoice?.disputeDetails ? ` — ${invoice.disputeDetails}` : ''}
              </p>
            )}
            <p className="inv-card__hint">
              Funds stay in escrow until Creatorske rules on the case. That decision is final.
            </p>
          </>
        )}

        {(status === INVOICE_STATUS.COMPLETED || status === INVOICE_STATUS.RESOLVED) && (
          <div className="inv-card__badge inv-card__badge--success">
            <IconCheck className="icon-sm" aria-hidden="true" />
            Paid out to the creator
          </div>
        )}

        {status === INVOICE_STATUS.REFUNDED && (
          <div className="inv-card__badge">
            <IconCheck className="icon-sm" aria-hidden="true" />
            Refunded to the brand
          </div>
        )}

        {isLegacyStatus(status) && (
          <p className="inv-card__hint">
            {statusLabel(status)} - this invoice is not part of escrow and is read-only.
          </p>
        )}

      </div>

      <DisputeModal
        open={disputeOpen}
        onClose={() => setDisputeOpen(false)}
        onDispute={handleDispute}
        submitting={isDisputing}
        disabled={!disputeAllowed}
      />
    </div>
  );
}
