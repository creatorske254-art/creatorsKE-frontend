import { useState } from "react";
import { usePageMeta } from '@/lib/usePageMeta';

const COLORS = {
  white: "#FFFFFF",
  offWhite: "#F8F7FF",
  pageBg: "#F2F1F8",
  black: "#0D0D0D",
  purple50: "#F0EEFF",
  purple100: "#DDD9FD",
  purple200: "#BAB3FA",
  purple300: "#9187F7",
  purple400: "#6B5FF4",
  purple500: "#5445E8",
  purple600: "#3D2FD6",
  purple700: "#2C1FB8",
  grey50: "#F5F5F5",
  grey100: "#EBEBEB",
  grey200: "#D6D6D6",
  grey300: "#B8B8B8",
  grey400: "#919191",
  grey500: "#6E6E6E",
  grey600: "#4A4A4A",
  grey700: "#333333",
  successBg: "#E6F9F1",
  successText: "#006B3D",
  warningBg: "#FEF6E7",
  warningText: "#7A4A00",
  errorBg: "#FFF0F0",
  errorText: "#8B0000",
};

const reviews = [
  {
    id: 1,
    brand: "Nala Foods",
    brandInitial: "N",
    brandColor: "#5445E8",
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
    package: "Full Campaign Bundle",
    stars: 5,
    date: "14 May 2025",
    text: "One of the best creators we've worked with on this platform. Delivered ahead of schedule, high quality content, and their audience alignment was perfect for our product.",
    campaign: "Seasonal Campaign",
    replied: false,
  },
  {
    id: 4,
    brand: "Equity Bank",
    brandInitial: "E",
    brandColor: "#4393F5",
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
    package: "Instagram Story Series",
    stars: 5,
    date: "18 Apr 2025",
    text: "Second time booking and it keeps getting better. The creator really gets our brand voice now. Highly recommend.",
    campaign: "Flash Sale",
    replied: false,
  },
];

function Stars({ count, size = 14 }) {
  return (
    <span style={{ display: "inline-flex", gap: 2 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <i
          key={i}
          className={`ti ${i <= count ? "ti-star-filled" : "ti-star"}`}
          style={{ fontSize: size, color: i <= count ? COLORS.black : COLORS.grey200, lineHeight: 1 }}
        />
      ))}
    </span>
  );
}

function RatingBar({ label, count, total, value }) {
  const pct = total === 0 ? 0 : Math.round((count / total) * 100);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
      <span style={{ fontSize: 12, color: COLORS.grey500, width: 10, textAlign: "right" }}>{value}</span>
      <div style={{ flex: 1, height: 6, borderRadius: 99, background: COLORS.grey100, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", borderRadius: 99, background: pct > 0 ? "#F5A623" : "transparent", transition: "width 0.4s ease" }} />
      </div>
      <span style={{ fontSize: 11, color: COLORS.grey400, width: 16 }}>{count}</span>
    </div>
  );
}

function ReviewCard({ review, onReply }) {
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyText, setReplyText] = useState(review.reply || "");
  const [saved, setSaved] = useState(review.replied);

  function handleSave() {
    if (!replyText.trim()) return;
    setSaved(true);
    setShowReplyBox(false);
    onReply(review.id, replyText);
  }

  return (
    <div
      style={{
        background: COLORS.white,
        border: `0.5px solid ${COLORS.grey100}`,
        borderRadius: 12,
        padding: "20px 24px",
        transition: "box-shadow 0.15s",
      }}
    >
      {/* Header row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: review.brandColor + "20",
              border: `1.5px solid ${review.brandColor}40`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "'Gill Sans MT','Gill Sans',Calibri,sans-serif",
              fontWeight: 700,
              fontSize: 15,
              color: review.brandColor,
            }}
          >
            {review.brandInitial}
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.black, lineHeight: 1.3 }}>{review.brand}</div>
            <div style={{ fontSize: 12, color: COLORS.grey400, marginTop: 2 }}>{review.package}</div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
          <Stars count={review.stars} />
          <span style={{ fontSize: 11, color: COLORS.grey400 }}>{review.date}</span>
        </div>
      </div>

      {/* Campaign tag */}
      <span
        style={{
          display: "inline-block",
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: "0.07em",
          textTransform: "uppercase",
          padding: "3px 8px",
          borderRadius: 99,
          background: COLORS.grey50,
          color: COLORS.grey600,
          border: `0.5px solid ${COLORS.grey200}`,
          marginBottom: 12,
        }}
      >
        {review.campaign}
      </span>

      {/* Review text */}
      <p style={{ fontSize: 13.5, color: COLORS.grey700, lineHeight: 1.65, marginBottom: saved ? 16 : 14 }}>{review.text}</p>

      {/* Existing reply */}
      {saved && replyText && (
        <div
          style={{
            background: COLORS.purple50,
            border: `0.5px solid ${COLORS.purple100}`,
            borderLeft: `3px solid ${COLORS.purple400}`,
            borderRadius: "0 8px 8px 0",
            padding: "12px 14px",
            marginBottom: 14,
          }}
        >
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase", color: COLORS.purple500, marginBottom: 6 }}>Your reply</div>
          <p style={{ fontSize: 13, color: COLORS.grey700, lineHeight: 1.6 }}>{replyText}</p>
        </div>
      )}

      {/* Action row */}
      {!saved && (
        <div>
          {!showReplyBox ? (
            <button
              onClick={() => setShowReplyBox(true)}
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: COLORS.purple600,
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              <i className="ti ti-message-2" style={{ fontSize: 13 }} />
              Write a reply
            </button>
          ) : (
            <div>
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write your public reply to this review..."
                maxLength={400}
                style={{
                  width: "100%",
                  height: 80,
                  padding: "10px 12px",
                  fontSize: 13,
                  color: COLORS.black,
                  background: COLORS.pageBg,
                  border: `1px solid ${COLORS.grey200}`,
                  borderRadius: 8,
                  resize: "none",
                  fontFamily: "'Inter',sans-serif",
                  lineHeight: 1.5,
                  outline: "none",
                  marginBottom: 8,
                }}
              />
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={handleSave}
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: COLORS.white,
                    background: COLORS.purple500,
                    border: "none",
                    borderRadius: 7,
                    padding: "7px 14px",
                    cursor: "pointer",
                  }}
                >
                  Post reply
                </button>
                <button
                  onClick={() => { setShowReplyBox(false); setReplyText(""); }}
                  style={{
                    fontSize: 12,
                    fontWeight: 500,
                    color: COLORS.grey500,
                    background: "none",
                    border: `0.5px solid ${COLORS.grey200}`,
                    borderRadius: 7,
                    padding: "7px 14px",
                    cursor: "pointer",
                  }}
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
          onClick={() => { setSaved(false); setShowReplyBox(true); }}
          style={{ fontSize: 11, color: COLORS.grey400, background: "none", border: "none", cursor: "pointer", padding: 0 }}
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
  const [filter, setFilter] = useState("all");

  function handleReply(id, text) {
    setData((prev) => prev.map((r) => r.id === id ? { ...r, reply: text, replied: true } : r));
  }

  const total = data.length;
  const avg = (data.reduce((s, r) => s + r.stars, 0) / total).toFixed(1);
  const dist = [5, 4, 3, 2, 1].map((v) => ({ value: v, count: data.filter((r) => r.stars === v).length }));

  const filtered = filter === "all" ? data : filter === "pending" ? data.filter((r) => !r.replied) : data.filter((r) => r.replied);

  return (
    <div style={{ padding: "28px", background: COLORS.pageBg, minHeight: "100vh", fontFamily: "'Inter',sans-serif" }}>

      {/* Page heading */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "'Gill Sans MT','Gill Sans',Calibri,sans-serif", fontSize: 22, fontWeight: 600, color: COLORS.black, letterSpacing: "-0.01em", marginBottom: 4 }}>
          Reviews
        </h1>
        <p style={{ fontSize: 13, color: COLORS.grey500, lineHeight: 1.6 }}>
          Ratings and written feedback from brands you've worked with. Replies are public and visible on your rate card.
        </p>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr]" style={{ gap: 20, marginBottom: 28 }}>

        {/* Aggregate score */}
        <div
          style={{
            background: COLORS.white,
            border: `0.5px solid ${COLORS.grey100}`,
            borderRadius: 12,
            padding: "20px 28px",
            display: "flex",
            alignItems: "center",
            gap: 28,
            minWidth: 280,
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div style={{ fontFamily: "'Gill Sans MT','Gill Sans',Calibri,sans-serif", fontSize: 52, fontWeight: 700, color: COLORS.black, lineHeight: 1 }}>{avg}</div>
            <Stars count={Math.round(parseFloat(avg))} size={16} />
            <div style={{ fontSize: 11, color: COLORS.grey400, marginTop: 6 }}>{total} reviews</div>
          </div>
          <div style={{ flex: 1 }}>
            {dist.map((d) => <RatingBar key={d.value} value={d.value} count={d.count} total={total} />)}
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3" style={{ gap: 14 }}>
          {[
            { label: "5-star reviews", value: dist[0].count, accent: "#F5A623" },
            { label: "Awaiting reply", value: data.filter((r) => !r.replied).length, accent: COLORS.purple500 },
            { label: "Replied", value: data.filter((r) => r.replied).length, accent: COLORS.successText },
          ].map((s) => (
            <div key={s.label} style={{ background: COLORS.white, border: `0.5px solid ${COLORS.grey100}`, borderRadius: 12, padding: "18px 20px" }}>
              <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.07em", textTransform: "uppercase", color: COLORS.grey400, marginBottom: 8 }}>{s.label}</div>
              <div style={{ fontFamily: "'Gill Sans MT','Gill Sans',Calibri,sans-serif", fontSize: 32, fontWeight: 600, color: s.accent, lineHeight: 1 }}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
        {[{ key: "all", label: `All (${total})` }, { key: "pending", label: `Awaiting reply (${data.filter(r => !r.replied).length})` }, { key: "replied", label: `Replied (${data.filter(r => r.replied).length})` }].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            style={{
              fontSize: 12,
              fontWeight: 500,
              padding: "7px 14px",
              borderRadius: 8,
              border: filter === tab.key ? `0.5px solid ${COLORS.purple200}` : `0.5px solid ${COLORS.grey200}`,
              background: filter === tab.key ? COLORS.purple50 : COLORS.white,
              color: filter === tab.key ? COLORS.purple700 : COLORS.grey500,
              cursor: "pointer",
              transition: "all 0.12s",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Review list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {filtered.length === 0 ? (
          <div style={{ background: COLORS.white, border: `0.5px solid ${COLORS.grey100}`, borderRadius: 12, padding: "48px 24px", textAlign: "center" }}>
            <div style={{ fontSize: 13, color: COLORS.grey400 }}>No reviews in this category yet.</div>
          </div>
        ) : (
          filtered.map((r) => <ReviewCard key={r.id} review={r} onReply={handleReply} />)
        )}
      </div>

      {/* Footnote */}
      <p style={{ fontSize: 11, color: COLORS.grey300, marginTop: 24, textAlign: "center" }}>
        Reviews are submitted by brands after approving a delivery. One review per completed booking. You can post one public reply per review.
      </p>
    </div>
  );
}