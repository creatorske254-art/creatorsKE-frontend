import { useState } from 'react';
import { toast } from 'sonner';
import Modal from '@/components/ui/Modal';
import { chatInvoiceService } from '@/features/invoices/services/chat-invoice.service';
import { formatCurrency } from '@/lib/utils';
import { IconSend } from '@tabler/icons-react';

/** Creator issues an invoice card into the thread (POST /invoices/create). */
export default function SendInvoiceModal({ open, onClose, chatId, brandId, onCreated }) {
  const [serviceTitle, setServiceTitle] = useState('');
  const [price, setPrice] = useState('');
  const [serviceDescription, setServiceDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const priceValue = Number(String(price).replace(/[^\d.]/g, '')) || 0;
  const canSubmit = Boolean(serviceTitle.trim()) && priceValue > 0 && !submitting && Boolean(chatId);

  const reset = () => {
    setServiceTitle('');
    setPrice('');
    setServiceDescription('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    try {
      const result = await chatInvoiceService.create({
        chatId,
        brandId,
        serviceTitle: serviceTitle.trim(),
        price: priceValue,
        serviceDescription: serviceDescription.trim() || undefined,
      });
      const invoice = result?.invoice ?? result;
      onCreated?.(invoice);
      reset();
      onClose();
    } catch (err) {
      // Surface the API error body rather than swallowing it.
      toast.error(err?.message || 'Could not create the invoice.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Issue an invoice" size="sm">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-16)' }}>
        <div>
          <label className="field-label" htmlFor="invoice-title">
            Service <span className="field-required">*</span>
          </label>
          <input
            id="invoice-title"
            className="input input-md"
            value={serviceTitle}
            onChange={(event) => setServiceTitle(event.target.value)}
            placeholder="e.g. 1 TikTok video"
            style={{ marginTop: 'var(--space-8)' }}
            autoFocus
          />
        </div>

        <div>
          <label className="field-label" htmlFor="invoice-price">
            Price (KES) <span className="field-required">*</span>
          </label>
          <input
            id="invoice-price"
            type="number"
            inputMode="numeric"
            min="1"
            className="input input-md"
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            placeholder="5000"
            style={{ marginTop: 'var(--space-8)' }}
          />
          <div className="text-hint" style={{ marginTop: 'var(--space-4)' }}>
            {priceValue > 0 ? formatCurrency(priceValue) : 'The brand pays this into escrow.'}
          </div>
        </div>

        <div>
          <label className="field-label" htmlFor="invoice-description">
            Description
          </label>
          <textarea
            id="invoice-description"
            className="input input-md"
            rows={3}
            value={serviceDescription}
            onChange={(event) => setServiceDescription(event.target.value)}
            placeholder="Deliverables, revisions, turnaround…"
            style={{ marginTop: 'var(--space-8)', resize: 'vertical' }}
          />
        </div>

        <button type="submit" className="btn btn-purple btn-lg btn-full" disabled={!canSubmit}>
          <IconSend className="icon-sm" aria-hidden="true" />
          {submitting ? 'Sending…' : 'Send invoice to chat'}
        </button>
      </form>
    </Modal>
  );
}
