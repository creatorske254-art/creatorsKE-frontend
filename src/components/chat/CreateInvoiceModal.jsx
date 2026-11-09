import { useEffect, useState } from 'react';
import Modal from '@/components/ui/Modal';

export default function CreateInvoiceModal({ open, onClose, otherUserName, onCreateInvoice }) {
  const [name, setName] = useState(otherUserName || '');
  const [price, setPrice] = useState('');
  const [serviceDescription, setServiceDescription] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setName(otherUserName || '');
      setPrice('');
      setServiceDescription('');
      setError('');
    }
  }, [open, otherUserName]);

  const handleSubmit = (event) => {
    event.preventDefault();

    const parsedPrice = Number(price);
    if (!name.trim()) {
      setError('Invoice owner name is required.');
      return;
    }
    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      setError('Enter a valid price in KSh.');
      return;
    }
    if (!serviceDescription.trim()) {
      setError('Describe the service delivered.');
      return;
    }

    onCreateInvoice({
      name: name.trim(),
      price: parsedPrice,
      serviceDescription: serviceDescription.trim(),
    });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Create invoice" size="sm">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Name
          </label>
          <input
            value={name}
            readOnly
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-600 outline-none"
          />
        </div>

        <div>
          <label htmlFor="invoice-price" className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Price (KSh)
          </label>
          <input
            id="invoice-price"
            type="number"
            min="1"
            step="1"
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            placeholder="25000"
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-[#00A651] focus:ring-2 focus:ring-[#00A651]/20"
            autoFocus
            required
          />
        </div>

        <div>
          <label htmlFor="invoice-description" className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Service description
          </label>
          <textarea
            id="invoice-description"
            rows={4}
            value={serviceDescription}
            onChange={(event) => setServiceDescription(event.target.value)}
            placeholder="1 TikTok video + event appearance"
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-[#00A651] focus:ring-2 focus:ring-[#00A651]/20"
            required
          />
        </div>

        {error && <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="rounded-xl bg-[#00A651] px-4 py-2 text-sm font-semibold text-white shadow-sm">
            Send Invoice
          </button>
        </div>
      </form>
    </Modal>
  );
}
