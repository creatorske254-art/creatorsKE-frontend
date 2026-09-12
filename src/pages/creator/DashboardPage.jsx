import { Link, useNavigate } from 'react-router-dom';
import { useCreatorDashboard } from '../../features/creator-dashboard/hooks/useCreatorDashboard';
import { usePageMeta } from '@/lib/usePageMeta';
import Skeleton from '@/components/ui/Skeleton';
import EmptyState from '@/components/shared/EmptyState';

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
  const navigate = useNavigate();
  const {
    stats,
    statsLoading,
    statsError,
    cardHealth,
    healthLoading,
    publicUrl,
    copyPublicLink,
  } = useCreatorDashboard();

  const profilePct = cardHealth?.completeness ?? 0;
  const pkgCurrent  = cardHealth?.packages?.current ?? 0;
  const pkgMax      = cardHealth?.packages?.max ?? null; // null = unlimited (Elite tier)
  const pkgPct      = pkgMax ? Math.round((pkgCurrent / pkgMax) * 100) : 100;
  const payCurrent  = cardHealth?.paymentMethods?.current ?? 0;
  const payMax      = cardHealth?.paymentMethods?.max ?? 1;
  const payPct      = Math.round((payCurrent / payMax) * 100);

  const rows = stats?.recentEnquiries ?? [];

  function shareWhatsApp() {
    const text = encodeURIComponent(`Check out my rate card: ${publicUrl}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  }

  return (
    <div style={{ flex: 1, padding: 'var(--space-32)', overflowY: 'auto', minWidth: 0, width: '100%' }}>
      <style>{BENTO_CSS}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-24)', flexWrap: 'wrap', gap: 'var(--space-12)' }}>
        <div>
          <h3 className="page-title">Good morning, Amara</h3>
          <p className="page-subtitle">
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
              {statsLoading
                ? <Skeleton width={90} height={38} />
                : statsError ? '-' : `${Math.round((stats?.earningsTotal ?? 0) / 1000)}K`}
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
          <div className="stat-card-value">{statsLoading ? <Skeleton width={60} height={24} /> : statsError ? '-' : (stats?.profileViews ?? 0).toLocaleString('en-KE')}</div>
          <div className="stat-card-delta up">
            <i className="ti ti-trending-up" style={{ fontSize: 14 }} />+18% this month
          </div>
        </div>

        <div className="bento-enq stat-card">
          <div className="stat-card-label"><i className="ti ti-inbox" style={{ fontSize: 14 }} /> Enquiries</div>
          <div className="stat-card-value">{statsLoading ? <Skeleton width={40} height={24} /> : statsError ? '-' : (stats?.enquiries?.total ?? 0)}</div>
          <div className="stat-card-delta up">
            <i className="ti ti-trending-up" style={{ fontSize: 14 }} />+4 this week
          </div>
        </div>

        <div className="bento-conv stat-card">
          <div className="stat-card-label"><i className="ti ti-star" style={{ fontSize: 14 }} /> Conversion</div>
          <div className="stat-card-value">{statsLoading ? <Skeleton width={50} height={24} /> : statsError ? '-' : `${stats?.cardCtr ?? 0}%`}</div>
          <div className="stat-card-delta down">
            <i className="ti ti-trending-down" style={{ fontSize: 14 }} />-0.2% vs last month
          </div>
        </div>

        {/* Recent enquiries table */}
        <div className="bento-table table-wrap">
          <div style={{ padding: 'var(--space-16) var(--space-20)', borderBottom: '0.5px solid var(--grey-100)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h5 className="section-title">Recent enquiries</h5>
            <Link to="/creator/enquiries" className="btn btn-ghost btn-xs">View all</Link>
          </div>
          {!statsLoading && rows.length === 0 ? (
            <EmptyState
              icon={<i className="ti ti-inbox" style={{ fontSize: 22 }} />}
              title="No enquiries yet"
              description="Share your rate card to start getting enquiries from brands."
            />
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Brand</th>
                  <th>Package</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {statsLoading ? [0, 1, 2].map((i) => (
                  <tr key={i}>
                    <td>
                      <Skeleton width="70%" height={13} style={{ marginBottom: 'var(--space-4)' }} />
                      <Skeleton width="40%" height={11} />
                    </td>
                    <td><Skeleton width="80%" height={13} /></td>
                    <td><Skeleton width={60} height={20} style={{ borderRadius: 'var(--radius-pill)' }} /></td>
                  </tr>
                )) : rows.map((row, i) => {
                  const tag = STATUS_TAG[row.status] ?? STATUS_TAG.completed;
                  return (
                    <tr key={i} style={{ cursor: 'pointer' }} onClick={() => navigate('/creator/enquiries')}>
                      <td>
                        <div style={{ fontWeight: 500, color: 'var(--black)' }}>{row.brand}</div>
                        <div style={{ fontSize: 11.5, color: 'var(--grey-400)', marginTop: 'var(--space-2)' }}>{row.ago}</div>
                      </td>
                      <td style={{ fontSize: 12 }}>{row.pkg}</td>
                      <td><span className={`tag ${tag.cls}`}>{tag.label}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Side rail: quick actions + rate card health */}
        <div className="bento-side">
          <div className="card card-p-md">
            <p className="section-title" style={{ marginBottom: 'var(--space-16)' }}>Quick actions</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
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
            <p className="section-title" style={{ marginBottom: 'var(--space-16)' }}>Rate card health</p>
            {healthLoading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-16)' }}>
                {[0, 1, 2].map((i) => (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
                      <Skeleton width={110} height={12} />
                      <Skeleton width={28} height={12} />
                    </div>
                    <Skeleton width="100%" height={6} style={{ borderRadius: 'var(--radius-pill)' }} />
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-12)' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
                    <span style={{ fontSize: 12, color: 'var(--grey-600)' }}>Profile completeness</span>
                    <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--black)' }}>{profilePct}%</span>
                  </div>
                  <ProgressBar pct={profilePct} />
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
                    <span style={{ fontSize: 12, color: 'var(--grey-600)' }}>Packages added</span>
                    <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--black)' }}>{pkgCurrent} / {pkgMax ?? 'Unlimited'}</span>
                  </div>
                  <ProgressBar pct={pkgPct} />
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
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