import { useEffect, useState } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { usePageMeta } from '@/lib/usePageMeta';
import {
  IconArrowRight, IconPlus, IconBrandInstagram, IconBrandTiktok, IconBrandLinkedin, IconBrandWhatsapp, IconCamera, IconBuildingStore, IconLayoutCards, IconDeviceMobileDollar, IconShieldCheck, IconLockDollar, IconRocket,
} from '@tabler/icons-react';

/*
   Marketing home. The structure comes from the Creatorske waitlist page that
   people already signed up through - a role switch, a dark hero, three
   illustrated steps, an FAQ and a closing banner -
   rebuilt on the app's design system (tokens, typography roles, icon kit,
   motion). The role switch (?for=creator|brand) re-writes every section's
   copy, so a brand and a creator each read a page about themselves.
*/

const ROLE_KEY = 'creatorske_home_role';
const IMG = (name) => `/images/marketing/${name}.webp`;

const COPY = {
  creator: {
    eyebrow: 'For creators',
    headline: <>Get paid what you're worth,<br />on time, every time.</>,
    sub: 'Build a rate card brands can book from directly, and get paid straight to M-Pesa the moment your work is approved.',
    primary: { label: 'Build your rate card', to: '/signup?role=creator' },
    secondary: { label: 'See a live rate card', to: '/c/amara' },
    stepsTitle: 'How creators get paid',
    steps: [
      { img: 'creator-01-build-rate-card', title: 'Build your rate card', desc: 'Package deliverables, pricing and social stats once. Publish a link brands can book from.' },
      { img: 'creator-02-receive-briefs', title: 'Receive direct briefs', desc: 'Accept campaign enquiries with budgets already funded into escrow.' },
      { img: 'creator-03-deliver-get-paid', title: 'Deliver & get paid', desc: 'Submit the work; approval releases the payout to your M-Pesa.' },
    ],
    features: [
      { icon: IconLayoutCards, title: 'Beautiful rate cards', desc: 'Curated designs that look professional from day one - no design skills needed.' },
      { icon: IconDeviceMobileDollar, title: 'M-Pesa & Airtel Money', desc: 'Built for East Africa. Payouts land on M-Pesa, Airtel Money or your bank.' },
      { icon: IconBrandWhatsapp, title: 'WhatsApp alerts', desc: 'Instant WhatsApp notifications when a brand enquires or a payment lands.' },
    ],
    faq: [
      { q: 'Is Creatorske free to join?', a: 'Yes. The Starter account is free forever - no subscription needed to build a rate card and start receiving briefs. Pro and Elite add more packages and payout methods.' },
      { q: 'How do I actually get paid?', a: 'Brands fund the campaign into escrow before work starts. Once you deliver and they approve, the payout goes straight to your M-Pesa - no invoicing or chasing.' },
      { q: 'What do I need to get verified?', a: 'A quick identity check plus a look at your audience stats. It protects you too: it keeps low-quality accounts off the directory brands are browsing.' },
      { q: 'What if a brand never approves?', a: 'Funds auto-release 14 days after delivery unless the brand opens a dispute, which a Creatorske admin decides on the evidence.' },
    ],
    ctaTitle: 'Ready to get paid on your terms?',
    ctaSub: 'Create your account and publish a rate card in minutes. Starter is free.',
    ctaLabel: 'Create your rate card',
  },
  brand: {
    eyebrow: 'For brands',
    headline: <>Find verified creators.<br />Launch with confidence.</>,
    sub: "Discover Kenya's verified creators, lock campaign budgets in escrow, and launch knowing your money and your brand are protected.",
    primary: { label: 'Browse creators', to: '/directory' },
    secondary: { label: 'Create a brand account', to: '/signup?role=brand' },
    stepsTitle: 'How brands launch campaigns',
    steps: [
      { img: 'brand-01-discover-talent', title: 'Discover talent', desc: 'Filter the directory by niche, platform, location and audience size.' },
      { img: 'brand-02-send-briefs-lock-funds', title: 'Send briefs & lock funds', desc: 'Enquire from a rate card and deposit the budget safely in escrow.' },
      { img: 'brand-03-approve-launch', title: 'Approve & launch', desc: 'Review drafts, approve delivery and release the payout.' },
    ],
    features: [
      { icon: IconShieldCheck, title: 'Verified profiles', desc: 'Identity and audience-stat checks before a creator is listed - the numbers you see are real.' },
      { icon: IconLockDollar, title: 'Escrow-protected budgets', desc: 'Nothing releases until you approve the work. Disputes are decided by a human.' },
      { icon: IconRocket, title: 'One place per campaign', desc: 'Brief, chat, deliverables, approval and invoices - without the WhatsApp sprawl.' },
    ],
    faq: [
      { q: 'Is Creatorske free to join?', a: "Yes. Browse the full creator directory at zero cost, and only fund escrow once you're ready to brief a campaign." },
      { q: 'How does escrow protect my budget?', a: "Your funds sit in escrow the moment you book. Nothing releases until you've reviewed the content and approved it, so you never pay for work you haven't seen." },
      { q: 'How are creators verified?', a: "Every profile goes through identity and audience-stat checks before it's listed, so the numbers on a rate card are the numbers you actually get." },
      { q: 'Can my whole team use one account?', a: 'Yes. Invite teammates with roles - members who book, admins who approve spend, finance who reconcile invoices.' },
    ],
    ctaTitle: 'Ready to launch with verified talent?',
    ctaSub: 'Browse the directory free, shortlist creators, and fund your first campaign when you are ready.',
    ctaLabel: 'Browse creators',
  },
};

const SOCIAL_LINKS = [
  { key: 'instagram', Icon: IconBrandInstagram, href: 'https://www.instagram.com/creatorske', label: 'Creatorske on Instagram' },
  { key: 'tiktok', Icon: IconBrandTiktok, href: 'https://www.tiktok.com/@creatorske', label: 'Creatorske on TikTok' },
  { key: 'linkedin', Icon: IconBrandLinkedin, href: 'https://www.linkedin.com/company/creatorske', label: 'Creatorske on LinkedIn' },
];

/* ── Scroll reveal: sections rise in as they enter the viewport ─────────── */
function useReveal(dep) {
  useEffect(() => {
    const items = document.querySelectorAll('.hp-reveal:not(.in-view)');
    if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      items.forEach((el) => el.classList.add('in-view'));
      return undefined;
    }
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in-view'); obs.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    items.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [dep]);
}

function RoleSwitch({ role, onChange, dark }) {
  return (
    <div className={`hp-role${dark ? ' hp-role--dark' : ''}`} role="tablist" aria-label="I am a">
      {[['creator', "I'm a creator", IconCamera], ['brand', "I'm a brand", IconBuildingStore]].map(([id, label, Icon]) => (
        <button key={id} type="button" role="tab" aria-selected={role === id} className={`hp-role__btn${role === id ? ' active' : ''}`} onClick={() => onChange(id)}>
          <Icon className="icon-sm" aria-hidden="true" />{label}
        </button>
      ))}
    </div>
  );
}

export default function HomePage() {
  usePageMeta(null, "Creatorske: the marketplace for Kenya's content creators and the brands that book them. Rate cards, verified profiles and M-Pesa escrow.");
  const navigate = useNavigate();
  const { hash } = useLocation();
  const [params, setParams] = useSearchParams();
  const [role, setRoleState] = useState(() => {
    const q = params.get('for');
    if (q === 'brand' || q === 'creator') return q;
    try { return localStorage.getItem(ROLE_KEY) === 'brand' ? 'brand' : 'creator'; } catch { return 'creator'; }
  });
  const c = COPY[role];
  const [openFaq, setOpenFaq] = useState(0);

  function setRole(next) {
    setRoleState(next);
    setOpenFaq(0);
    try { localStorage.setItem(ROLE_KEY, next); } catch { /* storage unavailable */ }
    const p = new URLSearchParams(params);
    if (next === 'creator') p.delete('for'); else p.set('for', next);
    setParams(p, { replace: true });
  }

  useReveal(role);

  // Other pages deep-link here as /#how-it-works; the router doesn't scroll
  // to hashes on its own, so do it once the section has rendered.
  useEffect(() => {
    if (!hash) return;
    const el = document.getElementById(hash.slice(1));
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [hash]);

  const footerLinks = {
    Product: [
      { label: 'Browse creators', action: () => navigate('/directory') },
      { label: 'Pricing', action: () => navigate('/pricing') },
      { label: 'How it works', action: () => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' }) },
    ],
    Account: [
      { label: 'Sign up', action: () => navigate('/signup') },
      { label: 'Log in', action: () => navigate('/login') },
    ],
    Company: [
      { label: 'Support', action: () => { window.location.href = 'mailto:hello@creatorske.com'; } },
      { label: 'Privacy policy', action: () => navigate('/privacy') },
      { label: 'Terms of service', action: () => navigate('/terms') },
    ],
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--page-bg)' }}>
      <style>{`
        @keyframes floatUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes arrowNudge { 0%,100% { transform:translateX(0); } 50% { transform:translateX(4px); } }
        .hp-nav-link { font-size:13px; color:var(--grey-600); padding:var(--space-8) var(--space-12); border-radius:8px; cursor:pointer; font-weight:500; background:none; border:none; font-family:var(--font-body); transition:all .15s; }
        .hp-nav-link:hover { color:var(--black); background:var(--grey-50); }
        .hp-btn-ghost { background:transparent; color:var(--grey-600); border-radius:8px; font-size:14px; padding:var(--space-8) var(--space-20); border:0.5px solid var(--grey-200); cursor:pointer; font-family:var(--font-body); font-weight:500; transition:all .15s; display:inline-flex; align-items:center; gap:var(--space-8); }
        .hp-btn-ghost:hover { color:var(--black); border-color:var(--grey-400); background:var(--grey-50); }
        .hp-btn-ghost.lg { padding:var(--space-12) var(--space-24); font-size:15px; }
        .hp-btn-ghost.on-dark { color:rgba(255,255,255,0.85); border-color:rgba(255,255,255,0.25); }
        .hp-btn-ghost.on-dark:hover { color:#fff; border-color:rgba(255,255,255,0.6); background:rgba(255,255,255,0.08); }
        .hp-btn-primary { background:var(--black); color:var(--white); border-radius:12px; font-size:15px; padding:var(--space-16) var(--space-32); border:none; cursor:pointer; font-family:var(--font-body); font-weight:500; transition:all .15s; display:inline-flex; align-items:center; gap:var(--space-8); }
        .hp-btn-primary:hover { transform:translateY(-1px); box-shadow:0 4px 16px rgba(0,0,0,.12); }
        .hp-btn-primary.on-dark { background:#fff; color:#0D0D0D; }
        .hp-btn-primary .nudge { animation: arrowNudge 1.6s ease-in-out infinite; }
        .hp-btn-purple { background:var(--purple-600); color:#fff; border-radius:8px; font-size:14px; padding:var(--space-12) var(--space-24); border:none; cursor:pointer; font-family:var(--font-body); font-weight:500; transition:all .15s; display:inline-flex; align-items:center; gap:var(--space-8); }
        .hp-btn-purple.sm { font-size:13px; padding:var(--space-8) var(--space-16); }
        .hp-btn-purple:hover { background:var(--purple-700); transform:translateY(-1px); box-shadow:0 4px 16px rgba(84,69,232,.3); }

        /* role switch */
        .hp-role { display:inline-flex; gap:var(--space-4); padding:var(--space-4); border-radius:var(--radius-pill); background:var(--grey-50); border:0.5px solid var(--grey-100); }
        .hp-role__btn { display:inline-flex; align-items:center; gap:var(--space-8); padding:var(--space-8) var(--space-16); border-radius:var(--radius-pill); border:none; background:none; font-family:var(--font-body); font-size:13px; font-weight:500; color:var(--grey-500); cursor:pointer; transition:all .15s; }
        .hp-role__btn.active { background:var(--white); color:var(--black); box-shadow:var(--shadow-sm); }
        .hp-role--dark { background:rgba(255,255,255,0.08); border-color:rgba(255,255,255,0.15); }
        .hp-role--dark .hp-role__btn { color:rgba(255,255,255,0.6); }
        .hp-role--dark .hp-role__btn.active { background:#fff; color:#0D0D0D; }

        /* hero: black with brand-purple streaks (from the waitlist page) */
        .hp-hero { position:relative; overflow:hidden; background:#000; color:#fff; }
        .hp-hero__bg { position:absolute; inset:0; pointer-events:none; }
        .hp-hero__base { position:absolute; inset:0; background:radial-gradient(100% 100% at 0% 0%, #2E2E2E 0%, #000 100%); -webkit-mask:radial-gradient(125% 100% at 0% 0%, #000 0%, rgba(0,0,0,.22) 88%, transparent 100%); mask:radial-gradient(125% 100% at 0% 0%, #000 0%, rgba(0,0,0,.22) 88%, transparent 100%); }
        .hp-streak { position:absolute; inset:0; opacity:.22; transform:skewX(45deg); background:linear-gradient(#7C3AED 0%, rgba(124,58,237,0) 100%); }
        .hp-streak-1 { -webkit-mask:linear-gradient(90deg, transparent 0%, #000 20%, transparent 36%, #000 55%, rgba(0,0,0,.13) 67%, #000 78%, transparent 97%); mask:linear-gradient(90deg, transparent 0%, #000 20%, transparent 36%, #000 55%, rgba(0,0,0,.13) 67%, #000 78%, transparent 97%); }
        .hp-streak-2 { -webkit-mask:linear-gradient(90deg, transparent 11%, #000 25%, rgba(0,0,0,.55) 41%, rgba(0,0,0,.13) 67%, #000 78%, transparent 97%); mask:linear-gradient(90deg, transparent 11%, #000 25%, rgba(0,0,0,.55) 41%, rgba(0,0,0,.13) 67%, #000 78%, transparent 97%); }
        .hp-streak-3 { -webkit-mask:linear-gradient(90deg, transparent 9%, #000 20%, rgba(0,0,0,.55) 28%, rgba(0,0,0,.42) 40%, #000 48%, rgba(0,0,0,.27) 54%, rgba(0,0,0,.13) 78%, #000 88%, transparent 97%); mask:linear-gradient(90deg, transparent 9%, #000 20%, rgba(0,0,0,.55) 28%, rgba(0,0,0,.42) 40%, #000 48%, rgba(0,0,0,.27) 54%, rgba(0,0,0,.13) 78%, #000 88%, transparent 97%); }
        .hp-hero__dots { position:absolute; inset:0; opacity:.15; background-image:radial-gradient(circle at 1px 1px, rgba(255,255,255,.5) 1px, transparent 0); background-size:20px 20px; }
        .hp-hero__grid { position:relative; z-index:1; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding:var(--space-80) var(--gutter-public); min-height:calc(100vh - 60px); }
        .hp-hero__eyebrow { display:block; font-size:12px; font-weight:600; letter-spacing:.09em; text-transform:uppercase; color:rgba(255,255,255,.6); margin-bottom:var(--space-20); }
        .hp-hero h1 { font-family:var(--font-display); font-size:clamp(36px,5vw,64px); line-height:1.05; letter-spacing:-.025em; color:#fff; margin:0 auto var(--space-20); max-width:820px; text-wrap:balance; }
        .hp-hero__sub { font-size:17px; line-height:1.75; color:rgba(255,255,255,.72); max-width:560px; margin:0 auto var(--space-32); }
        .hp-hero__proof { margin-top:var(--space-40); padding-top:var(--space-24); border-top:0.5px solid rgba(255,255,255,.12); display:flex; align-items:center; justify-content:center; gap:var(--space-16); font-size:13px; color:rgba(255,255,255,.55); }

        /* sections */
        .hp-section { padding:var(--space-96) var(--gutter-public); }
        .hp-section--paper { background:var(--white); border-top:0.5px solid var(--grey-100); border-bottom:0.5px solid var(--grey-100); }
        .hp-head { text-align:center; max-width:640px; margin:0 auto var(--space-48); }
        .hp-head .eyebrow { justify-content:center; margin-bottom:var(--space-12); }
        .hp-head h2 { font-family:var(--font-display); font-size:clamp(26px,3vw,36px); font-weight:600; letter-spacing:-.02em; line-height:1.15; color:var(--black); margin:0 0 var(--space-12); }
        .hp-head p { font-size:15px; color:var(--grey-500); line-height:1.7; margin:0; }
        .hp-wrap { max-width:1080px; margin:0 auto; }

        /* steps */
        .hp-steps { display:grid; grid-template-columns:repeat(3,1fr); gap:var(--space-20); }
        .hp-step { display:flex; flex-direction:column; gap:var(--space-16); }
        .hp-step__ill { border-radius:var(--radius-xl); aspect-ratio:4/3; overflow:hidden; transition:transform .2s; }
        .hp-step:hover .hp-step__ill { transform:translateY(-3px); }
        .hp-step__ill img { width:100%; height:100%; object-fit:cover; display:block; }
        .hp-step__body { padding:0 var(--space-4); display:flex; flex-direction:column; gap:var(--space-8); }
        .hp-step__num { font-size:12px; font-weight:700; letter-spacing:.08em; color:var(--purple-600); }
        .hp-step h3 { font-family:var(--font-display); font-size:16px; font-weight:600; color:var(--black); margin:0; }
        .hp-step p { font-size:14px; color:var(--grey-500); line-height:1.6; margin:0; }

        /* features */
        .hp-features { display:grid; grid-template-columns:repeat(3,1fr); gap:var(--space-24); }
        .hp-feature { background:var(--white); border:0.5px solid var(--grey-100); border-radius:16px; padding:var(--space-24); transition:all .15s; }
        .hp-feature:hover { box-shadow:var(--shadow-md); transform:translateY(-2px); }
        .hp-feature__icon { width:44px; height:44px; border-radius:12px; background:var(--purple-50); border:0.5px solid var(--purple-100); display:flex; align-items:center; justify-content:center; color:var(--purple-500); margin-bottom:var(--space-16); }

        /* faq */
        .hp-faq { border-top:0.5px solid var(--grey-100); }
        .hp-faq__item { border-bottom:0.5px solid var(--grey-100); }
        .hp-faq__q { width:100%; background:none; border:none; color:var(--black); display:flex; align-items:center; justify-content:space-between; gap:var(--space-16); padding:var(--space-20) var(--space-8); text-align:left; font-family:var(--font-body); font-size:15.5px; font-weight:600; cursor:pointer; }
        .hp-faq__q svg { color:var(--grey-400); transition:transform .25s, color .25s; flex-shrink:0; }
        .hp-faq__item.open .hp-faq__q svg { transform:rotate(45deg); color:var(--purple-600); }
        .hp-faq__a { max-height:0; overflow:hidden; transition:max-height .3s ease; }
        .hp-faq__item.open .hp-faq__a { max-height:320px; }
        .hp-faq__a p { padding:0 var(--space-8) var(--space-20); color:var(--grey-600); font-size:14.5px; line-height:1.7; margin:0; }

        /* closing banner */
        .hp-cta { border-radius:var(--radius-2xl); padding:var(--space-64) var(--space-32); background:linear-gradient(135deg, var(--purple-800), var(--purple-500)); color:#fff; text-align:center; display:flex; flex-direction:column; align-items:center; gap:var(--space-16); }
        .hp-cta h2 { font-family:var(--font-display); font-size:clamp(26px,3vw,36px); font-weight:600; letter-spacing:-.02em; color:#fff; margin:0; }
        .hp-cta p { color:rgba(255,255,255,.85); font-size:16px; max-width:480px; margin:0; line-height:1.6; }
        .hp-cta .hp-btn-primary { background:#fff; color:var(--purple-800); }

        /* reveal */
        .hp-reveal { opacity:0; transform:translateY(16px); transition:opacity .6s ease, transform .6s ease; }
        .hp-reveal.in-view { opacity:1; transform:none; }
        .reduce-motion .hp-reveal { opacity:1; transform:none; transition:none; }

        @media(max-width:700px){
          .hp-steps, .hp-features { grid-template-columns:1fr; }
          .hp-step__ill { max-width:420px; }
        }
        @media(max-width:900px){
          .hp-hero__grid { min-height:0; padding:var(--space-64) var(--gutter-public); }
          .hp-navbar-links { display:none !important; }
          .hp-section { padding:var(--space-64) var(--gutter-public); }
          .footer-top-grid { grid-template-columns:1fr 1fr !important; }
        }
      `}</style>

      {/* ══ NAVBAR ══════════════════════════════════════════════════════════ */}
      <nav style={{ background: 'color-mix(in srgb, var(--white) 92%, transparent)', backdropFilter: 'blur(14px)', borderBottom: '0.5px solid var(--grey-100)', height: 60, display: 'flex', alignItems: 'center', padding: '0 var(--gutter-public)', position: 'sticky', top: 0, zIndex: 100, justifyContent: 'space-between', flexShrink: 0 }}>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600, letterSpacing: '-0.01em', cursor: 'pointer', color: 'var(--black)' }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          Creatorske<span style={{ color: 'var(--purple-500)' }}>.</span>
        </span>
        <div className="hp-navbar-links" style={{ display: 'flex', gap: 'var(--space-4)' }}>
          <button className="hp-nav-link" onClick={() => navigate('/directory')}>Browse creators</button>
          <button className="hp-nav-link" onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}>How it works</button>
          <button className="hp-nav-link" onClick={() => navigate('/pricing')}>Pricing</button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-8)' }}>
          <button className="hp-btn-ghost" onClick={() => navigate('/login')}>Log in</button>
          <button className="hp-btn-purple sm" onClick={() => navigate(role === 'brand' ? '/signup?role=brand' : '/signup')}>Get started</button>
        </div>
      </nav>

      {/* ══ HERO ════════════════════════════════════════════════════════════ */}
      <section className="hp-hero">
        <div className="hp-hero__bg" aria-hidden="true">
          <div className="hp-hero__base" />
          <div className="hp-streak hp-streak-1" /><div className="hp-streak hp-streak-2" /><div className="hp-streak hp-streak-3" />
          <div className="hp-hero__dots" />
        </div>
        <div className="hp-hero__grid">
          <div style={{ width: '100%', maxWidth: 820 }}>
            <div style={{ marginBottom: 'var(--space-24)' }}><RoleSwitch role={role} onChange={setRole} dark /></div>
            <div key={role} className="page-enter">
              <div className="hp-hero__eyebrow">{c.eyebrow}</div>
              <h1>{c.headline}</h1>
              <p className="hp-hero__sub">{c.sub}</p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-12)', flexWrap: 'wrap' }}>
                <button className="hp-btn-primary on-dark" onClick={() => navigate(c.primary.to)}>{c.primary.label} <IconArrowRight className="icon-sm nudge" aria-hidden="true" /></button>
                <button className="hp-btn-ghost lg on-dark" onClick={() => navigate(c.secondary.to)}>{c.secondary.label}</button>
              </div>
            </div>
            <div className="hp-hero__proof">
              <div style={{ display: 'flex' }}>
                {['linear-gradient(135deg,#6B5FF4,#3D2FD6)', 'linear-gradient(135deg,#F5A623,#C2410C)', 'linear-gradient(135deg,#5445E8,#2C1FB8)', 'linear-gradient(135deg,#10B981,#047857)'].map((g, i) => (
                  <div key={i} style={{ width: 30, height: 30, borderRadius: '50%', border: '2px solid #000', marginLeft: i === 0 ? 0 : 'calc(-1 * var(--space-8))', background: g, zIndex: 4 - i }} />
                ))}
              </div>
              <span>{role === 'brand' ? <>Trusted by brands booking <strong style={{ color: '#fff' }}>2,400+</strong> verified creators</> : <>Joined by <strong style={{ color: '#fff' }}>2,400+</strong> creators across East Africa</>}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ═══════════════════════════════════════════════════ */}
      <section className="hp-section hp-section--paper" id="how-it-works">
        <div className="hp-wrap">
          <div className="hp-head hp-reveal">
            <span className="eyebrow">How it works</span>
            <h2>{c.stepsTitle}</h2>
            <p>{role === 'brand' ? 'Three steps from a shortlist to approved, paid work.' : 'Three steps from a blank profile to money on M-Pesa.'}</p>
          </div>
          <div className="hp-steps" key={`steps-${role}`}>
            {c.steps.map((s, i) => (
              <div key={s.title} className="hp-step hp-reveal">
                <div className="hp-step__ill"><img src={IMG(s.img)} alt="" loading="lazy" /></div>
                <div className="hp-step__body">
                  <span className="hp-step__num">STEP 0{i + 1}</span>
                  <h3>{s.title}</h3>
                  <p>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FEATURES ═══════════════════════════════════════════════════════ */}
      <section className="hp-section">
        <div className="hp-wrap">
          <div className="hp-features" key={`features-${role}`}>
            {c.features.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="hp-feature hp-reveal">
                  <div className="hp-feature__icon"><Icon className="icon-lg" aria-hidden="true" /></div>
                  <div className="card-title" style={{ marginBottom: 'var(--space-8)' }}>{f.title}</div>
                  <div style={{ fontSize: 13.5, color: 'var(--grey-500)', lineHeight: 1.65 }}>{f.desc}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══ FAQ ════════════════════════════════════════════════════════════ */}
      <section className="hp-section hp-section--paper" id="faq">
        <div className="hp-wrap">
          <div className="hp-head hp-reveal">
            <span className="eyebrow">FAQ</span>
            <h2>Frequently asked questions</h2>
          </div>
          <div className="hp-faq hp-reveal" key={`faq-${role}`}>
            {c.faq.map((f, i) => (
              <div key={f.q} className={`hp-faq__item${openFaq === i ? ' open' : ''}`}>
                <button type="button" className="hp-faq__q" aria-expanded={openFaq === i} aria-controls={`faq-${i}`} onClick={() => setOpenFaq(openFaq === i ? -1 : i)}>
                  {f.q}<IconPlus className="icon-md" aria-hidden="true" />
                </button>
                <div className="hp-faq__a" id={`faq-${i}`}><p>{f.a}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CLOSING CTA ════════════════════════════════════════════════════ */}
      <section className="hp-section" style={{ paddingTop: 'var(--space-64)' }}>
        <div className="hp-wrap">
          <div className="hp-cta hp-reveal" key={`cta-${role}`}>
            <h2>{c.ctaTitle}</h2>
            <p>{c.ctaSub}</p>
            <div style={{ marginTop: 'var(--space-8)' }}>
              <button className="hp-btn-primary" onClick={() => navigate(c.primary.to)}>{c.ctaLabel} <IconArrowRight className="icon-sm nudge" aria-hidden="true" /></button>
            </div>
          </div>
        </div>
      </section>

      {/* ══ FOOTER ═════════════════════════════════════════════════════════ */}
      <footer className="theme-fixed-dark" style={{ background: 'var(--black)', flexShrink: 0 }}>
        <div className="footer-top-grid" style={{ padding: 'var(--space-48) var(--gutter-public) var(--space-40)', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 'var(--space-40)', alignItems: 'start' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 600, color: 'var(--white)', marginBottom: 'var(--space-12)' }}>
              Creatorske<span style={{ color: 'var(--purple-400)' }}>.</span>
            </div>
            <div style={{ fontSize: 13, color: 'var(--grey-500)', lineHeight: 1.7, maxWidth: 240, marginBottom: 'var(--space-24)' }}>
              Where Kenya's creators and brands build campaigns - rate cards, verified profiles and M-Pesa escrow.
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-8)' }}>
              {SOCIAL_LINKS.map(({ key, Icon, href, label }) => (
                <a key={key} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} title={label} className="hp-social"
                  style={{ width: 34, height: 34, borderRadius: 8, border: '0.5px solid var(--grey-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--grey-400)', transition: 'all .15s', textDecoration: 'none' }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--grey-400)'; e.currentTarget.style.color = 'var(--white)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--grey-700)'; e.currentTarget.style.color = 'var(--grey-400)'; }}
                >
                  <Icon className="icon-md" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>
          {Object.entries(footerLinks).map(([col, links]) => (
            <div key={col}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--grey-600)', marginBottom: 'var(--space-16)' }}>{col}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-12)' }}>
                {links.map((l) => (
                  <button key={l.label} type="button" onClick={l.action} style={{ fontSize: 13, color: 'var(--grey-400)', cursor: 'pointer', transition: 'color .15s', background: 'none', border: 'none', padding: 0, textAlign: 'left', fontFamily: 'inherit' }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--white)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--grey-400)'; }}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="footer-bottom-inner" style={{ padding: 'var(--space-20) var(--gutter-public)', borderTop: '0.5px solid var(--grey-800)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-8)' }}>
          <div style={{ fontSize: 12, color: 'var(--grey-600)' }}>© 2026 Creatorske Ltd. Nairobi, Kenya.</div>
          <div style={{ display: 'flex', gap: 'var(--space-20)' }}>
            {[{ label: 'Privacy policy', path: '/privacy' }, { label: 'Terms of service', path: '/terms' }].map((l) => (
              <button key={l.label} type="button" onClick={() => navigate(l.path)} style={{ fontSize: 12, color: 'var(--grey-600)', cursor: 'pointer', background: 'none', border: 'none', padding: 0, fontFamily: 'inherit' }}>{l.label}</button>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
