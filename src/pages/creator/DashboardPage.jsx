import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCreatorDashboard } from '../../features/creator-dashboard/hooks/useCreatorDashboard';
import { useEnquiries } from '@/features/enquiry/hooks/useEnquiries';
import { useRateCard } from '@/features/rate-card/hooks/useRateCard';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { usePageMeta } from '@/lib/usePageMeta';
import { useDemoFallback } from '@/lib/useDemoFallback';
import { demoEarningsTimeline, DEMO_VIEWS_BY_DAY, DEMO_ENQUIRY_STAGES } from '@/lib/demoData';
import Skeleton from '@/components/ui/Skeleton';
import EmptyState from '@/components/shared/EmptyState';
import { ChartFrame, ChartPeriod, TrendChart, BarChart, DonutChart, Sparkline, Meter, kes } from '@/components/charts';
import { IconBrandWhatsapp, IconCash, IconCopy, IconEdit, IconEye, IconInbox, IconPlus, IconStar, IconTrendingDown, IconTrendingUp } from '@tabler/icons-react';

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

const PERIOD_OPTIONS = [{ value: '7d', label: '7D' }, { value: '30d', label: '30D' }, { value: '90d', label: '90D' }];

function shortDate(iso) {
  const d = new Date(`${iso}T00:00:00`);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString('en-KE', { month: 'short', day: 'numeric' });
}

/* Percentage change between the first and second half of a series - the
   honest "vs previous period" when the API gives a timeline but no delta. */
function halfDelta(values) {
  if (!values || values.length < 4) return null;
  const mid = Math.floor(values.length / 2);
  const a = values.slice(0, mid).reduce((x, y) => x + y, 0);
  const b = values.slice(mid).reduce((x, y) => x + y, 0);
  if (!a) return null;
  return Math.round(((b - a) / a) * 100);
}

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
}

function Delta({ value, suffix = 'vs previous period' }) {
  if (value === null || value === undefined) return null;
  const up = value >= 0;
  return (
    <div className={`stat-card-delta ${up ? 'up' : 'down'}`}>
      {up ? <IconTrendingUp className="icon-sm" aria-hidden="true" /> : <IconTrendingDown className="icon-sm" aria-hidden="true" />}
      {up ? '+' : ''}{value}% {suffix}
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
      "trend trend trend side"
      "stage stage daily daily"
      "table table table table";
    gap: var(--space-16);
  }
  .bento-hero  { grid-area: hero; }
  .bento-views { grid-area: views; }
  .bento-enq   { grid-area: enq; }
  .bento-conv  { grid-area: conv; }
  .bento-trend { grid-area: trend; }
  .bento-stage { grid-area: stage; }
  .bento-daily { grid-area: daily; }
  .bento-table { grid-area: table; }
  .bento-side  { grid-area: side; display: flex; flex-direction: column; gap: var(--space-16); }
  .bento-grid .stat-card { display: flex; flex-direction: column; }
  .bento-grid .stat-card .sparkline { margin-top: auto; padding-top: var(--space-8); }

  @media (max-width: 900px) {
    .bento-grid {
      grid-template-columns: repeat(2, 1fr);
      grid-template-areas:
        "hero  hero"
        "views enq"
        "conv  conv"
        "trend trend"
        "stage stage"
        "daily daily"
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
        "trend"
        "stage"
        "daily"
        "table"
        "side";
    }
  }
`;

export default function DashboardPage() {
  usePageMeta('Creator Dashboard', 'Track your earnings, enquiries, and rate card performance on Creatorske.');
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    stats,
    statsLoading,
    statsError,
    earningsTimeline,
    earningsLoading,
    earningsError,
    earningsPeriod,
    setEarningsPeriod,
    cardHealth,
    healthLoading,
    primaryCardId,
    publicUrl,
    copyPublicLink,
  } = useCreatorDashboard();

  // ── Chart data ─────────────────────────────────────────────────────────
  // Earnings: GET /payments/earnings/timeline -> [{ date, amount }]
  const earnings = useDemoFallback(
    { data: earningsTimeline, isError: !!earningsError, isLoading: earningsLoading },
    demoEarningsTimeline(earningsPeriod),
  );
  const earningsRows = useMemo(
    () => (Array.isArray(earnings.data) ? earnings.data : []).map((d) => ({ label: shortDate(d.date ?? d.label ?? ''), amount: Number(d.amount ?? d.value ?? 0) })),
    [earnings.data],
  );
  const earningsValues = earningsRows.map((r) => r.amount);
  const earningsTotal = earningsValues.reduce((a, b) => a + b, 0);

  // Card views by day: GET /rate-cards/:id/analytics -> { views: [{ date, count }] } (shape unconfirmed)
  const { analyticsQuery } = useRateCard(primaryCardId);
  const views = useDemoFallback(
    { data: analyticsQuery?.data, isError: analyticsQuery?.isError || (!primaryCardId && !healthLoading), isLoading: analyticsQuery?.isLoading },
    DEMO_VIEWS_BY_DAY,
  );
  const viewRows = useMemo(() => {
    const raw = Array.isArray(views.data) ? views.data : (views.data?.views ?? views.data?.viewsByDay ?? views.data?.timeline ?? []);
    return (Array.isArray(raw) ? raw : []).map((d) => ({ label: shortDate(d.date ?? d.label ?? ''), views: Number(d.views ?? d.count ?? d.value ?? 0) }));
  }, [views.data]);
  const viewValues = viewRows.map((r) => r.views);
  const peakViews = Math.max(0, ...viewValues);

  // Enquiries by stage: real pipeline counts from GET /enquiries
  const enquiriesQuery = useEnquiries();
  const stages = useDemoFallback(
    { data: enquiriesQuery.pipelineCounts, isError: !!enquiriesQuery.error, isLoading: enquiriesQuery.isLoading },
    null,
  );
  const stageRows = stages.isDemo
    ? DEMO_ENQUIRY_STAGES
    : [
        { label: 'New', value: stages.data?.new ?? 0 },
        { label: 'In review', value: stages.data?.in_review ?? 0 },
        { label: 'Booked', value: stages.data?.booked ?? 0 },
        { label: 'Completed', value: stages.data?.completed ?? 0 },
      ];
  const stageTotal = stageRows.reduce((a, r) => a + r.value, 0);
  const bookedRate = stageTotal ? Math.round(((stageRows[2].value + stageRows[3].value) / stageTotal) * 100) : null;

  const profilePct = cardHealth?.completeness ?? 0;
  const pkgCurrent  = cardHealth?.packages?.current ?? 0;
  const pkgMax      = cardHealth?.packages?.max ?? null; // null = unlimited (Elite tier)
  const payCurrent  = cardHealth?.paymentMethods?.current ?? 0;
  const payMax      = cardHealth?.paymentMethods?.max ?? 1;

  const rows = stats?.recentEnquiries ?? [];

  function shareWhatsApp() {
    const text = encodeURIComponent(`Check out my rate card: ${publicUrl}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  }

  return (
    <div style={{ minWidth: 0, width: '100%' }}>
      <style>{BENTO_CSS}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-24)', flexWrap: 'wrap', gap: 'var(--space-12)' }}>
        <div>
          <h3 className="page-title">{greeting()}, {user?.firstName || user?.name?.split(' ')[0] || 'there'}</h3>
          <p className="page-subtitle">
            Here&rsquo;s what&rsquo;s happening with your rate card today.
          </p>
        </div>
        <Link to="/creator/rate-card" className="btn btn-purple btn-sm">
          <IconPlus className="icon-sm" aria-hidden="true" />
          New rate card
        </Link>
      </div>

      {/* Bento grid */}
      <div className="bento-grid">

        {/* Hero: earnings, the metric creators check first */}
        <div className="bento-hero stat-card" style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-24)', flexWrap: 'wrap' }}>
          <div>
            <div className="stat-card-label"><IconCash className="icon-sm" aria-hidden="true" /> Earned (KES)</div>
            <div className="stat-card-value" style={{ fontSize: 44 }}>
              {statsLoading
                ? <Skeleton width={90} height={38} />
                : statsError && !earnings.isDemo ? '-' : `${Math.round((stats?.earningsTotal ?? earningsTotal) / 1000)}K`}
            </div>
            <Delta value={stats?.earningsDelta ?? halfDelta(earningsValues)} suffix={`vs previous ${earningsPeriod}`} />
          </div>
          <div style={{ flex: '1 1 200px', maxWidth: 320, minWidth: 0 }}>
            {!earnings.isLoading && <Sparkline data={earningsValues} trend={(halfDelta(earningsValues) ?? 0) >= 0 ? 'up' : 'down'} height={56} />}
          </div>
        </div>

        {/* Secondary stats */}
        <div className="bento-views stat-card">
          <div className="stat-card-label"><IconEye className="icon-sm" aria-hidden="true" /> Card views</div>
          <div className="stat-card-value">{statsLoading ? <Skeleton width={60} height={24} /> : statsError && !views.isDemo ? '-' : (stats?.profileViews ?? viewValues.reduce((a, b) => a + b, 0)).toLocaleString('en-KE')}</div>
          <Delta value={stats?.profileViewsDelta ?? halfDelta(viewValues)} suffix="vs previous 7 days" />
          {!views.isLoading && <Sparkline data={viewValues} trend={(halfDelta(viewValues) ?? 0) >= 0 ? 'up' : 'down'} />}
        </div>

        <div className="bento-enq stat-card">
          <div className="stat-card-label"><IconInbox className="icon-sm" aria-hidden="true" /> Enquiries</div>
          <div className="stat-card-value">{statsLoading ? <Skeleton width={40} height={24} /> : statsError && !stages.isDemo ? '-' : (stats?.enquiries?.total ?? stageTotal)}</div>
          <div className="stat-card-delta" style={{ color: 'var(--grey-500)' }}>{stageRows[0].value} new awaiting a reply</div>
          <div style={{ marginTop: 'auto', paddingTop: 'var(--space-12)' }}>
            <Meter value={stageRows[0].value} max={Math.max(1, stageTotal)} detail={null} />
          </div>
        </div>

        <div className="bento-conv stat-card">
          <div className="stat-card-label"><IconStar className="icon-sm" aria-hidden="true" /> Conversion</div>
          <div className="stat-card-value">{statsLoading ? <Skeleton width={50} height={24} /> : statsError && bookedRate === null ? '-' : `${stats?.cardCtr ?? bookedRate ?? 0}%`}</div>
          <div className="stat-card-delta" style={{ color: 'var(--grey-500)' }}>enquiries that became bookings</div>
          <div style={{ marginTop: 'auto', paddingTop: 'var(--space-12)' }}>
            <Meter value={stats?.cardCtr ?? bookedRate ?? 0} max={100} detail={null} />
          </div>
        </div>

        {/* Earnings over time - the one chart a creator reads first */}
        <ChartFrame
          className="bento-trend"
          title="Earnings"
          subtitle={!earnings.isLoading && <><strong>{kes(earningsTotal)}</strong> last {earningsPeriod.replace('d', ' days')}</>}
          right={<ChartPeriod options={PERIOD_OPTIONS} value={earningsPeriod} onChange={setEarningsPeriod} />}
          loading={earnings.isLoading}
          error={!earnings.isDemo && earningsError}
          empty={earningsRows.length === 0}
          emptyTitle="No earnings yet"
          emptyDescription="Completed bookings will chart here."
          demo={earnings.isDemo}
          height={200}
        >
          <TrendChart data={earningsRows} series={[{ key: 'amount', label: 'Earnings' }]} format={kes} height={200} />
        </ChartFrame>

        {/* Enquiries by stage - part-to-whole, four buckets */}
        <ChartFrame
          className="bento-stage"
          title="Enquiries by stage"
          subtitle="Where your pipeline sits right now"
          right={<Link to="/creator/enquiries" className="btn btn-ghost btn-xs">Open pipeline</Link>}
          loading={stages.isLoading}
          empty={stageTotal === 0}
          emptyTitle="No enquiries yet"
          emptyDescription="Brands' enquiries will break down by stage here."
          demo={stages.isDemo}
          height={160}
        >
          <DonutChart data={stageRows} centerLabel="Enquiries" />
        </ChartFrame>

        {/* Card views by day - columns, the peak day emphasised */}
        <ChartFrame
          className="bento-daily"
          title="Card views"
          subtitle={viewRows.length > 0 && <><strong>{viewValues.reduce((a, b) => a + b, 0).toLocaleString('en-KE')}</strong> last {viewRows.length} days</>}
          loading={views.isLoading}
          empty={viewRows.length === 0}
          emptyTitle="No views yet"
          emptyDescription="Publish your rate card and share the link to start tracking views."
          demo={views.isDemo}
          height={160}
        >
          <BarChart data={viewRows} series={[{ key: 'views', label: 'Views' }]} emphasis={(row) => row.views === peakViews} height={160} />
        </ChartFrame>

        {/* Recent enquiries table */}
        <div className="bento-table table-wrap">
          <div style={{ padding: 'var(--space-16) var(--space-20)', borderBottom: '0.5px solid var(--grey-100)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h5 className="section-title">Recent enquiries</h5>
            <Link to="/creator/enquiries" className="btn btn-ghost btn-xs">View all</Link>
          </div>
          {!statsLoading && rows.length === 0 ? (
            <EmptyState
              icon={<IconInbox />}
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
                <IconEdit className="icon-sm" aria-hidden="true" />Edit rate card
              </Link>
              <button className="btn btn-secondary btn-full" style={{ justifyContent: 'center' }} onClick={copyPublicLink}>
                <IconCopy className="icon-sm" aria-hidden="true" />Copy public link
              </button>
              <button className="btn btn-secondary btn-full" style={{ justifyContent: 'center' }} onClick={shareWhatsApp}>
                <IconBrandWhatsapp className="icon-sm" aria-hidden="true" />Share on WhatsApp
              </button>
              <Link to="/creator/money" className="btn btn-secondary btn-full" style={{ justifyContent: 'center' }}>
                <IconCash className="icon-sm" aria-hidden="true" />View earnings
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
                <Meter label="Profile completeness" value={profilePct} max={100} status={profilePct < 50 ? 'warning' : undefined} />
                <Meter label="Packages added" value={pkgCurrent} max={pkgMax ?? Math.max(pkgCurrent, 1)} detail={`${pkgCurrent} / ${pkgMax ?? 'Unlimited'}`} />
                <Meter label="Payment methods" value={payCurrent} max={payMax} status={payCurrent === 0 ? 'warning' : undefined} />
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}