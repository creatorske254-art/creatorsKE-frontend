import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { IconMail, IconLock, IconEye, IconEyeOff, IconCircleCheck, IconLoader2 } from '@tabler/icons-react';
import { authService } from '@/features/auth/services/auth.service';
import { usePageMeta } from '@/lib/usePageMeta';

// Request reset schema
const requestSchema = z.object({
  email: z.string().email('Enter a valid email address'),
});

// Set new password schema
const resetSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain a capital letter')
      .regex(/[0-9]/, 'Must contain a number'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

// Shared styles
const inputStyle = (hasError) => ({
  width: '100%',
  padding: 'var(--space-12) var(--space-16)',
  fontFamily: 'var(--font-body)',
  fontSize: '14px',
  color: 'var(--black)',
  background: 'var(--white)',
  border: hasError ? '0.5px solid var(--status-error)' : '0.5px solid var(--grey-300)',
  borderRadius: 'var(--radius-md)',
  outline: 'none',
});

// Request reset form
function RequestResetForm() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(requestSchema),
  });

  const onSubmit = async ({ email }) => {
    setLoading(true);
    try {
      await authService.requestPasswordReset(email);
      setSent(true);
    } catch (err) {
      toast.error(err.message ?? 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--purple-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--space-20)' }}>
          <IconCircleCheck className="icon-xl" style={{ color: 'var(--purple-500)' }} />
        </div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 600, color: 'var(--black)', marginBottom: 'var(--space-8)' }}>Check your email</div>
        <div className="page-subtitle" style={{ marginBottom: 'var(--space-32)' }}>
          If an account exists for that email, we've sent a reset link. It expires in 1 hour.
        </div>
        <Link to="/login" style={{ fontSize: '13px', color: 'var(--purple-500)', fontWeight: 500, textDecoration: 'none' }}>
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: 600, color: 'var(--black)', marginBottom: 'var(--space-8)', letterSpacing: '-0.02em' }}>
        Reset password
      </div>
      <div style={{ fontSize: '14px', color: 'var(--grey-500)', marginBottom: 'var(--space-32)', lineHeight: 1.55 }}>
        Enter your email and we'll send you a reset link.
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-16)', marginBottom: 'var(--space-20)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
            <label className="field-label">Email address</label>
            <div style={{ position: 'relative' }}>
              <IconMail className="icon-md" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--grey-400)', pointerEvents: 'none' }} />
              <input
                type="email"
                placeholder="you@email.com"
                {...register('email')}
                style={{ ...inputStyle(errors.email), paddingLeft: 'var(--space-40)' }}
              />
            </div>
            {errors.email && <span className="field-hint error">{errors.email.message}</span>}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: 'var(--space-16) var(--space-32)',
            fontSize: '15px',
            fontFamily: 'var(--font-body)',
            fontWeight: 500,
            background: loading ? 'var(--grey-300)' : 'var(--black)',
            color: 'var(--white)',
            border: 'none',
            borderRadius: 'var(--radius-lg)',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.15s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'var(--space-8)',
          }}
        >
          {loading && <IconLoader2 className="icon-md" style={{ animation: 'spin 0.8s linear infinite' }} />}
          {loading ? 'Sending' : 'Send reset link'}
        </button>
      </form>

      <div style={{ fontSize: '13px', color: 'var(--grey-500)', textAlign: 'center', marginTop: 'var(--space-20)' }}>
        <Link to="/login" style={{ color: 'var(--purple-500)', fontWeight: 500, textDecoration: 'none' }}>
          Back to sign in
        </Link>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}

// Set new password form
function SetNewPasswordForm({ token }) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(resetSchema),
  });

  const onSubmit = async ({ password }) => {
    setLoading(true);
    try {
      await authService.resetPassword(token, password);
      setDone(true);
    } catch (err) {
      toast.error(err.message ?? 'Reset failed. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--status-success-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--space-20)' }}>
          <IconCircleCheck className="icon-xl" style={{ color: 'var(--status-success)' }} />
        </div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 600, color: 'var(--black)', marginBottom: 'var(--space-8)' }}>Password updated</div>
        <div className="page-subtitle" style={{ marginBottom: 'var(--space-32)' }}>
          Your password has been changed. You can now sign in.
        </div>
        <Link
          to="/login"
          style={{
            display: 'inline-block',
            width: '100%',
            padding: 'var(--space-16) var(--space-32)',
            fontSize: '15px',
            fontWeight: 500,
            background: 'var(--black)',
            color: 'var(--white)',
            borderRadius: 'var(--radius-lg)',
            textDecoration: 'none',
            textAlign: 'center',
          }}
        >
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: 600, color: 'var(--black)', marginBottom: 'var(--space-8)', letterSpacing: '-0.02em' }}>
        New password
      </div>
      <div style={{ fontSize: '14px', color: 'var(--grey-500)', marginBottom: 'var(--space-32)', lineHeight: 1.55 }}>
        Choose a strong password for your account.
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-16)', marginBottom: 'var(--space-20)' }}>
          {/* New password */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
            <label className="field-label">New password</label>
            <div style={{ position: 'relative' }}>
              <IconLock className="icon-md" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--grey-400)', pointerEvents: 'none' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="At least 8 characters"
                {...register('password')}
                style={{ ...inputStyle(errors.password), paddingLeft: 'var(--space-40)', paddingRight: 'var(--space-40)' }}
              />
              <button type="button" onClick={() => setShowPassword((p) => !p)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--grey-400)', display: 'flex', alignItems: 'center' }}>
                {showPassword ? <IconEyeOff className="icon-sm" /> : <IconEye className="icon-sm" />}
              </button>
            </div>
            {errors.password
              ? <span className="field-hint error">{errors.password.message}</span>
              : <span style={{ fontSize: '12px', color: 'var(--grey-400)' }}>Must contain a number and a capital letter</span>
            }
          </div>

          {/* Confirm */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
            <label className="field-label">Confirm password</label>
            <div style={{ position: 'relative' }}>
              <IconLock className="icon-md" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--grey-400)', pointerEvents: 'none' }} />
              <input
                type={showConfirm ? 'text' : 'password'}
                placeholder="Re-enter your password"
                {...register('confirmPassword')}
                style={{ ...inputStyle(errors.confirmPassword), paddingLeft: 'var(--space-40)', paddingRight: 'var(--space-40)' }}
              />
              <button type="button" onClick={() => setShowConfirm((p) => !p)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--grey-400)', display: 'flex', alignItems: 'center' }}>
                {showConfirm ? <IconEyeOff className="icon-sm" /> : <IconEye className="icon-sm" />}
              </button>
            </div>
            {errors.confirmPassword && <span className="field-hint error">{errors.confirmPassword.message}</span>}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: 'var(--space-16) var(--space-32)',
            fontSize: '15px',
            fontFamily: 'var(--font-body)',
            fontWeight: 500,
            background: loading ? 'var(--grey-300)' : 'var(--black)',
            color: 'var(--white)',
            border: 'none',
            borderRadius: 'var(--radius-lg)',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.15s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'var(--space-8)',
          }}
        >
          {loading && <IconLoader2 className="icon-md" style={{ animation: 'spin 0.8s linear infinite' }} />}
          {loading ? 'Updating' : 'Update password'}
        </button>
      </form>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}

// Page shell
export default function ResetPasswordPage() {
  usePageMeta('Reset Password', 'Reset your Creatorske account password.');
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--page-bg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-48) var(--gutter-public)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          background: 'var(--white)',
          border: '0.5px solid var(--grey-100)',
          borderRadius: 'var(--radius-2xl)',
          padding: 'var(--space-40)',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 600, color: 'var(--black)', marginBottom: 'var(--space-32)' }}>
          Creatorske<span style={{ color: 'var(--purple-500)' }}>.</span>
        </div>

        {token ? <SetNewPasswordForm token={token} /> : <RequestResetForm />}
      </div>
    </div>
  );
}