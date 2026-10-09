import { useState } from 'react';
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { IconEye, IconEyeOff, IconLoader2, IconMail, IconLock } from '@tabler/icons-react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { authService } from '@/features/auth/services/auth.service';
import { ROLE_HOME, POST_AUTH_REDIRECT_KEY } from '@/features/auth/constants/roles';
import { usePageMeta } from '@/lib/usePageMeta';

const schema = z.object({
  email:    z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});


const inputStyle = (hasError) => ({
  width: '100%',
  fontFamily: 'var(--font-body)',
  fontSize: '14px',
  color: 'var(--black)',
  background: 'var(--white)',
  border: hasError ? '0.5px solid var(--status-error)' : '0.5px solid var(--grey-300)',
  borderRadius: 'var(--radius-md)',
  padding: 'var(--space-12) var(--space-16)',
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
  // Set when the account has two-factor on: the password was right, a 6-digit code is next.
  const [challenge, setChallenge] = useState(null);
  const [code, setCode] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const finishLogin = ({ token, user }) => {
    login(token, user);
    toast.success('Welcome back!');

    // ?redirect= covers the common case; sessionStorage is the durable
    // fallback for flows that hop through signup/verify-email first.
    const redirectTo = searchParams.get('redirect') || sessionStorage.getItem(POST_AUTH_REDIRECT_KEY);
    sessionStorage.removeItem(POST_AUTH_REDIRECT_KEY);

    // A creator who hasn't chosen a plan yet picks one before their dashboard.
    if (!redirectTo && user.role === 'creator' && !user.plan) {
      navigate('/onboarding/plan');
      return;
    }
    navigate(redirectTo || ROLE_HOME[user.role] || '/');
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await authService.login(data);
      if (res.data.twoFactorRequired) {
        setChallenge(res.data.challengeToken);
        setCode('');
        return;
      }
      finishLogin(res.data);
    } catch (err) {
      toast.error(err.message ?? 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onSubmitCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authService.loginTwoFactor(challenge, code.replace(/\s+/g, ''));
      finishLogin(res.data);
    } catch (err) {
      // An expired challenge (5 minutes) sends the user back to email and password.
      if (err.status === 401) { setChallenge(null); setCode(''); }
      toast.error(err.message ?? 'That code did not work. Try again.');
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
        padding: '0 var(--gutter-public)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        flexShrink: 0,
      }}>
        <Link to="/" style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 600, color: 'var(--black)', textDecoration: 'none' }}>
          Creatorske<span style={{ color: 'var(--purple-500)' }}>.</span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-12)' }}>
          <span className="auth-navbar-hint" style={{ fontSize: '13px', color: 'var(--grey-500)' }}>New to Creatorske?</span>
          <Link
            to={{ pathname: '/signup', search: location.search }}
            style={{ padding: 'var(--space-8) var(--space-16)', fontSize: '13px', fontWeight: 500, background: 'var(--purple-600)', color: 'var(--white)', borderRadius: 'var(--radius-md)', textDecoration: 'none', transition: 'all .15s' }}
          >
            Get started free
          </Link>
        </div>
      </nav>

      {/* Card */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-48) var(--gutter-public)' }}>
        <div style={{
          width: '100%',
          maxWidth: '440px',
          background: 'var(--white)',
          border: '0.5px solid var(--grey-200)',
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--space-40) var(--space-40) var(--space-40)',
          boxShadow: '0 8px 40px rgba(84,69,232,.07), 0 2px 8px rgba(0,0,0,.04)',
        }}>
          <h1 className="hero-title" style={{ marginBottom: 'var(--space-8)' }}>
            {challenge ? 'Two-factor check' : 'Welcome back'}
          </h1>
          <p className="page-subtitle" style={{ marginBottom: 'var(--space-24)' }}>
            {challenge ? 'Enter the 6-digit code from your authenticator app.' : 'Sign in to your account.'}
          </p>

          {challenge && (
            <form onSubmit={onSubmitCode} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-16)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
                <label className="field-label" htmlFor="login-2fa-code">Authentication code</label>
                <input
                  id="login-2fa-code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  autoFocus
                  maxLength={7}
                  placeholder="123456"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/[^\d\s]/g, ''))}
                  style={{ ...inputStyle(false), letterSpacing: '0.3em', textAlign: 'center', fontSize: '18px' }}
                />
              </div>
              <button
                type="submit"
                disabled={loading || code.replace(/\s+/g, '').length !== 6}
                style={{ width: '100%', padding: 'var(--space-16) var(--space-32)', fontSize: '15px', fontFamily: 'var(--font-body)', fontWeight: 500, background: loading || code.replace(/\s+/g, '').length !== 6 ? 'var(--grey-300)' : 'var(--black)', color: 'var(--white)', border: 'none', borderRadius: 'var(--radius-md)', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-8)' }}
              >
                {loading && <IconLoader2 className="icon-md" style={{ animation: 'spin 0.8s linear infinite' }} />}
                {loading ? 'Checking' : 'Verify and sign in'}
              </button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setChallenge(null); setCode(''); }}>
                Use a different account
              </button>
            </form>
          )}

          {/* Google sign-in intentionally absent until the backend has an OAuth
              endpoint - a button that can only say "coming soon" is a mockup. */}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} style={challenge ? { display: 'none' } : undefined}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-16)', marginBottom: 'var(--space-20)' }}>

              {/* Email */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
                <label className="field-label">Email <span style={{ color: 'var(--status-error)' }}>*</span></label>
                <div className="input-wrapper">
                  <IconMail className="icon-sm input-icon left" aria-hidden="true" />
                  <input
                    type="email"
                    placeholder="you@email.com"
                    {...register('email')}
                    style={{ ...inputStyle(errors.email), paddingLeft: 'var(--space-40)' }}
                  />
                </div>
                {errors.email && <span className="field-hint error">{errors.email.message}</span>}
              </div>

              {/* Password */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
                <label className="field-label">Password <span style={{ color: 'var(--status-error)' }}>*</span></label>
                <div className="input-wrapper">
                  <IconLock className="icon-sm input-icon left" aria-hidden="true" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    {...register('password')}
                    style={{ ...inputStyle(errors.password), paddingLeft: 'var(--space-40)', paddingRight: 'var(--space-40)' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--grey-400)', display: 'flex', alignItems: 'center' }}
                  >
                    {showPassword ? <IconEyeOff className="icon-sm" /> : <IconEye className="icon-sm" />}
                  </button>
                </div>
                {errors.password && <span className="field-hint error">{errors.password.message}</span>}
                <Link to="/reset-password" style={{ fontSize: '12px', color: 'var(--purple-600)', fontWeight: 500, textAlign: 'right', textDecoration: 'none', marginTop: 'calc(-1 * var(--space-4))' }}>
                  Forgot password?
                </Link>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{ width: '100%', padding: 'var(--space-16) var(--space-32)', fontSize: '15px', fontFamily: 'var(--font-body)', fontWeight: 500, background: loading ? 'var(--grey-300)' : 'var(--black)', color: 'var(--white)', border: 'none', borderRadius: 'var(--radius-md)', cursor: loading ? 'not-allowed' : 'pointer', transition: 'all .15s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-8)' }}
            >
              {loading && <IconLoader2 className="icon-md" style={{ animation: 'spin 0.8s linear infinite' }} />}
              {loading ? 'Signing in' : 'Log in'}
            </button>
          </form>

          <div style={{ fontSize: '13px', color: 'var(--grey-500)', textAlign: 'center', marginTop: 'var(--space-20)' }}>
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