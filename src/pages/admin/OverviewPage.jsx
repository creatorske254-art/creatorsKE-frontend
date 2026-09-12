import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePageMeta } from '@/lib/usePageMeta';
import { useAdmin } from '@/features/admin/hooks/useAdmin';
import DemoTag from '@/components/shared/DemoTag';
import { useDemoFallback } from '@/lib/useDemoFallback';
import { DEMO_ADMIN_STATS, DEMO_PLATFORM_GROWTH, DEMO_ENQUIRY_VOLUME, DEMO_ABANDONED_DRAFTS, DEMO_ESCROW_AGING, DEMO_DISPUTES_BY_OUTCOME } from '@/lib/demoData';
import { ChartFrame, ChartPeriod, TrendChart, BarChart, SERIES } from '@/components/charts';
import { useDisputes } from '@/features/admin/hooks/useDisputes';
import { useFlaggedAccounts } from '@/features/admin/hooks/useFlaggedAccounts';
import { formatCurrency, getInitials } from '@/lib/utils';
import Modal from '@/components/ui/Modal';
import { IconAlertTriangle, IconArrowRight, IconFlag3, IconStarFilled } from '@tabler/icons-react';

// A small "Demo data" tag for sections with no backing endpoint yet (see the
// production-readiness plan's backend spec) - kept visible rather than
// silently passed off as real.

// GET /admin/stats' response schema is undocumented - these are best-effort
// field-name guesses with a "-" fallback rather than fabricated numbers.
// No delta/trend field exists on any documented response, so unlike the
// original mock these show a plain value with no invented "+34 this week".
const HEALTH_METRICS_DEF = [
  { label: "Active creators", field: "activeCreators" },
  { label: "Registered brands", field: "registeredBrands" },
  { label: "Live rate cards", field: "liveRateCards" },
  { label: "Enquiries (7 days)", field: "enquiriesLast7Days" },
  { label: "Bookings in progress", field: "bookingsInProgress" },
  { label: "Completed (month)", field: "completedThisMonth" },
  { label: "Transaction volume", field: "transactionVolume", currency: true },
  { label: "Platform fees collected", field: "platformFeesCollected", currency: true },
];

// Demo-only sections below (escrow queue, flagged reviews, draft/enquiry
// charts, re-engagement queue) have no backing endpoint at all - see the
// production-readiness plan's backend spec. Left in place as illustrative
// placeholders, clearly tagged, rather than removed or silently treated as real.

const ESCROW_QUEUE = [
  { id: "B-204", creator: "Lena Wachira", brand: "Jumia Kenya", amount: "KES 18,500", overdue: "2 days", initials: "LW" },
  { id: "B-198", creator: "Kofi Mensah", brand: "Zuri Skincare", amount: "KES 32,000", overdue: "5 days", initials: "KM" },
];

const RECENT_REVIEWS = [
  { id: "R-41", reviewer: "Nala Foods", creator: "Mwangi Osei", stars: 2, flagged: true, reason: "Contains personal insult", excerpt: "Absolutely useless, this person is a complete…" },
  { id: "R-39", reviewer: "Kasha", creator: "Amara Muriithi", stars: 5, flagged: false, reason: null, excerpt: "Delivered ahead of schedule, high quality content…" },
];

// Tiny helpers
function Stars({ n }) {
  return (
    <span style={{ display: "inline-flex", gap: 'var(--space-2)' }}>
      {[1,2,3,4,5].map(i => (
        <IconStarFilled key={i} className="icon-xs" style={{ color: i <= n ? "var(--status-warning)" : "var(--grey-200)" }} aria-hidden="true" />
      ))}
    </span>
  );
}

function SectionHead({ title, action, actionLabel }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 'var(--space-16)' }}>
      <h2 className="section-title">{title}</h2>
      {action && (
        <button className="btn btn-ghost btn-xs" onClick={action}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}

// Mini bar chart - bespoke, no canonical equivalent
// Alert banner - bespoke, no canonical equivalent (closest is .alert in index.css
// but that's scoped to a different component; kept local, tokens fixed)
function Alert({ type = "warning", icon: Icon, children }) {
  const styles = {
    warning: { bg: "var(--status-warning-bg)", text: "var(--status-warning-text)", border: "rgba(245,158,11,0.25)" },
    info: { bg: "var(--status-info-bg)", text: "var(--status-info-text)", border: "rgba(6,182,212,0.2)" },
    error: { bg: "var(--status-error-bg)", text: "var(--status-error-text)", border: "rgba(239,68,68,0.2)" },
  }[type];
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 'var(--space-12)', padding: "var(--space-12) var(--space-16)", borderRadius: "var(--radius-md)", background: styles.bg, border: `0.5px solid ${styles.border}`, color: styles.text, fontSize: 12.5, lineHeight: 1.55, marginBottom: 'var(--space-12)' }}>
      <Icon className="icon-sm" style={{ marginTop: 'var(--space-2)' }} aria-hidden="true" />
      <span>{children}</span>
    </div>
  );
}

// Initials avatar - dynamic per-item tint color, no fixed canonical variant
// fits (unlike the small fixed --tint-* set), so this stays bespoke; base
// shape/font now reuse .avatar.
function Initials({ letters, color = "var(--purple-500)", size = 34 }) {
  return (
    <div
      className="avatar"
      style={{ width: size, height: size, background: color + "18", border: `1.5px solid ${color}35`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.38, color, flexShrink: 0 }}
    >
      {letters}
    </div>
  );
}

// Status pill → canonical .tag variants
function StatusPill({ status }) {
  const map = {
    evidence_open: { label: "Evidence open", cls: "tag-error" },
    under_review:  { label: "Under review",  cls: "tag-warning" },
    resolved:      { label: "Resolved",      cls: "tag-success" },
  };
  const s = map[status] ?? map.under_review;
  return <span className={`tag ${s.cls}`}>{s.label}</span>;
}

// Page
export default function OverviewPage() {
  usePageMeta('Admin Overview', 'Platform health, open items, and activity across all Creatorske users.');
  const navigate = useNavigate();
  const [period, setPeriod] = useState("7d");
  const [emailCopyOpen, setEmailCopyOpen] = useState(false);

  const { stats, isLoading: statsLoading, isError: statsError } = useAdmin();
  const { disputes: rawDisputes, openDisputeCount, isLoading: disputesLoading, isError: disputesError } = useDisputes();

  // ── Charts ───────────────────────────────────────────────────────────────
  // GET /admin/stats is expected to carry these series (see BACKEND_API_SPEC.md);
  // until it does, dev builds show the tagged samples.
  const statsFallback = useDemoFallback({ data: stats, isError: statsError, isLoading: statsLoading }, null);
  const growthRows = statsFallback.isDemo ? DEMO_PLATFORM_GROWTH : (stats?.growth ?? []);
  const enquiryRows = useMemo(() => {
    const raw = statsFallback.isDemo ? DEMO_ENQUIRY_VOLUME : (stats?.enquiryTimeline ?? []);
    const n = period === '7d' ? 7 : period === '90d' ? 90 : 30;
    return raw.slice(-n).map((d) => ({
      label: d.label ?? (d.date ? new Date(`${d.date}T00:00:00`).toLocaleDateString('en-KE', { month: 'short', day: 'numeric' }) : ''),
      count: Number(d.count ?? d.value ?? 0),
    }));
  }, [statsFallback.isDemo, stats, period]);
  const enquiryTotal = enquiryRows.reduce((a, r) => a + r.count, 0);
  const draftRows = statsFallback.isDemo ? DEMO_ABANDONED_DRAFTS : (stats?.abandonedDraftsByStep ?? []);
  const escrowRows = statsFallback.isDemo ? DEMO_ESCROW_AGING : (stats?.escrowAging ?? []);

  // Disputes by outcome per month, grouped from the dispute list itself.
  const disputesFallback = useDemoFallback({ data: rawDisputes, isError: disputesError, isLoading: disputesLoading }, null);
  const disputeRows = useMemo(() => {
    if (disputesFallback.isDemo) return DEMO_DISPUTES_BY_OUTCOME;
    const months = new Map();
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.set(`${d.getFullYear()}-${d.getMonth()}`, { label: d.toLocaleDateString('en-KE', { month: 'short' }), creator: 0, brand: 0, split: 0 });
    }
    for (const d of rawDisputes) {
      const at = new Date(d.resolvedAt ?? d.decidedAt ?? d.raisedAt ?? d.createdAt ?? NaN);
      const row = Number.isNaN(at.getTime()) ? null : months.get(`${at.getFullYear()}-${at.getMonth()}`);
      if (!row) continue;
      const outcome = (d.decision ?? d.outcome ?? '').toString().toLowerCase();
      if (outcome.includes('creator')) row.creator += 1;
      else if (outcome.includes('brand')) row.brand += 1;
      else if (outcome) row.split += 1;
    }
    return [...months.values()];
  }, [rawDisputes, disputesFallback.isDemo]);
  const { accounts: rawFlagged, flaggedAccountCount, isLoading: flaggedLoading } = useFlaggedAccounts();

  const openDisputes = useMemo(() => rawDisputes
    .filter((d) => (d.status ?? 'evidence') !== 'resolved' && (d.status ?? 'evidence') !== 'decided')
    .slice(0, 3)
    .map((d) => ({
      id: d.id,
      creator: d.creatorName ?? d.creator?.name ?? 'Unknown creator',
      brand: d.brandName ?? d.brand?.name ?? 'Unknown brand',
      package: d.packageName ?? d.package ?? 'Booking dispute',
      raised: d.raisedAt ?? d.createdAt ?? '',
      status: d.status === 'evidence' ? 'evidence_open' : 'under_review',
    })), [rawDisputes]);

  const flaggedAccounts = useMemo(() => rawFlagged.slice(0, 2).map((a) => {
    const name = a.name ?? 'Unknown account';
    return {
      name,
      type: a.type ?? 'brand',
      reason: a.flag?.reason ?? a.flagReason ?? 'Flagged for review.',
      flagged: a.flag?.flaggedOn ?? a.flaggedAt ?? '',
      initials: getInitials(name),
      color: "var(--status-warning)",
    };
  }), [rawFlagged]);

  return (
    <div style={{ fontFamily: "var(--font-body)" }}>

      {/* Page heading */}
      <div style={{ marginBottom: 'var(--space-32)' }}>
        <h1 className="page-title" style={{ marginBottom: 'var(--space-4)' }}>
          Platform Overview{statsFallback.isDemo && <> <DemoTag /></>}
        </h1>
        <p className="page-subtitle">
          Platform health, open items requiring attention, and activity across all users.
        </p>
      </div>

      {/* Attention alerts */}
      {!disputesLoading && openDisputeCount > 0 && (
        <Alert type="error" icon={IconFlag3}>
          <strong>{openDisputeCount} open {openDisputeCount === 1 ? 'dispute' : 'disputes'}</strong> awaiting review.
        </Alert>
      )}
      {!flaggedLoading && flaggedAccountCount > 0 && (
        <Alert type="warning" icon={IconAlertTriangle}>
          <strong>{flaggedAccountCount} flagged {flaggedAccountCount === 1 ? 'account' : 'accounts'}</strong> pending verification review.
        </Alert>
      )}

      {/* Health metric grid */}
      <div className="grid grid-cols-2 md:grid-cols-4" style={{ gap: 'var(--space-16)', marginBottom: 'var(--space-32)' }}>
        {HEALTH_METRICS_DEF.map((m) => {
          const raw = (statsFallback.isDemo ? DEMO_ADMIN_STATS : stats)?.[m.field];
          const display = raw == null ? '-' : m.currency ? formatCurrency(raw) : raw.toLocaleString?.() ?? raw;
          return (
            <div className="card card-p-md" key={m.label}>
              <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--grey-400)", marginBottom: 'var(--space-8)' }}>{m.label}</div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 600, color: "var(--black)", lineHeight: 1 }}>
                {statsLoading ? <span style={{ color: 'var(--grey-200)' }}>···</span> : display}
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts row 1: growth (two series, lines) + enquiry volume (columns) */}
      <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 'var(--space-20)', marginBottom: 'var(--space-20)' }}>
        <ChartFrame
          title="Platform growth"
          subtitle="Accounts on the platform, month by month"
          legend={[{ label: 'Creators', color: SERIES[0] }, { label: 'Brands', color: SERIES[1] }]}
          loading={statsFallback.isLoading}
          empty={growthRows.length === 0}
          emptyTitle="No growth data yet"
          demo={statsFallback.isDemo}
          height={200}
        >
          <TrendChart data={growthRows} series={[{ key: 'creators', label: 'Creators' }, { key: 'brands', label: 'Brands' }]} height={200} />
        </ChartFrame>

        <ChartFrame
          title="Enquiry volume"
          subtitle={enquiryRows.length > 0 && <><strong>{enquiryTotal.toLocaleString('en-KE')}</strong> enquiries, all statuses</>}
          right={<ChartPeriod options={[{ value: '7d', label: '7D' }, { value: '30d', label: '30D' }, { value: '90d', label: '90D' }]} value={period} onChange={setPeriod} />}
          loading={statsFallback.isLoading}
          empty={enquiryRows.length === 0}
          emptyTitle="No enquiries in this period"
          demo={statsFallback.isDemo}
          height={200}
        >
          <BarChart data={enquiryRows} series={[{ key: 'count', label: 'Enquiries' }]} height={200} />
        </ChartFrame>
      </div>

      {/* Charts row 2: where drafts die (bars) · escrow aging (columns) · dispute outcomes (stacked) */}
      <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 'var(--space-20)', marginBottom: 'var(--space-32)' }}>
        <ChartFrame
          title="Abandoned drafts by step"
          subtitle="Where onboarding stalls"
          right={<button className="btn btn-ghost btn-xs" onClick={() => navigate('/admin/re-engagement')}>Re-engage</button>}
          loading={statsFallback.isLoading}
          empty={draftRows.length === 0}
          emptyTitle="No abandoned drafts"
          demo={statsFallback.isDemo}
          height={180}
        >
          <BarChart data={draftRows} series={[{ key: 'value', label: 'Drafts' }]} layout="horizontal" labels height={180} />
        </ChartFrame>

        <ChartFrame
          title="Escrow aging"
          subtitle="Bookings held, by days in escrow"
          right={<button className="btn btn-ghost btn-xs" onClick={() => navigate('/admin/escrow')}>Open cases</button>}
          loading={statsFallback.isLoading}
          empty={escrowRows.length === 0}
          emptyTitle="Nothing in escrow"
          demo={statsFallback.isDemo}
          height={180}
        >
          <BarChart data={escrowRows} series={[{ key: 'value', label: 'Bookings' }]} emphasis={(r) => /30\+/.test(r.label)} height={180} />
        </ChartFrame>

        <ChartFrame
          title="Dispute outcomes"
          subtitle="Decisions per month"
          legend={[{ label: 'For creator', color: SERIES[0] }, { label: 'For brand', color: SERIES[1] }, { label: 'Split', color: SERIES[2] }]}
          loading={disputesFallback.isLoading}
          empty={disputeRows.every((r) => !r.creator && !r.brand && !r.split)}
          emptyTitle="No decisions yet"
          demo={disputesFallback.isDemo}
          height={180}
        >
          <BarChart data={disputeRows} series={[{ key: 'creator', label: 'For creator' }, { key: 'brand', label: 'For brand' }, { key: 'split', label: 'Split' }]} stacked height={180} />
        </ChartFrame>
      </div>

      {/* Bottom three-col */}
      <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 'var(--space-20)', marginBottom: 'var(--space-32)' }}>

        {/* Open disputes */}
        <div className="card">
          <div style={{ padding: "var(--space-16) var(--space-20)", borderBottom: "0.5px solid var(--grey-100)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 className="section-title">Open disputes</h2>
            <span className="tag tag-default">{disputesLoading ? '···' : openDisputeCount} open</span>
          </div>
          <div style={{ padding: "var(--space-4) 0" }}>
            {disputesLoading ? (
              <div style={{ padding: 'var(--space-20)', display: 'flex', flexDirection: 'column', gap: 'var(--space-12)' }}>
                {[0, 1].map((i) => <div key={i} className="skeleton" style={{ height: 40, borderRadius: 'var(--radius-md)' }} />)}
              </div>
            ) : openDisputes.length === 0 ? (
              <div style={{ padding: "var(--space-32) var(--space-20)", textAlign: "center", fontSize: 13, color: "var(--grey-400)" }}>No open disputes.</div>
            ) : openDisputes.map((d, i) => (
              <div key={d.id} style={{ padding: "var(--space-16) var(--space-20)", borderBottom: i < openDisputes.length - 1 ? "0.5px solid var(--grey-100)" : "none" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 'var(--space-8)' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--black)" }}>{d.creator}</div>
                  <StatusPill status={d.status} />
                </div>
                <div style={{ fontSize: 12, color: "var(--grey-500)", marginBottom: 'var(--space-4)' }}>{d.brand} · {d.package}</div>
                <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center" }}>
                  <button className="btn btn-ghost btn-xs" style={{ border: "none", padding: 0 }} onClick={() => navigate('/admin/disputes')}>Review <IconArrowRight className="icon-xs" aria-hidden="true" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Flagged accounts */}
        <div className="card">
          <div style={{ padding: "var(--space-16) var(--space-20)", borderBottom: "0.5px solid var(--grey-100)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 className="section-title">Flagged accounts</h2>
            <span className="tag tag-error">{flaggedLoading ? '···' : flaggedAccountCount} pending</span>
          </div>
          <div style={{ padding: "var(--space-4) 0" }}>
            {flaggedLoading ? (
              <div style={{ padding: 'var(--space-20)', display: 'flex', flexDirection: 'column', gap: 'var(--space-12)' }}>
                {[0, 1].map((i) => <div key={i} className="skeleton" style={{ height: 40, borderRadius: 'var(--radius-md)' }} />)}
              </div>
            ) : flaggedAccounts.length === 0 ? (
              <div style={{ padding: "var(--space-32) var(--space-20)", textAlign: "center", fontSize: 13, color: "var(--grey-400)" }}>No flagged accounts.</div>
            ) : flaggedAccounts.map((a, i) => (
              <div key={a.name} style={{ padding: "var(--space-16) var(--space-20)", borderBottom: i < flaggedAccounts.length - 1 ? "0.5px solid var(--grey-100)" : "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 'var(--space-12)', marginBottom: 'var(--space-8)' }}>
                  <Initials letters={a.initials} color={a.color} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--black)" }}>{a.name}</div>
                    <div style={{ fontSize: 11, color: "var(--grey-400)", textTransform: 'capitalize' }}>{a.type}</div>
                  </div>
                </div>
                <div style={{ fontSize: 12, color: "var(--grey-500)", marginBottom: 'var(--space-12)' }}>{a.reason}</div>
                <div style={{ display: "flex", gap: 'var(--space-8)' }}>
                  <button className="btn btn-primary btn-xs" style={{ flex: 1 }} onClick={() => navigate('/admin/accounts')}>Review</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Escrow queue + flagged reviews stacked */}
        <div style={{ display: "flex", flexDirection: "column", gap: 'var(--space-20)' }}>

          {/* Escrow timeout queue */}
          <div className="card">
            <div style={{ padding: "var(--space-16) var(--space-20)", borderBottom: "0.5px solid var(--grey-100)", display: 'flex', alignItems: 'center', gap: 'var(--space-8)' }}>
              <h2 className="section-title">Escrow timeout queue</h2>
              <DemoTag />
            </div>
            <div style={{ padding: "var(--space-4) 0" }}>
              {ESCROW_QUEUE.map((e, i) => (
                <div key={e.id} style={{ padding: "var(--space-12) var(--space-20)", borderBottom: i < ESCROW_QUEUE.length - 1 ? "0.5px solid var(--grey-100)" : "none", display: "flex", alignItems: "center", gap: 'var(--space-12)' }}>
                  <Initials letters={e.initials} color="var(--grey-600)" size={30} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "var(--black)" }}>{e.creator}</div>
                    <div style={{ fontSize: 11, color: "var(--grey-400)" }}>{e.brand} · {e.amount}</div>
                  </div>
                  <span className="tag tag-error">+{e.overdue}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Flagged reviews */}
          <div className="card" style={{ flex: 1 }}>
            <div style={{ padding: "var(--space-16) var(--space-20)", borderBottom: "0.5px solid var(--grey-100)", display: 'flex', alignItems: 'center', gap: 'var(--space-8)' }}>
              <h2 className="section-title">Flagged reviews</h2>
              <DemoTag />
            </div>
            <div style={{ padding: "var(--space-4) 0" }}>
              {RECENT_REVIEWS.filter(r => r.flagged).map((r, i, arr) => (
                <div key={r.id} style={{ padding: "var(--space-12) var(--space-20)", borderBottom: i < arr.length - 1 ? "0.5px solid var(--grey-100)" : "none" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 'var(--space-4)' }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "var(--black)" }}>{r.creator}</div>
                    <Stars n={r.stars} />
                  </div>
                  <div style={{ fontSize: 12, color: "var(--grey-500)", marginBottom: 'var(--space-8)' }}>"{r.excerpt}"</div>
                  <div style={{ fontSize: 11, color: "var(--status-error-text)", marginBottom: 'var(--space-8)', display: "flex", alignItems: "center", gap: 'var(--space-4)' }}><IconFlag3 className="icon-xs" aria-hidden="true" /> {r.reason}</div>
                  <div style={{ display: "flex", gap: 'var(--space-8)' }}>
                    <button className="btn btn-danger btn-xs" onClick={() => navigate('/admin/reviews')}>Remove</button>
                    <button className="btn btn-ghost btn-xs" onClick={() => navigate('/admin/reviews')}>Dismiss</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Re-engagement email queue */}
      <div className="card">
        <div style={{ padding: "var(--space-16) var(--space-20)", borderBottom: "0.5px solid var(--grey-100)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2 className="section-title" style={{ marginBottom: 'var(--space-2)', display: 'flex', alignItems: 'center', gap: 'var(--space-8)' }}>Re-engagement email queue <DemoTag /></h2>
            <div style={{ fontSize: 12, color: "var(--grey-400)" }}>Creators who abandoned their onboarding draft for 48+ hours. Emails sent automatically.</div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => setEmailCopyOpen(true)}>
            Review email copy
          </button>
        </div>
        <div className="table-wrap" style={{ border: "none", borderRadius: 0 }}>
          <table className="data-table">
            <thead>
              <tr>
                {["Creator", "Email", "Draft abandoned", "Email sent", "Opened", "Status"].map(h => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { name: "Faith Otieno",    email: "faith@example.com",  abandoned: "3 days ago",  sent: "1 day ago",  opened: true,  status: "no_action" },
                { name: "Daniel Kariuki",  email: "daniel@example.com", abandoned: "4 days ago",  sent: "2 days ago", opened: false, status: "no_action" },
                { name: "Sila Mwamba",     email: "sila@example.com",   abandoned: "6 days ago",  sent: "4 days ago", opened: true,  status: "resumed" },
                { name: "Brenda Achieng", email: "brenda@example.com", abandoned: "7 days ago",  sent: "5 days ago", opened: false, status: "no_action" },
                { name: "James Ngugi",    email: "james@example.com",  abandoned: "8 days ago",  sent: "6 days ago", opened: true,  status: "published" },
              ].map((row) => (
                <tr key={row.email}>
                  <td style={{ fontWeight: 500, color: "var(--black)" }}>{row.name}</td>
                  <td style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>{row.email}</td>
                  <td>{row.abandoned}</td>
                  <td>{row.sent}</td>
                  <td>
                    {row.opened
                      ? <span className="tag tag-success">Yes</span>
                      : <span className="tag tag-default">No</span>}
                  </td>
                  <td>
                    {row.status === "resumed"   && <span className="tag tag-info">Resumed draft</span>}
                    {row.status === "published" && <span className="tag tag-success">Published</span>}
                    {row.status === "no_action" && <span className="tag tag-default">No action yet</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={emailCopyOpen} onClose={() => setEmailCopyOpen(false)} title="Re-engagement email" size="md">
        <p style={{ fontSize: 12.5, color: "var(--grey-500)", marginBottom: 'var(--space-16)' }}>
          Sent automatically 48 hours after a creator abandons their onboarding draft. Editing the copy needs a backend template endpoint; this shows what currently goes out.
        </p>
        <div style={{ border: "0.5px solid var(--grey-200)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
          <div style={{ padding: "var(--space-12) var(--space-16)", background: "var(--grey-50)", borderBottom: "0.5px solid var(--grey-200)", fontSize: 12.5 }}>
            <div><span style={{ color: "var(--grey-400)" }}>Subject:</span> <strong>Your rate card is almost ready, {'{{firstName}}'}</strong></div>
            <div style={{ marginTop: 'var(--space-2)' }}><span style={{ color: "var(--grey-400)" }}>From:</span> Creatorske &lt;hello@creatorske.com&gt;</div>
          </div>
          <div style={{ padding: 'var(--space-16)', fontSize: 13.5, lineHeight: 1.7, color: "var(--grey-700)" }}>
            <p>Hi {'{{firstName}}'},</p>
            <p>You started building your rate card on Creatorske but didn't finish. It's saved exactly where you left it, with {'{{packageCount}}'} package{'{{packageCount === 1 ? "" : "s"}}'} and counting.</p>
            <p>Creators with a published card get their first brand enquiry within a median of 6 days. Pick up where you left off:</p>
            <p><span className="btn btn-purple btn-sm" style={{ pointerEvents: "none" }}>Finish my rate card</span></p>
            <p style={{ color: "var(--grey-400)", fontSize: 12 }}>Not interested anymore? <u>Delete my draft</u> · <u>Unsubscribe</u></p>
          </div>
        </div>
      </Modal>

    </div>
  );
}
