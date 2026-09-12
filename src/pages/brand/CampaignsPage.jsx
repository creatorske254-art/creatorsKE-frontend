import { useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { usePageMeta } from '@/lib/usePageMeta'
import { IconFlame, IconClock, IconCheck, IconWallet, IconEye, IconScale, IconMessageCircle, IconBriefcase } from '@tabler/icons-react'
import EmptyState from '@/components/shared/EmptyState'
import ErrorState from '@/components/shared/ErrorState'
import Skeleton from '@/components/ui/Skeleton'
import { useBrandDashboard } from '@/features/brand-dashboard/hooks/useBrandDashboard'
import { getInitials, formatCurrency, formatDate, formatRelativeDate } from '@/lib/utils'

// This page uses the shared design tokens and component classes from the
// Creatorske stylesheet (index.css) wherever they exist there: .card,
// .stat-card, .tag*, .btn*, .avatar*, .tabs/.tab, .empty-state (the latter
// two used to live scoped here before being centralized into index.css).
// .card-dark/.card-footer are still genuinely page-specific, so they stay.

const PAGE_STYLES = `
.campaigns-page .card-dark{background:var(--black);border-radius:var(--radius-lg);color:var(--white)}

.campaigns-page .card-footer{margin-top:var(--space-16);padding-top:var(--space-16);border-top:0.5px solid var(--grey-100);display:flex;align-items:center;justify-content:space-between;gap:var(--space-8)}

/* Page-specific layout: bento grid for the top stats row only */
.campaigns-page .bento-stats{
  display:grid;
  grid-template-columns:repeat(4,1fr);
  grid-template-areas:"hero hero active active" "hero hero awaiting completed";
  gap:var(--space-16);
}
@media (max-width:900px){
  .campaigns-page .bento-stats{
    grid-template-columns:1fr 1fr;
    grid-template-areas:"hero hero" "active awaiting" "completed completed";
  }
}
@media (max-width:560px){
  .campaigns-page .bento-stats{
    grid-template-columns:1fr;
    grid-template-areas:"hero" "active" "awaiting" "completed";
  }
}
`

const STATUS = {
  in_progress: { label: 'In progress', tag: 'tag-purple', dot: 'var(--purple-600)' },
  delivered: { label: 'Awaiting your approval', tag: 'tag-warning', dot: 'var(--status-warning)' },
  disputed: { label: 'Disputed', tag: 'tag-error', dot: 'var(--status-error)' },
  completed: { label: 'Completed', tag: 'tag-success', dot: 'var(--status-success)' },
  refunded: { label: 'Refunded', tag: 'tag-default', dot: 'var(--grey-400)' },
}

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active', match: (s) => s === 'in_progress' || s === 'delivered' },
  { key: 'delivered', label: 'Awaiting approval', match: (s) => s === 'delivered' },
  { key: 'disputed', label: 'Disputed', match: (s) => s === 'disputed' },
  { key: 'history', label: 'History', match: (s) => s === 'completed' || s === 'refunded' },
]

// Response schema for GET /brands/campaigns is undocumented (see CLAUDE.md) -
// field names below are best-effort guesses with graceful fallbacks, not
// confirmed contract. avatarClass is purely decorative (no such field exists
// on any documented response) so every card uses the same accent.
function describeDelivery(c) {
  switch (c.status) {
    case 'delivered': return `Marked delivered · ${formatRelativeDate(c.deliveredAt)}`
    case 'disputed':  return `Dispute opened · ${formatRelativeDate(c.disputedAt)}`
    case 'completed': return `Approved · ${formatRelativeDate(c.completedAt)}`
    case 'refunded':  return `Refunded · ${formatRelativeDate(c.refundedAt)}`
    default:          return c.expectedDeliveryAt ? `Expected ${formatDate(c.expectedDeliveryAt)}` : ''
  }
}

function normalizeCampaign(c) {
  const creatorName = c.creatorName ?? c.creator ?? 'Unknown creator'
  return {
    id: c.id,
    creator: creatorName,
    handle: c.creatorHandle ?? c.handle ?? '',
    initials: getInitials(creatorName),
    avatarClass: 'avatar-purple',
    package: c.packageName ?? c.package ?? '-',
    platform: c.platform ?? '-',
    rawPrice: Number(c.price ?? c.amount ?? 0),
    price: formatCurrency(c.price ?? c.amount),
    status: c.status ?? 'in_progress',
    deliveryDate: describeDelivery(c),
  }
}

function StatusTag({ status }) {
  const meta = STATUS[status]
  return (
    <span className={`tag ${meta.tag}`}>
      <span className="sdot" style={{ background: meta.dot }} />
      {meta.label}
    </span>
  )
}

function CampaignCard({ campaign, onOpen }) {
  const isDelivered = campaign.status === 'delivered'
  const isDisputed = campaign.status === 'disputed'

  return (
    <div
      className="card card-p-md"
      style={{
        cursor: 'pointer',
        borderColor: isDisputed ? 'var(--status-error)' : undefined,
      }}
      onClick={() => onOpen(campaign.id)}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-12)' }}>
        <div className={`avatar avatar-md ${campaign.avatarClass}`}>{campaign.initials}</div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-8)', flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--black)' }}>{campaign.creator}</div>
              <div style={{ fontSize: 12, color: 'var(--grey-400)' }}>{campaign.handle}</div>
            </div>
            <StatusTag status={campaign.status} />
          </div>

          <div className="text-body-sm" style={{ color: 'var(--grey-600)', marginTop: 'var(--space-8)' }}>
            {campaign.package} · {campaign.platform} · {campaign.price}
          </div>
          <div style={{ fontSize: 12, color: 'var(--grey-400)', marginTop: 'var(--space-4)' }}>{campaign.deliveryDate}</div>

          <div className="card-footer" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', gap: 'var(--space-8)', alignItems: 'center' }}>
              {isDelivered && (
                <Link to={`/brand/campaigns/${campaign.id}`} className="btn btn-purple btn-sm">
                  <IconEye className="icon-sm" />
                  Review delivery
                </Link>
              )}
              {isDisputed && (
                <Link to={`/brand/campaigns/${campaign.id}`} className="btn btn-secondary btn-sm">
                  <IconScale className="icon-sm" />
                  View dispute
                </Link>
              )}
              {!isDelivered && !isDisputed && (
                <Link to={`/brand/campaigns/${campaign.id}`} className="btn btn-secondary btn-sm">
                  View details
                </Link>
              )}
            </div>
            <Link to={`/brand/campaigns/${campaign.id}#messages`} className="btn btn-square btn-icon-style" title="Messages">
              <IconMessageCircle className="icon-sm" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CampaignsPage() {
  usePageMeta('Campaigns', 'Track every booking from in-progress to completed on Creatorske.');
  const navigate = useNavigate()
  // ?filter= lets other pages (the sidebar's "Campaign history" entry) deep-link
  // straight to a tab instead of dumping the user on "All".
  const [searchParams, setSearchParams] = useSearchParams()
  const filterParam = searchParams.get('filter')
  const activeFilter = FILTERS.some((f) => f.key === filterParam) ? filterParam : 'all'
  const setActiveFilter = (key) => {
    const next = new URLSearchParams(searchParams)
    if (key && key !== 'all') next.set('filter', key); else next.delete('filter')
    setSearchParams(next, { replace: true })
  }

  const { campaigns: rawCampaigns, isLoadingCampaigns, isCampaignsError, refetchCampaigns } = useBrandDashboard()
  const campaigns = useMemo(() => rawCampaigns.map(normalizeCampaign), [rawCampaigns])

  const counts = useMemo(() => {
    const active = campaigns.filter((c) => c.status === 'in_progress' || c.status === 'delivered').length
    const awaiting = campaigns.filter((c) => c.status === 'delivered').length
    const completed = campaigns.filter((c) => c.status === 'completed').length
    const spent = campaigns
      .filter((c) => c.status === 'completed')
      .reduce((sum, c) => sum + c.rawPrice, 0)
    return { active, awaiting, completed, spent }
  }, [campaigns])

  const filtered = useMemo(() => {
    const filterDef = FILTERS.find((f) => f.key === activeFilter)
    return campaigns.filter((c) => !filterDef?.match || filterDef.match(c.status))
  }, [campaigns, activeFilter])

  const handleOpen = (id) => navigate(`/brand/campaigns/${id}`)
  const clearFilters = () => setActiveFilter('all')

  return (
    <div className="campaigns-page w-full">
      <style>{PAGE_STYLES}</style>

      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-24)', flexWrap: 'wrap', gap: 'var(--space-12)' }}>
        <div>
          <h2 className="page-title" style={{ marginBottom: 'var(--space-2)' }}>Campaigns</h2>
          <p className="page-subtitle">
            Track every booking from in-progress to completed.
          </p>
        </div>
      </div>

      {/* Summary stats: bento grid, total spend as the hero tile */}
      <div className="bento-stats" style={{ marginBottom: 'var(--space-20)' }}>
        <div
          className="card-dark card-p-lg"
          style={{ gridArea: 'hero', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
        >
          {/* Mixed from the tile's own text colour so it stays legible when the
              inverted tile flips to a light surface in dark mode. */}
          <div className="stat-card-label" style={{ color: 'color-mix(in srgb, var(--white) 60%, var(--black))' }}>
            <IconWallet className="icon-sm" />
            Total spent
          </div>
          <div>
            <div className="stat-card-value" style={{ color: 'var(--white)' }}>
              {isLoadingCampaigns ? <Skeleton width={80} height={24} /> : formatCurrency(counts.spent)}
            </div>
            <div className="text-body-sm" style={{ color: 'var(--purple-400)', marginTop: 'var(--space-4)' }}>
              Across {counts.completed} completed {counts.completed === 1 ? 'campaign' : 'campaigns'}
            </div>
          </div>
        </div>

        <div className="stat-card" style={{ gridArea: 'active' }}>
          <div className="stat-card-label">
            <IconFlame className="icon-sm" />
            Active campaigns
          </div>
          <div className="stat-card-value">{isLoadingCampaigns ? <Skeleton width={30} height={22} /> : counts.active}</div>
        </div>

        <div className="stat-card" style={{ gridArea: 'awaiting' }}>
          <div className="stat-card-label">
            <IconClock className="icon-sm" />
            Awaiting approval
          </div>
          <div className="stat-card-value">{isLoadingCampaigns ? <Skeleton width={30} height={22} /> : counts.awaiting}</div>
        </div>

        <div className="stat-card" style={{ gridArea: 'completed' }}>
          <div className="stat-card-label">
            <IconCheck className="icon-sm" />
            Completed
          </div>
          <div className="stat-card-value">{isLoadingCampaigns ? <Skeleton width={30} height={22} /> : counts.completed}</div>
        </div>
      </div>

      {/* Filter pills */}
      <div className="tabs" style={{ marginBottom: 'var(--space-20)', flexWrap: 'wrap' }}>
        {FILTERS.map((f) => (
          <button
            key={f.key}
            className={`tab${activeFilter === f.key ? ' active' : ''}`}
            onClick={() => setActiveFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Campaign list */}
      {isCampaignsError ? (
        <div className="card">
          <ErrorState onRetry={refetchCampaigns} />
        </div>
      ) : isLoadingCampaigns ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-12)' }}>
          {[0, 1, 2].map((i) => <Skeleton key={i} width="100%" height={92} style={{ borderRadius: 'var(--radius-lg)' }} />)}
        </div>
      ) : filtered.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-12)' }}>
          {filtered.map((c) => (
            <CampaignCard key={c.id} campaign={c} onOpen={handleOpen} />
          ))}
        </div>
      ) : (
        <div className="card">
          <EmptyState
            icon={<IconBriefcase />}
            title={campaigns.length === 0 ? 'No campaigns yet' : 'No campaigns match your filters'}
            description={campaigns.length === 0 ? 'Book a creator from the directory to start your first campaign.' : 'Try a different status filter or clear your search.'}
            action={
              campaigns.length === 0 ? (
                <Link to="/directory" className="btn btn-secondary btn-sm">Browse creators</Link>
              ) : (
                <button className="btn btn-secondary btn-sm" onClick={clearFilters}>
                  Clear filters
                </button>
              )
            }
          />
        </div>
      )}
    </div>
  )
}