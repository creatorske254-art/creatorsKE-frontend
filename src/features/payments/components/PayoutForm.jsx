import { useState } from 'react';
import { formatCurrency } from '@/lib/utils';

/**
 * PayoutForm - amount entry + destination summary for withdrawing to a
 * creator's primary payout method. The caller owns the modal chrome; this
 * is just the form body, calling onSubmit(amount) with a plain number.
 */
export default function PayoutForm({
  availableBalance = 0,
  primaryMethod,
  onSubmit,
  isSubmitting = false,
}) {
  const [amount, setAmount] = useState(String(availableBalance || ''));

  const numericAmount = Number(amount.replace(/,/g, '')) || 0;
  const canSubmit = numericAmount > 0 && numericAmount <= availableBalance && !isSubmitting;

  return (
    <div>
      <p style={{ fontSize: 13, color: 'var(--grey-600)', lineHeight: 1.6, marginBottom: 16 }}>
        Confirm how much you'd like to move to your primary payment method.
      </p>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, border: '0.5px solid var(--grey-300)', borderRadius: 'var(--radius-md)', padding: '12px 14px', marginBottom: 16 }}>
        <span style={{ color: 'var(--grey-400)', fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700 }}>KES</span>
        <input
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          inputMode="numeric"
          style={{ border: 'none', outline: 'none', fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, width: '100%', color: 'var(--black)', background: 'transparent' }}
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '11px 0', borderBottom: '0.5px solid var(--grey-100)', fontSize: 13 }}>
          <span style={{ color: 'var(--grey-500)' }}>To</span>
          <span style={{ fontWeight: 500, color: 'var(--black)' }}>
            {primaryMethod ? `${primaryMethod.name} · ${primaryMethod.detail}` : 'No payment method on file'}
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '11px 0', fontSize: 13 }}>
          <span style={{ color: 'var(--grey-500)' }}>You'll receive</span>
          <span style={{ fontWeight: 500, color: 'var(--black)' }}>{formatCurrency(numericAmount)}</span>
        </div>
      </div>

      {numericAmount > availableBalance && (
        <p style={{ fontSize: 12, color: 'var(--status-error-text)', marginBottom: 12 }}>
          Amount exceeds your available balance of {formatCurrency(availableBalance)}.
        </p>
      )}

      <button
        className={`btn btn-purple btn-full${isSubmitting ? ' btn-loading' : ''}`}
        disabled={!canSubmit || !primaryMethod}
        onClick={() => onSubmit(numericAmount)}
      >
        Confirm withdrawal
      </button>
    </div>
  );
}
