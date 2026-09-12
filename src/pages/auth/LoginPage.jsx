import { useState } from 'react';
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { IconEye, IconEyeOff, IconLoader2 } from '@tabler/icons-react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { authService } from '@/features/auth/services/auth.service';
import { ROLE_HOME, POST_AUTH_REDIRECT_KEY } from '@/features/auth/constants/roles';
import { usePageMeta } from '@/lib/usePageMeta';

const schema = z.object({
  email:    z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

const labelStyle = {
  fontSize: '11px',
  fontWeight: 600,
  letterSpacing: '0.07em',
  textTransform: 'uppercase',
  color: 'var(--grey-600)',
};

const inputStyle = (hasError) => ({
  width: '100%',
  fontFamily: 'var(--font-body)',
  fontSize: '14px',
  color: 'var(--black)',
  background: 'var(--white)',
  border: hasError ? '0.5px solid var(--status-error)' : '0.5px solid var(--grey-300)',
  borderRadius: 'var(--radius-md)',
  padding: '10px 14px',
  outline: 'none',
  transition: 'border-color .15s, box-shadow .15s',
});

export default function LoginPage() {
  usePageMeta('Log In', 'Log in to your Creatorske account.');
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await authService.login(data);
      login(res.data.token, res.data.user);
      toast.success('Welcome back!');

      // ?redirect= covers the common case; sessionStorage is the durable
      // fallback for flows that hop through signup/verify-email first.
      const redirectTo = searchParams.get('redirect') || sessionStorage.getItem(POST_AUTH_REDIRECT_KEY);
      sessionStorage.removeItem(POST_AUTH_REDIRECT_KEY);

      // Best-effort heuristic pending backend confirmation of the `user.plan` field:
      // a creator who hasn't chosen a plan yet gets sent to pick one before their dashboard.
      if (!redirectTo && res.data.user.role === 'creator' && !res.data.user.plan) {
        navigate('/onboarding/plan');
        return;
      }
      navigate(redirectTo || ROLE_HOME[res.data.user.role] || '/');
    } catch (err) {
      toast.error(err.message ?? 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--page-bg)', display: 'flex', flexDirection: 'column' }}>

      {/* Navbar */}
      <nav style={{
        background: 'color-mix(in srgb, var(--white) 92%, transparent)',
        backdropFilter: 'blur(14px)',
        borderBottom: '0.5px solid var(--grey-100)',
        height: '60px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 40px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        flexShrink: 0,
      }}>
        <Link to="/" style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 600, color: 'var(--black)', textDecoration: 'none' }}>
          Creatorske<span style={{ color: 'var(--purple-500)' }}>.</span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span className="auth-navbar-hint" style={{ fontSize: '13px', color: 'var(--grey-500)' }}>New to Creatorske?</span>
          <Link
            to={{ pathname: '/signup', search: location.search }}
            style={{ padding: '7px 16px', fontSize: '13px', fontWeight: 500, background: 'var(--purple-600)', color: 'var(--white)', borderRadius: 'var(--radius-md)', textDecoration: 'none', transition: 'all .15s' }}
          >
            Get started free
          </Link>
        </div>
      </nav>

      {/* Card */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 24px' }}>
        <div style={{
          width: '100%',
          maxWidth: '440px',
          background: 'var(--white)',
          border: '0.5px solid var(--grey-200)',
          borderRadius: 'var(--radius-xl)',
          padding: '40px 36px 36px',
          boxShadow: '0 8px 40px rgba(84,69,232,.07), 0 2px 8px rgba(0,0,0,.04)',
        }}>
          {/* Logo */}
          <Link to="/" style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 600, color: 'var(--black)', textDecoration: 'none', display: 'inline-block', marginBottom: '28px' }}>
            Creatorske<span style={{ color: 'var(--purple-500)' }}>.</span>
          </Link>

          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--black)', marginBottom: '6px' }}>
            Welcome back
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--grey-500)', lineHeight: 1.6, marginBottom: '24px' }}>
            Sign in to your account.
          </p>

          {/* Google sign-in intentionally absent until the backend has an OAuth
              endpoint — a button that can only say "coming soon" is a mockup. */}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px' }}>

              {/* Email */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={labelStyle}>Email <span style={{ color: 'var(--status-error)' }}>*</span></label>
                <input
                  type="email"
                  placeholder="you@email.com"
                  {...register('email')}
                  style={inputStyle(errors.email)}
                />
                {errors.email && <span style={{ fontSize: '12px', color: 'var(--status-error-text)' }}>{errors.email.message}</span>}
              </div>

              {/* Password */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={labelStyle}>Password <span style={{ color: 'var(--status-error)' }}>*</span></label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Your password"
                    {...register('password')}
                    style={{ ...inputStyle(errors.password), paddingRight: '42px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--grey-400)', display: 'flex', alignItems: 'center' }}
                  >
                    {showPassword ? <IconEyeOff size={15} /> : <IconEye size={15} />}
                  </button>
                </div>
                {errors.password && <span style={{ fontSize: '12px', color: 'var(--status-error-text)' }}>{errors.password.message}</span>}
                <Link to="/reset-password" style={{ fontSize: '12px', color: 'var(--purple-600)', fontWeight: 500, textAlign: 'right', textDecoration: 'none', marginTop: '-4px' }}>
                  Forgot password?
                </Link>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{ width: '100%', padding: '14px 32px', fontSize: '15px', fontFamily: 'var(--font-body)', fontWeight: 500, background: loading ? 'var(--grey-300)' : 'var(--black)', color: 'var(--white)', border: 'none', borderRadius: 'var(--radius-md)', cursor: loading ? 'not-allowed' : 'pointer', transition: 'all .15s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              {loading && <IconLoader2 size={16} style={{ animation: 'spin 0.8s linear infinite' }} />}
              {loading ? 'Signing in' : 'Log in'}
            </button>
          </form>

          <div style={{ fontSize: '13px', color: 'var(--grey-500)', textAlign: 'center', marginTop: '20px' }}>
            New to Creatorske?{' '}
            <Link to={{ pathname: '/signup', search: location.search }} style={{ color: 'var(--purple-600)', fontWeight: 500, textDecoration: 'none' }}>
              Create a free account
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 480px) { .auth-navbar-hint { display: none; } }
      `}</style>
    </div>
  );
}