import { useState } from 'react';
import { IconFileInvoice, IconLoader2 } from '@tabler/icons-react';
import Modal from '@/components/ui/Modal';
import { invoiceService } from '@/features/payments/services/invoice.service';

const MIN_AMOUNT = 1;
const MAX_AMOUNT = 150_000;

export default function SendInvoiceModal({ open, onClose, clientId, chatId, onInvoiceCreated }) {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  function reset() {
    setTitle('');
    setAmount('');
    setDescription('');
    setDueDate('');
    setError('');
  }

  function close() {
    if (isSubmitting) return;
    reset();
    onClose();
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const parsedAmount = Number(amount);
    if (!title.trim()) {
      setError('Enter an invoice title.');
      return;
    }
    if (!Number.isInteger(parsedAmount) || parsedAmount < MIN_AMOUNT || parsedAmount > MAX_AMOUNT) {
      setError('Enter an amount between KES 1 and KES 150,000.');
      return;
    }
    if (clientId == null || chatId == null) {
      setError('The invoice recipient or chat could not be identified. Refresh the conversation and try again.');
      return;
    }

    setError('');
    setIsSubmitting(true);
    try {
      const result = await invoiceService.create({
        clientId,
        chatId,
        amount: parsedAmount,
        title: title.trim(),
        description: description.trim(),
        dueDate: dueDate || undefined,
      });
      const invoice = result?.invoice ?? result;
      if (!invoice || typeof invoice !== 'object' || !(invoice.id ?? invoice.invoiceId)) {
        throw new Error('The server did not return a valid invoice.');
      }
      onInvoiceCreated(invoice);
      reset();
      onClose();
    } catch (submitError) {
      setError(submitError?.message || 'Could not send this invoice. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal open={open} onClose={close} title="Send an invoice" size="sm">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-16)' }}>
        <p className="text-body-sm" style={{ color: 'var(--grey-600)', margin: 0 }}>
          Create a secure invoice for your client in this conversation.
        </p>

        <div>
          <label className="field-label" htmlFor="invoice-title">Title<span className="field-required" /></label>
          <input
            id="invoice-title"
            className="input input-md"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            maxLength={120}
            required
            autoFocus
            placeholder="e.g. Instagram campaign"
          />
        </div>

        <div>
          <label className="field-label" htmlFor="invoice-amount">Amount (KES)<span className="field-required" /></label>
          <input
            id="invoice-amount"
            className="input input-md"
            type="number"
            min={MIN_AMOUNT}
            max={MAX_AMOUNT}
            step="1"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            required
            placeholder="0"
          />
          <div className="text-hint" style={{ marginTop: 'var(--space-4)' }}>KES 1 to KES 150,000</div>
        </div>

        <div>
          <label className="field-label" htmlFor="invoice-description">Description <span style={{ color: 'var(--grey-400)', fontWeight: 400 }}>(optional)</span></label>
          <textarea
            id="invoice-description"
            className="input input-md textarea"
            rows={3}
            maxLength={1000}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Add details about the work or deliverables"
          />
        </div>

        <div>
          <label className="field-label" htmlFor="invoice-due-date">Due date <span style={{ color: 'var(--grey-400)', fontWeight: 400 }}>(optional)</span></label>
          <input
            id="invoice-due-date"
            className="input input-md"
            type="date"
            value={dueDate}
            onChange={(event) => setDueDate(event.target.value)}
          />
        </div>

        {error && <div className="alert alert-error" role="alert">{error}</div>}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-8)' }}>
          <button type="button" className="btn btn-ghost" onClick={close} disabled={isSubmitting}>Cancel</button>
          <button type="submit" className={`btn btn-purple${isSubmitting ? ' btn-loading' : ''}`} disabled={isSubmitting}>
            {isSubmitting
              ? <IconLoader2 className="icon-sm" aria-hidden="true" />
              : <IconFileInvoice className="icon-sm" aria-hidden="true" />}
            {isSubmitting ? 'Sending' : 'Send invoice'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
