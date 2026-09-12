import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import {
  IconCamera,
  IconBuildingStore,
  IconArrowRight,
  IconArrowLeft,
  IconEye,
  IconEyeOff,
  IconLoader2,
  IconUser,
  IconMail,
  IconLock,
} from '@tabler/icons-react';
import { authService } from '@/features/auth/services/auth.service';
import { ROLES } from '@/features/auth/constants/roles';
import { usePageMeta } from '@/lib/usePageMeta';

// Schemas
const creatorSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName:  z.string().min(1, 'Last name is required'),
  email:     z.string().email('Enter a valid email address'),
  password:  z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain a capital letter')
    .regex(/[0-9]/, 'Must contain a number'),
});

const brandSchema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  firstName:   z.string().min(1, 'First name is required'),
  lastName:    z.string().min(1, 'Last name is required'),
  email:       z.string().email('Enter a valid email address'),
  password:    z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain a capital letter')
    .regex(/[0-9]/, 'Must contain a number'),
});

// Password strength
function getPwStrength(pw) {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 8)          score++;
  if (/[A-Z]/.test(pw))        score++;
  if (/[0-9]/.test(pw))        score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score;
}

const PW_COLORS = ['', 'var(--grey-400)', '#888', 'var(--purple-500)', 'var(--status-success)'];
const PW_LABELS = ['', 'Weak', 'Fair', 'Good', 'Strong'];

function PasswordStrengthBars({ score }) {
  return (
    <div>
      <div style={{ display: 'flex', gap: '4px', marginTop: '6px' }}>
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            style={{
              height: '3px',
              flex: 1,
              borderRadius: '2px',
              background: i <= score ? PW_COLORS[score] : 'var(--grey-200)',
              transition: 'background .3s',
            }}
          />
        ))}
      </div>
      {score > 0 && (
        <div style={{ fontSize: '11px', marginTop: '4px', color: PW_COLORS[score] }}>
          {PW_LABELS[score]}
        </div>
      )}
    </div>
  );
}

// Shared styles

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

// Navbar
function Navbar({ step, onBack }) {
  return (
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
        <Link
          to="/login"
          style={{ padding: '7px 16px', fontSize: '13px', fontWeight: 500, color: 'var(--grey-600)', border: '0.5px solid var(--grey-200)', borderRadius: 'var(--radius-md)', textDecoration: 'none', transition: 'all .15s' }}
        >
          Log in
        </Link>
      </div>
    </nav>
  );
}

// Google sign-up intentionally absent until the backend has an OAuth endpoint -
// a button that can only say "coming soon" is a mockup.

// Step 1: Choose type
function StepChooseType({ onContinue }) {
  const [role, setRole] = useState(null);

  const types = [
    { value: ROLES.CREATOR, label: "I'm a Creator", desc: 'Build your rate card and get discovered by brands.', Icon: IconCamera },
    { value: ROLES.BRAND,   label: "I'm a Brand",   desc: 'Find and book creators for your campaigns.',        Icon: IconBuildingStore },
  ];

  return (
    <>
      <h1 className="hero-title" style={{ marginBottom: '6px' }}>
        Join Creatorske
      </h1>
      <p className="page-subtitle" style={{ marginBottom: '24px' }}>
        Are you a creator or a brand? We'll tailor your setup.
      </p>

      <div className="signup-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '24px' }}>
        {types.map(({ value, label, desc, Icon }) => {
          const active = role === value;
          return (
            <button
              key={value}
              type="button"
              onClick={() => setRole(value)}
              style={{
                padding: '18px 16px',
                borderRadius: 'var(--radius-lg)',
                border: active ? '1.5px solid var(--purple-500)' : '1.5px solid var(--grey-200)',
                background: active ? 'var(--purple-50)' : 'var(--white)',
                boxShadow: active ? '0 0 0 3px rgba(84,69,232,.1)' : 'none',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all .15s',
              }}
            >
              <Icon size={22} style={{ color: active ? 'var(--purple-600)' : 'var(--grey-500)', marginBottom: '10px' }} />
              <div style={{ fontSize: '14px', fontWeight: 600, color: active ? 'var(--purple-700)' : 'var(--black)', marginBottom: '3px' }}>
                {label}
              </div>
              <div style={{ fontSize: '12px', color: active ? 'var(--purple-600)' : 'var(--grey-500)', lineHeight: 1.5 }}>
                {desc}
              </div>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        disabled={!role}
        onClick={() => onContinue(role)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '7px',
          padding: '14px 32px',
          fontSize: '15px',
          fontFamily: 'var(--font-body)',
          fontWeight: 500,
          background: role ? 'var(--black)' : 'var(--grey-200)',
          color: role ? 'var(--white)' : 'var(--grey-400)',
          border: 'none',
          borderRadius: 'var(--radius-md)',
          cursor: role ? 'pointer' : 'not-allowed',
          transition: 'all .15s',
        }}
      >
        Continue <IconArrowRight size={14} />
      </button>

      <div style={{ fontSize: '13px', color: 'var(--grey-500)', textAlign: 'center', marginTop: '20px' }}>
        Already have an account?{' '}
        <Link to="/login" style={{ color: 'var(--purple-600)', fontWeight: 500, textDecoration: 'none' }}>
          Log in
        </Link>
      </div>
    </>
  );
}

// Step 2: Creator form
function CreatorSignUpForm({ onBack, loading, setLoading }) {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [pwValue, setPwValue] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(creatorSchema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await authService.signup({ ...data, role: ROLES.CREATOR });
      toast.success('Account created! Check your email to verify.');
      sessionStorage.setItem('creatorske_pending_email', data.email);
      navigate('/verify-email');
    } catch (err) {
      toast.error(err.message ?? 'Sign up failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--purple-600)', marginBottom: '8px' }}>
        Creator account
      </div>
      <h1 className="hero-title" style={{ marginBottom: '6px' }}>
        Create your account
      </h1>
      <p className="page-subtitle" style={{ marginBottom: '24px' }}>
        Build your rate card and start getting booked.
      </p>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px' }}>
          <div className="signup-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label className="field-label">First name <span style={{ color: 'var(--status-error)' }}>*</span></label>
              <div className="input-wrapper"><IconUser className="input-icon left" aria-hidden="true" /><input type="text" placeholder="e.g. Amara" {...register('firstName')} style={{ ...inputStyle(errors.firstName), paddingLeft: '38px' }} /></div>
              {errors.firstName && <span className="field-hint error">{errors.firstName.message}</span>}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label className="field-label">Last name <span style={{ color: 'var(--status-error)' }}>*</span></label>
              <div className="input-wrapper"><IconUser className="input-icon left" aria-hidden="true" /><input type="text" placeholder="e.g. Osei" {...register('lastName')} style={{ ...inputStyle(errors.lastName), paddingLeft: '38px' }} /></div>
              {errors.lastName && <span className="field-hint error">{errors.lastName.message}</span>}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label className="field-label">Email <span style={{ color: 'var(--status-error)' }}>*</span></label>
            <div className="input-wrapper"><IconMail className="input-icon left" aria-hidden="true" /><input type="email" placeholder="you@email.com" {...register('email')} style={{ ...inputStyle(errors.email), paddingLeft: '38px' }} /></div>
            {errors.email && <span className="field-hint error">{errors.email.message}</span>}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label className="field-label">Password <span style={{ color: 'var(--status-error)' }}>*</span></label>
            <div className="input-wrapper"><IconLock className="input-icon left" aria-hidden="true" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="At least 8 characters"
                {...register('password', { onChange: (e) => setPwValue(e.target.value) })}
                style={{ ...inputStyle(errors.password), paddingLeft: '38px', paddingRight: '42px' }}
              />
              <button type="button" onClick={() => setShowPassword((p) => !p)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--grey-400)', display: 'flex', alignItems: 'center' }}>
                {showPassword ? <IconEyeOff size={15} /> : <IconEye size={15} />}
              </button>
            </div>
            <PasswordStrengthBars score={getPwStrength(pwValue)} />
            {errors.password && <span className="field-hint error">{errors.password.message}</span>}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{ width: '100%', padding: '14px 32px', fontSize: '15px', fontFamily: 'var(--font-body)', fontWeight: 500, background: loading ? 'var(--purple-300)' : 'var(--purple-600)', color: 'var(--white)', border: 'none', borderRadius: 'var(--radius-md)', cursor: loading ? 'not-allowed' : 'pointer', transition: 'all .15s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
        >
          {loading && <IconLoader2 size={16} style={{ animation: 'spin 0.8s linear infinite' }} />}
          {loading ? 'Creating account' : 'Create my account'}
        </button>
      </form>

      <div style={{ fontSize: '11px', color: 'var(--grey-400)', textAlign: 'center', marginTop: '12px', lineHeight: 1.6 }}>
        By signing up you agree to our{' '}
        <Link to="/terms" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--grey-600)', textDecoration: 'underline' }}>Terms of Service</Link>
        {' '}and{' '}
        <Link to="/privacy" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--grey-600)', textDecoration: 'underline' }}>Privacy Policy</Link>.
      </div>

      <div style={{ fontSize: '13px', color: 'var(--grey-500)', textAlign: 'center', marginTop: '16px' }}>
        Already have an account?{' '}
        <Link to="/login" style={{ color: 'var(--purple-600)', fontWeight: 500, textDecoration: 'none' }}>Log in</Link>
      </div>

      <div style={{ textAlign: 'center', marginTop: '12px' }}>
        <button type="button" onClick={onBack} style={{ fontSize: '12px', color: 'var(--grey-400)', background: 'none', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <IconArrowLeft size={12} /> Change account type
        </button>
      </div>
    </>
  );
}

// Step 2: Brand form
function BrandSignUpForm({ onBack, loading, setLoading }) {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [pwValue, setPwValue] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(brandSchema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await authService.signup({ ...data, role: ROLES.BRAND });
      toast.success('Account created! Check your email to verify.');
      sessionStorage.setItem('creatorske_pending_email', data.email);
      navigate('/verify-email');
    } catch (err) {
      toast.error(err.message ?? 'Sign up failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--purple-600)', marginBottom: '8px' }}>
        Brand account
      </div>
      <h1 className="hero-title" style={{ marginBottom: '6px' }}>
        Create your account
      </h1>
      <p className="page-subtitle" style={{ marginBottom: '24px' }}>
        Find and book creators for your next campaign.
      </p>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label className="field-label">Company name <span style={{ color: 'var(--status-error)' }}>*</span></label>
            <div className="input-wrapper"><IconBuildingStore className="input-icon left" aria-hidden="true" /><input type="text" placeholder="e.g. Acme Kenya Ltd" {...register('companyName')} style={{ ...inputStyle(errors.companyName), paddingLeft: '38px' }} /></div>
            {errors.companyName && <span className="field-hint error">{errors.companyName.message}</span>}
          </div>

          <div className="signup-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label className="field-label">Contact first name <span style={{ color: 'var(--status-error)' }}>*</span></label>
              <div className="input-wrapper"><IconUser className="input-icon left" aria-hidden="true" /><input type="text" placeholder="e.g. Jane" {...register('firstName')} style={{ ...inputStyle(errors.firstName), paddingLeft: '38px' }} /></div>
              {errors.firstName && <span className="field-hint error">{errors.firstName.message}</span>}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label className="field-label">Contact last name <span style={{ color: 'var(--status-error)' }}>*</span></label>
              <div className="input-wrapper"><IconUser className="input-icon left" aria-hidden="true" /><input type="text" placeholder="e.g. Kariuki" {...register('lastName')} style={{ ...inputStyle(errors.lastName), paddingLeft: '38px' }} /></div>
              {errors.lastName && <span className="field-hint error">{errors.lastName.message}</span>}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label className="field-label">Business email <span style={{ color: 'var(--status-error)' }}>*</span></label>
            <div className="input-wrapper"><IconMail className="input-icon left" aria-hidden="true" /><input type="email" placeholder="you@company.com" {...register('email')} style={{ ...inputStyle(errors.email), paddingLeft: '38px' }} /></div>
            {errors.email && <span className="field-hint error">{errors.email.message}</span>}
            <span style={{ fontSize: '12px', color: 'var(--grey-400)', lineHeight: 1.5 }}>
              Use your company email domain. Free email services like Gmail are not accepted.
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label className="field-label">Password <span style={{ color: 'var(--status-error)' }}>*</span></label>
            <div className="input-wrapper"><IconLock className="input-icon left" aria-hidden="true" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="At least 8 characters"
                {...register('password', { onChange: (e) => setPwValue(e.target.value) })}
                style={{ ...inputStyle(errors.password), paddingLeft: '38px', paddingRight: '42px' }}
              />
              <button type="button" onClick={() => setShowPassword((p) => !p)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--grey-400)', display: 'flex', alignItems: 'center' }}>
                {showPassword ? <IconEyeOff size={15} /> : <IconEye size={15} />}
              </button>
            </div>
            <PasswordStrengthBars score={getPwStrength(pwValue)} />
            {errors.password && <span className="field-hint error">{errors.password.message}</span>}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{ width: '100%', padding: '14px 32px', fontSize: '15px', fontFamily: 'var(--font-body)', fontWeight: 500, background: loading ? 'var(--purple-300)' : 'var(--purple-600)', color: 'var(--white)', border: 'none', borderRadius: 'var(--radius-md)', cursor: loading ? 'not-allowed' : 'pointer', transition: 'all .15s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
        >
          {loading && <IconLoader2 size={16} style={{ animation: 'spin 0.8s linear infinite' }} />}
          {loading ? 'Creating account' : 'Create brand account'}
        </button>
      </form>

      <div style={{ fontSize: '11px', color: 'var(--grey-400)', textAlign: 'center', marginTop: '12px', lineHeight: 1.6 }}>
        By signing up you agree to our{' '}
        <Link to="/terms" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--grey-600)', textDecoration: 'underline' }}>Terms of Service</Link>
        {' '}and{' '}
        <Link to="/privacy" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--grey-600)', textDecoration: 'underline' }}>Privacy Policy</Link>.
      </div>

      <div style={{ fontSize: '13px', color: 'var(--grey-500)', textAlign: 'center', marginTop: '16px' }}>
        Already have an account?{' '}
        <Link to="/login" style={{ color: 'var(--purple-600)', fontWeight: 500, textDecoration: 'none' }}>Log in</Link>
      </div>

      <div style={{ textAlign: 'center', marginTop: '12px' }}>
        <button type="button" onClick={onBack} style={{ fontSize: '12px', color: 'var(--grey-400)', background: 'none', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <IconArrowLeft size={12} /> Change account type
        </button>
      </div>
    </>
  );
}

// Page shell
export default function SignUpPage() {
  usePageMeta('Sign Up', 'Create a free Creatorske account as a creator or a brand.');
  const [step, setStep] = useState(1);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleContinue = (selectedRole) => {
    setRole(selectedRole);
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
    setRole(null);
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
          <Link
            to="/login"
            style={{ padding: '7px 16px', fontSize: '13px', fontWeight: 500, color: 'var(--grey-600)', border: '0.5px solid var(--grey-200)', borderRadius: 'var(--radius-md)', textDecoration: 'none', transition: 'all .15s' }}
          >
            Log in
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
          {step === 1 && <StepChooseType onContinue={handleContinue} />}
          {step === 2 && role === ROLES.CREATOR && <CreatorSignUpForm onBack={handleBack} loading={loading} setLoading={setLoading} />}
          {step === 2 && role === ROLES.BRAND   && <BrandSignUpForm   onBack={handleBack} loading={loading} setLoading={setLoading} />}
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 480px) { .signup-2col { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}