import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { usePageMeta } from '@/lib/usePageMeta';
import {
  IconLayoutCards,
  IconDeviceMobileDollar,
  IconBrandWhatsapp,
  IconArrowRight,
  IconStarFilled,
  IconBrandInstagram,
  IconBrandTiktok,
  IconBrandLinkedin,
} from '@tabler/icons-react';

// ── Inline styles as a single token sheet ──────────────────────────────────
const css = {
  // Navbar
  navbar: {
    background: 'color-mix(in srgb, var(--white) 92%, transparent)',
    backdropFilter: 'blur(14px)',
    borderBottom: '0.5px solid var(--grey-100)',
    height: 60,
    display: 'flex',
    alignItems: 'center',
    padding: '0 var(--gutter-public)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    justifyContent: 'space-between',
    flexShrink: 0,
  },
};

// ── Sub-components (no new files, all inline) ─────────────────────────────

function RcMiniCard({ initials, name, handle, followers, eng, rating, avail, gradient, delay }) {
  const availMap = {
    available: { label: 'Available now', color: '#639922' },
    limited:   { label: 'Limited slots',  color: '#BA7517' },
    booked:    { label: 'Fully booked',   color: '#9ca3af' },
  };
  const a = availMap[avail] || availMap.available;

  return (
    <div
      style={{
        background: 'var(--white)',
        border: '0.5px solid var(--grey-100)',
        borderRadius: 16,
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        animation: `floatUp 0.6s cubic-bezier(.16,1,.3,1) ${delay}s both`,
      }}
    >
      {/* top */}
      <div style={{ padding: 'var(--space-16) var(--space-16) var(--space-12)', borderBottom: '0.5px solid var(--grey-100)', display: 'flex', alignItems: 'center', gap: 'var(--space-12)' }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 600, color: '#fff', flexShrink: 0 }}>
          {initials}
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600, color: 'var(--black)' }}>{name}</div>
          <div style={{ fontSize: 11, color: 'var(--grey-400)' }}>{handle}</div>
        </div>
      </div>
      {/* stats */}
      <div style={{ display: 'flex', borderBottom: '0.5px solid var(--grey-100)' }}>
        {[['Followers', followers], ['Eng.', eng], ['Rating', rating]].map(([lbl, val]) => (
          <div key={lbl} style={{ flex: 1, padding: 'var(--space-8) var(--space-12)', textAlign: 'center', borderRight: '0.5px solid var(--grey-100)' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600, color: 'var(--black)', display: 'inline-flex', alignItems: 'center', gap: 'var(--space-4)' }}>
              {val}
              {lbl === 'Rating' && <IconStarFilled className="icon-xs" style={{ color: 'var(--black)' }} />}
            </div>
            <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--grey-400)', marginTop: 'var(--space-2)' }}>{lbl}</div>
          </div>
        ))}
        <div style={{ width: 0 }} /> {/* kill last border */}
      </div>
      {/* footer */}
      <div style={{ padding: 'var(--space-12) var(--space-16)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-4)', fontSize: 11, color: 'var(--grey-500)' }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: a.color, display: 'inline-block' }} />
          {a.label}
        </div>
        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--purple-600)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          Enquire <IconArrowRight className="icon-xs" />
        </span>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <div
      style={{
        background: 'var(--white)',
        border: '0.5px solid var(--grey-100)',
        borderRadius: 16,
        padding: 'var(--space-24)',
        transition: 'all 0.15s',
        cursor: 'default',
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}
    >
      <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--purple-50)', border: '0.5px solid var(--purple-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--purple-500)', marginBottom: 'var(--space-16)' }}>
        {icon}
      </div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, color: 'var(--black)', marginBottom: 'var(--space-8)' }}>{title}</div>
      <div style={{ fontSize: 13, color: 'var(--grey-500)', lineHeight: 1.65 }}>{desc}</div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
// Footer social profiles. Kept in one place so the real handles can be set
// without touching markup; they open in a new tab like any external link.
const SOCIAL_LINKS = [
  { key: 'instagram', Icon: IconBrandInstagram, href: 'https://www.instagram.com/creatorske', label: 'Creatorske on Instagram' },
  { key: 'tiktok',    Icon: IconBrandTiktok,    href: 'https://www.tiktok.com/@creatorske',   label: 'Creatorske on TikTok' },
  { key: 'linkedin',  Icon: IconBrandLinkedin,  href: 'https://www.linkedin.com/company/creatorske', label: 'Creatorske on LinkedIn' },
];

export default function HomePage() {
  usePageMeta(null, "Creatorske: the marketplace for Kenya's content creators. Build a shareable rate card, get discovered by brands, and get paid via M-Pesa.");
  const navigate = useNavigate();
  const { hash } = useLocation();

  // Other pages deep-link here as /#how-it-works; the router doesn't scroll
  // to hashes on its own, so do it once the section has rendered.
  useEffect(() => {
    if (!hash) return;
    const el = document.getElementById(hash.slice(1));
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [hash]);

  const creators = [
    { initials: 'AO', name: 'Amara Osei',   handle: '@amaracreates · Lifestyle', followers: '48K',  eng: '4.8%', rating: '4.9', avail: 'available', gradient: 'linear-gradient(135deg,#6B5FF4,#1E1480)', delay: 0    },
    { initials: 'JK', name: 'James Kiema',  handle: '@jkiema · Tech',            followers: '120K', eng: '4.1%', rating: '4.9', avail: 'limited',   gradient: 'linear-gradient(135deg,#0D0D0D,#333)',    delay: 0.1  },
    { initials: 'NW', name: 'Njeri Wanjiku',handle: '@njeriwanjiku · Fashion',   followers: '22K',  eng: '8.7%', rating: '4.7', avail: 'booked',    gradient: 'linear-gradient(135deg,#5445E8,#2C1FB8)', delay: 0.2  },
  ];

  const steps = [
    { title: 'Create your account',   desc: 'Sign up with email in seconds. No credit card needed to get started.' },
    { title: 'Build your rate card',  desc: 'Add your platforms, packages, and pricing. Choose a design that fits your brand personality.' },
    { title: 'Publish and share',     desc: 'Get a clean, shareable link. Send it to brands or list yourself in the creator directory.' },
    { title: 'Get paid',              desc: 'Accept enquiries and payments via M-Pesa, Airtel Money, or bank transfer, all in one place.' },
  ];

  const features = [
    { icon: <IconLayoutCards className="icon-lg" />,         title: 'Beautiful rate cards',   desc: 'Choose from curated designs. Your rate card looks professional from day one, no design skills needed.' },
    { icon: <IconDeviceMobileDollar className="icon-lg" />,  title: 'M-Pesa & Airtel Money',  desc: 'Built for East Africa. Accept payments directly through M-Pesa, Airtel Money, or bank transfer.' },
    { icon: <IconBrandWhatsapp className="icon-lg" />,       title: 'WhatsApp notifications', desc: 'Get instant WhatsApp alerts when a brand submits an enquiry or payment is received.' },
  ];

  const footerLinks = {
    Product: [
      { label: 'Browse creators', action: () => navigate('/directory') },
      { label: 'Pricing',         action: () => navigate('/pricing')   },
      { label: 'How it works',    action: () => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' }) },
    ],
    Account: [
      { label: 'Sign up', action: () => navigate('/signup') },
      { label: 'Log in',  action: () => navigate('/login')  },
    ],
    Company: [
      { label: 'Support',         action: () => {} },
      { label: 'Privacy policy',  action: () => navigate('/privacy') },
      { label: 'Terms of service',action: () => navigate('/terms')   },
    ],
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--page-bg)' }}>
      {/* ── keyframes injected once ── */}
      <style>{`
        @keyframes floatUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        .hp-nav-link { font-size:13px; color:var(--grey-600); padding:var(--space-8) var(--space-12); border-radius:8px; cursor:pointer; font-weight:500; background:none; border:none; font-family:var(--font-body); transition:all .15s; }
        .hp-nav-link:hover { color:var(--black); background:var(--grey-50); }
        .hp-nav-link.active { color:var(--black); }
        .hp-btn-ghost { background:transparent; color:var(--grey-600); border-radius:8px; font-size:14px; padding:var(--space-8) var(--space-20); border:0.5px solid var(--grey-200); cursor:pointer; font-family:var(--font-body); font-weight:500; transition:all .15s; }
        .hp-btn-ghost:hover { color:var(--black); border-color:var(--grey-400); background:var(--grey-50); }
        .hp-btn-ghost.lg { padding:var(--space-12) var(--space-24); }
        .hp-btn-primary { background:var(--black); color:var(--white); border-radius:12px; font-size:15px; padding:var(--space-16) var(--space-32); border:none; cursor:pointer; font-family:var(--font-body); font-weight:500; transition:all .15s; }
        .hp-btn-primary:hover { background:var(--grey-800); transform:translateY(-1px); box-shadow:0 4px 16px rgba(0,0,0,.12); }
        .hp-btn-purple { background:var(--purple-600); color:#fff; border-radius:8px; font-size:14px; padding:var(--space-12) var(--space-24); border:none; cursor:pointer; font-family:var(--font-body); font-weight:500; transition:all .15s; display:inline-flex; align-items:center; gap:var(--space-8); }
        .hp-btn-purple.sm { font-size:13px; padding:var(--space-8) var(--space-16); }
        .hp-btn-purple:hover { background:var(--purple-700); transform:translateY(-1px); box-shadow:0 4px 16px rgba(84,69,232,.3); }
        .rc-mini-stat:last-child { border-right:none !important; }
        @media(max-width:900px){
          .home-hero-grid { grid-template-columns:1fr !important; }
          .home-right-panel { display:none !important; }
          .home-how-grid { grid-template-columns:1fr !important; }
          .how-left-panel { border-right:none !important; border-bottom:0.5px solid var(--grey-100) !important; padding:var(--space-48) var(--gutter-public) !important; }
          .how-right-panel { padding:var(--space-40) var(--gutter-public) !important; }
          .home-features-grid { grid-template-columns:1fr !important; padding:var(--space-40) var(--gutter-public) !important; }
          .home-left-panel { padding:var(--space-64) var(--gutter-public) !important; }
          .navbar-inner { padding:0 var(--gutter-public) !important; }
          .hp-navbar-links { display:none !important; }
          .footer-top-grid { grid-template-columns:1fr 1fr !important; padding:var(--space-40) var(--gutter-public) var(--space-32) !important; }
          .footer-bottom-inner { padding:var(--space-16) var(--gutter-public) !important; }
        }
      `}</style>

      {/* ══ NAVBAR ══════════════════════════════════════════════════════════ */}
      <nav style={{ ...css.navbar }} className="navbar-inner">
        <span
          style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600, letterSpacing: '-0.01em', cursor: 'pointer', color: 'var(--black)', textDecoration: 'none' }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          Creatorske<span style={{ color: 'var(--purple-500)' }}>.</span>
        </span>

        <div className="hp-navbar-links" style={{ display: 'flex', gap: 'var(--space-4)' }}>
          <button className="hp-nav-link" onClick={() => navigate('/directory')}>Browse creators</button>
          <button className="hp-nav-link" onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}>How it works</button>
          <button className="hp-nav-link" onClick={() => navigate('/pricing')}>Pricing</button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-8)' }}>
          <button className="hp-btn-ghost" onClick={() => navigate('/login')}>Log in</button>
          <button className="hp-btn-purple sm" onClick={() => navigate('/signup')}>Get started</button>
        </div>
      </nav>

      {/* ══ HERO ════════════════════════════════════════════════════════════ */}
      <div className="home-hero-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', flex: 1, minHeight: 'calc(100vh - 60px)' }}>
        {/* LEFT */}
        <div className="home-left-panel" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 'var(--space-80) var(--gutter-public)', background: 'var(--white)' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(40px,4.5vw,60px)', lineHeight: 1.05, letterSpacing: '-0.025em', marginBottom: 'var(--space-20)', color: 'var(--black)' }}>
            Your rates,<br />
            beautifully<br />
            presented to<br />
            every brand.
          </h1>

          <p style={{ fontSize: 16, lineHeight: 1.75, color: 'var(--grey-500)', maxWidth: 400, marginBottom: 'var(--space-40)' }}>
            Creatorske gives content creators a professional, shareable rate card that makes brands take you seriously. Set your packages, show your reach, and get paid.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-12)', flexWrap: 'wrap' }}>
            <button className="hp-btn-primary" onClick={() => navigate('/signup')}>Build your rate card</button>
            <button className="hp-btn-ghost lg" onClick={() => navigate('/directory')}>Browse creators</button>
          </div>

          {/* social proof */}
          <div style={{ marginTop: 'var(--space-48)', paddingTop: 'var(--space-32)', borderTop: '0.5px solid var(--grey-100)', display: 'flex', alignItems: 'center', gap: 'var(--space-16)' }}>
            <div style={{ display: 'flex' }}>
              {[
                'linear-gradient(135deg,#6B5FF4,#3D2FD6)',
                'linear-gradient(135deg,#0D0D0D,#333)',
                'linear-gradient(135deg,#5445E8,#2C1FB8)',
                'linear-gradient(135deg,#333,#111)',
              ].map((g, i) => (
                <div key={i} style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid var(--white)', marginLeft: i === 0 ? 0 : 'calc(-1 * var(--space-8))', background: g, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, color: '#fff', zIndex: 4 - i }} />
              ))}
            </div>
            <div style={{ fontSize: 13, color: 'var(--grey-500)' }}>
              Joined by <strong style={{ color: 'var(--black)' }}>2,400+</strong> creators across East Africa
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="home-right-panel" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: 'var(--space-64) var(--gutter-public)', background: 'var(--page-bg)', gap: 'var(--space-12)', position: 'relative', overflow: 'hidden' }}>
          {/* deco blobs */}
          <div style={{ position: 'absolute', top: -80, right: -80, width: 320, height: 320, borderRadius: '50%', background: 'var(--purple-100)', opacity: 0.5, pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: -60, left: -40, width: 200, height: 200, borderRadius: '50%', background: 'var(--purple-50)', opacity: 0.8, pointerEvents: 'none' }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-12)', width: '100%', maxWidth: 300, position: 'relative', zIndex: 1 }}>
            {creators.map((c, i) => (
              <div key={c.initials} style={{ marginLeft: i === 1 ? 'var(--space-24)' : i === 2 ? 'var(--space-12)' : 0 }}>
                <RcMiniCard {...c} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══ HOW IT WORKS ════════════════════════════════════════════════════ */}
      <div id="how-it-works" className="home-how-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderTop: '0.5px solid var(--grey-100)', background: 'var(--white)' }}>
        <div className="how-left-panel" style={{ padding: 'var(--space-80) var(--gutter-public)', borderRight: '0.5px solid var(--grey-100)' }}>
          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--purple-600)', marginBottom: 'var(--space-12)' }}>How it works</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 34, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.2, color: 'var(--black)', marginBottom: 'var(--space-16)' }}>
            From sign-up to<br />booked, in minutes.
          </h2>
          <p style={{ fontSize: 14, color: 'var(--grey-500)', lineHeight: 1.75, maxWidth: 360, marginBottom: 'var(--space-32)' }}>
            We stripped away everything complex. Creatorske gives you a clean builder, a beautiful published page, and a direct line to brand enquiries.
          </p>
          <button className="hp-btn-purple" onClick={() => navigate('/signup')}>
            Start for free <IconArrowRight className="icon-sm" />
          </button>
        </div>

        <div className="how-right-panel" style={{ padding: 'var(--space-80) var(--gutter-public)', display: 'flex', flexDirection: 'column', gap: 0 }}>
          {steps.map((s, i) => (
            <div key={i} style={{ display: 'flex', gap: 'var(--space-16)', padding: 'var(--space-20) 0', borderBottom: i < steps.length - 1 ? '0.5px solid var(--grey-100)' : 'none' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'color-mix(in srgb, var(--black) 24%, var(--white))', minWidth: 28, lineHeight: 1.2, flexShrink: 0 }}>
                {String(i + 1).padStart(2, '0')}
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--black)', marginBottom: 'var(--space-4)' }}>{s.title}</div>
                <div style={{ fontSize: 13, color: 'var(--grey-500)', lineHeight: 1.65 }}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ══ FEATURES STRIP ══════════════════════════════════════════════════ */}
      <div className="home-features-grid" style={{ background: 'var(--page-bg)', borderTop: '0.5px solid var(--grey-100)', padding: 'var(--space-64) var(--gutter-public)', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 'var(--space-32)' }}>
        {features.map(f => <FeatureCard key={f.title} {...f} />)}
      </div>

      {/* ══ FOOTER ══════════════════════════════════════════════════════════ */}
      <footer className="theme-fixed-dark" style={{ background: 'var(--black)', flexShrink: 0 }}>
        <div className="footer-top-grid" style={{ padding: 'var(--space-48) var(--gutter-public) var(--space-40)', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 'var(--space-40)', alignItems: 'start' }}>
          {/* brand col */}
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 600, color: 'var(--white)', marginBottom: 'var(--space-12)' }}>
              Creatorske<span style={{ color: 'var(--purple-400)' }}>.</span>
            </div>
            <div style={{ fontSize: 13, color: 'var(--grey-500)', lineHeight: 1.7, maxWidth: 240, marginBottom: 'var(--space-24)' }}>
              The professional rate card platform for East African content creators.
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-8)' }}>
              {SOCIAL_LINKS.map(({ key, Icon, href, label }) => (
                <a key={key} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} title={label}
                  style={{ width: 34, height: 34, borderRadius: 8, border: '0.5px solid var(--grey-700)', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--grey-400)', transition: 'all .15s', textDecoration: 'none' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--grey-400)'; e.currentTarget.style.color = 'var(--white)'; e.currentTarget.style.background = 'var(--grey-800)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--grey-700)'; e.currentTarget.style.color = 'var(--grey-400)'; e.currentTarget.style.background = 'transparent'; }}
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* link cols */}
          {Object.entries(footerLinks).map(([col, links]) => (
            <div key={col}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--grey-600)', marginBottom: 'var(--space-16)' }}>{col}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-12)' }}>
                {links.map(l => (
                  <span key={l.label} onClick={l.action} style={{ fontSize: 13, color: 'var(--grey-400)', cursor: 'pointer', transition: 'color .15s', textDecoration: 'none' }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--white)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--grey-400)'}
                  >
                    {l.label}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="footer-bottom-inner" style={{ padding: 'var(--space-20) var(--gutter-public)', borderTop: '0.5px solid var(--grey-800)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-8)' }}>
          <div style={{ fontSize: 12, color: 'var(--grey-600)' }}>© 2026 Creatorske Ltd. Nairobi, Kenya.</div>
          <div style={{ display: 'flex', gap: 'var(--space-20)' }}>
            {[
              { label: 'Privacy policy', path: '/privacy' },
              { label: 'Terms of service', path: '/terms' },
            ].map(l => (
              <span key={l.label} onClick={() => navigate(l.path)}
                style={{ fontSize: 12, color: 'var(--grey-600)', cursor: 'pointer', transition: 'color .15s' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--grey-300)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--grey-600)'}
              >
                {l.label}
              </span>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}