import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  IconCheck, IconClock, IconCreditCard, IconLoader2, IconPhone,
} from '@tabler/icons-react';
import { invoiceService } from '@/features/payments/services/invoice.service';
import { formatCurrency, formatDate, getInitials } from '@/lib/utils';
import { usePageMeta } from '@/lib/usePageMeta';
import ErrorState from '@/components/shared/ErrorState';
import Skeleton from '@/components/ui/Skeleton';
import Modal from '@/components/ui/Modal';

const MAX_STATUS_POLLS = 20;
const POLL_INTERVAL = 3000;

const PAY_CSS = `
  .pay-invoice-page { min-height: 100vh; padding: var(--space-48) var(--gutter-public); background: var(--page-bg); }
  .pay-invoice-shell { width: min(100%, 560px); margin: 0 auto; }
  .pay-invoice-brand { display: flex; align-items: center; justify-content: center; gap: var(--space-8); margin-bottom: var(--space-24); color: var(--grey-600); font-size: var(--text-body-sm-size); }
  .pay-invoice-card { overflow: hidden; background: var(--white); border: 0.5px solid var(--grey-200); border-radius: var(--radius-xl); box-shadow: var(--shadow-lg); }
  .pay-invoice-header { padding: var(--space-24); color: var(--white); background: linear-gradient(135deg, var(--purple-800), var(--purple-600)); }
  .pay-invoice-creator { display: flex; align-items: center; gap: var(--space-12); }
  .pay-invoice-avatar { display: grid; width: 48px; height: 48px; flex: 0 0 48px; place-items: center; overflow: hidden; color: var(--purple-800); background: var(--white); border-radius: 50%; font-weight: 700; }
  .pay-invoice-avatar img { width: 100%; height: 100%; object-fit: cover; }
  .pay-invoice-creator-name { font-weight: 600; }
  .pay-invoice-header-label { margin-top: var(--space-4); color: rgba(255,255,255,.75); font-size: var(--text-body-sm-size); }
  .pay-invoice-content { padding: var(--space-24); }
  .pay-invoice-title { margin: 0; color: var(--black); font-size: var(--text-h3-size); line-height: var(--text-h3-lh); font-weight: 600; overflow-wrap: anywhere; }
  .pay-invoice-amount { margin: var(--space-20) 0; color: var(--black); font-size: clamp(28px, 8vw, 40px); line-height: 1.15; font-weight: 700; }
  .pay-invoice-description { color: var(--grey-600); font-size: var(--text-body-size); line-height: 1.6; white-space: pre-wrap; overflow-wrap: anywhere; }
  .pay-invoice-details { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-12); margin: var(--space-20) 0; padding: var(--space-16) 0; border-top: 0.5px solid var(--grey-100); border-bottom: 0.5px solid var(--grey-100); }
  .pay-invoice-detail-label { color: var(--grey-500); font-size: var(--text-caption-size); }
  .pay-invoice-detail-value { margin-top: var(--space-4); color: var(--black); font-size: var(--text-body-sm-size); font-weight: 600; }
  .pay-invoice-form { display: flex; flex-direction: column; gap: var(--space-16); }
  .pay-invoice-skeleton { display: flex; flex-direction: column; gap: var(--space-16); }
  .pay-invoice-result { text-align: center; padding: var(--space-24) var(--space-16); }
  .pay-invoice-result-icon { display: grid; width: 64px; height: 64px; margin: 0 auto var(--space-16); place-items: center; color: var(--status-success-text); background: var(--status-success-bg); border-radius: 50%; animation: pay-invoice-pop 220ms ease-out both; }
  .pay-invoice-result-icon--bad { color: var(--status-error-text); background: var(--status-error-bg); }
  .pay-invoice-result-icon--waiting { color: var(--status-warning-text); background: var(--status-warning-bg); }
  .pay-invoice-footnote { margin-top: var(--space-16); color: var(--grey-500); font-size: var(--text-caption-size); line-height: 1.5; text-align: center; }
  @keyframes pay-invoice-pop { from { opacity: 0; transform: scale(.85); } to { opacity: 1; transform: scale(1); } }
  @media (max-width: 600px) {
    .pay-invoice-page { padding-top: var(--space-24); padding-bottom: var(--space-24); }
    .pay-invoice-header, .pay-invoice-content { padding: var(--space-16); }
    .pay-invoice-details { grid-template-columns: 1fr; }
  }
  @media (prefers-reduced-motion: reduce) {
    .pay-invoice-result-icon { animation: none; }
  }
  .reduce-motion .pay-invoice-result-icon { animation: none; }
`;

function unwrapInvoice(data) {
  return data?.invoice ?? data;
}

function isPaid(status) {
  return ['paid', 'completed', 'success', 'successful'].includes(String(status ?? '').toLowerCase());
}

function isTerminalPayment(data) {
  const status = String(data?.status ?? data?.paymentStatus ?? '').toLowerCase();
  return ['paid', 'completed', 'success', 'successful', 'failed', 'cancelled', 'canceled', 'expired'].includes(status);
}

function normalizePhoneNumber(value) {
  const digits = value.replace(/\D/g, '');
  if (/^(07|01)\d{8}$/.test(digits)) return `254${digits.slice(1)}`;
  if (/^(7|1)\d{8}$/.test(digits)) return `254${digits}`;
  if (/^254(7|1)\d{8}$/.test(digits)) return digits;
  return null;
}

function CreatorIdentity({ invoice }) {
  const creator = invoice.creator ?? {};
  const name = creator.name ?? creator.fullName ?? invoice.creatorName ?? 'Creatorske creator';
  const avatar = creator.avatarUrl ?? creator.avatar ?? creator.profilePhoto ?? invoice.creatorAvatar;
  return (
    <div className="pay-invoice-creator">
      <span className="pay-invoice-avatar">
        {avatar ? <img src={avatar} alt="" /> : getInitials(name)}
      </span>
      <div>
        <div className="pay-invoice-creator-name">{name}</div>
        <div className="pay-invoice-header-label">Invoice payment</div>
      </div>
    </div>
  );
}

export default function PayInvoicePage() {
  const { invoiceId } = useParams();
  const queryClient = useQueryClient();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [paymentId, setPaymentId] = useState(null);
  const [isInitiating, setIsInitiating] = useState(false);
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const pollCount = useRef(0);

  usePageMeta('Pay invoice', 'Review and pay an invoice securely with M-Pesa.');

  const invoiceQuery = useQuery({
    queryKey: ['invoices', invoiceId],
    queryFn: async () => unwrapInvoice(await invoiceService.get(invoiceId)),
    enabled: Boolean(invoiceId),
  });
  const invoice = invoiceQuery.data;

  const paymentQuery = useQuery({
    queryKey: ['invoice-payment-status', paymentId],
    queryFn: () => invoiceService.getPaymentStatus(paymentId),
    enabled: Boolean(paymentId),
    refetchInterval: (query) => isTerminalPayment(query.state.data) ? false : POLL_INTERVAL,
  });

  useEffect(() => {
    if (!paymentId || !paymentQuery.data) return;
    pollCount.current += 1;
    if (isPaid(paymentQuery.data.status ?? paymentQuery.data.paymentStatus)) {
      queryClient.setQueryData(['invoices', invoiceId], (current) => current ? { ...current, status: 'paid' } : current);
      setVerifyOpen(false);
      setPaymentError('');
      return;
    }
    const status = String(paymentQuery.data.status ?? paymentQuery.data.paymentStatus ?? '').toLowerCase();
    if (['failed', 'cancelled', 'canceled', 'expired'].includes(status)) {
      setVerifyOpen(false);
      setPaymentError(paymentQuery.data.message ?? 'The payment was not completed. You can try again.');
    } else if (pollCount.current >= MAX_STATUS_POLLS) {
      setPaymentError('Payment confirmation is taking longer than expected. Check your M-Pesa messages before trying again.');
      setVerifyOpen(false);
      setPaymentId(null);
    }
  }, [invoiceId, paymentId, paymentQuery.data, queryClient]);

  async function handlePay(event) {
    event.preventDefault();
    const normalizedPhone = normalizePhoneNumber(phoneNumber);
    if (!normalizedPhone) {
      setPhoneError('Enter a valid Kenyan mobile number, such as 0712 345 678.');
      return;
    }
    setPhoneError('');
    setPaymentError('');
    pollCount.current = 0;
    setIsInitiating(true);
    try {
      const creatorId = invoice.creatorId ?? invoice.creator?.id;
      if (creatorId == null) throw new Error('This invoice is missing the creator payment details. Contact the creator.');
      const result = await invoiceService.initiatePayment({
        amount: Number(invoice.amount),
        phoneNumber: normalizedPhone,
        creatorId,
        invoiceId: invoice.id ?? invoice.invoiceId ?? invoiceId,
      });
      const id = result?.paymentId ?? result?.id ?? result?.checkoutRequestId ?? result?.CheckoutRequestID;
      if (!id) throw new Error('The payment service did not return a payment reference.');
      setPaymentId(String(id));
      setVerifyOpen(true);
    } catch (error) {
      setPaymentError(error?.message || 'Could not start the M-Pesa payment. Please try again.');
    } finally {
      setIsInitiating(false);
    }
  }

  async function verifyPayment() {
    setIsVerifying(true);
    setPaymentError('');
    try {
      await invoiceService.verifyPaymentPin(paymentId);
      setVerifyOpen(false);
    } catch (error) {
      setPaymentError(error?.message || 'Could not confirm the payment request. Check your phone and try again.');
    } finally {
      setIsVerifying(false);
    }
  }

  const paymentStatus = String(paymentQuery.data?.status ?? paymentQuery.data?.paymentStatus ?? '').toLowerCase();
  const paid = isPaid(invoice?.status) || isPaid(paymentStatus);
  const cancelled = ['cancelled', 'canceled', 'expired'].includes(String(invoice?.status ?? '').toLowerCase());
  const failed = ['failed', 'cancelled', 'canceled', 'expired'].includes(paymentStatus);

  if (invoiceQuery.isLoading) {
    return (
      <main className="pay-invoice-page">
        <style>{PAY_CSS}</style>
        <div className="pay-invoice-shell">
          <div className="pay-invoice-card pay-invoice-skeleton" style={{ padding: 'var(--space-24)' }}>
            <Skeleton width={160} height={48} />
            <Skeleton width="68%" height={24} />
            <Skeleton width="42%" height={40} />
            <Skeleton width="100%" height={16} />
            <Skeleton width="100%" height={56} />
          </div>
        </div>
      </main>
    );
  }

  if (invoiceQuery.isError || !invoice) {
    return (
      <main className="pay-invoice-page">
        <style>{PAY_CSS}</style>
        <div className="pay-invoice-shell">
          <ErrorState
            title="Could not load this invoice"
            description={invoiceQuery.error?.message || 'This invoice may no longer be available.'}
            onRetry={invoiceQuery.refetch}
          />
        </div>
      </main>
    );
  }

  return (
    <main className="pay-invoice-page">
      <style>{PAY_CSS}</style>
      <div className="pay-invoice-shell">
        <div className="pay-invoice-brand">Creatorske <span aria-hidden="true">·</span> Secure invoice</div>
        <section className="pay-invoice-card" aria-label="Invoice details">
          <header className="pay-invoice-header"><CreatorIdentity invoice={invoice} /></header>
          {paid ? (
            <div className="pay-invoice-result" role="status">
              <div className="pay-invoice-result-icon"><IconCheck className="icon-xl" aria-hidden="true" /></div>
              <h1 className="hero-title">Already paid</h1>
              <p className="text-body-sm" style={{ color: 'var(--grey-600)' }}>This invoice has been paid. Thank you.</p>
            </div>
          ) : cancelled ? (
            <div className="pay-invoice-result" role="status">
              <div className="pay-invoice-result-icon pay-invoice-result-icon--bad"><IconClock className="icon-xl" aria-hidden="true" /></div>
              <h1 className="hero-title">Invoice unavailable</h1>
              <p className="text-body-sm" style={{ color: 'var(--grey-600)' }}>This invoice has expired or was cancelled. Contact the creator for an updated invoice.</p>
            </div>
          ) : (
            <div className="pay-invoice-content">
              <div className="eyebrow">Invoice {invoice.invoiceNumber ? `#${invoice.invoiceNumber}` : ''}</div>
              <h1 className="pay-invoice-title">{invoice.title || 'Invoice'}</h1>
              <div className="pay-invoice-amount">{formatCurrency(Number(invoice.amount) || 0)}</div>
              {invoice.description && <p className="pay-invoice-description">{invoice.description}</p>}

              <div className="pay-invoice-details">
                <div>
                  <div className="pay-invoice-detail-label">Status</div>
                  <div className="pay-invoice-detail-value">
                    <span className={`tag ${String(invoice.status).toLowerCase() === 'pending' ? 'tag-warning' : 'tag-default'}`}>
                      {invoice.status || 'Pending'}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="pay-invoice-detail-label">Due date</div>
                  <div className="pay-invoice-detail-value">{invoice.dueDate ? formatDate(invoice.dueDate) : 'No due date'}</div>
                </div>
              </div>

              {failed && <div className="alert alert-error" role="alert">{paymentError || 'The payment did not go through. You can try again.'}</div>}
              {!failed && (paymentError || paymentQuery.error) && (
                <div className="alert alert-warning" role="alert">
                  {paymentError || paymentQuery.error?.message || 'Payment status could not be checked.'}
                </div>
              )}

              <form className="pay-invoice-form" onSubmit={handlePay}>
                <div>
                  <label className="field-label" htmlFor="payment-phone">M-Pesa phone number</label>
                  <div style={{ position: 'relative' }}>
                    <IconPhone className="icon-sm" aria-hidden="true" style={{ position: 'absolute', left: 'var(--space-12)', top: '50%', transform: 'translateY(-50%)', color: 'var(--grey-500)' }} />
                    <input
                      id="payment-phone"
                      className="input input-md"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      value={phoneNumber}
                      onChange={(event) => setPhoneNumber(event.target.value)}
                      placeholder="0712 345 678"
                      aria-invalid={Boolean(phoneError)}
                      aria-describedby={phoneError ? 'payment-phone-error' : undefined}
                      style={{ paddingLeft: 'var(--input-icon-pad)' }}
                    />
                  </div>
                  {phoneError && <div className="field-hint error" id="payment-phone-error">{phoneError}</div>}
                </div>
                <div>
                  <label className="field-label" htmlFor="payment-amount">Amount</label>
                  <input id="payment-amount" className="input input-md" value={formatCurrency(Number(invoice.amount) || 0)} disabled readOnly />
                </div>
                <button className="btn btn-purple btn-lg btn-full" type="submit" disabled={isInitiating || (Boolean(paymentId) && !failed)}>
                  {isInitiating || (paymentId && !failed)
                    ? <IconLoader2 className="icon-sm" style={{ animation: 'spin 0.8s linear infinite' }} aria-hidden="true" />
                    : <IconCreditCard className="icon-sm" aria-hidden="true" />}
                  {isInitiating ? 'Starting payment' : paymentId && !failed ? 'Waiting for payment' : 'Pay with M-Pesa'}
                </button>
                <p className="pay-invoice-footnote">We&apos;ll send a payment prompt to your phone. Enter your M-Pesa PIN only on the M-Pesa prompt; Creatorske will never ask for or store your PIN.</p>
              </form>
            </div>
          )}
        </section>
      </div>

      <Modal open={verifyOpen && !paid} onClose={() => setVerifyOpen(false)} title="Confirm M-Pesa payment" size="sm">
        <div style={{ textAlign: 'center' }}>
          <div className="pay-invoice-result-icon pay-invoice-result-icon--waiting"><IconPhone className="icon-xl" aria-hidden="true" /></div>
          <p className="text-body-sm" style={{ color: 'var(--grey-700)' }}>
            Check your phone and enter your PIN on the M-Pesa prompt. Do not share your PIN here.
          </p>
          {paymentError && <div className="alert alert-error" role="alert" style={{ marginBottom: 'var(--space-16)' }}>{paymentError}</div>}
          <button type="button" className={`btn btn-purple btn-full${isVerifying ? ' btn-loading' : ''}`} onClick={verifyPayment} disabled={isVerifying}>
            {isVerifying ? <IconLoader2 className="icon-sm" aria-hidden="true" /> : <IconCheck className="icon-sm" aria-hidden="true" />}
            {isVerifying ? 'Confirming' : 'I have entered my PIN'}
          </button>
        </div>
      </Modal>
    </main>
  );
}
