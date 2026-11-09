import { useState } from 'react';
import Modal from '@/components/ui/Modal';

const DISPUTE_REASONS = [
  'Not delivered',
  'Poor quality',
  'Brand not responding',
  'Wrong service',
];

export default function DisputeModal({ open, onClose, onSubmit }) {
  const [reason, setReason] = useState(DISPUTE_REASONS[0]);
  const [details, setDetails] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit({ reason, details });
    setReason(DISPUTE_REASONS[0]);
    setDetails('');
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Raise dispute" size="sm">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="dispute-reason" className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Reason
          </label>
          <select
            id="dispute-reason"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[#00A651] focus:ring-2 focus:ring-[#00A651]/20"
          >
            {DISPUTE_REASONS.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="dispute-details" className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Details
          </label>
          <textarea
            id="dispute-details"
            rows={4}
            value={details}
            onChange={(event) => setDetails(event.target.value)}
            placeholder="Add more detail for the moderator..."
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-[#00A651] focus:ring-2 focus:ring-[#00A651]/20"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="rounded-xl bg-[#00A651] px-4 py-2 text-sm font-semibold text-white shadow-sm">
            Submit dispute
          </button>
        </div>
      </form>
    </Modal>
  );
}
