import { useState } from 'react';
import { useCreateEnquiry } from '../hooks/useEnquiries';
import { formatCurrency } from '@/lib/utils';

const LABEL_STYLE = {
  display: 'block',
  fontSize: '11px',
  fontWeight: 600,
  letterSpacing: '0.07em',
  textTransform: 'uppercase',
  color: 'var(--grey-600)',
  marginBottom: 'var(--space-8)',
};

// ASSUMPTION: POST /enquiries payload isn't documented - assumed
// { creatorId, packageId, message }.
export default function EnquiryForm({ creatorId, packages = [], initialPackageId, onSuccess, onCancel }) {
  const { mutate: create, isPending: isCreating } = useCreateEnquiry();
  const [packageId, setPackageId] = useState(initialPackageId ?? packages[0]?.id ?? '');
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    create(
      { creatorId, packageId, message: message.trim() },
      { onSuccess: () => onSuccess?.() }
    );
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-16)' }}>
      {packages.length > 0 && (
        <div>
          <label style={LABEL_STYLE}>Package</label>
          <select
            className="input input-md"
            value={packageId}
            onChange={(e) => setPackageId(e.target.value)}
          >
            {packages.map((pkg) => (
              <option key={pkg.id} value={pkg.id}>
                {pkg.name}
                {pkg.price ? ` · ${formatCurrency(pkg.price)}` : ''}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label style={LABEL_STYLE}>Your message</label>
        <textarea
          className="input input-md"
          rows={4}
          placeholder="Tell them about your brand, campaign, and what you're looking for…"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          style={{ resize: 'vertical', width: '100%' }}
          required
        />
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-8)', justifyContent: 'flex-end' }}>
        {onCancel && (
          <button type="button" className="btn btn-ghost" onClick={onCancel}>
            Cancel
          </button>
        )}
        <button type="submit" className={`btn btn-purple${isCreating ? ' btn-loading' : ''}`} disabled={isCreating || !message.trim()}>
          Send enquiry
        </button>
      </div>
    </form>
  );
}
