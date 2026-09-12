import { useState, useMemo } from 'react';
import { usePageMeta } from '@/lib/usePageMeta';
import { useNavigate } from 'react-router-dom';
import { IconSearch, IconCheck, IconArrowRight, IconStarFilled } from '@tabler/icons-react';
import { EmptyDirectoryState } from '@/features/directory';

// ── Static creator data ────────────────────────────────────────────────────
const CREATORS = [
  { name: 'Amara Osei',    handle: '@amaracreates', initials: 'AO', niche: 'Lifestyle', followers: '48K',  eng: '6.2%', rating: '4.8', verified: true,  avail: 'available', bg: 'linear-gradient(135deg,#6B5FF4,#1E1480)' },
  { name: 'James Kiema',   handle: '@jkiema',       initials: 'JK', niche: 'Tech',      followers: '120K', eng: '4.1%', rating: '4.9', verified: true,  avail: 'limited',   bg: 'linear-gradient(135deg,#0D0D0D,#333)'    },
  { name: 'Njeri Wanjiku', handle: '@njeriwanjiku', initials: 'NW', niche: 'Fashion',   followers: '22K',  eng: '8.7%', rating: '4.7', verified: false, avail: 'booked',    bg: 'linear-gradient(135deg,#5445E8,#2C1FB8)' },
  { name: 'Brian Otieno',  handle: '@brianotieno',  initials: 'BO', niche: 'Food',      followers: '35K',  eng: '7.3%', rating: '4.6', verified: true,  avail: 'available', bg: 'linear-gradient(135deg,#1a1a1a,#444)'    },
  { name: 'Sasha Mwangi',  handle: '@sashamwangi',  initials: 'SM', niche: 'Travel',    followers: '67K',  eng: '5.8%', rating: '4.8', verified: true,  avail: 'available', bg: 'linear-gradient(135deg,#3D2FD6,#110B52)' },
  { name: 'Lena Kamau',    handle: '@lenakamau',    initials: 'LK', niche: 'Fitness',   followers: '19K',  eng: '9.1%', rating: '4.5', verified: false, avail: 'limited',   bg: 'linear-gradient(135deg,#2C1FB8,#6B5FF4)' },
  { name: 'Kevin Njoroge', handle: '@kevinnjoroge', initials: 'KN', niche: 'Finance',   followers: '82K',  eng: '3.9%', rating: '4.7', verified: true,  avail: 'booked',    bg: 'linear-gradient(135deg,#111,#555)'        },
  { name: 'Aisha Hassan',  handle: '@aishahassan',  initials: 'AH', niche: 'Lifestyle', followers: '14K',  eng: '11.2%',rating: '4.9', verified: false, avail: 'available', bg: 'linear-gradient(135deg,#6B5FF4,#3D2FD6)' },
  { name: 'Daniel Mutua',  handle: '@danielmutua',  initials: 'DM', niche: 'Tech',      followers: '55K',  eng: '5.1%', rating: '4.6', verified: true,  avail: 'available', bg: 'linear-gradient(135deg,#222,#444)'        },
  { name: 'Faith Ndungu',  handle: '@faithndungu',  initials: 'FN', niche: 'Fashion',   followers: '31K',  eng: '7.8%', rating: '4.8', verified: false, avail: 'limited',   bg: 'linear-gradient(135deg,#5445E8,#9187F7)' },
  { name: 'Omar Ali',      handle: '@omarali',      initials: 'OA', niche: 'Food',      followers: '28K',  eng: '6.6%', rating: '4.5', verified: true,  avail: 'booked',    bg: 'linear-gradient(135deg,#0D0D0D,#222)'    },
  { name: 'Ruth Waweru',   handle: '@ruthwaweru',   initials: 'RW', niche: 'Travel',    followers: '43K',  eng: '5.3%', rating: '4.7', verified: false, avail: 'available', bg: 'linear-gradient(135deg,#2C1FB8,#5445E8)' },
];

const NICHES = ['All', 'Lifestyle', 'Fashion', 'Tech', 'Food', 'Travel', 'Fitness', 'Finance'];

const AVAIL_META = {
  available: { label: 'Available now', dot: '#639922' },
  limited:   { label: 'Limited slots',  dot: '#BA7517' },
  booked:    { label: 'Fully booked',   dot: '#9ca3af' },
};

// ── Creator Card ───────────────────────────────────────────────────────────
function CreatorCard({ creator, index, onOpen, onEnquire }) {
  const [hovered, setHovered] = useState(false);
  const a = AVAIL_META[creator.avail];

  return (
    <div
      onClick={onOpen}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'var(--white)',
        border: `0.5px solid ${hovered ? 'var(--grey-300)' : 'var(--grey-100)'}`,
        borderRadius: 16,
        overflow: 'hidden',
        transition: 'all 0.2s',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        transform: hovered ? 'translateY(-2px)' : 'none',
        boxShadow: hovered ? '0 4px 16px rgba(0,0,0,0.08)' : 'none',
        animation: `fadeUp 0.2s cubic-bezier(.16,1,.3,1) ${index * 0.04}s both`,
      }}
    >
      {/* Cover gradient */}
      <div style={{ background: creator.bg, position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: 12, minHeight: 130 }}>
        {/* niche tag */}
        <div style={{ position: 'absolute', top: 10, right: 10, fontSize: 9, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', padding: '3px 9px', borderRadius: 999, background: 'rgba(255,255,255,0.22)', color: '#fff' }}>
          {creator.niche}
        </div>

        {/* identity row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, position: 'relative', zIndex: 1 }}>
          {/* avatar */}
          <div style={{ width: 38, height: 38, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 600, color: '#fff', flexShrink: 0, position: 'relative' }}>
            {creator.initials}
            {creator.verified && (
              <div style={{ position: 'absolute', bottom: 0, right: 0, width: 13, height: 13, background: 'var(--status-success)', borderRadius: '50%', border: '1.5px solid transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IconCheck size={7} color="#fff" strokeWidth={3} />
              </div>
            )}
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 600, color: '#fff', lineHeight: 1.2, textShadow: '0 1px 3px rgba(0,0,0,0.3)' }}>{creator.name}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)' }}>{creator.handle}</div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 10, flex: 1, background: 'var(--white)' }}>
        {/* stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1, background: 'var(--grey-200)', borderRadius: 8, overflow: 'hidden' }}>
          {[['followers', creator.followers], ['eng.', creator.eng], ['rating', creator.rating]].map(([lbl, val]) => (
            <div key={lbl} style={{ background: 'var(--grey-50)', padding: '7px 0', textAlign: 'center' }}>
              <strong style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3, fontSize: 13, fontWeight: 600, color: 'var(--black)', fontFamily: 'var(--font-display)' }}>
                {val}
                {lbl === 'rating' && <IconStarFilled size={11} style={{ color: 'var(--black)' }} />}
              </strong>
              <span style={{ fontSize: 9, color: 'var(--grey-400)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{lbl}</span>
            </div>
          ))}
        </div>

        {/* footer row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--grey-500)' }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: a.dot, display: 'inline-block', flexShrink: 0 }} />
            {a.label}
          </div>
          <button
            onClick={e => { e.stopPropagation(); onEnquire(); }}
            style={{ padding: '6px 14px', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 500, background: 'var(--purple-600)', color: '#fff', cursor: 'pointer', fontFamily: 'var(--font-body)', transition: 'background 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--purple-700)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--purple-600)'}
          >
            Enquire
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function DirectoryPage() {
  usePageMeta('Browse Creators', 'Browse verified Kenyan content creators by niche, platform, and follower size, then send an enquiry directly.');
  const navigate = useNavigate();
  const [query, setQuery]         = useState('');
  const [activeNiche, setNiche]   = useState('All');

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return CREATORS.filter(c => {
      const matchNiche = activeNiche === 'All' || c.niche === activeNiche;
      const matchQuery = !q || c.name.toLowerCase().includes(q) || c.handle.toLowerCase().includes(q) || c.niche.toLowerCase().includes(q);
      return matchNiche && matchQuery;
    });
  }, [query, activeNiche]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--page-bg)' }}>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        .dir-nav-link { font-size:13px; color:var(--grey-600); padding:6px 12px; border-radius:8px; cursor:pointer; font-weight:500; background:none; border:none; font-family:var(--font-body); transition:all .15s; }
        .dir-nav-link:hover { color:var(--black); background:var(--grey-50); }
        .dir-nav-link.active { color:var(--black); background:var(--grey-100); }
        .dir-chip { padding:5px 14px; border:0.5px solid var(--grey-200); border-radius:999px; font-size:12px; font-weight:500; cursor:pointer; background:var(--white); color:var(--grey-600); transition:all .15s; white-space:nowrap; font-family:var(--font-body); }
        .dir-chip:hover { border-color:var(--grey-400); color:var(--black); }
        .dir-chip.active { background:var(--black); color:var(--white); border-color:var(--black); }
        .dir-search-input { width:100%; padding:9px 16px 9px 38px; border:0.5px solid var(--grey-200); border-radius:999px; font-family:var(--font-body); font-size:14px; color:var(--black); background:var(--white); outline:none; transition:all .15s; }
        .dir-search-input:focus { border-color:var(--purple-400); box-shadow:0 0 0 3px rgba(84,69,232,0.08); }
        .dir-search-input::placeholder { color:var(--grey-300); }
        .dir-btn-ghost { background:transparent; color:var(--grey-600); border-radius:8px; font-size:13px; padding:7px 16px; border:0.5px solid var(--grey-200); cursor:pointer; font-family:var(--font-body); font-weight:500; transition:all .15s; }
        .dir-btn-ghost:hover { color:var(--black); border-color:var(--grey-400); background:var(--grey-50); }
        .dir-btn-purple { background:var(--purple-600); color:#fff; border-radius:8px; font-size:13px; padding:7px 16px; border:none; cursor:pointer; font-family:var(--font-body); font-weight:500; transition:all .15s; }
        .dir-btn-purple:hover { background:var(--purple-700); }
        @media(max-width:900px) {
          .dir-navbar { padding:0 20px !important; }
          .dir-navbar-links { display:none !important; }
          .dir-header { padding:24px 24px 20px !important; }
          .dir-body { padding:24px !important; }
          .dir-cta-band { padding:24px !important; flex-direction:column !important; align-items:flex-start !important; gap:16px !important; }
          .dir-search-row { flex-direction:column !important; align-items:stretch !important; }
          .dir-search-wrap { max-width:100% !important; }
        }
      `}</style>

      {/* ══ NAVBAR ════════════════════════════════════════════════════════ */}
      <nav className="dir-navbar" style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(14px)', borderBottom: '0.5px solid var(--grey-100)', height: 60, display: 'flex', alignItems: 'center', padding: '0 40px', position: 'sticky', top: 0, zIndex: 100, justifyContent: 'space-between', flexShrink: 0 }}>
        <span onClick={() => navigate('/')} style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600, letterSpacing: '-0.01em', cursor: 'pointer', color: 'var(--black)' }}>
          Creatorske<span style={{ color: 'var(--purple-500)' }}>.</span>
        </span>

        <div className="dir-navbar-links" style={{ display: 'flex', gap: 4 }}>
          <button className="dir-nav-link active">Browse creators</button>
          <button className="dir-nav-link" onClick={() => navigate('/#how-it-works')}>How it works</button>
          <button className="dir-nav-link" onClick={() => navigate('/pricing')}>Pricing</button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button className="dir-btn-ghost" onClick={() => navigate('/login')}>Log in</button>
          <button className="dir-btn-purple" onClick={() => navigate('/signup')}>Get started</button>
        </div>
      </nav>

      {/* ══ HEADER ════════════════════════════════════════════════════════ */}
      <div className="dir-header" style={{ padding: '36px 56px 24px', background: 'var(--white)', borderBottom: '0.5px solid var(--grey-100)', flexShrink: 0 }}>
        {/* top row */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 20, gap: 16, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--black)' }}>Browse creators</div>
            <div style={{ fontSize: 13, color: 'var(--grey-500)', marginTop: 4 }}>Find the right creator for your campaign: browse niches, engagement, and availability.</div>
          </div>
          <div style={{ fontSize: 13, color: 'var(--grey-600)', whiteSpace: 'nowrap' }}>
            Are you a creator?{' '}
            <span onClick={() => navigate('/signup')} style={{ color: 'var(--purple-600)', fontWeight: 500, cursor: 'pointer', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 3 }}
              onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
              onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
            >
              List your rates free <IconArrowRight size={13} />
            </span>
          </div>
        </div>

        {/* search + chips */}
        <div className="dir-search-row" style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="dir-search-wrap" style={{ position: 'relative', flex: 1, maxWidth: 440, minWidth: 200 }}>
            <IconSearch size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--grey-400)', pointerEvents: 'none' }} />
            <input
              className="dir-search-input"
              type="text"
              placeholder="Search creators, niches, platforms..."
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {NICHES.map(n => (
              <button
                key={n}
                className={`dir-chip${activeNiche === n ? ' active' : ''}`}
                onClick={() => setNiche(n)}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ══ GRID BODY ═════════════════════════════════════════════════════ */}
      <div className="dir-body" style={{ flex: 1, padding: '32px 56px', background: 'var(--page-bg)' }}>
        {filtered.length === 0 ? (
          <EmptyDirectoryState onReset={() => { setQuery(''); setNiche('All'); }} />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 14 }}>
            {filtered.map((c, i) => (
              <CreatorCard
                key={c.handle}
                creator={c}
                index={i}
                onOpen={() => navigate(`/c/${c.handle.replace('@', '')}`)}
                onEnquire={() => navigate(`/c/${c.handle.replace('@', '')}?enquire=1`)}
              />
            ))}
          </div>
        )}
      </div>

      {/* ══ BOTTOM CTA BAND ═══════════════════════════════════════════════ */}
      <div className="dir-cta-band" style={{ background: 'var(--black)', color: 'var(--white)', padding: '32px 56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, flexShrink: 0, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600, letterSpacing: '-0.01em' }}>Are you a creator? List your rates for free.</div>
          <div style={{ fontSize: 13, color: 'var(--grey-400)', marginTop: 3 }}>Join 2,400+ creators already on Creatorske.</div>
        </div>
        <button
          onClick={() => navigate('/signup')}
          style={{ background: 'var(--white)', color: 'var(--black)', borderRadius: 8, fontSize: 14, padding: '11px 24px', fontWeight: 500, border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', transition: 'opacity .15s', whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: 6 }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >
          Create your rate card <IconArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}