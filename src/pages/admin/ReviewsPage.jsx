import { useState } from "react";
import { usePageMeta } from '@/lib/usePageMeta';
import EmptyState from '@/components/shared/EmptyState';
import ErrorState from '@/components/shared/ErrorState';
import Skeleton from '@/components/ui/Skeleton';
import { useReviewFeed } from '@/features/reviews/hooks/useReviews';
import { reviewService } from '@/features/reviews/services/review.service';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import { IconFlag3, IconMessage2, IconShieldCheck, IconStar, IconStarFilled } from '@tabler/icons-react';

// Brand avatars take a stable colour from the brand name so the same brand
// always reads the same across the feed.
const BRAND_COLORS = ['#5445E8', '#00B96B', '#F59E0B', '#E11D48', '#0EA5E9', '#8B5CF6'];
function brandColor(name = '') {
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return BRAND_COLORS[h % BRAND_COLORS.length];
}

function Stars({ count, size = "sm" }) {
  return (
    <span style={{ display: "inline-flex", gap: 'var(--space-2)' }}>
      {[1, 2, 3, 4, 5].map((i) => {
        const Star = i <= count ? IconStarFilled : IconStar;
        return <Star key={i} className={`icon-${size}`} style={{ color: i <= count ? "var(--black)" : "var(--grey-200)" }} aria-hidden="true" />;
      })}
    </span>
  );
}

function RatingBar({ label, count, total, value }) {
  const pct = total === 0 ? 0 : Math.round((count / total) * 100);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 'var(--space-12)', marginBottom: 'var(--space-8)' }}>
      <span style={{ fontSize: 12, color: "var(--grey-500)", width: 10, textAlign: "right" }}>{value}</span>
      <div style={{ flex: 1, height: 6, borderRadius: "var(--radius-pill)", background: "var(--grey-100)", overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", borderRadius: "var(--radius-pill)", background: pct > 0 ? "var(--status-warning)" : "transparent", transition: "width 0.4s ease" }} />
      </div>
      <span style={{ fontSize: 11, color: "var(--grey-400)", width: 16 }}>{count}</span>
    </div>
  );
}

function ReviewCard({ review, onReply, onRemove, onDismiss }) {
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyText, setReplyText] = useState(review.reply || "");
  const [saved, setSaved] = useState(review.replied);
  const [confirmRemove, setConfirmRemove] = useState(false);

  function handleSave() {
    if (!replyText.trim()) return;
    setSaved(true);
    setShowReplyBox(false);
    onReply(review.id, replyText);
  }

  function handleRemove() {
    setConfirmRemove(false);
    onRemove(review.id);
  }

  return (
    <div className="card" style={{ padding: "var(--space-20) var(--space-24)", border: review.flagged ? "1.5px solid var(--status-error)" : undefined }}>
      {/* Header row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 'var(--space-16)' }}>
        <div style={{ display: "flex", alignItems: "center", gap: 'var(--space-12)' }}>
          <div
            className="avatar"
            style={{
              width: 38,
              height: 38,
              background: review.brandColor + "20",
              border: `1.5px solid ${review.brandColor}40`,
              color: review.brandColor,
              fontSize: 15,
            }}
          >
            {review.brandInitial}
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--black)", lineHeight: 1.3 }}>{review.brand} → {review.creatorName}</div>
            <div style={{ fontSize: 12, color: "var(--grey-400)", marginTop: 'var(--space-2)' }}>{review.package}</div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 'var(--space-8)' }}>
          <Stars count={review.stars} />
          <span style={{ fontSize: 11, color: "var(--grey-400)" }}>{review.date}</span>
        </div>
      </div>

      {/* Campaign tag + flagged tag */}
      <div style={{ display: "flex", gap: 'var(--space-8)', marginBottom: 'var(--space-12)' }}>
        <span className="tag tag-default">{review.campaign}</span>
        {review.flagged && <span className="tag tag-error"><IconFlag3 className="icon-xs" aria-hidden="true" /> Flagged</span>}
      </div>

      {/* Review text */}
      <p style={{ fontSize: 13.5, color: "var(--grey-700)", lineHeight: 1.65, marginTop: 'var(--space-12)', marginBottom: 'var(--space-16)' }}>{review.text}</p>

      {/* Flag reason + moderation actions */}
      {review.flagged && (
        <div
          style={{
            background: "var(--status-error-bg)",
            border: "0.5px solid rgba(239,68,68,0.25)",
            borderRadius: "var(--radius-md)",
            padding: "var(--space-12) var(--space-16)",
            marginBottom: 'var(--space-16)',
          }}
        >
          <div style={{ fontSize: 12.5, color: "var(--status-error-text)", lineHeight: 1.55, marginBottom: 'var(--space-12)' }}>{review.flagReason}</div>
          <div style={{ display: "flex", gap: 'var(--space-8)' }}>
            <button type="button" className="btn btn-danger btn-xs" onClick={() => setConfirmRemove(true)}>Remove review</button>
            <button type="button" className="btn btn-ghost btn-xs" onClick={() => onDismiss(review.id)}>Dismiss flag</button>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmRemove}
        variant="danger"
        title="Remove this review?"
        message={`This permanently removes ${review.brand}'s review of ${review.creatorName}. The creator's rating is recalculated without it. This cannot be undone.`}
        confirmLabel="Remove review"
        onConfirm={handleRemove}
        onCancel={() => setConfirmRemove(false)}
      />

      {/* Existing reply */}
      {saved && replyText && (
        <div
          style={{
            background: "var(--purple-50)",
            border: "0.5px solid var(--purple-100)",
            borderLeft: "3px solid var(--purple-400)",
            borderRadius: "0 var(--radius-md) var(--radius-md) 0",
            padding: "var(--space-12) var(--space-16)",
            marginBottom: 'var(--space-16)',
          }}
        >
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase", color: "var(--purple-500)", marginBottom: 'var(--space-8)' }}>Your reply</div>
          <p style={{ fontSize: 13, color: "var(--grey-700)", lineHeight: 1.6 }}>{replyText}</p>
        </div>
      )}

      {/* Action row */}
      {!saved && (
        <div>
          {!showReplyBox ? (
            <button
              type="button"
              className="btn btn-ghost btn-xs"
              style={{ border: "none", padding: 0, color: "var(--purple-600)" }}
              onClick={() => setShowReplyBox(true)}
            >
              <IconMessage2 className="icon-sm" aria-hidden="true" />
              Write a reply
            </button>
          ) : (
            <div>
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write your public reply to this review…"
                maxLength={400}
                className="input"
                style={{
                  height: 80,
                  padding: "var(--space-12) var(--space-12)",
                  fontSize: 13,
                  background: "var(--page-bg)",
                  borderRadius: "var(--radius-md)",
                  resize: "none",
                  lineHeight: 1.5,
                  marginBottom: 'var(--space-8)',
                }}
              />
              <div style={{ display: "flex", gap: 'var(--space-8)' }}>
                <button type="button" className="btn btn-primary btn-xs" onClick={handleSave}>
                  Post reply
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-xs"
                  onClick={() => { setShowReplyBox(false); setReplyText(""); }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {saved && (
        <button
          type="button"
          className="btn btn-ghost btn-xs"
          style={{ border: "none", padding: 0, color: "var(--grey-400)" }}
          onClick={() => { setSaved(false); setShowReplyBox(true); }}
        >
          Edit reply
        </button>
      )}
    </div>
  );
}

export default function ReviewsPage() {
  usePageMeta('Flagged Reviews', 'Moderate flagged reviews and platform feedback on Creatorske.');
  const { reviews, isLoading, isError, refetch, moderate } = useReviewFeed();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState("flagged");

  const replyMutation = useMutation({
    mutationFn: ({ id, text }) => reviewService.replyToReview(id, text),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['reviews'] }); toast.success('Reply posted.'); },
    onError: (err) => toast.error(err?.message || 'Could not post that reply.'),
  });

  const data = reviews.map((r) => ({
    ...r,
    stars: r.stars ?? Math.round(r.rating ?? 0),
    text: r.text ?? r.comment ?? '',
    brandInitial: r.brandInitial ?? (r.brand ?? r.brandName ?? '?')[0],
    brandColor: r.brandColor ?? brandColor(r.brand ?? r.brandName),
  }));

  function handleReply(id, text) { replyMutation.mutate({ id, text }); }
  function handleRemove(id) { moderate({ reviewId: id, action: 'remove', reason: 'Removed by admin' }); }
  function handleDismiss(id) { moderate({ reviewId: id, action: 'dismiss' }); }

  if (isLoading) {
    return (
      <div style={{ display: 'grid', gap: 'var(--space-16)' }}>
        <Skeleton width={220} height={24} />
        <Skeleton width="100%" height={140} />
        <Skeleton width="100%" height={220} />
      </div>
    );
  }
  if (isError) return <ErrorState title="Couldn't load reviews" onRetry={refetch} />;

  const total = data.length;
  const avg = total ? (data.reduce((s, r) => s + r.stars, 0) / total).toFixed(1) : '0.0';
  const dist = [5, 4, 3, 2, 1].map((v) => ({ value: v, count: data.filter((r) => r.stars === v).length }));

  const filtered =
    filter === "all" ? data :
    filter === "flagged" ? data.filter((r) => r.flagged) :
    filter === "pending" ? data.filter((r) => !r.replied) :
    data.filter((r) => r.replied);

  return (
    <div style={{ fontFamily: "var(--font-body)" }}>

      {/* Page heading */}
      <div style={{ marginBottom: 'var(--space-32)' }}>
        <h1 className="page-title" style={{ marginBottom: 'var(--space-4)' }}>
          Flagged Reviews
        </h1>
        <p className="page-subtitle">
          Moderate reviews flagged by creators or auto-detected for policy violations across the platform.
        </p>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr]" style={{ gap: 'var(--space-20)', marginBottom: 'var(--space-32)' }}>

        {/* Aggregate score */}
        <div className="card" style={{ padding: "var(--space-20) var(--space-32)", display: "flex", alignItems: "center", gap: 'var(--space-32)', minWidth: 280 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 52, fontWeight: 700, color: "var(--black)", lineHeight: 1 }}>{avg}</div>
            <Stars count={Math.round(parseFloat(avg))} size="md" />
            <div style={{ fontSize: 11, color: "var(--grey-400)", marginTop: 'var(--space-8)' }}>{total} reviews</div>
          </div>
          <div style={{ flex: 1 }}>
            {dist.map((d) => <RatingBar key={d.value} value={d.value} count={d.count} total={total} />)}
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3" style={{ gap: 'var(--space-16)' }}>
          {[
            { label: "Flagged", value: data.filter((r) => r.flagged).length, accent: "var(--status-error-text)" },
            { label: "5-star reviews", value: dist[0].count, accent: "var(--status-warning)" },
            { label: "Awaiting reply", value: data.filter((r) => !r.replied).length, accent: "var(--purple-500)" },
          ].map((s) => (
            <div key={s.label} className="card" style={{ padding: "var(--space-20) var(--space-20)" }}>
              <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--grey-400)", marginBottom: 'var(--space-8)' }}>{s.label}</div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 600, color: s.accent, lineHeight: 1 }}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="tabs" style={{ marginBottom: 'var(--space-20)' }}>
        {[
          { key: "flagged", label: `Flagged (${data.filter(r => r.flagged).length})` },
          { key: "all", label: `All (${total})` },
          { key: "pending", label: `Awaiting reply (${data.filter(r => !r.replied).length})` },
          { key: "replied", label: `Replied (${data.filter(r => r.replied).length})` },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={`tab${filter === tab.key ? ' active' : ''}`}
            onClick={() => setFilter(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Review list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 'var(--space-16)' }}>
        {filtered.length === 0 ? (
          <div className="card">
            <EmptyState
              icon={filter === "flagged" ? <IconShieldCheck /> : <IconStar />}
              title={filter === "flagged" ? "Nothing flagged" : "No reviews in this category"}
              description={filter === "flagged" ? "No reviews currently need moderation." : "Reviews from brands will show up here once they're submitted."}
            />
          </div>
        ) : (
          filtered.map((r) => (
            <ReviewCard key={r.id} review={r} onReply={handleReply} onRemove={handleRemove} onDismiss={handleDismiss} />
          ))
        )}
      </div>

      {/* Footnote */}
      <p style={{ fontSize: 11, color: "var(--grey-300)", marginTop: 'var(--space-24)', textAlign: "center" }}>
        Reviews are submitted by brands after approving a delivery. One review per completed booking. You can post one public reply per review.
      </p>
    </div>
  );
}
