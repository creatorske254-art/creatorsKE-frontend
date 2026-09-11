import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePageMeta } from '@/lib/usePageMeta'

// ─── CSS-in-JS tokens matching auth.html design system ──────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
  @import url('https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css');

  :root {
    --white: #FFFFFF; --off-white: #F8F7FF; --black: #0D0D0D; --page-bg: #F2F1F8;
    --purple-50: #F0EEFF; --purple-100: #DDD9FD; --purple-200: #BAB3FA;
    --purple-300: #9187F7; --purple-400: #6B5FF4; --purple-500: #5445E8;
    --purple-600: #3D2FD6; --purple-700: #2C1FB8; --purple-800: #1E1480;
    --grey-50: #F5F5F5; --grey-100: #EBEBEB; --grey-200: #D6D6D6;
    --grey-300: #B8B8B8; --grey-400: #919191; --grey-500: #6E6E6E;
    --grey-600: #4A4A4A; --grey-700: #333333; --grey-800: #1F1F1F;
    --status-success: #00B96B; --status-error: #FF4B4B;
    --font-display: 'Gill Sans MT', 'Gill Sans', Calibri, sans-serif;
    --font-body: 'Inter', sans-serif;
    --radius-md: 8px; --radius-lg: 12px; --radius-xl: 16px; --radius-2xl: 24px;
    --shadow-sm: 0 2px 8px rgba(0,0,0,.06); --shadow-md: 0 4px 16px rgba(0,0,0,.08);
    --ease-out: cubic-bezier(.16,1,.3,1);
  }

  .ob-page { min-height: 100vh; display: flex; flex-direction: column; background: var(--page-bg); font-family: var(--font-body); animation: obFadeUp .25s var(--ease-out) both; }
  @keyframes obFadeUp { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }

  .ob-navbar {
    background: rgba(255,255,255,.92); backdrop-filter: blur(14px);
    border-bottom: 0.5px solid var(--grey-100); height: 60px;
    display: flex; align-items: center; padding: 0 40px;
    position: sticky; top: 0; z-index: 100; justify-content: space-between; flex-shrink: 0;
  }
  .ob-logo { font-family: var(--font-display); font-size: 20px; font-weight: 600; letter-spacing: -.01em; color: var(--black); text-decoration: none; cursor: pointer; }
  .ob-logo span { color: var(--purple-500); }

  .ob-theme-btn {
    width: 36px; height: 36px; border-radius: var(--radius-md); border: 0.5px solid var(--grey-200);
    background: transparent; cursor: pointer; display: flex; align-items: center; justify-content: center;
    color: var(--grey-500); font-size: 17px; transition: all .15s;
  }
  .ob-theme-btn:hover { background: var(--grey-50); color: var(--black); border-color: var(--grey-400); }

  .ob-shell {
    flex: 1; display: flex; align-items: center; justify-content: center;
    min-height: calc(100vh - 60px); padding: 48px 24px;
  }
  .ob-card {
    width: 100%; max-width: 440px; background: var(--white);
    border: 0.5px solid var(--grey-200); border-radius: var(--radius-xl);
    padding: 40px 36px 36px; box-shadow: 0 8px 40px rgba(84,69,232,.07), 0 2px 8px rgba(0,0,0,.04);
  }
  .ob-card-logo { font-family: var(--font-display); font-size: 20px; font-weight: 600; letter-spacing: -.01em; color: var(--black); display: inline-block; margin-bottom: 28px; cursor: pointer; }
  .ob-card-logo span { color: var(--purple-500); }

  .ob-title { font-family: var(--font-display); font-size: 26px; font-weight: 600; letter-spacing: -.02em; line-height: 1.15; color: var(--black); margin-bottom: 6px; }
  .ob-sub { font-size: 14px; color: var(--grey-500); line-height: 1.6; margin-bottom: 28px; }

  /* Account type cards */
  .type-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 24px; }
  .type-card {
    border: 1.5px solid var(--grey-200); border-radius: var(--radius-lg); padding: 18px 16px;
    cursor: pointer; transition: all .15s; background: var(--white); text-align: left; font-family: var(--font-body);
    width: 100%;
  }
  .type-card:hover { border-color: var(--purple-300); background: var(--purple-50); }
  .type-card.selected { border-color: var(--purple-500); background: var(--purple-50); box-shadow: 0 0 0 3px rgba(84,69,232,.1); }
  .type-card-icon { font-size: 22px; margin-bottom: 10px; color: var(--grey-500); }
  .type-card.selected .type-card-icon { color: var(--purple-600); }
  .type-card-title { font-size: 14px; font-weight: 600; color: var(--black); margin-bottom: 3px; }
  .type-card.selected .type-card-title { color: var(--purple-700); }
  .type-card-desc { font-size: 12px; color: var(--grey-500); line-height: 1.5; }
  .type-card.selected .type-card-desc { color: var(--purple-600); }

  /* Creator / Brand forms */
  .ob-form { display: flex; flex-direction: column; gap: 16px; margin-bottom: 6px; }
  .ob-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .ob-field { display: flex; flex-direction: column; gap: 6px; }
  .ob-label { font-size: 11px; font-weight: 600; letter-spacing: .07em; text-transform: uppercase; color: var(--grey-600); }
  .ob-label .req { color: var(--status-error); margin-left: 2px; }
  .ob-hint { font-size: 12px; color: var(--grey-400); line-height: 1.5; }
  .ob-input {
    width: 100%; font-family: var(--font-body); font-size: 14px; color: var(--black);
    background: var(--white); border: 0.5px solid var(--grey-300); border-radius: var(--radius-md);
    padding: 10px 14px; outline: none; transition: border-color .15s, box-shadow .15s; box-sizing: border-box;
  }
  .ob-input::placeholder { color: var(--grey-300); }
  .ob-input:focus { border-color: var(--purple-400); box-shadow: 0 0 0 3px rgba(84,69,232,.1); }
  .pass-wrap { position: relative; }
  .pass-wrap .ob-input { padding-right: 42px; }
  .pass-toggle {
    position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
    background: none; border: none; cursor: pointer; color: var(--grey-400); font-size: 16px; padding: 2px; transition: color .15s;
  }
  .pass-toggle:hover { color: var(--black); }

  /* Social button */
  .social-btn {
    width: 100%; padding: 11px 14px; border: 0.5px solid var(--grey-200); border-radius: var(--radius-md);
    display: flex; align-items: center; justify-content: center; gap: 10px; font-family: var(--font-body);
    font-size: 13px; font-weight: 500; color: var(--grey-700); background: var(--white); cursor: pointer; transition: all .15s;
  }
  .social-btn:hover { border-color: var(--grey-400); background: var(--grey-50); }

  .ob-divider { display: flex; align-items: center; gap: 12px; margin: 18px 0; }
  .ob-divider::before, .ob-divider::after { content: ''; flex: 1; height: 0.5px; background: var(--grey-200); }
  .ob-divider span { font-size: 12px; color: var(--grey-400); }

  /* Password strength */
  .pw-bars { display: flex; gap: 4px; margin-top: 6px; }
  .pw-bar { height: 3px; flex: 1; border-radius: 2px; background: var(--grey-200); transition: background .3s; }
  .pw-bar.weak { background: var(--grey-400); }
  .pw-bar.fair { background: #888; }
  .pw-bar.good { background: var(--purple-400); }
  .pw-bar.strong { background: var(--status-success); }
  .pw-hint { font-size: 11px; margin-top: 4px; color: var(--grey-400); }

  /* Buttons */
  .btn {
    display: inline-flex; align-items: center; justify-content: center; gap: 7px;
    border: none; cursor: pointer; font-family: var(--font-body); font-weight: 500;
    transition: all .15s; white-space: nowrap; line-height: 1; text-decoration: none; border-radius: var(--radius-md);
  }
  .btn-primary { background: var(--black); color: var(--white); font-size: 14px; padding: 11px 22px; }
  .btn-primary:hover { background: var(--grey-800); transform: translateY(-1px); box-shadow: var(--shadow-md); }
  .btn-purple { background: var(--purple-600); color: var(--white); font-size: 14px; padding: 11px 22px; }
  .btn-purple:hover { background: var(--purple-700); transform: translateY(-1px); box-shadow: 0 4px 16px rgba(84,69,232,.3); }
  .btn-ghost { background: transparent; color: var(--grey-600); font-size: 14px; padding: 10.5px 22px; border: 0.5px solid var(--grey-200); }
  .btn-ghost:hover { color: var(--black); border-color: var(--grey-400); background: var(--grey-50); }
  .btn-sm { padding: 7px 16px; font-size: 13px; }
  .btn-lg { padding: 14px 32px; font-size: 15px; }
  .btn-full { width: 100%; justify-content: center; }
  .btn-loading { position: relative; color: transparent !important; pointer-events: none; }
  .btn-loading::after {
    content: ''; position: absolute; width: 14px; height: 14px;
    border: 2px solid rgba(255,255,255,.3); border-top-color: white;
    border-radius: 50%; animation: spin .7s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg) } }
  .btn:disabled { opacity: .45; cursor: not-allowed; transform: none !important; box-shadow: none !important; }

  .ob-terms { font-size: 11px; color: var(--grey-400); text-align: center; margin-top: 12px; line-height: 1.6; }
  .ob-terms a { color: var(--grey-600); text-decoration: underline; cursor: pointer; }
  .ob-footer-text { font-size: 13px; color: var(--grey-500); text-align: center; margin-top: 20px; }
  .ob-footer-text a { color: var(--purple-600); font-weight: 500; text-decoration: none; cursor: pointer; }
  .ob-footer-text a:hover { text-decoration: underline; }
  .ob-eyebrow { font-size: 10px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: var(--purple-600); margin-bottom: 8px; }
  .ob-back-link { font-size: 12px; color: var(--grey-400); cursor: pointer; text-align: center; margin-top: 12px; display: block; }
  .ob-back-link:hover { color: var(--grey-600); }

  /* Verify screen */
  .verify-icon-wrap {
    width: 60px; height: 60px; border-radius: 50%; background: #E6F9F1;
    display: flex; align-items: center; justify-content: center;
    font-size: 26px; color: var(--status-success); margin: 0 auto 20px;
  }
  .verify-email-display {
    font-size: 14px; font-weight: 600; color: var(--black); background: var(--grey-50);
    border: 0.5px solid var(--grey-200); border-radius: var(--radius-md);
    padding: 10px 14px; text-align: center; margin-bottom: 20px; word-break: break-all;
  }
  .resend-row { display: flex; align-items: center; justify-content: center; gap: 6px; margin-top: 16px; font-size: 13px; color: var(--grey-500); }
  .resend-row a { color: var(--purple-600); font-weight: 500; cursor: pointer; text-decoration: none; }
  .resend-row a:hover { text-decoration: underline; }

  /* Toast */
  .ob-toast-wrap { position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%); z-index: 999; pointer-events: none; }
  .ob-toast {
    background: var(--black); color: var(--white); padding: 11px 18px; border-radius: var(--radius-lg);
    font-size: 13px; font-weight: 500; box-shadow: 0 16px 48px rgba(0,0,0,.12);
    display: flex; align-items: center; gap: 8px; opacity: 0; transform: translateY(10px);
    transition: all .25s; white-space: nowrap;
  }
  .ob-toast.show { opacity: 1; transform: translateY(0); }

  @media (max-width: 680px) {
    .ob-form-row { grid-template-columns: 1fr; }
    .type-cards { grid-template-columns: 1fr; }
    .ob-navbar { padding: 0 20px; }
    .ob-card { padding: 28px 20px 24px; }
  }
`

// ─── Helpers ────────────────────────────────────────────────────────────────

function calcPwStrength(pw) {
  if (!pw) return { score: 0, label: '', color: '' }
  let score = 0
  if (pw.length >= 8) score++
  if (/[A-Z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  const cls = score <= 1 ? 'weak' : score <= 2 ? 'fair' : score <= 3 ? 'good' : 'strong'
  const label = ['', 'Weak', 'Fair', 'Good', 'Strong'][score] || ''
  const color = score <= 1 ? 'var(--grey-400)' : score <= 2 ? '#888' : score <= 3 ? 'var(--purple-600)' : 'var(--status-success-text, #006B3D)'
  return { score, cls, label, color }
}

function PwBars({ score, cls }) {
  return (
    <div className="pw-bars">
      {[0, 1, 2, 3].map(i => (
        <div key={i} className={`pw-bar${i < score ? ` ${cls}` : ''}`} />
      ))}
    </div>
  )
}

const GoogleSVG = () => (
  <svg width="16" height="16" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
)

// ─── Sub-views ───────────────────────────────────────────────────────────────

function ChooseType({ onSelect, accountType, onContinue, onLoginClick }) {
  return (
    <div className="ob-shell">
      <div className="ob-card">
        <div className="ob-card-logo">Creatorske<span>.</span></div>
        <h1 className="ob-title">Join Creatorske</h1>
        <p className="ob-sub">Are you a creator or a brand? We'll tailor your setup.</p>

        <div className="type-cards">
          <button
            className={`type-card${accountType === 'creator' ? ' selected' : ''}`}
            onClick={() => onSelect('creator')}
          >
            <div className="type-card-icon"><i className="ti ti-camera" /></div>
            <div className="type-card-title">I'm a Creator</div>
            <div className="type-card-desc">Build your rate card and get discovered by brands.</div>
          </button>
          <button
            className={`type-card${accountType === 'brand' ? ' selected' : ''}`}
            onClick={() => onSelect('brand')}
          >
            <div className="type-card-icon"><i className="ti ti-building-store" /></div>
            <div className="type-card-title">I'm a Brand</div>
            <div className="type-card-desc">Find and book creators for your campaigns.</div>
          </button>
        </div>

        <button
          className="btn btn-primary btn-full btn-lg"
          onClick={onContinue}
          disabled={!accountType}
        >
          Continue <i className="ti ti-arrow-right" style={{ fontSize: 14 }} />
        </button>
        <div className="ob-footer-text">
          Already have an account? <a onClick={onLoginClick}>Log in</a>
        </div>
      </div>
    </div>
  )
}

function CreatorSignup({ onBack, onSubmit, loading }) {
  const [fname, setFname] = useState('')
  const [lname, setLname] = useState('')
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [showPw, setShowPw] = useState(false)
  const pwStrength = calcPwStrength(pw)

  const handleSubmit = () => {
    if (!fname || !email) return
    onSubmit({ fname, lname, email, pw })
  }

  return (
    <div className="ob-shell">
      <div className="ob-card">
        <div className="ob-card-logo">Creatorske<span>.</span></div>
        <div className="ob-eyebrow">Creator account</div>
        <h1 className="ob-title">Create your account</h1>
        <p className="ob-sub">Build your rate card and start getting booked.</p>

        <button className="social-btn" onClick={() => onSubmit({ google: true, fname: 'user' })}>
          <GoogleSVG /> Continue with Google
        </button>
        <div className="ob-divider"><span>or sign up with email</span></div>

        <div className="ob-form">
          <div className="ob-form-row">
            <div className="ob-field">
              <label className="ob-label">First name<span className="req">*</span></label>
              <input className="ob-input" type="text" placeholder="Amara" value={fname} onChange={e => setFname(e.target.value)} />
            </div>
            <div className="ob-field">
              <label className="ob-label">Last name</label>
              <input className="ob-input" type="text" placeholder="Osei" value={lname} onChange={e => setLname(e.target.value)} />
            </div>
          </div>
          <div className="ob-field">
            <label className="ob-label">Email<span className="req">*</span></label>
            <input className="ob-input" type="email" placeholder="you@email.com" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="ob-field">
            <label className="ob-label">Password<span className="req">*</span></label>
            <div className="pass-wrap">
              <input
                className="ob-input" type={showPw ? 'text' : 'password'}
                placeholder="Min. 8 characters" value={pw} onChange={e => setPw(e.target.value)}
              />
              <button className="pass-toggle" onClick={() => setShowPw(v => !v)} type="button">
                <i className={`ti ${showPw ? 'ti-eye-off' : 'ti-eye'}`} />
              </button>
            </div>
            <PwBars score={pwStrength.score} cls={pwStrength.cls} />
            <div className="pw-hint" style={{ color: pwStrength.color }}>{pwStrength.label}</div>
          </div>
        </div>

        <div style={{ marginTop: 16 }}>
          <button className={`btn btn-purple btn-full btn-lg${loading ? ' btn-loading' : ''}`} onClick={handleSubmit}>
            Create my account
          </button>
        </div>
        <div className="ob-terms">
          By signing up you agree to our <a>Terms of Service</a> and <a>Privacy Policy</a>.
        </div>
        <div className="ob-footer-text">Already have an account? <a>Log in</a></div>
        <a className="ob-back-link" onClick={onBack}>← Change account type</a>
      </div>
    </div>
  )
}

function BrandSignup({ onBack, onSubmit, loading }) {
  const [company, setCompany] = useState('')
  const [fname, setFname] = useState('')
  const [lname, setLname] = useState('')
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [showPw, setShowPw] = useState(false)
  const pwStrength = calcPwStrength(pw)

  const handleSubmit = () => {
    if (!email || !company) return
    onSubmit({ company, fname, lname, email, pw })
  }

  return (
    <div className="ob-shell">
      <div className="ob-card">
        <div className="ob-card-logo">Creatorske<span>.</span></div>
        <div className="ob-eyebrow">Brand account</div>
        <h1 className="ob-title">Create your account</h1>
        <p className="ob-sub">Find and book creators for your next campaign.</p>

        <button className="social-btn" onClick={() => onSubmit({ google: true, fname: 'brand' })}>
          <GoogleSVG /> Continue with Google
        </button>
        <div className="ob-divider"><span>or sign up with email</span></div>

        <div className="ob-form">
          <div className="ob-field">
            <label className="ob-label">Company name<span className="req">*</span></label>
            <input className="ob-input" type="text" placeholder="Acme Kenya Ltd" value={company} onChange={e => setCompany(e.target.value)} />
          </div>
          <div className="ob-form-row">
            <div className="ob-field">
              <label className="ob-label">Contact first name<span className="req">*</span></label>
              <input className="ob-input" type="text" placeholder="Jane" value={fname} onChange={e => setFname(e.target.value)} />
            </div>
            <div className="ob-field">
              <label className="ob-label">Contact last name</label>
              <input className="ob-input" type="text" placeholder="Kariuki" value={lname} onChange={e => setLname(e.target.value)} />
            </div>
          </div>
          <div className="ob-field">
            <label className="ob-label">Business email<span className="req">*</span></label>
            <input className="ob-input" type="email" placeholder="jane@acmecompany.com" value={email} onChange={e => setEmail(e.target.value)} />
            <div className="ob-hint">Use your company email domain — free email services like Gmail are not accepted.</div>
          </div>
          <div className="ob-field">
            <label className="ob-label">Password<span className="req">*</span></label>
            <div className="pass-wrap">
              <input
                className="ob-input" type={showPw ? 'text' : 'password'}
                placeholder="Min. 8 characters" value={pw} onChange={e => setPw(e.target.value)}
              />
              <button className="pass-toggle" onClick={() => setShowPw(v => !v)} type="button">
                <i className={`ti ${showPw ? 'ti-eye-off' : 'ti-eye'}`} />
              </button>
            </div>
            <PwBars score={pwStrength.score} cls={pwStrength.cls} />
            <div className="pw-hint" style={{ color: pwStrength.color }}>{pwStrength.label}</div>
          </div>
        </div>

        <div style={{ marginTop: 16 }}>
          <button className={`btn btn-purple btn-full btn-lg${loading ? ' btn-loading' : ''}`} onClick={handleSubmit}>
            Create brand account
          </button>
        </div>
        <div className="ob-terms">
          By signing up you agree to our <a>Terms of Service</a> and <a>Privacy Policy</a>.
        </div>
        <div className="ob-footer-text">Already have an account? <a>Log in</a></div>
        <a className="ob-back-link" onClick={onBack}>← Change account type</a>
      </div>
    </div>
  )
}

function VerifyEmail({ email, accountType, onVerified, onResend, onBack }) {
  const [loading, setLoading] = useState(false)

  const handleVerify = () => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      onVerified()
    }, 1200)
  }

  return (
    <div className="ob-shell">
      <div className="ob-card" style={{ textAlign: 'center' }}>
        <div className="verify-icon-wrap"><i className="ti ti-mail-check" /></div>
        <h1 className="ob-title" style={{ textAlign: 'center' }}>Check your inbox</h1>
        <p className="ob-sub" style={{ textAlign: 'center' }}>We sent a verification link to:</p>
        <div className="verify-email-display">{email || 'you@email.com'}</div>
        <p style={{ fontSize: 13, color: 'var(--grey-500)', lineHeight: 1.65, marginBottom: 24 }}>
          Click the link in the email to verify your account. You won't be able to publish your rate card until verification is complete.
        </p>
        <button className={`btn btn-purple btn-full btn-lg${loading ? ' btn-loading' : ''}`} onClick={handleVerify}>
          <i className="ti ti-check" style={{ fontSize: 15 }} /> I've verified my email
        </button>
        <div className="resend-row">
          <span>Didn't get it?</span>
          <a onClick={onResend}>Resend email</a>
        </div>
        <div className="resend-row" style={{ marginTop: 6 }}>
          <a onClick={onBack} style={{ color: 'var(--grey-500)' }}>← Wrong email? Go back</a>
        </div>
      </div>
    </div>
  )
}

// ─── Navbar ──────────────────────────────────────────────────────────────────

function Navbar({ onLogoClick, actions }) {
  return (
    <nav className="ob-navbar">
      <div className="ob-logo" onClick={onLogoClick}>Creatorske<span>.</span></div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {actions}
      </div>
    </nav>
  )
}

// ─── Toast ───────────────────────────────────────────────────────────────────

function Toast({ message }) {
  return (
    <div className="ob-toast-wrap">
      <div className={`ob-toast${message ? ' show' : ''}`}>
        <i className="ti ti-check" />
        <span>{message}</span>
      </div>
    </div>
  )
}

// ─── Main component ──────────────────────────────────────────────────────────

/**
 * OnboardingPage
 *
 * Controls the full pre-auth / sign-up onboarding flow:
 *   choose-type → signup-creator | signup-brand → verify → (plan selection or brand-ready)
 *
 * Props:
 *   onComplete(accountType, plan?, userInfo) — called when onboarding ends.
 *     For creators: plan is null here; PlanSelectionPage handles it next.
 *     For brands: called after email verification.
 *   onLoginClick() — navigate to login page
 *
 * All navigation between onboarding steps is internal state.
 */
export default function OnboardingPage({ onComplete, onLoginClick }) {
  usePageMeta('Set Up Your Profile', 'Finish setting up your creator profile on Creatorske.');
  const [step, setStep] = useState('choose-type') // 'choose-type' | 'signup-creator' | 'signup-brand' | 'verify'
  const [accountType, setAccountType] = useState(null)
  const [userInfo, setUserInfo] = useState({})
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState('')

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2800)
  }

  const handleTypeSelect = (type) => setAccountType(type)
  const handleTypeContinue = () => {
    if (!accountType) return
    setStep(accountType === 'brand' ? 'signup-brand' : 'signup-creator')
  }

  const handleCreatorSubmit = (data) => {
    setLoading(true)
    setUserInfo(data)
    setTimeout(() => {
      setLoading(false)
      setStep('verify')
    }, 1400)
  }

  const handleBrandSubmit = (data) => {
    setLoading(true)
    setUserInfo(data)
    setTimeout(() => {
      setLoading(false)
      setStep('verify')
    }, 1400)
  }

  const handleVerified = () => {
    if (accountType === 'brand') {
      // Brands go straight to their dashboard — parent handles routing
      onComplete?.('brand', null, userInfo)
    } else {
      // Creators go to plan selection
      onComplete?.('creator', null, userInfo)
    }
  }

  const handleResend = () => showToast('Verification email resent!')

  const navbarActions = (
    <>
      {/* theme toggle omitted here — handled at app level; add ThemeToggle component if needed */}
      {(step === 'choose-type' || step === 'signup-creator' || step === 'signup-brand') && (
        <button className="btn btn-ghost btn-sm" onClick={onLoginClick}>Log in</button>
      )}
    </>
  )

  return (
    <>
      <style>{css}</style>
      <div className="ob-page">
        <Navbar onLogoClick={() => setStep('choose-type')} actions={navbarActions} />

        {step === 'choose-type' && (
          <ChooseType
            accountType={accountType}
            onSelect={handleTypeSelect}
            onContinue={handleTypeContinue}
            onLoginClick={onLoginClick}
          />
        )}

        {step === 'signup-creator' && (
          <CreatorSignup
            onBack={() => setStep('choose-type')}
            onSubmit={handleCreatorSubmit}
            loading={loading}
          />
        )}

        {step === 'signup-brand' && (
          <BrandSignup
            onBack={() => setStep('choose-type')}
            onSubmit={handleBrandSubmit}
            loading={loading}
          />
        )}

        {step === 'verify' && (
          <VerifyEmail
            email={userInfo.email}
            accountType={accountType}
            onVerified={handleVerified}
            onResend={handleResend}
            onBack={() => setStep(accountType === 'brand' ? 'signup-brand' : 'signup-creator')}
          />
        )}

        <Toast message={toast} />
      </div>
    </>
  )
}