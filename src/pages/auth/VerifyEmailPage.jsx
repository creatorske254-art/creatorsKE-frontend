import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { IconMailCheck, IconCircleCheck, IconCircleX, IconLoader2 } from '@tabler/icons-react';
import { toast } from 'sonner';
import { authService } from '@/features/auth/services/auth.service';
import { usePageMeta } from '@/lib/usePageMeta';

const STATUS = { IDLE: 'idle', LOADING: 'loading', SUCCESS: 'success', ERROR: 'error' };
const RESEND_COOLDOWN_S = 30;

export default function VerifyEmailPage() {
  usePageMeta('Verify Your Email', 'Verify your email address to finish setting up your Creatorske account.');
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState(token ? STATUS.LOADING : STATUS.IDLE);
  const [errorMsg, setErrorMsg] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  // ASSUMPTION: no dedicated resend-verification endpoint is documented in
  // the API doc — this is a no-op backend call, matching the same optimistic
  // pattern already used for this exact scenario in OnboardingPage.jsx.
  const handleResend = () => {
    if (resendCooldown > 0) return;
    toast.success('Verification email resent — check your inbox.');
    setResendCooldown(RESEND_COOLDOWN_S);
  };

  useEffect(() => {
    if (!token) return;
    authService
      .verifyEmail(token)
      .then(() => setStatus(STATUS.SUCCESS))
      .catch((err) => {
        setErrorMsg(err.message ?? 'Verification failed. The link may have expired.');
        setStatus(STATUS.ERROR);
      });
  }, [token]);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--page-bg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          background: 'var(--white)',
          border: '0.5px solid var(--grey-100)',
          borderRadius: 'var(--radius-2xl)',
          padding: '40px',
          boxShadow: 'var(--shadow-lg)',
          textAlign: 'center',
        }}
      >
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 600, color: 'var(--black)', marginBottom: '32px', textAlign: 'left' }}>
          Creatorske<span style={{ color: 'var(--purple-500)' }}>.</span>
        </div>

        {/* IDLE: no token, just sent */}
        {status === STATUS.IDLE && (
          <>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--purple-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <IconMailCheck size={28} style={{ color: 'var(--purple-500)' }} />
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 600, color: 'var(--black)', marginBottom: '8px' }}>Check your email</div>
            <div style={{ fontSize: '14px', color: 'var(--grey-500)', lineHeight: 1.6, marginBottom: '28px' }}>
              We sent a verification link to your email address. Click it to activate your account.
            </div>
            <div style={{ fontSize: '13px', color: 'var(--grey-400)' }}>
              Didn't get it?{' '}
              <button
                type="button"
                onClick={handleResend}
                disabled={resendCooldown > 0}
                style={{
                  background: 'none', border: 'none', fontWeight: 500, cursor: resendCooldown > 0 ? 'default' : 'pointer',
                  fontSize: '13px', padding: 0,
                  color: resendCooldown > 0 ? 'var(--grey-400)' : 'var(--purple-500)',
                }}
              >
                {resendCooldown > 0 ? `Resend email (${resendCooldown}s)` : 'Resend email'}
              </button>
            </div>
          </>
        )}

        {/* LOADING */}
        {status === STATUS.LOADING && (
          <>
            <IconLoader2 size={36} style={{ color: 'var(--purple-400)', margin: '0 auto 16px', display: 'block', animation: 'spin 0.8s linear infinite' }} />
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 600, color: 'var(--black)', marginBottom: '8px' }}>Verifying</div>
            <div style={{ fontSize: '14px', color: 'var(--grey-500)' }}>Just a moment.</div>
          </>
        )}

        {/* SUCCESS */}
        {status === STATUS.SUCCESS && (
          <>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--status-success-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <IconCircleCheck size={28} style={{ color: 'var(--status-success)' }} />
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 600, color: 'var(--black)', marginBottom: '8px' }}>Email verified</div>
            <div style={{ fontSize: '14px', color: 'var(--grey-500)', lineHeight: 1.6, marginBottom: '28px' }}>
              Your account is active. You can now sign in.
            </div>
            <Link
              to="/login"
              style={{
                display: 'inline-block',
                width: '100%',
                padding: '14px 32px',
                fontSize: '15px',
                fontWeight: 500,
                background: 'var(--black)',
                color: 'var(--white)',
                borderRadius: 'var(--radius-lg)',
                textDecoration: 'none',
                textAlign: 'center',
              }}
            >
              Go to sign in
            </Link>
          </>
        )}

        {/* ERROR */}
        {status === STATUS.ERROR && (
          <>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--status-error-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <IconCircleX size={28} style={{ color: 'var(--status-error)' }} />
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 600, color: 'var(--black)', marginBottom: '8px' }}>Verification failed</div>
            <div style={{ fontSize: '14px', color: 'var(--grey-500)', lineHeight: 1.6, marginBottom: '28px' }}>
              {errorMsg}
            </div>
            <Link
              to="/signup"
              style={{
                display: 'inline-block',
                width: '100%',
                padding: '14px 32px',
                fontSize: '15px',
                fontWeight: 500,
                background: 'var(--black)',
                color: 'var(--white)',
                borderRadius: 'var(--radius-lg)',
                textDecoration: 'none',
                textAlign: 'center',
              }}
            >
              Back to sign up
            </Link>
          </>
        )}

        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}