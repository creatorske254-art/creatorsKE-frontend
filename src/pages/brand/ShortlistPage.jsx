import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePageMeta } from '@/lib/usePageMeta';
import {
  IconSearch, IconCheck, IconBookmark, IconBookmarkFilled,
  IconFilterOff, IconStarFilled,
} from '@tabler/icons-react';

// ── Static shortlist data, replace with useBrandDashboard() shortlist fetch ─
const SHORTLIST = [
  { id: 'c1', name: 'Amara Muriithi', handle: '@amaramuriithi', initials: 'AM', niche: 'Food',      followers: 48000,  eng: 6.4, rating: 4.8, reviews: 32, verified: true,  avail: 'available', bg: 'linear-gradient(135deg,#6B5FF4,#1E1480)', platforms: ['Instagram', 'TikTok'],       price: 18000, priceUnit: 'per reel',        revision: '2 rounds',  lead: '3–5 days',   addedOn: '2026-06-28', note: '' },
  { id: 'c2', name: 'James Otieno',   handle: '@jamesotieno',   initials: 'JO', niche: 'Tech',      followers: 102000, eng: 4.1, rating: 4.6, reviews: 21, verified: true,  avail: 'limited',   bg: 'linear-gradient(135deg,#0D0D0D,#333)',     platforms: ['YouTube'],                   price: 45000, priceUnit: 'per integration', revision: '1 round',   lead: '7–10 days',  addedOn: '2026-06-27', note: 'Good fit for the Vivo launch, check YouTube Shorts pricing.' },
  { id: 'c3', name: 'Neema Kimani',   handle: '@neemakimani',   initials: 'NK', niche: 'Lifestyle', followers: 210000, eng: 7.2, rating: 4.9, reviews: 54, verified: true,  avail: 'available', bg: 'linear-gradient(135deg,#5445E8,#2C1FB8)', platforms: ['TikTok', 'Instagram'],       price: 32000, priceUnit: 'per post',        revision: 'Unlimited', lead: '2–4 days',   addedOn: '2026-06-25', note: '' },
  { id: 'c4', name: 'Brenda Waweru',  handle: '@brendawaweru',  initials: 'BW', niche: 'Fashion',   followers: 76000,  eng: 5.3, rating: 4.7, reviews: 18, verified: false, avail: 'booked',    bg: 'linear-gradient(135deg,#3D2FD6,#110B52)', platforms: ['Instagram'],                 price: 22000, priceUnit: 'per reel',        revision: '2 rounds',  lead: '5–7 days',   addedOn: '2026-06-20', note: '' },
  { id: 'c5', name: 'Kevin Mwangi',   handle: '@kevmwangi',     initials: 'KM', niche: 'Tech',      followers: 34000,  eng: 3.8, rating: 4.4, reviews: 9,  verified: false, avail: 'available', bg: 'linear-gradient(135deg,#2C1FB8,#6B5FF4)', platforms: ['YouTube', 'Twitter/X'],      price: null,  priceUnit: '',                revision: 'None',      lead: '10–14 days', addedOn: '2026-06-18', note: '' },
];

const NICHES = ['All', 'Food', 'Tech', 'Lifestyle', 'Fashion'];

const AVAIL_META = {
  available: { label: 'Available now', dot: 'var(--status-success)' },
  limited:   { label: 'Limited slots', dot: 'var(--status-warning)' },
  booked:    { label: 'Fully booked',  dot: 'var(--grey-400)' },
};

const SORTS = [
  { value: 'recent',     label: 'Recently added' },
  { value: 'followers',  label: 'Most followers' },
  { value: 'engagement', label: 'Highest engagement' },
  { value: 'rating',     label: 'Highest rated' },
  { value: 'price_low',  label: 'Price: low to high' },
];

function formatFollowers(n) {
  if (n >= 1000) return `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}K`;
  return String(n);
}

// ── Shortlist card ────────────────────────────────────────────────────────
function ShortlistCard({ creator, index, onRemove, onEnquire }) {
  const [hovered, setHovered] = useState(false);
  const a = AVAIL_META[creator.avail];

  return (
    <div
      className="sl-card"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'var(--white)',
        border: `0.5px solid ${hovered ? 'var(--grey-300)' : 'var(--grey-100)'}`,
        borderRadius: 16,
        overflow: 'hidden',
        transition: 'all var(--transition-fast)',
        display: 'flex',
        flexDirection: 'column',
        transform: hovered ? 'translateY(-2px)' : 'none',
        boxShadow: hovered ? 'var(--shadow-md)' : 'none',
        animation: `fadeUp 0.2s cubic-bezier(.16,1,.3,1) ${index * 0.04}s both`,
      }}
    >
      {/* Cover gradient: niche tag, remove control, and identity row */}
      <div style={{ background: creator.bg, position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: 12, minHeight: 130 }}>
        <div style={{
          position: 'absolute', top: 10, right: 10, fontSize: 9, fontWeight: 600,
          letterSpacing: '0.06em', textTransform: 'uppercase', padding: '3px 9px',
          borderRadius: 999, background: 'rgba(255,255,255,0.22)', color: '#fff',
        }}>
          {creator.niche}
        </div>

        <button
          onClick={() => onRemove(creator)}
          title="Remove from shortlist"
          style={{
            position: 'absolute', top: 8, left: 8, width: 26, height: 26, borderRadius: '50%',
            background: 'rgba(255,255,255,0.22)', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
            opacity: hovered ? 1 : 0, transition: 'opacity var(--transition-fast), background var(--transition-fast)',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.34)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.22)'}
        >
          <IconBookmarkFilled size={12} />
        </button>

        {/* identity row: avatar + name/handle, inline with the cover like DirectoryPage's CreatorCard */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, position: 'relative', zIndex: 1 }}>
          <div style={{
            width: 38, height: 38, borderRadius: '50%',
            border: '2px solid rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 600, color: '#fff',
            flexShrink: 0, position: 'relative',
          }}>
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
          {[['followers', formatFollowers(creator.followers)], ['eng.', `${creator.eng}%`], ['rating', creator.rating]].map(([lbl, val]) => (
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
            onClick={() => onEnquire(creator.name)}
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

// ── Toast ─────────────────────────────────────────────────────────────────
function Toast({ message, visible, action }) {
  return (
    <div style={{
      position: 'fixed', bottom: 24, left: '50%', transform: `translateX(-50%) translateY(${visible ? 0 : 10}px)`,
      zIndex: 999, pointerEvents: visible ? 'auto' : 'none',
      background: 'var(--black)', color: 'var(--white)', padding: '11px 18px', borderRadius: 'var(--radius-lg)', fontSize: 13,
      fontWeight: 500, boxShadow: 'var(--shadow-xl)', display: 'flex', alignItems: 'center', gap: 12,
      opacity: visible ? 1 : 0, transition: 'all 0.25s', whiteSpace: 'nowrap',
    }}>
      <IconCheck size={14} />
      {message}
      {action && (
        <button
          onClick={action.onClick}
          style={{ background: 'none', border: 'none', color: 'var(--purple-300)', fontWeight: 600, cursor: 'pointer', fontSize: 13, fontFamily: 'var(--font-body)', padding: 0 }}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

// ── Empty states ──────────────────────────────────────────────────────────
function EmptyShortlist({ navigate }) {
  return (
    <div className="card card-p-xl" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '64px 24px' }}>
      <div style={{ width: 52, height: 52, borderRadius: 'var(--radius-xl)', background: 'var(--grey-50)', border: '0.5px solid var(--grey-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--grey-400)', marginBottom: 4 }}>
        <IconBookmark size={22} />
      </div>
      <h4 style={{ margin: 0 }}>Your shortlist is empty</h4>
      <p className="card-body-text" style={{ maxWidth: 320 }}>
        Save creators while you browse the directory and they'll show up here so you can compare them side by side before reaching out.
      </p>
      <button className="btn btn-purple" style={{ marginTop: 6 }} onClick={() => navigate('/directory')}>
        <IconSearch size={13} />Browse the directory
      </button>
    </div>
  );
}

function NoResults({ onClear }) {
  return (
    <div className="card card-p-xl" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '48px 24px' }}>
      <div style={{ width: 52, height: 52, borderRadius: 'var(--radius-xl)', background: 'var(--grey-50)', border: '0.5px solid var(--grey-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--grey-400)', marginBottom: 4 }}>
        <IconFilterOff size={22} />
      </div>
      <h4 style={{ margin: 0 }}>No creators match your filters</h4>
      <p className="card-body-text" style={{ maxWidth: 260 }}>Try a different niche, or clear your search.</p>
      <button className="btn btn-ghost" style={{ marginTop: 4 }} onClick={onClear}>Clear filters</button>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────
export default function ShortlistPage() {
  usePageMeta('Shortlist', 'Creators you have saved for comparison on Creatorske.');
  const navigate = useNavigate();
  const [creators, setCreators] = useState(SHORTLIST);
  const [query, setQuery] = useState('');
  const [activeNiche, setNiche] = useState('All');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [sortBy, setSortBy] = useState('recent');
  const [toast, setToast] = useState({ visible: false, message: '', action: null });

  const showToast = useCallback((message, action = null) => {
    setToast({ visible: true, message, action });
    window.clearTimeout(showToast._t);
    showToast._t = window.setTimeout(() => setToast(t => ({ ...t, visible: false })), action ? 5000 : 2800);
  }, []);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    let list = creators.filter(c => {
      const matchNiche = activeNiche === 'All' || c.niche === activeNiche;
      const matchAvail = !availableOnly || c.avail === 'available';
      const matchQuery = !q || c.name.toLowerCase().includes(q) || c.handle.toLowerCase().includes(q) || c.niche.toLowerCase().includes(q);
      return matchNiche && matchAvail && matchQuery;
    });
    switch (sortBy) {
      case 'followers':  list = [...list].sort((a, b) => b.followers - a.followers); break;
      case 'engagement': list = [...list].sort((a, b) => b.eng - a.eng); break;
      case 'rating':     list = [...list].sort((a, b) => b.rating - a.rating); break;
      case 'price_low':  list = [...list].sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity)); break;
      default:           list = [...list].sort((a, b) => new Date(b.addedOn) - new Date(a.addedOn));
    }
    return list;
  }, [creators, query, activeNiche, availableOnly, sortBy]);

  // Shortlist-wide stats for the summary row, reflects the full
  // saved list, independent of the active search/filter/sort.
  const stats = useMemo(() => {
    const total = creators.length;
    const open = creators.filter(c => c.avail === 'available').length;
    const limited = creators.filter(c => c.avail === 'limited').length;
    const booked = creators.filter(c => c.avail === 'booked').length;
    const avgRating = total ? (creators.reduce((s, c) => s + c.rating, 0) / total).toFixed(1) : 'N/A';
    const avgEng = total ? (creators.reduce((s, c) => s + c.eng, 0) / total).toFixed(1) : 'N/A';
    return { total, open, limited, booked, avgRating, avgEng };
  }, [creators]);

  const removeCreator = useCallback((creator) => {
    setCreators(prev => prev.filter(c => c.id !== creator.id));
    showToast(`Removed ${creator.name} from your shortlist`, {
      label: 'Undo',
      onClick: () => {
        setCreators(prev => [...prev, creator].sort((a, b) => new Date(b.addedOn) - new Date(a.addedOn)));
        setToast(t => ({ ...t, visible: false }));
      },
    });
  }, [showToast]);

  const handleEnquire = (name) => showToast(`Enquiry sent to ${name}`);

  const clearFilters = () => { setQuery(''); setNiche('All'); setAvailableOnly(false); };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-24)', width: '100%' }}>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }

        .sl-chip { padding:5px 14px; border:0.5px solid var(--grey-200); border-radius:var(--radius-pill); font-size:12px; font-weight:500; cursor:pointer; background:var(--white); color:var(--grey-600); transition:all var(--transition-fast); white-space:nowrap; font-family:var(--font-body); }
        .sl-chip:hover { border-color:var(--grey-400); color:var(--black); }
        .sl-chip.active { background:var(--black); color:var(--white); border-color:var(--black); }

        /* Summary row: uniform 4-up stat tiles */
        .sl-stats-row { display:grid; grid-template-columns: repeat(4, 1fr); gap:16px; width:100%; }
        @media (max-width:900px) {
          .sl-stats-row { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width:520px) {
          .sl-stats-row { grid-template-columns: 1fr; }
        }

        /* Card grid: uniform */
        .sl-card-grid { display:grid; grid-template-columns: repeat(auto-fill, minmax(260px,1fr)); gap:16px; width:100%; }
        .sl-card { width:100%; }

        .sl-search-row { display:flex; gap:12px; align-items:center; flex-wrap:wrap; width:100%; }
        @media(max-width:720px) {
          .sl-search-row { flex-direction:column !important; align-items:stretch !important; }
          .sl-search-wrap { max-width:100% !important; }
        }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
        <div>
          <h3 style={{ margin: 0 }}>Your shortlist</h3>
          <p className="text-body-sm" style={{ color: 'var(--grey-500)', marginTop: 6, maxWidth: 520 }}>
            Creators you've saved while browsing. Reach out whenever you're ready to book.
          </p>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/directory')}>
          <IconSearch size={14} />Browse more creators
        </button>
      </div>

      {creators.length === 0 ? (
        <EmptyShortlist navigate={navigate} />
      ) : (
        <>
          {/* Stats row */}
          <div className="sl-stats-row">
            <div className="stat-card">
              <div className="stat-card-label">Shortlist</div>
              <div className="stat-card-value">{stats.total}</div>
              <div className="stat-card-delta" style={{ color: 'var(--grey-500)' }}>
                {stats.open} open · {stats.limited} limited · {stats.booked} booked
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-card-label">Avg. engagement</div>
              <div className="stat-card-value">{stats.avgEng}%</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-label">Avg. rating</div>
              <div className="stat-card-value" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                {stats.avgRating}
                {stats.avgRating !== 'N/A' && <IconStarFilled size={14} style={{ color: 'var(--black)' }} />}
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-card-label">Niches</div>
              <div className="stat-card-value">{new Set(creators.map(c => c.niche)).size}</div>
              <div className="stat-card-delta" style={{ color: 'var(--grey-500)' }}>Represented in your list</div>
            </div>
          </div>

          {/* Search + chips */}
          <div className="sl-search-row">
            <div className="sl-search-wrap input-wrapper" style={{ flex: 1, maxWidth: 360, minWidth: 200 }}>
              <IconSearch size={15} className="input-icon left" />
              <input
                className="search-input"
                style={{ paddingLeft: 38 }}
                type="text"
                placeholder="Search by name, handle, or niche"
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {NICHES.map(n => (
                <button key={n} className={`sl-chip${activeNiche === n ? ' active' : ''}`} onClick={() => setNiche(n)}>
                  {n}
                </button>
              ))}
            </div>
        </div>

          {/* Grid */}
          {filtered.length === 0 ? (
            <NoResults onClear={clearFilters} />
          ) : (
            <div className="sl-card-grid">
              {filtered.map((c, i) => (
                <ShortlistCard
                  key={c.id}
                  creator={c}
                  index={i}
                  onRemove={removeCreator}
                  onEnquire={handleEnquire}
                />
              ))}
            </div>
          )}
        </>
      )}

      <Toast message={toast.message} visible={toast.visible} action={toast.action} />
    </div>
  );
}