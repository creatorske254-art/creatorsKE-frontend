import { useEffect, useMemo, useState } from 'react'
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
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { reviewService } from '@/features/reviews/services/review.service'
import { brandService } from '@/features/brand-dashboard/services/brand.service'
import Skeleton from '@/components/ui/Skeleton'
import ErrorState from '@/components/shared/ErrorState'
import { usePageMeta } from '@/lib/usePageMeta'

// Everything on this page comes from GET /brands/campaigns/:id. Approve and
// dispute post to /brands/campaigns/:id/approve|dispute and the query is
// invalidated on success, so status and the activity log update from the server.

// Status → tag variant (see index.css .tag-* + design tokens) and dot color.
const STATUS = {
  in_progress: { label: 'In progress', tag: 'tag-purple', dot: 'var(--purple-600)' },
  delivered: { label: 'Awaiting your approval', tag: 'tag-warning', dot: 'var(--status-warning)' },
  disputed: { label: 'Disputed', tag: 'tag-error', dot: 'var(--status-error)' },
  completed: { label: 'Completed', tag: 'tag-success', dot: 'var(--status-success)' },
  refunded: { label: 'Refunded', tag: 'tag-default', dot: 'var(--grey-400)' },
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
  display: inline-flex; align-items: center; gap: var(--space-8);
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
  padding: var(--space-8) var(--space-12); border: 0.5px solid var(--grey-100);
  border-radius: var(--radius-md); font-size: var(--text-body-sm-size);
}

/* Review star rating */
.campaign-detail-page .star-btn { background: none; border: none; cursor: pointer; color: var(--grey-200); padding: var(--space-2); line-height: 1; }
.campaign-detail-page .star-btn.filled { color: var(--status-warning); }

/* Compact inline alerts (status/notice rows inside a card) */
.campaign-detail-page .alert {
  display: flex; align-items: flex-start; gap: var(--space-12);
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

function ReviewForm({ onSubmit, isSubmitting }) {
  const [rating, setRating] = useState(0)
  const [text, setText] = useState('')

  return (
    <div>
      <div className="section-title" style={{ marginBottom: 'var(--space-12)' }}>Leave a review</div>
      <div role="radiogroup" aria-label="Rating" style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-12)' }}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" role="radio" aria-checked={rating === n} aria-label={`${n} star${n === 1 ? '' : 's'}`} className={`star-btn${n <= rating ? ' filled' : ''}`} onClick={() => setRating(n)}>
            <IconStar className="icon-lg" fill={n <= rating ? 'currentColor' : 'none'} aria-hidden="true" />
          </button>
        ))}
      </div>
      <textarea
        className="input input-md"
        rows={3}
        placeholder="Optional: how was the collaboration?"
        aria-label="Review"
        value={text}
        onChange={(e) => setText(e.target.value)}
        style={{ marginBottom: 'var(--space-12)', resize: 'vertical' }}
      />
      <button className="btn btn-purple btn-sm" disabled={rating === 0 || isSubmitting} onClick={() => onSubmit({ rating, text })}>
        {isSubmitting ? 'Posting' : 'Submit review'}
      </button>
    </div>
  )
}

// Booking payment into escrow by M-Pesa STK push. After the prompt goes out the campaign is
// re-read every few seconds until the payment lands (or two minutes pass).
// The delivered files stay available after approval: they are what the brand paid for.
function DeliveredFiles({ files }) {
  if (!files?.length) return null
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)', marginBottom: 'var(--space-16)' }}>
      {files.map((f, i) => (
        <a key={f.id ?? i} className="file-chip" href={f.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
          <IconFileText className="icon-sm" style={{ color: 'var(--grey-400)' }} aria-hidden="true" />
          <span style={{ flex: 1 }}>{f.name}</span>
          <IconDownload className="icon-sm" style={{ color: 'var(--grey-400)' }} aria-hidden="true" />
        </a>
      ))}
    </div>
  )
}

function FundEscrowCard({ campaignId, amount, onPaid }) {
  const [phone, setPhone] = useState('')
  const [waitingSince, setWaitingSince] = useState(null)
  const pay = useMutation({
    mutationFn: () => brandService.payCampaign(campaignId, phone.trim()),
    onSuccess: (res) => { setWaitingSince(Date.now()); toast.success(res?.message || 'Check your phone and enter your M-Pesa PIN.') },
    onError: (err) => toast.error(err?.message || 'Could not start the M-Pesa payment.'),
  })
  useEffect(() => {
    if (!waitingSince) return undefined
    const t = setInterval(() => {
      if (Date.now() - waitingSince > 120_000) { setWaitingSince(null); toast.error('No payment yet. If you approved it on your phone, refresh in a minute.'); return }
      onPaid()
    }, 4000)
    return () => clearInterval(t)
  }, [waitingSince, onPaid])

  return (
    <div className="card card-p-md">
      <div className="section-title" style={{ marginBottom: 'var(--space-8)' }}>Pay into escrow</div>
      <p className="text-body-sm" style={{ color: 'var(--grey-500)', marginBottom: 'var(--space-16)' }}>
        The creator starts once KES {Number(amount).toLocaleString('en-KE')} is held in escrow. It is released only when you approve the delivery.
      </p>
      {waitingSince ? (
        <div className="alert alert-info"><IconClock className="icon-sm" aria-hidden="true" /><div>Check your phone and enter your M-Pesa PIN. This page updates when the payment arrives.</div></div>
      ) : (
        <div style={{ display: 'flex', gap: 'var(--space-8)', flexWrap: 'wrap' }}>
          <input className="input input-md" style={{ flex: '1 1 200px' }} inputMode="tel" placeholder="M-Pesa number, e.g. 0712345678" aria-label="M-Pesa number" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <button className={`btn btn-purple${pay.isPending ? ' btn-loading' : ''}`} disabled={pay.isPending || phone.replace(/\D/g, '').length < 9} onClick={() => pay.mutate()}>
            Pay KES {Number(amount).toLocaleString('en-KE')}
          </button>
        </div>
      )}
    </div>
  )
}

export default function CampaignDetailPage() {
  usePageMeta('Campaign Details', 'Review deliverables, messages, and payment details for this campaign on Creatorske.');
  const { id } = useParams()
  const { data: campaign, isLoading, isError, refetch } = useCampaign(id)
  const { approve, isApproving, dispute, isDisputing } = useCampaignActions(id)
  const queryClient = useQueryClient()
  const [showDisputeForm, setShowDisputeForm] = useState(false)
  const [disputeEvidence, setDisputeEvidence] = useState('')

  const base = campaign ?? {}
  const status = base.status
  const activity = base.activity ?? []
  const review = base.review ?? null

  const reviewMutation = useMutation({
    mutationFn: ({ rating, text }) => reviewService.submitReview({ campaignId: id, creatorId: base.creatorId, rating, comment: text }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brand-campaign', id] })
      toast.success('Review posted.')
    },
    onError: (err) => toast.error(err?.message || 'Could not post your review.'),
  })

  // Snapshotted on the booking when it was made; older bookings fall back to the platform default.
  const disputeDays = Number(base.disputeWindowDays ?? 7)
  const price = Number(base.price ?? 0)
  // The fee rate is an admin setting, fixed onto the campaign when it was booked.
  const feePct = Number(base.platformFeePct ?? 10)
  const platformFee = useMemo(() => Math.round(price * feePct / 100), [price, feePct])
  const netPayout = price - platformFee

  // The booking's invoice (inv_<campaign id>), issued by the API and marked paid once escrow is funded.
  function handleDownloadInvoice() {
    brandService.openInvoice(`inv_${id}`).catch((err) => toast.error(err?.message || 'Could not open the invoice.'))
  }

  const handleApprove = () => approve()

  const handleRaiseDispute = () => {
    if (!disputeEvidence.trim()) return
    dispute(disputeEvidence, { onSuccess: () => setShowDisputeForm(false) })
  }

  if (isLoading) {
    return (
      <div className="campaign-detail-page">
        <style>{PAGE_STYLES}</style>
        <div className="max-wrap" style={{ display: 'grid', gap: 'var(--space-16)' }}>
          <Skeleton width={160} height={16} />
          <Skeleton width="100%" height={64} />
          <Skeleton width="100%" height={320} />
        </div>
      </div>
    )
  }
  if (isError || !campaign) {
    return (
      <div className="campaign-detail-page">
        <style>{PAGE_STYLES}</style>
        <div className="max-wrap">
          <Link to="/brand/campaigns" className="back-link"><IconArrowLeft className="icon-sm" />Back to campaigns</Link>
          <ErrorState title="Couldn't load this campaign" description="It may have been removed, or the connection dropped." onRetry={refetch} />
        </div>
      </div>
    )
  }

  return (
    <div className="campaign-detail-page">
      <style>{PAGE_STYLES}</style>
      <div className="max-wrap">
        <Link to="/brand/campaigns" className="back-link">
          <IconArrowLeft className="icon-sm" />
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
              <div className="section-title" style={{ marginBottom: 'var(--space-12)' }}>Agreed scope</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)', marginBottom: 'var(--space-16)' }}>
                {(base.deliverables ?? []).map((d, i) => (
                  <div key={i} className="text-body" style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-8)' }}>
                    <IconCheck className="icon-sm" style={{ color: 'var(--purple-600)', marginTop: 'var(--space-2)', flexShrink: 0 }} />
                    {d}
                  </div>
                ))}
              </div>
              <div className="hr" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }} className="text-body-sm">
                {base.revisionPolicy && <div className="row-between"><span style={{ color: 'var(--grey-400)' }}>Revision policy</span><span style={{ fontWeight: 500 }}>{base.revisionPolicy}</span></div>}
                <div className="row-between"><span style={{ color: 'var(--grey-400)' }}>Usage rights</span><span style={{ fontWeight: 500, textAlign: 'right', maxWidth: 240 }}>{base.usageRights}</span></div>
                <div className="row-between"><span style={{ color: 'var(--grey-400)' }}>Timeline</span><span style={{ fontWeight: 500 }}>{base.goLiveDate}</span></div>
              </div>
            </div>

            {!base.paidOn && ['in_progress', 'delivered'].includes(status) && (
              <FundEscrowCard campaignId={id} amount={base.price} onPaid={refetch} />
            )}

            {/* Delivery & approval (status-dependent) */}
            {status === 'delivered' && (
              <div className="card card-p-md">
                <div className="section-title" style={{ marginBottom: 'var(--space-12)' }}>Delivery</div>
                <div className="alert alert-warning" style={{ marginBottom: 'var(--space-16)' }}>
                  <IconClock className="icon-sm" />
                  <div>The creator has marked this as delivered. Review the files below, then approve to release payment or raise a dispute within {disputeDays} days of delivery.</div>
                </div>
                <DeliveredFiles files={base.deliveredFiles} />

                {!showDisputeForm ? (
                  <div style={{ display: 'flex', gap: 'var(--space-8)' }}>
                    <button className={`btn btn-purple${isApproving ? ' btn-loading' : ''}`} onClick={handleApprove} disabled={isApproving}>
                      <IconCheck className="icon-sm" />
                      Approve & release payment
                    </button>
                    <button className="btn btn-danger" onClick={() => setShowDisputeForm(true)}>
                      <IconScale className="icon-sm" />
                      Raise dispute
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="section-title" style={{ marginBottom: 'var(--space-12)' }}>Submit evidence</div>
                    <textarea
                      className="input input-md"
                      rows={3}
                      placeholder="Explain what doesn't match the agreed scope…"
                      value={disputeEvidence}
                      onChange={(e) => setDisputeEvidence(e.target.value)}
                      style={{ marginBottom: 'var(--space-12)', resize: 'vertical' }}
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
                <div className="section-title" style={{ marginBottom: 'var(--space-12)' }}>Dispute</div>
                <div className="alert alert-error">
                  <IconScale className="icon-sm" />
                  <div>Your evidence has been submitted. Platform admin is reviewing both sides and will issue a binding decision within 5 business days.</div>
                </div>
              </div>
            )}

            {status === 'completed' && (
              <div className="card card-p-md">
                <div className="section-title" style={{ marginBottom: 'var(--space-12)' }}>Delivery</div>
                <div className="alert alert-success" style={{ marginBottom: review ? 'var(--space-16)' : 0 }}>
                  <IconCheck className="icon-sm" />
                  <div>Delivery approved. KES {netPayout.toLocaleString()} released to the creator, net of the platform fee.</div>
                </div>
                <DeliveredFiles files={base.deliveredFiles} />
                {!review ? (
                  <ReviewForm onSubmit={(r) => reviewMutation.mutate(r)} isSubmitting={reviewMutation.isPending} />
                ) : (
                  <div>
                    <div className="section-title" style={{ marginBottom: 'var(--space-12)' }}>Your review</div>
                    <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-8)' }}>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <IconStar className="icon-sm" key={n} fill={n <= review.rating ? 'var(--status-warning)' : 'none'} stroke="var(--status-warning)" />
                      ))}
                    </div>
                    {(review.text || review.comment) && <p className="text-body-sm" style={{ color: 'var(--grey-600)' }}>{review.text || review.comment}</p>}
                  </div>
                )}
              </div>
            )}

            {status === 'refunded' && (
              <div className="card card-p-md">
                <div className="alert alert-warning">
                  <IconClock className="icon-sm" />
                  <div>This booking was refunded in full. Funds were returned to your original payment method.</div>
                </div>
              </div>
            )}

            {/* Messages: the booking's chat is its enquiry's thread (campaign.enquiryId). */}
            <div className="card card-p-md">
              <div className="section-title" style={{ marginBottom: 'var(--space-12)' }}>Messages</div>
              <MessageThread threadId={base.enquiryId ?? id} />
            </div>

            {/* Activity */}
            <div className="card card-p-md">
              <div className="section-title" style={{ marginBottom: 'var(--space-12)' }}>Activity</div>
              <ActivityLog items={activity} />
            </div>
          </div>

          {/* Right sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-16)', position: 'sticky', top: 'var(--space-12)' }}>
            <div className="card card-p-md">
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-12)', marginBottom: 'var(--space-12)' }}>
                <div className={`avatar avatar-md ${base.avatarVariant}`}>{base.initials}</div>
                <div>
                  <div className="text-body-sm" style={{ fontWeight: 600 }}>{base.creator}</div>
                  <div className="text-caption" style={{ color: 'var(--grey-400)', textTransform: 'none', letterSpacing: 0, display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                    <IconStar className="icon-xs" fill="var(--status-warning)" stroke="var(--status-warning)" />
                    {base.rating} ({base.reviewCount})
                  </div>
                </div>
              </div>
              <Link to={`/c/${base.handle.replace('@', '')}`} className="btn btn-secondary btn-sm btn-full">
                <IconExternalLink className="icon-sm" />
                View rate card
              </Link>
            </div>

            <div className="card card-p-md">
              <div className="section-title" style={{ marginBottom: 'var(--space-12)' }}>Invoice summary</div>
              <div className="text-body-sm" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)', marginBottom: 'var(--space-12)' }}>
                <div className="row-between"><span style={{ color: 'var(--grey-400)' }}>{base.package}</span><span style={{ fontWeight: 500 }}>KES {base.price.toLocaleString()}</span></div>
                <div className="row-between"><span style={{ color: 'var(--grey-400)' }}>Platform fee ({feePct}%)</span><span style={{ fontWeight: 500 }}>– KES {platformFee.toLocaleString()}</span></div>
                <div className="hr" style={{ margin: 'var(--space-2) 0' }} />
                <div className="row-between"><span style={{ fontWeight: 600 }}>Creator payout</span><span style={{ fontWeight: 600 }}>KES {netPayout.toLocaleString()}</span></div>
              </div>
              <div className="text-caption" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)', color: 'var(--grey-400)', textTransform: 'none', letterSpacing: 0, marginBottom: 'var(--space-16)' }}>
                {base.paidOn ? (
                  <>
                    <div className="row-between"><span>Paid via</span><span>{base.paymentMethod}</span></div>
                    <div className="row-between"><span>Paid on</span><span>{base.paidOn}</span></div>
                  </>
                ) : (
                  <div className="row-between"><span>Payment</span><span>Not yet received</span></div>
                )}
              </div>
              <button className="btn btn-ghost btn-sm btn-full" onClick={handleDownloadInvoice}>
                <IconDownload className="icon-sm" />
                Download invoice
              </button>
            </div>

            <div className="card card-p-md">
              <div className="section-title" style={{ marginBottom: 'var(--space-12)' }}>Need help?</div>
              <p className="text-body-sm" style={{ color: 'var(--grey-600)', marginBottom: 'var(--space-12)' }}>
                If something doesn&apos;t look right, you have {disputeDays} days after delivery to raise a dispute.
              </p>
              <a href="mailto:support@creatorske.com" className="btn btn-ghost btn-sm btn-full">
                <IconMessageCircle className="icon-sm" />
                Contact support
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}