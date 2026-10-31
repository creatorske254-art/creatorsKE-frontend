import { Link } from 'react-router-dom';
import { IconCheck, IconClock, IconFileInvoice, IconExternalLink } from '@tabler/icons-react';
import { formatCurrency } from '@/lib/utils';

const INVOICE_CSS = `
  .chat-invoice {
    width: min(100%, 340px);
    overflow: hidden;
    color: var(--black);
    background: var(--white);
    border: 0.5px solid var(--grey-200);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-sm);
  }
  .chat-invoice__banner {
    display: flex;
    align-items: center;
    gap: var(--space-12);
    padding: var(--space-12) var(--space-16);
    color: var(--purple-700);
    background: var(--purple-50);
  }
  .chat-invoice__icon {
    display: grid;
    width: 36px;
    height: 36px;
    flex: 0 0 36px;
    place-items: center;
    color: var(--purple-700);
    background: var(--white);
    border-radius: var(--radius-md);
  }
  .chat-invoice__body { padding: var(--space-16); }
  .chat-invoice__top { display: flex; justify-content: space-between; align-items: flex-start; gap: var(--space-8); }
  .chat-invoice__title { min-width: 0; color: var(--black); font-size: var(--text-body-size); font-weight: 600; overflow-wrap: anywhere; }
  .chat-invoice__number { margin-top: var(--space-4); color: var(--grey-500); font-size: var(--text-caption-size); }
  .chat-invoice__amount { margin: var(--space-16) 0; color: var(--black); font-size: var(--text-h3-size); font-weight: 700; }
  .chat-invoice__status { display: inline-flex; align-items: center; gap: var(--space-4); flex-shrink: 0; }
  .chat-invoice__description { margin-top: var(--space-8); color: var(--grey-600); font-size: var(--text-body-sm-size); line-height: 1.5; white-space: pre-wrap; overflow-wrap: anywhere; }
  .chat-invoice__actions { display: flex; gap: var(--space-8); }
  .chat-invoice__actions .btn { flex: 1; justify-content: center; }
  @media (max-width: 600px) {
    .chat-invoice { width: min(100%, 300px); }
    .chat-invoice__body { padding: var(--space-12); }
  }
`;

function invoiceStatus(invoice) {
  const status = String(invoice.status ?? 'pending').toLowerCase();
  if (status === 'paid' || status === 'completed' || status === 'success') {
    return { label: 'Paid', className: 'tag-success', Icon: IconCheck };
  }
  if (status === 'pending' || status === 'unpaid') {
    return { label: 'Pending', className: 'tag-warning', Icon: IconClock };
  }
  if (status === 'cancelled' || status === 'canceled' || status === 'expired') {
    return { label: status, className: 'tag-error', Icon: IconClock };
  }
  return { label: status.replaceAll('_', ' '), className: 'tag-default', Icon: IconClock };
}

export default function InvoiceCard({ invoice, isClient = false, invoiceId }) {
  const id = invoice?.id ?? invoice?.invoiceId ?? invoiceId;
  const status = invoiceStatus(invoice ?? {});

  return (
    <>
      <style>{INVOICE_CSS}</style>
      <article className="chat-invoice" aria-label={`Invoice ${invoice?.invoiceNumber ?? ''}`}>
        <div className="chat-invoice__banner">
          <span className="chat-invoice__icon"><IconFileInvoice className="icon-md" aria-hidden="true" /></span>
          <span className="section-title">Invoice</span>
          <span className={`tag ${status.className} chat-invoice__status`}>
            <status.Icon className="icon-xs" aria-hidden="true" />
            {status.label}
          </span>
        </div>
        <div className="chat-invoice__body">
          <div className="chat-invoice__top">
            <div className="chat-invoice__title">{invoice?.title || 'Invoice'}</div>
          </div>
          {invoice?.invoiceNumber && <div className="chat-invoice__number">#{invoice.invoiceNumber}</div>}
          <div className="chat-invoice__amount">{formatCurrency(Number(invoice?.amount) || 0)}</div>
          {invoice?.description && <div className="chat-invoice__description">{invoice.description}</div>}
          <div className="chat-invoice__actions" style={{ marginTop: 'var(--space-16)' }}>
            {isClient && id && status.label !== 'Paid' && status.className !== 'tag-error' ? (
              <Link className="btn btn-purple btn-sm" to={`/pay/${encodeURIComponent(id)}`} target="_blank" rel="noreferrer">
                Pay now <IconExternalLink className="icon-xs" aria-hidden="true" />
              </Link>
            ) : !isClient && id ? (
              <Link className="btn btn-secondary btn-sm" to={`/pay/${encodeURIComponent(id)}`} target="_blank" rel="noreferrer">
                View <IconExternalLink className="icon-xs" aria-hidden="true" />
              </Link>
            ) : !isClient ? (
              <span className="text-hint">Invoice {status.label.toLowerCase()}</span>
            ) : (
              <span className="text-hint">Invoice {status.label.toLowerCase()}</span>
            )}
          </div>
        </div>
      </article>
    </>
  );
}
