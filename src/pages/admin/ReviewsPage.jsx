import { useState } from "react";
import { usePageMeta } from '@/lib/usePageMeta';
import EmptyState from '@/components/shared/EmptyState';
import ConfirmDialog from '@/components/shared/ConfirmDialog';

const reviews = [
  {
    id: 1,
    brand: "Nala Foods",
    brandInitial: "N",
    brandColor: "#5445E8",
    creatorName: "Amara Osei",
    package: "Instagram Story Series",
    stars: 5,
    date: "12 Jun 2025",
    text: "Absolutely nailed the brief. The content felt authentic and our audience responded really well, our highest engagement week this quarter. Would book again without hesitation.",
    campaign: "Product Launch",
    replied: false,
  },
  {
    id: 2,
    brand: "Zuri Skincare",
    brandInitial: "Z",
    brandColor: "#00B96B",
    creatorName: "Kofi Mensah",
    package: "TikTok Reel + Instagram Reel",
    stars: 4,
    date: "29 May 2025",
    text: "Great work overall. Communication was smooth and the final content looked polished. Minor revision needed on the caption but it was handled quickly.",
    campaign: "Brand Awareness",
    replied: true,
    reply: "Thank you Zuri! The revision was a quick fix, happy it all came together well. Looking forward to working together again.",
  },
  {
    id: 3,
    brand: "Kasha",
    brandInitial: "K",
    brandColor: "#F5A623",
    creatorName: "Amara Osei",
    package: "Full Campaign Bundle",
    stars: 1,
    date: "14 May 2025",
    text: "Absolutely useless, this person is a complete waste of money and clearly has no idea what they're doing. Would never work with them again.",
    campaign: "Seasonal Campaign",
    replied: false,
    flagged: true,
    flagReason: "Reported by creator: contains a personal insult, not constructive feedback about the delivered work.",
  },
  {
    id: 4,
    brand: "Equity Bank",
    brandInitial: "E",
    brandColor: "#4393F5",
    creatorName: "Zara Kipchoge",
    package: "YouTube Integration",
    stars: 3,
    date: "2 May 2025",
    text: "Decent work. The integration felt a bit forced and the CTA wasn't as strong as we'd hoped. Appreciate the effort though and the deadline was met.",
    campaign: "Product Feature",
    replied: true,
    reply: "Thank you for the honest feedback. I'll make sure the next brief includes clearer CTA direction so we're fully aligned from the start.",
  },
  {
    id: 5,
    brand: "Jumia Kenya",
    brandInitial: "J",
    brandColor: "#FF4B4B",
    creatorName: "Lena Wachira",
    package: "Instagram Story Series",
    stars: 5,
    date: "18 Apr 2025",
    text: "Second time booking and it keeps getting better. The creator really gets our brand voice now. Highly recommend. Contact me directly at +254 700 000 000 to skip the platform fees next time.",
    campaign: "Flash Sale",
    replied: false,
    flagged: true,
    flagReason: "Auto-flagged: review text contains a phone number and appears to solicit an off-platform booking.",
  },
];

function Stars({ count, size = 14 }) {
  return (
    <span style={{ display: "inline-flex", gap: 2 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <i
          key={i}
          className={`ti ${i <= count ? "ti-star-filled" : "ti-star"}`}
          style={{ fontSize: size, color: i <= count ? "var(--black)" : "var(--grey-200)", lineHeight: 1 }}
        />
      ))}
    </span>
  );
}

function RatingBar({ label, count, total, value }) {
  const pct = total === 0 ? 0 : Math.round((count / total) * 100);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
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
    <div className="card" style={{ padding: "20px 24px", border: review.flagged ? "1.5px solid var(--status-error)" : undefined }}>
      {/* Header row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
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
            <div style={{ fontSize: 12, color: "var(--grey-400)", marginTop: 2 }}>{review.package}</div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
          <Stars count={review.stars} />
          <span style={{ fontSize: 11, color: "var(--grey-400)" }}>{review.date}</span>
        </div>
      </div>

      {/* Campaign tag + flagged tag */}
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <span className="tag tag-default">{review.campaign}</span>
        {review.flagged && <span className="tag tag-error"><i className="ti ti-flag-3" style={{ fontSize: 11 }} /> Flagged</span>}
      </div>

      {/* Review text */}
      <p style={{ fontSize: 13.5, color: "var(--grey-700)", lineHeight: 1.65, marginTop: 12, marginBottom: 14 }}>{review.text}</p>

      {/* Flag reason + moderation actions */}
      {review.flagged && (
        <div
          style={{
            background: "var(--status-error-bg)",
            border: "0.5px solid rgba(239,68,68,0.25)",
            borderRadius: "var(--radius-md)",
            padding: "12px 14px",
            marginBottom: 14,
          }}
        >
          <div style={{ fontSize: 12.5, color: "var(--status-error-text)", lineHeight: 1.55, marginBottom: 10 }}>{review.flagReason}</div>
          <div style={{ display: "flex", gap: 8 }}>
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
            padding: "12px 14px",
            marginBottom: 14,
          }}
        >
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase", color: "var(--purple-500)", marginBottom: 6 }}>Your reply</div>
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
              <i className="ti ti-message-2" style={{ fontSize: 13 }} />
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
                  padding: "10px 12px",
                  fontSize: 13,
                  background: "var(--page-bg)",
                  borderRadius: "var(--radius-md)",
                  resize: "none",
                  lineHeight: 1.5,
                  marginBottom: 8,
                }}
              />
              <div style={{ display: "flex", gap: 8 }}>
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
  const [data, setData] = useState(reviews);
  const [filter, setFilter] = useState("flagged");

  function handleReply(id, text) {
    setData((prev) => prev.map((r) => r.id === id ? { ...r, reply: text, replied: true } : r));
  }

  function handleRemove(id) {
    setData((prev) => prev.filter((r) => r.id !== id));
  }

  function handleDismiss(id) {
    setData((prev) => prev.map((r) => r.id === id ? { ...r, flagged: false, flagReason: null } : r));
  }

  const total = data.length;
  const avg = (data.reduce((s, r) => s + r.stars, 0) / total).toFixed(1);
  const dist = [5, 4, 3, 2, 1].map((v) => ({ value: v, count: data.filter((r) => r.stars === v).length }));

  const filtered =
    filter === "all" ? data :
    filter === "flagged" ? data.filter((r) => r.flagged) :
    filter === "pending" ? data.filter((r) => !r.replied) :
    data.filter((r) => r.replied);

  return (
    <div style={{ padding: 28, background: "var(--page-bg)", minHeight: "100vh", fontFamily: "var(--font-body)" }}>

      {/* Page heading */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 600, color: "var(--black)", letterSpacing: "-0.01em", marginBottom: 4 }}>
          Flagged Reviews
        </h1>
        <p style={{ fontSize: 13, color: "var(--grey-500)", lineHeight: 1.6 }}>
          Moderate reviews flagged by creators or auto-detected for policy violations across the platform.
        </p>
        <p style={{ fontSize: 12, color: "var(--grey-400)", lineHeight: 1.6, fontStyle: 'italic', marginTop: 4 }}>
          Demo data. A cross-creator review moderation feed endpoint doesn't exist on the backend yet (reviewService only supports listing one creator's reviews at a time). See the production-readiness plan's backend spec.
        </p>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr]" style={{ gap: 20, marginBottom: 28 }}>

        {/* Aggregate score */}
        <div className="card" style={{ padding: "20px 28px", display: "flex", alignItems: "center", gap: 28, minWidth: 280 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 52, fontWeight: 700, color: "var(--black)", lineHeight: 1 }}>{avg}</div>
            <Stars count={Math.round(parseFloat(avg))} size={16} />
            <div style={{ fontSize: 11, color: "var(--grey-400)", marginTop: 6 }}>{total} reviews</div>
          </div>
          <div style={{ flex: 1 }}>
            {dist.map((d) => <RatingBar key={d.value} value={d.value} count={d.count} total={total} />)}
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3" style={{ gap: 14 }}>
          {[
            { label: "Flagged", value: data.filter((r) => r.flagged).length, accent: "var(--status-error-text)" },
            { label: "5-star reviews", value: dist[0].count, accent: "var(--status-warning)" },
            { label: "Awaiting reply", value: data.filter((r) => !r.replied).length, accent: "var(--purple-500)" },
          ].map((s) => (
            <div key={s.label} className="card" style={{ padding: "18px 20px" }}>
              <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--grey-400)", marginBottom: 8 }}>{s.label}</div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 600, color: s.accent, lineHeight: 1 }}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="tabs" style={{ marginBottom: 20 }}>
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
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {filtered.length === 0 ? (
          <div className="card">
            <EmptyState
              icon={<i className={filter === "flagged" ? "ti ti-shield-check" : "ti ti-star"} aria-hidden="true" />}
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
      <p style={{ fontSize: 11, color: "var(--grey-300)", marginTop: 24, textAlign: "center" }}>
        Reviews are submitted by brands after approving a delivery. One review per completed booking. You can post one public reply per review.
      </p>
    </div>
  );
}
