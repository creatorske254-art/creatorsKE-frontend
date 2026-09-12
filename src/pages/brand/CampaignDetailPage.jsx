import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import {
  IconArrowLeft,
  IconCheck,
  IconScale,
  IconStar,
  IconDownload,
  IconExternalLink,
  IconMessageCircle,
  IconClock,
  IconFileText,
} from '@tabler/icons-react'
import { useCampaign, useCampaignActions } from '@/features/brand-dashboard/hooks/useBrandDashboard'
import { MessageThread } from '@/features/messaging'
import { usePageMeta } from '@/lib/usePageMeta'

// NOTE: `base` merges live GET /brands/campaigns/:id fields over MOCK_CAMPAIGNS
// as a fallback, since that endpoint's response schema is undocumented and a
// blind swap risks blanking fields the backend doesn't actually return.
// Approve/dispute now call real mutations (useCampaignActions); their
// backend endpoints don't exist yet either (see the production plan's
// backend spec), so expect a graceful error toast until they do.

// Status → tag variant (see index.css .tag-* + design tokens) and dot color.
const STATUS = {
  in_progress: { label: 'In progress', tag: 'tag-purple', dot: 'var(--purple-600)' },
  delivered: { label: 'Awaiting your approval', tag: 'tag-warning', dot: 'var(--status-warning)' },
  disputed: { label: 'Disputed', tag: 'tag-error', dot: 'var(--status-error)' },
  completed: { label: 'Completed', tag: 'tag-success', dot: 'var(--status-success)' },
  refunded: { label: 'Refunded', tag: 'tag-default', dot: 'var(--grey-400)' },
}

// Avatar variant → class from index.css (.avatar-purple / .avatar-tint-*), lets each
// creator read as a distinct "brand tint" the way the CRM/enquiries list does.
const MOCK_CAMPAIGNS = {
  cmp_1: {
    id: 'cmp_1',
    creator: 'Amara Creates',
    handle: '@amaracreates',
    initials: 'AC',
    avatarVariant: 'avatar-purple',
    rating: 4.8,
    reviewCount: 31,
    package: 'Reel + Caption',
    platform: 'Instagram',
    price: 22000,
    status: 'delivered',
    deliverables: ['1 × 60s Instagram Reel', 'Caption + hashtag set', '1 × Story repost'],
    revisionPolicy: '1 round of revisions',
    usageRights: 'Brand may repost on owned channels for 90 days.',
    goLiveDate: 'Marked delivered on 8 Jul 2026',
    paidOn: '2 Jul 2026',
    paymentMethod: 'M-Pesa',
    review: null,
    deliveredFiles: [{ name: 'reel_final_v2.mp4', size: '24.1 MB' }, { name: 'caption_copy.txt', size: '2 KB' }],
    messages: [
      { from: 'brand', text: 'Hi Amara! Excited to see the reel. Let us know once it’s ready.', time: 'Mon, 9:10 AM' },
      { from: 'creator', text: 'Just posted the final cut, sending the files here too 🎬', time: 'Mon, 2:45 PM' },
    ],
    activity: [
      { label: 'Enquiry accepted', time: '28 Jun · 11:02 AM' },
      { label: 'Payment confirmed', time: '2 Jul · 4:20 PM' },
      { label: 'Marked delivered', time: '8 Jul · 2:45 PM' },
      { label: 'Awaiting your approval', time: 'Now', pending: true },
    ],
  },
  cmp_2: {
    id: 'cmp_2',
    creator: 'Zane Cooks',
    handle: '@zanecooks',
    initials: 'ZC',
    avatarVariant: 'avatar-tint-green',
    rating: 4.6,
    reviewCount: 18,
    package: 'Brand Partnership',
    platform: 'TikTok',
    price: 55000,
    status: 'in_progress',
    deliverables: ['3 × TikTok videos', '1 × Behind-the-scenes story', 'Cross-post to Instagram Reels'],
    revisionPolicy: 'Unlimited revisions',
    usageRights: 'Full usage rights including paid media for 6 months.',
    goLiveDate: 'Expected 14 Jul 2026',
    paidOn: '30 Jun 2026',
    paymentMethod: 'Bank transfer',
    review: null,
    deliveredFiles: [],
    messages: [
      { from: 'brand', text: 'Sending the brand brief over now, let us know if anything is unclear.', time: 'Sun, 6:02 PM' },
      { from: 'creator', text: 'Got it, brief looks solid, starting filming this week.', time: 'Sun, 7:15 PM' },
    ],
    activity: [
      { label: 'Enquiry accepted', time: '26 Jun · 10:00 AM' },
      { label: 'Payment confirmed', time: '30 Jun · 1:30 PM' },
      { label: 'In progress', time: 'Now', pending: true },
    ],
  },
}

function getStatusMeta(status) {
  return STATUS[status] ?? STATUS.in_progress
}

// Page-scoped styles
// Everything below is composed from index.css design tokens (--purple-*,
// --grey-*, --status-*, --radius-*, --space-*, --shadow-*, type-scale vars).
// No hardcoded colors. Structural components already shared with the rest of
// the app (.card, .btn-*, .tag-*, .avatar-*, .input, .activity-*, .text-caption)
// come straight from index.css and are not redefined here, only the handful
// of patterns unique to this page (message bubbles, file chips, star rating,
// inline alerts, the back link) get scoped rules, per the pattern index.css
// itself documents for page-specific layout. This page renders inside the
// dashboard content area, which already supplies its own background and
// margin, so no background-color is set anywhere here.
const PAGE_STYLES = `
.campaign-detail-page .max-wrap { max-width: 980px; margin: 0 auto; }
.campaign-detail-page .back-link {
  display: inline-flex; align-items: center; gap: var(--space-6);
  font-size: var(--text-body-sm-size); color: var(--grey-600);
  text-decoration: none; margin-bottom: var(--space-16);
  transition: color var(--transition-fast);
}
.campaign-detail-page .back-link:hover { color: var(--black); }

.campaign-detail-page .split { display: grid; grid-template-columns: 1fr 290px; gap: var(--space-20); align-items: start; }
@media (max-width: 760px) { .campaign-detail-page .split { grid-template-columns: 1fr; } }

.campaign-detail-page .row-between { display: flex; justify-content: space-between; align-items: center; gap: var(--space-8); }
.campaign-detail-page .hr { height: 0.5px; background: var(--grey-100); margin: var(--space-16) 0; }


/* Delivered-file chip */
.campaign-detail-page .file-chip {
  display: flex; align-items: center; gap: var(--space-8);
  padding: var(--space-9) var(--space-12); border: 0.5px solid var(--grey-100);
  border-radius: var(--radius-md); font-size: var(--text-body-sm-size);
}

/* Review star rating */
.campaign-detail-page .star-btn { background: none; border: none; cursor: pointer; color: var(--grey-200); padding: var(--space-2); line-height: 1; }
.campaign-detail-page .star-btn.filled { color: var(--status-warning); }

/* Compact inline alerts (status/notice rows inside a card) */
.campaign-detail-page .alert {
  display: flex; align-items: flex-start; gap: var(--space-10);
  padding: var(--space-12) var(--space-16); border-radius: var(--radius-lg);
  font-size: var(--text-body-sm-size); line-height: 1.55;
}
.campaign-detail-page .alert-warning { background: var(--status-warning-bg); color: var(--status-warning-text); }
.campaign-detail-page .alert-success { background: var(--status-success-bg); color: var(--status-success-text); }
.campaign-detail-page .alert-error { background: var(--status-error-bg); color: var(--status-error-text); }
`

function StatusTag({ status }) {
  const meta = getStatusMeta(status)
  return (
    <span className={`tag ${meta.tag}`}>
      <span className="sdot" style={{ background: meta.dot }} />
      {meta.label}
    </span>
  )
}

function ActivityLog({ items }) {
  return (
    <div>
      {items.map((item, i) => (
        <div className="activity-row" key={i}>
          <div className="activity-col">
            <div className="activity-dot" style={{ background: item.pending ? 'var(--status-warning)' : 'var(--grey-200)' }} />
            {i < items.length - 1 && <div className="activity-line" style={{ height: 26, marginTop: 'var(--space-4)' }} />}
          </div>
          <div style={{ flex: 1, paddingBottom: i < items.length - 1 ? 'var(--space-12)' : 0 }}>
            <div
              className="text-body-sm"
              style={{ fontWeight: item.pending ? 500 : 400, color: item.pending ? 'var(--black)' : 'var(--grey-600)' }}
            >
              {item.label}
            </div>
            <div className="text-caption" style={{ color: 'var(--grey-400)' }}>{item.time}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

function ReviewForm({ onSubmit }) {
  const [rating, setRating] = useState(0)
  const [text, setText] = useState('')

  return (
    <div>
      <div className="section-title" style={{ marginBottom: 'var(--space-10)' }}>Leave a review</div>
      <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-10)' }}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" className={`star-btn${n <= rating ? ' filled' : ''}`} onClick={() => setRating(n)}>
            <IconStar size={20} fill={n <= rating ? 'currentColor' : 'none'} />
          </button>
        ))}
      </div>
      <textarea
        className="input input-md"
        rows={3}
        placeholder="Optional: how was the collaboration?"
        value={text}
        onChange={(e) => setText(e.target.value)}
        style={{ marginBottom: 'var(--space-10)', resize: 'vertical' }}
      />
      <button className="btn btn-purple btn-sm" disabled={rating === 0} onClick={() => onSubmit({ rating, text })}>
        Submit review
      </button>
    </div>
  )
}

export default function CampaignDetailPage() {
  usePageMeta('Campaign Details', 'Review deliverables, messages, and payment details for this campaign on Creatorske.');
  const { id } = useParams()
  const { data: liveCampaign } = useCampaign(id)
  const { approve, isApproving, dispute, isDisputing } = useCampaignActions(id)
  const mock = MOCK_CAMPAIGNS[id] ?? Object.values(MOCK_CAMPAIGNS)[0]
  // GET /brands/campaigns/:id's response schema is undocumented - prefer live
  // fields where the API actually returns them, fall back to the matching
  // mock field rather than blanking the page out.
  const base = { ...mock, ...liveCampaign }

  const [status, setStatus] = useState(base.status)
  const [activity, setActivity] = useState(base.activity)
  const [showDisputeForm, setShowDisputeForm] = useState(false)
  const [disputeEvidence, setDisputeEvidence] = useState('')
  const [review, setReview] = useState(base.review)

  const platformFee = useMemo(() => Math.round(base.price * 0.1), [base.price])
  const netPayout = base.price - platformFee

  function handleDownloadInvoice() {
    const lines = [
      'CREATORSKE PAYMENT RECEIPT',
      '',
      `Campaign: ${base.package}`,
      `Creator: ${base.creator} (${base.handle})`,
      `Platform: ${base.platform}`,
      '',
      `Amount: KES ${base.price.toLocaleString()}`,
      `Platform fee (10%): KES ${platformFee.toLocaleString()}`,
      `Net payout to creator: KES ${netPayout.toLocaleString()}`,
      '',
      `Paid via: ${base.paymentMethod}`,
      `Paid on: ${base.paidOn}`,
      `Invoice ref: ${base.id}`,
    ].join('\n')
    const blob = new Blob([lines], { type: 'text/plain;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `creatorske-invoice-${base.id}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  // ASSUMPTION: no file-storage endpoint is documented - deliveredFiles are
  // mock filenames with no real content anywhere, so there's nothing to
  // download. Toast is honest about that rather than faking a file.
  function handleDownloadFile(name) {
    toast.info(`${name} will be downloadable once file storage is connected.`)
  }

  const handleApprove = () => {
    approve(undefined, {
      onSuccess: () => {
        setStatus('completed')
        setActivity((prev) => [
          ...prev.map((a) => ({ ...a, pending: false })),
          { label: 'Delivery approved · escrow released', time: 'Just now', pending: true },
        ])
      },
    })
  }

  const handleRaiseDispute = () => {
    if (!disputeEvidence.trim()) return
    dispute(disputeEvidence, {
      onSuccess: () => {
        setStatus('disputed')
        setShowDisputeForm(false)
        setActivity((prev) => [
          ...prev.map((a) => ({ ...a, pending: false })),
          { label: 'Dispute raised, evidence submitted', time: 'Just now', pending: true },
        ])
      },
    })
  }


  return (
    <div className="campaign-detail-page">
      <style>{PAGE_STYLES}</style>
      <div className="max-wrap">
        <Link to="/brand/campaigns" className="back-link">
          <IconArrowLeft size={13} />
          Back to campaigns
        </Link>

        {/* Header */}
        <div className="row-between" style={{ marginBottom: 'var(--space-20)', flexWrap: 'wrap', gap: 'var(--space-12)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-12)' }}>
            <div className={`avatar avatar-lg ${base.avatarVariant}`}>{base.initials}</div>
            <div>
              <h4 style={{ margin: 0 }}>{base.creator}</h4>
              <div className="text-body-sm" style={{ color: 'var(--grey-400)' }}>
                {base.handle} · {base.package} · {base.platform}
              </div>
            </div>
          </div>
          <StatusTag status={status} />
        </div>

        <div className="split">
          {/* Left column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-16)' }}>
            {/* Scope */}
            <div className="card card-p-md">
              <div className="section-title" style={{ marginBottom: 'var(--space-10)' }}>Agreed scope</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-7)', marginBottom: 'var(--space-16)' }}>
                {base.deliverables.map((d, i) => (
                  <div key={i} className="text-body" style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-8)' }}>
                    <IconCheck size={14} style={{ color: 'var(--purple-600)', marginTop: 2, flexShrink: 0 }} />
                    {d}
                  </div>
                ))}
              </div>
              <div className="hr" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }} className="text-body-sm">
                <div className="row-between"><span style={{ color: 'var(--grey-400)' }}>Revision policy</span><span style={{ fontWeight: 500 }}>{base.revisionPolicy}</span></div>
                <div className="row-between"><span style={{ color: 'var(--grey-400)' }}>Usage rights</span><span style={{ fontWeight: 500, textAlign: 'right', maxWidth: 240 }}>{base.usageRights}</span></div>
                <div className="row-between"><span style={{ color: 'var(--grey-400)' }}>Timeline</span><span style={{ fontWeight: 500 }}>{base.goLiveDate}</span></div>
              </div>
            </div>

            {/* Delivery & approval (status-dependent) */}
            {status === 'delivered' && (
              <div className="card card-p-md">
                <div className="section-title" style={{ marginBottom: 'var(--space-10)' }}>Delivery</div>
                <div className="alert alert-warning" style={{ marginBottom: 'var(--space-16)' }}>
                  <IconClock size={15} />
                  <div>The creator has marked this as delivered. Review the files below, then approve or raise a dispute within 48 hours.</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-7)', marginBottom: 'var(--space-16)' }}>
                  {base.deliveredFiles.map((f, i) => (
                    <div key={i} className="file-chip">
                      <IconFileText size={14} style={{ color: 'var(--grey-400)' }} />
                      <span style={{ flex: 1 }}>{f.name}</span>
                      <span style={{ color: 'var(--grey-400)' }}>{f.size}</span>
                      <IconDownload
                        size={14}
                        style={{ color: 'var(--grey-400)', cursor: 'pointer' }}
                        onClick={() => handleDownloadFile(f.name)}
                      />
                    </div>
                  ))}
                </div>

                {!showDisputeForm ? (
                  <div style={{ display: 'flex', gap: 'var(--space-8)' }}>
                    <button className={`btn btn-purple${isApproving ? ' btn-loading' : ''}`} onClick={handleApprove} disabled={isApproving}>
                      <IconCheck size={14} />
                      Approve & release payment
                    </button>
                    <button className="btn btn-danger" onClick={() => setShowDisputeForm(true)}>
                      <IconScale size={14} />
                      Raise dispute
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="section-title" style={{ marginBottom: 'var(--space-10)' }}>Submit evidence</div>
                    <textarea
                      className="input input-md"
                      rows={3}
                      placeholder="Explain what doesn't match the agreed scope…"
                      value={disputeEvidence}
                      onChange={(e) => setDisputeEvidence(e.target.value)}
                      style={{ marginBottom: 'var(--space-10)', resize: 'vertical' }}
                    />
                    <div style={{ display: 'flex', gap: 'var(--space-8)' }}>
                      <button className={`btn btn-danger${isDisputing ? ' btn-loading' : ''}`} disabled={isDisputing} onClick={handleRaiseDispute}>Submit dispute</button>
                      <button className="btn btn-ghost" onClick={() => setShowDisputeForm(false)}>Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {status === 'disputed' && (
              <div className="card card-p-md">
                <div className="section-title" style={{ marginBottom: 'var(--space-10)' }}>Dispute</div>
                <div className="alert alert-error">
                  <IconScale size={15} />
                  <div>Your evidence has been submitted. Platform admin is reviewing both sides and will issue a binding decision within 5 business days.</div>
                </div>
              </div>
            )}

            {status === 'completed' && (
              <div className="card card-p-md">
                <div className="section-title" style={{ marginBottom: 'var(--space-10)' }}>Delivery</div>
                <div className="alert alert-success" style={{ marginBottom: review ? 'var(--space-16)' : 0 }}>
                  <IconCheck size={15} />
                  <div>Delivery approved. KES {netPayout.toLocaleString()} released to the creator, net of the platform fee.</div>
                </div>
                {!review ? (
                  <ReviewForm onSubmit={(r) => setReview(r)} />
                ) : (
                  <div>
                    <div className="section-title" style={{ marginBottom: 'var(--space-10)' }}>Your review</div>
                    <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-6)' }}>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <IconStar key={n} size={15} fill={n <= review.rating ? 'var(--status-warning)' : 'none'} stroke="var(--status-warning)" />
                      ))}
                    </div>
                    {review.text && <p className="text-body-sm" style={{ color: 'var(--grey-600)' }}>{review.text}</p>}
                  </div>
                )}
              </div>
            )}

            {status === 'refunded' && (
              <div className="card card-p-md">
                <div className="alert alert-warning">
                  <IconClock size={15} />
                  <div>This booking was refunded in full. Funds were returned to your original payment method.</div>
                </div>
              </div>
            )}

            {/* Messages - one persistent thread per enquiry, keyed by the
                enquiry's own id (see MessageThread). ASSUMPTION: the
                campaign response isn't documented; assumed to carry
                enquiryId, falling back to the campaign's own id. */}
            <div className="card card-p-md">
              <div className="section-title" style={{ marginBottom: 'var(--space-10)' }}>Messages</div>
              <MessageThread threadId={liveCampaign?.enquiryId ?? id} />
            </div>

            {/* Activity */}
            <div className="card card-p-md">
              <div className="section-title" style={{ marginBottom: 'var(--space-10)' }}>Activity</div>
              <ActivityLog items={activity} />
            </div>
          </div>

          {/* Right sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-16)', position: 'sticky', top: 'var(--space-12)' }}>
            <div className="card card-p-md">
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-10)', marginBottom: 'var(--space-12)' }}>
                <div className={`avatar avatar-md ${base.avatarVariant}`}>{base.initials}</div>
                <div>
                  <div className="text-body-sm" style={{ fontWeight: 600 }}>{base.creator}</div>
                  <div className="text-caption" style={{ color: 'var(--grey-400)', textTransform: 'none', letterSpacing: 0, display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                    <IconStar size={12} fill="var(--status-warning)" stroke="var(--status-warning)" />
                    {base.rating} ({base.reviewCount})
                  </div>
                </div>
              </div>
              <Link to={`/c/${base.handle.replace('@', '')}`} className="btn btn-secondary btn-sm btn-full">
                <IconExternalLink size={13} />
                View rate card
              </Link>
            </div>

            <div className="card card-p-md">
              <div className="section-title" style={{ marginBottom: 'var(--space-10)' }}>Invoice summary</div>
              <div className="text-body-sm" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)', marginBottom: 'var(--space-12)' }}>
                <div className="row-between"><span style={{ color: 'var(--grey-400)' }}>{base.package}</span><span style={{ fontWeight: 500 }}>KES {base.price.toLocaleString()}</span></div>
                <div className="row-between"><span style={{ color: 'var(--grey-400)' }}>Platform fee (10%)</span><span style={{ fontWeight: 500 }}>– KES {platformFee.toLocaleString()}</span></div>
                <div className="hr" style={{ margin: 'var(--space-2) 0' }} />
                <div className="row-between"><span style={{ fontWeight: 600 }}>Creator payout</span><span style={{ fontWeight: 600 }}>KES {netPayout.toLocaleString()}</span></div>
              </div>
              <div className="text-caption" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', color: 'var(--grey-400)', textTransform: 'none', letterSpacing: 0, marginBottom: 'var(--space-14)' }}>
                <div className="row-between"><span>Paid via</span><span>{base.paymentMethod}</span></div>
                <div className="row-between"><span>Paid on</span><span>{base.paidOn}</span></div>
              </div>
              <button className="btn btn-ghost btn-sm btn-full" onClick={handleDownloadInvoice}>
                <IconDownload size={13} />
                Download invoice
              </button>
            </div>

            <div className="card card-p-md">
              <div className="section-title" style={{ marginBottom: 'var(--space-10)' }}>Need help?</div>
              <p className="text-body-sm" style={{ color: 'var(--grey-600)', marginBottom: 'var(--space-10)' }}>
                If something doesn't look right, you have 48 hours after delivery to raise a dispute.
              </p>
              <a href="mailto:support@creatorske.com" className="btn btn-ghost btn-sm btn-full">
                <IconMessageCircle size={13} />
                Contact support
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}