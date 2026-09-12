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

const GoogleSVG = () => (
  <svg width="16" height="16" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

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

          {/* Google */}
          <button
            type="button"
            onClick={() => toast.info('Google sign-in coming soon')}
            style={{ width: '100%', padding: '11px 14px', border: '0.5px solid var(--grey-200)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 500, color: 'var(--grey-700)', background: 'var(--white)', cursor: 'pointer', transition: 'all .15s' }}
          >
            <GoogleSVG /> Continue with Google
          </button>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '18px 0' }}>
            <div style={{ flex: 1, height: '0.5px', background: 'var(--grey-200)' }} />
            <span style={{ fontSize: '12px', color: 'var(--grey-400)' }}>or</span>
            <div style={{ flex: 1, height: '0.5px', background: 'var(--grey-200)' }} />
          </div>

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