import { Link } from 'react-router-dom';
import { useCreatorDashboard } from '../../features/creator-dashboard/hooks/useCreatorDashboard';
import { usePageMeta } from '@/lib/usePageMeta';

/*
   Layout: Bento grid.
   - Content area already owns its own margin/padding at the layout level,
     so this page fills it edge to edge, no maxWidth, no margin:auto.
   - Hero tile = earnings. Per creator-marketing UX research, revenue and
     conversion are what creators check first, not raw view counts, so
     earnings gets the widest, most prominent cell. Card views, enquiries,
     and conversion sit as equal secondary tiles beneath it.
   - Bento rule followed: only one hero tile on this screen, every span is
     backed by content weight (not decoration), consistent 16px gap,
     consistent 16px radius (var(--radius-xl) via .card / .stat-card).
   - Breakpoints collapse the grid to 2 then 1 column so it reflows cleanly
     on tablet/mobile instead of squeezing the same areas.

   Backgrounds: still none set on the page wrapper, it sits on the shared
   content-area background. Only individual tiles (.stat-card, .card,
   .table-wrap) carry their own var(--white) surface.
   */

function ProgressBar({ pct }) {
  return (
    <div className="progress-bar-wrap progress-sm">
      <div className="progress-bar-fill progress-sm" style={{ width: `${pct}%` }} />
    </div>
  );
}

const STATUS_TAG = {
  new:       { cls: 'tag-warning', label: 'New'       },
  in_review: { cls: 'tag-purple',  label: 'In review' },
  booked:    { cls: 'tag-success', label: 'Booked'    },
  completed: { cls: 'tag-default', label: 'Completed' },
};

const MOCK_ENQUIRIES = [
  { brand: 'Nairobi Brew Co.', ago: '2 hrs ago',  pkg: 'Reel + Caption',    status: 'new'       },
  { brand: 'Safaricom',        ago: 'Yesterday',   pkg: 'Brand Partnership', status: 'in_review' },
  { brand: 'Jumia Kenya',      ago: '3 days ago',  pkg: 'Story Post',        status: 'booked'    },
  { brand: 'KFC Kenya',        ago: '1 week ago',  pkg: 'Reel + Caption',    status: 'completed' },
];

const BENTO_CSS = `
  .bento-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    grid-template-areas:
      "hero  hero  hero  side"
      "views enq   conv  side"
      "table table table side";
    gap: var(--space-16);
  }
  .bento-hero  { grid-area: hero; }
  .bento-views { grid-area: views; }
  .bento-enq   { grid-area: enq; }
  .bento-conv  { grid-area: conv; }
  .bento-table { grid-area: table; }
  .bento-side  { grid-area: side; display: flex; flex-direction: column; gap: var(--space-16); }

  @media (max-width: 900px) {
    .bento-grid {
      grid-template-columns: repeat(2, 1fr);
      grid-template-areas:
        "hero  hero"
        "views enq"
        "conv  conv"
        "table table"
        "side  side";
    }
  }
  @media (max-width: 560px) {
    .bento-grid {
      grid-template-columns: 1fr;
      grid-template-areas:
        "hero"
        "views"
        "enq"
        "conv"
        "table"
        "side";
    }
  }
`;

export default function DashboardPage() {
  usePageMeta('Creator Dashboard', 'Track your earnings, enquiries, and rate card performance on Creatorske.');
  const {
    stats,
    statsLoading,
    cardHealth,
    healthLoading,
    publicUrl,
    copyPublicLink,
  } = useCreatorDashboard();

  const profilePct = cardHealth?.completeness            ?? 92;
  const pkgCurrent  = cardHealth?.packages?.current       ?? 3;
  const pkgMax      = cardHealth?.packages?.max           ?? 5;
  const pkgPct      = Math.round((pkgCurrent / pkgMax) * 100);
  const payCurrent  = cardHealth?.paymentMethods?.current ?? 1;
  const payMax      = cardHealth?.paymentMethods?.max     ?? 3;
  const payPct      = Math.round((payCurrent / payMax) * 100);

  const rows = statsLoading ? [] : (stats?.recentEnquiries ?? MOCK_ENQUIRIES);

  function shareWhatsApp() {
    const text = encodeURIComponent(`Check out my rate card: ${publicUrl}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  }

  return (
    <div style={{ flex: 1, padding: 'var(--space-28)', overflowY: 'auto', minWidth: 0, width: '100%' }}>
      <style>{BENTO_CSS}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-24)', flexWrap: 'wrap', gap: 'var(--space-12)' }}>
        <div>
          <h3 style={{ margin: 0 }}>Good morning, Amara</h3>
          <p className="text-body-sm" style={{ color: 'var(--grey-600)', marginTop: 2 }}>
            Here&rsquo;s what&rsquo;s happening with your rate card today.
          </p>
        </div>
        <Link to="/creator/rate-card" className="btn btn-purple btn-sm">
          <i className="ti ti-plus" style={{ fontSize: 13 }} />
          New rate card
        </Link>
      </div>

      {/* Bento grid */}
      <div className="bento-grid">

        {/* Hero: earnings, the metric creators check first */}
        <div className="bento-hero stat-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-24)', flexWrap: 'wrap' }}>
          <div>
            <div className="stat-card-label"><i className="ti ti-cash" style={{ fontSize: 14 }} /> Earned (KES)</div>
            <div className="stat-card-value" style={{ fontSize: 44 }}>
              {statsLoading ? '…' : `${Math.round((stats?.earningsTotal ?? 84000) / 1000)}K`}
            </div>
            <div className="stat-card-delta up">
              <i className="ti ti-trending-up" style={{ fontSize: 14 }} />+22% vs last month
            </div>
          </div>
          <i className="ti ti-chart-arcs" style={{ fontSize: 56, color: 'var(--purple-100)' }} />
        </div>

        {/* Secondary stats */}
        <div className="bento-views stat-card">
          <div className="stat-card-label"><i className="ti ti-eye" style={{ fontSize: 14 }} /> Card views</div>
          <div className="stat-card-value">{statsLoading ? '…' : (stats?.profileViews ?? 1248).toLocaleString('en-KE')}</div>
          <div className="stat-card-delta up">
            <i className="ti ti-trending-up" style={{ fontSize: 14 }} />+18% this month
          </div>
        </div>

        <div className="bento-enq stat-card">
          <div className="stat-card-label"><i className="ti ti-inbox" style={{ fontSize: 14 }} /> Enquiries</div>
          <div className="stat-card-value">{statsLoading ? '…' : (stats?.enquiries?.total ?? 12)}</div>
          <div className="stat-card-delta up">
            <i className="ti ti-trending-up" style={{ fontSize: 14 }} />+4 this week
          </div>
        </div>

        <div className="bento-conv stat-card">
          <div className="stat-card-label"><i className="ti ti-star" style={{ fontSize: 14 }} /> Conversion</div>
          <div className="stat-card-value">{statsLoading ? '…' : `${stats?.cardCtr ?? 3.4}%`}</div>
          <div className="stat-card-delta down">
            <i className="ti ti-trending-down" style={{ fontSize: 14 }} />-0.2% vs last month
          </div>
        </div>

        {/* Recent enquiries table */}
        <div className="bento-table table-wrap">
          <div style={{ padding: '16px 18px', borderBottom: '0.5px solid var(--grey-100)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h5 style={{ margin: 0 }}>Recent enquiries</h5>
            <Link to="/creator/enquiries" className="btn btn-ghost btn-xs">View all</Link>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Brand</th>
                <th>Package</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {statsLoading ? (
                <tr>
                  <td colSpan={3} style={{ textAlign: 'center', color: 'var(--grey-400)' }}>Loading…</td>
                </tr>
              ) : rows.map((row, i) => {
                const tag = STATUS_TAG[row.status] ?? STATUS_TAG.completed;
                return (
                  <tr key={i} style={{ cursor: 'pointer' }}>
                    <td>
                      <div style={{ fontWeight: 500, color: 'var(--black)' }}>{row.brand}</div>
                      <div style={{ fontSize: 11.5, color: 'var(--grey-400)', marginTop: 1 }}>{row.ago}</div>
                    </td>
                    <td style={{ fontSize: 12 }}>{row.pkg}</td>
                    <td><span className={`tag ${tag.cls}`}>{tag.label}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Side rail: quick actions + rate card health */}
        <div className="bento-side">
          <div className="card card-p-md">
            <p className="card-title" style={{ fontSize: 15, marginBottom: 14 }}>Quick actions</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              <Link to="/creator/rate-card" className="btn btn-secondary btn-full" style={{ justifyContent: 'center' }}>
                <i className="ti ti-edit" style={{ fontSize: 14 }} />Edit rate card
              </Link>
              <button className="btn btn-secondary btn-full" style={{ justifyContent: 'center' }} onClick={copyPublicLink}>
                <i className="ti ti-copy" style={{ fontSize: 14 }} />Copy public link
              </button>
              <button className="btn btn-secondary btn-full" style={{ justifyContent: 'center' }} onClick={shareWhatsApp}>
                <i className="ti ti-brand-whatsapp" style={{ fontSize: 14 }} />Share on WhatsApp
              </button>
              <Link to="/creator/money" className="btn btn-secondary btn-full" style={{ justifyContent: 'center' }}>
                <i className="ti ti-cash" style={{ fontSize: 14 }} />View earnings
              </Link>
            </div>
          </div>

          <div className="card card-p-md">
            <p className="card-title" style={{ fontSize: 15, marginBottom: 14 }}>Rate card health</p>
            {healthLoading ? (
              <p style={{ fontSize: 13, color: 'var(--grey-400)' }}>Loading…</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ fontSize: 12, color: 'var(--grey-600)' }}>Profile completeness</span>
                    <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--black)' }}>{profilePct}%</span>
                  </div>
                  <ProgressBar pct={profilePct} />
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ fontSize: 12, color: 'var(--grey-600)' }}>Packages added</span>
                    <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--black)' }}>{pkgCurrent} / {pkgMax}</span>
                  </div>
                  <ProgressBar pct={pkgPct} />
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ fontSize: 12, color: 'var(--grey-600)' }}>Payment methods</span>
                    <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--black)' }}>{payCurrent} / {payMax}</span>
                  </div>
                  <ProgressBar pct={payPct} />
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}