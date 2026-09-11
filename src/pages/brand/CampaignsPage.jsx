import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { usePageMeta } from '@/lib/usePageMeta'
import { IconFlame, IconClock, IconCheck, IconWallet, IconEye, IconScale, IconMessageCircle, IconBriefcase } from '@tabler/icons-react'

// TODO: swap mock data for features/brand-dashboard/hooks/useBrandDashboard.js
// const { campaigns, isLoading } = useBrandDashboard()

// This page uses the shared design tokens and component classes from the
// Creatorske stylesheet (index.css) wherever they exist there: .card,
// .stat-card, .tag*, .btn*, .avatar*. A handful of components shown in the
// Creatorske Component Library (.tabs/.tab, .card-dark, .card-footer,
// .empty-state) are documented there but aren't actually shipped in
// index.css yet, so this page defines them itself below, copied 1:1 from
// the component library's own CSS (same property values, same tokens) and
// scoped under .campaigns-page. That keeps this page visually true to the
// library without depending on index.css being updated first.

const PAGE_STYLES = `
/* Ported 1:1 from the Creatorske Component Library */
.campaigns-page .tabs{display:inline-flex;background:var(--white);border:0.5px solid var(--grey-100);border-radius:var(--radius-lg);padding:4px;gap:2px}
.campaigns-page .tab{margin:0;padding:8px 16px;border-radius:var(--radius-md);font-size:13px;font-weight:500;color:var(--grey-500);cursor:pointer;transition:all .15s;border:none;background:none;font-family:var(--font-body);white-space:nowrap}
.campaigns-page .tab:hover{color:var(--black)}
.campaigns-page .tab.active{background:var(--purple-50);color:var(--purple-800)}

.campaigns-page .card-dark{background:var(--black);border-radius:var(--radius-lg);color:var(--white)}

.campaigns-page .card-footer{margin-top:16px;padding-top:14px;border-top:0.5px solid var(--grey-100);display:flex;align-items:center;justify-content:space-between;gap:8px}

.campaigns-page .empty-state{text-align:center;padding:48px 24px;display:flex;flex-direction:column;align-items:center;gap:12px}
.campaigns-page .empty-icon{width:56px;height:56px;border-radius:var(--radius-xl);background:var(--grey-50);border:0.5px solid var(--grey-100);display:flex;align-items:center;justify-content:center;color:var(--grey-400);margin-bottom:4px}
.campaigns-page .empty-title{font-family:var(--font-display);font-size:var(--text-h4-size);font-weight:var(--text-h4-weight);color:var(--black)}
.campaigns-page .empty-desc{font-size:13px;color:var(--grey-500);max-width:280px;line-height:1.65}

/* Page-specific layout: bento grid for the top stats row only */
.campaigns-page .bento-stats{
  display:grid;
  grid-template-columns:repeat(4,1fr);
  grid-template-areas:"hero hero active active" "hero hero awaiting completed";
  gap:16px;
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

const MOCK_CAMPAIGNS = [
  {
    id: 'cmp_1',
    creator: 'Amara Creates',
    handle: '@amaracreates',
    initials: 'AC',
    avatarClass: 'avatar-purple',
    package: 'Reel + Caption',
    platform: 'Instagram',
    price: 'KES 22,000',
    status: 'delivered',
    deliveryDate: 'Marked delivered · 2 days ago',
  },
  {
    id: 'cmp_2',
    creator: 'Zane Cooks',
    handle: '@zanecooks',
    initials: 'ZC',
    avatarClass: 'avatar-tint-green',
    package: 'Brand Partnership',
    platform: 'TikTok',
    price: 'KES 55,000',
    status: 'in_progress',
    deliveryDate: 'Expected 14 Jul',
  },
  {
    id: 'cmp_3',
    creator: 'Wanjiru Style',
    handle: '@wanjirustyle',
    initials: 'WS',
    avatarClass: 'avatar-tint-blue',
    package: 'Story Post',
    platform: 'Instagram',
    price: 'KES 8,000',
    status: 'in_progress',
    deliveryDate: 'Expected 9 Jul',
  },
  {
    id: 'cmp_4',
    creator: 'The Lens by Kev',
    handle: '@lensbykev',
    initials: 'LK',
    avatarClass: 'avatar-tint-amber',
    package: 'Product Unboxing',
    platform: 'YouTube',
    price: 'KES 38,000',
    status: 'disputed',
    deliveryDate: 'Dispute opened · 1 day ago',
  },
  {
    id: 'cmp_5',
    creator: 'Mwende Beauty',
    handle: '@mwendebeauty',
    initials: 'MB',
    avatarClass: 'avatar-tint-pink',
    package: 'Reel + Caption',
    platform: 'Instagram',
    price: 'KES 22,000',
    status: 'completed',
    deliveryDate: 'Approved · 1 week ago',
  },
  {
    id: 'cmp_6',
    creator: 'KFC Kenya Creator',
    handle: '@kdotsofficial',
    initials: 'KO',
    avatarClass: 'avatar-grey',
    package: 'Story Post',
    platform: 'TikTok',
    price: 'KES 8,000',
    status: 'refunded',
    deliveryDate: 'Refunded · 3 weeks ago',
  },
]

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
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div className={`avatar avatar-md ${campaign.avatarClass}`}>{campaign.initials}</div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--black)' }}>{campaign.creator}</div>
              <div style={{ fontSize: 12, color: 'var(--grey-400)' }}>{campaign.handle}</div>
            </div>
            <StatusTag status={campaign.status} />
          </div>

          <div className="text-body-sm" style={{ color: 'var(--grey-600)', marginTop: 8 }}>
            {campaign.package} · {campaign.platform} · {campaign.price}
          </div>
          <div style={{ fontSize: 12, color: 'var(--grey-400)', marginTop: 3 }}>{campaign.deliveryDate}</div>

          <div className="card-footer" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', gap: 7, alignItems: 'center' }}>
              {isDelivered && (
                <Link to={`/brand/campaigns/${campaign.id}`} className="btn btn-purple btn-sm">
                  <IconEye size={13} />
                  Review delivery
                </Link>
              )}
              {isDisputed && (
                <Link to={`/brand/campaigns/${campaign.id}`} className="btn btn-secondary btn-sm">
                  <IconScale size={13} />
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
              <IconMessageCircle size={14} />
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
  const [activeFilter, setActiveFilter] = useState('all')

  // TODO: replace with live data from useBrandDashboard()
  const campaigns = MOCK_CAMPAIGNS

  const counts = useMemo(() => {
    const active = campaigns.filter((c) => c.status === 'in_progress' || c.status === 'delivered').length
    const awaiting = campaigns.filter((c) => c.status === 'delivered').length
    const completed = campaigns.filter((c) => c.status === 'completed').length
    const spent = campaigns
      .filter((c) => c.status === 'completed')
      .reduce((sum, c) => sum + Number(c.price.replace(/[^\d]/g, '')), 0)
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ marginBottom: 2 }}>Campaigns</h2>
          <p className="text-body-sm" style={{ color: 'var(--grey-600)' }}>
            Track every booking from in-progress to completed.
          </p>
        </div>
      </div>

      {/* Summary stats: bento grid, total spend as the hero tile */}
      <div className="bento-stats" style={{ marginBottom: 20 }}>
        <div
          className="card-dark card-p-lg"
          style={{ gridArea: 'hero', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
        >
          <div className="stat-card-label" style={{ color: 'var(--grey-400)' }}>
            <IconWallet size={14} />
            Total spent
          </div>
          <div>
            <div className="stat-card-value" style={{ color: 'var(--white)' }}>KES {counts.spent.toLocaleString()}</div>
            <div className="text-body-sm" style={{ color: 'var(--purple-400)', marginTop: 4 }}>
              Across {counts.completed} completed {counts.completed === 1 ? 'campaign' : 'campaigns'}
            </div>
          </div>
        </div>

        <div className="stat-card" style={{ gridArea: 'active' }}>
          <div className="stat-card-label">
            <IconFlame size={14} />
            Active campaigns
          </div>
          <div className="stat-card-value">{counts.active}</div>
        </div>

        <div className="stat-card" style={{ gridArea: 'awaiting' }}>
          <div className="stat-card-label">
            <IconClock size={14} />
            Awaiting approval
          </div>
          <div className="stat-card-value">{counts.awaiting}</div>
        </div>

        <div className="stat-card" style={{ gridArea: 'completed' }}>
          <div className="stat-card-label">
            <IconCheck size={14} />
            Completed
          </div>
          <div className="stat-card-value">{counts.completed}</div>
        </div>
      </div>

      {/* Filter pills */}
      <div className="tabs" style={{ marginBottom: 20, flexWrap: 'wrap' }}>
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
      {filtered.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map((c) => (
            <CampaignCard key={c.id} campaign={c} onOpen={handleOpen} />
          ))}
        </div>
      ) : (
        <div className="card empty-state">
          <div className="empty-icon">
            <IconBriefcase size={22} />
          </div>
          <div>
            <div className="empty-title">No campaigns match your filters</div>
            <p className="empty-desc">Try a different status filter or clear your search.</p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={clearFilters}>
            Clear filters
          </button>
        </div>
      )}
    </div>
  )
}