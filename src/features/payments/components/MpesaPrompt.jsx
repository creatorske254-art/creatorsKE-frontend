import { IconDeviceMobile, IconCheck, IconX } from '@tabler/icons-react';

/**
 * MpesaPrompt - the "check your phone, enter your M-Pesa PIN" waiting screen
 * for a C2B STK-push collection (money coming IN from a payer), polling for
 * confirmation via usePayments().isPolling. NOT used for withdrawals: a payout
 * is a B2C send to the creator, who never enters a PIN.
 */
export default function MpesaPrompt({ phone, status, isPolling }) {
  const statusValue = (status?.status ?? status?.resultCode ?? '').toString().toLowerCase();
  const isSuccess = ['completed', 'success', 'successful'].includes(statusValue);
  const isFailed = ['failed', 'cancelled', 'canceled'].includes(statusValue);

  if (isSuccess) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-12)', padding: 'var(--space-24) 0', textAlign: 'center' }}>
        <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--status-success-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--status-success-text)' }}>
          <IconCheck className="icon-xl" />
        </div>
        <div style={{ fontWeight: 600, fontSize: 14 }}>Payment confirmed</div>
      </div>
    );
  }

  if (isFailed) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-12)', padding: 'var(--space-24) 0', textAlign: 'center' }}>
        <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--status-error-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--status-error-text)' }}>
          <IconX className="icon-xl" />
        </div>
        <div style={{ fontWeight: 600, fontSize: 14 }}>Payment wasn't completed</div>
        <div style={{ fontSize: 12.5, color: 'var(--grey-500)' }}>You can try again from the withdraw button.</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-12)', padding: 'var(--space-24) 0', textAlign: 'center' }}>
      <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--status-success-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--status-success-text)' }}>
        <IconDeviceMobile className="icon-lg" />
      </div>
      <div style={{ fontWeight: 600, fontSize: 14 }}>Check your phone</div>
      <div style={{ fontSize: 12.5, color: 'var(--grey-500)', lineHeight: 1.6 }}>
        {isPolling ? `We've sent a payment request to ${phone ?? 'your phone'}. Enter your M-Pesa PIN to confirm.` : 'Waiting for confirmation…'}
      </div>
    </div>
  );
}
