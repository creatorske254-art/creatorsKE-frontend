import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePageMeta } from '@/lib/usePageMeta'
import { usePlan } from '@/features/plans/hooks/usePlan'
import { CREATOR_PRICING_TIERS } from '@/features/plans/constants/pricingTiers'
import Modal from '@/components/ui/Modal'

// ─── CSS-in-JS tokens (shared subset matching auth.html) ─────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
  @import url('https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css');

  .ps-page {
    --ease-out: cubic-bezier(.16,1,.3,1);
    min-height: 100vh; display: flex; flex-direction: column; background: var(--page-bg); font-family: var(--font-body); animation: psFadeUp .25s var(--ease-out) both;
  }
  @keyframes psFadeUp { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }

  .ps-navbar {
    background: color-mix(in srgb, var(--white) 92%, transparent); backdrop-filter: blur(14px);
    border-bottom: 0.5px solid var(--grey-100); height: 60px;
    display: flex; align-items: center; padding: 0 var(--gutter-public);
    position: sticky; top: 0; z-index: 100; justify-content: space-between; flex-shrink: 0;
  }
  .ps-logo { font-family: var(--font-display); font-size: 20px; font-weight: 600; letter-spacing: -.01em; color: var(--black); cursor: pointer; }
  .ps-logo span { color: var(--purple-500); }

  /* Plan shell */
  .ps-shell { flex: 1; background: var(--page-bg); padding: var(--space-48) var(--gutter-public); }
  .ps-inner { max-width: 780px; margin: 0 auto; }

  .ps-eyebrow { margin-bottom: var(--space-8); }
  .ps-title { margin-bottom: var(--space-8); }
  .ps-sub { margin-bottom: var(--space-40); }

  /* Plan grid */
  .ps-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-16); margin-bottom: var(--space-32); }

  .ps-card {
    border: 1.5px solid var(--grey-200); border-radius: var(--radius-xl); padding: var(--space-24);
    background: var(--white); cursor: pointer; transition: all .2s; position: relative;
  }
  .ps-card:hover { border-color: var(--purple-300); transform: translateY(-2px); box-shadow: var(--shadow-md); }
  .ps-card.selected { border-color: var(--purple-500); box-shadow: 0 0 0 3px rgba(84,69,232,.12), var(--shadow-md); }

  .ps-card-pro { background: var(--purple-50); border-color: var(--purple-200); }
  .ps-card-pro:hover { border-color: var(--purple-400); }
  .ps-card-pro.selected { border-color: var(--purple-600); box-shadow: 0 0 0 3px rgba(84,69,232,.15), var(--shadow-lg); }

  .ps-card-business { background: var(--black); border-color: var(--grey-700); }
  .ps-card-business:hover { border-color: var(--grey-500); transform: translateY(-2px); box-shadow: var(--shadow-md); }
  .ps-card-business.selected { border-color: var(--grey-400); box-shadow: 0 0 0 3px rgba(255,255,255,.08), var(--shadow-md); }

  .ps-badge {
    position: absolute; top: -10px; left: 50%; transform: translateX(-50%);
    background: var(--purple-600); color: #fff; font-size: 10px; font-weight: 700;
    letter-spacing: .08em; text-transform: uppercase; padding: var(--space-4) var(--space-12);
    border-radius: var(--radius-pill); white-space: nowrap;
  }

  .ps-check-indicator {
    position: absolute; top: 14px; right: 14px; width: 22px; height: 22px;
    border-radius: 50%; border: 1.5px solid var(--grey-200); background: var(--white);
    display: flex; align-items: center; justify-content: center; transition: all .2s;
  }
  .ps-card.selected .ps-check-indicator { background: var(--purple-500); border-color: var(--purple-500); }
  .ps-check-indicator i { color: transparent; font-size: 12px; }
  .ps-card.selected .ps-check-indicator i { color: #fff; }

  /* Business card check indicator overrides */
  .ps-card-business .ps-check-indicator { border-color: var(--grey-600); background: transparent; }
  .ps-card-business.selected .ps-check-indicator { background: var(--grey-600); border-color: var(--grey-500); }
  .ps-card-business.selected .ps-check-indicator i { color: #fff; }

  .ps-plan-label { font-size: 10px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: var(--grey-400); margin-bottom: var(--space-8); }
  .ps-card-pro .ps-plan-label { color: var(--purple-500); }
  .ps-card-business .ps-plan-label { color: var(--grey-500); }

  .ps-price { font-family: var(--font-display); font-size: 26px; font-weight: 600; color: var(--black); letter-spacing: -.02em; line-height: 1; margin-bottom: var(--space-2); }
  .ps-card-pro .ps-price { color: var(--purple-800); }
  .ps-card-business .ps-price { color: var(--white); }

  .ps-cadence { font-size: 12px; color: var(--grey-400); margin-bottom: var(--space-16); }
  .ps-card-business .ps-cadence { color: var(--grey-500); }

  .ps-feats { display: flex; flex-direction: column; gap: var(--space-8); }
  .ps-feat { font-size: 12px; color: var(--grey-600); display: flex; align-items: flex-start; gap: var(--space-8); line-height: 1.4; }
  .ps-feat i { color: var(--status-success); font-size: 13px; flex-shrink: 0; margin-top: var(--space-2); }
  .ps-card-pro .ps-feat { color: var(--purple-700); }
  .ps-card-pro .ps-feat i { color: var(--purple-500); }
  .ps-card-business .ps-feat { color: var(--grey-300); }
  .ps-card-business .ps-feat i { color: var(--status-success); }

  /* Starter note */
  .ps-starter-note { font-size: 12px; color: var(--grey-400); text-align: center; margin-bottom: var(--space-24); }
  .ps-starter-note .ps-link-btn { color: var(--purple-600); font-weight: 500; cursor: pointer; text-decoration: none; background: none; border: none; padding: 0; font: inherit; }
  .ps-starter-note .ps-link-btn:hover { text-decoration: underline; }

  /* CTA button - .btn/.btn-purple/.btn-lg/.btn-full/.btn-loading come from
     the shared index.css button system. Only the disabled-state dimming has
     no canonical equivalent, so it stays here, scoped to this page. */
  .ps-page .btn:disabled { opacity: .45; cursor: not-allowed; transform: none !important; box-shadow: none !important; }

  /* Rate card mini preview */
  .rc-mini {
    background: var(--white); border: 0.5px solid var(--grey-100); border-radius: var(--radius-xl);
    overflow: hidden; box-shadow: var(--shadow-sm); width: 100%; max-width: 340px;
    animation: rcFloat .5s var(--ease-out) both;
  }
  @keyframes rcFloat { from { opacity:0; transform:translateY(20px) } to { opacity:1; transform:translateY(0) } }
  .rc-mini-top { padding: var(--space-16) var(--space-16) var(--space-12); border-bottom: 0.5px solid var(--grey-100); display: flex; align-items: center; gap: var(--space-12); }
  .rc-mini-avatar {
    width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
    font-family: var(--font-display); font-size: 13px; font-weight: 600; color: var(--white); flex-shrink: 0;
    background: linear-gradient(135deg, #6B5FF4, #1E1480);
  }
  .rc-mini-name { font-family: var(--font-display); font-size: 14px; font-weight: 600; color: var(--black); }
  .rc-mini-handle { font-size: 11px; color: var(--grey-400); }
  .rc-mini-stats { display: flex; border-bottom: 0.5px solid var(--grey-100); }
  .rc-mini-stat { flex: 1; padding: var(--space-8) var(--space-12); text-align: center; border-right: 0.5px solid var(--grey-100); }
  .rc-mini-stat:last-child { border-right: none; }
  .rc-mini-num { font-family: var(--font-display); font-size: 15px; font-weight: 600; color: var(--black); }
  .rc-mini-lbl { font-size: 9px; text-transform: uppercase; letter-spacing: .06em; color: var(--grey-400); margin-top: var(--space-2); }
  .rc-mini-footer { padding: var(--space-12) var(--space-16); display: flex; align-items: center; justify-content: space-between; }
  .rc-avail { display: inline-flex; align-items: center; gap: var(--space-4); font-size: 11px; color: var(--grey-500); }
  .rc-avail-dot { width: 5px; height: 5px; border-radius: 50%; background: #639922; }
  .rc-mini-cta { font-size: 11px; font-weight: 600; color: var(--purple-600); cursor: pointer; }

  /* Welcome / complete screen */
  .ps-complete-shell {
    flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: flex-start;
    gap: var(--space-32); padding: var(--space-64) var(--space-24) var(--space-48); background: var(--page-bg);
  }

  /* Toast */
  .ps-toast-wrap { position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%); z-index: 999; pointer-events: none; }
  .ps-toast {
    background: var(--black); color: var(--white); padding: var(--space-12) var(--space-20); border-radius: var(--radius-lg);
    font-size: 13px; font-weight: 500; box-shadow: var(--shadow-xl);
    display: flex; align-items: center; gap: var(--space-8); opacity: 0; transform: translateY(10px);
    transition: all .25s; white-space: nowrap;
  }
  .ps-toast.show { opacity: 1; transform: translateY(0); }

  @media (max-width: 680px) {
    .ps-grid { grid-template-columns: 1fr; }
    .ps-shell { padding: var(--space-32) var(--gutter-public); }
  }
`

// ─── Plan data ────────────────────────────────────────────────────────────────
// Sourced from the canonical CREATOR_PRICING_TIERS (features/plans/constants/pricingTiers.js)
// so pricing here never drifts from the marketing PricingPage. The "elite" tier id is
// remapped to "business" to match the wire/gating convention used elsewhere
// (plans.js's PLANS enum, ProtectedFeature.jsx's PLAN_RANK) - only its display name
// and price changed to "Elite" / KES 4,000, the identifier itself did not.
const PLAN_DISPLAY = {
  starter: { label: 'Starter', cadence: 'forever', cardClass: '' },
  pro:     { label: 'Pro', cadence: '/ month · 7-day free trial', cardClass: 'ps-card-pro' },
  elite:   { label: 'Elite', cadence: '/ month · 7-day free trial', cardClass: 'ps-card-business' },
}

const PLANS = CREATOR_PRICING_TIERS.map((tier) => ({
  id: tier.id === 'elite' ? 'business' : tier.id,
  label: PLAN_DISPLAY[tier.id]?.label ?? tier.name,
  price: tier.price === 0 ? 'Free' : `KES ${tier.price.toLocaleString()}`,
  cadence: PLAN_DISPLAY[tier.id]?.cadence ?? 'per month',
  badge: tier.featured ? 'Most popular' : undefined,
  cardClass: PLAN_DISPLAY[tier.id]?.cardClass ?? '',
  features: tier.features.slice(0, 5),
}))

const PLAN_BTN_LABELS = {
  starter: 'Starter (Free)',
  pro: 'Pro',
  business: 'Elite',
}

const PLAN_WELCOME_LABELS = {
  starter: 'Starter',
  pro: 'Pro (7-day trial)',
  business: 'Elite (7-day trial)',
}

// ─── Payment details (paid plans) ─────────────────────────────────────────────

/**
 * Collects a real payment method before a paid upgrade. POST /plans/upgrade
 * takes a paymentMethod, so what's entered here is what gets sent - Pro/Elite
 * no longer silently upgrade with `null`.
 */
function PaymentDetailsModal({ plan, isSubmitting, onCancel, onConfirm }) {
  const [provider, setProvider] = useState('mpesa')
  const [phone, setPhone] = useState('')

  if (!plan) return null

  const digits = phone.replace(/\D/g, '')
  const valid = digits.length >= 9

  return (
    <Modal open onClose={isSubmitting ? () => {} : onCancel} title={`Subscribe to ${plan.label}`} size="sm">
      <div style={{
        display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
        padding: 'var(--space-12) var(--space-16)', background: 'var(--purple-50)', border: '0.5px solid var(--purple-100)',
        borderRadius: 'var(--radius-lg)', marginBottom: 'var(--space-20)',
      }}>
        <span style={{ fontSize: 13, color: 'var(--purple-700)' }}>{plan.label} plan</span>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600, color: 'var(--purple-800)' }}>
          {plan.price}<span style={{ fontSize: 11, fontWeight: 400 }}> {plan.cadence}</span>
        </span>
      </div>

      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--grey-600)', marginBottom: 'var(--space-8)' }}>
        Pay with
      </label>
      <div style={{ display: 'flex', gap: 'var(--space-8)', marginBottom: 'var(--space-16)' }}>
        {[{ key: 'mpesa', label: 'M-Pesa' }, { key: 'airtel', label: 'Airtel Money' }].map((p) => (
          <button
            key={p.key}
            type="button"
            onClick={() => setProvider(p.key)}
            aria-pressed={provider === p.key}
            style={{
              flex: 1, padding: 'var(--space-12) var(--space-8)', borderRadius: 'var(--radius-md)', cursor: 'pointer',
              background: provider === p.key ? 'var(--purple-50)' : 'var(--white)',
              border: `1px solid ${provider === p.key ? 'var(--purple-400)' : 'var(--grey-200)'}`,
              color: provider === p.key ? 'var(--purple-700)' : 'var(--grey-600)',
              fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 500,
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

      <label style={{ display: 'block', fontSize: 12, color: 'var(--grey-600)', marginBottom: 'var(--space-8)' }}>
        Phone number
      </label>
      <div className="input-wrapper" style={{ marginBottom: 'var(--space-8)' }}>
        <i className="ti ti-device-mobile input-icon left" aria-hidden="true" />
        <input
          className="input input-md input-icon-left"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+254 7XX XXX XXX"
          inputMode="tel"
          disabled={isSubmitting}
          style={{ width: '100%' }}
        />
      </div>
      <p style={{ fontSize: 12, color: 'var(--grey-400)', lineHeight: 1.6, marginBottom: 'var(--space-20)' }}>
        You'll get a prompt on this number to authorise the payment. Your 7-day trial starts today.
        you can cancel from Settings before it ends and you won't be charged.
      </p>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-12)' }}>
        <button className="btn btn-ghost btn-sm" onClick={onCancel} disabled={isSubmitting}>Cancel</button>
        <button
          className={`btn btn-purple btn-sm${isSubmitting ? ' btn-loading' : ''}`}
          disabled={!valid || isSubmitting}
          onClick={() => onConfirm({ provider, phone: phone.trim() })}
        >
          Start trial
        </button>
      </div>
    </Modal>
  )
}

// ─── Navbar ───────────────────────────────────────────────────────────────────

function Navbar({ onLogoClick }) {
  return (
    <nav className="ps-navbar">
      <div className="ps-logo" onClick={onLogoClick}>Creatorske<span>.</span></div>
    </nav>
  )
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({ message }) {
  return (
    <div className="ps-toast-wrap">
      <div className={`ps-toast${message ? ' show' : ''}`}>
        <i className="ti ti-check" />
        <span>{message}</span>
      </div>
    </div>
  )
}

// ─── Plan card ────────────────────────────────────────────────────────────────

function PlanCard({ plan, selected, onSelect }) {
  return (
    <div
      className={`ps-card ${plan.cardClass}${selected ? ' selected' : ''}`}
      onClick={() => onSelect(plan.id)}
    >
      {plan.badge && <div className="ps-badge">{plan.badge}</div>}
      <div className="ps-check-indicator">
        <i className="ti ti-check" />
      </div>
      <div className="ps-plan-label">{plan.label}</div>
      <div className="ps-price">{plan.price}</div>
      <div className="ps-cadence">{plan.cadence}</div>
      <div className="ps-feats">
        {plan.features.map((feat, i) => (
          <div key={i} className="ps-feat">
            <i className="ti ti-check" />
            {feat}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Onboarding complete (welcome screen) ─────────────────────────────────────

function OnboardingComplete({ firstName, plan, onStartBuilding }) {
  return (
    <div className="ps-complete-shell">
      <div style={{ textAlign: 'center', maxWidth: 480 }}>
        <div style={{ fontSize: 32, marginBottom: 'var(--space-12)' }}>🎉</div>
        <h1 className="hero-title" style={{ marginBottom: 'var(--space-8)' }}>
          You're all set, <span>{firstName || 'there'}</span>!
        </h1>
        <p style={{ fontSize: 14, color: 'var(--grey-500)', lineHeight: 1.7 }}>
          Your <strong>{PLAN_WELCOME_LABELS[plan] || plan}</strong> account is active.
          Here's a preview of what you'll build. Then head into the builder to make it yours.
        </p>
      </div>

      {/* Example rate card preview */}
      <div className="rc-mini">
        <div className="rc-mini-top">
          <div className="rc-mini-avatar">AO</div>
          <div>
            <div className="rc-mini-name">
              Amara Osei{' '}
              <span style={{ fontSize: 10, color: 'var(--grey-400)', fontFamily: 'var(--font-body)', fontWeight: 400 }}>· Example</span>
            </div>
            <div className="rc-mini-handle">@amaracreates · Lifestyle</div>
          </div>
        </div>
        <div className="rc-mini-stats">
          <div className="rc-mini-stat">
            <div className="rc-mini-num">48K</div>
            <div className="rc-mini-lbl">Followers</div>
          </div>
          <div className="rc-mini-stat">
            <div className="rc-mini-num">6.2%</div>
            <div className="rc-mini-lbl">Engagement</div>
          </div>
          <div className="rc-mini-stat">
            <div className="rc-mini-num">4.9★</div>
            <div className="rc-mini-lbl">Rating</div>
          </div>
        </div>
        <div className="rc-mini-footer">
          <div className="rc-avail">
            <span className="rc-avail-dot" />
            Available now
          </div>
          <div className="rc-mini-cta">Enquire →</div>
        </div>
      </div>

      <button className="btn btn-purple btn-lg" onClick={onStartBuilding}>
        <i className="ti ti-pencil" style={{ fontSize: 15 }} /> Start building my rate card
      </button>

      <p style={{ fontSize: 12, color: 'var(--grey-400)', marginTop: 'calc(-1 * var(--space-16))' }}>
        You can always come back to this later from your dashboard.
      </p>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

/**
 * PlanSelectionPage
 *
 * Shown after a creator verifies their email. Lets them pick Starter / Pro / Business,
 * then reveals the "you're all set" welcome screen with a rate card preview.
 *
 * Props:
 *   firstName  - pre-filled from signup (string)
 *   onComplete(plan) - called when the user clicks "Start building my rate card"
 */
export default function PlanSelectionPage({ firstName, onComplete }) {
  usePageMeta('Choose Your Plan', 'Pick the Creatorske plan that fits you. Start free, upgrade anytime.');
  const navigate = useNavigate()
  const { upgrade, isUpgrading } = usePlan()
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [pendingPlan, setPendingPlan] = useState(null) // paid plan awaiting payment details
  const [step, setStep] = useState('select') // 'select' | 'complete'
  const [confirmedPlan, setConfirmedPlan] = useState(null)
  const [toast, setToast] = useState('')

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2800)
  }

  // Starter is free, so it upgrades straight away. Pro/Elite are paid, so they
  // collect a real payment method first instead of silently sending null.
  const handleContinue = (plan) => {
    const p = plan || selectedPlan
    if (!p) return
    if (p === 'starter') {
      commitPlan(p, null)
      return
    }
    setPendingPlan(p)
  }

  const commitPlan = (planId, paymentMethod) => {
    upgrade(
      { planId, paymentMethod },
      {
        onSuccess: () => {
          setPendingPlan(null)
          setConfirmedPlan(planId)
          setStep('complete')
        },
      }
    )
  }

  const handleStartBuilding = () => {
    if (onComplete) onComplete(confirmedPlan)
    else navigate('/creator/rate-card')
  }

  return (
    <>
      <style>{css}</style>
      <div className="ps-page">
        <Navbar onLogoClick={() => navigate('/')} />

        {step === 'select' && (
          <div className="ps-shell">
            <div className="ps-inner">
              <div className="eyebrow ps-eyebrow">One more step</div>
              <h1 className="hero-title ps-title">Choose your plan</h1>
              <p className="page-subtitle ps-sub">Start free and upgrade whenever you're ready. You can change this anytime from Settings.</p>

              <div className="ps-grid">
                {PLANS.map(plan => (
                  <PlanCard
                    key={plan.id}
                    plan={plan}
                    selected={selectedPlan === plan.id}
                    onSelect={setSelectedPlan}
                  />
                ))}
              </div>

              <div className="ps-starter-note">
                No commitment on Starter.{' '}
                <button type="button" className="ps-link-btn" onClick={() => { setSelectedPlan('starter'); handleContinue('starter') }}>
                  Continue free →
                </button>
              </div>

              <button
                className={`btn btn-purple btn-full btn-lg${isUpgrading ? ' btn-loading' : ''}`}
                onClick={() => handleContinue()}
                disabled={!selectedPlan || isUpgrading}
              >
                Continue with {selectedPlan ? PLAN_BTN_LABELS[selectedPlan] : 'selected plan'}{' '}
                <i className="ti ti-arrow-right" style={{ fontSize: 14 }} />
              </button>
            </div>
          </div>
        )}

        {step === 'complete' && (
          <OnboardingComplete
            firstName={firstName}
            plan={confirmedPlan}
            onStartBuilding={handleStartBuilding}
          />
        )}

        <PaymentDetailsModal
          plan={pendingPlan ? PLANS.find((p) => p.id === pendingPlan) : null}
          isSubmitting={isUpgrading}
          onCancel={() => setPendingPlan(null)}
          onConfirm={(paymentMethod) => commitPlan(pendingPlan, paymentMethod)}
        />

        <Toast message={toast} />
      </div>
    </>
  )
}