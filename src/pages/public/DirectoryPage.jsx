import { useState, useMemo } from 'react';
import { usePageMeta } from '@/lib/usePageMeta';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { IconSearch, IconCheck, IconArrowRight, IconStarFilled } from '@tabler/icons-react';
import { EmptyDirectoryState } from '@/features/directory';
import { useQuery } from '@tanstack/react-query';
import { searchCreators } from '@/features/directory/services/directory.service';
import Skeleton from '@/components/ui/Skeleton';
import ErrorState from '@/components/shared/ErrorState';

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
      <div style={{ background: creator.bg, position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: 'var(--space-12)', minHeight: 130 }}>
        {/* niche tag */}
        <div style={{ position: 'absolute', top: 10, right: 10, fontSize: 9, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', padding: 'var(--space-4) var(--space-8)', borderRadius: 999, background: 'rgba(255,255,255,0.22)', color: '#fff' }}>
          {creator.niche}
        </div>

        {/* identity row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-8)', position: 'relative', zIndex: 1 }}>
          {/* avatar */}
          <div style={{ width: 38, height: 38, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 600, color: '#fff', flexShrink: 0, position: 'relative' }}>
            {creator.initials}
            {creator.verified && (
              <div style={{ position: 'absolute', bottom: 0, right: 0, width: 13, height: 13, background: 'var(--status-success)', borderRadius: '50%', border: '1.5px solid transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IconCheck className="icon-xs" color="#fff" />
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
      <div style={{ padding: 'var(--space-12)', display: 'flex', flexDirection: 'column', gap: 'var(--space-12)', flex: 1, background: 'var(--white)' }}>
        {/* stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-2)', background: 'var(--grey-200)', borderRadius: 8, overflow: 'hidden' }}>
          {[['followers', creator.followers], ['eng.', creator.eng], ['rating', creator.rating]].map(([lbl, val]) => (
            <div key={lbl} style={{ background: 'var(--grey-50)', padding: 'var(--space-8) 0', textAlign: 'center' }}>
              <strong style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-4)', fontSize: 13, fontWeight: 600, color: 'var(--black)', fontFamily: 'var(--font-display)' }}>
                {val}
                {lbl === 'rating' && <IconStarFilled className="icon-xs" style={{ color: 'var(--black)' }} />}
              </strong>
              <span style={{ fontSize: 9, color: 'var(--grey-400)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{lbl}</span>
            </div>
          ))}
        </div>

        {/* footer row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-4)', fontSize: 11, color: 'var(--grey-500)' }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: a.dot, display: 'inline-block', flexShrink: 0 }} />
            {a.label}
          </div>
          <button
            onClick={e => { e.stopPropagation(); onEnquire(); }}
            style={{ padding: 'var(--space-8) var(--space-16)', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 500, background: 'var(--purple-600)', color: '#fff', cursor: 'pointer', fontFamily: 'var(--font-body)', transition: 'background 0.15s' }}
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
  // ?q= is the source of truth so a search from anywhere in the app (the
  // dashboard navbars all navigate here with ?q=) lands on real filtered
  // results, and so a search is shareable/bookmarkable.
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') ?? '';
  const setQuery = (value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set('q', value); else next.delete('q');
    setSearchParams(next, { replace: true });
  };
  const [activeNiche, setNiche]   = useState('All');

  // GET /directory - every published creator; niche and keyword filtering
  // stays client-side so the chips respond instantly.
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ['directory', 'all'], queryFn: () => searchCreators({ limit: 200 }), staleTime: 60_000 });
  const creators = useMemo(() => (data?.creators ?? []).map((c) => ({
    ...c,
    followers: typeof c.followers === 'number' ? (c.followers >= 1000 ? `${(c.followers / 1000).toFixed(c.followers % 1000 === 0 ? 0 : 1)}K` : String(c.followers)) : c.followers,
    eng: typeof c.eng === 'number' ? `${c.eng}%` : c.eng,
    rating: typeof c.rating === 'number' ? c.rating.toFixed(1) : c.rating,
  })), [data]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return creators.filter(c => {
      const matchNiche = activeNiche === 'All' || c.niche === activeNiche;
      const matchQuery = !q || c.name.toLowerCase().includes(q) || c.handle.toLowerCase().includes(q) || c.niche.toLowerCase().includes(q);
      return matchNiche && matchQuery;
    });
  }, [creators, query, activeNiche]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--page-bg)' }}>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        .dir-nav-link { font-size:13px; color:var(--grey-600); padding:var(--space-8) var(--space-12); border-radius:8px; cursor:pointer; font-weight:500; background:none; border:none; font-family:var(--font-body); transition:all .15s; }
        .dir-nav-link:hover { color:var(--black); background:var(--grey-50); }
        .dir-nav-link.active { color:var(--black); background:var(--grey-100); }
        .dir-chip { padding:var(--space-4) var(--space-16); border:0.5px solid var(--grey-200); border-radius:999px; font-size:12px; font-weight:500; cursor:pointer; background:var(--white); color:var(--grey-600); transition:all .15s; white-space:nowrap; font-family:var(--font-body); }
        .dir-chip:hover { border-color:var(--grey-400); color:var(--black); }
        .dir-chip.active { background:var(--black); color:var(--white); border-color:var(--black); }
        .dir-search-input { width:100%; padding:var(--space-8) var(--space-16) var(--space-8) var(--space-40); border:0.5px solid var(--grey-200); border-radius:999px; font-family:var(--font-body); font-size:14px; color:var(--black); background:var(--white); outline:none; transition:all .15s; }
        .dir-search-input:focus { border-color:var(--purple-400); box-shadow:0 0 0 3px rgba(84,69,232,0.08); }
        .dir-search-input::placeholder { color:var(--grey-300); }
        .dir-btn-ghost { background:transparent; color:var(--grey-600); border-radius:8px; font-size:13px; padding:var(--space-8) var(--space-16); border:0.5px solid var(--grey-200); cursor:pointer; font-family:var(--font-body); font-weight:500; transition:all .15s; }
        .dir-btn-ghost:hover { color:var(--black); border-color:var(--grey-400); background:var(--grey-50); }
        .dir-btn-purple { background:var(--purple-600); color:#fff; border-radius:8px; font-size:13px; padding:var(--space-8) var(--space-16); border:none; cursor:pointer; font-family:var(--font-body); font-weight:500; transition:all .15s; }
        .dir-btn-purple:hover { background:var(--purple-700); }
        @media(max-width:900px) {
          .dir-navbar { padding:0 var(--gutter-public) !important; }
          .dir-navbar-links { display:none !important; }
          .dir-header { padding:var(--space-24) var(--gutter-public) var(--space-20) !important; }
          .dir-body { padding:var(--space-24) var(--gutter-public) !important; }
          .dir-cta-band { padding:var(--space-24) var(--gutter-public) !important; flex-direction:column !important; align-items:flex-start !important; gap:var(--space-16) !important; }
          .dir-search-row { flex-direction:column !important; align-items:stretch !important; }
          .dir-search-wrap { max-width:100% !important; }
        }
      `}</style>

      {/* ══ NAVBAR ════════════════════════════════════════════════════════ */}
      <nav className="dir-navbar" style={{ background: 'color-mix(in srgb, var(--white) 92%, transparent)', backdropFilter: 'blur(14px)', borderBottom: '0.5px solid var(--grey-100)', height: 60, display: 'flex', alignItems: 'center', padding: '0 var(--gutter-public)', position: 'sticky', top: 0, zIndex: 100, justifyContent: 'space-between', flexShrink: 0 }}>
        <span onClick={() => navigate('/')} style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600, letterSpacing: '-0.01em', cursor: 'pointer', color: 'var(--black)' }}>
          Creatorske<span style={{ color: 'var(--purple-500)' }}>.</span>
        </span>

        <div className="dir-navbar-links" style={{ display: 'flex', gap: 'var(--space-4)' }}>
          <button className="dir-nav-link active" aria-current="page" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Browse creators</button>
          <button className="dir-nav-link" onClick={() => navigate('/#how-it-works')}>How it works</button>
          <button className="dir-nav-link" onClick={() => navigate('/pricing')}>Pricing</button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-8)' }}>
          <button className="dir-btn-ghost" onClick={() => navigate('/login')}>Log in</button>
          <button className="dir-btn-purple" onClick={() => navigate('/signup')}>Get started</button>
        </div>
      </nav>

      {/* ══ HEADER ════════════════════════════════════════════════════════ */}
      <div className="dir-header" style={{ padding: 'var(--space-40) var(--gutter-public) var(--space-24)', background: 'var(--white)', borderBottom: '0.5px solid var(--grey-100)', flexShrink: 0 }}>
        {/* top row */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 'var(--space-20)', gap: 'var(--space-16)', flexWrap: 'wrap' }}>
          <div>
            <div className="hero-title">Browse creators</div>
            <div className="page-subtitle">Find the right creator for your campaign: browse niches, engagement, and availability.</div>
          </div>
          <div style={{ fontSize: 13, color: 'var(--grey-600)', whiteSpace: 'nowrap' }}>
            Are you a creator?{' '}
            <span onClick={() => navigate('/signup')} style={{ color: 'var(--purple-600)', fontWeight: 500, cursor: 'pointer', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 'var(--space-4)' }}
              onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
              onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
            >
              List your rates free <IconArrowRight className="icon-sm" />
            </span>
          </div>
        </div>

        {/* search + chips */}
        <div className="dir-search-row" style={{ display: 'flex', gap: 'var(--space-12)', alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="dir-search-wrap" style={{ position: 'relative', flex: 1, maxWidth: 440, minWidth: 200 }}>
            <IconSearch className="icon-sm" style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--grey-400)', pointerEvents: 'none' }} />
            <input
              className="dir-search-input"
              type="text"
              placeholder="Search creators, niches, platforms…"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-8)', flexWrap: 'wrap' }}>
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
      <div className="dir-body" style={{ flex: 1, padding: 'var(--space-32) var(--gutter-public)', background: 'var(--page-bg)' }}>
        {/* Result count - makes it obvious a search/filter actually ran */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-12)', marginBottom: 'var(--space-16)', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 13, color: 'var(--grey-600)' }}>
            <strong style={{ color: 'var(--black)' }}>{filtered.length}</strong>
            {' '}{filtered.length === 1 ? 'creator' : 'creators'}
            {query && <> matching “{query}”</>}
            {activeNiche !== 'All' && <> in {activeNiche}</>}
          </span>
          {(query || activeNiche !== 'All') && (
            <button
              className="dir-btn-ghost"
              style={{ padding: 'var(--space-4) var(--space-12)', fontSize: 12 }}
              onClick={() => { setQuery(''); setNiche('All'); }}
            >
              Clear
            </button>
          )}
        </div>

        {isLoading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 'var(--space-16)' }}>
            {[0, 1, 2, 3, 4, 5].map((i) => <Skeleton key={i} width="100%" height={260} style={{ borderRadius: 'var(--radius-xl)' }} />)}
          </div>
        ) : isError ? (
          <ErrorState title="Couldn't load creators" description="The directory didn't respond. Try again in a moment." onRetry={refetch} />
        ) : filtered.length === 0 ? (
          <EmptyDirectoryState onReset={() => { setQuery(''); setNiche('All'); }} />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 'var(--space-16)' }}>
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
      <div className="dir-cta-band" style={{ background: 'var(--black)', color: 'var(--white)', padding: 'var(--space-32) var(--gutter-public)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-24)', flexShrink: 0, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600, letterSpacing: '-0.01em' }}>Are you a creator? List your rates for free.</div>
          <div style={{ fontSize: 13, color: 'var(--grey-400)', marginTop: 'var(--space-4)' }}>Join 2,400+ creators already on Creatorske.</div>
        </div>
        <button
          onClick={() => navigate('/signup')}
          style={{ background: 'var(--white)', color: 'var(--black)', borderRadius: 8, fontSize: 14, padding: 'var(--space-12) var(--space-24)', fontWeight: 500, border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', transition: 'opacity .15s', whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: 'var(--space-8)' }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >
          Create your rate card <IconArrowRight className="icon-sm" />
        </button>
      </div>
    </div>
  );
}