import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import { DISPUTE_REASONS } from '@/features/invoices/constants/invoice';
import { IconAlertTriangle } from '@tabler/icons-react';

export default function DisputeModal({ open, onClose, onDispute, submitting, disabled }) {
  const [reason, setReason] = useState(DISPUTE_REASONS[0].value);
  const [details, setDetails] = useState('');

  const canSubmit = Boolean(details.trim()) && !submitting && !disabled;

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!canSubmit) return;
    await onDispute({ reason, details: details.trim() });
  };

  return (
    <Modal open={open} onClose={onClose} title="Raise a dispute" size="sm">
      <form
        onSubmit={handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-16)' }}
      >
        <p style={{ margin: 0, fontSize: 'var(--text-body-sm-size)', color: 'var(--grey-600)', lineHeight: 1.6 }}>
          Tell Creatorske what went wrong. An admin reviews the evidence from both sides and the
          ruling is final - the money stays in escrow until then.
        </p>

        <div>
          <label className="field-label" htmlFor="dispute-reason">
            Reason <span className="field-required">*</span>
          </label>
          <select
            id="dispute-reason"
            className="input input-md"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            style={{ marginTop: 'var(--space-8)' }}
          >
            {DISPUTE_REASONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="field-label" htmlFor="dispute-details">
            Details <span className="field-required">*</span>
          </label>
          <textarea
            id="dispute-details"
            className="input input-md"
            rows={4}
            value={details}
            onChange={(event) => setDetails(event.target.value)}
            placeholder="What did you expect, and what was delivered? Add links or timestamps."
            style={{ marginTop: 'var(--space-8)', resize: 'vertical' }}
          />
        </div>

        <button type="submit" className="btn btn-purple btn-lg btn-full" disabled={!canSubmit}>
          {submitting ? 'Submitting…' : (
            <>
              <IconAlertTriangle className="icon-sm" aria-hidden="true" />
              Submit dispute
            </>
          )}
        </button>
      </form>
    </Modal>
  );
}
